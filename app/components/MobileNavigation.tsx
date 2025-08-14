"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { Menu, X, Home, FileText, Settings, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: pathname === "/dashboard",
    },
    {
      name: "Editor",
      href: "/editor",
      icon: FileText,
      current: pathname.includes("/editor"),
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
        aria-label="Open navigation menu"
      >
        <Menu size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu panel */}
          <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Navigation
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  aria-label="Close menu"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Navigation items */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        item.current
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-2 border-l-blue-500"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon size={18} />
                      {item.name}
                    </a>
                  );
                })}
              </nav>

              {/* User section */}
              {user && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
