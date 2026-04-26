import { BookOpen } from "lucide-react";
import { Collapsible } from "@/components/Collapsible";

/** Step-level log for the whole query (mirrors MLflow artifact `steps/*.json`). */
export const AgentPipelineTrace = ({ steps }: { steps: string[] }) => {
  if (!steps?.length) return null;
  return (
    <div className="mt-6 rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5">
      <Collapsible title="End-to-end pipeline trace" badge={steps.length} defaultOpen={false}>
        <p className="text-xs text-muted-foreground mb-3">
          Ordered agent steps for this query. The same sequence is logged to MLflow (experiment run per
          query: artifacts include <code className="text-[10px]">agent_traceability_tree.json</code> and{" "}
          <code className="text-[10px]">traces/span_*.txt</code>).
        </p>
        <ol className="list-decimal list-inside space-y-2 text-xs text-muted-foreground leading-relaxed">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        <p className="text-[10px] text-muted-foreground/80 mt-4 flex items-center gap-1.5">
          <BookOpen className="size-3 shrink-0" />
          Open the MLflow UI for this deployment to visualize runs and compare traces across queries.
        </p>
      </Collapsible>
    </div>
  );
};
