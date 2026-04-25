import { useSyncExternalStore } from "react";

function subscribeMatch(query: string, onChange: () => void) {
  const m = window.matchMedia(query);
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
}

/**
 * 3D helix is heavy (Three.js + R3F). Use only on viewports that can fit it
 * and when the user has not asked for reduced motion.
 */
export function useEnableDnaHelix(): boolean {
  const isMdUp = useSyncExternalStore(
    (onChange) => subscribeMatch("(min-width: 768px)", onChange),
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );
  const reduceMotion = useSyncExternalStore(
    (onChange) => subscribeMatch("(prefers-reduced-motion: reduce)", onChange),
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  return isMdUp && !reduceMotion;
}
