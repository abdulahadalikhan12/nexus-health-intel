import { Mail, MapPinned, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Hospital } from "@/lib/mock";
import { mailtoHref, telHref } from "@/lib/contact";
import { googleMapsUrlForHospital } from "@/lib/maps";
import { haptic } from "@/lib/haptics";

type Props = {
  hospital: Hospital;
  /** default: primary-styled map; subtle: muted map link to match cards */
  mapVariant?: "default" | "subtle";
  className?: string;
};

/**
 * Map (left) + Call + Email (to the right). Uses `tel:` and `mailto:` so
 * the OS opens the dialer / default mail client with the address ready.
 */
export const HospitalContactBar = ({ hospital, mapVariant = "default", className }: Props) => {
  const mapHref = googleMapsUrlForHospital(hospital);
  const phone = hospital.phone?.trim();
  const email = hospital.email?.trim();
  const mailHref = email
    ? mailtoHref(email, `Inquiry: ${hospital.name}`)
    : null;
  const callHref = phone ? telHref(phone) : null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-x-1 gap-y-2 sm:gap-x-2",
        className,
      )}
    >
      <a
        href={mapHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => haptic("tap")}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 min-h-[40px] sm:min-h-[36px] text-xs font-medium transition-colors",
          mapVariant === "default"
            ? "text-primary hover:text-primary-glow"
            : "text-muted-foreground hover:text-primary",
        )}
      >
        <MapPinned className="size-3.5 shrink-0 opacity-80" />
        <span>Maps</span>
      </a>
      {callHref && (
        <a
          href={callHref}
          onClick={() => haptic("tap")}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-secondary/30 px-2.5 py-2 min-h-[40px] sm:min-h-[36px] text-xs font-medium text-foreground/90 hover:bg-secondary/50 hover:border-primary/30 transition-colors"
          aria-label={`Call ${phone}`}
        >
          <Phone className="size-3.5 shrink-0" />
          <span>Call</span>
        </a>
      )}
      {mailHref && (
        <a
          href={mailHref}
          onClick={() => haptic("tap")}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-secondary/30 px-2.5 py-2 min-h-[40px] sm:min-h-[36px] text-xs font-medium text-foreground/90 hover:bg-secondary/50 hover:border-primary/30 transition-colors"
          aria-label={`Email ${email}`}
        >
          <Mail className="size-3.5 shrink-0" />
          <span>Email</span>
        </a>
      )}
    </div>
  );
};
