"use client";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">☕️</span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Virtual Coffee</h1>
            <p className="text-xs text-gray-500">Discover • Chat • Brew</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-amber-700">Chat</Link>
          <Link href="#beans" className="hover:text-amber-700">Beans</Link>
          <Link href="#guides" className="hover:text-amber-700">Brew Guides</Link>
          <Link href="#about" className="hover:text-amber-700">About</Link>
        </nav>
      </div>
    </header>
  );
}