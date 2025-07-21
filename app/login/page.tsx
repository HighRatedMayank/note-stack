"use client";
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, collection, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    providerData: Array<{ providerId: string }>;
  }

  const saveUserToFirestore = async (user: User) => {
    const userRef = doc(collection(db, "users"), user.uid);
  
    const existing = await getDoc(userRef);

    if (!existing.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        provider: user.providerData[0]?.providerId,
        createdAt: new Date(),
      });
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    auth.languageCode = "en";
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await saveUserToFirestore(user);
    
      router.push("/dashboard");
    } catch (err) {
      console.error("Google login error", err);
    }
  };

  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider();
    auth.languageCode = "en";
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      saveUserToFirestore(user);

      router.push("/dashboard");
    } catch (error) {
      console.error("Github login error", error);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <button
        onClick={signInWithGoogle}
        className="bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        Sign in with Google
      </button>

      <button
        onClick={signInWithGithub}
        className="bg-black text-white px-4 py-2 rounded-lg"
      >
        Sign in with Github
      </button>
    </div>
  );
}
/* Removed local doc function to avoid conflict with Firestore doc import */
