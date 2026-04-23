"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../config";

interface AuthPageProps {
  isSignin: boolean;
}

export function AuthPage({ isSignin }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleAuth() {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = isSignin ? "/sign-in" : "/sign-up";
      const response = await axios.post(`${BACKEND_URL}${endpoint}`, {
        email,
        password,
      });

      console.log(response.data);

      // Redirect to home page after successful login/signup
      router.push("/");
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          {isSignin ? "Sign In" : "Sign Up"}
        </h2>
        <p className="text-gray-500 text-center text-sm">
          {isSignin
            ? "Welcome back! Please enter your details to sign in."
            : "Create your account to get started."}
        </p>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 text-red-700 text-center p-2 rounded">
            {error}
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleAuth}
          disabled={loading || !email || !password}
          className={`w-full text-white font-semibold py-3 rounded-2xl shadow-md transition transform hover:-translate-y-1
            ${
              loading || !email || !password
                ? "bg-orange-400 cursor-not-allowed hover:bg-orange-400"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
        >
          {loading ? "Please wait..." : isSignin ? "Sign In" : "Sign Up"}
        </button>

        {/* Footer Links */}
        <p className="text-center text-gray-500 text-sm">
          {isSignin ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link
            href={isSignin ? "/signup" : "/signin"}
            className="text-orange-600 hover:underline font-medium"
          >
            {isSignin ? "Sign Up" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
  );
}
