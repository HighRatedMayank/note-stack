"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  
  if (isLandingPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex h-full relative">
      <Sidebar />
      <main className="flex-1 min-h-screen transition-all duration-300 ease-in-out">
        {children}
      </main>
    </div>
  );
}

