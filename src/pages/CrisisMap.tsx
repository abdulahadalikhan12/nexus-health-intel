import { useEffect, useState } from "react";
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

/**
 * Approx. India bounding box for screen projection (not official survey).
 * lon 68–97°E, lat 6–37°N
 */
function project(lng: number, lat: number): { x: number; y: number } {
  const x = ((lng - 68) / (97 - 68)) * 100;
  const y = ((37 - lat) / (37 - 6)) * 100;
  return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"] as const;

function riskColor(r: number): string {
  if (r >= 0.75) return COLORS[0];
  if (r >= 0.5) return COLORS[1];
  if (r >= 0.25) return COLORS[2];
  return COLORS[3];
}

const CrisisMap = () => {
  const [zones, setZones] = useState<PinZone[]>([]);
  const [cap, setCap] = useState("icu");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const backend = import.meta.env.VITE_BACKEND_URL as string | undefined;

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!backend) {
        setErr("Set VITE_BACKEND_URL to load crisis data.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const url = `${backend.replace(/\/+$/, "")}/desert-map/pins?capability=${encodeURIComponent(cap)}&top=60`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (!cancel) setZones(Array.isArray(data.zones) ? data.zones : []);
      } catch (e) {
        if (!cancel) setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [backend, cap]);

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
            <ArrowLeft className="size-3.5" />
            Search
          </Link>
        </header>

        <div className="mt-8 sm:mt-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="size-7 text-trust-mid shrink-0" />
            Crisis map — medical deserts by PIN
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            PIN-level risk from our extracted capabilities: share of facilities in each PIN that are{" "}
            <code className="text-xs">no</code> or <code className="text-xs">uncertain</code> on the
            selected axis. Larger, redder dots = higher risk (bigger capability gap).
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="text-xs text-muted-foreground font-mono-tech">Capability</label>
            <select
              value={cap}
              onChange={(e) => setCap(e.target.value)}
              className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm"
            >
              {["icu", "emergency", "surgery", "anesthesiologist", "oxygen"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="mt-12 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Loading PIN zones…
          </div>
        )}
        {err && (
          <div className="mt-8 rounded-xl border border-trust-mid/40 bg-trust-mid/10 text-trust-mid text-sm p-4">
            {err}
          </div>
        )}

        {!loading && !err && (
          <div className="mt-8 rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6 overflow-hidden">
            <div
              className="relative w-full aspect-[4/3] max-h-[min(70vh,520px)] rounded-xl bg-gradient-to-br from-background via-secondary/20 to-background border border-border/40"
              style={{
                backgroundImage: `radial-gradient(ellipse 80% 60% at 50% 45%, hsl(var(--primary) / 0.08), transparent)`,
              }}
            >
              {/* Simplified India silhouette hint (decorative) */}
              <div
                className="absolute inset-[8%] rounded-[40%_60%_55%_45%] border border-border/30 opacity-40 pointer-events-none"
                aria-hidden
              />
              {zones.map((z) => {
                if (z.centroid_lat == null || z.centroid_lng == null) return null;
                const { x, y } = project(z.centroid_lng, z.centroid_lat);
                const size = 8 + z.risk * 20;
                return (
                  <div
                    key={`${z.pin}-${z.state ?? ""}`}
                    className="absolute rounded-full border-2 border-background/80 shadow-lg -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-default"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: size,
                      height: size,
                      backgroundColor: riskColor(z.risk),
                    }}
                    title={`PIN ${z.pin} · ${z.state ?? "?"} — risk ${(z.risk * 100).toFixed(0)}% (${z.missing_or_uncertain}/${z.total} weak/missing on ${z.capability})`}
                  />
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-muted-foreground font-mono-tech">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: COLORS[0] }} />
                75–100% risk
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: COLORS[1] }} />
                50–75%
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: COLORS[2] }} />
                25–50%
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: COLORS[3] }} />
                0–25%
              </span>
            </div>
          </div>
        )}

        {!loading && !err && zones.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-muted-foreground border-b border-border/60">
                  <th className="py-2 pr-2">PIN</th>
                  <th className="py-2 pr-2">State</th>
                  <th className="py-2 pr-2">Risk</th>
                  <th className="py-2 pr-2">Gap</th>
                  <th className="py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {zones.slice(0, 25).map((z) => (
                  <tr key={`${z.pin}-row`} className="border-b border-border/30">
                    <td className="py-2 font-mono-tech">{z.pin}</td>
                    <td className="py-2">{z.state ?? "—"}</td>
                    <td className="py-2 text-trust-mid">{(z.risk * 100).toFixed(0)}%</td>
                    <td className="py-2">
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
