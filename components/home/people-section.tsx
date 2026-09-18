import { Block } from "@/components/block";
import { PeopleGrid, type PersonCard } from "@/components/home/people-grid";
import { isMediaPath, memberHref, memberPortrait, type Member } from "@/lib/types";

export function PeopleSection({
  id,
  heading,
  people,
  className = "",
  delay = 0,
}: {
  id: string;
  heading: string;
  people: Member[];
  className?: string;
  delay?: number;
}) {
  if (people.length === 0) return null;

  const cards: PersonCard[] = people.map((person) => {
    const portrait = memberPortrait(person);
    return {
      name: person.name,
      role: person.role,
      href: memberHref(person),
      image: isMediaPath(portrait) ? portrait : undefined,
    };
  });

  return (
    <Block id={id} label={heading} className={className}
      delay={delay}>
      <PeopleGrid people={cards} />
    </Block>
  );
}
