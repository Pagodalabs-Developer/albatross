"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { SocialIcon } from "@/components/social-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SOCIALS, socialLabels, type SocialLink, type SocialPlatform } from "@/lib/types";

const emptyRow = (): SocialLink => ({ platform: "instagram", url: "" });

export function SocialLinksField({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: SocialLink[];
}) {
  const [rows, setRows] = useState<SocialLink[]>(
    defaultValue?.length ? defaultValue : [emptyRow()],
  );

  const update = (i: number, patch: Partial<SocialLink>) =>
    setRows((prev) => prev.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  return (
    <div className="flex flex-col gap-2">
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(rows.filter((row) => row.url.trim() !== ""))}
      />
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Select
            value={row.platform}
            onValueChange={(platform) =>
              update(i, { platform: platform as SocialPlatform })
            }
          >
            <SelectTrigger aria-label="Platform" className="w-40 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOCIALS.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  <span className="flex items-center gap-2">
                    <SocialIcon platform={platform} className="size-3.5" />
                    {socialLabels[platform]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="url"
            value={row.url}
            onChange={(e) => update(i, { url: e.target.value })}
            placeholder="https://instagram.com/..."
            aria-label="Profile URL"
            className="min-w-0 flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Remove this profile"
            onClick={() =>
              setRows((prev) =>
                prev.length === 1 ? [emptyRow()] : prev.filter((_, j) => j !== i),
              )
            }
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <X aria-hidden />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRows((prev) => [...prev, emptyRow()])}
        className="w-fit text-xs font-semibold"
      >
        <Plus aria-hidden className="text-brand" /> ADD PROFILE
      </Button>
    </div>
  );
}
