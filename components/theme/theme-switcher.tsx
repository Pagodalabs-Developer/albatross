"use client";

import { useSyncExternalStore } from "react";

const isDark = () => document.documentElement.classList.contains("dark");

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

let swapTimer: ReturnType<typeof setTimeout> | undefined;

export function useTheme() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  const toggle = () => {
    const root = document.documentElement;
    root.classList.add("theme-switching");
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => root.classList.remove("theme-switching"), 320);

    root.classList.toggle("dark", !dark);
    localStorage.setItem("theme", !dark ? "dark" : "light");
  };

  return { dark, toggle };
}

export function ThemeSwitcher() {
  const { dark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      className="relative flex items-center gap-1 rounded-full bg-muted p-1 transition-[background-color,transform] duration-150 ease-entrance active:scale-[0.97]"
    >

      <span
        aria-hidden
        className={`absolute left-1 top-1 size-[1.625rem] rounded-full bg-primary transition-transform duration-200 ease-entrance ${
          dark ? "translate-x-[1.875rem]" : "translate-x-0"
        }`}
      />
      <span
        aria-hidden
        className={`relative flex size-[1.625rem] items-center justify-center rounded-full text-meta transition-colors duration-200 ${
          dark ? "text-muted-foreground" : "text-primary-foreground"
        }`}
      >
        ☼
      </span>
      <span
        aria-hidden
        className={`relative flex size-[1.625rem] items-center justify-center rounded-full text-meta transition-colors duration-200 ${
          dark ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        ☾
      </span>
    </button>
  );
}

export function ThemeSwitcherRow() {
  const { dark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      className="flex min-h-11 w-full items-center justify-between rounded-button bg-surface px-4 py-3 text-meta font-semibold text-foreground shadow-card transition-transform duration-200 active:scale-[0.97]"
    >
      {dark ? "SWITCH TO LIGHT" : "SWITCH TO DARK"}
      <span aria-hidden className="text-brand">
        {dark ? "☼" : "☾"}
      </span>
    </button>
  );
}
