import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { absolute } from "@/lib/seo";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: absolute(crumb.href) } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="px-5 pt-5 md:px-8">
      <JsonLd data={jsonLd} />
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-muted-foreground">
        {trail.map((crumb, i) => (
          <li
            key={crumb.label + i}
            className="flex items-center gap-2 before:text-border before:content-['/'] first:before:content-none"
          >
            {crumb.href ? (
              <Link href={crumb.href} className="transition-colors hover:text-brand">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
