# Florist e-commerce

API-driven full-stack webshop for a local Danish florist that today sells only through social media. 6-week project, 10 Nov – 20 Dec 2026.

- Case: [Ref/Case Synopsis - Felix.md](Ref/Case%20Synopsis%20-%20Felix.md)
- Plan and working rules: [Ref/Roadmap.md](Ref/Roadmap.md)
- Why we design the way we do: [Ref/Design-Rationale.md](Ref/Design-Rationale.md)
- Changes are planned in OpenSpec (`openspec/`). Use `/opsx:propose` before larger work.

## Skill overrides

The design skills in `.claude/skills/` are third-party, so they are never edited (provenance: `.claude/skills/PROVENANCE.md`). Where a skill conflicts with this project, these rules win:

1. **Real business details** (overrides taste-skill house rule 9). Show the shop's real CVR number, full address, real phone number and email as approved by the owner. Danish e-commerce law requires them, and local SEO needs the same name, address and phone everywhere.
2. **Dynamic app, not static export** (overrides taste-skill step 0). Checkout, payment webhooks and admin need server routes. Run taste-skill's checks and gate against the dev server URL (`--start http://localhost:3000/`).
3. **Chosen, not dealt** (overrides taste-skill step 4). The random palette and type "deal" can produce options. The final palette, type and layout come from the brand work and are recorded with a reason in `Ref/Design-Rationale.md`.
4. **Owner's photos only at launch** (narrows taste-skill's stand-in photographs). Stand-ins may appear on preview builds. List each one, and replace every one with the owner's own photos before launch.
5. **Not Anthropic's brand.** `brand-guidelines` contains Anthropic's colours and fonts. Use it only as a format reference for writing the florist's own brand guidelines skill.
6. **Danish first.** Customer-facing copy is in Danish. Code, commits and internal docs are in English.
