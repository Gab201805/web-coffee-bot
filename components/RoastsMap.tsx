"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RoastsMapProps {
  onAddToCart?: (regionName: string) => void;
  full?: boolean;
}

export default function RoastsMap({ onAddToCart, full }: RoastsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const addToCartRef = useRef<typeof onAddToCart>();

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

    // Load GeoJSON from public folder and render
    fetch("/geo/ethiopia_coffee_zones.geojson")
      .then((r) => r.json())
      .then((data) => {
        const gj = L.geoJSON(data as any, {
          style,
          onEachFeature: (feature: any, layer: L.Layer) => {
            const polygon = layer as L.Path;
            const name = feature.properties?.name ?? feature.properties?.coffee_zone ?? "Region";
            // Hover tooltip
            (polygon as any).bindTooltip(name, { sticky: true, opacity: 0.9 });
            polygon.on("mouseover", () => {
              (polygon as any).openTooltip();
            });
            polygon.on("click", () => {
              polygon.setStyle({ weight: 2, color: "#f59e0b" });
              polygon.bindPopup(
                `<div style=\"min-width:200px\"><strong>${name}</strong><br/><small>Single-origin region</small><br/><button data-name=\"${name}\" class=\"leaflet-add-btn\" style=\"margin-top:8px;padding:8px 12px;border-radius:8px;background:#000;color:#fff;border:none;cursor:pointer\">Add to cart</button></div>`
              );
              (polygon as any).openPopup();
            });
            polygon.on("popupclose", () => {
              polygon.setStyle({ weight: 1, color: "#0f172a" });
              (polygon as any).closeTooltip();
            });
          },
        });
        gj.addTo(map);
        // Do not auto-fit/zoom; let users control the view
      })
      .catch(() => {
        // silent fail for now
      });

    const container = map.getContainer();
    const onContainerClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      const btn = target?.closest?.(".leaflet-add-btn") as HTMLElement | null;
      if (btn) {
        const r = btn.getAttribute("data-name") || "Region";
        addToCartRef.current?.(r);
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
