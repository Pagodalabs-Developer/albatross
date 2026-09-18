export const TICKET_VENDORS = [
  "Khalti",
  "eSewa",
  "Ticket Sansar",
  "HamroPatro",
  "Other",
] as const;

export type TicketVendor = (typeof TICKET_VENDORS)[number];

export type TicketLink = {
  vendor: TicketVendor;
  url: string;
};

export const vendorColors: Record<TicketVendor, string> = {
  Khalti: "#5C2D91",
  eSewa: "#60BB46",
  "Ticket Sansar": "#E8562A",
  HamroPatro: "#2F6FD3",
  Other: "#69655f",
};

export function sanitizeTickets(raw: unknown): TicketLink[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const tickets = raw.filter(
    (t): t is TicketLink =>
      Boolean(t) &&
      typeof t.url === "string" &&
      /^https?:\/\//.test(t.url) &&
      (TICKET_VENDORS as readonly string[]).includes(t.vendor),
  );
  return tickets.length > 0 ? tickets : undefined;
}

export type LineupAct = {
  name: string;
  note?: string;
  image?: string;
};

export function sanitizeLineup(raw: unknown): LineupAct[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const acts = raw
    .filter((a): a is LineupAct => Boolean(a) && typeof a.name === "string" && a.name.trim() !== "")
    .map((a) => ({
      name: a.name.trim(),
      note: typeof a.note === "string" && a.note.trim() ? a.note.trim() : undefined,
      image: isMediaPath(a.image) ? a.image : undefined,
    }));
  return acts.length > 0 ? acts : undefined;
}

export function sanitizeStringList(raw: unknown): string[] | undefined {
  const lines = (
    Array.isArray(raw) ? raw.map((v) => String(v ?? "")) : String(raw ?? "").split("\n")
  )
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : undefined;
}

export type BandEvent = {
  slug: string;
  title: string;
  date?: string; 
  tickets?: TicketLink[]; 
  venue: string;
  city: string;
  coords?: string; 

  image?: string; 
  order?: number; 
  about: string;
  lineup?: LineupAct[]; 
  info?: string[]; 
  photos?: HeroSlide[]; 
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export type EventDisplay = {
  dateBadge: string; 
  dateLabel: string; 
  time: string; 
  isPast: boolean;
  comingSoon: boolean; 
};

export function eventDisplay(event: { date?: string }): EventDisplay {
  if (!event.date) {
    return {
      dateBadge: "TBA",
      dateLabel: "TBA",
      time: "TBA",
      isPast: false,
      comingSoon: true,
    };
  }
  const [datePart, timePart] = event.date.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh = 0, mm = 0] = (timePart ?? "").split(":").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const hour12 = ((hh + 11) % 12) + 1;
  return {
    dateBadge: `${String(d).padStart(2, "0")} ${MONTHS[m - 1].slice(0, 3).toUpperCase()}`,
    dateLabel: `${weekday}, ${d} ${MONTHS[m - 1]} ${y}`,
    time: timePart
      ? `${hour12}:${String(mm).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`
      : "TBA",
    isPast: new Date(y, m - 1, d, hh, mm) < new Date(),
    comingSoon: false,
  };
}

const isPlaceholderVenue = (value?: string) =>
  !value || /^(tba|tbc|tbd|n\/?a)$/i.test(value.trim());

export function parseCoords(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const N = "(-?\\d+(?:\\.\\d+)?)";
  const match =

    value.match(new RegExp(`!3d${N}!4d${N}`)) ??
    value.match(new RegExp(`@${N},${N}`)) ??
    value.trim().match(new RegExp(`^${N}\\s*,\\s*${N}$`));
  if (!match) return undefined;
  const [lat, lng] = [Number(match[1]), Number(match[2])];
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? `${lat},${lng}` : undefined;
}

export function eventMap(event: {
  venue?: string;
  city?: string;
  coords?: string;
}): { src: string; href: string } | undefined {
  const coords = parseCoords(event.coords);
  const query =
    coords ?? [event.venue, event.city].filter((part) => !isPlaceholderVenue(part)).join(", ");
  if (!query) return undefined;
  const zoom = coords ? 17 : isPlaceholderVenue(event.venue) ? 12 : 15;
  return {
    src: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
  };
}

export type Track = {
  title: string;
  image?: string; 
  audio?: string; 
  duration?: number; 
  links?: StoreLink[]; 
};

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export const releaseDuration = (release: { tracks?: Track[] }) =>
  (release.tracks ?? []).reduce((total, track) => total + (track.duration ?? 0), 0);

export const formatRuntime = (seconds: number) =>
  seconds > 0 ? `${Math.max(1, Math.round(seconds / 60))} min` : "";

export const isMediaPath = (value: unknown): value is string =>
  typeof value === "string" &&
  (/^https?:\/\//.test(value) || (value.startsWith("/") && !value.startsWith("//")));

export function sanitizeTracks(raw: unknown): Track[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const tracks = raw
    .filter((t): t is Track => Boolean(t) && typeof t.title === "string" && t.title.trim() !== "")
    .map((t) => ({
      title: t.title.trim(),
      image: typeof t.image === "string" && t.image ? t.image : undefined,
      audio: isMediaPath(t.audio) ? t.audio : undefined,
      duration:
        typeof t.duration === "number" && Number.isFinite(t.duration) && t.duration > 0
          ? Math.round(t.duration)
          : undefined,
      links: sanitizeStoreLinks(t.links),
    }));
  return tracks.length > 0 ? tracks : undefined;
}

export const playableTracks = (release: { tracks?: Track[] }): Track[] =>
  (release.tracks ?? []).filter((track) => Boolean(track.audio));

export const displayTracks = (release: Release): Track[] =>
  release.tracks?.length
    ? release.tracks
    : release.type === "Single"
      ? [{ title: release.title, links: release.links }]
      : [];

export function trackImageSrc(track: Track): string | undefined {
  if (track.image) return track.image;
  const youtube = track.links?.find((l) => l.store === "youtube")?.url;
  return youtube ? mediaImageSrc({ videoUrl: youtube }) : undefined;
}

export const STORES = ["spotify", "appleMusic", "youtube", "bandcamp"] as const;

export type StoreName = (typeof STORES)[number];

export const storeLabels: Record<StoreName, string> = {
  spotify: "Spotify",
  appleMusic: "Apple Music",
  youtube: "YouTube",
  bandcamp: "Bandcamp",
};

export type StoreLink = {
  store: StoreName;
  url: string;
};

export function sanitizeStoreLinks(raw: unknown): StoreLink[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const links = raw.filter(
    (l): l is StoreLink =>
      Boolean(l) &&
      typeof l.url === "string" &&
      /^https?:\/\//.test(l.url) &&
      (STORES as readonly string[]).includes(l.store),
  );
  return links.length > 0 ? links : undefined;
}

export type Release = {
  slug: string;
  title: string;
  type: "Album" | "Single";
  releaseDate: string; 
  image?: string; 
  order?: number; 
  description: string;
  tracks?: Track[];
  links?: StoreLink[]; 
};

export const releaseYear = (release: { releaseDate: string }) => release.releaseDate.slice(0, 4);

export const isUpcomingRelease = (release: { releaseDate: string }) =>
  new Date(release.releaseDate) > new Date();

export function splitReleases<T extends { releaseDate: string }>(
  catalogs: T[],
): { upcoming: T[]; latest: T[] } {
  const upcoming = catalogs
    .filter(isUpcomingRelease)
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  const latest = catalogs
    .filter((release) => !isUpcomingRelease(release))
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
    .slice(0, 5);
  return { upcoming, latest };
}

export function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split("T")[0].split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export type NewsItem = {
  slug: string;
  title: string;
  teaser: string;
  date?: string; 
  videoUrl?: string; 
  image?: string; 
  order?: number; 
  body: string;
  quote?: string; 
  quoteBy?: string; 
  photos?: HeroSlide[]; 
};

export const SOCIALS = [
  "instagram",
  "facebook",
  "youtube",
  "twitter",
  "spotify",
] as const;

export type SocialPlatform = (typeof SOCIALS)[number];

export const socialLabels: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  twitter: "X (Twitter)",
  spotify: "Spotify",
};

export type SocialLink = {
  platform: SocialPlatform;
  url: string;
};

export function sanitizeSocialLinks(raw: unknown): SocialLink[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const links = raw.filter(
    (l): l is SocialLink =>
      Boolean(l) &&
      typeof l.url === "string" &&
      /^https?:\/\//.test(l.url) &&
      (SOCIALS as readonly string[]).includes(l.platform),
  );
  return links.length > 0 ? links : undefined;
}

export type Member = {
  name: string;
  role: string; 
  image: string; 
  order?: number; 
  about?: string; 
  photos?: HeroSlide[]; 
  joined?: string; 

  skills?: string[];
  credits?: string[];
  socials?: SocialLink[];
};

export const peopleListLabels = (group: "members" | "crew") =>
  group === "crew"
    ? { skills: "Specialties", credits: "Tour credits" }
    : { skills: "Gear & instruments", credits: "Notable songs" };

export const memberHref = (member: { name: string }) => `/band/${slugify(member.name)}`;

export const memberPortrait = (member: Member): string | undefined =>
  member.image || member.photos?.[0]?.image || undefined;

export const PEOPLE_COLLECTIONS = ["members", "crew"] as const;

export const isPeopleCollection = (
  collection: string,
): collection is (typeof PEOPLE_COLLECTIONS)[number] =>
  (PEOPLE_COLLECTIONS as readonly string[]).includes(collection);

export type GalleryImage = {
  slug: string;
  title: string; 
  description?: string; 
  image: string; 
  order?: number; 
};

export type HeroSlide = {
  title: string; 
  image: string; 
};

export function sanitizeHeroSlides(raw: unknown): HeroSlide[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (s): s is HeroSlide =>
        Boolean(s) && typeof s.image === "string" && s.image.trim() !== "",
    )
    .map((s) => ({ title: String(s.title ?? "").trim(), image: s.image }));
}

export type SiteSettings = {
  mission: string; 
  heroImages: HeroSlide[]; 
  storyHeading: string; 
  story: string; 
  storyImage?: string; 
  contactEmail?: string; 
};

export const sanitizeEmail = (raw: unknown): string | undefined => {
  const value = typeof raw === "string" ? raw.trim() : "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : undefined;
};

export const DEFAULT_MISSION =
  "New music, live dates, and stories from one of Nepal's defining alternative-rock bands.";

export const DEFAULT_STORY_HEADING = "SINCE 1998";

export const DEFAULT_STORY =
  "<p>From the lanes of Kathmandu to stages across Nepal, Albatross keeps writing our story with every song and every show.</p>";

export const bandLinks = {
  spotify: "https://open.spotify.com/artist/3Ols8mMOUzTAbtPmkm7HTa",
  appleMusic: "https://music.apple.com/us/artist/albatross/1412776800",
  youtube: "https://www.youtube.com/channel/UCviJfxf25455YRl_0RYYXhg",
  bandcamp: "https://albatrossnepal.bandcamp.com",
};

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const artworkUrl = (youtubeId: string) =>
  `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

export const youtubeWatchUrl = (youtubeId: string) =>
  `https://www.youtube.com/watch?v=${youtubeId}`;

export function extractYoutubeId(url: string): string | undefined {
  const match = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (match) return match[1];
  return /^[a-zA-Z0-9_-]{11}$/.test(url) ? url : undefined;
}

export const DEFAULT_GRADIENT =
  "linear-gradient(90deg, #0b0a09 0%, #9a6824 55%, #d9ad61 100%)";

export function mediaImageSrc(item: { image?: string; videoUrl?: string }): string | undefined {
  if (item.image) return item.image;
  const id = item.videoUrl ? extractYoutubeId(item.videoUrl) : undefined;
  return id ? artworkUrl(id) : undefined;
}

export function spotifyEmbedUrl(url: string): string | undefined {
  const match = url.match(
    /open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album|artist|playlist|episode|show)\/([a-zA-Z0-9]+)/,
  );
  return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : undefined;
}

export const ADMIN_TABS = ["settings", "events", "catalogs", "news", "members", "crew", "gallery"] as const;
export type AdminTab = (typeof ADMIN_TABS)[number];

