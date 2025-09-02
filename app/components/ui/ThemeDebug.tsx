"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeDebug() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-20 right-4 z-50 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-sm">
      <div className="font-semibold mb-2">Theme Debug:</div>
      <div>Current Theme: {theme}</div>
      <div className="mt-2">
        <button
          onClick={() => setTheme("light")}
          className="mr-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Light
        </button>
        <button
          onClick={() => setTheme("dark")}
          className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
        >
          Dark
        </button>
      </div>
    </div>
  );
}
