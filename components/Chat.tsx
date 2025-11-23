"use client";

import React, { useState } from "react";
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

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi! I’m your coffee bot ☕️ What are you in the mood for today? Espresso, filter, or capsules?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>([]);

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
      setSuggestions(data.suggestions || []);
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

  return (
    <div className="w-full max-w-md mx-auto h-[80vh] flex flex-col border rounded-2xl shadow-lg bg-white">
      <header className="px-4 py-3 border-b flex items-center gap-2">
        <span className="text-2xl">☕️</span>
        <div>
          <h1 className="text-base font-semibold">Coffee Bot</h1>
          <p className="text-xs text-gray-500">
            Chat to order your coffee.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} text={m.text} />
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="px-3 py-2 border-t bg-white flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              className="px-3 py-1 text-xs rounded-full border bg-gray-100 hover:bg-gray-200"
              onClick={() => sendMessage(s)}
              disabled={isSending}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 border-t flex gap-2 bg-white">
        <input
          className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        <button
          className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white disabled:opacity-60"
          onClick={() => sendMessage()}
          disabled={isSending || !input.trim()}
        >
          {isSending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
