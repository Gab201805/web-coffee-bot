export interface UserLocation {
  country?: string;
  countryCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  inServiceArea?: boolean;
}

const STORAGE_KEY = "vital_geo";

// Read radius once (Next.js inlines NEXT_PUBLIC_* at build time)
const GENEVA_RADIUS_KM: number = (() => {
  const raw = process.env.NEXT_PUBLIC_GENEVA_RADIUS_KM;
  const n = raw ? parseFloat(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 50;
})();

export function getGenevaRadiusKm(): number {
  return GENEVA_RADIUS_KM;
}

function isInGenevaArea(lat?: number, lon?: number, countryCode?: string): boolean {
  if (!lat || !lon) return false;
  const isCH = (countryCode || "").toUpperCase() === "CH";
  if (!isCH) return false;
  const glat = 46.2044;
  const glon = 6.1432;
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(glat - lat);
  const dLon = toRad(glon - lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(glat)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  return distanceKm <= GENEVA_RADIUS_KM;
}

export async function detectUserLocation(): Promise<UserLocation> {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed as UserLocation;
    }
  } catch {}

  if (typeof window !== "undefined" && "geolocation" in navigator) {
    try {
      const position: GeolocationPosition = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 3000 });
      });
      const ipRes = await fetch("https://ipapi.co/json/");
      const ipData = await ipRes.json().catch(() => ({}));
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const loc: UserLocation = {
        country: ipData?.country_name,
        countryCode: ipData?.country,
        city: ipData?.city,
        latitude: lat,
        longitude: lon,
        inServiceArea: isInGenevaArea(lat, lon, ipData?.country),
      };
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)); } catch {}
      return loc;
    } catch {}
  }

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const lat = typeof data?.latitude === "number" ? data.latitude : undefined;
    const lon = typeof data?.longitude === "number" ? data.longitude : undefined;
    const loc: UserLocation = {
      country: data?.country_name,
      countryCode: data?.country,
      city: data?.city,
      latitude: lat,
      longitude: lon,
      inServiceArea: isInGenevaArea(lat, lon, data?.country),
    };
    try { if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)); } catch {}
    return loc;
  } catch {
    return {};
  }
}

export function clearCachedLocation() {
  try { if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function setManualLocation(loc: UserLocation) {
  try { if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)); } catch {}
}
