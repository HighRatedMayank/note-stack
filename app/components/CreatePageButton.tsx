"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function CreatePageButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const generatePageId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createPage = async () => {
    if (!pageTitle.trim()) {
      toast.error("Please enter a page title");
      return;
    }

    setIsCreating(true);
    try {
      const pageId = generatePageId();
      const title = pageTitle.trim();
      
      // Create the page in Firestore
      const { createPage } = await import("@/lib/firestore.pages");
      await createPage(pageId, title, "");
      
      toast.success("Page created successfully!");
      setIsOpen(false);
      setPageTitle("");
      
      // Navigate to the new page
      router.push(`/editor/${pageId}`);
    } catch (error) {
      console.error("Failed to create page:", error);
      toast.error("Failed to create page");
    } finally {
      setIsCreating(false);
    }
  };

  const createQuickPage = async () => {
    setIsCreating(true);
    try {
      const pageId = generatePageId();
      const title = `Quick Note ${new Date().toLocaleDateString()}`;
      
      // Create the page in Firestore
      const { createPage } = await import("@/lib/firestore.pages");
      await createPage(pageId, title, "");
      
      toast.success("Quick page created!");
      
      // Navigate to the new page
      router.push(`/editor/${pageId}`);
    } catch (error) {
      console.error("Failed to create quick page:", error);
      toast.error("Failed to create page");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* Create Page Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
        title="Create new collaborative page"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">New Page</span>
      </button>

      {/* Create Page Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Create New Page
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Page Title Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Title
              </label>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Enter page title..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createPage();
                  }
                }}
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={createPage}
                disabled={isCreating || !pageTitle.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <FileText size={16} />
                {isCreating ? "Creating..." : "Create Page"}
              </button>
              
              <button
                onClick={createQuickPage}
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <Plus size={16} />
                {isCreating ? "Creating..." : "Quick Note"}
              </button>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-green-700 dark:text-green-300">
                <strong>Collaborative:</strong> Once created, you can share this page with others for real-time collaborative editing.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
