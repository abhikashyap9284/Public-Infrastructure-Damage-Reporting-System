# Product requirements — Public Infrastructure Damage Reporting System

**Product:** CivicPulse · **Version:** 1.0 · **Date:** 16 October 2026  
**Project owner:** Abhi · **Context:** student/portfolio implementation of the supplied infrastructure reporting brief.

## Problem Statement

Residents encounter potholes, broken lights, water leaks, damaged footpaths, open drains and overflowing waste points. Phone calls and office visits often produce incomplete evidence and no accessible record of progress. This creates delays, repeated complaints, safety hazards and weak accountability. CivicPulse provides a consistent report-to-repair record with location, evidence, ownership and visible updates.

The supplied document contained unrelated women-entrepreneur and home-business requirements. Those requirements do not belong to this product and have been replaced with citizen, authority-organization and administrator workflows.

## Primary Objectives

1. Let a citizen submit a useful report with a description, supported image and explicit location.
2. Give every report a unique tracking reference, category, priority and visible state.
3. Connect approved local organizations with assigned repair work.
4. Give citizens access to progress, comments, resolution and feedback.

## Secondary Objectives

- Encourage community participation through nearby-report discovery and support votes.
- Reduce duplicate reporting with suggestions for the same category within 200 metres.
- Surface workload, overdue response targets, resolution time and satisfaction.
- Help administrators maintain a verified repair network and account access.

## Scope of the Product

| In phase 1 | Outside phase 1 |
| --- | --- |
| Responsive web app; browser camera/file upload | Native Android/iOS application |
| Citizen, organization and admin accounts | Government identity verification or municipal API integration |
| Geo-associated photo reports; manual map pin or browser GPS | Trusted GPS/EXIF attestation or AI damage detection |
| Assignment, status transitions, discussion and repair feedback | Contractor payments, billing or procurement |
| Public-safe community metadata and authenticated report details | Automated emergency dispatch |
| Map, search, filters, analytics, CSV, in-app notifications | Email, SMS, push campaigns or bulk public alerts |

## Functional Requirements

### Citizen / client

- Register with name, email, strong password and city; sign in and sign out.
- Submit one category, title, description, address, city, latitude, longitude, priority and photo.
- Confirm the pin explicitly. GPS denial must leave manual map/coordinate entry available.
- Browse personal reports, filter/sort/search them, and open the full timeline.
- Browse neighborhood reports, inspect the map and support existing issues without duplicate votes.
- Add useful comments; receive in-app notices for received reports, assignment and updates.
- Rate own resolved report from 1–5; reopen own resolved report within 7 days with explanation.
- Edit own name/city and change password, revoking all prior sessions.

### Authority / organization

- Register an organization name and city; remain pending until administrator approval.
- See only assigned work in the work queue when approved.
- Publish a progress note when moving a report to In progress, Resolved, Rejected or an allowed subsequent state.
- Read the evidence, location, response target and discussion for assigned reports.
- Review team metrics, export assigned-report CSV, and manage its account.
- Losing approval immediately prevents work-queue access and repair mutations on subsequent requests.

### Administrator

- Authenticate using a separately provisioned administrator account; public signup cannot create administrators.
- Approve or reject organization applications; revoke approval where needed.
- View all reports, choose an approved same-city organization and set the report priority.
- Manage progress directly if necessary, with the same auditable timeline.
- View accounts; disable/enable non-admin accounts. Disabling deletes all existing sessions.
- Inspect resolution, response-target and satisfaction metrics; download report CSV.
- Preserve administrative audit records for organization approval and account access changes.

### Common

All roles have distinct navigation and workspace data. Every mutation is checked on the server. Report discussions and image proofs are visible to signed-in residents; reporter email is not exposed in the community feed. Public community metadata has no reporter identity or image bytes.

## Non-Functional Requirements

| Area | Requirement / implementation | Acceptance approach |
| --- | --- | --- |
| Usability | Clear wizard, readable status labels, empty states and actionable error messages | Manual walkthrough on desktop and phone |
| Performance | Target ordinary actions near 2 seconds under normal deployment conditions; upload/network time varies | Measure deployed latency; target is not claimed as benchmarked |
| Scalability | Serverless HTTP database access, indexed lookups, 100-record API pages, no photos in list payloads | Load testing before city-scale traffic |
| Security | bcrypt, revocable random sessions, server role checks, same-origin JSON writes, rate limits and parameterized SQL | Integration tests for authorization and sessions |
| Availability | Deployment designed for managed hosting; actual uptime depends on selected plans | Monitor the deployed service; no uptime guarantee from the source code |
| Responsiveness | Desktop sidebar; mobile drawer; adaptive grids and stacked forms | Device/browser QA before external launch |
| Reliability | Transactions for report/event/notice writes and compare-and-set status updates | Database-backed integration tests |
| Maintainability | Shared types/rules; separated UI, API, database, scripts and docs | TypeScript check and documented API |
| Privacy | No email on public report feed; authenticated proof access; client recompression removes original EXIF metadata | Review API output and deployment data policy |
| Accessibility | Native dialogs with focus handling, semantic form labels, focus states, keyboard controls and reduced-motion CSS | Assistive-technology audit before claiming WCAG conformance |

## Technology Stack (Suggested → selected)

Selected implementation uses Next.js App Router, React, TypeScript and custom CSS, with Node.js REST endpoints, Neon PostgreSQL and Vercel hosting. Next.js route handlers replace a separate Express server to simplify Vercel deployment. Leaflet/OpenStreetMap provides the interactive map. A separate static demonstration uses the same React components and a browser-local data adapter.

## User Flow (High-Level)

1. Citizen creates an account and signs in.
2. Citizen submits issue details, photo and confirmed location.
3. Administrator reviews and assigns the issue to an approved organization in that city.
4. Organization opens its assigned queue, adds progress and completes the repair.
5. Citizen sees notifications, checks the timeline and rates the repair or reopens within 7 days.

## Data Requirements

| Entity | Core data |
| --- | --- |
| User | ID, name, normalized unique email, password hash, role, city, active flag, optional organization |
| Organization | ID, name, city served, application email, approval status, created time |
| Report | UUID, display number, category, title, description, address/city, coordinates, photo, priority, state, reporter, organization, creation/update/resolution/target times, rating, reopen count |
| Timeline event | Report, actor, event kind, note, timestamp |
| Community support | Unique user/report pair and timestamp |
| Notification | Recipient, title, body, optional report, read flag and timestamp |
| Operational records | Hashed session tokens/expiry, rate-limit counters, administrative audit events, schema version |

## Key Performance Indicators (KPIs)

| KPI | Definition | UI |
| --- | --- | --- |
| Average resolution time | Mean of `resolved_at - created_at` for reports currently resolved | Insights, rounded hours |
| Number of issues resolved | Count with current state Resolved | Overview and Insights |
| Citizen satisfaction | Mean of submitted 1–5 repair ratings on resolved reports | Insights; dash when no feedback exists |
| Repeated/reopened issue rate | Reports with `reopen_count > 0` divided by all scoped reports | Insights, percentage |
| Resolution rate | Currently resolved divided by all scoped reports | Insights, percentage |
| Overdue response targets | Active reports whose due time has passed | Insights |

Citizen metrics cover own reports; organization metrics cover assigned work; administrator metrics cover the full loaded report set. The overview community impact card explicitly uses community totals. “Repeated” is operationalized as reopening; the app does not claim to detect every newly submitted repeat report at a location.

## Assumptions & Constraints

Assumptions: users have internet/browser access; a moderator is available to review organization applications; organizations can maintain accurate city details and manually publish repair updates; report location is confirmed honestly by the submitter. The selected region is initially limited and this is not a government emergency service.

Constraints: no supplied Neon or Vercel credentials; setup is completed by the owner. GPS can be denied, map tiles depend on a third party, and actual repair work depends on external teams. Budget hosting and cold starts affect latency. Each report has one proof image capped at 800 KB after processing. Phase 1 stores proofs in PostgreSQL; object storage is the next scaling step. Email ownership verification and password recovery are not implemented; choose an identity provider or add verified email delivery before broad public onboarding.

## Deliverables

- Functional Next.js web application and REST API.
- Distinct citizen, authority organization and administrator workspaces.
- Neon schema, migration and administrator bootstrap scripts.
- Vercel configuration and Windows deployment walkthrough.
- PRD, technical documentation, evaluation script and verification record.
- Clearly labeled static demo using fictional, browser-local data.

## Expected Impact

The product is intended to improve repair visibility, shorten coordination delays, increase citizen participation and make ownership of reported hazards clearer. These are expected outcomes, not measured municipal results or promises of repair service.

## Future Enhancements

Native mobile app; verified email and account recovery; configurable organization service areas and categories; photo object storage/direct uploads; automated email/SMS/push notifications; public density heatmaps; assisted issue categorization; duplicate clustering and geospatial indexes; field-worker subaccounts; richer moderation; multilingual content; external municipal integrations; monitoring, load testing, retention/deletion policies and independent security/accessibility review.
