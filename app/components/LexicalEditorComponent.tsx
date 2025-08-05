"use client";

import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, LexicalEditor } from "lexical";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HeadingNode } from "@lexical/rich-text";
import ToolbarPlugin from "./ToolbarPlugin";
import "./editor.css";

export default function LexicalEditorComponent({
  onChange,
  initialContent,
}: {
  onChange: (value: string) => void;
  initialContent?: string;
}) {
  const editorConfig: InitialConfigType = {
    namespace: "MyEditor",
    theme: {
      paragraph: "editor-paragraph",
      heading: {
        h1: "text-2xl font-bold",
        h2: "text-xl font-semibold",
        h3: "text-lg font-medium",
      },
      list: {
        ul: "list-disc pl-4",
        ol: "list-decimal pl-4",
        listitem: "mb-1",
        nested: {
          listitem: "ml-6",
        },
      },
    },
    onError(error) {
      console.error("Lexical Error:", error);
    },
    editorState:
      initialContent && typeof initialContent === "string"
        ? (editor: LexicalEditor) => {
            try {
              const parsed = editor.parseEditorState(initialContent);
              editor.setEditorState(parsed);
            } catch (err) {
              console.warn("Failed to parse initialContent:", err);
            }
          }
        : undefined,
    nodes: [ListNode, ListItemNode, HeadingNode, CodeNode, CodeHighlightNode],
  };

  return (
    <div className="border rounded-md shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
      <LexicalComposer initialConfig={editorConfig}>
        {/* Sticky toolbar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-4 py-2 shadow-sm">
          <ToolbarPlugin />
        </div>

        {/* Editor content area */}
        <div className="px-4 py-4">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="editor-input min-h-[300px] outline-none text-base text-black dark:text-white" />
            }
            placeholder={
              <div className="absolute text-gray-400 pointer-events-none">
                Start typing...
              </div>
            }
            ErrorBoundary={({ children }) => <>{children}</>}
          />
          <HistoryPlugin />
          <OnChangePlugin
            onChange={(editorState: EditorState) => {
              if (onChange) {
                onChange(JSON.stringify(editorState.toJSON()));
              }
            }}
          />
        </div>
      </LexicalComposer>
    </div>
  );
}
