// STAND-IN PHOTOS, for local tests and previews only (CLAUDE.md override 4,
// brand guide section 5). Every one is listed here and in
// docs/design/stand-ins.md, and every one goes before launch; content is
// built last (roadmap, 27 Nov). They show only where the catalogue has no
// photo of its own, so the owner's photos replace them without code changes.
//
// hero, lille, mellem, stor: supplied by Felix on 27 Nov as stock pictures;
//   they look like a competitor's product photos, so they must not appear on
//   a shared preview link or in production.
// nikita: the owner herself, from Felix's Figma mockup (her own photo).

type StandIn = { url: string; alt: string };

const BOUQUETS: StandIn[] = [
  {
    url: "/stand-ins/mellem.jpg",
    alt: "Buket med lyserøde roser holdt i hånden",
  },
  { url: "/stand-ins/lille.jpg", alt: "Lille buket med roser i en glasvase" },
  { url: "/stand-ins/stor.jpg", alt: "Stor buket med roser i en glasvase" },
];

const ORDER = ["fodselsdag", "bisaettelse", "bare-fordi", "kaerlighed", "tak"];

/** A stand-in for an occasion's main photo, varied so the grid is not one picture. */
export function standInFor(slug: string): StandIn {
  if (slug === "jul-og-advent") return HERO_STAND_IN;
  const i = ORDER.indexOf(slug);
  return BOUQUETS[(i === -1 ? 0 : i) % BOUQUETS.length]!;
}

export const HERO_STAND_IN: StandIn = {
  url: "/stand-ins/hero.jpg",
  alt: "Buket med røde roser på et bord i juleskær",
};

export const VISIT_STAND_IN: StandIn = {
  url: "/stand-ins/nikita.jpg",
  alt: "Nikita foran butikken med en kurv fuld af blomster",
};
