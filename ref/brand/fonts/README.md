# Brand fonts

Self-hosted, subset WOFF2 files. Built from the variable fonts in `source/` (downloaded 17 Nov 2026 from the Google Fonts repository, `ofl/ancizarsans`, `ofl/ancizarserif`, `ofl/inter`, `ofl/instrumentsans`).

| File | Family | Use | Size |
|---|---|---|---|
| `ancizar-serif.woff2` | Ancizar Serif, weight 400–700 | Logo and headings | 25.0 KB |
| `ancizar-serif-italic.woff2` | Ancizar Serif Italic, weight 400–700 | Headings, if italic is used | 25.6 KB |
| `ancizar-sans.woff2` | Ancizar Sans, weight 400–700 | Comparison on the specimen only. Not shipped | 22.6 KB |
| `inter.woff2` | Inter, weight 400–700, optical size 14 | Body and interface text (chosen 17 Nov) | 26.3 KB |
| `instrument-sans.woff2` | Instrument Sans, weight 400–700 | Comparison on the specimen only. Not shipped | 29.2 KB |

Shipped: Ancizar Serif upright and italic, and Inter, 76.9 KB in total, under the 100 KB budget.

## How they were made

1. Weight axis limited to 400–700 with `fonttools varLib.instancer` (the source files run 100–1000, 300–900 and 100–900; the shop uses 400–700). Inter's optical size fixed at 14 (the text setting). Instrument Sans width fixed at 100.
2. Subset with `pyftsubset` to Basic Latin, Latin-1 (includes æ ø å Æ Ø Å), dashes, quotes, ellipsis, € and ™, keeping kerning, ligatures and number styles.
3. Converted to WOFF2, hinting removed (modern screens do not use it).

Each file was checked to contain æ ø å Æ Ø Å and €.

## Licences

All four families are under the SIL Open Font License 1.1 (`source/*-OFL.txt`), which allows commercial use, self-hosting and subsetting. The OFL requires that modified versions are not sold on their own and keep the licence; our subsets ship inside the website only.

| Family | Copyright | Source |
|---|---|---|
| Ancizar Serif | The Ancizar Serif Project Authors (Universidad Nacional de Colombia) | https://github.com/UNAL-OMD/UNAL-Ancizar |
| Ancizar Sans | The Ancizar Sans Project Authors (Universidad Nacional de Colombia) | https://github.com/UNAL-OMD/UNAL-Ancizar |
| Inter | The Inter Project Authors (Rasmus Andersson) | https://github.com/rsms/inter |
| Instrument Sans | The Instrument Sans Project Authors | https://github.com/Instrument/instrument-sans |
