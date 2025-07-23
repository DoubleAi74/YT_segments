// app/dashboard/(main)/layout.js
"use client";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/account");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        Loading...
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-light-background">
        {/* <Navbar /> */}
        <main>{children}</main>
      </div>
    );
  }

  return null;
} // <--- This closing brace for the function was missing
