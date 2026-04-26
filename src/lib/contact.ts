/** Build `tel:` href so mobile opens the dialer with digits ready; desktop opens default handler. */
export function telHref(phone: string): string {
  const dial = phone.trim().replace(/[^\d+]/g, "");
  if (!dial) return "#";
  return `tel:${dial}`;
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
