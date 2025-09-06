"use client";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef, useState } from "react";

type Props = {
  docId: string;
  username: string;
  color?: string;
  wsEndpoint?: string;
  onUsersChange?: (users: Array<{ name: string; color: string; clientId: number }>) => void;
  onConnectionStatusChange?: (status: string) => void;
  onBindingChange?: (binding: any) => void;
};

export default function YjsPlugin({
  docId,
  username,
  color = "#3b82f6",
  wsEndpoint = "ws://localhost:1234",
  onUsersChange,
  onConnectionStatusChange,
  onBindingChange,
}: Props) {
  const [editor] = useLexicalComposerContext();
  const providerRef = useRef<WebsocketProvider | null>(null);
  const docRef = useRef<Y.Doc | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<Array<{ name: string; color: string; clientId: number }>>([]);

  useEffect(() => {
    // Create a new Yjs document
    const doc = new Y.Doc();
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

    // Listen for awareness changes (user presence)
    const updateUsers = () => {
      const states = awareness.getStates();
      const userList: Array<{ name: string; color: string; clientId: number }> = [];
      
      states.forEach((state, clientId) => {
        if (state.user) {
          userList.push({
            name: state.user.name,
            color: state.user.color || color,
            clientId,
          });
        }
      });
      
      setUsers(userList);
      onUsersChange?.(userList);
    };

    awareness.on('update', updateUsers);
    updateUsers(); // Initial update

    // Listen for connection status
    provider.on('status', ({ status }) => {
      console.log("Connection status:", status);
      setIsConnected(status === 'connected');
      onConnectionStatusChange?.(status);
    });

    // Listen for sync events
    provider.on('sync', (isSynced) => {
      console.log("Document synced:", isSynced);
    });

    // Pass the provider as binding for cursor tracking
    onBindingChange?.(provider);

    // Cleanup on unmount
    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      if (docRef.current) {
        docRef.current.destroy();
      }
    };
  }, [docId, username, color, wsEndpoint, onUsersChange, onConnectionStatusChange, onBindingChange]);

  return null;
}