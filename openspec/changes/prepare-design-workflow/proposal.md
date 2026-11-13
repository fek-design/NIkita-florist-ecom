# Proposal

## Why

The design phase starts next with the logo refresh and the brand system, and the AI does most of the hands-on work. Two things must be in place first:
- **A branch model.** Work in progress must not land on the release branch.
- **A deliberate skill set.** The first import took skills because they were named, not because a task needed them. Felix's rule: don't build blind when a proven skill would make the result stronger, but don't use skills by reflex or keep weak ones either. Reddit is his main source for what actually works.

## What Changes

- Create a `dev` branch from `main` and make it the working branch. `main` receives only release merges. The rule goes into CLAUDE.md
- Add a written skill policy to CLAUDE.md. It is a **standing policy that is always respected but run only as periodic checkups**: at phase boundaries, or when a new kind of task appears. It is not a ritual before every task:
  - **Need-first:** name the task gap before searching.
  - **Evidence:** real usage reports, Reddit first.
  - **Trial:** the skill must beat a no-skill baseline on a small sample task.
  - **Retire:** remove skills that don't earn their place.
- Run the first checkup, for the design phase:
  - list the gaps (vector logo and icon drawing, brand system, typography, UI design, accessibility);
  - research candidates on Reddit and check them on GitHub;
  - security-review and trial the shortlist;
  - adopt or reject each one with a reason.
- Re-audit the four already imported skill sources against the same policy
- Record the pass in a process note and update `.claude/skills/PROVENANCE.md`

## Capabilities

### New Capabilities

None. This is development workflow and tooling, with no change to the webshop's behaviour, so `.openspec.yaml` sets `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- Git: new `dev` branch, pushed to `origin`. `main` stays at "Initial pre-setup" until the first release merge
- `CLAUDE.md`: new "Branches" and "Skill policy" sections
- `.claude/skills/`: skills may be added or removed, and `PROVENANCE.md` is updated
- `docs/process/2026-11-10-skill-curation.md`: the curation record
- `establish-brand-identity` starts only after this change's curation pass, so it can use the adopted skills
