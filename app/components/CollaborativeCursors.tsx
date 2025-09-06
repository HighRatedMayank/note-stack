"use client";

import { useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $getNodeByKey } from "lexical";
import { syncCursorPositions } from "@lexical/yjs";

type User = {
  name: string;
  color: string;
  clientId: number;
};

type CursorPosition = {
  x: number;
  y: number;
  user: User;
  isActive: boolean;
};

type Props = {
  users: User[];
  binding?: any; // Yjs binding reference
};

export default function CollaborativeCursors({ users, binding }: Props) {
  const [editor] = useLexicalComposerContext();
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const cursorRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const lastUpdateTime = useRef<number>(0);

  useEffect(() => {
    if (!binding) return;

    // Update cursors based on Yjs awareness
    const updateCursors = () => {
      const now = Date.now();
      if (now - lastUpdateTime.current < 100) return; // Throttle updates
      lastUpdateTime.current = now;

      const states = binding.awareness.getStates();
      const newCursors: CursorPosition[] = [];

      states.forEach((state, clientId) => {
        if (state.user && clientId !== binding.awareness.clientID) {
          // For now, we'll use simulated positions
          // In a real implementation, you'd use the actual cursor positions from awareness
          const index = Array.from(states.keys()).indexOf(clientId);
          newCursors.push({
            x: 50 + index * 30,
            y: 30 + index * 20,
            user: {
              name: state.user.name,
              color: state.user.color || '#3b82f6',
              clientId,
            },
            isActive: true, // Simplified for now
          });
        }
      });

      setCursors(newCursors);
    };

    // Listen for awareness updates
    binding.awareness.on('update', updateCursors);
    updateCursors(); // Initial update

    // Listen for editor selection changes
    const removeUpdateListener = editor.registerUpdateListener(({ editorState, tags }) => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Update awareness with current selection
        // This is a simplified version - real implementation would sync cursor positions
        console.log('Selection changed, updating awareness');
      }
    });

    return () => {
      removeUpdateListener();
      binding.awareness.off('update', updateCursors);
    };
  }, [editor, users, binding]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {cursors.map((cursor) => (
        <div
          key={cursor.user.clientId}
          ref={(el) => {
            if (el) {
              cursorRefs.current.set(cursor.user.clientId, el);
            }
          }}
          className={`absolute transition-all duration-150 ease-out ${
            cursor.isActive ? 'opacity-100' : 'opacity-60'
          }`}
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: 'translateY(-100%)',
          }}
        >
          {/* Cursor */}
          <div
            className="w-0.5 h-6 relative animate-pulse"
            style={{ backgroundColor: cursor.user.color }}
          >
            {/* Cursor caret */}
            <div
              className="absolute -top-1 -left-1 w-2 h-2 transform rotate-45"
              style={{ backgroundColor: cursor.user.color }}
            />
          </div>
          
          {/* User label */}
          <div
            className="absolute top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg"
            style={{ backgroundColor: cursor.user.color }}
          >
            {cursor.user.name}
          </div>
        </div>
      ))}
    </div>
  );
}
