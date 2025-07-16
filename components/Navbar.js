"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { BookOpen, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-surface-dark shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xl font-bold text-primary"
            >
              <BookOpen />
              <span>YT Course Taker</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-text-secondary hidden sm:block">
                Welcome, {user.email}
              </span>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-error/80 text-white font-semibold rounded-md hover:bg-error transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
