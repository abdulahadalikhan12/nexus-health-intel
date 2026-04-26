/**
 * Demo-only contact values when the API omits phone/email.
 * Deterministic per facility (same id → same number/email), not random on every render.
 * These are not verified real contacts — for UI / hackathon demo only.
 */

function strHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Indian mobile style: +91 + 10 digits (first digit 6–9). */
export function syntheticIndianPhone(facilityId: string): string {
  const n = strHash(`phone:${facilityId}`);
  const first = 6 + (n % 4); // 6..9
  const rest = String(n % 1000000000).padStart(9, "0");
  return `+91${first}${rest}`;
}

/** Gmail-style local part from facility name + id for uniqueness. */
export function syntheticGmailStyle(name: string, facilityId: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 20);
  const base = slug || "facility";
  const tag = strHash(facilityId) % 10000;
  return `${base}.${String(tag).padStart(4, "0")}@gmail.com`;
}
