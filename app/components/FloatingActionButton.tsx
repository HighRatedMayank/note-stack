"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";

export default function FloatingActionButton() {
  const router = useRouter();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDocument = async () => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      const newPageRef = doc(collection(db, "users", user.uid, "documents"));
      await setDoc(newPageRef, {
        title: "Untitled",
        parentId: null,
        content: "",
        createdAt: new Date().toISOString(),
      });
      
      router.push(`/editor/${newPageRef.id}`);
    } catch (error) {
      console.error("Failed to create document:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="md:hidden fixed bottom-6 right-6 z-50">
      <button
        onClick={handleCreateDocument}
        disabled={isCreating}
        className="group relative w-14 h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700"
        aria-label="Create new document"
      >
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-ping"></div>
        
        {/* Icon */}
        <div className="relative flex items-center justify-center w-full h-full">
          {isCreating ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Plus size={24} className="text-white" />
          )}
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          Create New Document
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>
    </div>
  );
}
