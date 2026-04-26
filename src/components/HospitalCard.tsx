import { motion } from "framer-motion";
import { MapPin, AlertTriangle, Info } from "lucide-react";
import type { Hospital } from "@/lib/mock";
import { TrustGauge } from "./TrustGauge";
import { CapabilityBadges } from "./CapabilityBadges";
import { HospitalContactBar } from "./HospitalContactBar";

interface Props {
  hospital: Hospital;
}

const cardVariant = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 18 } },
};

export const HospitalCard = ({ hospital }: Props) => (
  <motion.article
    variants={cardVariant}
    whileHover={{ y: -4, boxShadow: "0 20px 60px hsl(var(--primary) / 0.18)" }}
    transition={{ type: "spring", stiffness: 260, damping: 22 }}
    className="rounded-2xl bg-card border border-border/60 p-4 sm:p-6 backdrop-blur-sm"
  >
    {/* Header row */}
    <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
      <div className="min-w-0 flex-1">
        <h3 className="text-base sm:text-xl font-semibold tracking-tight break-words">{hospital.name}</h3>
        <div className="mt-1.5 inline-flex flex-wrap items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-1 text-[11px] sm:text-xs text-muted-foreground max-w-full">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{hospital.location}</span>
          <span className="mx-1 text-border hidden sm:inline">•</span>
          <span className="uppercase tracking-wider text-[10px]">{hospital.region}</span>
          <span className="mx-1 text-border hidden sm:inline">•</span>
          <span className="font-mono-tech text-[10px]">PIN {hospital.pin}</span>
        </div>
      </div>
      <div className="shrink-0">
        <TrustGauge score={hospital.trust_score} interval={hospital.trust_interval} size={72} />
      </div>
    </div>

    {/* Capabilities */}
    <CapabilityBadges capabilities={hospital.capabilities} />

    {/* Flags */}
    {hospital.flags.length > 0 && (
      <div className="mt-4 sm:mt-5 space-y-2">
        {hospital.flags.map((f, i) => {
          const Icon = f.level === "warning" ? AlertTriangle : Info;
          const tone = f.level === "warning"
            ? "text-trust-mid bg-trust-mid/10 border-trust-mid/25"
            : "text-muted-foreground bg-secondary/40 border-border";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 220, damping: 22 }}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${tone}`}
            >
              <Icon className="size-3.5 mt-0.5 shrink-0" />
              <span className="leading-snug">{f.text}</span>
            </motion.div>
          );
        })}
      </div>
    )}

    <div className="mt-4 sm:mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-mono-tech">
        id: {hospital.id}
      </span>
      <HospitalContactBar hospital={hospital} mapVariant="subtle" />
    </div>
  </motion.article>
);
