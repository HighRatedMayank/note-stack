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

export default function SaveLoadPlugin({ 
  title, 
  onContentLoad 
}: { 
  title?: string;
  onContentLoad?: (content: string, title: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const { user } = useAuth();
  const { pageId } = useParams();
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const hasLoadedRef = useRef(false); // Prevent multiple content loads

  const saveContent = async (editorState: EditorState) => {
    if (!user || !pageId) return;

    setStatus("saving");

    const htmlString = await new Promise<string>((resolve) => {
      editorState.read(() => {
        const root = $getRoot();
        resolve(root.getTextContent()); 
      });
    });

    // Only save title if it's provided and different from "Untitled"
    const saveData: any = { 
      content: htmlString,
      authorId: user.uid,
      updatedAt: new Date()
    };
    
    if (title && title !== "Untitled") {
      saveData.title = title;
    }

    await setDoc(
      doc(db, "pages", pageId as string),
      saveData,
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
      if (!user || !pageId || hasLoadedRef.current) return; // Don't reload if already loaded
      
      const docRef = doc(db, "pages", pageId as string);
      const snapshot = await getDoc(docRef);
      const data = snapshot.data();

      if (data) {
        // Load content if it exists
        if (data.content) {
          editor.update(() => {
            const root = $getRoot();
            root.clear();
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(data.content));
            root.append(paragraph);
          });
        }
        
        // Always notify parent component about loaded data (content and/or title)
        if (onContentLoad) {
          onContentLoad(data.content || "", data.title || "Untitled");
        }
        
        hasLoadedRef.current = true; // Mark as loaded
      }
    };

    loadContent();
  }, [editor, user, pageId, onContentLoad]);

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

