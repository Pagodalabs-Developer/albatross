export type Store = "spotify" | "appleMusic" | "youtube" | "bandcamp";

const PATHS: Record<Store, string> = {
  spotify:
    "M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1.03.26c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 0 1-.33-1.46c4.58-1.04 8.5-.6 11.65 1.33a.75.75 0 0 1 .26 1.03Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.23-1.98-8.15-2.56-11.97-1.4a.94.94 0 0 1-.55-1.8c4.36-1.32 9.78-.68 13.5 1.6a.94.94 0 0 1 .31 1.29Zm.13-3.4C15.7 8.4 8.9 8.17 5.2 9.3a1.12 1.12 0 1 1-.65-2.15c4.25-1.29 11.8-1.02 15.98 1.5a1.12 1.12 0 0 1-1.14 1.93Z",
  appleMusic:
    "M9 3v10.5a3 3 0 1 0 1.5 2.6V6.7l7-1.4v8.2a3 3 0 1 0 1.5 2.6V3l-10 2Z",
  youtube:
    "M22.5 6.2a2.8 2.8 0 0 0-2-2C18.7 3.7 12 3.7 12 3.7s-6.7 0-8.5.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 5.8 2.8 2.8 0 0 0 2 2c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-5.8ZM9.8 15.5V8.5l6 3.5-6 3.5Z",
  bandcamp: "M0 18.75h9.653L15 5.25H5.348L0 18.75Z",
};

export function StoreIcon({ store, className = "size-4" }: { store: Store; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={PATHS[store]} />
    </svg>
  );
}
