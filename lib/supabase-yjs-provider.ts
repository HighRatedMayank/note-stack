import * as Y from "yjs";
import { createClient } from "./supabase/client";

// Base64 helpers for binary Yjs data
function uint8ArrayToBase64(arr: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i);
  }
  return arr;
}

type EventHandler = (...args: unknown[]) => void;

/**
 * Custom Yjs provider that syncs via Supabase Broadcast channels.
 * Implements the Provider interface expected by @lexical/yjs CollaborationPlugin.
 *
 * Features:
 * - Loads/saves Yjs state from/to Supabase DB
 * - Broadcasts incremental updates via Supabase Realtime
 * - Syncs awareness (cursor positions, user presence) via broadcast
 * - Uses y-indexeddb for offline persistence
 */
export class SupabaseYjsProvider {
  doc: Y.Doc;
  awareness: YjsAwareness;

  private pageId: string;
  private supabase: ReturnType<typeof createClient>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private channel: any = null;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private connected = false;
  private destroyed = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private idbPersistence: any = null;

  constructor(pageId: string, doc: Y.Doc, username?: string, color?: string) {
    this.doc = doc;
    this.pageId = pageId;
    this.supabase = createClient();
    this.awareness = new YjsAwareness(doc);

    // Set local user info on awareness
    this.awareness.setLocalStateField("user", {
      name: username || "Anonymous",
      color: color || "#3b82f6",
    });
  }

  on(event: string, cb: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(cb);
  }

  off(event: string, cb: EventHandler) {
    this.listeners.get(event)?.delete(cb);
  }

  private emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(...args);
      } catch (e) {
        console.error(`[SupabaseYjsProvider] Error in ${event} handler:`, e);
      }
    });
  }

  async connect() {
    if (this.destroyed) return;

    // 1. Set up IndexedDB persistence for offline support
    try {
      const { IndexeddbPersistence } = await import("y-indexeddb");
      this.idbPersistence = new IndexeddbPersistence(
        `notestack-${this.pageId}`,
        this.doc
      );
      await new Promise<void>((resolve) => {
        this.idbPersistence.on("synced", () => resolve());
      });
    } catch (e) {
      console.warn("[SupabaseYjsProvider] IndexedDB not available:", e);
    }

    // 2. Load initial Yjs state from Supabase
    try {
      const { data } = await this.supabase
        .from("pages")
        .select("yjs_state")
        .eq("id", this.pageId)
        .single();

      if (data?.yjs_state) {
        const update = base64ToUint8Array(data.yjs_state);
        Y.applyUpdate(this.doc, update, "remote");
      }
    } catch (err) {
      console.error("[SupabaseYjsProvider] Failed to load state:", err);
    }

    // 3. Set up Supabase Broadcast channel
    this.channel = this.supabase.channel(`yjs:${this.pageId}`);

    this.channel
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("broadcast", { event: "yjs-update" }, ({ payload }: any) => {
        if (this.destroyed) return;
        try {
          const update = base64ToUint8Array(payload.update);
          Y.applyUpdate(this.doc, update, "remote");
        } catch (e) {
          console.error("[SupabaseYjsProvider] Failed to apply remote update:", e);
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("broadcast", { event: "awareness-update" }, ({ payload }: any) => {
        if (this.destroyed) return;
        try {
          const update = base64ToUint8Array(payload.update);
          this.awareness.applyRemoteUpdate(update);
        } catch (e) {
          console.error("[SupabaseYjsProvider] Failed to apply awareness:", e);
        }
      })
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          this.connected = true;
          this.emit("status", { status: "connected" });
        }
      });

    // 4. Listen for local doc updates → broadcast + save
    this.doc.on("update", (update: Uint8Array, origin: unknown) => {
      if (origin === "remote" || this.destroyed) return;
      // Broadcast incremental update
      this.channel?.send({
        type: "broadcast",
        event: "yjs-update",
        payload: { update: uint8ArrayToBase64(update) },
      });
      this.scheduleSave();
    });

    // 5. Listen for awareness updates → broadcast
    this.awareness.on("localUpdate", ((...args: unknown[]) => {
      const update = args[0] as Uint8Array;
      if (this.destroyed) return;
      this.channel?.send({
        type: "broadcast",
        event: "awareness-update",
        payload: { update: uint8ArrayToBase64(update) },
      });
    }) as EventHandler);

    // 6. Emit sync event
    this.emit("sync", true);
    this.emit("status", { status: "connected" });
  }

  disconnect() {
    this.connected = false;
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.emit("status", { status: "disconnected" });
  }

  private scheduleSave() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveToSupabase();
    }, 2000);
  }

  private async saveToSupabase() {
    if (this.destroyed) return;
    try {
      const state = Y.encodeStateAsUpdate(this.doc);
      const base64State = uint8ArrayToBase64(state);

      await this.supabase
        .from("pages")
        .update({
          yjs_state: base64State,
          updated_at: new Date().toISOString(),
        })
        .eq("id", this.pageId);
    } catch (e) {
      console.error("[SupabaseYjsProvider] Save failed:", e);
    }
  }

  destroy() {
    this.destroyed = true;
    this.disconnect();
    // Final save before destroy
    this.saveToSupabase();
    if (this.idbPersistence) {
      this.idbPersistence.destroy();
    }
    this.awareness.destroy();
  }
}

/**
 * Lightweight Awareness implementation compatible with @lexical/yjs.
 * Tracks user presence (name, color, cursor) for each client.
 */
class YjsAwareness {
  doc: Y.Doc;
  clientID: number;
  private states: Map<number, Record<string, unknown>> = new Map();
  private localState: Record<string, unknown> = {};
  private listeners: Map<string, Set<EventHandler>> = new Map();

  constructor(doc: Y.Doc) {
    this.doc = doc;
    this.clientID = doc.clientID;
  }

  getLocalState(): Record<string, unknown> {
    return this.localState;
  }

  setLocalState(state: Record<string, unknown> | null) {
    this.localState = state || {};
    this.states.set(this.clientID, this.localState);
    this.emitChange([this.clientID], [], []);
  }

  setLocalStateField(field: string, value: unknown) {
    this.localState[field] = value;
    this.states.set(this.clientID, this.localState);
    this.emitChange([this.clientID], [], []);
  }

  getStates(): Map<number, Record<string, unknown>> {
    return this.states;
  }

  on(event: string, cb: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(cb);
  }

  off(event: string, cb: EventHandler) {
    this.listeners.get(event)?.delete(cb);
  }

  private emitChange(added: number[], updated: number[], removed: number[]) {
    const update = this.encodeLocalState();
    this.listeners.get("update")?.forEach((cb) => {
      try { cb({ added, updated, removed }, "local"); } catch (e) { console.error(e); }
    });
    this.listeners.get("localUpdate")?.forEach((cb) => {
      try { cb(update); } catch (e) { console.error(e); }
    });
    this.listeners.get("change")?.forEach((cb) => {
      try { cb({ added, updated, removed }, "local"); } catch (e) { console.error(e); }
    });
  }

  /** Encode local state as a simple JSON-based Uint8Array */
  private encodeLocalState(): Uint8Array {
    const obj = { clientID: this.clientID, state: this.localState };
    const json = JSON.stringify(obj);
    return new TextEncoder().encode(json);
  }

  /** Apply a remote awareness update */
  applyRemoteUpdate(data: Uint8Array) {
    try {
      const json = new TextDecoder().decode(data);
      const { clientID, state } = JSON.parse(json);
      if (clientID === this.clientID) return; // Ignore own updates

      const isNew = !this.states.has(clientID);
      this.states.set(clientID, state);

      const added = isNew ? [clientID] : [];
      const updated = isNew ? [] : [clientID];

      this.listeners.get("update")?.forEach((cb) => {
        try { cb({ added, updated, removed: [] }, "remote"); } catch (e) { console.error(e); }
      });
      this.listeners.get("change")?.forEach((cb) => {
        try { cb({ added, updated, removed: [] }, "remote"); } catch (e) { console.error(e); }
      });
    } catch (e) {
      console.error("[Awareness] Failed to apply remote update:", e);
    }
  }

  destroy() {
    this.states.delete(this.clientID);
    this.listeners.clear();
  }
}
