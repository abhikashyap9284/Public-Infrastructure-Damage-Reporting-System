# Verification record

**Date:** 16 October 2026  
**Application:** CivicPulse v1.0  
**Runtime used for checks:** Node.js 24.19.0, npm 11.9.0.

| Check | Result | What was actually verified |
| --- | --- | --- |
| `npm run check` | Pass | Strict TypeScript check across app, API, demo and tests |
| `npm test` | Pass: 18 tests, 0 failures | 17 real-API/PostgreSQL-compatible integration tests plus 1 demo adapter test |
| `npm run build` | Pass | Optimized Next.js 16.4.2 build; static root page and dynamic Node API route |
| `npm run build:demo` | Pass | Bundled static React demonstration with fonts, icons, CSS and lazy-loaded Leaflet |
| `npm audit --omit=dev` | 0 reported vulnerabilities | Registry audit of installed production dependencies at check time |

The API integration suite covers registration, rejecting public admin signup, duplicate email handling, wrong credentials, session hash storage, same-origin enforcement, image signature validation, role-scoped queries, organization approval, assignment, vote idempotence, comments, valid/invalid status changes, ratings, owner-only reopening, historical reopen count, organization approval revocation, account disabling, profile/notifications, password-session invalidation, logout and authentication rate limits.

The demo test checks initialization, six personal versus nine community sample reports, query-string pagination routing, role selection, pending organization approval, profile persistence, logout/login, new organization registration and demo reset.

## Verification boundaries

- The integration database was isolated in-memory PGlite running PostgreSQL-compatible SQL. No personal Neon project was configured or contacted.
- The Vercel-targeted build passed locally. It has not been deployed into the owner’s Vercel account; deployment requires the owner’s Neon connection string and chosen Vercel project.
- The immediate hosted demonstration is static and explicitly labeled. It does not send civic reports to a municipal organization or provide shared server data.
- Browser visual QA and automated end-to-end browser interactions were unavailable in this environment. No screenshots, viewport render review, GPS prompt interaction, real camera upload, assistive-technology audit or deployed latency/load benchmark was performed. Responsive styles and native form/dialog behavior are implemented; follow `DEMO_AND_TESTING.md` for device checks.
- OpenStreetMap tile availability and third-party hosting uptime were not certified. Manual coordinate entry is available when the map/GPS is unavailable.
- A dependency audit is a point-in-time registry check, not a complete security assessment.

The demo build emitted non-blocking Rollup notices about third-party Zod comment annotations; both builds exited successfully. No app compile/type errors remain.
