"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getFirestore,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface PageNode {
  id: string;
  title: string;
  children?: PageNode[];
}

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [pages, setPages] = useState<PageNode[]>([]);
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!user) return;
    const userPagesRef = collection(db, "users", user.uid, "documents");

    const unsubscribe = onSnapshot(userPagesRef, (snapshot) => {
      const pageMap: { [id: string]: PageNode } = {};
      const rootPages: PageNode[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const page: PageNode = {
          id: docSnap.id,
          title: data.title || "Untitled",
          children: [],
        };
        pageMap[docSnap.id] = page;
      });

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const parentId = data.parentId;
        if (parentId && pageMap[parentId]) {
          pageMap[parentId].children!.push(pageMap[docSnap.id]);
        } else {
          rootPages.push(pageMap[docSnap.id]);
        }
      });

      setPages(rootPages);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreate = async (parentId: string | null = null) => {
    if (!user) return;
    const newPageRef = doc(collection(db, "users", user.uid, "documents"));
    await setDoc(newPageRef, {
      title: "Untitled",
      parentId: parentId || null,
      content: "",
      createdAt: new Date().toISOString(),
    });
    router.push(`/editor/${newPageRef.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "documents", id));
  };

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderPages = (pages: PageNode[], depth = 0) => {
    return pages.map((page) => (
      <div key={page.id} className="pl-2">
        <div
          className={`flex items-center justify-between pr-2 py-1 cursor-pointer hover:bg-gray-100 rounded ${
            pathname.includes(page.id) ? "bg-blue-100 font-semibold" : ""
          }`}
        >
          <div
            className="flex items-center space-x-1"
            onClick={() => router.push(`/editor/${page.id}`)}
          >
            {page.children && page.children.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse(page.id);
                }}
              >
                {collapsed[page.id] ? (
                  <ChevronRight size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            )}
            <span>{page.title}</span>
          </div>
          <div className="flex gap-1">
            <button
              className="text-green-600 hover:text-green-800"
              onClick={(e) => {
                e.stopPropagation();
                handleCreate(page.id);
              }}
            >
              <Plus size={16} />
            </button>
            <button
              className="text-red-600 hover:text-red-800"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(page.id);
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        {page.children && page.children.length > 0 && !collapsed[page.id] && (
          <div className="ml-4 border-l border-gray-300 pl-2">
            {renderPages(page.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (!user) return null;

  return (
    <div className="w-64 bg-white h-screen p-4 border-r overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Your Pages</h2>
      <button
        onClick={() => handleCreate()}
        className="mb-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        + New Page
      </button>
      <div>{renderPages(pages)}</div>
    </div>
  );
}
