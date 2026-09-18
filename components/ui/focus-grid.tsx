"use client";

import { createContext, useContext, useState } from "react";
import { BentoGrid } from "@/components/ui/bento-grid";
import { useCanHover } from "@/hooks/use-can-hover";
import { cn } from "@/lib/utils";

type FocusState = {
  focused: number | null;
  setFocused: (index: number | null) => void;
  canHover: boolean;
};

const FocusGridContext = createContext<FocusState | null>(null);

export function FocusGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [focused, setFocused] = useState<number | null>(null);
  const canHover = useCanHover();

  return (
    <FocusGridContext.Provider value={{ focused, setFocused, canHover }}>
      <BentoGrid className={className}>{children}</BentoGrid>
    </FocusGridContext.Provider>
  );
}

export function FocusGridItem({
  index,
  children,
  className,
}: {
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(FocusGridContext);
  if (!ctx) throw new Error("FocusGridItem must be rendered inside a FocusGrid");

  const { focused, setFocused, canHover } = ctx;
  const dimmed = canHover && focused !== null && focused !== index;

  return (
    <div
      onMouseEnter={canHover ? () => setFocused(index) : undefined}
      onMouseLeave={canHover ? () => setFocused(null) : undefined}
      onFocusCapture={canHover ? () => setFocused(index) : undefined}
      onBlurCapture={canHover ? () => setFocused(null) : undefined}
      className={cn(
        "transition-[opacity,filter,transform] duration-300 ease-entrance",
        dimmed && "opacity-60 blur-[2px] motion-safe:scale-[0.98]",
        className,
      )}
    >
      {children}
    </div>
  );
}
