"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
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
import { STORES, storeLabels, type StoreLink, type StoreName } from "@/lib/types";

type StoreLinksFieldProps = {
  name: string;
  defaultValue?: StoreLink[];
};

export function StoreLinksField({ name, defaultValue }: StoreLinksFieldProps) {
  const [rows, setRows] = useState<StoreLink[]>(
    defaultValue?.length ? defaultValue : [{ store: "spotify", url: "" }],
  );

  const update = (i: number, patch: Partial<StoreLink>) =>
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
            value={row.store}
            onValueChange={(store) => update(i, { store: store as StoreName })}
          >
            <SelectTrigger aria-label="Store" className="w-40 shrink-0">
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
            value={row.url}
            onChange={(e) => update(i, { url: e.target.value })}
            placeholder="https://open.spotify.com/..."
            aria-label="Store URL"
            className="min-w-0 flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Remove this store link"
            onClick={() =>
              setRows((prev) =>
                prev.length === 1
                  ? [{ store: "spotify", url: "" }]
                  : prev.filter((_, j) => j !== i),
              )
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
        onClick={() => setRows((prev) => [...prev, { store: "youtube", url: "" }])}
        className="w-fit text-xs font-semibold"
      >
        <Plus aria-hidden className="text-brand" /> ADD ANOTHER STORE
      </Button>
    </div>
  );
}
