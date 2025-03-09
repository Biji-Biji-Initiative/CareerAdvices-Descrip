'use client';

import { ChatDashboard } from '@/components/ChatDashboard';
import { TranscriptProvider } from '@/app/contexts/TranscriptContext';
import { EventProvider } from '@/app/contexts/EventContext';

export default function DashboardPage() {
  return (
    <TranscriptProvider>
      <EventProvider>
        <main className="min-h-screen">
          <ChatDashboard />
        </main>
      </EventProvider>
    </TranscriptProvider>
  );
} 