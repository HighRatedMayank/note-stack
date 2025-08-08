"use client";

import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  SELECTION_CHANGE_COMMAND,
  KEY_MODIFIER_COMMAND,
} from "lexical";
import {
  $isHeadingNode,
  $isQuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";

import {
  useLexicalComposerContext,
} from "@lexical/react/LexicalComposerContext";
import { $patchStyleText } from "@lexical/selection";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  PaintBucket,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { $createParagraphNode, $getNodeByKey, $isParagraphNode } from "lexical";
import { $createQuoteNode } from "@lexical/rich-text";
import { $createHeadingNode } from "@lexical/rich-text";
import { Loader2 } from "lucide-react";

const btnBase =
  "p-1 px-2 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState("paragraph");
  const [color, setColor] = useState("#000000");
  const [showTextColor, setShowTextColor] = useState(false);
  const [showBgColor, setShowBgColor] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchor = selection.anchor.getNode();
      const element =
        anchor.getKey() === "root" ? anchor : anchor.getTopLevelElementOrThrow();

      if ($isHeadingNode(element)) {
        setBlockType(element.getTag());
      } else if ($isQuoteNode(element)) {
        setBlockType("quote");
      } else if ($isParagraphNode(element)) {
        setBlockType("paragraph");
      }
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar]);

  // Keyboard Shortcuts: Bold, Italic, Underline
  useEffect(() => {
    return editor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (event) => {
        if (event.metaKey || event.ctrlKey) {
          switch (event.key) {
            case "b":
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
              return true;
            case "i":
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
              return true;
            case "u":
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
              return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  const formatTextStyle = (style: "color" | "bgcolor") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          [style === "color" ? "color" : "background-color"]: color,
        });
      }
    });
  };

  return (
    <div className="flex gap-2 flex-wrap mb-4 items-center border-b pb-2">
      {saveStatus === "saving" && (
  <div className="flex items-center gap-1 animate-pulse">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span>Saving...</span>
  </div>
)}
<div className="absolute top-2 right-4 text-sm text-gray-500 dark:text-gray-400 transition-opacity duration-300">
  {saveStatus === "saving" && (
    <span className="animate-pulse">Saving...</span>
  )}
  {saveStatus === "saved" && (
    <span className="text-green-500">✓ Saved</span>
  )}
</div>

      {/* Formatting buttons */}
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        className={btnBase}
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        className={btnBase}
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        className={btnBase}
      >
        <Underline size={16} />
      </button>
      <button
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        className={btnBase}
      >
        <Strikethrough size={16} />
      </button>

      {/* Heading Dropdown */}
      <select
        className={`${btnBase} cursor-pointer`}
        value={blockType}
        onChange={(e) => {
          const value = e.target.value;
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              switch (value) {
                case "paragraph":
                  $setBlocksType(selection, () => $createParagraphNode());
                  break;
                case "h1":
                case "h2":
                case "h3":
                  $setBlocksType(selection, () =>
                    $createHeadingNode(value as "h1" | "h2" | "h3")
                  );
                  break;
                case "quote":
                  $setBlocksType(selection, () => $createQuoteNode());
                  break;
              }
            }
          });
        }}
      >
        <option value="paragraph">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="quote">Quote</option>
      </select>

      {/* Undo/Redo */}
      <button
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className={btnBase}
      >
        <Undo size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className={btnBase}
      >
        <Redo size={16} />
      </button>

      {/* Alignment */}
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        className={btnBase}
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        className={btnBase}
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        className={btnBase}
      >
        <AlignRight size={16} />
      </button>

      {/* Color Picker (Text) */}
      <div className="relative">
        <button onClick={() => setShowTextColor((v) => !v)} className={btnBase}>
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: color }}
          ></div>
        </button>
        {showTextColor && (
          <div className="absolute z-50 mt-2 bg-white p-2 rounded shadow border dark:bg-gray-800">
            <HexColorPicker color={color} onChange={setColor} />
            <button
              onClick={() => formatTextStyle("color")}
              className="mt-2 w-full text-sm bg-black text-white px-2 py-1 rounded"
            >
              Apply Text Color
            </button>
          </div>
        )}
      </div>

      {/* Color Picker (Highlight) */}
      <div className="relative">
        <button onClick={() => setShowBgColor((v) => !v)} className={btnBase}>
          <PaintBucket size={16} />
        </button>
        {showBgColor && (
          <div className="absolute z-50 mt-2 bg-white p-2 rounded shadow border dark:bg-gray-800">
            <HexColorPicker color={color} onChange={setColor} />
            <button
              onClick={() => formatTextStyle("bgcolor")}
              className="mt-2 w-full text-sm bg-yellow-400 text-black px-2 py-1 rounded"
            >
              Apply Highlight
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
