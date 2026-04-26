import { MapPinned } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Hospital } from "@/lib/mock";
import { googleMapsUrlForHospital } from "@/lib/maps";
import { haptic } from "@/lib/haptics";

type Props = {
  hospital: Hospital;
  className?: string;
  variant?: "default" | "subtle";
};

/**
 * Small external link to Google Maps (coordinates or name search).
 */
export const HospitalMapLink = ({ hospital, className, variant = "default" }: Props) => {
  const href = googleMapsUrlForHospital(hospital);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => haptic("tap")}
      className={cn(
        "inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-0 -mx-1 px-1 py-1 sm:py-0 rounded-md text-left text-xs sm:text-xs font-medium transition-colors",
        variant === "default"
          ? "text-primary hover:text-primary-glow"
          : "text-muted-foreground hover:text-primary",
        className,
      )}
    >
      <MapPinned className="size-3.5 shrink-0 opacity-80" />
      <span>Google Maps</span>
    </a>
  );
};
