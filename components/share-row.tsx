"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { SocialIcon } from "@/components/social-icon";

const button =
  "flex size-11 items-center justify-center rounded-button border border-border text-muted-foreground transition-[color,border-color,transform] duration-[160ms] ease-entrance hover:border-brand hover:text-brand active:scale-[0.95]";

export function ShareRow({
  title,

  labelled = false,
}: {
  title: string;
  labelled?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const share = (kind: "facebook" | "twitter") => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    window.open(
      kind === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${url}`
        : `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is permission-gated and blocked outright in some embedded
      // views. Staying silent is right here: the URL is already in the address
      // bar, so there is nothing the visitor needs to be told to recover.
    }
  };

  if (labelled) {

    const rows = [
      { key: "facebook" as const, label: "Facebook", onClick: () => share("facebook") },
      { key: "twitter" as const, label: "X (Twitter)", onClick: () => share("twitter") },
    ];
    return (
      <ul className="flex flex-col gap-1">
        {rows.map(({ key, label, onClick }) => (
          <li key={key}>
            <button
              type="button"
              onClick={onClick}
              className="group flex min-h-11 items-center gap-2.5 text-meta text-muted-foreground transition-colors hover:text-brand"
            >
              <SocialIcon platform={key} className="size-3.5 text-brand" />
              {label}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Link copied" : "Copy link"}
            className="flex min-h-11 items-center gap-2.5 text-meta text-muted-foreground transition-colors hover:text-brand"
          >
            {copied ? (
              <Check aria-hidden className="size-3.5 text-brand" />
            ) : (
              <Link2 aria-hidden className="size-3.5 text-brand" />
            )}
            {copied ? "Link copied" : "Copy link"}
          </button>
        </li>
      </ul>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => share("facebook")} aria-label="Share on Facebook" className={button}>
        <SocialIcon platform="facebook" className="size-3.5" />
      </button>
      <button type="button" onClick={() => share("twitter")} aria-label="Share on X" className={button}>
        <SocialIcon platform="twitter" className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={copy}

        aria-label={copied ? "Link copied" : "Copy link"}
        className={button}
      >
        {copied ? (
          <Check aria-hidden className="size-3.5 text-brand" />
        ) : (
          <Link2 aria-hidden className="size-3.5" />
        )}
      </button>
    </div>
  );
}
