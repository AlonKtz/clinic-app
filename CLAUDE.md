# QFlow — Clinic Appointment Management System

## Project Overview
A React + Vite web app for managing clinic appointments, doctors, and patients.
Built with Supabase as the backend database. Deployed on GitHub Pages.

## Tech Stack
- **Frontend**: React 18 + Vite, inline styles (no CSS framework)
- **Database**: Supabase (project ID: `pvqucrpxfupqefhvcohc`)
- **Deployment**: GitHub Pages via `peaceiris/actions-gh-pages@v3`
- **Repo**: `https://github.com/AlonKtz/clinic-app`
- **Live URL**: `https://alonktz.github.io/clinic-app/`

## Key Files
- `src/ClinicApp.jsx` — main app shell (tabs, header, data fetching)
- `src/utils/db.js` — Supabase REST API client (all CRUD operations)
- `src/clinic/DoctorsView.jsx` — doctors tab
- `src/clinic/PatientsView.jsx` — patients tab
- `src/clinic/AppointmentsView.jsx` — appointments tab
- `src/clinic/ERDView.jsx` — interactive ERD diagram (Chen notation)
- `src/clinic/styles.js` — shared color palette (Kupat Holim Clalit red theme)
- `.github/workflows/deploy.yml` — CI/CD pipeline (auto-deploy on push to main)
- `clinic-db-setup.sql` — Supabase schema (already applied)

## Database Schema
```
clinic_doctors      (license_number PK, doctor_name, created_at)
clinic_patients     (id_number PK, patient_name, phone_number, created_at)
clinic_appointments (id PK, date_time, reason, doctor_license FK, patient_id FK, created_at)
```
RLS enabled with allow-all policies (demo/academic project).

## Local Dev
```bash
npm install
npm run dev   # runs on http://localhost:5173
```
Env vars needed in `.env`:
```
VITE_SUPABASE_URL=https://pvqucrpxfupqefhvcohc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Design System
The canonical design system lives in `design-system/`. When designing new UI:
- Read `design-system/SKILL.md` for the short rules
- Use tokens from `design-system/colors_and_type.css` (CSS custom properties `--qf-*`)
- Reference components in `design-system/ui_kits/qflow/`
- Follow the iconography rule: Lucide icons, NOT emoji (emoji only in toasts)

## Important Notes
- **Do NOT touch** `C:\TimeManagmentApp` — that is a completely separate project
- Base path is `/clinic-app/` (set in `vite.config.js`)
- UI is Hebrew RTL (`direction: rtl`)
- Credits: "By Alon & Afik"
