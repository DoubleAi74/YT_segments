"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function NewCardPage() {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Card text cannot be empty.");
      return;
    }
    if (!user) {
      setError("You must be logged in to save a card.");
      return;
    }

    try {
      await addDoc(collection(db, "cards"), {
        text: text,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to save the card. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Add a New Card</h1>
      <form onSubmit={handleSave} className="max-w-lg">
        <div className="mb-4">
          <label
            htmlFor="cardText"
            className="block text-gray-700 font-medium mb-2"
          >
            Card Content
          </label>
          <textarea
            id="cardText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your notes here..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows="4"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
        >
          Save Card
        </button>
      </form>
    </div>
  );
}
