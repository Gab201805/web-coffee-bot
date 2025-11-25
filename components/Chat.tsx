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

export function Chat() {
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

  const [showRoastsModal, setShowRoastsModal] = useState(false);
  const RoastsMap = dynamic(() => import("./RoastsMap"), { ssr: false });

  const handleAddToCart = (regionName: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "bot",
        text: `Added ${regionName} to cart (placeholder).`,
      },
    ]);
  };

  const handleSuggestionClick = (s: string) => {
    if (s === "See our roasts") {
      setShowRoastsModal(true);
      return;
    }
    sendMessage(s);
  };

  useEffect(() => {
    if (!showRoastsModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowRoastsModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showRoastsModal]);

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

  return (
    <div className="relative h-[720px] flex flex-col border border-neutral-200 rounded-lg bg-neutral-50">
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
      {showRoastsModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRoastsModal(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="roasts-title"
            className="relative z-30 w-full max-w-3xl mx-4 rounded-xl bg-white shadow-xl border border-neutral-200"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h2 id="roasts-title" className="text-lg font-semibold text-neutral-900">Our Roasts</h2>
              <button
                className="p-1.5 rounded-md hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-300"
                aria-label="Close"
                onClick={() => setShowRoastsModal(false)}
              >✕</button>
            </div>
            <div className="p-5">
              <RoastsMap onAddToCart={handleAddToCart} />
              <p className="mt-3 text-xs text-neutral-600">Hover a region to see details; click “Add to cart” inside the popup.</p>
            </div>
            <div className="px-5 py-4 border-t border-neutral-200 flex justify-end">
              <button
                className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                onClick={() => setShowRoastsModal(false)}
              >Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
