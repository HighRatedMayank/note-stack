"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPageContent, updatePageContent } from "@/lib/firestore.pages";
import { useAuth } from "@/app/context/AuthContext";
import LexicalEditorComponent from "@/app/components/LexicalEditorComponent";
import FloatingActionButton from "@/app/components/FloatingActionButton";
import { CheckCircle } from "lucide-react";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";

let timeout: NodeJS.Timeout;
let statusTimeout: NodeJS.Timeout;

export default function EditorPage() {
  const { pageId } = useParams();
  const { user, loading } = useAuth();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !pageId) return;
      const data = await getPageContent(pageId as string);
      if (data) {
        setContent(data.content || "");
        setTitle(data.title || "Untitled");
      }
    };
    fetchData();
  }, [pageId, user]);

  const handleRename = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsSaving(true);
    setIsSaved(false);
    await updatePageContent(pageId as string, content, newTitle);
    setIsSaving(false);
    setIsSaved(true);

    clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => setIsSaved(false), 1500);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsSaving(true);
    setIsSaved(false);

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      updatePageContent(pageId as string, newContent, title).then(() => {
        setIsSaving(false);
        setIsSaved(true);

        clearTimeout(statusTimeout);
        statusTimeout = setTimeout(() => setIsSaved(false), 1500);
      });
    }, 500);
  };

  if (loading || !user) {
    return <LoadingSpinner size="lg" text="Loading editor..." className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Header Section */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative">
            {/* Title Input */}
            <input
              value={title}
              onChange={handleRename}
              placeholder="Untitled"
              className="w-full text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all duration-200 focus:ring-0"
            />
            
            {/* Autosave Status */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {isSaving && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 animate-pulse">
                  <ButtonSpinner size="sm" />
                  <span className="text-sm font-medium hidden sm:inline">Saving...</span>
                </div>
              )}
              {!isSaving && isSaved && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 animate-fade-in">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium hidden sm:inline">Saved</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-fade-in">
          <LexicalEditorComponent
            initialContent={content}
            onChange={handleContentChange}
          />
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton />
    </div>
  );
}
