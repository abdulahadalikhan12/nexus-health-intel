/** Deterministic demo contact strings when the API omits phone/email. */

function hashToUint(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Looks like +91 9XXXXXXXXX — not a verified line. */
export function syntheticIndianPhone(facilityId: string): string {
  const h = hashToUint(facilityId || "x");
  const nine = 9000000000 + (h % 1000000000);
  return `+91${nine}`;
}

function slugPart(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24) || "facility";
}

/** Gmail-style demo address — compose opens; not a real inbox. */
export function syntheticGmailStyle(name: string, facilityId: string): string {
  const h = hashToUint(facilityId + name).toString(36).slice(0, 6);
  return `${slugPart(name)}.${h}@gmail.com`;
}
