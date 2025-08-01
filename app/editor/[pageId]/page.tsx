"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPageContent, updatePageContent } from "@/lib/firestore.pages";
import { useAuth } from "@/app/context/AuthContext";
import LexicalEditorComponent from "@/app/components/LexicalEditorComponents";

let timeout: NodeJS.Timeout;

export default function EditorPage() {
  const { pageId } = useParams();
  const { user, loading } = useAuth();
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !pageId) return;
      const data = await getPageContent(pageId as string);
      if (data) setContent(data);
    };
    fetchData();
  }, [pageId, user]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      updatePageContent(pageId as string, newContent);
    }, 500); // Debounced write
  };

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Editing Page: {pageId}</h2>
      <LexicalEditorComponent
        initialContent={content}
        onChange={(newContent) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            updatePageContent(pageId as string, newContent);
          }, 500);
        }}
      />
    </div>
  );
}
