"use client";

import { useState, useEffect } from "react";
import { Keyboard, X, Command, Ctrl } from "lucide-react";

interface Shortcut {
  key: string;
  description: string;
  modifier?: "cmd" | "ctrl";
}

const shortcuts: Shortcut[] = [
  { key: "B", description: "Bold text", modifier: "cmd" },
  { key: "I", description: "Italic text", modifier: "cmd" },
  { key: "U", description: "Underline text", modifier: "cmd" },
  { key: "Z", description: "Undo", modifier: "cmd" },
  { key: "Y", description: "Redo", modifier: "cmd" },
  { key: "S", description: "Save document", modifier: "cmd" },
  { key: "N", description: "New document", modifier: "cmd" },
  { key: "F", description: "Find text", modifier: "cmd" },
  { key: "Enter", description: "New line" },
  { key: "Tab", description: "Indent" },
  { key: "Shift + Tab", description: "Outdent" },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const getModifierIcon = (modifier?: "cmd" | "ctrl") => {
    if (!modifier) return null;
    return isMac ? <Command size={14} /> : <Ctrl size={14} />;
  };

  const getModifierText = (modifier?: "cmd" | "ctrl") => {
    if (!modifier) return "";
    return isMac ? "⌘" : "Ctrl";
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 md:hidden"
        title="Keyboard shortcuts"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard size={20} className="text-gray-600 dark:text-gray-300" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label="Close shortcuts"
          >
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.modifier && (
                    <>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getModifierText(shortcut.modifier)}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">+</span>
                    </>
                  )}
                  <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-600">
                    {shortcut.key}
                  </kbd>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {isMac ? "⌘" : "Ctrl"} key shortcuts work in the editor
          </p>
        </div>
      </div>
    </div>
  );
}
