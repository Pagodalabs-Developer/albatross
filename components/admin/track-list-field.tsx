"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { AudioUpload } from "@/components/admin/audio-upload";
import { ImageUpload } from "@/components/admin/image-upload";
import { StoreIcon } from "@/components/store-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatDuration,
  STORES,
  storeLabels,
  type StoreLink,
  type StoreName,
  type Track,
} from "@/lib/types";

type TrackListFieldProps = {
  name: string;
  defaultValue?: Track[];
};

const emptyTrack = (): Track => ({ title: "", links: [] });

export function TrackListField({ name, defaultValue }: TrackListFieldProps) {
  const [tracks, setTracks] = useState<Track[]>(
    defaultValue?.length ? defaultValue : [emptyTrack()],
  );

  const update = (i: number, patch: Partial<Track>) =>
    setTracks((prev) => prev.map((t, j) => (j === i ? { ...t, ...patch } : t)));

  const updateLink = (i: number, li: number, patch: Partial<StoreLink>) =>
    setTracks((prev) =>
      prev.map((t, j) =>
        j === i
          ? { ...t, links: (t.links ?? []).map((l, k) => (k === li ? { ...l, ...patch } : l)) }
          : t,
      ),
    );

  return (
    <div className="flex flex-col gap-3">
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(
          tracks
            .filter((t) => t.title.trim() !== "")
            .map((t) => ({
              ...t,
              links: t.links?.filter((l) => l.url.trim() !== ""),
            })),
        )}
      />
      {tracks.map((track, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-button border border-border bg-background p-3"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-right text-xs font-semibold text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Input
              value={track.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Track title"
              aria-label={`Track ${i + 1} title`}
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Remove track ${i + 1}`}
              onClick={() =>
                setTracks((prev) =>
                  prev.length === 1 ? [emptyTrack()] : prev.filter((_, j) => j !== i),
                )
              }
              className="shrink-0 text-muted-foreground hover:text-accent"
            >
              <X aria-hidden />
            </Button>
          </div>

          <ImageUpload
            compact
            defaultValue={track.image}
            onChange={(path) => update(i, { image: path })}
          />

          <AudioUpload
            label="track audio"
            defaultValue={track.audio}
            onChange={(path, duration) =>
              update(i, {
                audio: path || undefined,
                duration: path ? (duration ?? track.duration) : undefined,
              })
            }
          />
          {track.duration !== undefined && (
            <p className="pl-1 text-caption text-muted-foreground">
              Runtime {formatDuration(track.duration)} — read from the file.
            </p>
          )}

          {(track.links ?? []).map((link, li) => (
            <div key={li} className="flex items-center gap-2">
              <Select
                value={link.store}
                onValueChange={(store) => updateLink(i, li, { store: store as StoreName })}
              >
                <SelectTrigger
                  aria-label={`Track ${i + 1} store`}
                  className="w-36 shrink-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STORES.map((store) => (
                    <SelectItem key={store} value={store}>
                      <span className="flex items-center gap-2">
                        <StoreIcon store={store} className="size-3.5" />
                        {storeLabels[store]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(i, li, { url: e.target.value })}
                placeholder="https://..."
                aria-label={`Track ${i + 1} store URL`}
                className="min-w-0 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Remove store link from track ${i + 1}`}
                onClick={() =>
                  update(i, { links: (track.links ?? []).filter((_, k) => k !== li) })
                }
                className="shrink-0 text-muted-foreground hover:text-accent"
              >
                <X aria-hidden />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update(i, {
                links: [...(track.links ?? []), { store: "youtube", url: "" }],
              })
            }
            className="w-fit text-xs font-semibold"
          >
            <Plus aria-hidden className="text-brand" /> ADD STORE LINK
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setTracks((prev) => [...prev, emptyTrack()])}
        className="w-fit text-xs font-semibold"
      >
        <Plus aria-hidden className="text-brand" /> ADD TRACK
      </Button>
    </div>
  );
}
