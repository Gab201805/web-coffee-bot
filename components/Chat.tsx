"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MessageBubble } from "./MessageBubble";

type Role = "user" | "bot";

interface Message {
  id: string;
  role: Role;
  text: string;
}

interface ChatResponse {
  reply: string;
  suggestions?: string[];
}

interface ChatProps {
  onOpenMap?: () => void;
  compact?: boolean;
}

export function Chat({ onOpenMap, compact }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: `Choose what you'd like to do or simply ask us.👇`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>([
    "See our roasts",
    "Order our roasts",
    "World of coffee",
    "Contact us",
  ]);

  // Map is handled by parent as a page background

  const handleSuggestionClick = (s: string) => {
    if (s === "See our roasts") {
      onOpenMap?.();
      return;
    }
    sendMessage(s);
  };

  const callChatApi = async (text: string) => {
    setIsSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error("Failed to send");
      }

      const data: ChatResponse = await res.json();

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        text: data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "bot",
          text: "Sorry, something went wrong talking to the coffee brain 😅",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const rawText = overrideText ?? input;
    const trimmed = rawText.trim();
    if (!trimmed || isSending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    await callChatApi(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // Use same height whether compact or not to keep consistent sizing
  // Reduce height on small screens; keep current on sm+ screens
  const panelHeight = 'h-[280px] sm:h-[380px]';

  return (
    <div className={`relative ${panelHeight} flex flex-col border border-neutral-200 rounded-lg bg-neutral-50`}>
      <div className="flex-1 overflow-y-auto p-5 space-y-2">
        {messages.map(m => <MessageBubble key={m.id} role={m.role} text={m.text} />)}
      </div>
      {suggestions.length > 0 && (
        <div className="px-4 py-3 bg-neutral-100 flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button
              key={s}
              className="px-3.5 py-1.5 text-sm rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm hover:bg-amber-50 hover:border-amber-300 hover:shadow focus:outline-none focus:ring-2 focus:ring-amber-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleSuggestionClick(s)}
              disabled={isSending}
            >{s}</button>
          ))}
        </div>
      )}
      <form className="p-4 flex gap-3 bg-white shadow-inner/5" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
        <div className="relative flex-1">
          <input
            className="w-full rounded-lg bg-neutral-100 border border-neutral-200 pr-10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 placeholder:text-neutral-500"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            aria-label="Chat input"
          />
          {(!isSending && input.trim()) && (
            <button
              type="submit"
              aria-label="Send message"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xl font-semibold text-black hover:scale-110 hover:text-amber-700 transition-transform"
            >☕</button>
          )}
        </div>
      </form>
    </div>
  );
}
