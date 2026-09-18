"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useCanHover } from "@/hooks/use-can-hover";
import { EASE_ENTRANCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;

  tilt?: number;
};

export function TiltCard({ children, className, tilt = 10 }: TiltCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const canHover = useCanHover();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [tilt, -tilt]), {
    stiffness: 300,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-tilt, tilt]), {
    stiffness: 300,
    damping: 20,
  });

  if (shouldReduceMotion || !canHover) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: EASE_ENTRANCE }}
        className={cn("size-full", className)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div style={{ perspective: "62.5rem" }} className="size-full">
      <motion.div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          x.set((e.clientX - rect.left) / rect.width);
          y.set((e.clientY - rect.top) / rect.height);
        }}
        onMouseLeave={() => {
          x.set(0.5);
          y.set(0.5);
        }}
        whileHover={{ y: -6, scale: 1.03 }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn("relative size-full", className)}
      >
        {children}
      </motion.div>
    </div>
  );
}
