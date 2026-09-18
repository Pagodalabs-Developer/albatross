import { cn } from "@/lib/utils";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid auto-rows-[10rem] grid-cols-2 gap-3 md:auto-rows-[12rem] md:grid-cols-4 md:gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  cta,
  children,
}: {
  className?: string;
  title: string;
  description?: string;
  cta?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/bento relative size-full overflow-hidden rounded-card border border-border-subtle shadow-card transition-shadow duration-300 hover:shadow-elevated",
        className,
      )}
    >
      <div className="absolute inset-0 transition-transform duration-300 ease-entrance motion-safe:group-hover/bento:scale-105">
        {children}
      </div>

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 transition-[background-color,opacity] duration-300 group-hover/bento:from-black/85 group-focus-within/bento:from-black/85">
        <p className="font-display text-accent-display text-white">{title}</p>
        {(description || cta) && (
          <div className="translate-y-1 opacity-0 transition-[transform,opacity] duration-300 ease-entrance group-hover/bento:translate-y-0 group-hover/bento:opacity-100 group-focus-within/bento:translate-y-0 group-focus-within/bento:opacity-100 motion-reduce:translate-y-0">
            {description && (
              <p className="line-clamp-2 text-caption text-white/80">{description}</p>
            )}
            {cta && <p className="mt-1 text-label font-semibold text-white">{cta}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
