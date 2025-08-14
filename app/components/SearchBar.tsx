"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Command } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
  showShortcut?: boolean;
  autoFocus?: boolean;
}

export default function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  onClear,
  className = "",
  showShortcut = true,
  autoFocus = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    onChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative flex items-center transition-all duration-200 ${
          isFocused
            ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
            : ""
        }`}
      >
        <Search
          size={16}
          className={`absolute left-3 text-gray-400 dark:text-gray-500 transition-colors duration-200 ${
            isFocused ? "text-blue-500" : ""
          }`}
        />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
        />
        
        {/* Keyboard shortcut indicator */}
        {showShortcut && (
          <div className="absolute right-2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-600">
              {isMac ? <Command size={10} /> : <span className="text-xs">Ctrl</span>}
              <span>K</span>
            </kbd>
          </div>
        )}
        
        {/* Clear button */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// Enhanced search with suggestions
export function SearchWithSuggestions({
  placeholder = "Search...",
  value,
  onChange,
  suggestions = [],
  onSelectSuggestion,
  className = "",
}: {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
  className?: string;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(value.toLowerCase()) && value.length > 0
  );

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSelectSuggestion?.(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`}>
      <SearchBar
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onClear={() => setShowSuggestions(false)}
        showShortcut={false}
        className="mb-0"
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
