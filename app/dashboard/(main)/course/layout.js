// app/dashboard/(main)/course/layout.js

"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This layout is specifically for the course viewing pages.
// It ensures the user is logged in but DOES NOT render the generic <Navbar />.
// This prevents the "double header" issue.

export default function CourseLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This logic is copied from the main dashboard layout to keep these pages protected.
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

  // If the user is authenticated, render the page's content directly.
  // No extra <Navbar> or <main> tag is needed here, as the page itself
  // provides the full-screen structure.
  if (user) {
    return <>{children}</>;
  }

  // If loading is done and there's no user, return null while redirecting.
  return null;
}
