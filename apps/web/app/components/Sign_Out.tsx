"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { BACKEND_URL } from "../../config";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await axios.post(`${BACKEND_URL}/sign-out`, {}, { withCredentials: true });
    router.push("/signin");
  }

  return (
    <button
      onClick={handleSignOut}
      className="border border-stone-700 hover:border-red-400 hover:text-red-400 transition-all duration-300 px-5 py-2 rounded-full"
    >
      Sign Out
    </button>
  );
}
