"use client";

import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  withTime?: boolean;
};

const toISO = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function fromISO(value?: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("T")[0].split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : undefined;
}

function format12(time: string) {
  const [hh = 0, mm = 0] = time.split(":").map(Number);
  return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

function parseClock(time: string) {
  const [hh = 18, mm = 0] = time.split(":").map(Number);
  return { hour12: ((hh + 11) % 12) + 1, minute: mm, meridiem: hh < 12 ? "AM" : "PM" };
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);

const MINUTE_GRID = Array.from({ length: 12 }, (_, i) => i * 5);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS_PER_PAGE = 12;
const START_YEAR = new Date().getFullYear() - 60;
const END_YEAR = new Date().getFullYear() + 10;

const gridButtonClass = (active: boolean) =>
  cn(
    "rounded-button py-2 text-sm font-medium transition-colors hover:bg-elevated",
    active ? "bg-primary text-primary-foreground hover:bg-primary-hover" : "text-foreground",
  );

export function DatePicker({
  name,
  defaultValue,
  placeholder,
  withTime = false,
}: DatePickerProps) {
  const [selected, setSelected] = useState<Date | undefined>(fromISO(defaultValue));
  const [time, setTime] = useState(defaultValue?.split("T")[1] ?? "18:00");
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(selected ?? new Date());
  const [view, setView] = useState<"days" | "months" | "years">("days");

  const value = selected
    ? withTime
      ? `${toISO(selected)}T${time}`
      : toISO(selected)
    : "";

  const clock = parseClock(time);
  const minuteOptions = MINUTE_GRID.includes(clock.minute)
    ? MINUTE_GRID
    : [...MINUTE_GRID, clock.minute].sort((a, b) => a - b);

  const setClock = (hour12: number, minute: number, meridiem: string) =>
    setTime(`${pad(meridiem === "AM" ? hour12 % 12 : (hour12 % 12) + 12)}:${pad(minute)}`);

  const selectToday = () => {
    const today = new Date();
    setSelected(today);
    setMonth(today);
  };

  const yearsPageStart = Math.floor(month.getFullYear() / YEARS_PER_PAGE) * YEARS_PER_PAGE;

  const headerLabel =
    view === "days"
      ? month.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : view === "months"
        ? String(month.getFullYear())
        : `${yearsPageStart}–${yearsPageStart + YEARS_PER_PAGE - 1}`;

  const goPrev = () => {
    if (view === "days") setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1));
    else if (view === "months") setMonth((m) => new Date(m.getFullYear() - 1, m.getMonth()));
    else setMonth((m) => new Date(m.getFullYear() - YEARS_PER_PAGE, m.getMonth()));
  };
  const goNext = () => {
    if (view === "days") setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1));
    else if (view === "months") setMonth((m) => new Date(m.getFullYear() + 1, m.getMonth()));
    else setMonth((m) => new Date(m.getFullYear() + YEARS_PER_PAGE, m.getMonth()));
  };

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setView("days");
        }}
      >
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-start font-normal">
            <CalendarIcon aria-hidden className="text-muted-foreground" />
            {selected ? (
              selected.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }) + (withTime ? ` · ${format12(time)}` : "")
            ) : (
              <span className="text-muted-foreground">{placeholder ?? "Pick a date"}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-0">
          <div className="flex items-center justify-between gap-1 p-3 pb-0">
            <button
              type="button"
              aria-label="Previous"
              onClick={goPrev}
              className="flex size-8 items-center justify-center rounded-button text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-elevated hover:text-foreground active:scale-[0.9]"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setView((v) => (v === "days" ? "months" : v === "months" ? "years" : v))}
              disabled={view === "years"}
              className="rounded-button px-2 py-1.5 text-sm font-medium transition-colors hover:bg-elevated disabled:cursor-default disabled:hover:bg-transparent"
            >
              {headerLabel}
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={goNext}
              className="flex size-8 items-center justify-center rounded-button text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-elevated hover:text-foreground active:scale-[0.9]"
            >
              <ChevronRight aria-hidden className="size-4" />
            </button>
          </div>

          {view === "days" && (
            <Calendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              startMonth={new Date(START_YEAR, 0)}
              endMonth={new Date(END_YEAR, 11)}
              selected={selected}
              onSelect={(date) => {
                setSelected(date);
                if (!withTime) setOpen(false);
              }}
              classNames={{ root: "w-full", nav: "hidden", month_caption: "hidden" }}
            />
          )}

          {view === "months" && (
            <div className="grid grid-cols-3 gap-1.5 p-3">
              {MONTHS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setMonth(new Date(month.getFullYear(), i));
                    setView("days");
                  }}
                  className={gridButtonClass(month.getMonth() === i)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {view === "years" && (
            <div className="grid grid-cols-3 gap-1.5 p-3">
              {Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearsPageStart + i)
                .filter((y) => y >= START_YEAR && y <= END_YEAR)
                .map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setMonth(new Date(y, month.getMonth()));
                      setView("months");
                    }}
                    className={gridButtonClass(month.getFullYear() === y)}
                  >
                    {y}
                  </button>
                ))}
            </div>
          )}

          {withTime && view === "days" && (
            <div className="flex items-center gap-2 border-t border-border p-3">
              <span className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                Time
              </span>
              <div className="flex flex-1 items-center gap-1">
                <Select
                  value={String(clock.hour12)}
                  onValueChange={(v) => setClock(Number(v), clock.minute, clock.meridiem)}
                >
                  <SelectTrigger aria-label="Hour" className="h-9 flex-1 px-2.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span aria-hidden className="text-sm text-muted-foreground">
                  :
                </span>
                <Select
                  value={String(clock.minute)}
                  onValueChange={(v) => setClock(clock.hour12, Number(v), clock.meridiem)}
                >
                  <SelectTrigger aria-label="Minute" className="h-9 flex-1 px-2.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {minuteOptions.map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {pad(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={clock.meridiem}
                  onValueChange={(v) => setClock(clock.hour12, clock.minute, v)}
                >
                  <SelectTrigger aria-label="AM or PM" className="h-9 flex-1 px-2.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {view === "days" && (
            <div className="flex items-center justify-between gap-2 border-t border-border p-3">
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={selectToday}>
                  Today
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!selected}
                  onClick={() => setSelected(undefined)}
                >
                  Clear
                </Button>
              </div>
              <Button type="button" size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}
