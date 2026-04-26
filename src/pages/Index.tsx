import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { HeartbeatLogo } from "@/components/HeartbeatLogo";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { SearchBar } from "@/components/SearchBar";
import { HospitalCard } from "@/components/HospitalCard";
import { SkeletonResults } from "@/components/SkeletonResults";
import { TopRecommendation } from "@/components/TopRecommendation";
import { ScrollScene } from "@/components/ScrollScene";
import { AgentPipelineTrace } from "@/components/AgentPipelineTrace";
import { fetchHospitals, SUGGESTED_QUERIES, TOTAL_INDEXED, type Hospital, type QueryTrace } from "@/lib/mock";
import { haptic } from "@/lib/haptics";

const containerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const Index = () => {
  const [results, setResults] = useState<Hospital[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [agentTrace, setAgentTrace] = useState<QueryTrace | null>(null);

  const handleSearch = async (q: string) => {
    setLoading(true);
    setResults(null);
    setAgentTrace(null);
    setLastQuery(q);
    const { hospitals, trace } = await fetchHospitals(q);
    setResults(hospitals);
    setAgentTrace(trace);
    setLoading(false);
  };

  const handleReset = () => {
    haptic("select");
    setResults(null);
    setAgentTrace(null);
    setLoading(false);
    setLastQuery("");
    setSearchValue("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = results ?? [];
  const topPick = filtered[0];
  const restOfList = filtered.slice(1);

  return (
    <div className="min-h-screen relative">
      <ScrollScene />

      <div className="relative z-10">
        {/* Top nav strip */}
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-30 bg-background/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <HeartbeatLogo size={26} />
              <span className="text-sm font-semibold tracking-tight truncate">
                Healthcare<span className="text-primary">.</span>Intel
              </span>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative pt-6 sm:pt-16 pb-6 sm:pb-10 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedTitle
              text="Trust-scored medical discovery."
              className="text-[28px] sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] sm:leading-[1.05] text-balance px-1"
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="mt-3 sm:mt-6 max-w-2xl mx-auto text-[13px] sm:text-base md:text-lg text-muted-foreground px-2 leading-relaxed"
            >
              Every claim cross-verified. Every answer scored.
            </motion.p>

          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="mt-6 sm:mt-10"
          >
            <SearchBar
              onSubmit={handleSearch}
              loading={loading}
              value={searchValue}
              onValueChange={setSearchValue}
            />
          </motion.div>

          {/* Suggested queries */}
          {!results && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="mt-6 sm:mt-8 max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-3 mb-2 sm:mb-3 px-1">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 font-mono-tech">
                  Try
                </span>
                <div className="flex-1 h-px bg-border/40" />
              </div>
              <ul className="divide-y divide-border/40">
                {SUGGESTED_QUERIES.map((q, i) => (
                  <li key={q}>
                    <button
                      onClick={() => {
                        haptic("select");
                        setSearchValue(q);
                        handleSearch(q);
                      }}
                      className="group w-full flex items-center gap-3 sm:gap-4 px-1 py-3.5 sm:py-3 text-left text-muted-foreground hover:text-foreground active:text-foreground transition-colors min-h-[52px] sm:min-h-[44px]"
                    >
                      <span className="font-mono-tech text-[10px] text-muted-foreground/40 group-hover:text-primary transition-colors tabular-nums shrink-0 w-6">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[13px] sm:text-sm leading-snug flex-1">
                        {q}
                      </span>
                      <span className="text-primary/40 sm:text-primary/0 group-hover:text-primary transition-colors text-sm shrink-0">
                        →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </section>

        {/* Results area */}
        <section className="px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="max-w-4xl mx-auto">
            {/* Toolbar */}
            {(loading || results) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 sm:mb-6"
              >
                <button
                  onClick={handleReset}
                  aria-label="Back to search"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors min-h-[36px]"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back</span>
                </button>
              </motion.div>
            )}

            {loading && <SkeletonResults />}

            {!loading && results && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ResultsHeader query={lastQuery} count={filtered.length} total={results.length} />
                {filtered.length === 0 ? (
                  <EmptyState />
                ) : (
                  <>
                    {topPick && (
                      <TopRecommendation hospital={topPick} alternatives={restOfList} />
                    )}
                    {restOfList.length > 0 && (
                      <>
                        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-mono-tech mb-3 mt-2">
                          Other matches
                        </p>
                        <motion.div
                          variants={containerStagger}
                          initial="hidden"
                          animate="show"
                          className="space-y-4 sm:space-y-5"
                        >
                          {restOfList.map((h) => (
                            <HospitalCard key={h.id} hospital={h} />
                          ))}
                        </motion.div>
                      </>
                    )}
                    {agentTrace?.steps && agentTrace.steps.length > 0 && (
                      <AgentPipelineTrace steps={agentTrace.steps} />
                    )}
                  </>
                )}
              </motion.div>
            )}

            {!loading && !results && <IdleState />}
          </div>
        </section>
      </div>
    </div>
  );
};

const ResultsHeader = ({ query, count, total }: { query: string; count: number; total: number }) => (
  <div className="mb-4 sm:mb-5">
    <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-mono-tech">
      Query
    </p>
    <p className="text-foreground/90 mt-1 text-sm break-words">"{query}"</p>
    <p className="text-[11px] sm:text-xs text-muted-foreground mt-2 font-mono-tech">
      {count} of {total} matched · {TOTAL_INDEXED.toLocaleString()} indexed · sorted by trust
    </p>
  </div>
);

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 sm:p-10 text-center">
    <p className="text-sm text-muted-foreground">No facilities match this filter.</p>
  </div>
);

const PIPELINE = [
  {
    k: "Sources",
    v: "Gov · NABH · Institutional",
    d: "28 authority-weighted registries.",
    metric: "28",
    metricLabel: "feeds",
  },
  {
    k: "Verification",
    v: "3-pass cross-check",
    d: "Every claim contested before shipping.",
    metric: "3×",
    metricLabel: "passes",
  },
  {
    k: "Transparency",
    v: "Trust, evidence, Maps",
    d: "Scores and sources in one place — open Google Maps when you are ready to visit.",
    metric: "100%",
    metricLabel: "audit",
  },
] as const;

const IdleState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.4, duration: 0.6 }}
    className="relative mt-20 sm:mt-28 max-w-5xl mx-auto"
  >
    {/* Centered editorial header */}
    <div className="text-center mb-12 sm:mb-16">
      <span className="text-[10px] uppercase tracking-[0.4em] text-primary/80 font-mono-tech">
        How we do it
      </span>
      <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
        We don't <em className="not-italic text-primary">guess.</em>{" "}
        We <span className="underline decoration-primary/40 decoration-2 underline-offset-[6px]">cross-examine.</span>
      </h2>
    </div>

    {/* Clean 3-column grid */}
    {/* Single horizontal bar with three segments */}
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.5, ease: "easeOut" }}
      className="relative z-10 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col md:flex-row md:divide-x divide-y md:divide-y-0 divide-border/60"
    >
      {PIPELINE.map((c, i) => (
        <div
          key={c.k}
          className="group relative flex-1 p-6 sm:p-7 hover:bg-card/60 transition-colors"
        >
          {/* Step index */}
          <div className="flex items-baseline justify-between mb-4">
            <span className="font-mono-tech text-[10px] tracking-widest text-muted-foreground/60">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-mono-tech">
              {c.k}
            </span>
          </div>

          {/* Big metric */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-bold tracking-tight text-primary tabular-nums">
              {c.metric}
            </span>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-mono-tech">
              {c.metricLabel}
            </span>
          </div>

          {/* Title + description */}
          <p className="mt-5 text-base sm:text-[17px] font-semibold tracking-tight leading-snug text-foreground/95">
            {c.v}
          </p>
          <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
            {c.d}
          </p>

          {/* Bottom accent */}
          <div className="mt-5 h-px w-8 bg-primary/50 transition-all duration-500 group-hover:w-full" />
        </div>
      ))}
    </motion.div>
  </motion.div>
);

export default Index;
