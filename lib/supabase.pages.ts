import { createClient } from "./supabase/client";

export interface PageData {
  id: string;
  title?: string;
  content?: string;
  author_id?: string;
  parent_page_id?: string | null;
  deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export const createPage = async (
  userId: string,
  title: string = "Untitled",
  parentPageId: string | null = null
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pages")
    .insert([
      {
        title,
        content: "",
        author_id: userId,
        parent_page_id: parentPageId,
      },
    ])
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
};

export const getUserPages = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("author_id", userId)
    .eq("deleted", false);

  if (error) throw error;
  return data as PageData[];
};

/**
 * Real-time listener for user pages — used by Sidebar
 */
export const listenToUserPages = (
  userId: string,
  callback: (pages: PageData[]) => void
) => {
  const supabase = createClient();

  // Initial fetch
  getUserPages(userId)
    .then(callback)
    .catch((err) => {
      console.error("Initial fetch error:", err);
      callback([]);
    });

  // Subscribe to changes
  const channel = supabase
    .channel("pages_channel")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "pages",
        filter: `author_id=eq.${userId}`,
      },
      async () => {
        // Re-fetch all pages for simplicity to match previous behavior exactly
        try {
          const pages = await getUserPages(userId);
          callback(pages);
        } catch (err) {
          console.error("Refetch error:", err);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const getPageContent = async (pageId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("content, title")
    .eq("id", pageId)
    .single();

  if (error) return { content: "", title: "Untitled" };
  return {
    content: data.content || "",
    title: data.title || "Untitled",
  };
};

export const updatePageContent = async (
  pageId: string,
  content: string,
  title?: string
) => {
  const supabase = createClient();
  const updateData: { content: string; title?: string } = { content };
  if (title) updateData.title = title;

  const { error } = await supabase
    .from("pages")
    .update(updateData)
    .eq("id", pageId);

  if (error) throw error;
};

export const renamePage = async (pageId: string, title: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from("pages")
    .update({ title })
    .eq("id", pageId);

  if (error) throw error;
};

export const deletePage = async (pageId: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from("pages")
    .update({ deleted: true })
    .eq("id", pageId);

  if (error) throw error;
};
