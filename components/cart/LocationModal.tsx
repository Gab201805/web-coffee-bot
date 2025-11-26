"use client";

import React, { useState } from "react";
import { setManualLocation } from "@/lib/geo";

interface LocationModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (countryCode?: string, inServiceArea?: boolean) => void;
}

// Geneva center
const GENEVA_LAT = 46.2044;
const GENEVA_LON = 6.1432;

function isInGenevaArea(lat?: number, lon?: number, countryCode?: string, radiusKm = 50) {
  if (!lat || !lon) return false;
  const isCH = (countryCode || "").toUpperCase() === "CH";
  if (!isCH) return false;
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(GENEVA_LAT - lat);
  const dLon = toRad(GENEVA_LON - lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(GENEVA_LAT)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  return distanceKm <= radiusKm;
}

export function LocationModal({ open, onClose, onSaved }: LocationModalProps) {
  const [countryCode, setCountryCode] = useState<string>("CH");
  const [lat, setLat] = useState<string>(String(GENEVA_LAT));
  const [lon, setLon] = useState<string>(String(GENEVA_LON));

  const save = () => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const inArea = isInGenevaArea(latNum, lonNum, countryCode);
    const payload = {
      country: countryCode === "CH" ? "Switzerland" : undefined,
      countryCode,
      city: undefined,
      latitude: latNum,
      longitude: lonNum,
      inServiceArea: inArea,
    };
    setManualLocation(payload);
    onSaved(countryCode, inArea);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[95vw] bg-white rounded-lg shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Set Location</h3>
          <button className="text-neutral-600 hover:text-black" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="space-y-3">
          <label className="block text-sm">Country code (ISO 2-letter)
            <input value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase())} className="mt-1 w-full border rounded-md px-2 py-1" placeholder="CH" />
          </label>
          <label className="block text-sm">Latitude
            <input value={lat} onChange={(e) => setLat(e.target.value)} className="mt-1 w-full border rounded-md px-2 py-1" placeholder="46.2044" />
          </label>
          <label className="block text-sm">Longitude
            <input value={lon} onChange={(e) => setLon(e.target.value)} className="mt-1 w-full border rounded-md px-2 py-1" placeholder="6.1432" />
          </label>
          <p className="text-xs text-neutral-600">We currently serve the Geneva area (≈50 km radius) in Switzerland.</p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50" onClick={onClose}>Cancel</button>
          <button className="px-3 py-1.5 rounded-md bg-black text-white hover:bg-neutral-800" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
