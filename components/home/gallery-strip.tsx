import Image from "next/image";
import Link from "next/link";
import { Block, BlockAction } from "@/components/block";
import { Reveal } from "@/components/reveal";
import { TiltCard } from "@/components/ui/tilt-card";
import { getGalleryImages } from "@/lib/db";

export async function GalleryStrip({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  const images = (await getGalleryImages()).slice(0, 6);
  if (images.length === 0) return null;

  return (
    <Block
      id="gallery-strip"
      label="Gallery"
      action={<BlockAction href="/gallery">View full gallery</BlockAction>}
      className={className}
      delay={delay}
    >
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {images.map((image, i) => (
          <li key={image.slug}>
            <Reveal delay={i * 0.08}>
              <TiltCard>
                <Link
                  href="/gallery"
                  className="group block overflow-hidden rounded-card"
                  aria-label={`${image.title} — open the gallery`}
                >
                  <Image
                    src={image.image}
                    alt={image.title}
                    width={320}
                    height={240}
                    sizes="(min-width: 640px) 8rem, 30vw"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 ease-entrance motion-safe:group-hover:scale-105"
                  />
                </Link>
              </TiltCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </Block>
  );
}
