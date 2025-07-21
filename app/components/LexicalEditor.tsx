"use client";

import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, LexicalEditor } from "lexical";

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
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        {/* Toolbar with formatting buttons */}
        <ToolbarPlugin />

        {/* Main editor area */}
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={
            <div className="editor-placeholder">Start typing...</div>
          }
          ErrorBoundary={({ children }) => <>{children}</>}
        />

        <HistoryPlugin />
        <OnChangePlugin
          onChange={(editorState: EditorState) => {
            onChange(JSON.stringify(editorState.toJSON()));
          }}
        />
      </div>
    </LexicalComposer>
  );
}
