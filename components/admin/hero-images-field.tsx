"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HeroSlide } from "@/lib/types";

type HeroImagesFieldProps = {
  name: string;
  defaultValue?: HeroSlide[];
  itemLabel?: string;
};

export function HeroImagesField({
  name,
  defaultValue,
  itemLabel = "slide",
}: HeroImagesFieldProps) {
  const [rows, setRows] = useState<HeroSlide[]>(
    defaultValue?.length ? defaultValue : [{ title: "", image: "" }],
  );

  const update = (i: number, patch: Partial<HeroSlide>) =>
    setRows((prev) => prev.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  return (
    <div className="flex flex-col gap-3">
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(rows.filter((row) => row.image.trim() !== ""))}
      />
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-button border border-border bg-background p-3"
        >
          <ImageUpload
            compact
            defaultValue={row.image || undefined}
            onChange={(path) => update(i, { image: path })}
          />
          <div className="flex items-center gap-2">
            <Input
              value={row.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Caption (e.g. Live in Kathmandu 2026)"
              aria-label={`${itemLabel} ${i + 1} caption`}
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Remove ${itemLabel} ${i + 1}`}
              onClick={() =>
                setRows((prev) =>
                  prev.length === 1
                    ? [{ title: "", image: "" }]
                    : prev.filter((_, j) => j !== i),
                )
              }
              className="shrink-0 gap-1.5 text-xs font-semibold text-muted-foreground hover:border-destructive hover:text-destructive"
            >
              <Trash2 aria-hidden className="size-3.5" /> REMOVE
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRows((prev) => [...prev, { title: "", image: "" }])}
        className="w-fit text-xs font-semibold"
      >
        <Plus aria-hidden className="text-brand" /> ADD {itemLabel.toUpperCase()}
      </Button>
    </div>
  );
}
