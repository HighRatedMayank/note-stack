"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPageContent, updatePageContent } from "@/lib/supabase.pages";
import { useAuth } from "@/app/context/AuthContext";
import LexicalEditorComponent from "@/app/components/LexicalEditorComponent";
import FloatingActionButton from "@/app/components/FloatingActionButton";
import KeyboardShortcuts from "@/app/components/KeyboardShortcuts";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import ShareButton from "@/app/components/ShareButton";
import { CheckCircle } from "lucide-react";
import LoadingSpinner, { ButtonSpinner } from "@/app/components/LoadingSpinner";

export default function EditorPage() {
  const { pageId } = useParams();
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [inputTitle, setInputTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Load page metadata on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user || !pageId) return;
      try {
        const data = await getPageContent(pageId as string);
        if (data) {
          setTitle(data.title || "Untitled");
          setInputTitle(data.title || "Untitled");
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
      setIsReady(true);
    };
    loadInitialData();
  }, [user, pageId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(e.target.value);
  };

  const handleTitleSave = async () => {
    if (inputTitle.trim() === "") {
      setInputTitle("Untitled");
      setTitle("Untitled");
      return;
    }
    if (inputTitle === title) return;

    setTitle(inputTitle);
    setIsSaving(true);
    setIsSaved(false);

    try {
      await updatePageContent(pageId as string, "", inputTitle);
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1500);
    } catch (error) {
      console.error("Failed to save title:", error);
      setIsSaving(false);
      setInputTitle(title);
    }
  };

  const handleContentChange = () => {
    // Content saving is handled by YjsAutoSavePlugin inside the editor
  };

  if (loading || !user) {
    return <LoadingSpinner size="lg" text="Loading editor..." className="min-h-screen" />;
  }

  if (!isReady) {
    return <LoadingSpinner size="lg" text="Loading page..." className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Header Section */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-300 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <input
              value={inputTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleSave}
              placeholder="Untitled"
              className="flex-1 min-w-0 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all duration-200 focus:ring-0"
            />
            <div className="flex items-center gap-3 shrink-0">
              <ShareButton pageId={pageId as string} title={title} />
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
        <Breadcrumbs />
        <div className="animate-fade-in">
          <LexicalEditorComponent
            onChange={handleContentChange}
            docId={pageId as string}
            username={user?.user_metadata?.name || user?.email || "Anonymous"}
          />
        </div>
      </div>

      <FloatingActionButton />
      <KeyboardShortcuts />
    </div>
  );
}
