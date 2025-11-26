"use client";

import React, { useEffect, useState } from "react";
import { detectUserLocation } from "@/lib/geo";

export function LocationBadge({ onClick }: { onClick?: () => void }) {
  const [countryCode, setCountryCode] = useState<string | undefined>();
  const [inServiceArea, setInServiceArea] = useState<boolean>(false);

  useEffect(() => {
    detectUserLocation()
      .then((loc) => { setCountryCode(loc.countryCode); setInServiceArea(Boolean(loc.inServiceArea)); })
      .catch(() => { setCountryCode(undefined); setInServiceArea(false); });
  }, []);

  const label = countryCode ? countryCode.toUpperCase() : "Unknown";
  const status = inServiceArea ? "Geneva area" : "Outside service";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded-md text-xs border ${inServiceArea ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-amber-300 bg-amber-50 text-amber-700"} hover:opacity-80`}
      title={`Location: ${label} — ${status}`}
    >
      {label} · {status}
    </button>
  );
}
