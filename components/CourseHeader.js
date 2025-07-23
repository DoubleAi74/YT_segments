// components/CourseHeader.js
"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { BookOpen, LogOut, Download, LogIn, Menu } from "lucide-react";

export default function CourseHeader({
  courseTitle,
  completedCount,
  totalSegments,
  handleExportNotes,
  isGuestMode = false,
  onMenuClick,
}) {
  const { user, logout } = useAuth();

  return (
    <header className="flex-shrink-0 bg-surface-dark shadow-lg z-20">
      {/* Top bar: App Logo & User/Actions */}
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-surface-light/50">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-1 text-text-primary"
            aria-label="Open course menu"
          >
            <Menu size={24} />
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xl font-bold text-primary"
          >
            <BookOpen />
            <span className="hidden sm:inline">YT Course Taker</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {isGuestMode ? (
            <Link
              href="/account"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-background font-semibold rounded-md hover:bg-primary-dark transition-colors"
            >
              <LogIn size={18} />
              <span>Login to Save</span>
            </Link>
          ) : (
            <>
              <span className="text-text-secondary hidden sm:block">
                Welcome, {user?.email}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-error/80 text-white font-semibold rounded-md hover:bg-error transition-colors"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom bar: Course Title & Progress */}
      <div className="flex items-center justify-between h-12 px-4 sm:px-6">
        <h1
          className="text-lg font-bold text-text-primary truncate"
          title={courseTitle}
        >
          {courseTitle}
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportNotes}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export Notes</span>
          </button>
          <div className="text-sm font-semibold text-primary">
            {`${completedCount}/${totalSegments} Completed (${
              totalSegments > 0
                ? Math.round((completedCount / totalSegments) * 100)
                : 0
            }%)`}
          </div>
        </div>
      </div>
    </header>
  );
}
