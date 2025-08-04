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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

interface PageNode {
  id: string;
  title: string;
  parentId?: string | null;
  children?: PageNode[];
}

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [pages, setPages] = useState<PageNode[]>([]);
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="mb-4 flex items-center space-x-2 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm text-black dark:text-white hover:opacity-90"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
    </button>
  )
}

  useEffect(() => {
    if (!user) return;
    const userPagesRef = collection(db, "users", user.uid, "documents");

    const unsubscribe = onSnapshot(userPagesRef, (snapshot) => {
      const pageMap: { [id: string]: PageNode } = {};
      const rootPages: PageNode[] = [];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const page: PageNode = {
          id: docSnap.id,
          title: data.title || "Untitled",
          parentId: data.parentId || null,
          children: [],
        };
        pageMap[docSnap.id] = page;
      });

      snapshot.docs.forEach((docSnap) => {
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

  const filterPages = (pages: PageNode[]): PageNode[] => {
    return pages
      .filter((page) =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((page) => ({
        ...page,
        children: page.children ? filterPages(page.children) : [],
      }));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
    if (!user) return;

    try {
      const activeId = active.id.toString();
      const overId = over.id.toString();

      // Update Firestore to move the active item under the "over" item
      await setDoc(
        doc(db, "users", user.uid, "documents", activeId),
        { parentId: overId },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to update page hierarchy:", err);
    }
  };

  const renderPages = (pages: PageNode[], depth = 0) => {
    const ids = pages.map((page) => page.id);

    return (
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {pages.map((page) => (
          <SidebarItem
            key={page.id}
            page={page}
            depth={depth}
            collapsed={collapsed}
            toggleCollapse={toggleCollapse}
            handleCreate={handleCreate}
            handleDelete={handleDelete}
            pathname={pathname}
            router={router}
          />
        ))}
      </SortableContext>
    );
  };

  const filteredPages = searchTerm ? filterPages(pages) : pages;

  if (!user) return null;

  return (
    <div className="w-64 bg-white dark:bg-gray-900 text-black dark:text-white h-screen p-4 border-r dark:border-gray-700 overflow-y-auto">
      <h2 className="text-lg font-bold mb-2">Your Pages</h2>
      <ThemeToggle />

      {/* Search Bar */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mb-4">
        <Search size={16} className="text-gray-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="ml-2 bg-transparent outline-none w-full placeholder:text-sm"
        />
      </div>

      <button
        onClick={() => handleCreate()}
        className="mb-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 w-full"
      >
        + New Page
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div>{renderPages(filteredPages)}</div>
      </DndContext>
    </div>
  );
}

function SidebarItem({
  page,
  depth,
  collapsed,
  toggleCollapse,
  handleCreate,
  handleDelete,
  pathname,
  router,
}: {
  page: PageNode;
  depth: number;
  collapsed: Record<string, boolean>;
  toggleCollapse: (id: string) => void;
  handleCreate: (parentId: string | null) => void;
  handleDelete: (id: string) => void;
  pathname: string;
  router: ReturnType<typeof useRouter>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    paddingLeft: `${depth * 16}px`,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        className={`flex items-center justify-between pr-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
          pathname.includes(page.id)
            ? "bg-blue-100 dark:bg-blue-800 font-semibold"
            : ""
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
        <div className="ml-4 border-l border-gray-300 pl-2 dark:border-gray-700">
          {page.children.map((child) => (
            <SidebarItem
              key={child.id}
              page={child}
              depth={depth + 1}
              collapsed={collapsed}
              toggleCollapse={toggleCollapse}
              handleCreate={handleCreate}
              handleDelete={handleDelete}
              pathname={pathname}
              router={router}
            />
          ))}
        </div>
      )}
    </div>
  );
}
