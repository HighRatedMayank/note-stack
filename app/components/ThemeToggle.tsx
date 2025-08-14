"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
    );
  }

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {themes.map((themeOption) => {
        const Icon = themeOption.icon;
        const isActive = theme === themeOption.value;
        
        return (
          <button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`p-2 rounded-md transition-all duration-200 ${
              isActive
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title={`${themeOption.label} theme`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
