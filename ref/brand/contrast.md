# Colour pairings

Generated from `tokens.css` by `scripts/contrast.mjs` on 2026-11-17. Do not edit by hand: change the tokens and run the script again.

WCAG 2.1 AA (P9): body text needs at least **4.5:1**. Large text (24 px and up, or 18.66 px bold) and interface parts such as borders, icons and focus rings need at least **3:1**. Below 3:1 is forbidden for anything that carries meaning.

| Text or part | On ground | Ratio | Use |
|---|---|---|---|
| Linen `#DCD4D1` | Paper `#F7F4EF` | 1.33:1 | Forbidden |
| Sand `#7A644F` | Paper `#F7F4EF` | 5.09:1 | Allowed: all text |
| Ink `#2D2A26` | Paper `#F7F4EF` | 13.01:1 | Allowed: all text |
| Error `#9B2C24` | Paper `#F7F4EF` | 6.89:1 | Allowed: all text |
| Success `#36602F` | Paper `#F7F4EF` | 6.67:1 | Allowed: all text |
| Paper `#F7F4EF` | Linen `#DCD4D1` | 1.33:1 | Forbidden |
| Sand `#7A644F` | Linen `#DCD4D1` | 3.82:1 | Large text and UI parts only |
| Ink `#2D2A26` | Linen `#DCD4D1` | 9.78:1 | Allowed: all text |
| Error `#9B2C24` | Linen `#DCD4D1` | 5.17:1 | Allowed: all text |
| Success `#36602F` | Linen `#DCD4D1` | 5.01:1 | Allowed: all text |
| Paper `#F7F4EF` | Sand `#7A644F` | 5.09:1 | Allowed: all text |
| Linen `#DCD4D1` | Sand `#7A644F` | 3.82:1 | Large text and UI parts only |
| Ink `#2D2A26` | Sand `#7A644F` | 2.56:1 | Forbidden |
| Error `#9B2C24` | Sand `#7A644F` | 1.35:1 | Forbidden |
| Success `#36602F` | Sand `#7A644F` | 1.31:1 | Forbidden |
| Paper `#F7F4EF` | Ink `#2D2A26` | 13.01:1 | Allowed: all text |
| Linen `#DCD4D1` | Ink `#2D2A26` | 9.78:1 | Allowed: all text |
| Sand `#7A644F` | Ink `#2D2A26` | 2.56:1 | Forbidden |
| Error `#9B2C24` | Ink `#2D2A26` | 1.89:1 | Forbidden |
| Success `#36602F` | Ink `#2D2A26` | 1.95:1 | Forbidden |

## Focus ring

The focus ring is two-tone (`--focus-ring`): Ink inside, Paper outside. On light grounds the Ink ring carries the contrast, on Sand and Ink the Paper halo does:

- On Paper: 13.01:1 (passes 3:1)
- On Linen: 9.78:1 (passes 3:1)
- On Sand: 5.09:1 (passes 3:1)
- On Ink: 13.01:1 (passes 3:1)
