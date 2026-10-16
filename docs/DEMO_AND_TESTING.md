# Project evaluation walkthrough

## A short demonstration

1. Open the hosted demonstration. Point out **DEMO WORKSPACE**: fictional data, illustrative proofs and browser-local changes.
2. In Citizen, show recent reports, community support, map and report status filters.
3. Create a report with a photo and a map pin. Point out duplicate suggestions if a nearby matching report exists.
4. Switch to Admin. Open Organizations and approve a pending application. Open the new report and assign an approved organization in the same city.
5. Switch to Organization. Open the assigned queue, publish In progress and then Resolved with meaningful notes.
6. Switch back to Citizen. Open the report, inspect its timeline, submit a repair rating and show how reopening works.
7. Show the community view, Insights, CSV export, notifications, profile settings and logout.

Demo accounts share `Demo@2026!`: `citizen@example.com`, `authority@example.com`, `admin@example.com`. The fixed demo organization is Noida Public Works. The fixed citizen is Abhi Kashyap. These sample identities and data are not inserted into Neon.

## Real deployment acceptance checklist

- [ ] `NEXT_PUBLIC_DEMO_MODE=false`; no demo role switcher visible.
- [ ] `/api/health` returns the database health result.
- [ ] Admin was provisioned with a private, chosen password.
- [ ] Citizen and organization register through the real website and survive sign out/sign in.
- [ ] Pending organization sees no assigned work and cannot update repair status.
- [ ] Admin approval and same-city assignment unlock only that organization’s queue.
- [ ] A citizen cannot reach administrator actions by calling API endpoints directly.
- [ ] Report creation persists photo, coordinates, timeline and notification across browsers.
- [ ] Unsupported images and invalid coordinates are rejected.
- [ ] Progress cannot skip from Assigned directly to Resolved.
- [ ] Resolution requires a note; only the reporter can rate or reopen their report.
- [ ] Support votes are idempotent per account/report.
- [ ] Password changes and disabling revoke active server sessions.
- [ ] Search/filter/sort, CSV, map markers and notification read states work.
- [ ] Test GPS permission denial and manual coordinate entry.
- [ ] Check phone/tablet/desktop layout, keyboard focus and native dialog closing.
- [ ] Inspect error behavior if the database or map network is unavailable.

## Automated checks

```powershell
npm run check
npm test
npm run build
```

Integration tests run the real API service and real SQL against an isolated in-memory PGlite PostgreSQL-compatible database. They exercise registration, login, hashed sessions, CSRF/origin checks, privileged actions, organization approval, assignment, events, notices, vote idempotence, repair transitions, feedback, reopening, access revocation, password changes, logout and rate limits. These checks do not contact the owner’s Neon account, deploy to Vercel, emulate a browser or certify performance/accessibility.

An explicit demo adapter test also checks browser-local persistence, query-string routing, role selection, signup/login and organization review. Demo behavior is intentionally distinct from production security.
