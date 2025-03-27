'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Switch } from '@/components/ui/Switch';
import { Avatar } from '@/components/ui/Avatar';
import { ScrollArea } from '@/components/ui/ScrollArea';

// Types
import { AgentConfig, SessionStatus } from "@/app/types";

// Context providers & hooks
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useEvent } from "@/app/contexts/EventContext";
import { useHandleServerEvent } from "@/app/hooks/useHandleServerEvent";

// Utilities
import { createRealtimeConnection } from "@/app/lib/realtimeConnection";

// Agent configs
import { allAgentSets, defaultAgentSetKey } from "@/app/agentConfigs";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export function ChatDashboard() {
  const searchParams = useSearchParams();
  const { transcriptItems, addTranscriptMessage, addTranscriptBreadcrumb } = useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();

  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [tempPromptValue, setTempPromptValue] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isJsonPreviewOpen, setIsJsonPreviewOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  // OpenAI Realtime States
  const [selectedAgentName, setSelectedAgentName] = useState<string>("");
  const [selectedAgentConfigSet, setSelectedAgentConfigSet] = useState<AgentConfig[] | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  const [isPTTActive, setIsPTTActive] = useState<boolean>(false);
  const [isPTTUserSpeaking, setIsPTTUserSpeaking] = useState<boolean>(false);
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] = useState<boolean>(true);

  // New state variables
  const [activeView, setActiveView] = useState<'jobs' | 'talents'>('jobs');
  const [sortBy, setSortBy] = useState<'matchScore' | 'experience' | 'rating'>('matchScore');

  // Load saved preferences
  useEffect(() => {
    const storedPTT = localStorage.getItem("pushToTalkUI");
    if (storedPTT) {
      setIsPTTActive(storedPTT === "true");
    }
    const storedAudioPlayback = localStorage.getItem("audioPlaybackEnabled");
    if (storedAudioPlayback) {
      setIsAudioPlaybackEnabled(storedAudioPlayback === "true");
    }
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem("pushToTalkUI", isPTTActive.toString());
  }, [isPTTActive]);

  useEffect(() => {
    localStorage.setItem("audioPlaybackEnabled", isAudioPlaybackEnabled.toString());
  }, [isAudioPlaybackEnabled]);

  // Handle audio playback changes
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.autoplay = isAudioPlaybackEnabled;
      if (isAudioPlaybackEnabled) {
        audioElementRef.current.play().catch((err) => {
          console.warn("Autoplay may be blocked by browser:", err);
        });
      } else {
        audioElementRef.current.pause();
      }
    }
  }, [isAudioPlaybackEnabled]);

  const sendClientEvent = (eventObj: any, eventNameSuffix = "") => {
    if (dcRef.current && dcRef.current.readyState === "open") {
      logClientEvent(eventObj, eventNameSuffix);
      dcRef.current.send(JSON.stringify(eventObj));
    } else {
      logClientEvent(
        { attemptedEvent: eventObj.type },
        "error.data_channel_not_open"
      );
      console.error(
        "Failed to send message - no data channel available",
        eventObj
      );
    }
  };

  const handleServerEventRef = useHandleServerEvent({
    setSessionStatus,
    selectedAgentName,
    selectedAgentConfigSet,
    sendClientEvent,
    setSelectedAgentName,
    onGeneratedContent: (content: any) => {
      setGeneratedContent(content);
    },
  });

  useEffect(() => {
    let finalAgentConfig = searchParams.get("agentConfig");
    if (!finalAgentConfig || !allAgentSets[finalAgentConfig]) {
      finalAgentConfig = defaultAgentSetKey;
      const url = new URL(window.location.toString());
      url.searchParams.set("agentConfig", finalAgentConfig);
      window.location.replace(url.toString());
      return;
    }

    const agents = allAgentSets[finalAgentConfig];
    const agentKeyToUse = agents[0]?.name || "";

    setSelectedAgentName(agentKeyToUse);
    setSelectedAgentConfigSet(agents);
  }, [searchParams]);

  useEffect(() => {
    if (selectedAgentName && sessionStatus === "DISCONNECTED") {
      connectToRealtime();
    }
  }, [selectedAgentName]);

  useEffect(() => {
    if (
      sessionStatus === "CONNECTED" &&
      selectedAgentConfigSet &&
      selectedAgentName
    ) {
      const currentAgent = selectedAgentConfigSet.find(
        (a) => a.name === selectedAgentName
      );
      addTranscriptBreadcrumb(
        `Agent: ${selectedAgentName}`,
        currentAgent
      );
      updateSession(true);
    }
  }, [selectedAgentConfigSet, selectedAgentName, sessionStatus]);

  const fetchEphemeralKey = async (): Promise<string | null> => {
    logClientEvent({ url: "/session" }, "fetch_session_token_request");
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    logServerEvent(data, "fetch_session_token_response");

    if (!data.client_secret?.value) {
      logClientEvent(data, "error.no_ephemeral_key");
      console.error("No ephemeral key provided by the server");
      setSessionStatus("DISCONNECTED");
      return null;
    }

    return data.client_secret.value;
  };

  const stopMicrophoneStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }
  };

  const setupMicrophoneStream = async () => {
    try {
      if (!isPTTActive) {
        stopMicrophoneStream();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      if (pcRef.current) {
        const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'audio');
        if (sender) {
          await sender.replaceTrack(stream.getTracks()[0]);
        } else {
          pcRef.current.addTrack(stream.getTracks()[0]);
        }
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setIsPTTActive(false);
    }
  };

  // Effect to handle microphone stream when PTT is toggled
  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      setupMicrophoneStream();
    }
    return () => {
      stopMicrophoneStream();
    };
  }, [isPTTActive, sessionStatus]);

  const connectToRealtime = async () => {
    if (sessionStatus !== "DISCONNECTED") return;
    setSessionStatus("CONNECTING");

    try {
      const EPHEMERAL_KEY = await fetchEphemeralKey();
      if (!EPHEMERAL_KEY) {
        return;
      }

      if (!audioElementRef.current) {
        audioElementRef.current = document.createElement("audio");
      }
      audioElementRef.current.autoplay = isAudioPlaybackEnabled;

      // Only get media stream if PTT is active
      let ms: MediaStream | null = null;
      if (isPTTActive) {
        try {
          ms = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = ms;
        } catch (err) {
          console.error('Error accessing microphone:', err);
          setIsPTTActive(false);
        }
      }

      const { pc, dc } = await createRealtimeConnection(
        EPHEMERAL_KEY,
        audioElementRef,
        ms
      );
      pcRef.current = pc;
      dcRef.current = dc;

      dc.addEventListener("open", () => {
        logClientEvent({}, "data_channel.open");
      });
      dc.addEventListener("close", () => {
        logClientEvent({}, "data_channel.close");
      });
      dc.addEventListener("error", (err: any) => {
        logClientEvent({ error: err }, "data_channel.error");
      });
      dc.addEventListener("message", (e: MessageEvent) => {
        handleServerEventRef.current(JSON.parse(e.data));
      });

      setDataChannel(dc);
    } catch (err) {
      console.error("Error connecting to realtime:", err);
      setSessionStatus("DISCONNECTED");
      stopMicrophoneStream();
    }
  };

  const disconnectFromRealtime = () => {
    stopMicrophoneStream();
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });

      pcRef.current.close();
      pcRef.current = null;
    }
    setDataChannel(null);
    setSessionStatus("DISCONNECTED");
    setIsPTTUserSpeaking(false);

    logClientEvent({}, "disconnected");
  };

  const updateSession = (shouldTriggerResponse: boolean = false) => {
    sendClientEvent(
      { type: "input_audio_buffer.clear" },
      "clear audio buffer on session update"
    );

    const currentAgent = selectedAgentConfigSet?.find(
      (a) => a.name === selectedAgentName
    );

    const turnDetection = isPTTActive
      ? null
      : {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 200,
          create_response: true,
        };

    const instructions = currentAgent?.instructions || "";
    const tools = currentAgent?.tools || [];

    const sessionUpdateEvent = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        instructions,
        voice: "coral",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: { model: "whisper-1" },
        turn_detection: turnDetection,
        tools,
      },
    };

    sendClientEvent(sessionUpdateEvent);

    if (shouldTriggerResponse) {
      sendSimulatedUserMessage("hi");
    }
  };

  const sendSimulatedUserMessage = (text: string) => {
    const id = uuidv4().slice(0, 32);
    addTranscriptMessage(id, "user", text, true);

    sendClientEvent(
      {
        type: "conversation.item.create",
        item: {
          id,
          type: "message",
          role: "user",
          content: [{ type: "input_text", text }],
        },
      },
      "(simulated user text message)"
    );
    sendClientEvent(
      { type: "response.create" },
      "(trigger response after simulated user text message)"
    );
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    if (sessionStatus === "CONNECTED" && dcRef.current?.readyState === "open") {
      // Send message through OpenAI Realtime
      const id = uuidv4().slice(0, 32);
      addTranscriptMessage(id, "user", inputMessage.trim(), true);

      sendClientEvent(
        {
          type: "conversation.item.create",
          item: {
            id,
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: inputMessage.trim() }],
          },
        },
        "(send user text message)"
      );

      sendClientEvent({ type: "response.create" }, "trigger response");
    } else {
      // Fallback to simple chat
      const newMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage.trim(),
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Simulate agent response
      setIsTyping(true);
      setTimeout(() => {
        const agentMessage: Message = {
          id: Date.now().toString(),
          content: 'Thank you for your message. This is a simulated response.',
          sender: 'agent',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentMessage]);
        setIsTyping(false);
      }, 1000);
    }
    
    setInputMessage('');
  };

  const handleTalkButtonDown = () => {
    if (sessionStatus !== "CONNECTED" || dataChannel?.readyState !== "open") return;

    // Cancel any ongoing assistant speech
    const mostRecentAssistantMessage = [...transcriptItems]
      .reverse()
      .find((item) => item.role === "assistant");

    if (mostRecentAssistantMessage && mostRecentAssistantMessage.status !== "DONE") {
      sendClientEvent({
        type: "conversation.item.truncate",
        item_id: mostRecentAssistantMessage.itemId,
        content_index: 0,
        audio_end_ms: Date.now() - mostRecentAssistantMessage.createdAtMs,
      });
      sendClientEvent({ type: "response.cancel" }, "(cancel due to user PTT)");
    }

    setIsPTTUserSpeaking(true);
    sendClientEvent({ type: "input_audio_buffer.clear" }, "clear PTT buffer");

    // Add visual feedback
    if (document.querySelector('[data-ptt-button]')) {
      document.querySelector('[data-ptt-button]')?.classList.add('bg-blue-100', 'ring-2', 'ring-blue-400');
    }
  };

  const handleTalkButtonUp = () => {
    if (sessionStatus !== "CONNECTED" || dataChannel?.readyState !== "open" || !isPTTUserSpeaking) return;

    setIsPTTUserSpeaking(false);
    sendClientEvent({ type: "input_audio_buffer.commit" }, "commit PTT");
    sendClientEvent({ type: "response.create" }, "trigger response PTT");

    // Remove visual feedback
    if (document.querySelector('[data-ptt-button]')) {
      document.querySelector('[data-ptt-button]')?.classList.remove('bg-blue-100', 'ring-2', 'ring-blue-400');
    }
  };

  // Add keyboard shortcut for PTT
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isPTTActive && !isPTTUserSpeaking && !e.repeat) {
        e.preventDefault();
        handleTalkButtonDown();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isPTTActive && isPTTUserSpeaking) {
        e.preventDefault();
        handleTalkButtonUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPTTActive, isPTTUserSpeaking]);

  const onToggleConnection = () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnectFromRealtime();
      setSessionStatus("DISCONNECTED");
    } else {
      connectToRealtime();
    }
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAgentConfig = e.target.value;
    const url = new URL(window.location.toString());
    url.searchParams.set("agentConfig", newAgentConfig);
    window.location.replace(url.toString());
  };

  const handleSelectedAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAgentName = e.target.value;
    setSelectedAgentName(newAgentName);
  };

  const agentSetKey = searchParams.get("agentConfig") || "default";
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  const handleEditPrompt = () => {
    const currentInstructions = selectedAgentConfigSet?.find(a => a.name === selectedAgentName)?.instructions || "";
    setTempPromptValue(currentInstructions);
    setIsEditingPrompt(true);
  };

  const handleSavePrompt = async () => {
    if (!selectedAgentName || !tempPromptValue.trim()) return;
    
    try {
      const response = await fetch('/api/updateAgentPrompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentName: selectedAgentName,
          newInstructions: tempPromptValue
        }),
      });

      if (response.ok) {
        // Update the agent config in memory
        if (selectedAgentConfigSet) {
          const updatedAgents = selectedAgentConfigSet.map(agent => {
            if (agent.name === selectedAgentName) {
              return { ...agent, instructions: tempPromptValue };
            }
            return agent;
          });
          setSelectedAgentConfigSet(updatedAgents);
        }
        setIsEditingPrompt(false);
      } else {
        console.error('Failed to save prompt');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  const handlePreviewPrompt = () => {
    const currentInstructions = isEditingPrompt 
      ? tempPromptValue 
      : selectedAgentConfigSet?.find(a => a.name === selectedAgentName)?.instructions || "";
    setTempPromptValue(currentInstructions);
    setIsPreviewOpen(true);
  };

  const handleDownloadPrompt = () => {
    const currentInstructions = isEditingPrompt 
      ? tempPromptValue 
      : selectedAgentConfigSet?.find(a => a.name === selectedAgentName)?.instructions || "";
    
    const blob = new Blob([currentInstructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedAgentName}-prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Preview Agent's Prompt</h3>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                {tempPromptValue}
              </pre>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={handleDownloadPrompt}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </Button>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Preview Modal */}
      {isJsonPreviewOpen && generatedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">JSON Preview</h3>
              <Button variant="ghost" onClick={() => setIsJsonPreviewOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                {JSON.stringify(generatedContent, null, 2)}
              </pre>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy
              </Button>
              <Button variant="outline" onClick={() => {
                const blob = new Blob([JSON.stringify(generatedContent, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'generated-content.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download JSON
              </Button>
              <Button variant="outline" onClick={() => setIsJsonPreviewOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-2rem)]">
          {/* Chat Panel - Left */}
          <Card className="col-span-12 lg:col-span-4 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Realtime Chat</h2>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {transcriptItems.map((item) => {
                  if (item.type === "MESSAGE" && !item.isHidden) {
                    const isUser = item.role === "user";
                    return (
                      <div
                        key={item.itemId}
                        className={`flex ${
                          isUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className="flex items-start gap-2 max-w-[80%]">
                          {!isUser && (
                            <Avatar className="w-8 h-8 flex-shrink-0" />
                          )}
                          <div
                            className={`rounded-lg p-3 ${
                              isUser
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100'
                            }`}
                          >
                            <p className="break-words">{item.title}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {item.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
                {isTyping && (
                  <div className="text-sm text-gray-500">Agent is typing...</div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputMessage.trim()) {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputMessage.trim() || (sessionStatus === "CONNECTED" && !dcRef.current?.readyState)}
                >
                  Send
                </Button>
              </div>
              
              {/* Voice Controls */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="push-to-talk"
                      checked={isPTTActive}
                      onCheckedChange={(checked) => {
                        setIsPTTActive(checked);
                        if (!checked) {
                          setIsPTTUserSpeaking(false);
                        }
                      }}
                      disabled={!isConnected}
                    />
                    <label htmlFor="push-to-talk" className="text-sm font-medium">
                      Push to talk {isPTTActive && <span className="text-xs text-gray-500">(Space)</span>}
                    </label>
                  </div>
                  <Button
                    data-ptt-button
                    variant="outline"
                    onMouseDown={handleTalkButtonDown}
                    onMouseUp={handleTalkButtonUp}
                    onTouchStart={handleTalkButtonDown}
                    onTouchEnd={handleTalkButtonUp}
                    onMouseLeave={() => {
                      if (isPTTUserSpeaking) {
                        handleTalkButtonUp();
                      }
                    }}
                    disabled={!isPTTActive || !isConnected}
                    className={`transition-all duration-150 ${
                      isPTTUserSpeaking 
                        ? 'bg-blue-100 ring-2 ring-blue-400' 
                        : !isPTTActive || !isConnected 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-gray-100'
                    }`}
                  >
                    {isPTTUserSpeaking ? 'Speaking...' : 'Talk'}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="audio-playback"
                    checked={isAudioPlaybackEnabled}
                    onCheckedChange={setIsAudioPlaybackEnabled}
                    disabled={!isConnected}
                  />
                  <label htmlFor="audio-playback" className="text-sm font-medium">
                    Audio {isAudioPlaybackEnabled && <span className="text-xs text-gray-500">(Agent voice)</span>}
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Logs and Agent Panel - Center */}
          <Card className="col-span-12 lg:col-span-4 overflow-hidden">
            <Tabs defaultValue="logs" className="h-full flex flex-col">
              <div className="px-4 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="logs" className="flex-1">Realtime Logs</TabsTrigger>
                  <TabsTrigger value="agent" className="flex-1">Current Agent</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="logs" className="flex-1 p-4">
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      [9:40:46 AM] Session started
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="agent" className="flex-1 p-4">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-4">Agent Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Connection Status</span>
                        <span className="font-medium">{sessionStatus}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Selected Agent</span>
                        <span className="font-medium">{selectedAgentName || "None"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Generated Listing - Right */}
          <Card className="col-span-12 lg:col-span-4 flex flex-col overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Generated Listing</h2>
                {generatedContent && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsJsonPreviewOpen(true)}
                      className="hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(generatedContent, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'generated-content.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <select
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2.5 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-colors cursor-pointer"
                    onChange={(e) => setActiveView(e.target.value as 'jobs' | 'talents')}
                    value={activeView}
                  >
                    <option value="jobs">Job Postings</option>
                    <option value="talents">Matched Talents</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {activeView === 'talents' && (
                  <div className="relative flex-1">
                    <select
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2.5 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-colors cursor-pointer"
                      onChange={(e) => setSortBy(e.target.value as 'matchScore' | 'experience' | 'rating')}
                      value={sortBy}
                    >
                      <option value="matchScore">Sort by Match Score</option>
                      <option value="experience">Sort by Experience</option>
                      <option value="rating">Sort by Rating</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {generatedContent ? (
                  <div className="relative">
                    {activeView === 'jobs' ? (
                      // Job Postings View
                      <div className="space-y-4">
                        <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
                          {JSON.stringify(generatedContent, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      // Matched Talents View
                      <div className="space-y-6">
                        {Array.isArray(generatedContent.matchedTrainers) ? (
                          generatedContent.matchedTrainers.map((trainer: any, index: number) => (
                            <div 
                              key={trainer.trainerId || index} 
                              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900">{trainer.profile.fullName}</h3>
                                  <p className="text-gray-600 mt-1">{trainer.profile.currentTitle}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    Match: {trainer.matchScore}/10
                                  </span>
                                  {trainer.profile.verificationStatus && (
                                    <span className="text-green-600 bg-green-50 p-1.5 rounded-full">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {trainer.profile.location}
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Skills & Expertise</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {trainer.profile.relevantSkills?.map((skill: string, idx: number) => (
                                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                {trainer.profile.trainingHistory && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Trainings</h4>
                                    <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                                      {trainer.profile.trainingHistory.slice(0, 3).map((training: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                          <span className="text-gray-700">{training.title}</span>
                                          <span className="flex items-center text-yellow-600 font-medium">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {training.rating.toFixed(1)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="mt-4 pt-4 border-t">
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Match Analysis</h4>
                                  <p className="text-sm text-gray-600">
                                    {trainer.matchReasoning}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-gray-400 mb-3">
                              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                            </div>
                            <p className="text-gray-500 text-sm">No matched talents found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">
                      No generated content yet. Start a conversation with an agent to generate structured output.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Features & Status - Bottom Left */}
          <Card className="col-span-12 lg:col-span-6 p-6">
            <h2 className="text-xl font-semibold mb-6">Features & Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label htmlFor="connection-status" className="font-medium">Connection</label>
                  <Switch 
                    id="connection-status"
                    checked={sessionStatus === "CONNECTED"}
                    onCheckedChange={onToggleConnection}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="visualization" className="font-medium">Visualization</label>
                  <Switch 
                    id="visualization"
                    checked={false}
                    onCheckedChange={() => {}}
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Open AI Key</label>
                  <Input type="password" placeholder="Enter your OpenAI API key" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Agents</label>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <select
                        value={selectedAgentName}
                        onChange={handleSelectedAgentChange}
                        className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-3 px-4 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 hover:border-gray-300 transition-colors"
                      >
                        {selectedAgentConfigSet?.map(agent => (
                          <option key={agent.name} value={agent.name}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Agent's Prompt - Bottom Right */}
          <Card className="col-span-12 lg:col-span-6 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Agent's Prompt</h2>
              <Button variant="outline" onClick={handleDownloadPrompt} size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </Button>
            </div>
            <div className="space-y-4">
              <textarea
                className="w-full min-h-[120px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter agent's prompt..."
                value={isEditingPrompt ? tempPromptValue : (selectedAgentConfigSet?.find(a => a.name === selectedAgentName)?.instructions || "")}
                onChange={(e) => isEditingPrompt && setTempPromptValue(e.target.value)}
                readOnly={!isEditingPrompt}
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handlePreviewPrompt}>Preview</Button>
                {!isEditingPrompt ? (
                  <Button variant="outline" onClick={handleEditPrompt}>Edit</Button>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditingPrompt(false)}>Cancel</Button>
                )}
                <Button onClick={handleSavePrompt} disabled={!isEditingPrompt}>Save</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 