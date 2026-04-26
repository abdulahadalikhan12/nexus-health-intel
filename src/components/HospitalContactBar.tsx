import { Mail, MapPinned, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Hospital } from "@/lib/mock";
import { googleMapsUrlForHospital } from "@/lib/maps";
import { haptic } from "@/lib/haptics";
import { resolveCallAction, resolveEmailAction } from "@/lib/contactActions";

const btnClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-secondary/30 px-2.5 py-2 min-h-[40px] sm:min-h-[36px] text-xs font-medium text-foreground/90 transition-colors hover:bg-secondary/50 hover:border-primary/30";

type Props = {
  hospital: Hospital;
  /** default: primary-styled map; subtle: muted map link to match cards */
  mapVariant?: "default" | "subtle";
  className?: string;
};

/**
 * Call + Email + Maps. Call/Email use `tel:` / `mailto:` when the API provides
 * real contact fields; otherwise deterministic synthetic demo values so the row
 * stays actionable.
 */
export const HospitalContactBar = ({ hospital, mapVariant = "default", className }: Props) => {
  const mapHref = googleMapsUrlForHospital(hospital);
  const call = resolveCallAction(hospital);
  const em = resolveEmailAction(hospital);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-start gap-x-2 gap-y-2 sm:gap-x-2.5",
        className,
      )}
    >
      <a
        href={call.href}
        {...(call.newTab
          ? { target: "_blank", rel: "noopener noreferrer" }
          : { rel: "noopener" })}
        onClick={() => haptic("tap")}
        className={btnClass}
        title={call.title}
        aria-label={call.title}
      >
        <Phone className="size-3.5 shrink-0" />
        <span>Call</span>
      </a>
      <a
        href={em.href}
        {...(em.newTab
          ? { target: "_blank", rel: "noopener noreferrer" }
          : { rel: "noopener" })}
        onClick={() => haptic("tap")}
        className={btnClass}
        title={em.title}
        aria-label={em.title}
      >
        <Mail className="size-3.5 shrink-0" />
        <span>Email</span>
      </a>
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
        title="Open in Google Maps"
      >
        <MapPinned className="size-3.5 shrink-0 opacity-80" />
        <span>Maps</span>
      </a>
    </div>
  );
};
