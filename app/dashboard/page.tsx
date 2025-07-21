"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { createPage, getUserPages } from "@/lib/firestore.pages";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pages, setPages] = useState<{ id: string; title?: string }[]>([]);

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

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
      <button
        onClick={handleSignOut}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Sign Out
      </button>

      <div className="mt-6">
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create New Page
        </button>

        <div className="mt-4">
          {pages.length === 0 ? (
            <p className="text-gray-500">No pages yet.</p>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="border p-2 mt-2">
                <p>{page.title || "Untitled Page"}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
