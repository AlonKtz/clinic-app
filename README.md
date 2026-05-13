# QFlow — Clinic Appointment Management System

A React + Vite web app for managing clinic appointments, doctors, and patients.
Built with Supabase as the backend database. Deployed on GitHub Pages.

**Live:** https://alonktz.github.io/clinic-app/

## Tech Stack
- **Frontend**: React 18 + Vite, inline styles
- **Database**: Supabase (REST API)
- **Deployment**: GitHub Pages via GitHub Actions

## Local Dev
```bash
npm install
npm run dev   # http://localhost:5173
```

Create a `.env` file:
```
VITE_SUPABASE_URL=https://pvqucrpxfupqefhvcohc.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## Design System
See [`design-system/README.md`](./design-system/README.md) — tokens, type, motion, components, and a reference UI kit.
