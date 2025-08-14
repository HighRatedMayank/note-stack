"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PageTransition() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
        <Loader2 size={24} className="animate-spin" />
        <span className="text-lg font-medium">Loading...</span>
      </div>
    </div>
  );
}
