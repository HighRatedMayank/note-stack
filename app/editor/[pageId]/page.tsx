"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPageContent, updatePageContent } from "@/lib/firestore.pages";
import { useAuth } from "@/app/context/AuthContext";
import LexicalEditorComponent from "@/app/components/LexicalEditorComponents";
import toast from "react-hot-toast";

let timeout: NodeJS.Timeout;

export default function EditorPage() {
  const { pageId } = useParams();
  const { user, loading } = useAuth();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

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
    await updatePageContent(pageId as string, content, newTitle);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      updatePageContent(pageId as string, newContent, title).then(() => {
        toast.success("Auto-saved", { duration: 1000 });
      });
    }, 500);
  };

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <input
        value={title}
        onChange={handleRename}
        placeholder="Untitled"
        className="text-3xl font-bold w-full mb-4 border-b focus:outline-none"
      />
      <LexicalEditorComponent
        initialContent={content}
        onChange={handleContentChange}
      />
    </div>
  );
}
