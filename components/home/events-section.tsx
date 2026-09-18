"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Artwork } from "@/components/artwork";
import { Block } from "@/components/block";
import { Reveal } from "@/components/reveal";
import { WobbleCard } from "@/components/ui/wobble-card";
import { EASE_ENTRANCE } from "@/lib/motion";
import { eventDisplay, type BandEvent, type EventDisplay } from "@/lib/types";

function EventStatus({ event, display }: { event: BandEvent; display: EventDisplay }) {

  const status = display.comingSoon
    ? { label: "Date TBA", tone: "text-muted-foreground", dot: "bg-muted-foreground" }
    : display.isPast
      ? { label: "Past show", tone: "text-muted-foreground", dot: "bg-border" }
      : event.tickets?.length
        ? { label: "Tickets on sale", tone: "text-foreground", dot: "bg-brand" }
        : { label: "Announced", tone: "text-foreground", dot: "border border-brand" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-caption font-semibold ${status.tone}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${status.dot}`} />
      {status.label}
    </span>
  );
}

function EventAction({ event, display }: { event: BandEvent; display: EventDisplay }) {
  const ticket = !display.isPast ? event.tickets?.[0] : undefined;

  if (display.comingSoon) {

    return (
      <span className="hidden shrink-0 rounded-button border border-border bg-muted px-5 py-3 text-meta font-semibold text-muted-foreground md:block">
        COMING SOON
      </span>
    );
  }

  return ticket ? (
    <a
      href={ticket.url}
      target="_blank"
      rel="noreferrer"
      className="group/action inline-flex shrink-0 items-center gap-2 rounded-button border border-primary bg-primary px-3 py-2 text-caption font-semibold text-primary-foreground transition-[background-color,transform] duration-[160ms] ease-entrance hover:bg-primary-hover active:scale-[0.97] md:px-5 md:py-3 md:text-meta"
    >
      GET TICKETS
      <span
        aria-hidden
        className="transition-transform duration-[160ms] ease-entrance motion-safe:group-hover/action:translate-x-1.5"
      >
        →
      </span>
    </a>
  ) : (
    <Link
      href={`/events/${event.slug}`}
      className="hidden shrink-0 rounded-button border border-primary bg-primary px-5 py-3 text-meta font-semibold text-primary-foreground transition-[background-color,transform] duration-[160ms] ease-entrance hover:bg-primary-hover active:scale-[0.97] md:block"
    >
      VIEW DETAILS
    </Link>
  );
}

export function EventsSection({
  events,
  className = "",
  delay = 0,
}: {
  events: BandEvent[];
  className?: string;
  delay?: number;
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const shown = events.filter(
    (event) => eventDisplay(event).isPast === (tab === "past"),
  );

  return (
    <Block id="events" label="Events" className={className}
      delay={delay}>
      <div role="tablist" aria-label="Event period" className="flex gap-5">
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`flex min-h-11 flex-col justify-center gap-2 px-1 text-label font-semibold tracking-[0.18em] transition-[color,transform] duration-200 ease-entrance active:scale-[0.97] ${
                tab === t ? "text-brand" : "text-muted-foreground"
              }`}
            >
              {t.toUpperCase()}

              <span
                aria-hidden
                className={`h-0.5 w-[4.75rem] origin-left bg-primary transition-transform duration-200 ease-move ${
                  tab === t ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">
            {tab === "past" ? "No past shows listed." : "No upcoming shows announced yet."}
          </p>
        ) : (

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: EASE_ENTRANCE }}
              className="flex flex-col"
            >
            {shown.map((event, i) => {
              const display = eventDisplay(event);
              return (

                <Reveal key={event.slug} delay={i * 0.06} distance={0}>

                  <div className="group -mx-2 flex items-center gap-3 rounded-card border-b border-border-subtle px-2 py-4 transition-colors duration-200 hover:bg-elevated md:gap-7 md:py-6">
                    <p
                      className={`w-[3.25rem] shrink-0 font-display text-headline md:w-[5.625rem] ${

                        display.isPast ? "text-muted-foreground" : "text-accent"
                      }`}
                    >
                      {display.dateBadge}
                    </p>
                    <div className="shrink-0 overflow-hidden rounded-[0.625rem] md:rounded-card">
                      <Artwork
                        release={event}
                        sizes="13.125rem"
                        className="h-[3.875rem] w-[5.5rem] transition-transform duration-300 ease-entrance motion-safe:group-hover:scale-105 md:h-[7.375rem] md:w-[13.125rem]"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1 md:gap-2">
                      <Link
                        href={`/events/${event.slug}`}
                        className="text-xs font-semibold text-foreground hover:text-brand md:text-lg"
                      >
                        {event.title}
                      </Link>
                      <p className="truncate text-caption text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                        {event.venue} · {event.city}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-caption text-muted-foreground">{display.time}</p>
                        <EventStatus event={event} display={display} />
                      </div>
                    </div>
                    <EventAction event={event} display={display} />
                  </div>
                </Reveal>
              );
            })}
            </motion.div>
          </AnimatePresence>
        )}

        <Reveal distance={0}>
          <WobbleCard
            containerClassName="mt-4 md:mt-8"
            className="flex flex-col items-start gap-5 px-6 py-7 md:flex-row md:items-center md:justify-between md:px-10 md:py-9"
          >
            <div className="flex flex-col gap-2.5">
              <p className="font-display text-headline">
                DON&rsquo;T MISS A SHOW
              </p>
              <p className="text-sm">
                Follow Albatross for announcements and ticket updates.
              </p>
            </div>
            <a
              href="https://www.youtube.com/@albatrossnepal"
              target="_blank"
              rel="noreferrer"
              className="rounded-button border border-primary bg-primary px-5 py-3 text-meta font-semibold text-primary-foreground transition-[background-color,transform] duration-[160ms] ease-entrance hover:bg-primary-hover active:scale-[0.97]"
            >
              FOLLOW US
            </a>
          </WobbleCard>
        </Reveal>
    </Block>
  );
}
