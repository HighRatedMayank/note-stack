"use client";

import { useEffect, useRef, useState } from "react";
import { $createParagraphNode, $createTextNode } from "lexical";
import {
  $getRoot,
  EditorState,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { debounce } from "lodash";
import { useAuth } from "../context/AuthContext";

export default function SaveLoadPlugin() {
  const [editor] = useLexicalComposerContext();
  const { user } = useAuth();
  const { pageId } = useParams();
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const saveContent = async (editorState: EditorState) => {
    if (!user || !pageId) return;

    setStatus("saving");

    const htmlString = await new Promise<string>((resolve) => {
      editorState.read(() => {
        const root = $getRoot();
        resolve(root.getTextContent()); 
      });
    });

    await setDoc(
      doc(db, "users", user.uid, "documents", pageId as string),
      { content: htmlString },
      { merge: true }
    );

    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1500);
  };

  const debouncedSave = useRef(debounce(saveContent, 1000)).current;

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      debouncedSave(editorState);
    });
  }, [editor, debouncedSave]);

  useEffect(() => {
    const loadContent = async () => {
      if (!user || !pageId) return;
      const docRef = doc(db, "users", user.uid, "documents", pageId as string);
      const snapshot = await getDoc(docRef);
      const data = snapshot.data();

      if (data?.content) {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(data.content));
          root.append(paragraph);
        });
      }
    };

    loadContent();
  }, [editor, user, pageId]);

  return (
    <div className="absolute top-4 right-6 z-50">
      {status === "saving" && (
        <div className="text-sm text-yellow-500 animate-pulse">Saving...</div>
      )}
      {status === "saved" && (
        <div className="text-sm text-green-500">All changes saved</div>
      )}
    </div>
  )
}

