"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RoastsMapProps {
  onAddToCart?: (regionName: string) => void;
  full?: boolean;
}

type ProductVariant = { size: string; price: number; sku: string };
type Product = {
  id: string;
  name: string;
  map_zone_key?: string;
  variants: ProductVariant[];
};

export default function RoastsMap({ onAddToCart, full }: RoastsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const addToCartRef = useRef<typeof onAddToCart>();
  const productsRef = useRef<Product[] | null>(null);

  // Keep latest callback without causing map re-init
  useEffect(() => {
    addToCartRef.current = onAddToCart;
  }, [onAddToCart]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      // Start with a sensible Ethiopia-wide view; user controls thereafter
      center: [7.5, 39.5],
      zoom: 6,
      scrollWheelZoom: true,
    });
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const style: L.PathOptions = {
      color: "#0f172a",
      weight: 1,
      fillColor: "#fde68a",
      fillOpacity: 0.6,
    };
    // Load products then render GeoJSON with product cards in popups
    fetch("/api/products")
      .then((r) => r.json())
      .then((catalog) => {
        productsRef.current = catalog?.products || [];
      })
      .catch(() => {
        productsRef.current = [];
      })
      .finally(() => {
        fetch("/geo/ethiopia_coffee_zones.geojson")
          .then((r) => r.json())
          .then((data) => {
            const gj = L.geoJSON(data as any, {
              style,
              onEachFeature: (feature: any, layer: L.Layer) => {
                const polygon = layer as L.Path;
                const name = feature.properties?.name ?? feature.properties?.coffee_zone ?? "Region";
                (polygon as any).bindTooltip(name, { sticky: true, opacity: 0.9 });
                polygon.on("mouseover", () => {
                  (polygon as any).openTooltip();
                });
                polygon.on("click", () => {
                  polygon.setStyle({ weight: 2, color: "#f59e0b" });
                  const products = (productsRef.current || []).filter(
                    (p) => (p.map_zone_key || "").toLowerCase() === name.toLowerCase()
                  );
                  const cardHtml = products.length
                    ? products
                        .map((p) => {
                          const options = p.variants
                            .map(
                              (v) => `<option value=\"${v.sku}\">${v.size} — $${v.price.toFixed(2)}</option>`
                            )
                            .join("");
                          return `
                            <div class=\"leaflet-product\" data-pid=\"${p.id}\" style=\"border:1px solid #e5e7eb;border-radius:10px;padding:10px;margin-top:8px;background:#fff\">
                              <div style=\"font-weight:600;margin-bottom:4px\">${p.name}</div>
                              <label style=\"font-size:12px;color:#6b7280\">Variant</label>
                              <select class=\"leaflet-variant\" style=\"width:100%;margin-top:4px;padding:6px;border:1px solid #e5e7eb;border-radius:8px\">${options}</select>
                              <div style=\"display:flex;gap:8px;margin-top:8px;align-items:center\">
                                <input class=\"leaflet-qty\" type=\"number\" min=\"1\" value=\"1\" style=\"width:64px;padding:6px;border:1px solid #e5e7eb;border-radius:8px\" />
                                <button class=\"leaflet-add-btn\" style=\"flex:1;padding:8px 12px;border-radius:8px;background:#000;color:#fff;border:none;cursor:pointer\">Add to cart</button>
                              </div>
                            </div>`;
                        })
                        .join("")
                    : `<div style=\"padding:8px 0;color:#6b7280\">No products bound to <strong>${name}</strong> yet.</div>`;

                  const popupHtml = `<div style=\"min-width:240px\"><strong>${name}</strong><br/><small>Single-origin region</small>${cardHtml}</div>`;
                  polygon.bindPopup(popupHtml);
                  (polygon as any).openPopup();
                });
                polygon.on("popupclose", () => {
                  polygon.setStyle({ weight: 1, color: "#0f172a" });
                  (polygon as any).closeTooltip();
                });
              },
            });
            gj.addTo(map);
          })
          .catch(() => {
            // silent fail for now
          });
      });

    const container = map.getContainer();
    const onContainerClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      const btn = target?.closest?.(".leaflet-add-btn") as HTMLElement | null;
      if (btn) {
        const card = btn.closest(".leaflet-product") as HTMLElement | null;
        const pid = card?.getAttribute("data-pid") || undefined;
        const select = card?.querySelector(".leaflet-variant") as HTMLSelectElement | null;
        const qtyInput = card?.querySelector(".leaflet-qty") as HTMLInputElement | null;
        const sku = select?.value || undefined;
        const qty = Math.max(1, parseInt(qtyInput?.value || "1", 10));
        addToCartRef.current?.(`${pid}:${sku}:${qty}`);
      }
    };
    container.addEventListener("click", onContainerClick);

    return () => {
      container.removeEventListener("click", onContainerClick);
      map.remove();
      mapInstance.current = null;
    };
  // Run once on mount; we handle callback updates via addToCartRef
  }, []);

  return (
    <div className={`w-full ${full ? "h-full" : "h-[28rem]"} ${full ? "" : "rounded-lg border border-neutral-200"} overflow-hidden`}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
