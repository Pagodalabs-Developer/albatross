"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { useCanHover } from "@/hooks/use-can-hover";
import { cn } from "@/lib/utils";

export function WobbleCard({
  children,
  containerClassName,
  className,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const canHover = useCanHover();
  const wobbles = canHover && !shouldReduceMotion;

  const translate = (x: number, y: number, scale = 1) =>
    `translate3d(${x}px, ${y}px, 0) scale3d(${scale}, ${scale}, 1)`;

  return (
    <motion.section
      onMouseMove={
        wobbles
          ? (event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setOffset({
                x: (event.clientX - (rect.left + rect.width / 2)) / 20,
                y: (event.clientY - (rect.top + rect.height / 2)) / 20,
              });
            }
          : undefined
      }
      onMouseEnter={wobbles ? () => setHovering(true) : undefined}
      onMouseLeave={
        wobbles
          ? () => {
              setHovering(false);
              setOffset({ x: 0, y: 0 });
            }
          : undefined
      }
      style={{
        transform: hovering ? translate(offset.x, offset.y) : translate(0, 0),
        transition: "transform 100ms ease-out",
      }}
      className={cn(
        "relative w-full overflow-hidden rounded-card bg-inverse text-inverse-foreground shadow-card transition-shadow duration-300 hover:shadow-elevated",
        containerClassName,
      )}
    >
      <motion.div
        style={{
          transform: hovering
            ? translate(-offset.x, -offset.y, 1.03)
            : translate(0, 0, 1),
          transition: "transform 100ms ease-out",
        }}
        className={cn("h-full", className)}
      >
        {children}
      </motion.div>
    </motion.section>
  );
}
