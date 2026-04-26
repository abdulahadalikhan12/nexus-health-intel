import { motion } from "framer-motion";
import { MapPin, ShieldAlert, Sparkles } from "lucide-react";
import type { Hospital } from "@/lib/mock";
import { TrustGauge } from "./TrustGauge";
import { HospitalContactBar } from "./HospitalContactBar";
import { TraceabilityPanel } from "./TraceabilityPanel";

interface Props {
  hospital: Hospital;
  /** Other returned hospitals — used to phrase how this one stands out. */
  alternatives: Hospital[];
}

const TONE_BY_TRUST = (s: number) =>
  s >= 0.6
    ? { tag: "Recommended", cls: "text-trust-high border-trust-high/30 bg-trust-high/10" }
    : s >= 0.4
    ? { tag: "Best of available", cls: "text-trust-mid border-trust-mid/30 bg-trust-mid/10" }
    : { tag: "Use with caution", cls: "text-trust-low border-trust-low/30 bg-trust-low/10" };

/**
 * Builds a 1-2 sentence personal recommendation that explains *why* this
 * facility leads. Pulls signals from the structured data (capabilities,
 * trust gap to next-best, flags) instead of relying solely on the LLM.
 */
function buildHeadline(top: Hospital, alternatives: Hospital[]): {
  lead: string;
  caveat?: string;
} {
  const verifiedCaps = (Object.entries(top.capabilities) as [string, "yes" | "no" | "uncertain"][])
    .filter(([, v]) => v === "yes")
    .map(([k]) => k);

  // What does this leader uniquely have that the runner-up doesn't?
  const next = alternatives[0];
  const uniqueVerified = next
    ? verifiedCaps.filter((c) => next.capabilities[c as keyof Hospital["capabilities"]] !== "yes")
    : verifiedCaps;

  let lead: string;
  if (uniqueVerified.length > 0) {
    const list = uniqueVerified.slice(0, 3).join(", ");
    lead = `${top.name} is the strongest match — uniquely verified for ${list} among the candidates.`;
  } else if (top.trust_score >= 0.6) {
    lead = `Head to ${top.name}. It scores highest on trust (${(top.trust_score * 100).toFixed(0)}%) with the cleanest capability profile in your search.`;
  } else if (top.trust_score >= 0.4) {
    lead = `${top.name} is the best of the available options, but the data is partial — verify staffing on call before you go.`;
  } else {
    lead = `No facility in your search clears our trust threshold. ${top.name} ranks first, but treat it as a starting lead, not a referral.`;
  }

  let caveat: string | undefined;
  if (top.flags.length > 0) {
    const warn = top.flags.find((f) => f.level === "warning");
    if (warn) caveat = warn.text;
  }
  return { lead, caveat };
}

export const TopRecommendation = ({ hospital, alternatives }: Props) => {
  const { lead, caveat } = buildHeadline(hospital, alternatives);
  const tone = TONE_BY_TRUST(hospital.trust_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card backdrop-blur-sm p-4 sm:p-7 mb-5 sm:mb-6"
    >
      {/* Soft glow accent */}
      <div className="absolute -top-24 -right-24 size-48 sm:size-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

      <div className="relative">
        {/* Eyebrow */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-mono-tech uppercase tracking-widest ${tone.cls}`}
          >
            <Sparkles className="size-3" />
            {tone.tag}
          </span>
          <span className="text-[10px] font-mono-tech uppercase tracking-widest text-muted-foreground">
            Suggested path
          </span>
        </div>

        {/* Name + location + Call / Email / Maps under name; trust ring on the right */}
        <div className="flex items-start gap-3 sm:gap-5">
          <div className="min-w-0 flex-1 pr-1">
            <h2 className="text-[17px] sm:text-2xl font-semibold tracking-tight leading-tight break-words">
              {hospital.name}
            </h2>
            <div className="mt-1.5 inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] sm:text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span className="break-words">{hospital.location}</span>
              <span className="text-border">•</span>
              <span className="uppercase tracking-wider text-[10px]">{hospital.region}</span>
              <span className="text-border">•</span>
              <span className="font-mono-tech text-[10px]">PIN {hospital.pin}</span>
            </div>
            <HospitalContactBar
              hospital={hospital}
              mapVariant="default"
              className="mt-3 w-full max-w-full"
            />
          </div>

          <div className="shrink-0 self-start -mt-1 sm:mt-0">
            <TrustGauge
              score={hospital.trust_score}
              interval={hospital.trust_interval}
              size={64}
            />
          </div>
        </div>

        <p className="mt-3 sm:mt-4 text-[14px] sm:text-[15px] leading-relaxed text-foreground/95">
          {lead}
        </p>

        {caveat && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-trust-mid/30 bg-trust-mid/10 text-trust-mid px-3 py-2 text-xs">
            <ShieldAlert className="size-3.5 mt-0.5 shrink-0" />
            <span className="leading-snug">{caveat}</span>
          </div>
        )}

        <TraceabilityPanel hospital={hospital} />
      </div>
    </motion.div>
  );
};
