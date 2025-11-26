"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  addItem: (name: string, id?: string) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load persisted cart on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("vital_cart") : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((x) => x && typeof x.id === "string" && typeof x.name === "string" && typeof x.qty === "number"));
        }
      }
    } catch {}
  }, []);

  // Persist cart on change
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("vital_cart", JSON.stringify(items));
      }
    } catch {}
  }, [items]);

  const addItem = (name: string, id?: string) => {
    const key = id ?? slugify(name);
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === key);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { id: key, name, qty: 1 }];
    });
  };

  const inc = (id: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
      return copy;
    });
  };

  const dec = (id: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const copy = [...prev];
      const nextQty = Math.max(0, copy[idx].qty - 1);
      copy[idx] = { ...copy[idx], qty: nextQty };
      return copy;
    });
  };

  const setQty = (id: string, qty: number) => {
    const safeQty = Math.max(0, Math.floor(qty || 0));
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], qty: safeQty };
      return copy;
    });
  };

  const clear = () => setItems([]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((a, b) => a + b.qty, 0),
    addItem,
    inc,
    dec,
    setQty,
    clear,
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
