// components/CourseViewer.js
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import YouTube from "react-youtube";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  BookOpen,
  LogOut,
  Download,
  LogIn,
} from "lucide-react";
import jsPDF from "jspdf";

const formatDuration = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function CourseViewer({
  initialCourseData,
  onSegmentChange,
  isGuestMode = false,
}) {
  const { user, logout } = useAuth(); // Get user and logout from context
  const [courseData, setCourseData] = useState(initialCourseData);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [activeNote, setActiveNote] = useState("");

  const playerRef = useRef(null);
  const segmentCheckInterval = useRef(null);
  const notesTimeout = useRef(null);

  const { title, segments, videoId } = courseData;
  const currentSegment = segments[currentSegmentIndex];

  useEffect(() => {
    if (currentSegment) setActiveNote(currentSegment.notes || "");
  }, [currentSegment]);

  useEffect(() => {
    if (notesTimeout.current) clearTimeout(notesTimeout.current);
    notesTimeout.current = setTimeout(() => {
      if (currentSegment && activeNote !== (currentSegment.notes || "")) {
        const updatedSegment = { ...currentSegment, notes: activeNote };
        if (!isGuestMode && onSegmentChange)
          onSegmentChange(currentSegmentIndex, updatedSegment);
      }
    }, 500);
    return () => clearTimeout(notesTimeout.current);
  }, [
    activeNote,
    currentSegment,
    currentSegmentIndex,
    onSegmentChange,
    isGuestMode,
  ]);

  const displaySegment = useCallback(
    (index) => {
      if (index >= 0 && index < segments.length && playerRef.current) {
        setCurrentSegmentIndex(index);
        const segment = segments[index];
        playerRef.current.seekTo(segment.start_seconds, true);
        playerRef.current.playVideo();
      }
    },
    [segments]
  );

  const handleStateChange = (event) => {
    if (event.data === 1) {
      // Playing
      if (segmentCheckInterval.current)
        clearInterval(segmentCheckInterval.current);
      const progressBar = document.getElementById("segment-progress-bar");
      segmentCheckInterval.current = setInterval(() => {
        const currentTime = event.target.getCurrentTime();
        if (progressBar && currentSegment?.duration_seconds > 0) {
          const timeInSegment = currentTime - currentSegment.start_seconds;
          const progressPercent = Math.max(
            0,
            Math.min(
              100,
              (timeInSegment / currentSegment.duration_seconds) * 100
            )
          );
          progressBar.style.width = `${progressPercent}%`;
        }
        if (currentTime >= currentSegment.end_seconds) {
          event.target.pauseVideo();
          if (progressBar) progressBar.style.width = "100%";
          clearInterval(segmentCheckInterval.current);
        }
      }, 250);
    } else {
      if (segmentCheckInterval.current)
        clearInterval(segmentCheckInterval.current);
    }
  };

  const handleToggleCompletion = useCallback(
    (indexToToggle) => {
      const seg = segments[indexToToggle];
      const updatedSegment = { ...seg, completed: !seg.completed };
      const updatedSegments = [...segments];
      updatedSegments[indexToToggle] = updatedSegment;

      setCourseData((prev) => ({ ...prev, segments: updatedSegments }));
      if (!isGuestMode && onSegmentChange)
        onSegmentChange(indexToToggle, updatedSegment);
    },
    [segments, isGuestMode, onSegmentChange]
  );

  const playNextAndComplete = () => {
    if (currentSegment && !currentSegment.completed) {
      handleToggleCompletion(currentSegmentIndex);
    }
    if (currentSegmentIndex < segments.length - 1) {
      displaySegment(currentSegmentIndex + 1);
    }
  };

  const handleExportNotes = () => {
    const doc = new jsPDF();
    let y = 15;
    const margin = 15;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
    doc.setFontSize(18);
    doc.text(title, margin, y);
    y += 10;
    segments.forEach((seg) => {
      if (seg.notes && seg.notes.trim() !== "") {
        if (y > 270) {
          doc.addPage();
          y = 15;
        }
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text(seg.title, margin, y);
        y += 7;
        doc.setFontSize(11);
        doc.setFont(undefined, "normal");
        const noteLines = doc.splitTextToSize(seg.notes, maxWidth);
        doc.text(noteLines, margin, y);
        y += noteLines.length * 5 + 5;
      }
    });
    doc.save(`${title.replace(/ /g, "_")}_notes.pdf`);
  };

  const completedCount = segments.filter((s) => s.completed).length;

  return (
    <div className="flex flex-col h-screen bg-background text-text-primary">
      {/* HEADER SECTION - BUILT DIRECTLY HERE */}
      <header className="flex-shrink-0 bg-surface-dark shadow-lg z-10 border-b border-surface-light/50">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <Link
            href={isGuestMode ? "/" : "/dashboard"}
            className="flex items-center gap-2 text-xl font-bold text-primary"
          >
            <BookOpen />
            <span>YT Course Taker</span>
          </Link>
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
      </header>

      <main className="flex-grow flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-[350px] flex-shrink-0 bg-surface border-r border-surface-light overflow-y-auto p-2">
          <h2 className="text-lg font-bold p-3 text-text-primary truncate">
            {title}
          </h2>
          <div className="border-t border-surface-light my-2"></div>
          {segments.map((seg, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer transition-colors ${
                index === currentSegmentIndex
                  ? "bg-primary/20 text-primary-dark font-semibold"
                  : "hover:bg-surface-light"
              }`}
              onClick={() => displaySegment(index)}
            >
              <span
                className={`flex-grow truncate pr-2 ${
                  seg.completed ? "text-text-secondary line-through" : ""
                }`}
              >
                {seg.title}
              </span>
              <span className="text-xs text-text-secondary font-mono ml-2 flex-shrink-0">
                {formatDuration(seg.duration_seconds)}
              </span>
            </div>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
              <div className="flex-grow">
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                  {currentSegment?.title}
                </h2>
                <div className="text-sm font-semibold text-primary mt-1">
                  {`${completedCount}/${segments.length} Completed (${
                    segments.length > 0
                      ? Math.round((completedCount / segments.length) * 100)
                      : 0
                  }%)`}
                </div>
              </div>
              <button
                onClick={() => handleToggleCompletion(currentSegmentIndex)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                  currentSegment?.completed
                    ? "bg-success text-background"
                    : "bg-surface-light hover:bg-surface-light/80 text-text-primary"
                }`}
              >
                {currentSegment?.completed ? (
                  <>
                    <CheckCircle size={18} /> Completed
                  </>
                ) : (
                  "Mark as Complete"
                )}
              </button>
            </div>

            <div className="w-full aspect-video bg-black rounded-xl shadow-2xl mb-4 overflow-hidden">
              <YouTube
                videoId={videoId}
                className="w-full h-full"
                onReady={(event) => {
                  playerRef.current = event.target;
                }}
                onStateChange={handleStateChange}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: {
                    playsinline: 1,
                    modestbranding: 1,
                    rel: 0,
                    autoplay: 1,
                    color: "white",
                  },
                }}
              />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => displaySegment(currentSegmentIndex - 1)}
                disabled={currentSegmentIndex === 0}
                className="p-2 rounded-full bg-surface shadow-md hover:bg-surface-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="w-full bg-surface-light rounded-full h-2 overflow-hidden">
                <div
                  id="segment-progress-bar"
                  className="bg-primary h-2 rounded-full transition-all duration-250"
                ></div>
              </div>
              <button
                onClick={playNextAndComplete}
                disabled={currentSegmentIndex >= segments.length - 1}
                className="p-2 rounded-full bg-surface shadow-md hover:bg-surface-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  My Notes
                </h3>
                <textarea
                  placeholder="Your notes for the current segment..."
                  value={activeNote}
                  onChange={(e) => setActiveNote(e.target.value)}
                  className="w-full min-h-[150px] p-4 bg-surface border border-surface-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition"
                />
              </div>

              <div className="bg-surface p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-primary">
                    Segment Summary
                  </h3>
                  <button
                    onClick={handleExportNotes}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    <Download size={16} />
                    <span>Export All Notes</span>
                  </button>
                </div>
                <ul className="text-text-secondary space-y-1 text-sm">
                  <li>
                    <strong className="text-text-primary">Starts:</strong>{" "}
                    {formatDuration(currentSegment?.start_seconds)}
                  </li>
                  <li>
                    <strong className="text-text-primary">Ends:</strong>{" "}
                    {formatDuration(currentSegment?.end_seconds)}
                  </li>
                  <li>
                    <strong className="text-text-primary">Duration:</strong>{" "}
                    {formatDuration(currentSegment?.duration_seconds)}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
