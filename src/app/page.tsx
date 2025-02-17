import React from "react";
import { TranscriptProvider } from "@/app/contexts/TranscriptContext";
import { EventProvider } from "@/app/contexts/EventContext";
import ChatHub from "./App";

export default function Page() {
  return (
    <TranscriptProvider>
      <EventProvider>
        <ChatHub />
      </EventProvider>
    </TranscriptProvider>
  );
}
