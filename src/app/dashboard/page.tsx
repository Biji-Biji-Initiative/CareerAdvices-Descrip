import React from "react";
import { TranscriptProvider } from "@/app/contexts/TranscriptContext";
import { EventProvider } from "@/app/contexts/EventContext";
import ChatHub from "../App";
import Image from "next/image";

export default function DashboardPage() {
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

      <main className="pt-16 h-screen">
        <TranscriptProvider>
          <EventProvider>
            <ChatHub />
          </EventProvider>
        </TranscriptProvider>
      </main>
    </div>
  );
} 