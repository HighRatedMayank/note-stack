"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPageContent, updatePageContent } from "@/lib/supabase.pages";
import { useAuth } from "@/app/context/AuthContext";
import LexicalEditorComponent from "@/app/components/LexicalEditorComponent";
import { CheckCircle, Loader2 } from "lucide-react";

export default function EditorPage() {
  const { pageId } = useParams();
  const { user, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !pageId) return;
      const data = await getPageContent(pageId as string);
      if (data) {
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

    await updatePageContent(pageId as string, "", newTitle);

    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const handleContentChange = () => {
    // Content saving handled by YjsAutoSavePlugin
  };

  if (loading || !user) return <div className="p-4">Loading...</div>;

  return (
    <div className="relative px-4 py-6 sm:px-6 md:px-8 max-w-4xl mx-auto">
      <input
        value={title}
        onChange={handleRename}
        placeholder="Untitled"
        className="w-full text-4xl font-bold tracking-tight border-b border-muted bg-transparent py-2 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:focus:border-blue-400"
      />

      <div className="absolute right-6 top-6 flex items-center text-sm">
        {isSaving && (
          <div className="flex items-center gap-1 text-yellow-500 animate-pulse">
            <Loader2 size={16} className="animate-spin" />
            <span>Saving...</span>
          </div>
        )}
        {!isSaving && isSaved && (
          <div className="flex items-center gap-1 text-green-500 transition-opacity duration-300">
            <CheckCircle size={16} />
            <span>Saved</span>
          </div>
        )}
      </div>

      <div className="mt-6">
        <LexicalEditorComponent
          onChange={handleContentChange}
          docId={pageId as string}
          username={user?.user_metadata?.name || user?.email || "Anonymous"}
        />
      </div>
    </div>
  );
}
