# SCHEMA

Every field stored in MongoDB. Six content collections plus a settings
singleton. Types live in `lib/types.ts`; all access goes through `lib/db.ts`.

Legend: `?` = optional. **Bold** = primary key. Row counts are as seeded.

---

## events — `BandEvent` (0 rows)

URL: `/events/<slug>`

| Field | Type | Notes |
|---|---|---|
| **slug** | `string` | required, primary key |
| title | `string` | required |
| venue | `string` | required; may be `"TBA"` (detected, switches the map to city zoom) |
| city | `string` | required; the map falls back to searching this + venue |
| coords? | `string` | `"27.700769,85.30014"` — the exact map pin. Set by searching for the venue in the admin, or by pasting a Google Maps URL (the pin is parsed out of it). Empty falls back to the venue + city text search |
| about | `string` | required; also the page meta description |
| date? | `string` | ISO `YYYY-MM-DDTHH:mm`. Badge, label, time and past/upcoming **all derive from this** at render time. Missing = "TBA / coming soon" |
| tickets? | `TicketLink[]` | `{ vendor, url }`, vendor ∈ Khalti \| eSewa \| Ticket Sansar \| HamroPatro \| Other |
| image? | `string` | banner; upload-only, no fallback |
| lineup? | `LineupAct[]` | `{ name, note?, image? }` — other acts on the bill |
| info? | `string[]` | one fact per line: "All ages", "Doors 6pm" |
| photos? | `HeroSlide[]` | gallery on the detail page |
| order? | `number` | lower shows first |

---

## catalogs — `Release` (15 rows)

URL: `/releases/<slug>`

| Field | Type | Notes |
|---|---|---|
| **slug** | `string` | required, primary key |
| title | `string` | required |
| type | `"Album" \| "Single"` | `Single` hides the tracklist editor and derives a one-row tracklist from the release itself |
| releaseDate | `string` | ISO `YYYY-MM-DD`. A future date marks it "upcoming" |
| description | `string` | required; also the page meta description |
| image? | `string` | artwork; upload-only, no fallback |
| tracks? | `Track[]` | see below |
| links? | `StoreLink[]` | `{ store, url }`, store ∈ spotify \| appleMusic \| youtube \| bandcamp. Unset falls back to `bandLinks`. The `youtube` entry also drives the watch-on-YouTube section |
| order? | `number` | |

### Track

| Field | Type | Notes |
|---|---|---|
| title | `string` | required |
| duration? | `number` | seconds |
| audio? | `string` | `/uploads/…` or absolute URL. **The only thing that makes the player work** |
| image? | `string` | per-track art; falls back to its YouTube link's thumbnail |
| links? | `StoreLink[]` | |

---

## news — `NewsItem` (3 rows)

URL: `/news/<slug>`

| Field | Type | Notes |
|---|---|---|
| **slug** | `string` | required, primary key |
| title | `string` | required |
| teaser | `string` | required; card subtitle and meta description |
| body | `string` | required; **plain text, not rich text** |
| date? | `string` | ISO `YYYY-MM-DD` |
| videoUrl? | `string` | YouTube link; supplies the card image when `image` is unset |
| image? | `string` | card image override |
| quote? | `string` | pull quote, rendered as a `<blockquote>` in the article |
| quoteBy? | `string` | attribution |
| photos? | `HeroSlide[]` | |
| order? | `number` | |

---

## members (4 rows) and crew (0 rows) — both `Member`

One shape, two collections. Keyed by **`name`**, not slug. Both are served by
the same detail route, `/band/<name-slug>`.

| Field | Type | Notes |
|---|---|---|
| **name** | `string` | required, primary key — renaming a person changes their URL |
| role | `string` | free text, no fixed set |
| image | `string` | portrait. Empty is a real state: renders the designed initial-letter mark |
| about? | `string` | rich-text HTML (Tiptap); sanitized to a tag allowlist on render |
| joined? | `string` | free text — `"1998"`. Not a date, never parsed |
| skills? | `string[]` | labelled "Gear & instruments" (band) / "Specialties" (crew) |
| credits? | `string[]` | labelled "Notable songs" (band) / "Tour credits" (crew). Matched against the catalogue — a real track title gets a play button, anything else stays plain text |
| socials? | `SocialLink[]` | `{ platform, url }`, platform ∈ instagram \| facebook \| youtube \| twitter \| spotify |
| photos? | `HeroSlide[]` | |
| order? | `number` | |

---

## gallery — `GalleryImage` (11 rows)

| Field | Type | Notes |
|---|---|---|
| **slug** | `string` | required, primary key |
| title | `string` | required; caption and alt text |
| image | `string` | required |
| description? | `string` | hover overlay only |
| order? | `number` | |

---

## settings — `SiteSettings` (singleton, `{ key: "site" }`)

| Field | Type | Notes |
|---|---|---|
| mission | `string` | one line under the hero heading |
| heroImages | `HeroSlide[]` | carousel slides. Empty falls back to catalog artwork |
| storyHeading | `string` | e.g. `"SINCE 1998"` |
| story | `string` | rich-text HTML — the band's story block |
| storyImage? | `string` | photo beside the story |
| contactEmail? | `string` | booking/press address. Validated by `sanitizeEmail`; always submitted (even blank) so clearing it works. The footer contact block renders only when set — a dead `mailto:` is worse than none |

---

## Shared shapes

```ts
HeroSlide   { title: string; image: string }   // photos[] everywhere + heroImages
TicketLink  { vendor: TicketVendor; url: string }
StoreLink   { store: StoreName; url: string }
SocialLink  { platform: SocialPlatform; url: string }
LineupAct   { name: string; note?: string; image?: string }
```

Every URL field is gated by `isMediaPath()` — only `/local` paths and
`http(s)://` absolute URLs survive; `javascript:` and protocol-relative hosts
are dropped.

Derived at render, never stored: event date badge / label / time / past /
coming-soon (`eventDisplay`), the map embed and link (`eventMap`), release year
and upcoming status, track and release runtimes, YouTube thumbnail fallbacks.

---

## Open questions

Fields with a full render path and admin editor but no data anywhere:

- `events.tickets`, `events.lineup` — the whole `events` collection is empty
- `news.quote`, `news.quoteBy`
- `members.skills`, `members.about`, `members.image`
- the entire `crew` collection

Three structural decisions still open:

1. **`Track.audio` is empty everywhere.** The whole `components/player/`
   pipeline has nothing to play. Either mp3s get uploaded or that subsystem is
   dead weight. `credits` play-buttons depend on it too, so they currently
   always render as plain text.
2. **People are keyed by `name`.** A typo fix changes a person's permanent URL.
   Everything else uses a stable `slug`.
3. **`news.body` is plain text** while member bios and the site story are rich
   HTML. Article bodies are the place formatting is most wanted.

Adding or removing a field touches three places that don't know about each
other: the `FIELDS` map in `components/admin/dashboard.tsx`, the POST route, and
the PATCH route. The last two sanitize independently, so it is easy to add a
field that saves on create and silently drops on edit.
