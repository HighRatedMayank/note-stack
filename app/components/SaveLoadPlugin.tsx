"use client";

import { useEffect, useRef, useState } from "react";
import { $createParagraphNode, $createTextNode, $getRoot, EditorState } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useParams } from "next/navigation";
import { debounce } from "lodash";
import { useAuth } from "../context/AuthContext";
import { createClient } from "@/lib/supabase/client";

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
    const saveData: Record<string, string | Date> = { 
      content: htmlString,
      author_id: user.id,
      updated_at: new Date()
    };
    
    if (title && title !== "Untitled") {
      saveData.title = title;
    }

    const supabase = createClient();
    await supabase
      .from("pages")
      .update(saveData)
      .eq("id", pageId as string);

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
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pages")
        .select("content, title")
        .eq("id", pageId as string)
        .single();

      if (!error && data) {
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
