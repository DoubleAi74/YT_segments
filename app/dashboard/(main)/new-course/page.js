"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function NewCoursePage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      // Step 1: Get structured data from our API route
      const response = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl: url }),
      });
      const courseData = await response.json();
      if (!response.ok) {
        throw new Error(courseData.error || "Failed to process YouTube URL");
      }

      // Step 2: Save this structured data to Firestore
      await addDoc(collection(db, "courses"), {
        userId: user.uid,
        videoId: courseData.videoId,
        title: courseData.title,
        segments: courseData.segments, // This includes notes and completed status
        createdAt: serverTimestamp(),
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Add a New Course</h1>
      <form onSubmit={handleAddCourse} className="max-w-lg">
        <div className="mb-4">
          <label
            htmlFor="youtubeUrl"
            className="block text-gray-700 font-medium mb-2"
          >
            YouTube Video URL
          </label>
          <input
            type="text"
            id="youtubeUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a YouTube URL with timestamps"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-500"
        >
          {isLoading ? "Processing..." : "Save Course"}
        </button>
      </form>
    </div>
  );
}
