import { Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { Artwork } from "@/components/artwork";
import { Reveal } from "@/components/reveal";
import { eventDisplay, type BandEvent } from "@/lib/types";

export function NextShowStrip({ events }: { events: BandEvent[] }) {
  const next = events
    .filter((event) => !eventDisplay(event).isPast && event.date)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))[0];
  if (!next) return null;

  const display = eventDisplay(next);
  const [day, month] = display.dateBadge.split(" ");
  const year = next.date?.slice(0, 4);
  const ticket = next.tickets?.[0];

  return (
    <section
      aria-labelledby="next-show-heading"
      className="mx-auto w-full max-w-[110rem] px-5 md:px-8"
    >
      <Reveal distance={0}>
        <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5 shadow-card transition-colors duration-theme md:flex-row md:items-center md:gap-6 md:p-6">
          <div className="flex items-center gap-5 md:gap-6">
            <div className="flex flex-col gap-1">
              <h2
                id="next-show-heading"
                className="text-label font-semibold uppercase tracking-[0.18em] text-brand"
              >
                Next show
              </h2>

              <p className="flex items-baseline gap-2 font-display text-brand">
                <span className="text-page-title leading-none">{day}</span>
                <span className="flex flex-col text-accent-display leading-none">
                  <span>{month}</span>
                  {year && <span className="text-muted-foreground">{year}</span>}
                </span>
              </p>
            </div>

            <span aria-hidden className="hidden shrink-0 overflow-hidden rounded-button sm:block sm:w-36">
              <Artwork release={next} sizes="9rem" className="aspect-[4/3] w-full" />
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Link
              href={`/events/${next.slug}`}
              className="font-display text-headline text-balance text-foreground transition-colors hover:text-brand"
            >
              {next.title}
            </Link>
            <p className="flex items-center gap-2 text-caption text-muted-foreground">
              <MapPin aria-hidden className="size-3.5 shrink-0 text-brand" />
              {next.venue} · {next.city}
            </p>
            <p className="flex items-center gap-2 text-caption text-muted-foreground">
              <Clock aria-hidden className="size-3.5 shrink-0 text-brand" />
              {display.time}
            </p>
          </div>

          {ticket ? (
            <a
              href={ticket.url}
              target="_blank"
              rel="noreferrer"
              className="group/cta inline-flex shrink-0 items-center gap-2 self-start rounded-button border border-primary bg-primary px-5 py-3 text-meta font-semibold text-primary-foreground transition-[background-color,transform] duration-[160ms] ease-entrance hover:bg-primary-hover active:scale-[0.97] md:self-auto"
            >
              GET TICKETS
              <span
                aria-hidden
                className="transition-transform duration-[160ms] ease-entrance motion-safe:group-hover/cta:translate-x-1.5"
              >
                →
              </span>
            </a>
          ) : (
            <Link
              href={`/events/${next.slug}`}
              className="shrink-0 self-start rounded-button border border-primary bg-primary px-5 py-3 text-meta font-semibold text-primary-foreground transition-[background-color,transform] duration-[160ms] ease-entrance hover:bg-primary-hover active:scale-[0.97] md:self-auto"
            >
              VIEW DETAILS
            </Link>
          )}
        </div>
      </Reveal>
    </section>
  );
}
