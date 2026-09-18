"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Whether the visitor asked for reduced motion.
 *
 * Prefer this over framer-motion's `useReducedMotion()` whenever the value
 * decides **what gets rendered** rather than just an animation's values.
 * framer's hook resolves to `false` during SSR and to the real preference on the
 * client, so branching markup on it produces a hydration mismatch — that is
 * exactly what broke the carousel's pause control. `useSyncExternalStore` gives
 * React a server snapshot to hydrate against and then re-renders with the real
 * value, which is the supported way to do this.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
