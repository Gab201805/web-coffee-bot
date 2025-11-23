"use client";

import React from "react";

type Role = "user" | "bot";

interface MessageBubbleProps {
  role: Role;
  text: string;
}

export function MessageBubble({ role, text }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex mb-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-xs rounded-2xl px-3 py-2 text-sm shadow
        ${isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"}
      `}
      >
        {text}
      </div>
    </div>
  );
}
