# CivicPulse

**Public Infrastructure Damage Reporting System** — a complete citizen reporting and authority repair workflow, with separate citizen, organization, and administrator workspaces.

Built for Abhi’s project brief. The unrelated home-business requirements in the original brief have been corrected to infrastructure reporting. This is an independent student/portfolio project; it does not claim affiliation with a government department, Unified Mentor, or Noonlight.

## Start here

Read **[START_HERE_HINDI.md](START_HERE_HINDI.md)** for Windows commands, Neon setup, administrator creation, and Vercel deployment.

```powershell
npm ci
Copy-Item .env.example .env.local
# Edit .env.local and add your own Neon connection string.
npm run db:migrate
# Configure ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD first.
npm run admin:create
npm run dev
```

Open http://localhost:3000. Production starts with a clean database. Register your own citizen and organization accounts; there are **no default production passwords**.

## What works

| Citizen | Organization | Administrator |
| --- | --- | --- |
| Register, sign in, sign out | Apply with organization and city | Sign in using the locally provisioned account |
| Submit category, description, photo and map pin | Await administrator approval | Review and approve/reject organizations |
| Track reports and repair timelines | See only assigned reports in work queue | See every report and assign approved local teams |
| Support nearby reports and add comments | Publish progress and resolution notes | Set priority and response targets through assignment |
| Rate completed repairs and reopen within 7 days | View team metrics and export CSV | Disable non-admin accounts and revoke sessions |
| View neighborhood map, community reports and updates | Manage profile, password and updates | View metrics, CSV exports and account details |

All roles have server authorization checks. Hiding navigation is not the authorization boundary.

Additional features include duplicate suggestions within 200 metres, live OpenStreetMap markers, search, status/category filters, sorting, pagination, in-app notifications, password changes, CSV formula protection, persistent login rate limits, administrative audit records, and a responsive keyboard-accessible interface.

## Stack

- Next.js **16.4.2**, React **19.3.1**, TypeScript, custom responsive CSS, Lucide icons.
- Neon PostgreSQL with `@neondatabase/serverless` over HTTP.
- Parameterized SQL and transactional changes; versioned initial schema.
- bcrypt password hashing and random, revocable database sessions.
- Leaflet/OpenStreetMap; no paid map key needed for ordinary project evaluation.
- Self-hosted DM Sans and Manrope fonts.
- Vercel Node.js Functions; the normal `npm run build` builds the real application.

## Real application versus demonstration

| Build | Command | Data / authentication |
| --- | --- | --- |
| Vercel / real Next.js app | `npm run build` then `npm start` | Neon, real passwords, server sessions, server role checks. `NEXT_PUBLIC_DEMO_MODE=false`. |
| Standalone demo | `npm run build:demo` | Static `dist/`; fictional sample data in browser local storage, a visible demo banner, and role switcher. No real civic submission. |
| Optional local Next.js demo | Set `NEXT_PUBLIC_DEMO_MODE=true`, then `npm run dev` | Same demonstration behavior; do not use for public real-data operation. |

Static demo accounts: `citizen@example.com`, `authority@example.com`, `admin@example.com`; password **`Demo@2026!`**. These accounts do not exist in the production database. Sample proofs are labeled vector illustrations. Use invented details when registering in the demo.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js development |
| `npm run check` | Strict TypeScript check |
| `npm test` | Real PostgreSQL-compatible API integration tests using isolated PGlite; no Neon credential required |
| `npm run build` | Production Next.js build |
| `npm start` | Serve a production build locally |
| `npm run build:demo` | Compile the standalone static demonstration |
| `npm run db:migrate` | Apply the initial schema to your Neon database, retaining existing records |
| `npm run admin:create` | Provision an administrator with credentials you choose |
| `npm run db:cleanup` | Remove expired sessions and expired rate-limit buckets |

## Documentation

- [Windows + Neon + Vercel walkthrough](START_HERE_HINDI.md)
- [PRD: scope, requirements, KPIs and constraints](docs/PRODUCT_REQUIREMENTS.md)
- [Architecture, database, permissions and API contract](docs/TECHNICAL_DOCUMENTATION.md)
- [Demonstration and project evaluation checklist](docs/DEMO_AND_TESTING.md)
- [Validation results and known limits](docs/VERIFICATION.md)

## Operating boundaries

The project is ready for your own deployment configuration. No personal Neon database or Vercel account has been connected by this package. Map tiles require internet access. Notifications are in-app, without email/SMS delivery. Photos are compressed to JPEG on the client and limited to 800 KB after decoding on the server; phase 1 stores them in PostgreSQL for straightforward Neon-only setup. Use object storage before large-scale public operation. See technical documentation for pagination, verification, recovery and operational limits.

Official references: [Neon with Next.js](https://neon.com/docs/guides/nextjs), [Neon HTTP driver](https://neon.com/docs/serverless/serverless-driver), [Vercel Next.js hosting](https://vercel.com/docs/frameworks/full-stack/nextjs), [Vercel environment variables](https://vercel.com/docs/environment-variables).
