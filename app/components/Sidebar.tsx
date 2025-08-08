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
  Sun,
  Moon,
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
import { useTheme } from "next-themes";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const { theme, setTheme } = useTheme();

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
    if (!active || !over || active.id === over.id) 
      return;
    if (!user) 
      return;

    try {
      const activeId = active.id.toString();
      const overId = over.id.toString();
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

  const sidebarContent = (
    <div className="w-64 h-full bg-white dark:bg-gray-900 text-black dark:text-white border-r border-gray-200 dark:border-gray-800 p-4 shadow-sm space-y-4 overflow-y-auto">
      {/* Mobile Close Button */}
      <div className="md:hidden flex justify-end">
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="text-gray-600 dark:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Title + Theme Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight">Your Pages</h2>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Search Box */}
      <div className="flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-2 py-1">
        <Search size={16} className="text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="ml-2 bg-transparent outline-none w-full placeholder:text-sm text-sm"
        />
      </div>

      {/* Create Button */}
      <button
        onClick={() => handleCreate()}
        className="w-full rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-medium shadow hover:bg-blue-700 transition"
      >
        + New Page
      </button>

      {/* Tree List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="space-y-1">{renderPages(filteredPages)}</div>
      </DndContext>
    </div>
  );

  if (!user) 
    return null;

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-900 text-black dark:text-white border-r border-gray-200 dark:border-gray-800 p-4 shadow-sm space-y-4 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Your Pages
        </h2>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-2 py-1">
        <Search size={16} className="text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="ml-2 bg-transparent outline-none w-full placeholder:text-sm text-sm"
        />
      </div>

      <button
        onClick={() => handleCreate()}
        className="w-full rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-medium shadow hover:bg-blue-700 transition"
      >
        + New Page
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-1">{renderPages(filteredPages)}</div>
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

  const isActive = pathname.includes(page.id);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
          isActive
            ? "bg-blue-100 dark:bg-blue-800 font-medium text-blue-900 dark:text-blue-100"
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
              className="mr-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              {collapsed[page.id] ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          )}
          <span className="truncate text-sm">{page.title}</span>
        </div>
        <div className="flex gap-1">
          <button
            className="text-green-600 hover:text-green-700 transition"
            onClick={(e) => {
              e.stopPropagation();
              handleCreate(page.id);
            }}
          >
            <Plus size={16} />
          </button>
          <button
            className="text-red-600 hover:text-red-700 transition"
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
        <div className="ml-4 pl-2 border-l border-gray-200 dark:border-gray-700 transition-all">
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
