"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const signInWithGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithGithub = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <button
        onClick={signInWithGoogle}
        disabled={loading || authLoading}
        className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in with Google"}
      </button>

      <button
        onClick={signInWithGithub}
        disabled={loading || authLoading}
        className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in with Github"}
      </button>
    </div>
  );
}
