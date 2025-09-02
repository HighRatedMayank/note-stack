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
  Type,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { $createParagraphNode, $isParagraphNode } from "lexical";
import { $createQuoteNode } from "@lexical/rich-text";
import { $createHeadingNode } from "@lexical/rich-text";

const btnBase = "toolbar-btn";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState("paragraph");
  const [color, setColor] = useState("#000000");
  const [showTextColor, setShowTextColor] = useState(false);
  const [showBgColor, setShowBgColor] = useState(false);

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
    <div className="flex flex-wrap gap-2 items-center">
      {/* Text Formatting Group */}
      <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          className={btnBase}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          className={btnBase}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
          className={btnBase}
          title="Underline (Ctrl+U)"
        >
          <Underline size={16} />
        </button>
        <button
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
          }
          className={btnBase}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
      </div>

      {/* Block Type Group */}
      <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <select
          className={`${btnBase} cursor-pointer min-w-[120px]`}
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
      </div>

      {/* Alignment Group */}
      <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
          className={btnBase}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
          className={btnBase}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
          className={btnBase}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* History Group */}
      <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          className={btnBase}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          className={btnBase}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Color Picker Group */}
      <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {/* Text Color Picker */}
        <div className="relative">
          <button 
            onClick={() => setShowTextColor((v) => !v)} 
            className={btnBase}
            title="Text Color"
          >
            <Type size={16} />
          </button>
          {showTextColor && (
            <div className="absolute z-50 mt-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
              <HexColorPicker color={color} onChange={setColor} />
              <button
                onClick={() => {
                  formatTextStyle("color");
                  setShowTextColor(false);
                }}
                className="mt-3 w-full text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors duration-200"
              >
                Apply Text Color
              </button>
            </div>
          )}
        </div>

        {/* Background Color Picker */}
        <div className="relative">
          <button 
            onClick={() => setShowBgColor((v) => !v)} 
            className={btnBase}
            title="Background Color"
          >
            <PaintBucket size={16} />
          </button>
          {showBgColor && (
            <div className="absolute z-50 mt-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
              <HexColorPicker color={color} onChange={setColor} />
              <button
                onClick={() => {
                  formatTextStyle("bgcolor");
                  setShowBgColor(false);
                }}
                className="mt-3 w-full text-sm bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded-md transition-colors duration-200"
              >
                Apply Highlight
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
