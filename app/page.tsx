// app/page.tsx
"use client";

import { Chat } from "@/components/Chat";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useCart } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function HomePage() {
  const { addItem, count } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const heroText = `👋 Welcome to **Vital Coffee Roasters** — where strength meets coffee.\n\nWe roast specialty coffees crafted for **energy, focus, and recovery.**\nPerfect for athletes, creators, and anyone who fuels their day naturally. 💪☕`;

  const renderHero = (raw: string) => {
    let escaped = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\n{2,}/g, '<br/><br/>' ).replace(/\n/g, '<br/>' );
    return { __html: escaped };
  };
  const [showMap, setShowMap] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const RoastsMap = dynamic(() => import("@/components/RoastsMap"), { ssr: false });

  const handleAddToCart = (name: string) => {
    // Add to cart and show toast
    addItem(name);
    setToast(`Added ${name} to cart`);
    window.setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* Background map layer across the entire page; keep mounted to avoid flicker */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-200 ${showMap ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <RoastsMap full onAddToCart={handleAddToCart} />
        {/* Optional subtle overlay to keep content readable */}
        <div className="absolute inset-0 bg-white/10 pointer-events-none" />
      </div>
      {/* Blank top area with only login button */}
      <div className={`absolute right-6 top-6 z-20 flex items-center gap-3`}> 
        <button
          className="relative px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm hover:bg-amber-50"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open cart"
        >
          🛒
          {count > 0 && (
            <span className="absolute -top-1 -right-1 rounded-full bg-amber-500 text-white text-[10px] leading-none px-1.5 py-1 shadow">
              {count}
            </span>
          )}
        </button>
        <Link href="/login" className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-neutral-800 transition">
          Log In
        </Link>
      </div>
      <main className={`relative z-10 flex-1 flex flex-col items-center justify-start px-4 ${showMap ? 'pointer-events-none' : ''}`}>
        {/* Centered logo block */}
        <div className="mt-16 mb-8 flex flex-col items-center gap-8">
          <Image
            src="/file.svg"
            alt="Virtual Coffee Logo"
            width={400}
            height={419}
            className="opacity-90 h-auto w-28 sm:w-36 md:w-44 lg:w-52 xl:w-60 2xl:w-64 max-w-[400px] transition-all"
            sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, (max-width: 1024px) 176px, (max-width: 1280px) 208px, (max-width: 1536px) 240px, 256px"
            priority
          />
          <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-3xl px-4 text-center">
              {!showMap && (
                <p
                  className="text-lg md:text-xl leading-relaxed text-neutral-900"
                  dangerouslySetInnerHTML={renderHero(heroText)}
                />
              )}
            </div>
          </div>
        </div>
        {!showMap && (
          <div className="w-full max-w-3xl">
            <Chat onOpenMap={() => setShowMap(true)} />
          </div>
        )}
        <div className="h-12" />
      </main>
      {showMap && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-3xl px-4 pointer-events-auto">
          <Chat compact onOpenMap={() => setShowMap(true)} />
        </div>
      )}
      {/* Close map button */}
      {showMap && (
        <button
          className="fixed left-6 top-6 z-20 px-3 py-1.5 rounded-md bg-black text-white text-sm font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
          onClick={() => setShowMap(false)}
        >Close map</button>
      )}
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 inset-x-0 z-20 flex justify-center">
          <div className="px-4 py-2 rounded-md bg-black text-white text-sm shadow">{toast}</div>
        </div>
      )}

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
