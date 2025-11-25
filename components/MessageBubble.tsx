"use client";

import React from "react";

type Role = "user" | "bot";

interface MessageBubbleProps {
  role: Role;
  text: string;
}

export function MessageBubble({ role, text }: MessageBubbleProps) {
  const isUser = role === "user";

  const formatText = (raw: string) => {
    // Escape HTML to prevent injection
    let escaped = raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // Bold (**text**) first, then single *text*
    escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*(.+?)\*/g, '<strong>$1</strong>');
    // Newlines to <br/>
    escaped = escaped
      .replace(/\n{2,}/g, '<br/><br/>')
      .replace(/\n/g, '<br/>' );
    return escaped;
  };

  return (
    <div
      className={`flex mb-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-xs rounded-2xl px-3 py-2 text-sm shadow ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
        }`}
        dangerouslySetInnerHTML={{ __html: formatText(text) }}
      />
    </div>
  );
}
