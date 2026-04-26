/** Deterministic demo contact strings when the API omits phone/email. */

function hashToUint(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Simple LCG for extra digit spread (still deterministic). */
function nextRand(seed: number): [number, number] {
  const n = (Math.imul(seed, 1103515245) + 12345) >>> 0;
  return [n, n];
}

/**
 * Plausible Indian mobile: +91, then 10 digits starting with 6–9.
 * Displayed like carriers often show: +91 98765 43210
 */
export function syntheticIndianPhone(facilityId: string): string {
  let seed = hashToUint(facilityId || "x");
  const firstDigit = [6, 7, 8, 9][seed % 4];
  seed = (seed * 31) >>> 0;
  let digits = `${firstDigit}`;
  for (let i = 0; i < 9; i++) {
    const r = nextRand(seed);
    seed = r[0];
    digits += String(r[1] % 10);
  }
  // Avoid obviously fake runs like 00000 / 11111 in last 5
  if (/(\d)\1{4}$/.test(digits)) {
    const last = (seed % 9) + 1;
    digits = digits.slice(0, 9) + String(last);
  }
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

function slugPart(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18) || "cityhospital";
}

/**
 * Looks like common Indian hospital / clinic email patterns (still demo only).
 */
export function syntheticGmailStyle(name: string, facilityId: string): string {
  const h = hashToUint(`${facilityId}\0${name}`);
  const base = slugPart(name);
  const domains = ["gmail.com", "yahoo.co.in", "outlook.com", "rediffmail.com"] as const;
  const domain = domains[h % domains.length];
  const yy = 14 + ((h >>> 8) % 10); // 14–23-ish “year” fragment in local part
  const n3 = 100 + ((h >>> 4) % 800); // 100–899
  const n2 = 10 + ((h >>> 12) % 89); // 10–98

  const patterns = [
    `reception.${base}@${domain}`,
    `info.${base}${n2}@${domain}`,
    `${base}.hospital@${domain}`,
    `contact.${base.slice(0, 12)}@${domain}`,
    `${base}_medical${yy}@${domain}`,
    `enquiry${n3}.${base.slice(0, 10)}@${domain}`,
    `helpdesk.${n2}${base.slice(0, 8)}@${domain}`,
    `admin.${base.slice(0, 14)}@${domain}`,
  ];
  return patterns[h % patterns.length];
}
