import React from "react";
import { AuthPortalSignIn } from "@/components/auth/SignInForm";
import { TranscriptProvider } from "@/app/contexts/TranscriptContext";
import { EventProvider } from "@/app/contexts/EventContext";
import ChatHub from "./App";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-[#111111] p-4 flex justify-between items-center z-50">
        <div>
          <Image src="/logo.png" alt="Mereka Logo" width={32} height={32} />
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="/" className="text-white hover:text-gray-300">Home</a>
            </li>
            <li>
              <a href="/about" className="text-white hover:text-gray-300">About</a>
            </li>
            <li>
              <a href="/contact" className="text-white hover:text-gray-300">Contact</a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="flex min-h-screen items-center justify-center pt-16">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
          <div className="mb-8 text-center">
            <Image src="/logo.png" alt="Mereka Logo" width={48} height={48} className="mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-600 mt-2">Sign in to access personalized career advice</p>
          </div>
          <AuthPortalSignIn />
          <p className="mt-6 text-center text-sm text-gray-600">
            New to Mereka?{' '}
            <a href="/signup" className="font-medium text-gray-900 hover:text-gray-700">
              Create an account
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
