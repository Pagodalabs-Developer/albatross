"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { EASE_ENTRANCE } from "@/lib/motion";
import type { GalleryImage } from "@/lib/types";

type LightboxContext = {
  open: (index: number) => void;
  openIndex: number | null;
};

const Ctx = createContext<LightboxContext | null>(null);

const FLICK_VELOCITY = 400;
const PAGE_DISTANCE = 96;
const DISMISS_DISTANCE = 120;

const MAX_LEAN = 14;

export function GalleryLightbox({
  photos,
  children,
}: {
  photos: GalleryImage[];
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);

  const [origin, setOrigin] = useState<number | null>(null);

  const [direction, setDirection] = useState(1);
  const shouldReduceMotion = useReducedMotion();

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const lean = useTransform(dragX, [-320, 0, 320], [MAX_LEAN, 0, -MAX_LEAN]);

  const recede = useTransform(dragY, [0, 320], [1, 0.86]);
  const fade = useTransform(dragY, [0, 320], [1, 0.4]);

  const resetDrag = useCallback(() => {
    dragX.set(0);
    dragY.set(0);
  }, [dragX, dragY]);

  const close = useCallback(() => {
    setIndex(null);
    resetDrag();
  }, [resetDrag]);

  const open = useCallback(
    (i: number) => {
      setDirection(1);
      setOrigin(i);
      setIndex(i);
      resetDrag();
    },
    [resetDrag],
  );

  const paginate = useCallback(
    (step: number) => {
      setDirection(step);
      setIndex((i) => (i === null ? i : (i + step + photos.length) % photos.length));
      resetDrag();
    },
    [photos.length, resetDrag],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, paginate]);

  const onDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    if (Math.abs(offset.y) > Math.abs(offset.x)) {
      if (offset.y > DISMISS_DISTANCE || velocity.y > FLICK_VELOCITY) close();
      else resetDrag();
      return;
    }
    if (offset.x < -PAGE_DISTANCE || velocity.x < -FLICK_VELOCITY) paginate(1);
    else if (offset.x > PAGE_DISTANCE || velocity.x > FLICK_VELOCITY) paginate(-1);
    else resetDrag();
  };

  const photo = index === null ? null : photos[index];
  const around =
    index === null
      ? []
      : [photos[(index + 1) % photos.length], photos[(index - 1 + photos.length) % photos.length]];

  const sharedId =
    index !== null && index === origin && !shouldReduceMotion
      ? `gallery-photo-${origin}`
      : undefined;

  const slide = shouldReduceMotion ? 0 : 64;

  const frame = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? slide : -slide }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -slide : slide }),
  };

  const position = index === null ? 0 : index + 1;

  return (
    <Ctx.Provider value={{ open, openIndex: index }}>
      {children}

      <Dialog.Root open={index !== null} onOpenChange={(next) => !next && close()}>
        <AnimatePresence>
          {photo && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE_ENTRANCE }}

                  className="fixed inset-0 z-50 bg-black/95"
                />
              </Dialog.Overlay>

              <Dialog.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE_ENTRANCE }}

                  onClick={(e) => e.target === e.currentTarget && close()}
                  className="fixed inset-0 z-50 flex flex-col outline-none"
                >

                  <Dialog.Title className="sr-only">Gallery</Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Use the left and right arrow keys to move between photographs, or Escape
                    to close.
                  </Dialog.Description>

                  <div className="flex shrink-0 items-center justify-between px-4 py-3 md:px-6">
                    <p className="font-display text-accent-display tabular-nums text-white/70">
                      {String(position).padStart(2, "0")}
                      <span className="text-white/35"> / {String(photos.length).padStart(2, "0")}</span>
                    </p>
                    <Dialog.Close
                      aria-label="Close gallery"
                      className="flex size-11 items-center justify-center rounded-full text-white/70 transition-[color,background-color,transform] duration-[160ms] ease-entrance hover:bg-white/10 hover:text-white active:scale-[0.92]"
                    >
                      <X aria-hidden className="size-5" />
                    </Dialog.Close>
                  </div>

                  <div
                    onClick={(e) => e.target === e.currentTarget && close()}

                    style={{ perspective: "1600px" }}
                    className="relative min-h-0 flex-1"
                  >

                    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0">
                      {around.map((p) => (
                        <Image
                          key={p.slug}
                          src={p.image}
                          alt=""
                          fill
                          sizes="100vw"
                          className="object-contain p-3 md:p-6"
                        />
                      ))}
                    </div>

                    <motion.div
                      layoutId={sharedId}
                      transition={{ duration: 0.32, ease: EASE_ENTRANCE }}
                      className="absolute inset-0"
                    >

                      <AnimatePresence initial={false} custom={direction}>
                        <motion.figure
                          key={photo.slug}
                          custom={direction}
                          variants={frame}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.22, ease: EASE_ENTRANCE }}
                          className="absolute inset-0"
                        >

                          <motion.div
                            drag

                            dragElastic={0.85}
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            dragMomentum={false}
                            onDragEnd={onDragEnd}
                            style={{
                              x: dragX,
                              y: dragY,
                              rotateY: shouldReduceMotion ? 0 : lean,
                              scale: shouldReduceMotion ? 1 : recede,
                              opacity: fade,
                            }}

                            className="relative size-full cursor-grab active:cursor-grabbing"
                          >
                            <Image
                              src={photo.image}
                              alt={photo.title}
                              fill
                              priority
                              sizes="100vw"

                              className="select-none object-contain p-3 md:p-6"
                              draggable={false}
                            />
                          </motion.div>
                        </motion.figure>
                      </AnimatePresence>
                    </motion.div>

                    {photos.length > 1 && (
                      <>
                        <ViewerArrow side="left" onClick={() => paginate(-1)} />
                        <ViewerArrow side="right" onClick={() => paginate(1)} />
                      </>
                    )}
                  </div>

                  <div className="shrink-0 px-4 pb-5 pt-3 md:px-6 md:pb-7">
                    <p className="font-display text-accent-display text-white">{photo.title}</p>
                    {photo.description && (
                      <p className="mt-1 max-w-[38rem] text-caption text-white/60">
                        {photo.description}
                      </p>
                    )}
                  </div>

                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </Ctx.Provider>
  );
}

function ViewerArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photograph" : "Next photograph"}
      className={`absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/70 backdrop-blur transition-[color,background-color,transform] duration-[160ms] ease-entrance hover:bg-black/60 hover:text-white active:scale-[0.92] ${
        side === "left" ? "left-2 md:left-4" : "right-2 md:right-4"
      }`}
    >
      <Icon aria-hidden className="size-5" />
    </button>
  );
}

export function GalleryTile({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("GalleryTile must be rendered inside a GalleryLightbox");

  return (
    <motion.button
      type="button"
      layoutId={ctx.openIndex === null ? `gallery-photo-${index}` : undefined}
      onClick={() => ctx.open(index)}
      aria-label={`View ${title}`}
      className="block size-full cursor-pointer text-left"
    >
      {children}
    </motion.button>
  );
}
