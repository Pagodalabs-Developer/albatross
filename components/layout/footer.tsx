import Link from "next/link";
import { SocialIcon } from "@/components/social-icon";
import { getSiteSettings } from "@/lib/db";
import { bandLinks, type SocialPlatform } from "@/lib/types";

const footerLinks = [
  { label: "Home", href: "/#home" },
  { label: "Events", href: "/#events" },
  { label: "Catalog", href: "/#catalog" },
  { label: "About", href: "/#about" },
  { label: "News", href: "/news" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/#contact" },
];

const socialLinks: { label: string; href: string; platform: SocialPlatform }[] = [
  { label: "YouTube", href: bandLinks.youtube, platform: "youtube" },
  { label: "Instagram", href: "https://www.instagram.com/albatrossnepal/", platform: "instagram" },
  { label: "Spotify", href: bandLinks.spotify, platform: "spotify" },
  { label: "Facebook", href: "https://www.facebook.com/albatrossnepal", platform: "facebook" },
];

export async function Footer() {
  const { contactEmail } = await getSiteSettings();

  return (
    <footer
      id="contact"
      className="relative isolate overflow-hidden border-t border-border bg-surface px-5 py-8 text-foreground transition-colors duration-theme md:px-16 md:py-12"
    >

      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.22em] left-[-0.05em] -z-10 select-none whitespace-nowrap font-display text-[26vw] leading-none text-foreground/[0.04]"
      >
        ALBATROSS
      </span>

      <span aria-hidden className="footer-rule mb-8 block h-px w-full bg-border md:mb-10" />

      <div className="mx-auto grid max-w-[110rem] gap-10 md:grid-cols-3 md:items-start md:gap-12">
        <div className="flex flex-col gap-3">
          <p className="font-display text-headline leading-none">ALBATROSS</p>
          <p className="text-meta leading-normal text-muted-foreground">
            Raw sound. Real stories.
          </p>

          <ul className="mt-1 flex flex-wrap items-center gap-1">
            {socialLinks.map(({ label, href, platform }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Albatross on ${label}`}
                  className="flex size-11 items-center justify-center rounded-button text-muted-foreground transition-[color,transform] duration-[160ms] ease-entrance hover:text-brand active:scale-[0.92]"
                >
                  <SocialIcon platform={platform} className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <form
          className="flex flex-col gap-3"
          aria-label="Newsletter"
          action="#"
        >
          {contactEmail && (
            <div className="mb-5 flex flex-col gap-1.5">
              <p className="text-meta font-semibold">BOOKING &amp; PRESS</p>
              <a
                href={`mailto:${contactEmail}`}
                className="w-fit text-caption text-muted-foreground underline-offset-4 transition-colors duration-[160ms] ease-entrance hover:text-brand hover:underline"
              >
                {contactEmail}
              </a>
            </div>
          )}
          <p className="text-meta font-semibold">STAY IN THE LOOP</p>

          <div className="group relative flex items-center gap-2 overflow-hidden rounded-button border border-border bg-background py-2 pl-4 pr-2 transition-[border-color,transform,box-shadow] duration-300 ease-entrance focus-within:border-brand focus-within:shadow-lg motion-safe:focus-within:-translate-y-0.5">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Email address"
              className="w-full min-w-0 bg-transparent text-caption text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-button bg-primary px-5 py-3 text-meta font-semibold text-primary-foreground transition-[background-color,transform] duration-[160ms] ease-entrance hover:bg-primary-hover active:scale-[0.97]"
            >
              SUBSCRIBE
            </button>

            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-200 ease-entrance motion-safe:group-focus-within:scale-x-100"
            />
          </div>
        </form>

        <div className="flex flex-col gap-4 md:items-end">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
              {footerLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-caption text-muted-foreground transition-colors hover:text-brand"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-caption text-muted-foreground">
            © {new Date().getFullYear()} Albatross. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
