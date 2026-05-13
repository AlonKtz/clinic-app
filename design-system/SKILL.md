# QFlow Design System — Skill

Use this skill when designing for **QFlow**, a clinic appointment management web app (Hebrew RTL).

## Identity
- Pulse-red brand (`#E11D2C`) on warm blush surfaces
- Clinical-calm, never sterile
- Subtle 3D + steady pulse motion
- Hebrew RTL primary; Heebo typeface; Lucide icons (not emoji)

## Tokens
Import once: `<link rel="stylesheet" href="../colors_and_type.css">` and use the `--qf-*` custom properties. Never hardcode colors.

## Rules
- All UI in Hebrew, `dir="rtl"`. Latin numerals for IDs.
- Direct, action-first copy: imperatives on buttons (`+ קבע תור`).
- Cards: 14px radius, `--qf-shadow-1` resting, `--qf-shadow-2` on hover, optional 4px right-side stripe for status.
- Buttons: 10px radius. Primary uses pulse-red + glow only on the page's hero CTA.
- Motion: 220ms `ease-out`, `qf-pulse-ring` on live indicators only.
- Icons: Lucide, 2px stroke, 20px standard.
- Confirm destructive actions; toast 3–5 words.

## Files
- `README.md` — full design rationale
- `colors_and_type.css` — tokens
- `preview/` — design system cards
- `ui_kits/qflow/` — reference React kit
