"use client";

import React from "react";
import { useCart } from "./CartContext";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, count, clear } = useCart();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <aside className="absolute right-0 top-0 h-full w-[340px] max-w-[85vw] bg-white shadow-xl z-50 flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="text-base font-semibold">Your Cart ({count})</h2>
              <button className="text-sm text-neutral-600 hover:text-black" onClick={onClose} aria-label="Close cart">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 && (
                <p className="text-sm text-neutral-600">Your cart is empty.</p>
              )}
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <div className="font-medium text-sm">{it.name}</div>
                    <div className="text-xs text-neutral-600">Qty: {it.qty}</div>
                  </div>
                  <div className="text-right text-sm font-semibold">—</div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex items-center justify-between gap-2">
              <button
                className="px-3 py-2 rounded-md text-sm border border-neutral-300 hover:bg-neutral-50"
                onClick={clear}
                disabled={items.length === 0}
              >Clear</button>
              <button
                className="px-4 py-2 rounded-md text-sm bg-black text-white hover:bg-neutral-800"
                onClick={() => alert("Checkout flow coming soon")}
                disabled={items.length === 0}
              >Checkout</button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
