import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "@/components/reveal";

export function Block({
  id,
  label,
  action,
  children,
  delay = 0,
  className = "",
}: {
  id: string;
  label: string;
  action?: ReactNode;
  children: ReactNode;

  delay?: number;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}

      className={`mx-auto w-full min-w-0 max-w-[110rem] px-5 py-8 transition-colors duration-theme md:px-8 md:py-10 ${className}`}
    >

      <Reveal delay={delay} distance={28} className="flex flex-col gap-4 md:gap-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id={`${id}-heading`}
            className="text-label font-semibold uppercase tracking-[0.18em] text-brand"
          >
            {label}
          </h2>
          {action}
        </div>
        {children}
      </Reveal>
    </section>
  );
}

export function BlockAction({
  href,
  children,
  external,
}: {
  href: string;
  children: string;
  external?: boolean;
}) {
  const className =
    "group inline-flex shrink-0 items-center gap-2 text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-[color,transform] duration-[160ms] ease-entrance hover:text-brand active:scale-[0.97]";
  const inner = (
    <>
      {children}
      <span
        aria-hidden
        className="transition-transform duration-[160ms] ease-entrance motion-safe:group-hover:translate-x-1.5"
      >
        →
      </span>
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
