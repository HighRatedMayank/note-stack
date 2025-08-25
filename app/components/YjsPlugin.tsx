"use client";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";

type Props = {
  docId: string;
  username: string;
  color?: string;
  wsEndpoint?: string;
};

export default function YjsPlugin({
  docId,
  username,
  color = "#ffffff",
  wsEndpoint = "ws://localhost:1234",
}: Props) {
  const [editor] = useLexicalComposerContext();
  const providerRef = useRef<WebsocketProvider | null>(null);
  const docRef = useRef<Y.Doc | null>(null);

  useEffect(() => {
    // Create a new Yjs document
    const doc = new Y.Doc();
    const yText = doc.getText("root");
    docRef.current = doc;

    // Connect to y-websocket server
    const provider = new WebsocketProvider(wsEndpoint, docId, doc);
    providerRef.current = provider;

    // Set user presence/awareness
    const { awareness } = provider;
    awareness.setLocalStateField("user", {
      name: username || "Anonymous",
      color,
    });

    // Listen for changes from other clients
    yText.observe((event) => {
      // Handle remote changes here
      console.log("Remote change detected:", event);
      
      // Log the changes
      console.log("Added items:", event.changes.added.size);
      console.log("Deleted items:", event.changes.deleted.size);
      console.log("Delta:", event.changes.delta);
    });

    // Listen for awareness changes (user presence)
    awareness.on('update', () => {
      const states = awareness.getStates();
      console.log("Users online:", states.size);
      
      // You can implement user presence indicators here
      states.forEach((state, clientId) => {
        if (clientId !== awareness.clientID) {
          console.log("User online:", state.user?.name);
        }
      });
    });

    // Listen for connection status
    provider.on('status', ({ status }) => {
      console.log("Connection status:", status);
    });

    // Listen for sync events
    provider.on('sync', (isSynced) => {
      console.log("Document synced:", isSynced);
    });

    // Cleanup on unmount
    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      if (docRef.current) {
        docRef.current.destroy();
      }
    };
  }, [docId, username, color, wsEndpoint, editor]);

  return null;
}