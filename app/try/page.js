"use client";
import { useState } from "react";
import CourseViewer from "@/components/CourseViewer";

export default function TryPage() {
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  const handleLoadCourse = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setCourseData(null);

    try {
      const response = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl: url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");
      setCourseData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (courseData) {
    // Pass isGuestMode, the viewer will handle the rest
    return <CourseViewer initialCourseData={courseData} isGuestMode={true} />;
  }

  // This is the initial URL input form
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Try a Demo</h1>
        <p className="text-text-secondary mb-8">
          Paste a YouTube URL with timestamps to start a guest session. Your
          progress won&apos;t be saved.
        </p>
        <form onSubmit={handleLoadCourse} className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-grow p-3 bg-surface border border-surface-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-primary text-background font-bold rounded-lg shadow-md hover:bg-primary-dark disabled:bg-surface-light transition-colors"
          >
            {isLoading ? "Loading..." : "Load"}
          </button>
        </form>
        {error && <p className="text-error mt-4">{error}</p>}
      </div>
    </div>
  );
}
