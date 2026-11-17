# Hand-over cheat sheet

Everything is built under Felix's name. When the owner takes over, each row below must be moved to her or replaced with her details. **Add a row the moment an account, key or personal detail is added to the project**, not at the end.

Status: *planned* (not created yet) · *in use* (exists, in Felix's name) · *handed over*

## Accounts

| Service | What it is used for | Owner now | What to do at hand-over | Status |
|---|---|---|---|---|
| GitHub | Code repository `fek-design/NIkita-florist-ecom`, CI, scheduled jobs, backups | Felix | Transfer the repository to her GitHub account or an organisation for the shop; re-add repository secrets (they do not transfer) | in use |
| Stripe | Payments (test mode) | Felix | She opens her own Stripe account with the shop's CVR and bank account; replace the Stripe keys and webhook secret in the backend's environment variables | in use (test mode) |
| Vercel | Hosting, frontend and backend projects (Hobby, non-commercial) | Felix | Transfer both projects to her Vercel team and move to a paid plan (Hobby is non-commercial), or move to another host | planned |
| Neon | PostgreSQL database (Free, Frankfurt) | Felix | Transfer the project to her Neon organisation and choose a paid plan if needed; the connection string stays the same | planned |
| Mailbox (SMTP/IMAP) | Order emails out, replies and bounces in | to be chosen | Replace with the shop's own mailbox; update the SMTP and IMAP variables | planned |

## Keys and secrets

Stored only in each service's settings, never in the repository. Every one must be regenerated or replaced under her accounts.

| Variable or secret | Where it is set | Replace with | Status |
|---|---|---|---|
| `DATABASE_URL` | Vercel backend project (per environment), `.env.local` locally | Her Neon project's connection string | planned |
| Backup encryption key (`age`) | Public key as a GitHub secret; private key with Felix offline | A new key pair she keeps | planned |
| `JOB_SECRET` (job trigger secret) | Vercel backend project and GitHub secret; `backend/.env.local` locally | A new random secret (`openssl rand -hex 32`) | planned |

## Personal details in the shop

Details that must show the shop's real information, not Felix's or placeholders (CLAUDE.md override 1).

| Detail | Where it appears | Status |
|---|---|---|
| Shop name, address, CVR, phone, email | Footer, legal pages, structured data, order emails | not added yet |
| Sender name and address on emails | Backend email settings | not added yet |
| Delivery postcodes, cut-off, capacity, prices | Admin settings (placeholders now, see interview note) | not added yet |
