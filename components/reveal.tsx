"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE_ENTRANCE } from "@/lib/motion";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;

  distance?: number;
};

export function Reveal({ children, delay = 0, className, distance = 60 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight) {
      setHidden(true);
    }
  }, []);

  const visible = !hidden || inView;
  const travel = shouldReduceMotion ? 0 : distance;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: travel }}
      transition={
        !visible
          ? { duration: 0 }
          : shouldReduceMotion
            ? { duration: 0.4, ease: EASE_ENTRANCE, delay }
            : {
                type: "spring",
                stiffness: 100,
                damping: 14,
                mass: 0.9,
                delay,
              }
      }
    >
      {children}
    </motion.div>
  );
}
