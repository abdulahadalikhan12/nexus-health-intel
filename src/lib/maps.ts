import type { Hospital } from "@/lib/mock";

/**
 * Opens Google Maps at coordinates when we have them; otherwise searches
 * by name + address (covers backend rows with missing lat/lng).
 */
export function googleMapsUrlForHospital(h: Hospital): string {
  const { lat, lng } = h.coords;
  const hasCoords =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(Math.abs(lat) < 1e-5 && Math.abs(lng) < 1e-5);

  if (hasCoords) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  }
  const q = encodeURIComponent(`${h.name} ${h.location} India ${h.pin}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
