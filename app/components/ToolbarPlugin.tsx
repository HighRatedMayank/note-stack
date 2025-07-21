"use client";

import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  COMMAND_PRIORITY_NORMAL,
  $createParagraphNode,
  $createTextNode,
} from "lexical";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const applyFormat = (format: "bold" | "italic") => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const insertBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const insertChecklist = () => {
    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
  };

  const removeList = () => {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  };

  const insertHeading = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const heading = document.createElement("h1");
        heading.textContent = selection.getTextContent();
        const newNode = $createParagraphNode();
        newNode.append($createTextNode(heading.textContent || ""));
        selection.insertNodes([newNode]);
      }
    });
  };

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Optional: Update active format state here
        }
      });
    });
  }, [editor]);

  return (
    <div className="mb-2 flex gap-2 flex-wrap">
      <button onClick={() => applyFormat("bold")} className="btn">
        Bold
      </button>
      <button onClick={() => applyFormat("italic")} className="btn">
        Italic
      </button>
      <button onClick={insertBulletList} className="btn">
        Bullet List
      </button>
      <button onClick={insertChecklist} className="btn">
        Checklist
      </button>
      <button onClick={insertHeading} className="btn">
        Heading (H1)
      </button>
      <button onClick={removeList} className="btn">
        Remove List
      </button>
    </div>
  );
}
