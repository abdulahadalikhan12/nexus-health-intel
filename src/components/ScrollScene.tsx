import { lazy, Suspense } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEnableDnaHelix } from "@/hooks/use-enable-dna-helix";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

/** Code-split Three.js + R3F so mobile / first paint avoid ~500KB+ parser work. */
const DnaHelix = lazy(() =>
  import("./three/DnaHelix").then((m) => ({ default: m.DnaHelix })),
);

/**
 * Fixed, full-viewport scroll-reactive backdrop:
 *  - 3D DNA helix that rotates + stretches with scroll
 *  - Parallax radial glow that drifts upward
 *  - A horizontal scanline that sweeps based on progress
 * Sits behind all content (pointer-events-none) so the UI stays interactive.
 */
export const ScrollScene = () => {
  const progress = useScrollProgress();
  const showHelix = useEnableDnaHelix();
  const { scrollYProgress } = useScroll();

  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const scanY = useTransform(scrollYProgress, [0, 1], ["10vh", "85vh"]);
  const helixOpacity = useTransform(scrollYProgress, [0, 0.05, 0.85, 1], [0.55, 0.9, 0.9, 0.4]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Drifting radial glow */}
      <motion.div
        style={{ y: glowY }}
        className="absolute -top-1/3 left-1/2 -translate-x-1/2 size-[120vmin] rounded-full blur-3xl"
      >
        <div className="size-full rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.25)_0%,transparent_60%)]" />
      </motion.div>

      {/* Sweeping scanline */}
      <motion.div
        style={{ y: scanY }}
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
      />

      {/* DNA helix — desktop only, lazy-loaded (no WebGL on mobile: battery + TBT) */}
      {showHelix && (
        <motion.div
          style={{ opacity: helixOpacity }}
          className="absolute right-[-6vw] top-1/2 -translate-y-1/2 w-[55vw] max-w-[680px] h-[90vh]"
        >
          <Suspense
            fallback={
              <div
                className="size-full rounded-[30%] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12)_0%,transparent_65%)] blur-2xl"
                aria-hidden
              />
            }
          >
            <DnaHelix progress={progress} className="w-full h-full" />
          </Suspense>
        </motion.div>
      )}

      {/* Mobile: static glow only — no Canvas / Three.js */}
      <motion.div
        style={{ opacity: helixOpacity }}
        className="absolute md:hidden left-1/2 -translate-x-1/2 bottom-[-12vh] w-[110vw] h-[50vh] pointer-events-none"
      >
        <div
          className="size-full bg-[radial-gradient(ellipse_80%_60%_at_50%_60%,hsl(var(--primary)/0.2)_0%,hsl(280_60%_50%/0.08)_35%,transparent_70%)] blur-3xl"
          aria-hidden
        />
      </motion.div>
    </div>
  );
};