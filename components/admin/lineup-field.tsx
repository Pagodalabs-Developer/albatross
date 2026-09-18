"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LineupAct } from "@/lib/types";

const emptyAct = (): LineupAct => ({ name: "" });

export function LineupField({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: LineupAct[];
}) {
  const [acts, setActs] = useState<LineupAct[]>(
    defaultValue?.length ? defaultValue : [emptyAct()],
  );

  const update = (i: number, patch: Partial<LineupAct>) =>
    setActs((prev) => prev.map((act, j) => (j === i ? { ...act, ...patch } : act)));

  return (
    <div className="flex flex-col gap-3">
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(acts.filter((act) => act.name.trim() !== ""))}
      />
      {acts.map((act, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-button border border-border bg-background p-3"
        >
          <div className="flex items-center gap-2">
            <Input
              value={act.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Act name"
              aria-label={`Act ${i + 1} name`}
              className="min-w-0 flex-1"
            />
            <Input
              value={act.note ?? ""}
              onChange={(e) => update(i, { note: e.target.value })}
              placeholder="Headliner / Nepal"
              aria-label={`Act ${i + 1} note`}
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Remove act ${i + 1}`}
              onClick={() =>
                setActs((prev) =>
                  prev.length === 1 ? [emptyAct()] : prev.filter((_, j) => j !== i),
                )
              }
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X aria-hidden />
            </Button>
          </div>
          <ImageUpload
            compact
            defaultValue={act.image}
            onChange={(path) => update(i, { image: path || undefined })}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setActs((prev) => [...prev, emptyAct()])}
        className="w-fit text-xs font-semibold"
      >
        <Plus aria-hidden className="text-brand" /> ADD ACT
      </Button>
    </div>
  );
}
