# Stand-in photos

Photos shown in place of the owner's own until content is produced (built last, roadmap 27 Nov). CLAUDE.md override 4: stand-ins may appear on preview builds only, each is listed here, and **every one is replaced before launch**. They only show where the catalogue has no photo of its own, so the owner's photos replace them without code changes; then delete `frontend/public/stand-ins/` and `frontend/src/lib/stand-ins.ts`.

| File (`frontend/public/stand-ins/`) | Original | Used for | Source | May be shown publicly? |
|---|---|---|---|---|
| `hero.jpg` | `ref/hero.png` | Front page hero | Supplied by Felix, 27 Nov, as a stock picture; looks like a competitor's campaign photo | **No.** Local and private tests only |
| `mellem.jpg` | `ref/mellem.png` | Fødselsdag and Kærlighed: card, occasion page, cart | As above; looks like a competitor's product photo | **No** |
| `lille.jpg` | `ref/lille.png` | Bisættelse and Tak | As above | **No** |
| `stor.jpg` | `ref/stor.png` | Bare fordi | As above | **No** |
| `nikita.jpg` | `ref/nikita.jpg` | "Besøg Nikita" | The owner herself, from Felix's Figma mockup | Only with the owner's consent (DD-05 wants her in front of her shop) |

The originals in `ref/` are Felix's and not committed; the copies are resized for the web (largest side 1000–2000 px, JPEG).
