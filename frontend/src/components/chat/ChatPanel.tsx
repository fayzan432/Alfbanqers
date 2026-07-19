"use client";

import { useEffect, useRef, useState } from "react";
import { MessageList, type LocalMessage } from "./MessageList";
import { TextInput } from "./TextInput";
import { VoiceButton } from "./VoiceButton";
import { Waveform } from "@/components/orb/Waveform";
import { useVoice } from "@/hooks/VoiceProvider";
import { useAppStore } from "@/store/useAppStore";

let idCounter = 0;
const nextId = () => `msg-${Date.now()}-${idCounter++}`;

export function ChatPanel() {
  const { transcript, lastReply, sendText, analyser } = useVoice();
  const orbState = useAppStore((s) => s.orbState);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const lastTranscriptRef = useRef("");
  const lastReplyRef = useRef("");

  useEffect(() => {
    if (transcript && transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      setMessages((prev) => [...prev, { id: nextId(), role: "user", content: transcript }]);
    }
  }, [transcript]);

  useEffect(() => {
    if (lastReply && lastReply !== lastReplyRef.current) {
      lastReplyRef.current = lastReply;
      setMessages((prev) => [...prev, { id: nextId(), role: "assistant", content: lastReply }]);
    }
  }, [lastReply]);

  const handleSend = (text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), role: "user", content: text }]);
    sendText(text);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      {orbState === "listening" && <Waveform analyser={analyser} active />}
      <div className="flex items-center gap-3">
        <VoiceButton />
        <div className="flex-1">
          <TextInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
