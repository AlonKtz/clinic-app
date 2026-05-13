# QFlow Design System

QFlow is a clinic appointment management system — a Hebrew-RTL web app for tracking doctors, patients, and bookings inside a small clinic. The product is data-dense but operational: receptionists and clinic staff use it dozens of times a day to schedule, reschedule, and look up appointments quickly.

This design system captures the QFlow brand — calm clinical neutrals, a confident **pulse-red** primary, soft 3D depth, and a steady heartbeat of motion — and packages it as reusable tokens, components, and screens.

> **Tagline:** *מערכת ניהול תורים* — "appointment management system"
> **Authored by:** Alon & Afik

---

## Source materials

- **Codebase:** `ClinicApp/` (mounted via File System Access API)
  - `src/ClinicApp.jsx` — main app shell, tabs, header
  - `src/clinic/styles.js` — original red palette + style primitives
  - `src/clinic/{Doctors,Patients,Appointments,ERD}View.jsx` — feature views
  - `clinic-db-setup.sql` — Supabase schema (`clinic_doctors`, `clinic_patients`, `clinic_appointments`)
- **Live URL:** `https://alonktz.github.io/clinic-app/`
- **Repo:** `https://github.com/AlonKtz/clinic-app`
- **Stack:** React 18 + Vite + Supabase, deployed on GitHub Pages.

The codebase ships **inline styles only** (no CSS framework). The original palette is a red-on-blush theme inspired by Israeli HMO branding (Clalit). For this design system we keep the red identity but evolve it into a calmer, more clinical, more *animated* direction the user explicitly asked for: **smooth, interactive, with subtle 3D and pulse animations.**

---

## Index — files in this folder

```
QFlow Design System/
├── README.md                  ← you are here
├── SKILL.md                   ← Claude Skill manifest (download-friendly)
├── colors_and_type.css        ← all design tokens (CSS vars)
├── fonts/                     ← (Heebo loaded via Google Fonts CDN)
├── assets/                    ← logo marks, illustrations
├── preview/                   ← Design System cards (registered)
│   ├── colors-primary.html
│   ├── colors-neutrals.html
│   ├── colors-semantic.html
│   ├── type-display.html
│   ├── type-scale.html
│   ├── type-rtl.html
│   ├── spacing.html
│   ├── radii.html
│   ├── shadows.html
│   ├── motion.html
│   ├── buttons.html
│   ├── inputs.html
│   ├── cards.html
│   ├── badges.html
│   ├── tabs.html
│   ├── icons.html
│   └── logo.html
└── ui_kits/qflow/             ← interactive recreation of the QFlow app
    ├── README.md
    ├── index.html
    ├── Header.jsx
    ├── Tabs.jsx
    ├── AppointmentsView.jsx
    ├── DoctorsView.jsx
    ├── PatientsView.jsx
    └── primitives.jsx
```

---

## Content fundamentals

QFlow is a **Hebrew-first, right-to-left** product. All UI copy is in Hebrew; English is reserved for the wordmark itself ("QFlow") and a single subtitle phrase. Latin numerals are used for IDs, license numbers, and counts.

**Voice & tone**
- **Direct, action-first, professional** — never chatty. Buttons are imperatives: `+ קבע תור` ("Book appointment"), `+ הוסף רופא` ("Add doctor"), `🗑️ מחק` ("Delete").
- **Polite confirmations** — destructive actions confirm explicitly: *"למחוק רופא זה? כל התורים שלו יימחקו גם כן."* ("Delete this doctor? All their appointments will be deleted too.")
- **No marketing fluff.** No second-person address ("you"), no first-person ("we"). Sentences are short instructions or status statements.
- **Empty states are encouraging, not apologetic** — *"אין תורים במערכת עדיין · לחץ על 'קבע תור' כדי להתחיל"* ("No appointments yet · click 'Book appointment' to get started").
- **Toasts are 3–5 words** — `התור נקבע בהצלחה` ("Appointment booked successfully"), `הרופא נמחק בהצלחה` ("Doctor deleted successfully").

**Casing & punctuation**
- Hebrew has no case, so emphasis comes from **weight (700/800)** and **size**.
- Section headers (`h2`) use plain sentence form: `ניהול תורים`, `רשימת רופאים`.
- Labels are short, sometimes annotated with the data-type in parentheses: `מספר רישיון (PK — מזהה ייחודי)`.
- En dashes/em dashes (`—`) separate clauses; bullets (`·`) separate inline metadata.

**Examples worth copying**
| Surface | Hebrew | Translation |
|---|---|---|
| Primary CTA | `+ קבע תור` | `+ Book appointment` |
| Header subtitle | `מערכת ניהול תורים` | `Appointment management system` |
| Form heading | `📅 קביעת תור חדש` | `📅 Book a new appointment` |
| Field label | `סיבת ביקור` | `Reason for visit` |
| Toast (success) | `התור נקבע בהצלחה` | `Appointment booked successfully` |
| Confirm dialog | `למחוק תור זה?` | `Delete this appointment?` |
| Empty state | `אין מטופלים במערכת עדיין` | `No patients in the system yet` |

**Numbers & dates** — Hebrew locale (`he-IL`), short date + short time (`08/05/2026, 09:00`). License numbers and IDs are bare digits in `<strong>`.

**Emoji** — the original product uses emoji as iconography (🏥 📅 👨‍⚕️ 🧑 🪪 📞 🕐). **The design system replaces these with Lucide icons by default** (see Iconography); emoji are kept only inside informal toasts and confirm dialogs (✅ / ❌) where they read as system feedback rather than UI furniture.

---

## Visual foundations

The brand sits at the intersection of **clinical-warm** and **data-confident**. Think of a soft white wall in a private clinic, a single red wayfinding stripe, and a quiet pulse on the heart-rate monitor at the desk.

### Color
- **Primary = pulse red** (`#E11D2C`) — used sparingly, for CTAs, the heartbeat in the logo, and the accent stripe on active records.
- **Surfaces = blush-tinted off-whites** — `#FBF7F7` app background, `#FFFFFF` cards, `#FAF3F3` secondary surfaces. The blush warmth keeps it from feeling sterile-tech.
- **Neutrals = warm slate** with reddish undertones (`#1A1414` → `#B59A9A`). All grays bias slightly into the red side of the wheel so they harmonize with the brand.
- **Semantic** — mint green (`#14B8A6`) for vitals/success, amber (`#F59E0B`) for waiting/warnings, violet (`#7C3AED`) for ERD relationships (carried over from the codebase). No bluish-purple gradients, no rainbow.

### Typography
- **Heebo** as the primary face (Hebrew + Latin, Google Fonts) — substituted for the codebase's `Segoe UI` because Segoe is not freely embeddable. **⚠️ flag for the user — confirm if you'd prefer the original Segoe UI shipped or a different licensed Hebrew face.**
- Weights used: 400 / 500 / 600 / 700 / 800. Display sizes lean into 800.
- **Mono** = JetBrains Mono for IDs, license numbers, license plates of data.
- Type scale is modest: `12 / 13 / 15 / 17 / 20 / 24 / 32 / 44 / 60`. Letter-spacing is slightly tightened on display sizes (`-0.02em`); eyebrows use wide tracking (`+0.06em`).

### Spacing & layout
- 4-pt base scale: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`.
- App content lives in a centered **960px max-width column**, regardless of screen width — clinic staff use this on desks, not phones.
- Forms use `grid-template-columns: 1fr 1fr` (or `1fr 1fr 1fr` for patients) with a `1rem` gap.
- All primary content blocks sit on cards, not bare pages.

### Backgrounds
- No photography. No full-bleed imagery.
- The **header** is a 3D radial-gradient red (`--qf-grad-brand-3d`) — top-left highlight bleeding to a near-black bottom-right — giving the bar a subtle dome/perspective feel.
- A **dot-grid SVG pattern** is used behind the ERD canvas (carried over from the codebase) and is available as a system pattern.
- No textures, no grain, no hand-drawn illustrations.

### Animation
- **Easing:** all transitions use `cubic-bezier(0.22, 1, 0.36, 1)` ("ease-out smooth") for UI, and `cubic-bezier(0.34, 1.56, 0.64, 1)` ("subtle spring") for feedback (toasts, confirms).
- **Durations:** 140ms / 220ms / 420ms — never longer for state changes.
- **Signature motions:**
  1. `qf-pulse-ring` — the core brand motion. A 1.8s expanding red halo around the logo mark, the active-tab dot, and the "next appointment" badge. Mirrors a heart-rate pulse.
  2. `qf-pulse-soft` — 4% scale breath on icons inside live indicators.
  3. `qf-float-3d` — gentle perspective-rotate on hero cards (the header + login card), giving a believable 3D float.
- **No bouncy springs** on layout; springs only for tactile button-press feedback.
- **No fades from 0 over long durations** — content snaps in over 220ms with a tiny upward translate.

### Hover states
- **Buttons:** primary darkens by one step (`--qf-red-500` → `--qf-red-600`) and lifts 1px with a deeper shadow.
- **Cards:** hovering a list row raises the shadow from `--qf-shadow-1` to `--qf-shadow-2` and tints the background `--qf-surface-2`.
- **Icon buttons:** background fades from transparent → `--qf-primary-soft`.
- **Tabs:** the underline grows from a 3px segment under the tab, animated with `transform: scaleX()`.

### Press states
- Buttons compress to `transform: scale(0.97)` and lose elevation (shadow → `none`) for 80ms, then bounce back.
- Cards do **not** press — they're informational, not interactive surfaces.

### Borders & lines
- 1px borders, color = `--qf-line` (`#EFE0E0`) — barely-there pinkish hairlines.
- Forms get a 2px `--qf-red-400` border to signal "active editing zone."
- Active appointment cards get a 4px **right-side** stripe (RTL) in `--qf-red-400`; past appointments use a slate stripe and 0.75 opacity.

### Shadows
- Three steps:
  - `--qf-shadow-1` — flat resting cards
  - `--qf-shadow-2` — hover, opened forms
  - `--qf-shadow-3` — modals, popovers
- Each carries a *red tint* in the colored channel (`rgba(180,12,31,X)`) so shadows feel of the brand instead of generic black.
- A separate `--qf-shadow-glow` is reserved for the primary CTA's "pulse" affordance and the live-status dot.

### Transparency & blur
- Glass surfaces (`backdrop-filter: blur(14px)`) are used **once**, on the floating action bar in the AppointmentsView. Otherwise everything is opaque.
- Translucent overlays for badges *inside* the gradient header use `rgba(255,255,255,0.18)`.

### Corner radii
- `6 / 10 / 14 / 20 / 999`. Defaults: inputs `10`, cards `14`, modals `20`, pills `999`. Buttons share `10` with inputs to feel like the same family.

### Cards
- Background: `--qf-surface`.
- Border: 1px solid `--qf-line`.
- Radius: 14.
- Padding: `16 20`.
- Shadow: `--qf-shadow-1` resting, `--qf-shadow-2` hover.
- Optional **right-side accent stripe** (4px) for status.

---

## Iconography

QFlow uses **Lucide** as its primary icon system — clean 2px stroke, rounded line caps, 24px viewBox, monochrome. Lucide is loaded from CDN (`https://unpkg.com/lucide@latest`) and rendered inline as SVG.

**Mapping from the codebase's emoji → Lucide:**

| Codebase emoji | Lucide icon | Use |
|---|---|---|
| 🏥 | `hospital` | logo lockup, app shell |
| 📅 | `calendar-days` | appointments tab, dates |
| 👨‍⚕️ | `stethoscope` | doctors tab, doctor avatars |
| 🧑 | `user-round` | patients tab, patient avatars |
| 🪪 | `id-card` | ID / license numbers |
| 📞 | `phone` | phone fields |
| 🕐 | `clock` | times |
| ⚠️ | `alert-triangle` | warnings, error states |
| 🗑️ | `trash-2` | delete actions |
| 💾 | `save` | save / submit forms |
| ✕ | `x` | close, cancel |
| ✅ / ❌ | (kept as emoji) | toast feedback only |
| 🗂️ | `database` / `network` | ERD diagram tab |

**Rules**
- Standard size **20px** in row contexts, **24px** in CTAs, **18px** in badges.
- Stroke = `currentColor`; never override.
- Pair an icon with a label whenever the action is destructive or non-obvious. Icon-only buttons are reserved for `close` and `delete`.
- **Avoid:** custom SVG illustrations, emoji as decoration, two competing icon families, multi-color icon fills. The only multi-color asset is the QFlow logo mark itself.

**Logo** — wordmark "QFlow" in Heebo 800 with a small heart-pulse glyph replacing the cross of the "f". A standalone mark (rounded square + pulse line) is provided in `assets/`.

---

## CAVEATS & next steps — please review

1. **Heebo font substitution.** The codebase uses Segoe UI (system, not embeddable). I substituted **Heebo** from Google Fonts. If you have a licensed Hebrew face you'd prefer (Rubik, Assistant, Frank Ruhl, custom), please provide it.
2. **Lucide icons replace emoji as the primary icon system.** The original product uses emoji throughout. I kept emoji only in toast messages. **Confirm:** do you want emoji removed everywhere, kept everywhere, or this hybrid?
3. **Color evolution.** I shifted the primary red slightly from `#CC0000` → `#E11D2C` to make pulse animations and shadows feel less harsh. If you want to lock to the exact original `#CC0000`, swap `--qf-red-500` in `colors_and_type.css`.
4. **No 3D library.** The "3D" feel is achieved with `perspective()` + `rotateX()` + radial gradients + layered shadows — no Three.js. Tell me if you want a real 3D hero (e.g. a tilted device or floating clinic mark).
5. **No marketing site / no slide template.** This is an internal tool with one product surface. I built one UI kit (`ui_kits/qflow/`).
