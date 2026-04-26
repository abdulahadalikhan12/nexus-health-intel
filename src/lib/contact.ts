/** Build `tel:` href so mobile opens the dialer with digits ready; desktop opens default handler. */
export function telHref(phone: string): string {
  const s = phone.trim();
  if (!s) return "#";
  const digits = s.replace(/\D/g, "");
  if (digits.length < 10) return "#";
  // India VF data: 12-digit 91… or 10-digit local; both work with leading +91
  if (digits.length === 10) return `tel:+91${digits}`;
  return `tel:+${digits}`;
}

/** `mailto:` with To pre-filled; optional subject (e.g. facility name). */
export function mailtoHref(email: string, subject?: string): string {
  const addr = email.trim();
  if (!addr) return "#";
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  const q = params.toString();
  return q ? `mailto:${addr}?${q}` : `mailto:${addr}`;
}
