"use client";

import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $createParagraphNode,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";

import {
  $isCodeNode,
} from "@lexical/code";

import { createCommand, LexicalCommand } from "lexical";
export const INSERT_CODE_BLOCK_COMMAND: LexicalCommand<void> = createCommand("INSERT_CODE_BLOCK_COMMAND");

import { useEffect, useState } from "react";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [blockType, setBlockType] = useState<string>("paragraph");

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  const updateToolbar = () => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));

      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === anchorNode.getTopLevelElementOrThrow().getKey()
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      const type = element.getType();

      if ($isListNode(element)) {
        const tag = (element as any).__tag;
        if (tag === "check") {
          setBlockType("check");
        } else {
          setBlockType("bullet");
        }
      } else if ($isHeadingNode(element)) {
        setBlockType((element as any).getTag());
      } else if ($isCodeNode(element)) {
        setBlockType("code");
      } else {
        setBlockType(type);
      }
    }
  };

  const formatText = (format: "bold" | "italic") => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatHeading = (tag: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const insertBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const removeList = () => {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  };

  const insertChecklist = () => {
    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
  };

  const insertCodeBlock = () => {
    editor.dispatchCommand(INSERT_CODE_BLOCK_COMMAND, undefined);
  };

  const isActiveBlock = (type: string) => blockType === type;

  return (
    <div className="mb-2 flex gap-2 flex-wrap">
      <button
        onClick={() => formatText("bold")}
        className={`px-2 py-1 border rounded ${isBold ? "bg-gray-300" : ""}`}
      >
        Bold
      </button>
      <button
        onClick={() => formatText("italic")}
        className={`px-2 py-1 border rounded ${isItalic ? "bg-gray-300" : ""}`}
      >
        Italic
      </button>
      <button
        onClick={() => formatHeading("h1")}
        className={`px-2 py-1 border rounded ${
          isActiveBlock("h1") ? "bg-gray-300" : ""
        }`}
      >
        H1
      </button>
      <button
        onClick={() => formatHeading("h2")}
        className={`px-2 py-1 border rounded ${
          isActiveBlock("h2") ? "bg-gray-300" : ""
        }`}
      >
        H2
      </button>
      <button
        onClick={formatParagraph}
        className={`px-2 py-1 border rounded ${
          isActiveBlock("paragraph") ? "bg-gray-300" : ""
        }`}
      >
        Paragraph
      </button>
      <button
        onClick={insertBulletList}
        className={`px-2 py-1 border rounded ${
          isActiveBlock("bullet") ? "bg-gray-300" : ""
        }`}
      >
        Bullet List
      </button>
      <button onClick={removeList} className="px-2 py-1 border rounded">
        Remove List
      </button>
      <button
        onClick={insertChecklist}
        className={`px-2 py-1 border rounded ${
          isActiveBlock("check") ? "bg-gray-300" : ""
        }`}
      >
        Checklist
      </button>
      <button
        onClick={insertCodeBlock}
        className={`px-2 py-1 border rounded ${
          isActiveBlock("code") ? "bg-gray-300" : ""
        }`}
      >
        Code Block
      </button>
    </div>
  );
}
