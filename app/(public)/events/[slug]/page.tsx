import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Ticket } from "lucide-react";
import { Artwork } from "@/components/artwork";
import { Block } from "@/components/block";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { PhotoGallery } from "@/components/photo-gallery";
import { Reveal } from "@/components/reveal";
import { ShareRow } from "@/components/share-row";
import { eventDisplay, eventMap, mediaImageSrc, vendorColors } from "@/lib/types";
import { getEvent, getEvents } from "@/lib/db";
import { BAND_ID, SITE_URL, absolute, compact } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getEvents()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const event = await getEvent(slug);
  if (!event) return { title: "Event — Albatross" };

  const title = `${event.title} — Albatross`;
  const description = event.about || `${event.venue}, ${event.city}`;
  const image = mediaImageSrc(event);
  return {
    title,
    description,
    alternates: { canonical: `/events/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const event = await getEvent((await params).slug);
  if (!event) notFound();

  const display = eventDisplay(event);
  const tickets = event.tickets ?? [];

  const map = eventMap(event);

  const facts = [
    { Icon: CalendarDays, text: display.dateLabel },
    { Icon: Clock, text: display.time },
    { Icon: MapPin, text: `${event.venue}, ${event.city}` },
    {
      Icon: Ticket,
      text: display.isPast
        ? "This show has ended"
        : tickets.length > 0
          ? `Tickets via ${tickets.map((t) => t.vendor).join(", ")}`
          : "Ticket details to be announced",
    },
  ];

  const [lat, lng] = (event.coords ?? "").split(",").map((n) => Number(n.trim()));
  const hasGeo = Number.isFinite(lat) && Number.isFinite(lng);
  const venueIsPlaceholder = /^(tba|tbc|tbd|n\/a)$/i.test(event.venue.trim());

  const eventJsonLd = compact({
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    "@id": `${SITE_URL}/events/${event.slug}#event`,
    name: event.title,
    url: `${SITE_URL}/events/${event.slug}`,
    description: event.about || `${event.venue}, ${event.city}`,
    startDate: event.date,
    image: absolute(mediaImageSrc(event)),

    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: compact({
      "@type": "Place",
      name: venueIsPlaceholder ? event.city : event.venue,
      address: { "@type": "PostalAddress", addressLocality: event.city },
      ...(hasGeo ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng } } : {}),
    }),
    performer: { "@type": "MusicGroup", "@id": BAND_ID, name: "Albatross" },
    organizer: { "@type": "MusicGroup", "@id": BAND_ID, name: "Albatross" },
    offers: tickets.map((ticket) =>
      compact({
        "@type": "Offer",
        url: ticket.url,
        name: ticket.vendor,

        availability: display.isPast
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      }),
    ),
  });

  return (
    <>
      <JsonLd data={eventJsonLd} />
      <Breadcrumb
        trail={[
          { label: "Home", href: "/#home" },
          { label: "Events", href: "/#events" },
          { label: event.title },
        ]}
      />

      <div className="mx-auto flex max-w-[110rem] flex-col divide-y divide-border">

        <div className="flex flex-col gap-7 px-5 py-8 md:px-8 md:py-10 lg:flex-row lg:gap-10">
          <Reveal className="min-w-0 lg:flex-1">
            <Artwork
              release={event}
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority
              className="aspect-[16/10] w-full rounded-card"
            />
          </Reveal>
          <Reveal delay={0.12} className="lg:w-[28rem] lg:shrink-0">
            <div className="flex flex-col items-start gap-4">
              <h1 className="font-display text-page-title text-balance text-foreground">
                {event.title}
              </h1>
              <ul className="flex flex-col gap-2.5">
                {facts.map(({ Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5">
                    <Icon aria-hidden className="size-4 shrink-0 text-brand" />
                    <span className="text-meta text-muted-foreground">{text}</span>
                  </li>
                ))}
              </ul>

              {!display.isPast && tickets.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {tickets.map(({ vendor, url }) => (
                    <a
                      key={vendor + url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group/cta inline-flex items-center gap-2 rounded-button border border-primary bg-primary py-3 pl-2.5 pr-5 text-meta font-semibold text-primary-foreground transition-[background-color,transform] duration-[160ms] ease-entrance hover:bg-primary-hover active:scale-[0.97]"
                    >

                      <span
                        aria-hidden
                        className="flex size-6 items-center justify-center rounded-full text-label font-bold text-white"
                        style={{ backgroundColor: vendorColors[vendor] }}
                      >
                        {vendor[0].toUpperCase()}
                      </span>
                      GET TICKETS · {vendor}
                      <span
                        aria-hidden
                        className="transition-transform duration-[160ms] ease-entrance motion-safe:group-hover/cta:translate-x-1.5"
                      >
                        →
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-border">
          <Block id="about-event" label="About the event">
            <Reveal distance={0} delay={0.08}>
              <p className="max-w-[38rem] text-pretty text-body leading-relaxed text-muted-foreground">
                {event.about}
              </p>
            </Reveal>
          </Block>

          <Block id="venue" label="Venue" className="border-t border-border lg:border-t-0">
            <Reveal distance={0} delay={0.08}>
              <div className="flex flex-col items-start gap-3">
                <p className="flex items-center gap-2.5">
                  <MapPin aria-hidden className="size-4 shrink-0 text-brand" />
                  <span className="text-meta font-semibold text-foreground">
                    {map ? `${event.venue}, ${event.city}` : "Venue to be announced"}
                  </span>
                </p>

                {map && (
                  <div className="w-full overflow-hidden rounded-card border border-border">
                    <iframe
                      src={map.src}
                      title={`Map of ${event.venue}, ${event.city}`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"

                      className="block h-52 w-full border-0"
                    />
                  </div>
                )}

                {map && (
                  <a
                    href={map.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 rounded-button border border-border px-4 py-3 text-meta font-semibold text-foreground transition-[border-color,transform] duration-[160ms] ease-entrance hover:border-brand active:scale-[0.97]"
                  >
                    VIEW ON MAP
                    <span
                      aria-hidden
                      className="transition-transform duration-[160ms] ease-entrance motion-safe:group-hover:translate-x-1.5"
                    >
                      →
                    </span>
                  </a>
                )}
              </div>
            </Reveal>
          </Block>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:divide-x lg:divide-border">
        {event.lineup && event.lineup.length > 0 && (
          <Block id="lineup" label="Lineup highlights" className="lg:col-span-2">
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {event.lineup.map((act, i) => (
                <li key={act.name + i}>
                  <Reveal delay={(i % 4) * 0.08}>
                    <div className="flex flex-col gap-2">
                      {act.image ? (
                        <Image
                          src={act.image}
                          alt={act.name}
                          width={320}
                          height={320}
                          sizes="(min-width: 1024px) 15rem, 45vw"
                          className="aspect-square w-full rounded-card object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden

                          className="flex aspect-square w-full items-center justify-center rounded-card bg-muted font-display text-[4rem] text-brand"
                        >
                          {act.name[0]}
                        </span>
                      )}
                      <p className="truncate text-meta font-semibold text-foreground">
                        {act.name}
                      </p>
                      {act.note && (
                        <p className="truncate text-caption text-muted-foreground">
                          {act.note}
                        </p>
                      )}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Block>
        )}

          {event.info && event.info.length > 0 && (
            <Block
              id="event-info"
              label="Event info"
              className={event.lineup?.length ? "border-t border-border lg:border-t-0" : ""}
            >
              <ul className="flex flex-col gap-2">
                {event.info.map((fact) => (
                  <li key={fact} className="flex items-baseline gap-2.5">
                    <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-brand" />
                    <span className="text-meta text-muted-foreground">{fact}</span>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <Block
            id="share-event"
            label="Share"
            className="border-t border-border lg:border-t-0"
          >
            <div className="flex flex-col items-start gap-3">

              <ShareRow title={event.title} labelled />
              <Link
                href="/#events"
                className="text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-brand"
              >
                ← All events
              </Link>
            </div>
          </Block>
        </div>

        <PhotoGallery photos={event.photos} id="event-photos" />
      </div>
    </>
  );
}
