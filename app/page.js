import Link from "next/link";
import { PlayCircle, LogIn } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="text-center max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold text-text-primary leading-tight mb-4">
          Master Any Skill, One Chapter at a Time.
        </h1>
        <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
          Our app transforms any timestamped YouTube video into a structured,
          interactive course. Take notes, track your progress, and focus on what
          matters.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/try"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-background font-bold text-lg rounded-full shadow-lg hover:bg-primary-dark transition-all transform hover:scale-105"
          >
            <PlayCircle size={24} />
            Try a Demo
          </Link>
          <Link
            href="/account"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-surface-light text-text-primary font-bold text-lg rounded-full shadow-lg hover:bg-surface-light/80 transition-all transform hover:scale-105"
          >
            <LogIn size={24} />
            Login or Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
