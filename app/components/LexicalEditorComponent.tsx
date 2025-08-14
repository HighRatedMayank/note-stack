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
        h1: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4",
        h2: "text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3",
        h3: "text-xl font-medium text-gray-900 dark:text-gray-100 mb-2",
      },
      list: {
        ul: "list-disc pl-6 space-y-1 my-4",
        ol: "list-decimal pl-6 space-y-1 my-4",
        listitem: "text-gray-700 dark:text-gray-300",
        nested: {
          listitem: "ml-4",
        },
      },
      quote: "border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-4 italic text-gray-600 dark:text-gray-400",
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
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <LexicalComposer initialConfig={editorConfig}>
        {/* Enhanced Sticky Toolbar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-4 py-3">
            <ToolbarPlugin />
          </div>
        </div>

        {/* Editor Content Area */}
        <div className="px-4 sm:px-6 py-6">
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
