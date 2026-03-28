"use client";

import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, $getRoot } from "lexical";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { useEffect, useRef, useState, useCallback } from "react";
import ToolbarPlugin from "./ToolbarPlugin";
import StatusBar from "./StatusBar";
import { SupabaseYjsProvider } from "@/lib/supabase-yjs-provider";
import * as Y from "yjs";
import "./editor.css";

type CollabUser = { name: string; color: string; clientId: number };

export default function LexicalEditorComponent({
  onChange,
  docId,
  username,
}: {
  onChange: (value: string) => void;
  docId: string;
  username: string;
}) {
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<string>("connecting");
  const [onlineUsers, setOnlineUsers] = useState<CollabUser[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const providerRef = useRef<SupabaseYjsProvider | null>(null);
  const docRef = useRef<Y.Doc | null>(null);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Initialize Yjs provider
  useEffect(() => {
    if (!docId || !username) return;

    const doc = new Y.Doc();
    docRef.current = doc;

    const provider = new SupabaseYjsProvider(docId, doc, username);
    providerRef.current = provider;

    provider.on("status", (event: unknown) => {
      const statusEvent = event as { status: string };
      setConnectionStatus(statusEvent.status);
    });

    // Track awareness for presence
    provider.awareness.on("update", () => {
      const states = provider.awareness.getStates();
      const users: CollabUser[] = [];
      states.forEach((state, clientId) => {
        const userState = state as { user?: { name: string; color: string } };
        if (userState.user) {
          users.push({
            name: userState.user.name,
            color: userState.user.color || "#3b82f6",
            clientId,
          });
        }
      });
      setOnlineUsers(users);
    });

    provider.connect();

    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [docId, username]);

  const editorConfig: InitialConfigType = {
    namespace: "MyEditor",
    theme: {
      paragraph: "editor-paragraph",
      heading: {
        h1: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4",
        h2: "text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3",
        h3: "text-xl font-medium text-gray-900 dark:text-gray-100 mb-2",
      },
      list: {
        ul: "list-disc pl-6 space-y-1 my-4",
        ol: "list-decimal pl-6 space-y-1 my-4",
        listitem: "text-gray-700 dark:text-gray-300",
        nested: { listitem: "ml-4" },
      },
      quote:
        "border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-4 italic text-gray-600 dark:text-gray-400",
    },
    onError(error) {
      console.error("Lexical Error:", error);
    },
    nodes: [ListNode, ListItemNode, HeadingNode, CodeNode, CodeHighlightNode, QuoteNode],
  };

  const handleEditorChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const text = $getRoot().getTextContent();
        setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
        setCharacterCount(text.length);
      });
      if (onChange) {
        onChange(JSON.stringify(editorState.toJSON()));
      }
    },
    [onChange]
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 shadow-sm overflow-hidden relative">
      <LexicalComposer initialConfig={editorConfig}>
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 shadow-sm">
          <div className="px-4 py-3">
            <ToolbarPlugin />
          </div>
        </div>

        {/* Editor */}
        <div className="px-4 sm:px-6 py-6 relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="editor-input min-h-[400px] sm:min-h-[500px] outline-none text-base text-gray-900 dark:text-gray-100 leading-relaxed" />
            }
            placeholder={
              <div className="absolute text-gray-400 dark:text-gray-500 pointer-events-none text-lg">
                Start typing your thoughts...
              </div>
            }
            ErrorBoundary={({ children }) => <>{children}</>}
          />
          <HistoryPlugin />
          <OnChangePlugin onChange={handleEditorChange} />

          {/* Yjs auto-save plugin */}
          <YjsAutoSavePlugin docId={docId} />
        </div>

        {/* Status Bar */}
        <StatusBar
          wordCount={wordCount}
          characterCount={characterCount}
          lastModified={new Date().toISOString()}
          readTime={Math.ceil(wordCount / 200)}
          connectionStatus={connectionStatus}
          isOffline={isOffline}
          onlineUsers={onlineUsers}
        />
      </LexicalComposer>
    </div>
  );
}

/**
 * Plugin that auto-saves Lexical editor state to Supabase via the Yjs provider.
 * This bridges Lexical's editor state with the Yjs document persistence.
 */
function YjsAutoSavePlugin({
  docId,
}: {
  docId: string;
}) {
  const [editor] = useLexicalComposerContext();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!docId) return;

    // Load content from Supabase on mount
    const loadContent = async () => {
      if (hasLoadedRef.current) return;
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data } = await supabase
          .from("pages")
          .select("content, title")
          .eq("id", docId)
          .single();

        if (data?.content) {
          try {
            const parsed = editor.parseEditorState(data.content);
            editor.setEditorState(parsed);
          } catch {
            // Content isn't valid Lexical JSON, try as plain text
            const { $getRoot } = await import("lexical");
            const { $createParagraphNode, $createTextNode } = await import("lexical");
            editor.update(() => {
              const root = $getRoot();
              root.clear();
              const p = $createParagraphNode();
              p.append($createTextNode(data.content));
              root.append(p);
            });
          }
        }
        hasLoadedRef.current = true;
      } catch (e) {
        console.error("[YjsAutoSave] Failed to load:", e);
      }
    };

    loadContent();
  }, [editor, docId]);

  // Auto-save on editor changes
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }: { editorState: EditorState }) => {
      if (!hasLoadedRef.current) return;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          const jsonContent = JSON.stringify(editorState.toJSON());
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          await supabase
            .from("pages")
            .update({
              content: jsonContent,
              updated_at: new Date().toISOString(),
            })
            .eq("id", docId);
        } catch (e) {
          console.error("[YjsAutoSave] Save failed:", e);
        }
      }, 1500);
    });
  }, [editor, docId]);

  return null;
}
