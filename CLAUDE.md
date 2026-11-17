# Florist e-commerce

API-driven full-stack webshop for a local Danish florist that today sells only through social media. 6-week project, 10 Nov – 20 Dec 2026.

- Case: [ref/Case Synopsis - Felix.md](ref/Case%20Synopsis%20-%20Felix.md)
- Plan and working rules: [ref/Roadmap.md](ref/Roadmap.md)
- Why we design the way we do: [ref/Design-Rationale.md](ref/Design-Rationale.md)
- Changes are planned in OpenSpec (`openspec/`). Use `/opsx:propose` before larger work.

## Branches

- `DevEnv` is the integration branch. Never commit work directly to it.
- **One branch per piece of work.** Before starting a feature, fix or OpenSpec change, create a branch off the latest `DevEnv`, named after the work: `feature/<slug>`, `fix/<slug>`, `docs/<slug>` (for example `feature/brand-identity`, `feature/cart`). For an OpenSpec change, use the change name as the slug.
- **Felix pushes; Claude does not.** Claude commits locally after every finished task, and never runs `git push`, opens pull requests or merges into `DevEnv`. When there is something worth pushing (a finished task group, before a session ends, or when CI results are needed), Claude says so plainly, naming the branch and the commits waiting. Unpushed work does not count as saved, so Claude reminds Felix rather than letting commits pile up.
- **Merge into `DevEnv` only when the work is finished and working**: tests and checks pass, and it has been verified in the running app where that applies. Felix merges through a pull request into `DevEnv` once CI is green, then deletes the feature branch locally and on the remote.
- **Hand-over:** everything is built under Felix's name. Whenever an account, key, secret or personal detail is added, add a row to [docs/handover.md](docs/handover.md) in the same commit.
- At the start of a session, run `git status` and `git fetch`, and say so if anything is uncommitted, unpushed or behind the remote.
- Never use `git reset --hard`, force-push or delete an unmerged branch without Felix's explicit go-ahead.
- `main` receives release merges only, each from `DevEnv` and tagged (`v0.1`, `v0.2`, …). Never commit to `main` directly.

## App

Two npm workspaces. The frontend never touches the database; everything goes through the backend API. Stack decisions and the reason for every dependency: [docs/decisions.md](docs/decisions.md).

- `frontend/`: Next.js 16 (App Router, TypeScript). This Next.js version differs from older training data: read the guide in `node_modules/next/dist/docs/` before using an API (see `frontend/AGENTS.md`). Server code calls the backend through `src/lib/backend.ts`; browser code calls `/api/*`, which is rewritten to the backend.
- `backend/`: Fastify API (TypeScript, ES modules, so relative imports end in `.js`). Owns the database (Drizzle, migrations in `backend/drizzle/`), business rules, payment and email. Routes are built in `src/build-app.ts` and tested with `app.inject()`.

First run:
```
npm ci
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env.local     # then fill in JOB_SECRET (openssl rand -hex 32)
docker compose up -d                           # Postgres on :5432, Mailpit on :1025 / http://localhost:8025/
npm run db:migrate -w backend
```

| Command (from the root) | Does |
|---|---|
| `npm run dev` / `npm run dev -w backend` | Frontend on http://localhost:3000/ / backend on http://localhost:4000/ |
| `npm run lint` / `npm run typecheck` / `npm test` / `npm run build` | Runs in both workspaces |
| `npm run format` / `npm run format:check` | Prettier for the whole repository |
| `npm run test:e2e` | Playwright on a phone viewport; starts both apps itself |
| `npm run db:generate -w backend` / `npm run db:migrate -w backend` | Create / apply SQL migrations |

CI (`.github/workflows/ci.yml`) runs the dependency audit, lint, format check, typecheck, unit tests and build on every push and pull request. Money is always whole øre (`backend/src/lib/money.ts`). A new environment variable goes in that app's `src/env.ts` and `.env.example`, and gets a row in [docs/handover.md](docs/handover.md).

## Process log (required)

Whenever something is designed or developed, at any stage from sketch to MVP, write a process note in `docs/process/` before the work counts as done. Felix wants to see how the work was thought through, not only the result.

- One file per piece of work: `docs/process/YYYY-MM-DD-<slug>.md`
- Contents: the goal; the inputs used; the options considered, including the ones rejected and why; the decisions, each citing a principle in `ref/Design-Rationale.md` or labelled *opinion*; how the result was checked; open questions
- Link the related OpenSpec change, and link the note from the change's design.md
- Record dead ends and changes of mind honestly. Don't rewrite them afterwards to look planned

## Skill overrides

The design skills in `.claude/skills/` are third-party, so they are never edited (provenance: `.claude/skills/PROVENANCE.md`). Where a skill conflicts with this project, these rules win:

1. **Real business details** (overrides taste-skill house rule 9). Show the shop's real CVR number, full address, real phone number and email as approved by the owner. Danish e-commerce law requires them, and local SEO needs the same name, address and phone everywhere.
2. **Dynamic app, not static export** (overrides taste-skill step 0). Checkout, payment webhooks and admin need server routes. Run taste-skill's checks and gate against the dev server URL (`--start http://localhost:3000/`).
3. **Chosen, not dealt** (overrides taste-skill step 4). The random palette and type "deal" can produce options. The final palette, type and layout come from the brand work and are recorded with a reason in `ref/Design-Rationale.md`.
4. **Owner's photos only at launch** (narrows taste-skill's stand-in photographs). Stand-ins may appear on preview builds. List each one, and replace every one with the owner's own photos before launch.
5. **Not Anthropic's brand.** `brand-guidelines` contains Anthropic's colours and fonts. Use it only as a format reference for writing the florist's own brand guidelines skill.
6. **Danish first.** Customer-facing copy is in Danish. Code, commits and internal docs are in English.

## Skill policy

Standing rule: no skill is added to `.claude/skills/` outside this policy, and an adopted skill is used only for its named job in `.claude/skills/PROVENANCE.md`. Nobody searches for skills before each task.

The four gates run only at a **checkup**, which happens:
- at a phase boundary: design (week 1), build (start of week 2), checkout and payment (start of week 3), hardening (start of week 5);
- when a new kind of task appears that no adopted skill or rule covers;
- when an adopted skill hits its retire-by condition, or keeps producing weak output.

At a checkup, a candidate passes the gates in order and is rejected at the first gate it fails:
1. **Gap:** name the task gap first. If a short CLAUDE.md rule or an existing skill already covers it, stop: no new skill.
2. **Evidence:** real usage reports, Reddit first (r/ClaudeAI, r/ClaudeCode, design subreddits), then a maintained repo with a licence. Reject if the evidence is only popularity, or the repo is abandoned or unlicensed.
3. **Security:** read `SKILL.md`, scripts and hooks. Reject on any risky behaviour that the job does not need.
4. **Trial:** run one small task from the next phase with and without the skill, and compare blind. Reject if the skill is not clearly better, against criteria written down before the run.
5. **Adopt:** pin the commit, add a provenance row with the named job and a retire-by condition.

No forced use: an adopted skill is invoked only when its job comes up.
