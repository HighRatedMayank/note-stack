"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = "md", 
  text, 
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Loader2 
        size={size === "sm" ? 16 : size === "md" ? 24 : 32} 
        className={`animate-spin text-blue-600 dark:text-blue-400 ${sizeClasses[size]}`} 
      />
      {text && (
        <span className={`text-gray-600 dark:text-gray-400 ${textSizes[size]}`}>
          {text}
        </span>
      )}
    </div>
  );
}

// Full screen loading spinner
export function FullScreenSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Inline loading spinner
export function InlineSpinner({ size = "sm", text }: { size?: "sm" | "md" | "lg"; text?: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <LoadingSpinner size={size} text={text} />
    </div>
  );
}

// Button loading spinner
export function ButtonSpinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Loader2 
      size={size === "sm" ? 16 : size === "md" ? 20 : 24} 
      className="animate-spin" 
    />
  );
}
