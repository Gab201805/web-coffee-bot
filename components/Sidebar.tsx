"use client";
import React from "react";

const coffeeCategories = [
  { name: "Ethiopia", notes: "Floral • Citrus" },
  { name: "Colombia", notes: "Caramel • Stone Fruit" },
  { name: "Guatemala", notes: "Chocolate • Nutty" },
  { name: "Kenya", notes: "Berry • Bright" },
  { name: "Brazil", notes: "Nutty • Cocoa" },
];

export default function Sidebar() {
  return (
    <div className="h-full flex flex-col rounded-xl border bg-white shadow-sm p-5">
      <h2 className="text-sm font-semibold tracking-wide text-amber-700 mb-4">Origins & Profiles</h2>
      <ul className="space-y-3 flex-1 overflow-y-auto">
        {coffeeCategories.map(c => (
          <li key={c.name} className="group">
            <button className="w-full text-left p-3 rounded-lg border hover:border-amber-400 hover:bg-amber-50 transition flex flex-col">
              <span className="font-medium">{c.name}</span>
              <span className="text-xs text-gray-500 group-hover:text-amber-700">{c.notes}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-xs text-gray-500 leading-relaxed">
        <p>Tip: Click a profile to ask the bot for a recommended brew method or recipe.</p>
      </div>
    </div>
  );
}