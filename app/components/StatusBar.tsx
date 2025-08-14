"use client";

import { useState, useEffect } from "react";
import { Clock, FileText, Eye, Calendar } from "lucide-react";

interface StatusBarProps {
  wordCount?: number;
  characterCount?: number;
  lastModified?: string;
  readTime?: number;
  className?: string;
}

export default function StatusBar({
  wordCount = 0,
  characterCount = 0,
  lastModified,
  readTime = 0,
  className = "",
}: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatReadTime = (minutes: number) => {
    if (minutes < 1) return "Less than 1 min read";
    if (minutes === 1) return "1 min read";
    return `${Math.round(minutes)} min read`;
  };

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Word and character count */}
          <div className="flex items-center gap-2">
            <FileText size={14} />
            <span>{wordCount.toLocaleString()} words</span>
            <span className="text-gray-400">•</span>
            <span>{characterCount.toLocaleString()} characters</span>
          </div>

          {/* Read time */}
          {readTime > 0 && (
            <>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{formatReadTime(readTime)}</span>
              </div>
            </>
          )}

          {/* Last modified */}
          {lastModified && (
            <>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Modified {formatDate(lastModified)}</span>
              </div>
            </>
          )}
        </div>

        {/* Current time */}
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>
    </div>
  );
}

// Compact status bar for mobile
export function CompactStatusBar({
  wordCount = 0,
  characterCount = 0,
  className = "",
}: Pick<StatusBarProps, "wordCount" | "characterCount" | "className">) {
  return (
    <div
      className={`bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>{wordCount.toLocaleString()} words</span>
          <span className="text-gray-400">•</span>
          <span>{characterCount.toLocaleString()} chars</span>
        </div>
        
        <div className="text-gray-400">
          {new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </div>
      </div>
    </div>
  );
}
