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
  Menu,
  X,
  FileText,
  Folder,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
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
  const { theme } = useTheme();

  const [pages, setPages] = useState<PageNode[]>([]);
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Handle hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    // Close sidebar on mobile after creating
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
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
            onNavigate={() => {
              if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }}
          />
        ))}
      </SortableContext>
    );
  };

  const filteredPages = searchTerm ? filterPages(pages) : pages;

  if (!user) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
        aria-label="Open sidebar"
      >
        <Menu size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="w-72 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
              Your Pages
            </h2>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 md:hidden"
                aria-label="Close sidebar"
              >
                <X size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pages..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Create Button */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => handleCreate()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={16} />
              New Page
            </button>
          </div>

          {/* Pages List */}
          <div className="flex-1 overflow-y-auto p-2">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="space-y-1">
                {filteredPages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No pages found</p>
                  </div>
                ) : (
                  renderPages(filteredPages)
                )}
              </div>
            </DndContext>
          </div>
        </div>
      </div>
    </>
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
  onNavigate,
}: {
  page: PageNode;
  depth: number;
  collapsed: Record<string, boolean>;
  toggleCollapse: (id: string) => void;
  handleCreate: (parentId: string | null) => void;
  handleDelete: (id: string) => void;
  pathname: string;
  router: ReturnType<typeof useRouter>;
  onNavigate: () => void;
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
  };

  const isActive = pathname.includes(page.id);
  const hasChildren = page.children && page.children.length > 0;

  const handleClick = () => {
    router.push(`/editor/${page.id}`);
    onNavigate();
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        className={`group flex items-center justify-between py-2 px-3 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${
          isActive
            ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500"
            : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1" onClick={handleClick}>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(page.id);
              }}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {collapsed[page.id] ? (
                <ChevronRight size={14} className="text-gray-500" />
              ) : (
                <ChevronDown size={14} className="text-gray-500" />
              )}
            </button>
          )}
          
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasChildren ? (
              <Folder size={14} className="text-blue-500 flex-shrink-0" />
            ) : (
              <FileText size={14} className="text-gray-500 flex-shrink-0" />
            )}
            <span className={`truncate text-sm ${isActive ? 'font-medium text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
              {page.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 hover:text-green-700 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleCreate(page.id);
            }}
            title="Create sub-page"
          >
            <Plus size={14} />
          </button>
          <button
            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(page.id);
            }}
            title="Delete page"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {hasChildren && !collapsed[page.id] && (
        <div className="transition-all duration-200 ease-in-out">
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
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
