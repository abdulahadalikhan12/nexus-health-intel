import type { Hospital } from "@/lib/mock";
import { mailtoHref, telHref } from "@/lib/contact";
import { syntheticGmailStyle, syntheticIndianPhone } from "@/lib/syntheticContact";

/**
 * When the API provides a number → `tel:`. When missing, use a per-facility
 * synthetic +91 number (demo placeholder — not a verified line).
 */
export function resolveCallAction(h: Hospital): {
  href: string;
  newTab: boolean;
  title: string;
} {
  const phone = h.phone?.trim();
  if (phone && phone.length >= 8 && !/^nan$/i.test(phone)) {
    const href = telHref(phone);
    if (href !== "#") {
      return { href, newTab: false, title: `Call ${phone}` };
    }
  }
  const demo = syntheticIndianPhone(h.id);
  return {
    href: telHref(demo),
    newTab: false,
    title: `Demo: synthetic India mobile for UI — ${demo}`,
  };
}

/**
 * When the API provides email → `mailto:`. Otherwise a Gmail-style demo address.
 */
export function resolveEmailAction(h: Hospital): {
  href: string;
  newTab: boolean;
  title: string;
} {
  const email = h.email?.trim();
  if (email && email.includes("@") && !/^nan$/i.test(email)) {
    return {
      href: mailtoHref(email, `Inquiry: ${h.name}`),
      newTab: false,
      title: `Email ${email}`,
    };
  }
  const demo = syntheticGmailStyle(h.name, h.id);
  return {
    href: mailtoHref(demo, `Inquiry: ${h.name}`),
    newTab: false,
    title: `Demo: synthetic email for UI — ${demo}`,
  };
}
