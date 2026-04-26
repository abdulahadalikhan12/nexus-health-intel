import { AlertTriangle, CircleCheck, Sparkles, Workflow, XCircle } from "lucide-react";
import type { Hospital, ValidatorCheck } from "@/lib/mock";
import { Collapsible } from "@/components/Collapsible";

const validatorMeta = {
  pass: {
    cls: "text-trust-high border-trust-high/30 bg-trust-high/10",
    Icon: CircleCheck,
  },
  warn: {
    cls: "text-trust-mid border-trust-mid/30 bg-trust-mid/10",
    Icon: AlertTriangle,
  },
  fail: { cls: "text-trust-low border-trust-low/30 bg-trust-low/10", Icon: XCircle },
} as const;

/**
 * Row-level citations (source sentences) + step-level trust decomposition +
 * validator (medical standards) + agent reasoning.
 */
export const TraceabilityPanel = ({ hospital }: { hospital: Hospital }) => {
  const tb = hospital.trust_breakdown;
  const evidenceCount = hospital.evidence.length;

  return (
    <div className="mt-4 space-y-1 border-t border-border/50 pt-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono-tech mb-2 flex items-center gap-2">
        <Workflow className="size-3.5" />
        Agentic traceability
      </p>

      <Collapsible title="Source citations (medical report snippets)" badge={evidenceCount} defaultOpen>
        <p className="text-xs text-muted-foreground mb-3">
          Exact supporting lines from the facility record that our extraction step used. These are
          row-level citations for each capability signal.
        </p>
        <ul className="space-y-3">
          {hospital.evidence.map((e, i) => (
            <li key={i} className="rounded-lg border border-border/60 bg-secondary/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-primary font-mono-tech mb-1">
                {e.source}
              </p>
              <blockquote className="text-sm text-foreground/90 leading-relaxed border-l-2 border-primary/50 pl-3">
                {e.snippet}
              </blockquote>
            </li>
          ))}
        </ul>
      </Collapsible>

      <Collapsible title="Trust score — step-level factors" badge={tb ? "4" : "—"}>
        {tb ? (
          <div className="space-y-3 text-sm">
            <p className="text-xs text-muted-foreground">
              Composite trust is a weighted blend of completeness, internal consistency, validator
              pass/fail against medical rules, and evidence strength. Shown below are the four input
              scores (0–1) that justify the final trust score.
            </p>
            <ul className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
              <li className="rounded-md bg-secondary/40 px-2 py-1.5 border border-border/50">
                Completeness <span className="float-right text-primary">{(tb.completeness * 100).toFixed(0)}%</span>
              </li>
              <li className="rounded-md bg-secondary/40 px-2 py-1.5 border border-border/50">
                Consistency <span className="float-right text-primary">{(tb.consistency * 100).toFixed(0)}%</span>
              </li>
              <li className="rounded-md bg-secondary/40 px-2 py-1.5 border border-border/50">
                Validator <span className="float-right text-primary">{(tb.validator * 100).toFixed(0)}%</span>
              </li>
              <li className="rounded-md bg-secondary/40 px-2 py-1.5 border border-border/50">
                Evidence strength <span className="float-right text-primary">{(tb.evidence_strength * 100).toFixed(0)}%</span>
              </li>
            </ul>
            <p className="text-[11px] text-muted-foreground">
              Final displayed trust: <strong className="text-foreground">{(hospital.trust_score * 100).toFixed(0)}%</strong>{" "}
              (also logged to MLflow per query run for full experiment trace).
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Trust breakdown not available for this result.</p>
        )}
      </Collapsible>

      <Collapsible title="Validator — cross-check vs medical standards" badge={hospital.validator.length}>
        <p className="text-xs text-muted-foreground mb-3">
          The validator agent applies hard rules (e.g. surgery vs anesthesiology) and can augment with
          standards text (Tavily) so the primary extraction is not unchecked.
        </p>
        <ul className="space-y-2">
          {hospital.validator.map((v: ValidatorCheck, i) => {
            const meta = validatorMeta[v.outcome];
            const VIcon = meta.Icon;
            return (
              <li
                key={i}
                className={`rounded-lg border px-3 py-2 text-xs ${meta.cls}`}
              >
                <p className="font-medium text-foreground/90 flex items-center gap-1.5">
                  <VIcon className="size-3.5 shrink-0" />
                  {v.rule}
                </p>
                <p className="text-muted-foreground mt-1 leading-snug">{v.detail}</p>
              </li>
            );
          })}
        </ul>
      </Collapsible>

      <Collapsible title="Agent reasoning (narrative)" badge="1">
        <p className="text-sm leading-relaxed text-foreground/90 flex items-start gap-2">
          <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
          {hospital.reasoning}
        </p>
      </Collapsible>
    </div>
  );
};
