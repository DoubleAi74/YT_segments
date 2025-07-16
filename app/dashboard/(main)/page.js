"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { PlusCircle, Trash2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteCourse = async (courseId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      try {
        await deleteDoc(doc(db, "courses", courseId));
      } catch (error) {
        console.error("Error deleting course: ", error);
        alert("Failed to delete course. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "courses"),
        where("userId", "==", user.uid)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const coursesData = [];
        querySnapshot.forEach((doc) => {
          coursesData.push({ id: doc.id, ...doc.data() });
        });
        setCourses(coursesData);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-light-text-subtle">
          Your Courses
        </h1>
        {/* THE FIX IS HERE */}
        <Link
          href="/dashboard/new-course"
          className="flex items-center gap-2 px-5 py-2 bg-primary text-background font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
        >
          <PlusCircle size={20} />
          <span>Add Course</span>
        </Link>
      </div>

      {loading && (
        <p className="text-center text-gray-500">Loading courses...</p>
      )}

      {!loading && courses.length === 0 && (
        <div className="text-center py-16 px-6 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Your dashboard is empty!
          </h2>
          <p className="text-gray-500">
            Click &apos;Add Course&apos; to save your first YouTube video.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => {
          const completedCount = course.segments.filter(
            (s) => s.completed
          ).length;
          const progressPercent =
            course.segments.length > 0
              ? Math.round((completedCount / course.segments.length) * 100)
              : 0;
          return (
            <div
              key={course.id}
              className="bg-surface rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col group relative transform hover:-translate-y-1"
            >
              <Link
                href={`/dashboard/course/${course.id}`}
                className="p-6 flex-grow flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-2 line-clamp-2">
                    {course.title}
                  </h2>
                  <p className="text-sm text-text-secondary mb-4">
                    {course.segments.length} segments
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-primary">
                      Progress
                    </span>
                    <span className="text-sm font-bold text-text-primary">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-light rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-success h-2 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCourse(course.id);
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-surface-light/50 text-text-secondary hover:bg-error hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                title="Delete Course"
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
