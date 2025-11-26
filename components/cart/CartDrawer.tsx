"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "./CartContext";
import { detectUserLocation } from "@/lib/geo";
import { clearCachedLocation } from "@/lib/geo";
import { LocationModal } from "./LocationModal";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, count, clear, inc, dec, setQty } = useCart();
  const [catalog, setCatalog] = useState<any | null>(null);
  const [countryCode, setCountryCode] = useState<string | undefined>(undefined);
  const [inServiceArea, setInServiceArea] = useState<boolean>(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  useEffect(() => {
    // Load product catalog client-side to resolve prices for cart rows
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setCatalog(data))
      .catch(() => setCatalog(null));
  }, []);

  function changeLocation() {
    clearCachedLocation();
    setLocationModalOpen(true);
  }

  useEffect(() => {
    // Detect user country and service area for shipping/tax estimation
    detectUserLocation()
      .then((loc) => {
        setCountryCode(loc.countryCode);
        setInServiceArea(Boolean(loc.inServiceArea));
      })
      .catch(() => {
        setCountryCode(undefined);
        setInServiceArea(false);
      });
  }, []);

  function getVariant(pid?: string, sku?: string) {
    if (!pid || !catalog?.products) return null;
    const product = catalog.products.find((p: any) => p.id === pid);
    if (!product) return null;
    const v = product.variants.find((x: any) => x.sku === sku);
    return v || null;
  }

  const totals = useMemo(() => {
    let subtotal = 0;
    const rows = items.map((it) => {
      const [pid, sku] = (it.id || "").split(":");
      const variant = getVariant(pid, sku);
      const unit = variant ? variant.price : 0;
      const lineTotal = unit * it.qty;
      // Prefer product + size for display when available
      let display = it.name;
      if (catalog?.products) {
        const product = catalog.products.find((p: any) => p.id === pid);
        if (product) {
          const size = variant?.size ? ` ${variant.size}` : "";
          display = `${product.name}${size}`;
        }
      }
      subtotal += lineTotal;
      return { ...it, name: display, pid, sku, unit, lineTotal };
    });
    // CHF tax/shipping estimation
    const isCH = (countryCode || "").toUpperCase() === "CH"; // Switzerland
    const taxRate = 0.081; // Swiss VAT standard rate
    // Restrict service area: Geneva region in Switzerland only
    // If outside, set shipping to 0 and "disable" checkout on UI
    const shipping = isCH && inServiceArea ? 7 : 0;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;
    return { rows, subtotal, tax, shipping, total, currency: "CHF" };
  }, [items, catalog, countryCode]);

  async function checkout() {
    if (items.length === 0) return;
    // Convert cart items to checkout payload: { id, sku?, qty }
    const payloadItems = items.map((it) => {
      // our item.id may be "productId:sku"; split to send structured fields
      const [pid, sku] = (it.id || "").split(":");
      return { id: pid, sku: sku || undefined, qty: it.qty };
    });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: payloadItems, meta: { countryCode, inServiceArea } }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Checkout failed");
        return;
      }
      const url = data?.url as string | undefined;
      if (url) {
        window.location.href = url;
      } else {
        alert("No checkout URL returned");
      }
    } catch (e) {
      alert("Checkout request error");
    }
  }

  return (
    <>
      {open && (
        <>
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
              {totals.rows.map((it) => (
                <div key={it.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <div className="font-medium text-sm">{it.name}</div>
                    <div className="text-xs text-neutral-600 mt-0.5">{it.sku ? `Variant: ${it.sku}` : ""}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-neutral-300 hover:bg-neutral-50 disabled:opacity-50"
                        aria-label="Decrease quantity"
                        onClick={() => dec(it.id)}
                        disabled={it.qty <= 0}
                      >−</button>
                      <input
                        className="w-12 text-center text-sm border rounded-md px-2 py-1"
                        value={it.qty}
                        aria-label="Quantity"
                        onChange={(e) => setQty(it.id, Number(e.target.value))}
                      />
                      <button
                        className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-neutral-300 hover:bg-neutral-50"
                        aria-label="Increase quantity"
                        onClick={() => inc(it.id)}
                      >+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">${it.unit.toFixed(2)}</div>
                    <div className="text-xs text-neutral-600">Line: ${it.lineTotal.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex items-center justify-between gap-2">
              <div className="text-sm w-full">
                <div className="flex items-center justify-between gap-8">
                  <span className="text-neutral-700">Subtotal</span>
                  <span className="font-medium">{totals.currency} {totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-8 mt-1">
                  <span className="text-neutral-700">Estimated tax</span>
                  <span className="font-medium">{totals.currency} {totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-8 mt-1">
                  <span className="text-neutral-700">Shipping</span>
                  <span className="font-medium">{totals.currency} {totals.shipping.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-8 mt-2">
                  <span className="text-neutral-900 font-semibold">Total</span>
                  <span className="font-semibold">{totals.currency} {totals.total.toFixed(2)}</span>
                </div>
              </div>
              {!inServiceArea && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 mr-auto flex items-center gap-2">
                  <span>We currently serve the Geneva area in Switzerland.</span>
                  <button className="underline text-amber-700" onClick={changeLocation}>Set location manually</button>
                </div>
              )}
              <button
                className="px-3 py-2 rounded-md text-sm border border-neutral-300 hover:bg-neutral-50"
                onClick={clear}
                disabled={items.length === 0}
              >Clear</button>
              <button
                className="px-4 py-2 rounded-md text-sm bg-black text-white hover:bg-neutral-800"
                onClick={checkout}
                disabled={items.length === 0 || !inServiceArea}
              >Checkout</button>
            </div>
          </aside>
        </div>
        <LocationModal
          open={locationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          onSaved={(cc, area) => { setCountryCode(cc); setInServiceArea(Boolean(area)); }}
        />
        </>
      )}
    </>
  );
}
