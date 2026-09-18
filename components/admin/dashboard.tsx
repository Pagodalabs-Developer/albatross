"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Disc3,
  GripVertical,
  Image as ImageIcon,
  Images,
  LogOut,
  Menu,
  Newspaper,
  Pencil,
  Trash2,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DatePicker } from "@/components/admin/date-picker";
import { HeroImagesField } from "@/components/admin/hero-images-field";
import { ImageUpload } from "@/components/admin/image-upload";
import { LineupField } from "@/components/admin/lineup-field";
import { LocationField } from "@/components/admin/location-field";
import { RichTextField } from "@/components/admin/rich-text-field";
import { SocialLinksField } from "@/components/admin/social-links-field";
import { StoreLinksField } from "@/components/admin/store-links-field";
import { TicketLinksField } from "@/components/admin/ticket-links-field";
import { TrackListField } from "@/components/admin/track-list-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import {
  eventDisplay,
  formatDateLabel,
  isPeopleCollection,
  mediaImageSrc,
  memberPortrait,
  type AdminTab,
  type HeroSlide,
  type LineupAct,
  type Member,
  type SiteSettings,
  type SocialLink,
  type StoreLink,
  type TicketLink,
  type Track,
} from "@/lib/types";
import type { Db } from "@/lib/db";

type Tab = AdminTab;

type FieldType =
  | "text"
  | "textarea"
  | "checkbox"
  | "select"
  | "number"
  | "url"
  | "date"
  | "datetime"
  | "tickets"
  | "stores"
  | "tracklist"
  | "lineup"
  | "socials"
  | "image"
  | "images"
  | "richtext"
  | "location"
  // A newline-separated textarea. The server splits and trims it
  // (sanitizeStringList), so there's no client-side parsing to keep in sync.
  | "lines";

type Field = {
  name: string; 
  label: string;
  type?: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
};

const FIELDS: Record<keyof Db, Field[]> = {
  events: [
    { name: "title", label: "Event name", required: true, placeholder: "Live in Kathmandu" },
    {
      name: "date",
      label: "Event date & time (leave empty to show COMING SOON)",
      type: "datetime",
      placeholder: "Pick a date & time",
    },
    { name: "venue", label: "Venue", placeholder: "Dasharath Stadium" },
    { name: "city", label: "City", placeholder: "Kathmandu, Nepal" },
    { name: "coords", label: "Map location", type: "location" },
    { name: "tickets", label: "Where can fans buy tickets?", type: "tickets" },
    { name: "image", label: "Banner photo", type: "image" },
    { name: "about", label: "Tell fans about the event", type: "textarea" },
    { name: "lineup", label: "Other acts on the bill", type: "lineup" },
    { name: "photos", label: "More photos (shown on the event page)", type: "images" },
    {
      name: "info",
      label: "Event info — one per line (All ages, Food & beverages, …)",
      type: "lines",
      placeholder: "All ages event\nFood & beverages available\nPhotography allowed",
    },
    { name: "order", label: "Display order (lower shows first)", type: "number", placeholder: "1" },
  ],
  catalogs: [
    { name: "title", label: "Title", required: true, placeholder: "Ma Ra Malai" },
    { name: "type", label: "Type", type: "select", options: ["Album", "Single"] },
    { name: "releaseDate", label: "Release date (future = upcoming)", type: "date", required: true, placeholder: "Pick a date" },
    { name: "image", label: "Artwork image", type: "image" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "tracks", label: "Tracks", type: "tracklist" },
    { name: "links", label: "Stores", type: "stores" },
    { name: "order", label: "Display order (lower shows first)", type: "number", placeholder: "1" },
  ],
  news: [
    { name: "title", label: "Headline", required: true, placeholder: "New music video" },
    { name: "teaser", label: "Teaser (shown on the card)", placeholder: "Latest from Albatross" },
    { name: "date", label: "Publication date", type: "date", placeholder: "Pick a date" },
    { name: "videoUrl", label: "YouTube video link (used for the card image)", type: "url", placeholder: "https://www.youtube.com/watch?v=..." },
    { name: "image", label: "Card photo (overrides the video thumbnail)", type: "image" },
    { name: "body", label: "Article body", type: "textarea" },
    { name: "quote", label: "Pull quote (optional)", type: "textarea", placeholder: "It wasn't just a concert…" },
    { name: "quoteBy", label: "Quote attribution", placeholder: "Amrit Gurung" },
    { name: "photos", label: "More photos (shown on the article)", type: "images" },
    { name: "order", label: "Display order (lower shows first)", type: "number", placeholder: "1" },
  ],
  members: [
    { name: "name", label: "Name", required: true, placeholder: "Shirish Dali" },
    { name: "role", label: "Role in the band", placeholder: "Vocals" },
    { name: "joined", label: "Joined (free text)", placeholder: "1998" },
    { name: "image", label: "Portrait photo", type: "image" },
    { name: "about", label: "About (shown on their detail page)", type: "richtext" },
    {
      name: "skills",
      label: "Gear & instruments — one per line",
      type: "lines",
      placeholder: "Fender Telecaster\nGibson J-45 Acoustic",
    },
    {
      name: "credits",
      label: "Notable songs — one per line (matching track titles get a play button)",
      type: "lines",
      placeholder: "Raat Ko Rani\nNischal",
    },
    { name: "socials", label: "Their own profiles", type: "socials" },
    { name: "photos", label: "More photos (shown on their detail page)", type: "images" },
    { name: "order", label: "Display order (lower shows first)", type: "number", placeholder: "1" },
  ],
  crew: [
    { name: "name", label: "Name", required: true, placeholder: "Ramesh Thapa" },
    { name: "role", label: "Role in the crew", placeholder: "Sound Engineer" },
    { name: "joined", label: "Joined (free text)", placeholder: "2012" },
    { name: "image", label: "Portrait photo", type: "image" },
    { name: "about", label: "About (shown on their detail page)", type: "richtext" },
    {
      name: "skills",
      label: "Specialties — one per line",
      type: "lines",
      placeholder: "Live Sound Engineering\nStudio Recording",
    },
    {
      name: "credits",
      label: "Tour credits — one per line",
      type: "lines",
      placeholder: "Himalayan Rock Fest 2025\nRaat Ko Rani Tour 2024",
    },
    { name: "socials", label: "Their own profiles", type: "socials" },
    { name: "photos", label: "More photos (shown on their detail page)", type: "images" },
    { name: "order", label: "Display order (lower shows first)", type: "number", placeholder: "1" },
  ],
  gallery: [
    { name: "title", label: "Caption", required: true, placeholder: "Live in Kathmandu" },
    { name: "description", label: "Description (shown on hover)", type: "textarea", placeholder: "Sold-out night at Dasharath Stadium, 2024" },
    { name: "image", label: "Photo", type: "image", required: true },
    { name: "order", label: "Display order (lower shows first)", type: "number", placeholder: "1" },
  ],
};

const TABS: { key: Tab; label: string; Icon: LucideIcon; blurb: string }[] = [
  {
    key: "settings",
    label: "Hero & Story",
    Icon: ImageIcon,
    blurb: "Manage the homepage hero, mission and story.",
  },
  { key: "events", label: "Events", Icon: CalendarDays, blurb: "Manage upcoming and past events." },
  { key: "catalogs", label: "Catalog", Icon: Disc3, blurb: "Manage albums, singles and releases." },
  { key: "news", label: "News", Icon: Newspaper, blurb: "Manage news and updates." },
  { key: "members", label: "Members", Icon: Users, blurb: "Manage band members." },
  { key: "crew", label: "Crew", Icon: Wrench, blurb: "Manage crew members." },
  { key: "gallery", label: "Gallery", Icon: Images, blurb: "Manage gallery photos." },
];

const COLUMNS: Record<
  keyof Db,
  { label: string; value: (item: Record<string, unknown>) => string }[]
> = {
  events: [
    {
      label: "Date & time",
      value: (item) => {
        const display = eventDisplay(item as { date?: string });
        return display.comingSoon ? "Coming soon" : `${display.dateBadge}, ${display.time}`;
      },
    },
    { label: "Venue", value: (item) => String(item.venue ?? "") },
  ],
  catalogs: [
    { label: "Type", value: (item) => String(item.type ?? "") },
    {
      label: "Release date",
      value: (item) =>
        item.releaseDate ? formatDateLabel(String(item.releaseDate)) : "—",
    },
  ],
  news: [
    { label: "Teaser", value: (item) => String(item.teaser ?? "") },
    { label: "Date", value: (item) => (item.date ? formatDateLabel(String(item.date)) : "—") },
  ],
  members: [{ label: "Role", value: (item) => String(item.role ?? "") }],
  crew: [{ label: "Role", value: (item) => String(item.role ?? "") }],
  gallery: [{ label: "Description", value: (item) => String(item.description ?? "") }],
};

const PAGE_SIZE = 10;

const cellHead =
  "px-4 py-3 text-caption font-semibold uppercase tracking-[0.1em] text-muted-foreground";
const cellBody = "px-4 py-3 align-middle";
const pageButton =
  "flex size-9 items-center justify-center rounded-button text-muted-foreground transition-colors duration-150 hover:bg-elevated hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

const NARROW_TYPES = new Set<FieldType | undefined>([
  "text",
  "url",
  "number",
  "date",
  "datetime",
  "select",
]);

const ITEM_LABEL: Record<keyof Db, string> = {
  events: "EVENT",
  catalogs: "CATALOG",
  news: "NEWS",
  members: "MEMBER",
  crew: "CREW MEMBER",
  gallery: "PHOTO",
};

const itemId = (tab: keyof Db, item: Record<string, unknown>) =>
  String(isPeopleCollection(tab) ? item.name : item.slug);

const itemTitle = (tab: keyof Db, item: Record<string, unknown>) =>
  String(isPeopleCollection(tab) ? item.name : item.title);

const itemImage = (tab: keyof Db, item: Record<string, unknown>) =>
  isPeopleCollection(tab)
    ? memberPortrait(item as unknown as Member)
    : mediaImageSrc(item as { image?: string; videoUrl?: string });

function getPath(obj: Record<string, unknown> | null | undefined, path: string): unknown {
  if (!obj) return undefined;
  return path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], obj);
}

function setPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let cur = obj;
  keys.forEach((key, i) => {
    if (i === keys.length - 1) {
      cur[key] = value;
    } else {
      cur[key] = (cur[key] as Record<string, unknown>) ?? {};
      cur = cur[key] as Record<string, unknown>;
    }
  });
}

export function AdminDashboard({
  data,
  settings,
  activeTab,
}: {
  data: Db;
  settings: SiteSettings;
  activeTab: Tab;
}) {
  const router = useRouter();
  const tab = activeTab;
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mission, setMission] = useState(settings.mission);
  const [storyImage, setStoryImage] = useState(settings.storyImage ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [itemsFor, setItemsFor] = useState<{ tab: Tab; source: unknown } | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  const currentSource = tab !== "settings" ? data[tab] : null;
  if (tab !== "settings" && (itemsFor?.tab !== tab || itemsFor.source !== currentSource)) {
    setItemsFor({ tab, source: currentSource });
    setItems([...(currentSource as Record<string, unknown>[])]);
    setPage(0);
  }

  const active = TABS.find(({ key }) => key === tab) ?? TABS[0];
  const columns = tab === "settings" ? [] : COLUMNS[tab as keyof Db];

  const itemLabel = tab === "settings" ? "item" : ITEM_LABEL[tab as keyof Db];
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const visible = items.slice(start, start + PAGE_SIZE);

  async function onDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const collectionTab = tab as keyof Db;
    const reordered = [...items];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setItems(reordered);
    setDragIndex(null);
    setDragOverIndex(null);

    await Promise.all(
      reordered.map((item, i) =>
        fetch(`/api/${tab}/${encodeURIComponent(itemId(collectionTab, item))}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: i + 1 }),
        }),
      ),
    );
    refresh();
  }

  function refresh() {
    router.refresh();
  }

  function openAdd() {
    setEditing(null);
    setError("");
    setModalOpen(true);
  }

  function openEdit(item: Record<string, unknown>) {
    setEditing(item);
    setError("");
    setModalOpen(true);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const collectionTab = tab as keyof Db;
    const formData = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {};

    for (const field of FIELDS[collectionTab]) {
      if (field.type === "checkbox") {
        setPath(body, field.name, formData.get(field.name) === "on");
        continue;
      }
      const raw = formData.get(field.name);
      if (
        field.type === "tickets" ||
        field.type === "stores" ||
        field.type === "tracklist" ||
        field.type === "lineup" ||
        field.type === "socials" ||
        field.type === "images"
      ) {

        setPath(body, field.name, JSON.parse(String(raw ?? "[]")));
      } else if (field.type === "lines" || field.type === "location") {

        setPath(body, field.name, String(raw ?? ""));
      } else if (field.type === "number") {
        setPath(body, field.name, Number(raw) || 0);
      } else if (raw !== null && raw !== "") {
        setPath(body, field.name, raw);
      }
    }

    const url = editing
      ? `/api/${tab}/${encodeURIComponent(itemId(collectionTab, editing))}`
      : `/api/${tab}`;
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setModalOpen(false);
      refresh();
    } else {
      setError((await res.json()).error ?? "Failed to save");
    }
    setBusy(false);
  }

  async function onDelete() {
    if (!pendingDelete) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/${tab}/${encodeURIComponent(pendingDelete)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setPendingDelete(null);
      refresh();
    } else {

      setError((await res.json()).error ?? "Failed to delete");
      setPendingDelete(null);
    }
    setBusy(false);
  }

  async function onSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const nextMission = String(formData.get("mission") ?? "");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mission: nextMission,
        heroImages: JSON.parse(String(formData.get("heroImages") ?? "[]")),
        storyHeading: String(formData.get("storyHeading") ?? ""),
        story: String(formData.get("story") ?? ""),

        contactEmail: String(formData.get("contactEmail") ?? ""),

        storyImage,
      }),
    });
    if (res.ok) setMission(nextMission);
    else setError((await res.json()).error ?? "Failed to save");
    setBusy(false);
  }

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">

      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-[var(--z-modal)] flex w-64 shrink-0 flex-col gap-1 border-r border-border bg-surface px-3 py-5 transition-transform duration-200 ease-move md:sticky md:top-0 md:z-auto md:h-dvh md:w-60 md:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2">

          <Link href="/" className="flex items-center gap-2.5">
            <span aria-hidden className="font-display text-headline leading-none text-brand">
              A
            </span>
            <span className="text-label font-semibold uppercase tracking-[0.18em] text-foreground">
              Albatross
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            aria-label="Close menu"
            className="flex size-9 items-center justify-center rounded-button text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
        {TABS.map(({ key, label, Icon }) => (
          <Link
            key={key}
            href={`/admin/${key}`}
            onClick={() => setNavOpen(false)}
            aria-current={tab === key ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-button px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              tab === key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon aria-hidden className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
        <Button
          variant="outline"
          onClick={onLogout}
          className="mt-auto justify-start gap-2 text-sm font-medium"
        >
          <LogOut aria-hidden className="size-4" />
          Log out
        </Button>
      </aside>

      {navOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-[var(--z-overlay)] bg-black/60 animate-overlay-in md:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">

        <header className="sticky top-0 z-[var(--z-sticky)] flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
              aria-expanded={navOpen}
              aria-controls="admin-sidebar"
              className="flex size-9 items-center justify-center rounded-button text-foreground transition-colors hover:bg-muted md:hidden"
            >
              <Menu aria-hidden className="size-4" />
            </button>
            <p className="truncate text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Admin
            </p>
            <span aria-hidden className="text-border">
              /
            </span>
            <p className="truncate text-sm font-medium text-foreground">{active.label}</p>
          </div>
          <ThemeSwitcher />
        </header>

        <div className="min-w-0 flex-1 px-4 pb-16 pt-6 md:px-8">

        <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-foreground">{active.label}</h1>
            <p className="text-sm text-muted-foreground">{active.blurb}</p>
          </div>
          {tab !== "settings" && (
            <Button onClick={openAdd} className="shrink-0 font-semibold">
              + ADD {itemLabel}
            </Button>
          )}
        </div>

        {error && (
          <p role="alert" className="pb-4 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        {tab === "settings" ? (
          <form
            onSubmit={onSaveSettings}
            className="flex max-w-xl flex-col gap-3 rounded-card border border-border bg-surface p-5 shadow-card"
          >
            <h2 className="text-[0.8125rem] font-semibold text-muted-foreground">
              HERO MISSION STATEMENT
            </h2>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mission-field">
                Shown under the hero heading on the homepage
              </Label>
              <Textarea id="mission-field" name="mission" rows={4} defaultValue={mission} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>
                Hero banner slides (leave empty to show the latest catalog artwork)
              </Label>
              <HeroImagesField
                name="heroImages"
                defaultValue={
                  settings.heroImages.length > 0
                    ? settings.heroImages
                    : data.catalogs.slice(0, 5).map(
                        (release): HeroSlide => ({
                          title: release.title,
                          image: mediaImageSrc(release) ?? "",
                        }),
                      )
                }
              />
            </div>
            <hr className="my-2 border-border" />
            <h2 className="text-[0.8125rem] font-semibold text-muted-foreground">
              CONTACT
            </h2>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-email-field">
                Booking &amp; press email
              </Label>
              <Input
                id="contact-email-field"
                name="contactEmail"
                type="email"
                placeholder="bookings@albatross.com.np"
                defaultValue={settings.contactEmail ?? ""}
              />
              <p className="text-[0.75rem] text-muted-foreground">
                Shown in the site footer. Leave blank to hide the contact block
                entirely — an empty address is better than a dead one.
              </p>
            </div>
            <hr className="my-2 border-border" />
            <h2 className="text-[0.8125rem] font-semibold text-muted-foreground">
              OUR STORY
            </h2>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="story-heading-field">
                Story headline (shown above the copy)
              </Label>
              <Input
                id="story-heading-field"
                name="storyHeading"
                placeholder="SINCE 1998"
                defaultValue={settings.storyHeading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Photo beside the story</Label>
              <ImageUpload
                defaultValue={storyImage || undefined}
                onChange={setStoryImage}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>The band&rsquo;s story, shown on the homepage</Label>
              <RichTextField name="story" defaultValue={settings.story} />
            </div>
            <Button type="submit" disabled={busy} className="mt-2 w-fit font-semibold">
              {busy ? "SAVING…" : "SAVE"}
            </Button>
          </form>
        ) : items.length === 0 ? (
          <p className="rounded-card border border-border bg-surface px-4 py-10 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </p>
        ) : (
          <>
            <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">

              <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem] border-collapse text-left">
                  <caption className="sr-only">
                    {active.label} — drag a row by its handle to reorder.
                  </caption>
                  <thead>
                    <tr className="border-b border-border bg-elevated">
                      <th scope="col" className={`${cellHead} w-16`}>
                        #
                      </th>
                      <th scope="col" className={cellHead}>
                        {isPeopleCollection(tab as keyof Db) ? "Name" : "Title"}
                      </th>
                      {columns.map(({ label }) => (
                        <th key={label} scope="col" className={cellHead}>
                          {label}
                        </th>
                      ))}
                      <th scope="col" className={`${cellHead} w-20`}>
                        Order
                      </th>
                      <th scope="col" className={`${cellHead} w-24 text-right`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((item, i) => {

                      const index = start + i;
                      const src = itemImage(tab, item);
                      return (
                        <tr
                          key={itemId(tab, item)}
                          draggable
                          onDragStart={() => setDragIndex(index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnter={() => setDragOverIndex(index)}
                          onDragLeave={() =>
                            setDragOverIndex((cur) => (cur === index ? null : cur))
                          }
                          onDrop={() => onDrop(index)}
                          onDragEnd={() => {
                            setDragIndex(null);
                            setDragOverIndex(null);
                          }}
                          className={`border-b border-border-subtle transition-colors duration-150 last:border-0 ${
                            dragIndex === index
                              ? "opacity-40"
                              : dragOverIndex === index && dragIndex !== null
                                ? "bg-primary/10"
                                : "hover:bg-muted"
                          }`}
                        >
                          <td className={cellBody}>
                            <span className="flex cursor-move items-center gap-1 text-caption tabular-nums text-muted-foreground">
                              <GripVertical aria-hidden className="size-3.5" />
                              {index + 1}
                            </span>
                          </td>
                          <td className={cellBody}>
                            <div className="flex items-center gap-3">
                              <span className="relative size-10 shrink-0 overflow-hidden rounded-button bg-muted">
                                {src && (
                                  <Image
                                    src={src}
                                    alt=""
                                    fill
                                    sizes="2.5rem"
                                    className="object-cover"
                                  />
                                )}
                              </span>
                              <span className="line-clamp-1 text-sm font-medium text-foreground">
                                {itemTitle(tab, item)}
                              </span>
                            </div>
                          </td>
                          {columns.map(({ label, value }) => (
                            <td key={label} className={cellBody}>
                              <span className="line-clamp-1 text-sm text-muted-foreground">
                                {value(item)}
                              </span>
                            </td>
                          ))}
                          <td className={cellBody}>
                            <span className="text-sm tabular-nums text-muted-foreground">
                              {typeof item.order === "number" ? item.order : "—"}
                            </span>
                          </td>
                          <td className={cellBody}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                aria-label={`Edit ${itemTitle(tab, item)}`}
                                className="flex size-9 items-center justify-center rounded-button text-muted-foreground transition-[color,background-color,transform] duration-150 hover:bg-elevated hover:text-brand active:scale-90"
                              >
                                <Pencil aria-hidden className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingDelete(itemId(tab, item))}
                                aria-label={`Delete ${itemTitle(tab, item)}`}
                                className="flex size-9 items-center justify-center rounded-button text-muted-foreground transition-[color,background-color,transform] duration-150 hover:bg-destructive/10 hover:text-destructive active:scale-90"
                              >
                                <Trash2 aria-hidden className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
                <p className="text-caption text-muted-foreground">
                  Showing {start + 1} to {Math.min(start + PAGE_SIZE, items.length)} of{" "}
                  {items.length} item{items.length === 1 ? "" : "s"}
                </p>
                {pageCount > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPage(safePage - 1)}
                      disabled={safePage === 0}
                      aria-label="Previous page"
                      className={pageButton}
                    >
                      <ChevronLeft aria-hidden className="size-4" />
                    </button>
                    {Array.from({ length: pageCount }, (_, p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        aria-current={p === safePage ? "page" : undefined}
                        aria-label={`Page ${p + 1}`}
                        className={`flex size-9 items-center justify-center rounded-button text-sm tabular-nums transition-colors duration-150 ${
                          p === safePage
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-elevated hover:text-foreground"
                        }`}
                      >
                        {p + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPage(safePage + 1)}
                      disabled={safePage >= pageCount - 1}
                      aria-label="Next page"
                      className={pageButton}
                    >
                      <ChevronRight aria-hidden className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="pt-3 text-caption text-muted-foreground">
              Drag a row by its handle to reorder.
            </p>
          </>
        )}

        <ConfirmDialog
          open={pendingDelete !== null}
          title={`Delete ${itemLabel.toLowerCase()}?`}
          body={`“${pendingDelete}” will be removed permanently. This can't be undone.`}
          busy={busy}
          onConfirm={onDelete}
          onCancel={() => setPendingDelete(null)}
        />

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl lg:max-w-3xl">
            {tab !== "settings" && (
              <form
                key={editing ? itemId(tab as keyof Db, editing) : "new"}
                onSubmit={onSubmit}
                className="flex flex-col gap-4"
              >
                <DialogHeader>
                  <DialogTitle className="text-left text-base font-semibold text-foreground">
                    {editing ? "Edit " : "Add "}
                    {itemLabel.toLowerCase()}
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {FIELDS[tab as keyof Db].map((field) => {

                  const current = getPath(editing, field.name);
                  const id = `field-${field.name}`;
                  const span = NARROW_TYPES.has(field.type) ? "" : "sm:col-span-2";
                  return field.type === "checkbox" ? (
                    <label
                      key={field.name}
                      className={`flex items-center gap-2 text-sm font-medium text-foreground ${span}`}
                    >
                      <input
                        type="checkbox"
                        name={field.name}
                        defaultChecked={Boolean(current)}
                        className="size-4 accent-[hsl(var(--primary))]"
                      />
                      {field.label}
                    </label>
                  ) : (
                    <div key={field.name} className={`flex flex-col gap-1.5 ${span}`}>
                      <Label htmlFor={id}>
                        {field.label}
                        {field.required && (
                          <span aria-hidden className="pl-0.5 text-destructive">
                            *
                          </span>
                        )}
                      </Label>
                      {field.type === "image" ? (
                        <ImageUpload
                          name={field.name}
                          defaultValue={typeof current === "string" ? current : undefined}
                        />
                      ) : field.type === "images" ? (
                        <HeroImagesField
                          name={field.name}
                          itemLabel="photo"
                          defaultValue={current as HeroSlide[] | undefined}
                        />
                      ) : field.type === "location" ? (
                        <LocationField
                          name={field.name}
                          defaultValue={typeof current === "string" ? current : undefined}
                        />
                      ) : field.type === "richtext" ? (
                        <RichTextField
                          name={field.name}
                          defaultValue={typeof current === "string" ? current : undefined}
                        />
                      ) : field.type === "tickets" ? (
                        <TicketLinksField
                          name={field.name}
                          defaultValue={current as TicketLink[] | undefined}
                        />
                      ) : field.type === "stores" ? (
                        <StoreLinksField
                          name={field.name}
                          defaultValue={current as StoreLink[] | undefined}
                        />
                      ) : field.type === "tracklist" ? (
                        <TrackListField
                          name={field.name}
                          defaultValue={current as Track[] | undefined}
                        />
                      ) : field.type === "lineup" ? (
                        <LineupField
                          name={field.name}
                          defaultValue={current as LineupAct[] | undefined}
                        />
                      ) : field.type === "socials" ? (
                        <SocialLinksField
                          name={field.name}
                          defaultValue={current as SocialLink[] | undefined}
                        />
                      ) : field.type === "lines" ? (
                        <Textarea
                          id={id}
                          name={field.name}
                          rows={4}
                          placeholder={field.placeholder}
                          defaultValue={Array.isArray(current) ? current.join("\n") : ""}
                        />
                      ) : field.type === "textarea" ? (
                        <Textarea
                          id={id}
                          name={field.name}
                          rows={3}
                          placeholder={field.placeholder}
                          defaultValue={typeof current === "string" ? current : ""}
                        />
                      ) : field.type === "select" ? (
                        <Select
                          name={field.name}
                          defaultValue={
                            typeof current === "string" ? current : field.options?.[0]
                          }
                        >
                          <SelectTrigger id={id} className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === "date" || field.type === "datetime" ? (
                        <DatePicker
                          name={field.name}
                          withTime={field.type === "datetime"}
                          defaultValue={typeof current === "string" ? current : undefined}
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <Input
                          id={id}
                          name={field.name}
                          type={
                            field.type === "number"
                              ? "number"
                              : field.type === "url"
                                ? "url"
                                : "text"
                          }
                          required={field.required}
                          placeholder={field.placeholder}
                          defaultValue={current == null ? "" : String(current)}
                        />
                      )}
                    </div>
                  );
                })}
                </div>
                <div className="mt-2 flex justify-end gap-2 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                    className="font-semibold"
                  >
                    CANCEL
                  </Button>
                  <Button type="submit" disabled={busy} className="font-semibold">
                    {busy ? "SAVING…" : "SAVE"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
}
