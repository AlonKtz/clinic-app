# QFlow — Clinic Appointment Management System
## Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | QFlow OS v2 — מערכת ניהול תורים לקליניקה |
| **Document status** | Approved · v2.0 |
| **Last updated** | June 2026 |
| **Authors** | Alon Katz |
| **Live deployment** | https://alonktz.github.io/clinic-app/ |
| **Repository** | https://github.com/AlonKtz/clinic-app |

---

## 1. Executive Summary

QFlow is a single-page web application for managing the day-to-day operations of a small medical clinic: registering doctors and patients, scheduling appointments, and monitoring clinic activity in real time. The system replaces paper- and spreadsheet-based scheduling with a centralized, validated, cloud-backed database, while presenting the information through a modern, fully right-to-left (RTL) Hebrew interface.

The product was developed as a full-stack academic project demonstrating end-to-end competency: relational data modeling (ERD in Chen notation), a normalized PostgreSQL schema with referential integrity, a REST data layer, a component-based React frontend, responsive design across device classes, and automated cloud deployment.

---

## 2. Background & Problem Statement

### 2.1 The problem
Small clinics frequently manage appointments using manual methods (notebooks, phone calls, shared spreadsheets). This produces well-known failures:

- **Double-booking** — two patients assigned to the same doctor at overlapping times.
- **Orphaned records** — appointments referencing doctors or patients that no longer exist.
- **Invalid data** — malformed national IDs, phone numbers, and license numbers entered without validation.
- **No operational visibility** — staff cannot answer at a glance: How many appointments today? Who is next? Which doctors are loaded?

### 2.2 The opportunity
A purpose-built, validated, single-source-of-truth scheduling system removes these failure modes at the data layer (constraints, referential integrity) and at the UX layer (guided forms, live dashboards), at near-zero hosting cost (static frontend + managed free-tier database).

---

## 3. Goals & Non-Goals

### 3.1 Goals
| # | Goal | Measure of success |
|---|------|--------------------|
| G1 | Eliminate double-booking | System blocks any booking within 30 minutes of an existing appointment for the same doctor |
| G2 | Guarantee data validity | 100% of persisted records pass format validation (ID, phone, license) |
| G3 | Preserve referential integrity | Zero orphaned appointments; deleting a doctor/patient cascades to their appointments with explicit user confirmation |
| G4 | Provide operational visibility | Dashboard answers "today's load, next patient, doctor utilization" in a single screen with zero clicks |
| G5 | Full Hebrew RTL experience | Every screen renders correctly in RTL; dates/times localized to he-IL |
| G6 | Run on any device | Usable layouts from 360px phones to 4K displays |

### 3.2 Non-Goals (explicitly out of scope for v2)
- Patient self-service booking portal (staff-operated system only)
- Authentication / role-based access control (single trusted-operator model)
- Payment processing, billing, or insurance integration
- Medical records (EMR/EHR) — the system stores scheduling data only
- Notifications (SMS/email reminders)
- Multi-clinic / multi-tenant support

---

## 4. Users & Personas

### P1 — Clinic Receptionist (primary)
- **Context:** Front desk, interruptions constant, works on a desktop with occasional phone use.
- **Needs:** Book/cancel appointments fast; find a patient by name, ID, or phone; see immediately whether a requested slot conflicts.
- **Pain tolerated today:** Flipping through a paper diary; calling colleagues to check availability.

### P2 — Clinic Manager (secondary)
- **Context:** Oversees operations; checks load and staffing several times a day.
- **Needs:** At-a-glance KPIs (appointments today, total patients, doctors on duty); weekly/monthly load views; confidence that data is consistent.

### P3 — Course Evaluator / Technical Reviewer (tertiary)
- **Context:** Assesses the project's engineering quality.
- **Needs:** Visible data model (ERD), visible system architecture, demonstrable validation and integrity behavior, clean codebase.

---

## 5. Scope & Feature Overview

| Module | Description |
|--------|-------------|
| **Dashboard (לוח בקרה)** | Live operational overview: KPI counters, capacity bar, on-duty doctor roster, appointment timeline (stream) filterable by Today / Week / Month, "Next Up" card with countdown |
| **Appointments (תורים)** | List, search, filter by doctor; create via modal form with full validation and conflict guard; delete with confirmation; past appointments auto-collapse into an archive section |
| **Doctors (רופאים)** | Roster with per-doctor appointment counts; add with license validation and uniqueness check; delete with cascade warning showing exact appointment count |
| **Patients (מטופלים)** | Registry with per-patient appointment counts; add with Israeli ID and phone validation; delete with cascade warning |
| **ERD (תרשים ישויות)** | Interactive Chen-notation entity-relationship diagram of the data model, themed to the design system |
| **System (מערכת)** | Animated architecture diagram showing live data-flow between Browser → React app → PostgREST API → PostgreSQL, plus Realtime engine and GitHub Pages hosting |
| **Vitals (מצב מצגת)** | Full-screen presentation mode (keyboard shortcut `V`): animated headline counters, live clock, next-appointment ticker, ECG animation — designed for projector/demo use |

---

## 6. Functional Requirements

Requirements use MoSCoW priority: **M**ust / **S**hould / **C**ould.

### 6.1 Doctor management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-D1 | The system shall create a doctor with a **license number** (digits only, unique) and **full name** (min. 2 characters) | M |
| FR-D2 | The system shall reject a duplicate license number with the message "מספר רישיון כבר קיים" | M |
| FR-D3 | The system shall list doctors alphabetically (Hebrew collation) with each doctor's current appointment count | M |
| FR-D4 | Deleting a doctor shall require confirmation that states the number of dependent appointments, then delete the doctor **and** all of their appointments atomically from the user's perspective | M |
| FR-D5 | The doctor list shall be searchable by name or license number | S |

### 6.2 Patient management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-P1 | The system shall create a patient with **national ID** (exactly 9 digits, unique), **full name**, and **phone number** (Israeli format: `0` followed by 8–9 digits; separators tolerated) | M |
| FR-P2 | The system shall reject a duplicate ID with the message "ת.ז. כבר קיימת" | M |
| FR-P3 | The ID input shall accept digits only (non-digits stripped on input) and cap at 9 characters | M |
| FR-P4 | Deleting a patient shall behave symmetrically to FR-D4 (cascade with counted confirmation) | M |
| FR-P5 | The patient list shall be searchable by name, ID, or phone | S |

### 6.3 Appointment management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-A1 | An appointment shall reference an existing doctor and an existing patient (selected from dropdowns — free-text references are impossible by construction) | M |
| FR-A2 | An appointment shall have a **date-time** (no earlier than the current minute) and a **visit reason** chosen from a fixed list (בדיקה שגרתית, מעקב טיפול, כאבים/תלונות, בדיקות דם, המשך טיפול, ייעוץ, אחר) | M |
| FR-A3 | Choosing reason "אחר" shall require a free-text elaboration | M |
| FR-A4 | **Conflict guard:** the system shall reject a booking if the selected doctor already has an appointment within ±30 minutes of the requested time, and the error shall name the doctor and the conflicting time | M |
| FR-A5 | The appointment list shall split into **upcoming** (ascending, soonest first) and a collapsible **archive** of past appointments (descending, most recent first) with a count badge | M |
| FR-A6 | Appointments shall be filterable by doctor and searchable by patient name, doctor name, or reason | S |
| FR-A7 | Each appointment row shall display: patient initials avatar, patient name, localized date-time, doctor, reason, appointment number, and a SCHEDULED / COMPLETE status chip | S |

### 6.4 Dashboard
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-B1 | KPI counters (total appointments, doctors, patients, average wait) shall animate from zero on load and reflect live database values | M |
| FR-B2 | The appointment **stream** shall show a timeline of appointments with status nodes (done / next / waiting), filterable by TODAY / WEEK (current Mon–Sun) / MONTH (current calendar month), with time labels appropriate to the granularity | M |
| FR-B3 | The **Next Up** card shall show the next future appointment's patient, doctor, reason, and time; an explicit empty state shall render when none exists | M |
| FR-B4 | The on-duty roster shall list all doctors with initials avatars; horizontally scrollable on overflow | S |

### 6.5 Visualization & presentation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-V1 | The ERD view shall render the data model in Chen notation: strong/weak entities, identifying relationships (double diamond), attributes with underlined primary keys, and (min,max) cardinality labels | M |
| FR-V2 | The System view shall render an animated architecture graph with directional particle flows between components, readable labels (never rotated), scaling to fill the viewport on any screen | S |
| FR-V3 | Pressing `V` (outside form fields) shall toggle a full-screen Vitals presentation: four animated counters (patients / appointments / doctors / today), live clock, next-appointment ticker, ECG line; dismissed by any key or click | C |

### 6.6 Error handling & feedback
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-E1 | Every create/delete action shall produce a toast notification (success or error) in Hebrew | M |
| FR-E2 | Destructive actions shall use a styled in-app confirmation dialog (never the browser-native `confirm`) | M |
| FR-E3 | Database connectivity failure shall render a dedicated error screen with a retry action — never a blank page | M |
| FR-E4 | Form fields shall show inline, per-field Hebrew error messages on failed validation, clearing as the user corrects input | M |

---

## 7. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-1 | **Performance** | First contentful paint < 2s on a standard connection; production JS bundle ≤ 250 kB (gzip ≤ 70 kB); all decorative animation runs on the GPU compositor (CSS transforms/SMIL), never blocking interaction |
| NFR-2 | **Responsiveness** | Three breakpoint classes: mobile ≤ 640px (bottom tab bar, single-column, sheet-style modals), tablet 641–900px, desktop > 900px (right rail navigation); System view additionally scales to full width on large displays |
| NFR-3 | **Localization** | UI in Hebrew with `dir="rtl"` document root; dates/times via `Intl` with `he-IL` locale; LTR enforced locally only where semantically required (numbers, diagrams) |
| NFR-4 | **Accessibility** | Visible `:focus-visible` indicators; form controls render in dark color-scheme (no white-on-white native controls); touch targets ≥ 44px on mobile; safe-area insets respected on notched devices |
| NFR-5 | **Consistency** | All colors, typography, radii, and motion derive from a single design-token sheet (QFlow OS v2: dark aurora palette, Space Grotesk / Heebo / JetBrains Mono) |
| NFR-6 | **Reliability** | UI state updates optimistically only after the API confirms; failed requests roll back to toast errors; the app is a static artifact — availability equals GitHub Pages + Supabase SLAs |
| NFR-7 | **Security** | Database access through Supabase anon key restricted by PostgREST grants; no secrets in the repository (environment variables via `.env`, gitignored); HTTPS end-to-end |
| NFR-8 | **Maintainability** | One component file per view; shared primitives (Modal, Field, Search, toasts, confirm) centralized; data access isolated in a single `db.js` module with snake_case↔camelCase mappers |
| NFR-9 | **Deployability** | `git push` to `main` triggers automated build and deployment to GitHub Pages; reproducible demo data via a seed script (`node scripts/seed.mjs`) |

---

## 8. Data Model

### 8.1 Entities

**רופא (Doctor)** — strong entity
| Attribute | Type | Constraints |
|-----------|------|-------------|
| מספר רישיון `license_number` | text | **PK**, digits only |
| שם רופא `doctor_name` | text | NOT NULL, length ≥ 2 |

**מטופל (Patient)** — strong entity
| Attribute | Type | Constraints |
|-----------|------|-------------|
| מספר ת.ז. `id_number` | text | **PK**, exactly 9 digits |
| שם מטופל `patient_name` | text | NOT NULL |
| מספר טלפון `phone_number` | text | NOT NULL, Israeli format |

**תור (Appointment)** — weak entity (existence-dependent on both Doctor and Patient)
| Attribute | Type | Constraints |
|-----------|------|-------------|
| מספר תור `id` | serial | **PK** (surrogate) |
| תאריך ושעה `date_time` | timestamptz | NOT NULL, future-dated at creation |
| סיבת ביקור `reason` | text | NOT NULL, from fixed list or free text via "אחר" |
| `doctor_license` | text | **FK → clinic_doctors**, NOT NULL |
| `patient_id` | text | **FK → clinic_patients**, NOT NULL |

### 8.2 Relationships
| Relationship | Entities | Cardinality | Type |
|--------------|----------|-------------|------|
| **מזמין** (books) | Patient — Appointment | Patient (0,N) — Appointment (1,1) | Identifying |
| **מקבל** (receives) | Doctor — Appointment | Doctor (0,N) — Appointment (1,1) | Identifying |

Both relationships are *identifying* (rendered as double diamonds in the ERD) because an appointment cannot exist without both its doctor and its patient.

### 8.3 Modeling decision of note
A **חניה (parking)** attribute was deliberately excluded from the Doctor entity during analysis: parking is an organizational resource of the clinic as a whole, not a property of an individual doctor. This exclusion is documented in the ERD view itself.

### 8.4 Integrity strategy
- Foreign keys enforced in PostgreSQL.
- Application-level cascade: deleting a doctor/patient first deletes dependent appointments via a filtered DELETE, then the parent row — surfaced to the user as a single confirmed operation with an exact count (FR-D4/FR-P4).
- Uniqueness enforced both in the database (PK) and pre-validated in forms for instant feedback.

---

## 9. System Architecture

```
┌──────────────┐     HTTPS      ┌─────────────────┐    REST/JSON   ┌──────────────────┐
│   Browser    │ ─────────────▶ │  QFlow React SPA │ ─────────────▶ │  PostgREST API    │
│ (any device) │                │  (Vite build)    │ ◀───────────── │  (Supabase)       │
└──────────────┘                └─────────────────┘                └────────┬─────────┘
        ▲                              ▲                                    │ SQL
        │         static assets        │                                    ▼
        │                       ┌──────┴────────┐                  ┌──────────────────┐
        └───────────────────────│ GitHub Pages  │                  │   PostgreSQL      │
                                │ (CDN, CI/CD)  │                  │ 3 tables + RLS    │
                                └───────────────┘                  └──────────────────┘
```

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 + Vite 5 | Component model fits the five-view structure; Vite gives sub-second HMR and small production bundles |
| Styling | Hand-rolled CSS design tokens (no framework) | Full control of the RTL dark-aurora design system; zero runtime CSS-in-JS cost |
| Data API | Supabase PostgREST | Auto-generated REST over PostgreSQL eliminates a custom backend while keeping SQL-grade integrity |
| Database | PostgreSQL (Supabase managed) | Relational integrity (FKs, uniqueness) is a core requirement |
| Hosting | GitHub Pages | Free, CDN-backed, deploys on push to `main` |

**Data-layer contract:** all access flows through `src/utils/db.js`, which owns the REST calls, error normalization (`Supabase error <status>: <body>`), and bidirectional field-name mapping (DB `snake_case` ↔ app `camelCase`). No component talks to the network directly.

---

## 10. UX / UI Requirements

- **Design language:** "QFlow OS v2" — near-black background (`#06080F`), glass-morphism surface cards, four-color accent system (red `#FF2D55` primary, teal, purple, amber), animated aurora backdrop, scrolling ECG motif reinforcing the medical domain.
- **Typography:** Space Grotesk (Latin display), Heebo (Hebrew), JetBrains Mono (data/labels) — loaded via Google Fonts with preconnect.
- **Navigation:** fixed right-rail icon nav on desktop (RTL-natural), bottom tab bar on mobile; active state in brand red with glow; Hebrew tooltip labels.
- **Motion:** staggered reveal-up entrances; kinetic number counters; status pulse dots; all interruptible and GPU-composited. Motion conveys *liveness*, never blocks task completion.
- **Empty/edge states:** every list has a designed empty state; "next up" has an explicit no-appointments state; DB failure has a branded error screen.

---

## 11. Key User Stories & Acceptance Criteria

**US-1 — Book an appointment**
> As a receptionist, I book an appointment for an existing patient with a specific doctor.

✓ Given doctors and patients exist, when I open "קבע תור חדש", select doctor, patient, a future date-time and a reason, then save — the appointment appears in the upcoming list sorted by time, and a success toast shows.
✓ If the doctor has another appointment within 30 minutes of the chosen time, saving is blocked and the error names the doctor and conflicting time.
✓ If I pick "אחר" as reason and leave the elaboration empty, the form blocks with "נא פרט".

**US-2 — Register a patient safely**
> As a receptionist, I register a new patient under time pressure without creating bad data.

✓ An ID shorter than 9 digits, or already registered, blocks submission with a specific Hebrew message on the ID field.
✓ Letters typed into the ID field never appear.
✓ A phone like `050-123-4567` is accepted (separators tolerated); `123` is rejected.

**US-3 — Remove a doctor who left**
> As a manager, I remove a departing doctor and understand the consequences.

✓ The confirmation dialog states the doctor's name and the exact number of appointments that will also be deleted.
✓ After confirming, neither the doctor nor any of their appointments appear anywhere in the app.
✓ Cancelling leaves all data untouched.

**US-4 — Morning overview**
> As a manager, I open the app and within five seconds know today's load and who is next.

✓ The dashboard is the landing view; counters animate to current values; the stream defaults to TODAY; the Next Up card shows the next patient with a countdown.

**US-5 — Present the system**
> As the project author, I present the product on a projector.

✓ Pressing `V` opens a full-screen stats scene with live clock and next-appointment ticker; any key returns to the app.
✓ The ERD and System tabs visually explain the data model and architecture without leaving the app.

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Supabase free-tier pause on inactivity | Medium | Demo fails to load | Seed script restores data in seconds; error screen with retry; pre-demo warm-up checklist |
| Anon key exposed in client bundle | Certain (by design) | Data tampering | Acceptable for coursework scope; documented path to RLS policies + auth for production |
| Race between two operators double-booking | Low (single operator) | Duplicate slot | Client-side 30-min guard now; documented path to DB-level exclusion constraint |
| RTL/LTR rendering regressions | Medium | Visual breakage | Explicit `direction` overrides at component boundaries (diagrams LTR, app RTL); manual matrix testing on mobile + desktop |
| GitHub Pages base-path (`/clinic-app/`) breaking asset URLs | Low | Blank deploy | `base` pinned in `vite.config`; deployment verified after each push |

---

## 13. Release & Validation

- **Environments:** local dev (`npm run dev`), production (GitHub Pages on push to `main`).
- **Demo data:** `node scripts/seed.mjs` resets the database to a realistic state — 6 doctors, 34 patients, ~238 appointments distributed from 45 days past to 90 days ahead (including same-day entries so the dashboard is alive).
- **Validation performed:** production build per change; manual functional pass of all CRUD flows, validation rules, conflict guard, and cascade deletes; live-preview DOM verification of interactive features; on-device testing (Windows desktop, iPhone Safari) for both breakpoint classes.

---

## 14. Future Work (Roadmap candidates)

1. **Authentication & RLS** — Supabase Auth with role-based policies (receptionist vs. manager), removing the trusted-operator assumption.
2. **Realtime sync** — subscribe to PostgreSQL change feeds so multiple open clients converge without refresh (the architecture already reserves this path).
3. **DB-level booking constraint** — PostgreSQL exclusion constraint on (doctor, time-range) making double-booking impossible regardless of client.
4. **Patient reminders** — scheduled SMS/email before appointments.
5. **Editable appointments** — reschedule in place rather than delete-and-recreate.
6. **Reporting** — utilization per doctor, no-show tracking, exportable monthly summaries.

---

## Appendix A — Glossary

| Term | Meaning |
|------|---------|
| **Chen notation** | ERD style using rectangles (entities), diamonds (relationships), ellipses (attributes); double borders denote weak entities / identifying relationships |
| **Weak entity** | Entity whose existence depends on related strong entities — here, an appointment |
| **Identifying relationship** | Relationship through which a weak entity gains existence; double diamond |
| **(min,max) cardinality** | Participation notation: e.g., Patient (0,N) — a patient may have zero or many appointments |
| **PostgREST** | Service exposing a PostgreSQL schema as a REST API; used via Supabase |
| **RTL** | Right-to-left document direction, required for Hebrew |
| **Aurora UI** | The product's visual language: drifting color blobs over a near-black field |

## Appendix B — Fixed Visit-Reason List

בדיקה שגרתית · מעקב טיפול · כאבים / תלונות · בדיקות דם · המשך טיפול · ייעוץ · אחר (with required elaboration)
