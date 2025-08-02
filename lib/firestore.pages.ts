import { db } from "./firebase";
import { collection, addDoc, Timestamp, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";

export const createPage = async (userId: string, title: string = "Untitled") => {
  const pagesRef = await addDoc(collection(db, "pages"), {
    title,
    content: "",
    authorId: userId,
    parentPageId: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return pagesRef.id;
};

export const getUserPages = async (userId: string) => {
    const q = query(collection(db, "pages"), where("authorId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export const getPageContent = async (pageId: string) => {
  const docRef = doc(db, "pages", pageId);
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return docSnap.data().content || "";
  }
  return "";
}

export const updatePageContent = async (
  pageId: string,
  content: string,
  title?: string
) => {
  const docRef = doc(db, "pages", pageId);
  await setDoc(
    docRef,
    {
      content,
      updatedAt: Timestamp.now(),
      ...(title && { title }),
    },
    { merge: true }
  );
};