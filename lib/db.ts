import { MongoClient, type Document } from "mongodb";
import {
  DEFAULT_MISSION,
  DEFAULT_STORY,
  DEFAULT_STORY_HEADING,
  PEOPLE_COLLECTIONS,
  isPeopleCollection,
  slugify,
  type BandEvent,
  type GalleryImage,
  type Member,
  type NewsItem,
  type Release,
  type SiteSettings,
} from "@/lib/types";

export type Db = {
  events: BandEvent[];
  catalogs: Release[];
  news: NewsItem[];
  members: Member[];
  crew: Member[];
  gallery: GalleryImage[];
};

export type Collection = keyof Db;

export const idKey = (collection: Collection) =>
  isPeopleCollection(collection) ? "name" : "slug";

const globalForMongo = globalThis as unknown as {
  _mongoClient?: Promise<MongoClient>;
};

function client(): Promise<MongoClient> {
  globalForMongo._mongoClient ??= new MongoClient(
    process.env.MONGODB_URI ?? "mongodb://localhost:27017",
  ).connect();
  return globalForMongo._mongoClient;
}

export async function rawCollection(name: string) {
  const db = (await client()).db(process.env.MONGODB_DB ?? "albatross");
  return db.collection(name);
}

async function coll<K extends Collection>(name: K) {
  return rawCollection(name);
}

async function all<K extends Collection>(name: K): Promise<Db[K]> {
  const c = await coll(name);
  const docs = (await c.find({}, { projection: { _id: 0 } }).toArray()) as unknown as {
    order?: number;
  }[];
  docs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return docs as unknown as Db[K];
}

async function one<K extends Collection>(
  name: K,
  id: string,
): Promise<Db[K][number] | undefined> {
  const c = await coll(name);
  const doc = await c.findOne(
    { [idKey(name)]: id },
    { projection: { _id: 0 } },
  );
  return (doc ?? undefined) as unknown as Db[K][number] | undefined;
}

export async function getEvents(): Promise<BandEvent[]> {
  return all("events");
}

export async function getCatalogs(): Promise<Release[]> {
  return all("catalogs");
}

export async function getNewsItems(): Promise<NewsItem[]> {
  return all("news");
}

export async function getMembers(): Promise<Member[]> {
  return all("members");
}

export async function getCrew(): Promise<Member[]> {
  return all("crew");
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  return all("gallery");
}

export async function getPerson(
  slug: string,
): Promise<{ person: Member; group: "members" | "crew" } | undefined> {
  for (const group of PEOPLE_COLLECTIONS) {
    const person = (await all(group)).find((p) => slugify(p.name) === slug);
    if (person) return { person, group };
  }
  return undefined;
}

export async function getEvent(slug: string): Promise<BandEvent | undefined> {
  return one("events", slug) as Promise<BandEvent | undefined>;
}

export async function getCatalog(slug: string): Promise<Release | undefined> {
  return one("catalogs", slug) as Promise<Release | undefined>;
}

export async function getNewsItem(slug: string): Promise<NewsItem | undefined> {
  return one("news", slug) as Promise<NewsItem | undefined>;
}

export async function addItem<K extends Collection>(
  collection: K,
  item: Db[K][number],
): Promise<{ error?: string }> {
  const c = await coll(collection);
  const key = idKey(collection);
  const id = (item as Record<string, unknown>)[key];
  if (await c.findOne({ [key]: id })) {
    return { error: `${key} "${id}" already exists` };
  }
  await c.insertOne({ ...item } as Document);
  return {};
}

export async function updateItem<K extends Collection>(
  collection: K,
  id: string,
  patch: Partial<Db[K][number]>,
): Promise<{ error?: string }> {
  const c = await coll(collection);
  const result = await c.updateOne(
    { [idKey(collection)]: id },
    { $set: patch as Document },
  );
  return result.matchedCount === 0 ? { error: "not found" } : {};
}

export async function removeItem(
  collection: Collection,
  id: string,
): Promise<{ error?: string }> {
  const c = await coll(collection);
  const result = await c.deleteOne({ [idKey(collection)]: id });
  return result.deletedCount === 0 ? { error: "not found" } : {};
}

async function settingsColl() {
  const db = (await client()).db(process.env.MONGODB_DB ?? "albatross");
  return db.collection("settings");
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await (await settingsColl()).findOne({ key: "site" });
  return {
    mission: (doc?.mission as string) ?? DEFAULT_MISSION,
    heroImages: (doc?.heroImages as SiteSettings["heroImages"]) ?? [],
    storyHeading: (doc?.storyHeading as string) || DEFAULT_STORY_HEADING,
    story: (doc?.story as string) || DEFAULT_STORY,
    storyImage: (doc?.storyImage as string) || undefined,
    contactEmail: (doc?.contactEmail as string) || undefined,
  };
}

export async function setSiteSettings(settings: SiteSettings): Promise<void> {
  await (await settingsColl()).updateOne(
    { key: "site" },
    { $set: settings },
    { upsert: true },
  );
}
