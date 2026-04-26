import type { Hospital } from "@/lib/mock";
import { mailtoHref, telHref } from "@/lib/contact";

function searchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/** When the API has a real number → `tel:`; otherwise a web search (always works). */
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
  return {
    href: searchUrl(`${h.name} ${h.location} India phone contact`),
    newTab: true,
    title: "Search for a phone number (not stored in our dataset for this facility)",
  };
}

/** When the API has an address → `mailto:`; otherwise a web search. */
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
  return {
    href: searchUrl(`${h.name} ${h.location} email contact India hospital`),
    newTab: true,
    title: "Search for email (not stored in our dataset for this facility)",
  };
}
