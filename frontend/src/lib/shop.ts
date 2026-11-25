// The shop's public details, in one place so they are identical everywhere
// (P10: same name, address and phone on every page). From the owner via
// Felix, 21 Nov; already public online.
export const SHOP = {
  name: "Nikita Nielsen",
  street: "Tuse Byvej 94",
  postcode: "4300",
  town: "Tuse",
  phone: "+45 28 25 74 13",
  phoneHref: "tel:+4528257413",
  email: "Nikita_nielsen@hotmail.com",
  /** Placeholder: the page address is not known yet (hand-over sheet). */
  facebookUrl: null as string | null,
  /** Placeholder: the owner has not supplied the CVR number yet. */
  cvr: null as string | null,
} as const;
