"use client";

// The cart in components, plus a price check against the catalogue: prices
// in the cart were copied when the bouquet was added, and may have changed
// or the bouquet sold out since (spec storefront: price refresh with a note).
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getCart,
  getServerCart,
  replaceLines,
  subscribeToCart,
  type Cart,
} from "@/lib/cart-store";
import type { OccasionDetail, Tier } from "@/lib/catalog";
import { kroner } from "@/lib/format";

export const TIER_NAME: Record<Tier, string> = {
  lille: "Lille",
  mellem: "Mellem",
  stor: "Stor",
};

export function useCart(): Cart {
  return useSyncExternalStore(subscribeToCart, getCart, getServerCart);
}

/** Notes about changed or removed bouquets, once the check has run. */
export function useRefreshedPrices(cart: Cart): string[] {
  const [notes, setNotes] = useState<string[]>([]);
  const slugs = [...new Set(cart.lines.map((l) => l.slug))].join(",");

  useEffect(() => {
    if (!slugs) return;
    let current = true;
    Promise.all(
      slugs.split(",").map((slug) =>
        fetch(`/api/occasions/${encodeURIComponent(slug)}`)
          .then((r) => (r.ok ? (r.json() as Promise<OccasionDetail>) : null))
          .catch(() => undefined),
      ),
    ).then((found) => {
      if (!current) return;
      // A network failure (undefined) changes nothing; checkout re-prices.
      if (found.some((o) => o === undefined)) return;
      const bySlug = new Map(
        found.filter((o): o is OccasionDetail => !!o).map((o) => [o.slug, o]),
      );
      const cart = getCart();
      const changes: string[] = [];
      const lines = cart.lines.flatMap((line) => {
        const occasion = bySlug.get(line.slug);
        const price = occasion?.tiers.find((t) => t.tier === line.tier);
        if (!occasion || occasion.soldOut || !price) {
          changes.push(
            `${line.name} · ${TIER_NAME[line.tier]} kan ikke bestilles lige nu og er taget ud af kurven.`,
          );
          return [];
        }
        if (price.priceOere !== line.unitPriceOere) {
          changes.push(
            `Prisen på ${line.name} · ${TIER_NAME[line.tier]} er nu ${kroner(price.priceOere)}.`,
          );
          return [{ ...line, unitPriceOere: price.priceOere }];
        }
        return [line];
      });
      if (changes.length > 0) {
        replaceLines(lines);
        setNotes(changes);
      }
    });
    return () => {
      current = false;
    };
  }, [slugs]);

  return notes;
}
