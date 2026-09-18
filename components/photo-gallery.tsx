import { Block, BlockAction } from "@/components/block";
import { Reveal } from "@/components/reveal";
import { FocusCards } from "@/components/ui/focus-cards";
import type { HeroSlide } from "@/lib/types";

export function PhotoGallery({
  photos,
  id = "photos",
  label = "Gallery",
}: {
  photos?: HeroSlide[];

  id?: string;
  label?: string;
}) {
  if (!photos || photos.length === 0) return null;

  return (
    <Block
      id={id}
      label={label}
      action={<BlockAction href="/gallery">View full gallery</BlockAction>}
    >

      <Reveal delay={0.08}>
        <FocusCards
          className="grid-cols-2 md:grid-cols-4"
          items={photos.map((photo) => ({
            image: photo.image,
            title: photo.title || undefined,
          }))}
        />
      </Reveal>
    </Block>
  );
}
