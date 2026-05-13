// Lucide-style inline SVG icons for QFlow
// 2px stroke, 20px default, no fill. Use these — not emoji — in UI elements.
// (Emoji are allowed only in toasts, per SKILL.md)

function I({ size = 20, children }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block' }}>
      {children}
    </svg>
  );
}

export const DocIcon = (p) => (
  <I {...p}>
    <circle cx="11" cy="5" r="2"/>
    <path d="M11 7v8a4 4 0 0 0 8 0V9M19 7v2"/>
  </I>
);

export const PatIcon = (p) => (
  <I {...p}>
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21a8 8 0 0 1 16 0"/>
  </I>
);

export const CalIcon = (p) => (
  <I {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </I>
);

export const DBIcon = (p) => (
  <I {...p}>
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
    <path d="M3 12a9 3 0 0 0 18 0"/>
  </I>
);

export const TrashIcon = (p) => (
  <I {...p}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  </I>
);

export const SaveIcon = (p) => (
  <I {...p}>
    <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-3 7 3z"/>
  </I>
);

export const PlusIcon = (p) => (
  <I {...p}>
    <path d="M12 5v14M5 12h14"/>
  </I>
);

export const XIcon = (p) => (
  <I {...p}>
    <path d="M18 6 6 18M6 6l12 12"/>
  </I>
);

export const IDIcon = (p) => (
  <I {...p}>
    <rect x="2" y="6" width="20" height="14" rx="2"/>
    <path d="M8 11h2M8 15h6"/>
  </I>
);

export const PhoneIcon = (p) => (
  <I {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
  </I>
);

export const ClockIcon = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </I>
);

export const AlertIcon = (p) => (
  <I {...p}>
    <path d="M12 9v4M12 17h.01"/>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
  </I>
);

export const FilterXIcon = (p) => (
  <I {...p}>
    <path d="M13.013 3H2l8 9.46V19l4 2v-8.54l.9-1.055"/>
    <path d="m22 3-5 5M17 3l5 5"/>
  </I>
);
