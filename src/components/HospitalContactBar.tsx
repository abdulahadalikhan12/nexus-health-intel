import { Mail, MapPinned, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Hospital } from "@/lib/mock";
import { mailtoHref, telHref } from "@/lib/contact";
import { googleMapsUrlForHospital } from "@/lib/maps";
import { haptic } from "@/lib/haptics";

const btnClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-secondary/30 px-2.5 py-2 min-h-[40px] sm:min-h-[36px] text-xs font-medium text-foreground/90 transition-colors";
const btnClassActive = `${btnClass} hover:bg-secondary/50 hover:border-primary/30 cursor-pointer`;
const btnClassInactive = `${btnClass} cursor-not-allowed border-border/40 bg-secondary/20 text-muted-foreground/70`;

type Props = {
  hospital: Hospital;
  /** default: primary-styled map; subtle: muted map link to match cards */
  mapVariant?: "default" | "subtle";
  className?: string;
};

/**
 * Call + Email (left) + Maps (right). `tel:` / `mailto:` open OS dialer & mail
 * when we have a number/address. Otherwise buttons stay visible (disabled) so
 * the row does not depend on the API having contact fields yet.
 */
export const HospitalContactBar = ({ hospital, mapVariant = "default", className }: Props) => {
  const mapHref = googleMapsUrlForHospital(hospital);
  const phone = hospital.phone?.trim();
  const email = hospital.email?.trim();
  const mailHref = email ? mailtoHref(email, `Inquiry: ${hospital.name}`) : null;
  const callHref = phone ? telHref(phone) : null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-start gap-x-2 gap-y-2 sm:gap-x-2.5",
        className,
      )}
    >
      {callHref ? (
        <a
          href={callHref}
          onClick={() => haptic("tap")}
          className={btnClassActive}
          aria-label={`Call ${phone}`}
        >
          <Phone className="size-3.5 shrink-0" />
          <span>Call</span>
        </a>
      ) : (
        <span
          className={btnClassInactive}
          title="No phone number in our dataset for this facility yet."
        >
          <Phone className="size-3.5 shrink-0" />
          <span>Call</span>
        </span>
      )}
      {mailHref ? (
        <a
          href={mailHref}
          onClick={() => haptic("tap")}
          className={btnClassActive}
          aria-label={`Email ${email}`}
        >
          <Mail className="size-3.5 shrink-0" />
          <span>Email</span>
        </a>
      ) : (
        <span
          className={btnClassInactive}
          title="No email address in our dataset for this facility yet."
        >
          <Mail className="size-3.5 shrink-0" />
          <span>Email</span>
        </span>
      )}
      <a
        href={mapHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => haptic("tap")}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 min-h-[40px] sm:min-h-[36px] text-xs font-medium transition-colors",
          mapVariant === "default"
            ? "text-primary border border-primary/30 bg-primary/5 hover:text-primary-glow hover:bg-primary/10"
            : "text-muted-foreground border border-border/50 bg-secondary/20 hover:text-primary",
        )}
      >
        <MapPinned className="size-3.5 shrink-0 opacity-80" />
        <span>Maps</span>
      </a>
    </div>
  );
};
