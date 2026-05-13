# QFlow — UI Kit

A high-fidelity recreation of the QFlow clinic-management web app.

**Surfaces covered**
- App shell (header, tab nav, footer)
- Appointments list + booking form (primary screen)
- Doctors list
- Patients list
- ERD placeholder (full diagram lives in the production app)

**How to run**
Open `index.html` directly. It boots a Babel/React app with seed data — no build step. Click the tabs to switch screens, click "+ קבע תור" to open the booking form, fill it, submit; toasts and list updates are wired up against in-memory state.

**Files**
- `index.html` — the demo shell + seed data
- `primitives.jsx` — `<Button>`, `<Card>`, `<Badge>`, `<Field>`, `<Input>`, `<Select>`, `<LogoMark>`, the `Icons` map, and the `QF` token object
- `Header.jsx` — `<Header>` (3D gradient, pulse mark, KPI badges) and `<Tabs>`
- `Views.jsx` — `<AppointmentsView>`, `<DoctorsView>`, `<PatientsView>`, `<AppointmentForm>`

**Notes**
- Faithful to the original codebase's structure and copy. Visual evolution: Lucide icons replace emoji, gradient header is now 3D radial with a pulse halo on the mark, motion is added on live indicators.
- All copy is Hebrew RTL, dates use `he-IL` locale.
- No real backend — Supabase wiring from the original is omitted.
