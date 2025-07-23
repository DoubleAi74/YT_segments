// app/dashboard/(main)/course/[courseId]/page.js

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import CourseHeader from "@/components/CourseHeader";
import CourseViewer from "@/components/CourseViewer";
import { useRouter, useParams } from "next/navigation";
import jsPDF from "jspdf";

export default function CoursePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId;

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleExportNotes = () => {
    if (!courseData) return;
    const { title, segments } = courseData;
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
    const completedCount = courseData.segments.filter(
      (s) => s.completed
    ).length;

    return (
      <div className="flex flex-col h-screen bg-background text-text-primary">
        <CourseHeader
          courseTitle={courseData.title}
          completedCount={completedCount}
          totalSegments={courseData.segments.length}
          handleExportNotes={handleExportNotes}
          isGuestMode={false}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <CourseViewer
          initialCourseData={courseData}
          onSegmentChange={handleSegmentUpdate}
          isGuestMode={false}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>
    );
  }

  return null;
}
