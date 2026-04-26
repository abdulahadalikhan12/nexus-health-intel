import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { HeartbeatLogo } from "@/components/HeartbeatLogo";
import { ScrollScene } from "@/components/ScrollScene";

type PinZone = {
  pin: string;
  state: string | null;
  capability: string;
  total: number;
  missing_or_uncertain: number;
  risk: number;
  centroid_lat: number | null;
  centroid_lng: number | null;
};

/** Approx. India bounding box: lon 68–97°E, lat 6–37°N. */
function project(lng: number, lat: number): { x: number; y: number } {
  const x = ((lng - 68) / (97 - 68)) * 100;
  const y = ((37 - lat) / (37 - 6)) * 100;
  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
  };
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"] as const;
function riskColor(r: number): string {
  if (r >= 0.75) return COLORS[0];
  if (r >= 0.5) return COLORS[1];
  if (r >= 0.25) return COLORS[2];
  return COLORS[3];
}

const CAPS = ["icu", "emergency", "surgery", "anesthesiologist", "oxygen"] as const;

const CrisisMap = () => {
  const [zones, setZones] = useState<PinZone[]>([]);
  const [cap, setCap] = useState<(typeof CAPS)[number]>("icu");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const backend = import.meta.env.VITE_BACKEND_URL as string | undefined;

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!backend) {
        setErr("VITE_BACKEND_URL not set.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const base = backend.replace(/\/+$/, "");
        const res = await fetch(
          `${base}/desert-map/pins?capability=${encodeURIComponent(cap)}&top=80`,
        );
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (!cancel) setZones(Array.isArray(data.zones) ? data.zones : []);
      } catch (e) {
        if (!cancel) setErr(e instanceof Error ? e.message : "failed");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [backend, cap]);

  const top = useMemo(
    () => zones.filter((z) => z.centroid_lat != null && z.centroid_lng != null),
    [zones],
  );

  return (
    <div className="min-h-screen relative">
      <ScrollScene />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-30 bg-background/80 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <HeartbeatLogo size={26} />
            <span className="text-sm font-semibold tracking-tight truncate">
              Healthcare<span className="text-primary">.</span>Intel
            </span>
          </div>
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
          >
            <ArrowLeft className="size-3.5" /> Search
          </Link>
        </header>

        <div className="mt-8 sm:mt-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="size-7 text-trust-mid shrink-0" />
            Crisis map — medical deserts by PIN
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            PIN-level risk from capabilities extracted on Databricks: share of
            facilities in each PIN that are <code>no</code> or <code>uncertain</code>{" "}
            on the selected axis. Larger, redder dots = bigger capability gap.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="text-xs text-muted-foreground font-mono-tech">
              Capability
            </label>
            <select
              value={cap}
              onChange={(e) => setCap(e.target.value as (typeof CAPS)[number])}
              className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm"
            >
              {CAPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading PIN zones…
          </div>
        )}
        {err && (
          <div className="mt-10 rounded-lg border border-trust-mid/30 bg-trust-mid/10 text-trust-mid px-3 py-2 text-sm">
            {err}
          </div>
        )}

        {!loading && !err && (
          <div className="mt-8">
            <div className="relative aspect-[4/5] sm:aspect-[5/4] max-h-[70vh] w-full rounded-2xl border border-border/50 bg-secondary/20 overflow-hidden">
              {top.map((z) => {
                const { x, y } = project(z.centroid_lng!, z.centroid_lat!);
                const size = 8 + z.risk * 20;
                return (
                  <div
                    key={z.pin}
                    title={`${z.pin} — ${z.state ?? ""} · risk ${(z.risk * 100).toFixed(0)}% (${z.missing_or_uncertain}/${z.total})`}
                    className="absolute rounded-full"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: size,
                      height: size,
                      transform: "translate(-50%, -50%)",
                      background: riskColor(z.risk),
                      opacity: 0.7,
                      boxShadow: "0 0 10px rgba(0,0,0,0.4)",
                    }}
                  />
                );
              })}
              <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground/80 font-mono-tech">
                {top.length} PINs · India
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full" style={{ background: COLORS[0] }} />
                75–100%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full" style={{ background: COLORS[1] }} />
                50–75%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full" style={{ background: COLORS[2] }} />
                25–50%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full" style={{ background: COLORS[3] }} />
                0–25%
              </span>
            </div>
          </div>
        )}

        {!loading && !err && zones.length > 0 && (
          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead className="text-muted-foreground font-mono-tech text-[11px] uppercase">
                <tr>
                  <th className="text-left py-2 pr-3">PIN</th>
                  <th className="text-left py-2 pr-3">State</th>
                  <th className="text-left py-2 pr-3">Risk</th>
                  <th className="text-left py-2 pr-3">Gap</th>
                  <th className="text-left py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {zones.slice(0, 25).map((z) => (
                  <tr key={`${z.pin}-row`} className="border-b border-border/30">
                    <td className="py-2 pr-3 font-mono-tech">{z.pin}</td>
                    <td className="py-2 pr-3">{z.state ?? "—"}</td>
                    <td className="py-2 pr-3 text-trust-mid">
                      {(z.risk * 100).toFixed(0)}%
                    </td>
                    <td className="py-2 pr-3">
                      {z.missing_or_uncertain} / {z.total}
                    </td>
                    <td className="py-2">{z.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrisisMap;
