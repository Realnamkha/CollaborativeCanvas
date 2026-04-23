"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BACKEND_URL } from "../../config";

export function CreateRoomButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${BACKEND_URL}/room`,
        { name },
        { withCredentials: true }
      );

      const slug = response.data.slug;
      router.push(`/room/${slug}`);
    } catch (e: any) {
      console.error("Create room error:", e.response?.data); // ✅ see real error
      setError("Failed to create room. Please try again.");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-stone-100 font-semibold px-7 py-4 rounded-full transition-all duration-300 text-sm uppercase tracking-wider"
      >
        Create Room
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <h2 className="text-xl font-black text-stone-100 mb-1 tracking-tight">
            Create a room
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            Give your room a name to get started.
          </p>

          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="e.g. design-team"
            className="w-full bg-stone-800 border border-stone-700 focus:border-orange-500 focus:outline-none px-4 py-3 rounded-xl text-sm text-stone-200 placeholder-stone-600 transition-colors duration-300 mb-3"
          />

          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 border border-stone-700 hover:border-stone-500 text-stone-400 hover:text-stone-200 font-semibold px-4 py-3 rounded-xl transition-all duration-300 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold px-4 py-3 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
