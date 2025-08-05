"use client";

import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $createParagraphNode,
  UNDO_COMMAND,
  REDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";
import { $isCodeNode } from "@lexical/code";
import { createCommand, LexicalCommand } from "lexical";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  Heading1,
  Heading2,
  Heading3,
  Text,
  ListChecks,
  Code,
  X,
  Quote,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  PaintBucket
} from "lucide-react";

export const INSERT_CODE_BLOCK_COMMAND: LexicalCommand<void> = createCommand("INSERT_CODE_BLOCK_COMMAND");

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
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
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));

      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === anchorNode.getTopLevelElementOrThrow().getKey()
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      const type = element.getType();

      if ($isListNode(element)) {
        const tag = (element as any).__tag;
        setBlockType(tag === "check" ? "check" : "bullet");
      } else if ($isHeadingNode(element)) {
        setBlockType((element as any).getTag());
      } else if ($isCodeNode(element)) {
        setBlockType("code");
      } else if (type === "quote") {
        setBlockType("quote");
      } else {
        setBlockType("paragraph");
      }
    }
  };

  const formatText = (format: "bold" | "italic" | "underline" | "strikethrough") => {
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

  const insertQuoteBlock = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
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

  const formatAlign = (alignment: "left" | "center" | "right") => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  };

  const openColorPicker = () => {
    alert("Color picker not yet implemented – UI coming soon!");
  };

  const btnBase = "p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition";
  const activeStyle = "bg-gray-300 dark:bg-gray-600";

  return (
    <div className="flex flex-wrap gap-2 items-center sticky top-0 z-10 bg-white dark:bg-gray-900 py-2">
      <button onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} className={btnBase}><Undo2 size={18} /></button>
      <button onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} className={btnBase}><Redo2 size={18} /></button>

      <button onClick={() => formatText("bold")} className={`${btnBase} ${isBold ? activeStyle : ""}`}><Bold size={18} /></button>
      <button onClick={() => formatText("italic")} className={`${btnBase} ${isItalic ? activeStyle : ""}`}><Italic size={18} /></button>
      <button onClick={() => formatText("underline")} className={`${btnBase} ${isUnderline ? activeStyle : ""}`}><Underline size={18} /></button>
      <button onClick={() => formatText("strikethrough")} className={`${btnBase} ${isStrikethrough ? activeStyle : ""}`}><Strikethrough size={18} /></button>

      <select
        value={blockType}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "paragraph") formatParagraph();
          else if (["h1", "h2", "h3"].includes(value)) formatHeading(value as HeadingTagType);
          else if (value === "quote") insertQuoteBlock();
        }}
        className="border px-2 py-1 rounded bg-white dark:bg-gray-800 text-sm dark:text-white"
      >
        <option value="paragraph">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="quote">Quote Block</option>
      </select>

      <button onClick={insertBulletList} className={`${btnBase} ${blockType === "bullet" ? activeStyle : ""}`}><List size={18} /></button>
      <button onClick={insertChecklist} className={`${btnBase} ${blockType === "check" ? activeStyle : ""}`}><ListChecks size={18} /></button>
      <button onClick={removeList} className={btnBase}><X size={18} /></button>
      <button onClick={insertCodeBlock} className={`${btnBase} ${blockType === "code" ? activeStyle : ""}`}><Code size={18} /></button>

      <button onClick={() => formatAlign("left")} className={btnBase}><AlignLeft size={18} /></button>
      <button onClick={() => formatAlign("center")} className={btnBase}><AlignCenter size={18} /></button>
      <button onClick={() => formatAlign("right")} className={btnBase}><AlignRight size={18} /></button>

      <button onClick={openColorPicker} className={btnBase}><PaintBucket size={18} /></button>
    </div>
  );
}
