"use client";

import { useSyncExternalStore } from "react";

// Touch devices never really hover: Android Chrome fires one synthetic
// mousemove on tap, which leaves pointer-tracked cards stuck mid-transform with
// no un-hover event to undo it. Anything that follows the cursor should ask
// first — and skipping the machinery entirely on touch is also the cheaper path
// on the grids that render 20+ tiles.
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(HOVER_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * True when the device has a real hovering pointer.
 *
 * Subscribed rather than read in an effect so the server snapshot is `false`,
 * hydration agrees with it, and plugging in a mouse re-enables the effect
 * without a remount.
 */
export function useCanHover(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(HOVER_QUERY).matches,
    () => false,
  );
}
