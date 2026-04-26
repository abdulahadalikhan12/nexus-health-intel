export type Capability = "yes" | "no" | "uncertain";

export interface Flag {
  level: "warning" | "info";
  text: string;
}

export interface EvidenceItem {
  source: string;
  date: string;
  snippet: string;
  url?: string;
}

export interface ValidatorCheck {
  rule: string;
  outcome: "pass" | "fail" | "warn";
  detail: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  pin: string;
  region: "urban" | "rural";
  trust_score: number;
  /** ± confidence interval around the trust score (0..1) */
  trust_interval: number;
  coords: { lat: number; lng: number };
  /** When set, "Call" uses tel: so the device opens the dialer with the number. */
  phone?: string;
  /** When set, "Email" opens the default client with this address in To. */
  email?: string;
  capabilities: {
    icu: Capability;
    surgery: Capability;
    emergency: Capability;
    anesthesiology: Capability;
    obstetrics: Capability;
    radiology: Capability;
    /** Specialized-desert capabilities called out by the brief */
    oncology: Capability;
    dialysis: Capability;
    trauma: Capability;
  };
  flags: Flag[];
  evidence: EvidenceItem[];
  reasoning: string;
  validator: ValidatorCheck[];
  trace: Record<string, unknown>;
  /** Decomposed trust inputs (from API); justifies the trust % with step-level factors. */
  trust_breakdown?: {
    completeness: number;
    consistency: number;
    validator: number;
    evidence_strength: number;
  };
}

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "aiims-patna",
    name: "AIIMS Patna",
    location: "Patna, Bihar",
    pin: "801507",
    region: "urban",
    trust_score: 0.88,
    trust_interval: 0.04,
    coords: { lat: 25.6093, lng: 85.1376 },
    phone: "+91-612-245-1070",
    email: "helpdesk@aiimspatna.edu.in",
    capabilities: {
      icu: "yes",
      surgery: "yes",
      emergency: "yes",
      anesthesiology: "yes",
      obstetrics: "yes",
      radiology: "yes",
      oncology: "yes",
      dialysis: "yes",
      trauma: "yes",
    },
    flags: [],
    evidence: [
      {
        source: "Ministry of Health & Family Welfare",
        date: "2024-08-12",
        snippet:
          "AIIMS Patna operates a 960-bed tertiary care centre with 24/7 trauma, ICU, and multi-specialty surgical services.",
      },
      {
        source: "AIIMS Patna Annual Report 2024",
        date: "2024-04-30",
        snippet:
          "The institute maintains 12 modular operation theatres, a 64-bed intensive care unit, a 40-station dialysis ward, and a dedicated oncology block — all NABH verified.",
      },
      {
        source: "NABH Accreditation Database",
        date: "2024-01-22",
        snippet:
          "Active NABH full accreditation status for emergency medicine, critical care, oncology, and surgical disciplines.",
      },
    ],
    reasoning:
      "Three independent high-confidence sources (government, institutional, accreditation body) cross-validate every capability claim. Recency within 12 months. Trust score weighted by source authority (0.35 gov, 0.30 institutional, 0.25 accreditation) and capability completeness (1.0).",
    validator: [
      { rule: "Surgery requires Anesthesiology", outcome: "pass", detail: "Anesthesia staff verified across 3 sources." },
      { rule: "ICU requires ventilator + monitor count", outcome: "pass", detail: "64 beds with 64 monitors reported in 2024 audit." },
      { rule: "Oncology requires linac/chemotherapy", outcome: "pass", detail: "Linac uptime 97% in NABH report." },
    ],
    trace: {
      query_id: "qry_8af21c",
      retrieved_documents: 47,
      passed_filter: 12,
      verification_passes: 3,
      consensus_score: 0.91,
      sources: ["mohfw.gov.in", "aiims-patna.edu.in", "nabh.co"],
      latency_ms: 1842,
    },
  },
  {
    id: "rhc-gaya",
    name: "Rural Health Centre Gaya",
    location: "Gaya District, Bihar",
    pin: "823001",
    region: "rural",
    trust_score: 0.42,
    trust_interval: 0.18,
    coords: { lat: 24.7914, lng: 85.0002 },
    phone: "+91-631-123-4561",
    email: "rhc.gaya@biharhealth.gov.in",
    capabilities: {
      icu: "uncertain",
      surgery: "no",
      emergency: "yes",
      anesthesiology: "no",
      obstetrics: "yes",
      radiology: "uncertain",
      oncology: "no",
      dialysis: "no",
      trauma: "uncertain",
    },
    flags: [
      { level: "warning", text: "No anesthesiologist on staff — surgical capability cannot be verified." },
      { level: "warning", text: "ICU bed count reported inconsistently across sources (2018 vs 2023)." },
      { level: "warning", text: "Specialized desert: nearest oncology / dialysis is 110+ km away." },
      { level: "info", text: "Last verified site visit was 18 months ago." },
    ],
    evidence: [
      {
        source: "Bihar State Health Society Directory",
        date: "2023-11-04",
        snippet:
          "Rural Health Centre Gaya provides primary maternal care and outpatient emergency triage. Staffing: 2 medical officers, 4 nurses.",
      },
      {
        source: "District Health Profile, Gaya (2022)",
        date: "2022-09-15",
        snippet:
          "Facility lacks dedicated anesthesia coverage; surgical referrals routed to district hospital 47 km away. No oncology or dialysis provisioning.",
      },
    ],
    reasoning:
      "Limited source diversity (2 sources, both regional). Conflicting capability data on ICU. Absence of anesthesiology contradicts surgical claims. Trust score penalized for source recency (-0.15) and internal inconsistency (-0.20). Wide confidence interval reflects data sparsity.",
    validator: [
      { rule: "Surgery requires Anesthesiology", outcome: "fail", detail: "Surgery claim absent + no anesthesia — coherent (no contradiction) but capability gap confirmed." },
      { rule: "Trauma capability requires 24/7 OT", outcome: "warn", detail: "Trauma listed as uncertain; OT staffing logs missing." },
      { rule: "Oncology / Dialysis presence", outcome: "fail", detail: "Both absent — flagged as Specialized Desert." },
    ],
    trace: {
      query_id: "qry_8af21c",
      retrieved_documents: 11,
      passed_filter: 4,
      verification_passes: 1,
      consensus_score: 0.48,
      sources: ["bshs.gov.in", "gaya.nic.in"],
      conflicts: [
        { field: "icu_beds", values: ["4", "0", "uncertain"] },
        { field: "anesthesiology", values: ["no", "occasional"] },
      ],
      latency_ms: 2104,
    },
  },
  {
    id: "dh-muzaffarpur",
    name: "District Hospital Muzaffarpur",
    location: "Muzaffarpur, Bihar",
    pin: "842001",
    region: "urban",
    trust_score: 0.61,
    trust_interval: 0.09,
    coords: { lat: 26.1209, lng: 85.3647 },
    phone: "+91-621-123-4500",
    email: "dmh.muzafarpur@health.bihar.gov.in",
    capabilities: {
      icu: "yes",
      surgery: "yes",
      emergency: "yes",
      anesthesiology: "uncertain",
      obstetrics: "yes",
      radiology: "yes",
      oncology: "no",
      dialysis: "yes",
      trauma: "yes",
    },
    flags: [
      { level: "warning", text: "Anesthesiology coverage reported as part-time — verify before referral." },
      { level: "info", text: "Equipment audit pending for 2024 cycle." },
    ],
    evidence: [
      {
        source: "Bihar Directorate of Health Services",
        date: "2024-03-18",
        snippet:
          "200-bed district hospital with 8-bed ICU, 3 operation theatres, 12-station dialysis unit, and 24/7 emergency department serving Muzaffarpur and adjoining blocks.",
      },
      {
        source: "PIB News Release",
        date: "2024-06-02",
        snippet:
          "District Hospital Muzaffarpur received CT scanner upgrade and added 12 ICU monitors under PM-ABHIM scheme.",
      },
      {
        source: "Local Medical Association Bulletin",
        date: "2023-12-09",
        snippet:
          "Two anesthesiology positions remain unfilled; current coverage rotates across two nearby facilities.",
      },
    ],
    reasoning:
      "Mixed-confidence profile. Strong infrastructure verification from 2 government sources. Anesthesiology gap creates moderate risk for elective surgery referrals. Trust score reflects partial capability verification (0.61 = high infra, mid staffing).",
    validator: [
      { rule: "Surgery requires Anesthesiology", outcome: "warn", detail: "Anesthesia rotated part-time across facilities — surgical reliability degraded." },
      { rule: "Dialysis station-to-population ratio", outcome: "pass", detail: "12 stations meet WHO district threshold." },
      { rule: "Oncology coverage", outcome: "fail", detail: "No oncology unit — refer to AIIMS Patna (75 km)." },
    ],
    trace: {
      query_id: "qry_8af21c",
      retrieved_documents: 23,
      passed_filter: 7,
      verification_passes: 2,
      consensus_score: 0.66,
      sources: ["bihar-health.gov.in", "pib.gov.in", "bma-muzaffarpur.org"],
      latency_ms: 1967,
    },
  },
];

/** Headline scale stat shown on results header — total facilities the agent indexed. */
export const TOTAL_INDEXED = 10247;

export const SUGGESTED_QUERIES: string[] = [
  "Find rural Bihar facilities for emergency appendectomy with part-time doctors",
  "Where are the oncology deserts in Bihar?",
  "Hospitals with verified ICU + anesthesiology within 50 km of Gaya",
  "Dialysis-capable facilities serving rural districts",
];

export type QueryTrace = {
  steps: string[];
  parsed_query?: Record<string, unknown>;
};

const DEFAULT_TB = {
  completeness: 0.72,
  consistency: 0.85,
  validator: 0.78,
  evidence_strength: 0.68,
};

function withDemoTrustBreakdown(hospitals: Hospital[]): Hospital[] {
  return hospitals.map((h) => ({
    ...h,
    trust_breakdown: h.trust_breakdown ?? DEFAULT_TB,
  }));
}

export async function fetchHospitals(query: string): Promise<{
  hospitals: Hospital[];
  trace: QueryTrace | null;
}> {
  const backend = import.meta.env.VITE_BACKEND_URL as string | undefined;
  if (backend) {
    try {
      const res = await fetch(`${backend.replace(/\/+$/, "")}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(`backend ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data?.results) && data.results.length) {
        const { transformBackendResponse } = await import("./api");
        const hospitals = transformBackendResponse(data);
        const trace: QueryTrace | null = data.trace
          ? { steps: data.trace.steps ?? [], parsed_query: data.trace.parsed_query }
          : null;
        return { hospitals, trace };
      }
    } catch (e) {
      console.warn("Backend call failed, falling back to mock data:", e);
    }
  }
  await new Promise((r) => setTimeout(r, 2400));
  return {
    hospitals: withDemoTrustBreakdown(MOCK_HOSPITALS),
    trace: {
      steps: [
        "Parsed natural-language query into structured location + capabilities.",
        "Retrieved candidate facilities via hybrid FAISS + metadata filters.",
        "Ran capability extraction on each candidate (cache or live LLM).",
        "Validator: medical rules + optional standards cross-check (Tavily).",
        "Trust scoring: completeness, consistency, validator, evidence strength.",
        "Ranked and composed agent reasoning for top results.",
      ],
      parsed_query: { query },
    },
  };
}
