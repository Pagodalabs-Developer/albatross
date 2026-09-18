"use client";

import { Loader2, MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { eventMap, parseCoords } from "@/lib/types";

type Place = { label: string; coords: string };

const PHOTON = "https://photon.komoot.io/api/";

const placeLabel = (p: Record<string, string>) =>
  [
    [p.name, p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.street]
      .filter(Boolean)
      .join(" · "),
    p.city ?? p.county,
    p.state,
    p.country,
  ]
    .filter(Boolean)
    .join(", ");

type LocationFieldProps = {
  name: string;
  defaultValue?: string;
};

export function LocationField({ name, defaultValue }: LocationFieldProps) {
  const [coords, setCoords] = useState(parseCoords(defaultValue) ?? "");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const abort = useRef<AbortController>(undefined);

  const pasted = parseCoords(query);

  const shown = pasted || query.trim().length < 3 ? [] : results;

  useEffect(() => {
    if (pasted || query.trim().length < 3) return;
    const timer = setTimeout(async () => {
      abort.current?.abort();
      abort.current = new AbortController();
      setBusy(true);
      setError("");
      try {
        const res = await fetch(`${PHOTON}?q=${encodeURIComponent(query)}&limit=6&lang=en`, {
          signal: abort.current.signal,
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResults(
          (data.features ?? []).map((f: { geometry: { coordinates: [number, number] }; properties: Record<string, string> }) => ({
            label: placeLabel(f.properties),

            coords: `${f.geometry.coordinates[1]},${f.geometry.coordinates[0]}`,
          })),
        );
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setResults([]);
        setError("Search is unavailable — paste a Google Maps link instead.");
      } finally {
        setBusy(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, pasted]);

  useEffect(() => () => abort.current?.abort(), []);

  const choose = (value: string) => {
    setCoords(value);
    setQuery("");
    setResults([]);
    setError("");
  };

  const map = coords ? eventMap({ coords }) : undefined;

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={coords} />

      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a venue, or paste a Google Maps link"
          className="pl-9"

          autoComplete="off"
        />
        {busy && (
          <Loader2
            aria-hidden
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        )}
      </div>

      {pasted && (
        <button
          type="button"
          onClick={() => choose(pasted)}
          className="flex items-center gap-2 rounded-button border border-border bg-surface px-3 py-2 text-left text-xs font-medium text-foreground transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MapPin aria-hidden className="size-4 shrink-0 text-brand" />
          Use this pin — {pasted}
        </button>
      )}

      {shown.length > 0 && (
        <ul className="flex flex-col overflow-hidden rounded-card border border-border bg-surface">
          {shown.map((place) => (
            <li key={place.coords}>
              <button
                type="button"
                onClick={() => choose(place.coords)}
                className="flex w-full items-start gap-2 border-b border-border px-3 py-2 text-left text-xs text-foreground transition-colors last:border-b-0 hover:bg-muted focus-visible:outline-none focus-visible:bg-muted"
              >
                <MapPin aria-hidden className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                {place.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}

      {map ? (
        <div className="flex flex-col gap-1.5">

          <div className="overflow-hidden rounded-card border border-border">
            <iframe
              src={map.src}
              title="Selected location"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-40 w-full border-0"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-caption text-muted-foreground">Pinned at {coords}</span>
            <button
              type="button"
              onClick={() => choose("")}
              className="inline-flex shrink-0 items-center gap-1 text-caption font-medium text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden className="size-3" />
              Clear
            </button>
          </div>
        </div>
      ) : (
        <p className="text-caption text-muted-foreground">
          Optional. Left empty, the map searches for the venue and city above.
        </p>
      )}
    </div>
  );
}
