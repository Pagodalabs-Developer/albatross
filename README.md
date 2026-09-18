# Albatross

Official website and content management system for **Albatross**, an alternative-rock band from Nepal.

A single-scroll public site — releases, live dates, news, band and crew profiles, gallery — backed by an admin CMS that edits the same content collections the public pages render. Includes a site-wide audio player that survives navigation.

---

## Tech stack

### Core

| Technology | Version | Role |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2 | App Router, Server Components, Route Handlers |
| [React](https://react.dev) | 19.2 | UI runtime |
| [TypeScript](https://www.typescriptlang.org) | 5.x | Strict mode, no implicit `any` |
| [Turbopack](https://turbo.build/pack) | bundled | Bundler for both `dev` and `build` |
| [MongoDB](https://www.mongodb.com) | driver 7.5 | Sole content store |

### UI & styling

| Technology | Version | Role |
|---|---|---|
| [Tailwind CSS](https://tailwindcss.com) | v4 | CSS-native config — no `tailwind.config.ts` |
| [shadcn/ui](https://ui.shadcn.com) | `new-york` | Component layer over Radix |
| [Radix UI](https://www.radix-ui.com) | 1.x / 2.x | Dialog, Popover, Select, Label, Slot |
| [Framer Motion](https://www.framer.com/motion/) | 12.x | Gallery lightbox, page transitions |
| [Lucide](https://lucide.dev) | 1.x | Icon set |
| `class-variance-authority`, `clsx`, `tailwind-merge` | — | Variant and class composition |

### Content & media

| Technology | Version | Role |
|---|---|---|
| [Tiptap](https://tiptap.dev) | 3.x | Rich-text editor for member/crew bios |
| [Vercel Blob](https://vercel.com/docs/vercel-blob) | 2.x | Image and audio upload storage |
| `react-dropzone` | 17.x | Upload dropzones |
| `react-day-picker` + `date-fns` | 10.x / 4.x | Date fields |

### Tooling

| Technology | Version | Role |
|---|---|---|
| [pnpm](https://pnpm.io) | — | Package manager |
| [ESLint](https://eslint.org) | 9.x | Flat config, `eslint-config-next` core-web-vitals + TypeScript |
| [Playwright](https://playwright.dev) | 1.62 | Browser automation |

---

## Architecture

**Data flow.** MongoDB is the only content store — there is no static data file. `lib/db.ts` is the sole data-access layer over six collections (`events`, `catalogs`, `news`, `members`, `crew`, `gallery`) plus a singleton `settings` document. Route handlers under `app/api/*` are thin wrappers around it; pages (Server Components) call it directly.

**Types and pure logic** live in `lib/types.ts` — domain types plus the sanitizers, date derivation, and media helpers shared by the admin, the API routes, and the public pages. Date badges and "upcoming" status are always derived at render time from a single ISO date field, never stored redundantly.

**Route groups.** `app/(public)/` holds every public route plus the layout carrying the header, footer, and player. `app/admin/` sits outside it and inherits none of that. The root `app/layout.tsx` is the shell only. Route groups do not affect URLs.

**Auth.** Server-side sessions, not JWT: an opaque random token in an httpOnly cookie, backed by a TTL-indexed `sessions` collection in Mongo. Single admin account from environment variables — no users collection. `requireAuth()` guards every mutating API route.

**Player.** One site-wide audio pipeline in `components/player/`. The provider is mounted in the root layout so playback survives navigation; it owns the single `<audio>` element and all transport state.

**Theming.** Light/dark via a `.dark` class on `<html>`, driven by CSS variables in `app/globals.css`. Colour tokens are stored as HSL triplets so Tailwind's `/alpha` composition works.

```
app/
  (public)/     public routes + layout (header, footer, player)
  admin/        admin CMS, outside the public layout
  api/          route handlers — thin wrappers over lib/db.ts
components/
  admin/        CMS field editors and dashboard
  home/         homepage sections
  player/       site-wide audio player
  ui/           shadcn/ui primitives
lib/
  db.ts         sole data-access layer
  types.ts      domain types + pure helpers
  auth.ts       session auth
```

---

## Getting started

### Prerequisites

- Node.js 20 or newer
- pnpm
- A MongoDB instance (local or Atlas)

### Install

```bash
pnpm install
```

### Configure

Copy the example environment file and fill it in:

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `ADMIN_USERNAME` | **always** | Admin login. No fallback — login returns 500 without it |
| `ADMIN_PASSWORD` | **always** | Admin login. No fallback — login returns 500 without it |
| `MONGODB_URI` | production | Connection string. Defaults to `mongodb://localhost:27017` |
| `MONGODB_DB` | no | Database name. Defaults to `albatross` |
| `NEXT_PUBLIC_SITE_URL` | production | Absolute OpenGraph/Twitter image URLs. Defaults to `http://localhost:3000`, which produces unreachable image URLs in production |
| `UPLOAD_STORAGE` | no | `local` (default) or `blob` |
| `BLOB_STORE_ID` | if `blob` | Injected by Vercel when a Blob store is connected |
| `BLOB_READ_WRITE_TOKEN` | if `blob` | Alternative to the above for local development |

`.env.local` is gitignored and must never be committed.

### Config files

`.env.local` is the only environment file read locally, and it is not committed.

When deploying, set the same variables in the host's environment settings (on Vercel: Project → Settings → Environment Variables). `.env.local` is never uploaded.

> **Before going live:** change `ADMIN_PASSWORD` from the example value, and set `NEXT_PUBLIC_SITE_URL` to the real domain or every OpenGraph and Twitter card image will point at `localhost`.

### Run

```bash
pnpm dev    # http://localhost:3000
```

The admin CMS is at `/admin`. The database starts empty — sign in and add events, releases, news, members, crew, and gallery images there. Collections and indexes are created on first write, so no migration step is needed.

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Development server (Turbopack) |
| `pnpm build` | Production build (Turbopack) |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |

There is no test runner configured.

> **`pnpm build` needs a reachable database.** The detail routes (`/releases/[slug]`, `/events/[slug]`, …) are statically generated, and generation reads from MongoDB. If `MONGODB_URI` points nowhere the build fails with `Failed to collect page data`. Set it before building, including in CI and on the deploy host.

---

## Uploads

Every media field accepts either an upload or an absolute URL. Storage is selected by `UPLOAD_STORAGE`:

- **`local`** — writes to `public/uploads`. Fine for development, but ephemeral on Vercel.
- **`blob`** — writes to Vercel Blob and returns an absolute URL.

Images cap at 8 MB, audio at 25 MB (mp3, wav, ogg, flac, m4a). Track durations are probed from the file in the browser at upload time, never hand-entered.

---

## Further documentation

| File | Contents |
|---|---|
| `SCHEMA.md` | Field-by-field reference for all six collections plus settings |

---

## Deployment

Built for [Vercel](https://vercel.com). Set `UPLOAD_STORAGE=blob` and connect a Blob store so uploads persist, and point `MONGODB_URI` at a production cluster with the deployment's IP range allowed.
