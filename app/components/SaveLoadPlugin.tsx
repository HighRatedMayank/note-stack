// components/SaveLoadPlugin.tsx
"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { db } from "../../lib/firebase"; 
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useCallback } from "react";

export default function SaveLoadPlugin() {
  const [editor] = useLexicalComposerContext();

  const saveContent = useCallback(async () => {
    const editorState = editor.getEditorState();
    const json = editorState.toJSON();

    const docRef = doc(db, "documents", "myDoc");
    await setDoc(docRef, { content: json });

    alert("✅ Saved to Firestore");
  }, [editor]);

  const loadContent = useCallback(async () => {
    const docRef = doc(db, "documents", "myDoc");
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const json = snap.data()?.content;
      editor.update(() => {
        const state = editor.parseEditorState(json);
        editor.setEditorState(state);
      });
      alert("📂 Loaded from Firestore");
    } else {
      alert("⚠️ No document found");
    }
  }, [editor]);

  return (
    <div className="mb-4 flex gap-2">
      <button
        onClick={saveContent}
        className="px-3 py-1 bg-blue-500 text-white rounded"
      >
        💾 Save
      </button>
      <button
        onClick={loadContent}
        className="px-3 py-1 bg-green-600 text-white rounded"
      >
        📂 Load
      </button>
    </div>
  );
}
