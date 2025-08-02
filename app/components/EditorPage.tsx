"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getPageContent, updatePageContent } from "@/lib/firestore.pages";
import { useAuth } from "@/app/context/AuthContext";

const LexicalEditorComponent = dynamic(() => import("./LexicalEditorComponents"), {
  ssr: false,
});

export default function EditorPage() {
  const { pageId } = useParams();
  const { user, loading } = useAuth();
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !pageId) return;
      const data = await getPageContent(pageId as string);
      if (data) {
        setContent(data);
      }
    };
    fetchData();
  }, [pageId, user]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    updatePageContent(pageId as string, newContent);
  };

  if (loading || !user) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Editing Page: {pageId}</h2>
      <LexicalEditorComponent
        onChange={handleContentChange}
        initialContent={content}
      />
    </div>
  );
}
