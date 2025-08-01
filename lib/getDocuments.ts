import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export type DocNode = {
  id: string;
  title: string;
  isFolder: boolean;
  parentId: string | null;
  children: DocNode[];
};

export async function getUserDocuments(userId: string) {
  const snapshot = await getDocs(collection(db, "users", userId, "documents"));

  const flat: Record<string, DocNode> = {};
  const roots: DocNode[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    flat[doc.id] = {
      id: doc.id,
      title: data.title || "Untitled",
      isFolder: data.isFolder || false,
      parentId: data.parentId || null,
      children: [],
    };
  });

  Object.values(flat).forEach(doc => {
    if (doc.parentId && flat[doc.parentId]) {
      flat[doc.parentId].children.push(doc);
    } else {
      roots.push(doc);
    }
  });

  return roots;
}
