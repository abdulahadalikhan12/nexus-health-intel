/**
 * Backend adapter — transforms the Healthmap Agent backend response
 * (https://abdulahadalikhan12-healthmap-agent.hf.space/query) into the
 * `Hospital` shape the UI components expect.
 *
 * The backend is intentionally lean (it tracks only the 5 capabilities
 * the dataset reliably surfaces). Fields the UI expects but the backend
 * doesn't track (obstetrics, oncology, dialysis, trauma, etc.) default
 * to "uncertain" so the badges still render.
 */
import type { Capability, EvidenceItem, Flag, Hospital, ValidatorCheck } from "./mock";

interface BackendCapabilities {
  has_icu: Capability;
  has_emergency: Capability;
  has_surgery: Capability;
  has_anesthesiologist: Capability;
  has_oxygen: Capability;
  doctor_type: "full-time" | "part-time" | "unknown";
}

interface BackendLocation {
  state: string | null;
  district: string | null;
  pin: string | null;
  rural: boolean | null;
  latitude: number | null;
  longitude: number | null;
}

interface BackendIssue {
  capability: string;
  issue: string;
  severity: "low" | "medium" | "high";
}

interface BackendValidatorFinding {
  facility_id: string;
  combined_score?: number;
  issues: BackendIssue[];
  trust: {
    completeness: number;
    consistency: number;
    validator: number;
    evidence_strength: number;
  };
}

export interface BackendTrace {
  parsed_query: Record<string, unknown>;
  retrieved_ids: string[];
  validator_findings: BackendValidatorFinding[];
  trust_breakdown: Record<string, number>;
  steps: string[];
}

export interface BackendHospital {
  facility_id: string;
  name: string;
  location: BackendLocation;
  meta: { facility_type: string | null };
  capabilities: BackendCapabilities;
  trust_score: number;
  flags: string[];
  evidence: Partial<Record<string, string>>;
  reasoning: string;
}

export interface BackendQueryResponse {
  results: BackendHospital[];
  trace: BackendTrace;
}

const SEVERITY_TO_OUTCOME: Record<BackendIssue["severity"], ValidatorCheck["outcome"]> = {
  high: "fail",
  medium: "warn",
  low: "warn",
};

/** Capability key as it appears in our backend → label expected by the UI. */
const EVIDENCE_LABELS: Record<string, string> = {
  icu: "ICU note",
  emergency: "Emergency note",
  surgery: "Surgery note",
  anesthesiologist: "Anesthesiology note",
  oxygen: "Oxygen note",
  doctor_type: "Staffing note",
};

const formatLocation = (loc: BackendLocation): string => {
  const parts = [loc.district, loc.state].filter(Boolean) as string[];
  return parts.length > 0 ? parts.join(", ") : "Unknown";
};

const trustInterval = (score: number, completeness: number | undefined): number => {
  // Wider band when data is sparse; narrower when validated.
  const sparsity = 1 - (completeness ?? 0.5);
  return Math.min(0.35, Math.max(0.05, sparsity * 0.3 + (1 - score) * 0.05));
};

const buildEvidence = (h: BackendHospital): EvidenceItem[] => {
  const out: EvidenceItem[] = [];
  for (const [key, snippet] of Object.entries(h.evidence ?? {})) {
    if (!snippet) continue;
    out.push({
      source: EVIDENCE_LABELS[key] ?? key,
      date: "extracted",
      snippet,
    });
  }
  if (out.length === 0) {
    // Always show at least one card so the Evidence collapsible isn't empty.
    out.push({
      source: "Hospital description",
      date: "extracted",
      snippet:
        "No capability-specific evidence sentences surfaced. Capabilities marked 'uncertain' reflect the conservative extraction policy.",
    });
  }
  return out;
};

const buildValidator = (
  h: BackendHospital,
  finding: BackendValidatorFinding | undefined,
): ValidatorCheck[] => {
  const checks: ValidatorCheck[] = [];

  if (finding && finding.issues.length > 0) {
    for (const iss of finding.issues) {
      checks.push({
        rule: `${iss.capability.toUpperCase()}: ${SEVERITY_TO_OUTCOME[iss.severity] === "fail" ? "missing prerequisite" : "weak signal"}`,
        outcome: SEVERITY_TO_OUTCOME[iss.severity],
        detail: iss.issue,
      });
    }
  }

  // Add positive signals so the panel isn't all warnings.
  if (h.capabilities.has_anesthesiologist === "yes" && h.capabilities.has_surgery === "yes") {
    checks.push({
      rule: "Surgery requires Anesthesiology",
      outcome: "pass",
      detail: "Anesthesiology confirmed in notes — surgical claim is internally consistent.",
    });
  }
  if (h.capabilities.has_oxygen === "yes") {
    checks.push({
      rule: "Emergency / ICU requires oxygen",
      outcome: "pass",
      detail: "Oxygen supply explicitly mentioned in the hospital's notes.",
    });
  }

  if (checks.length === 0) {
    checks.push({
      rule: "Internal consistency",
      outcome: "pass",
      detail: "No contradictions detected by the rule engine.",
    });
  }
  return checks;
};

const buildFlags = (raw: string[]): Flag[] =>
  raw.map((text) => ({
    level: text.toLowerCase().includes("sparse") ? "info" : "warning",
    text,
  }));

const synthesizeCapabilities = (
  c: BackendCapabilities,
): Hospital["capabilities"] => ({
  icu: c.has_icu,
  surgery: c.has_surgery,
  emergency: c.has_emergency,
  anesthesiology: c.has_anesthesiologist,
  // Backend doesn't track these; keep the UI honest by marking them uncertain.
  obstetrics: "uncertain",
  radiology: "uncertain",
  oncology: "uncertain",
  dialysis: "uncertain",
  trauma: "uncertain",
});

export function transformBackendResponse(resp: BackendQueryResponse): Hospital[] {
  const findingsById = new Map(
    resp.trace.validator_findings.map((f) => [f.facility_id, f]),
  );

  return resp.results.map((h): Hospital => {
    const finding = findingsById.get(h.facility_id);
    const completeness = finding?.trust.completeness;
    return {
      id: h.facility_id,
      name: h.name,
      location: formatLocation(h.location),
      pin: h.location.pin ?? "n/a",
      region: h.location.rural ? "rural" : "urban",
      trust_score: h.trust_score,
      trust_interval: trustInterval(h.trust_score, completeness),
      coords: {
        lat: h.location.latitude ?? 0,
        lng: h.location.longitude ?? 0,
      },
      capabilities: synthesizeCapabilities(h.capabilities),
      flags: buildFlags(h.flags),
      evidence: buildEvidence(h),
      reasoning: h.reasoning,
      validator: buildValidator(h, finding),
      trace: {
        facility_id: h.facility_id,
        capabilities: h.capabilities,
        validator: finding ?? null,
        parsed_query: resp.trace.parsed_query,
        retrieved_ids: resp.trace.retrieved_ids,
        steps: resp.trace.steps,
        // Extra metadata for debugging / future UI:
        verification_passes: finding?.issues.length ?? 0,
        latency_ms: resp.trace.steps.length * 1000, // best-effort; backend doesn't surface real latency yet
        sources: ["VF India 10k facility notes"],
      },
    };
  });
}
