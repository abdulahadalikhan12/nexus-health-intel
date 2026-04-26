import type { Hospital } from "@/lib/mock";
import { mailtoHref, telHref } from "@/lib/contact";

export type ResolvedContact =
  | { available: true; href: string; newTab: boolean; title: string }
  | { available: false; title: string };

/**
 * When the API provides a valid number → `tel:`. Otherwise the UI shows Call
 * as disabled (no synthetic placeholders).
 */
export function resolveCallAction(h: Hospital): ResolvedContact {
  const phone = h.phone?.trim();
  if (phone && phone.length >= 8 && !/^nan$/i.test(phone)) {
    const href = telHref(phone);
    if (href !== "#") {
      return { available: true, href, newTab: false, title: `Call ${phone}` };
    }
  }
  return {
    available: false,
    title: "Phone not available for this facility",
  };
}

/**
 * When the API provides email → `mailto:`. Otherwise Email is disabled.
 */
export function resolveEmailAction(h: Hospital): ResolvedContact {
  const email = h.email?.trim();
  if (email && email.includes("@") && !/^nan$/i.test(email)) {
    return {
      available: true,
      href: mailtoHref(email, `Inquiry: ${h.name}`),
      newTab: false,
      title: `Email ${email}`,
    };
  }
  return {
    available: false,
    title: "Email not available for this facility",
  };
}
