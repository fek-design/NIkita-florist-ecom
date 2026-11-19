# Hand-over cheat sheet

Everything is built under Felix's name. When the owner takes over, each row below must be moved to her or replaced with her details. **Add a row the moment an account, key or personal detail is added to the project**, not at the end.

Status: *planned* (not created yet) · *in use* (exists, in Felix's name) · *handed over*

## Accounts

| Service | What it is used for | Owner now | What to do at hand-over | Status |
|---|---|---|---|---|
| GitHub | Code repository `fek-design/NIkita-florist-ecom`, CI, scheduled jobs, backups | Felix | Transfer the repository to her GitHub account or an organisation for the shop; re-add repository secrets (they do not transfer) | in use |
| Stripe | Payments (test mode) | Felix | She opens her own Stripe account with the shop's CVR and bank account; replace the Stripe keys and webhook secret in the backend's environment variables | in use (test mode) |
| Vercel | Hosting: projects `nikita-florist-ecom` (backend, root `backend/`) and `nikita-florist-frontend` (root `frontend/`), Hobby, non-commercial | Felix | Transfer both projects to her Vercel team and move to a paid plan (Hobby is non-commercial), or move to another host | in use (17 Nov) |
| Neon | PostgreSQL database `nikita-florist` (Free, Frankfurt), created through Vercel's Neon integration | Felix | Transfer the project to her Neon organisation and choose a paid plan if needed; the connection string stays the same | in use (17 Nov) |
| Mailbox (SMTP/IMAP) | Order emails out, replies and bounces in | to be chosen | Replace with the shop's own mailbox; update the SMTP and IMAP variables | planned |

## Keys and secrets

Stored only in each service's settings, never in the repository. Every one must be regenerated or replaced under her accounts.

| Variable or secret | Where it is set | Replace with | Status |
|---|---|---|---|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `PGHOST`, `PGHOST_UNPOOLED` and related | Set by the Neon integration in the Vercel backend project (all environments); `backend/.env.local` locally | Created again when the Neon project moves to her account | in use (17 Nov) |
| `BACKEND_URL` | Vercel frontend project; `frontend/.env.local` locally | The backend address in her Vercel team (production and staging) | in use (19 Nov), points at the staging backend |
| Backup encryption key (`age`) | Public key as a GitHub secret; private key with Felix offline | A new key pair she keeps | planned |
| `JOB_SECRET` (job trigger secret) | Vercel backend project and GitHub secret; `backend/.env.local` locally | A new random secret (`openssl rand -hex 32`) | in use in Vercel (17 Nov); GitHub secret to come |

## Brand assets

| Asset | Owner now | What to do at hand-over | Status |
|---|---|---|---|
| Logo artwork (`ref/brand/Logo.svg` and its exports) | Felix, made for the shop | Confirm in writing that the shop may use and change it freely | in use |
| Fonts (Ancizar Serif, Inter) | Open licence (SIL OFL 1.1) | Nothing: the licence travels with the files | in use |

## Personal details in the shop

Details that must show the shop's real information, not Felix's or placeholders (CLAUDE.md override 1).

| Detail | Where it appears | Status |
|---|---|---|
| Shop name, address, CVR, phone, email | Footer, legal pages, structured data, order emails | not added yet |
| Sender name and address on emails | Backend email settings | not added yet |
| Delivery postcodes, cut-off, capacity, prices | Admin settings (placeholders now, see interview note) | not added yet |
