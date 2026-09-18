"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
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
  TICKET_VENDORS,
  vendorColors,
  type TicketLink,
  type TicketVendor,
} from "@/lib/types";

type TicketLinksFieldProps = {
  name: string;
  defaultValue?: TicketLink[];
};

export function TicketLinksField({ name, defaultValue }: TicketLinksFieldProps) {
  const [rows, setRows] = useState<TicketLink[]>(
    defaultValue?.length ? defaultValue : [{ vendor: "Khalti", url: "" }],
  );

  const update = (i: number, patch: Partial<TicketLink>) =>
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
          <span
            aria-hidden
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold text-white"
            style={{ backgroundColor: vendorColors[row.vendor] }}
          >
            {row.vendor[0].toUpperCase()}
          </span>
          <Select
            value={row.vendor}
            onValueChange={(vendor) => update(i, { vendor: vendor as TicketVendor })}
          >
            <SelectTrigger aria-label="Ticket vendor" className="w-36 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TICKET_VENDORS.map((vendor) => (
                <SelectItem key={vendor} value={vendor}>
                  {vendor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="url"
            value={row.url}
            onChange={(e) => update(i, { url: e.target.value })}
            placeholder="https://khalti.com/..."
            aria-label="Ticket URL"
            className="min-w-0 flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Remove this ticket link"
            onClick={() =>
              setRows((prev) =>
                prev.length === 1
                  ? [{ vendor: "Khalti", url: "" }]
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
        onClick={() => setRows((prev) => [...prev, { vendor: "eSewa", url: "" }])}
        className="w-fit text-xs font-semibold"
      >
        <Plus aria-hidden className="text-brand" /> ADD ANOTHER VENDOR
      </Button>
    </div>
  );
}
