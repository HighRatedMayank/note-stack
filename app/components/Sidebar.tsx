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
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PageNode {
  id: string;
  title: string;
  parentId?: string | null;
  children?: PageNode[];
  position?: number;
}

function SortableItem({
  page,
  pathname,
  onClick,
  onDelete,
  onCreateChild,
  collapsed,
  toggleCollapse,
}: {
  page: PageNode;
  pathname: string;
  onClick: () => void;
  onDelete: () => void;
  onCreateChild: () => void;
  collapsed: boolean;
  toggleCollapse: () => void;
}) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="pl-2">
      <div
        className={`flex items-center justify-between pr-2 py-1 cursor-pointer hover:bg-gray-100 rounded ${
          pathname.includes(page.id) ? "bg-blue-100 font-semibold" : ""
        }`}
      >
        <div className="flex items-center space-x-1" onClick={onClick}>
          {/* collapse button */}
          {page.children && page.children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse();
              }}
            >
              {collapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          )}
          {/* drag handle */}
          <div {...attributes} {...listeners} className="cursor-move">
            <GripVertical size={14} />
          </div>
          <span>{page.title}</span>
        </div>
        <div className="flex gap-1">
          <button
            className="text-green-600 hover:text-green-800"
            onClick={(e) => {
              e.stopPropagation();
              onCreateChild();
            }}
          >
            <Plus size={16} />
          </button>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [pages, setPages] = useState<PageNode[]>([]);
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({});

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "documents"),
      orderBy("position", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pageMap: { [id: string]: PageNode } = {};
      const rootPages: PageNode[] = [];

      snapshot.docs.forEach((docSnap, index) => {
        const data = docSnap.data();
        const page: PageNode = {
          id: docSnap.id,
          title: data.title || "Untitled",
          parentId: data.parentId || null,
          position: data.position ?? index,
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(pages, oldIndex, newIndex);
    setPages(reordered);

    // Save new positions
    for (let i = 0; i < reordered.length; i++) {
      const ref = doc(db, "users", user!.uid, "documents", reordered[i].id);
      await updateDoc(ref, { position: i });
    }
  };

  const renderPages = (pages: PageNode[]) => {
    return pages.map((page) => (
      <SortableItem
        key={page.id}
        page={page}
        pathname={pathname}
        onClick={() => router.push(`/editor/${page.id}`)}
        onDelete={() => handleDelete(page.id)}
        onCreateChild={() => handleCreate(page.id)}
        collapsed={collapsed[page.id]}
        toggleCollapse={() => toggleCollapse(page.id)}
      />
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pages.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {renderPages(pages)}
        </SortableContext>
      </DndContext>
    </div>
  );
}
