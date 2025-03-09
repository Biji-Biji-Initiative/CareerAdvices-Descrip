import React from "react";
import { AuthPortalSignIn } from "@/components/auth/SignInForm";
import { TranscriptProvider } from "@/app/contexts/TranscriptContext";
import { EventProvider } from "@/app/contexts/EventContext";
import ChatHub from "./App";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-sm">
        <div className="mb-8 text-center">
          <img 
            src="https://cdn.brandfetch.io/idP99DVbZ3/theme/dark/logo.svg" 
            alt="Mereka Logo" 
            className="h-12 w-auto mx-auto mb-4"
          />
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
    </div>
  );
}
