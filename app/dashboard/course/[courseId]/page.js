"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import CourseViewer from "@/components/CourseViewer";
// CHANGE 1: Import useParams along with useRouter
import { useRouter, useParams } from "next/navigation";

// CHANGE 2: The component no longer needs to accept a 'params' prop
export default function CoursePage() {
  const { user } = useAuth();
  const router = useRouter();

  // CHANGE 3: Get the courseId using the useParams hook
  // This is the idiomatic way for Client Components.
  const params = useParams();
  const courseId = params.courseId;

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // The rest of the logic remains exactly the same!
  useEffect(() => {
    if (!user || !courseId) return;

    const fetchCourse = async () => {
      setLoading(true);
      setError("");
      const docRef = doc(db, "courses", courseId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().userId === user.uid) {
        setCourseData({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Course not found or you do not have permission to view it.");
        setTimeout(() => router.push("/dashboard"), 3000);
      }
      setLoading(false);
    };

    fetchCourse();
  }, [user, courseId, router]);

  const handleSegmentUpdate = async (segmentIndex, updatedSegment) => {
    if (!courseData) return;

    const newSegments = [...courseData.segments];
    newSegments[segmentIndex] = updatedSegment;

    setCourseData({ ...courseData, segments: newSegments });

    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      segments: newSegments,
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading Course...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500 font-bold p-4 text-center">
        {error}
      </div>
    );
  }

  if (courseData) {
    return (
      <CourseViewer
        initialCourseData={courseData}
        onSegmentChange={handleSegmentUpdate}
        isGuestMode={false}
      />
    );
  }

  return null;
}
