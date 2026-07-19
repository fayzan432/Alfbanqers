"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [loading, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-3 w-3 animate-pulse-slow rounded-full bg-primary shadow-[0_0_20px_theme(colors.primary.DEFAULT)]" />
    </div>
  );
}
