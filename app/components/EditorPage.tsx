"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import SaveLoadPlugin from "./SaveLoadPlugin";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

const LexicalEditorComponent = dynamic(() => import("./LexicalEditorComponent"), {
  ssr: false,
});

export default function EditorPage() {
  const { pageId } = useParams();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTitle = async () => {
      if (!user || !pageId) return;
      const docRef = doc(db, "users", user.uid, "documents", pageId as string);
      const snapshot = await getDoc(docRef);
      const data = snapshot.data();
      if (data?.title) {
        setTitle(data.title);
      }
    };

    fetchTitle();
  }, [user, pageId]);

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsSaving(true);
    if (user && pageId) {
      const docRef = doc(db, "users", user.uid, "documents", pageId as string);
      await setDoc(docRef, { title: newTitle }, { merge: true });
    }
    setIsSaving(false);
  };

  const handleEditorChange = async (content: string) => {
  if (!user || !pageId) return;

  await setDoc(
    doc(db, "users", user.uid, "documents", pageId as string),
    { content },
    { merge: true }
  );

  toast('Editor content saved!')
};

  return (
    <div>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <div className="relative flex flex-col gap-2 p-6 max-w-4xl mx-auto w-full">
      <input
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled"
        className="text-3xl font-bold outline-none bg-transparent border-b border-muted py-1"
      />
      {isSaving && (
        <div className="text-sm text-yellow-500 absolute top-4 right-6 animate-pulse">
          Saving title...
        </div>
      )}
      <LexicalEditorComponent onChange={handleEditorChange} />
      <SaveLoadPlugin />
    </div>
    </div>
    
  );
}
