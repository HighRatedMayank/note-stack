"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { createPage, getUserPages } from "@/lib/firestore.pages";
import { Plus, FileText, LogOut, User, Calendar, Clock } from "lucide-react";
import FloatingActionButton from "../components/FloatingActionButton";
import { LoadingSpinner } from "../components/LoadingSpinner";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pages, setPages] = useState<{ id: string; title?: string; createdAt?: string }[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user]);

  useEffect(() => {
    if (user) loadPages();
  }, [user]);

  const loadPages = async () => {
    const userPages = await getUserPages(user!.uid);
    setPages(userPages);
  };

  const handleCreate = async () => {
    if (!user) {
      console.log("No user is authenticated");
      return;
    }
    const pageId = await createPage(user.uid);
    router.push(`/editor/${pageId}`);
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading || !user) {
    return <LoadingSpinner size="lg" text="Loading dashboard..." className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Welcome back!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {user.email}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 font-medium"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Quick Actions
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={handleCreate}
              className="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors duration-200">
                  <Plus size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    Create New Page
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Start writing something new
                  </p>
                </div>
              </div>
            </button>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <FileText size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Total Pages
                  </h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {pages.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Clock size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Last Updated
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {pages.length > 0 ? formatDate(pages[0]?.createdAt) : "Never"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Pages */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Recent Pages
            </h2>
            {pages.length > 0 && (
              <button
                onClick={() => router.push("/editor")}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
              >
                View All
              </button>
            )}
          </div>

          {pages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No pages yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Get started by creating your first page. Click the button below to begin writing.
              </p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <Plus size={18} />
                Create Your First Page
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.slice(0, 6).map((page) => (
                <div
                  key={page.id}
                  onClick={() => router.push(`/editor/${page.id}`)}
                  className="group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
                        {page.title || "Untitled Page"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(page.createdAt)}
                      </p>
                    </div>
                    <FileText size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton />
    </div>
  );
}
