"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  addItem: (name: string, id?: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

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

  const clear = () => setItems([]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((a, b) => a + b.qty, 0),
    addItem,
    clear,
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
