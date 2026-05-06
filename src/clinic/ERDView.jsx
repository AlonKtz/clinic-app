import { useState } from 'react';
import { colors } from './styles';

/* ── Palette ────────────────────────────────────────────────────── */
const C = {
  entity: '#AA0000', entityBg: '#FFE8E8',
  entityHl: '#CC0000', entityHlBg: '#FFD0D0',
  relation: '#7c3aed', relationBg: '#ede9fe',
  relationHl: '#6d28d9', relationHlBg: '#ddd6fe',
  attr: '#0f766e', attrBg: '#f0fdfa',
  pk: '#CC0000', pkBg: '#fff0f0',
  line: '#c4a0a0', mainLine: '#9B2020',
  lineHl: '#64748b', mainLineHl: '#CC0000',
};
const FONT = 'Segoe UI, Arial, sans-serif';

/* ── Highlight graph ─────────────────────────────────────────────
   RELATED[node] = nodes that light up when `node` is active        */
const RELATED = {
  doctor:      ['recv', 'appointment'],
  patient:     ['book', 'appointment'],
  appointment: ['recv', 'book', 'doctor', 'patient'],
  recv:        ['doctor', 'appointment'],
  book:        ['patient', 'appointment'],
};
const hl       = (node, active) => !!active && (active === node || !!RELATED[active]?.includes(node));
const directly = (node, active) => active === node;

/* ── Geometry helpers ───────────────────────────────────────────── */

/** point at fraction t from `a` to `b` */
const lerp = (a, b, t) => ({
  x: Math.round(a.x + t * (b.x - a.x)),
  y: Math.round(a.y + t * (b.y - a.y)),
});

/** point on segment `from→to` at fraction t, offset perpendicular by `d` */
function offsetOn(from, to, t, d) {
  const x = from.x + t * (to.x - from.x);
  const y = from.y + t * (to.y - from.y);
  const dx = to.x - from.x, dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  // perpendicular CCW = (-dy, dx)/len ; positive d → "left" of direction
  return {
    x: Math.round(x + (-dy / len) * d),
    y: Math.round(y + ( dx / len) * d),
    anchorX: Math.round(x),
    anchorY: Math.round(y),
  };
}

/* ── Info data ──────────────────────────────────────────────────── */
const INFO = {
  doctor: {
    icon: '👨‍⚕️', title: 'ישות: רופא', color: C.entity, bg: C.entityBg,
    body: 'ישות המייצגת רופא הפועל במרפאה. מזוהה ע"י מספר רישיון ייחודי.',
    attrs: [
      { name: 'מספר רישיון', isPK: true,  desc: 'מפתח ראשי — מזהה ייחודי' },
      { name: 'שם רופא',     isPK: false, desc: 'שם מלא כפי שמופיע ברישיון' },
    ],
    cardinality: [
      { side: 'רופא בקשר "מקבל"', notation: '(0,N)', meaning: 'רופא יכול להשתתף ב-0 עד הרבה תורים' },
    ],
    note: 'משתתף בקשר אחד: מקבל → תור (יחס 1:N)',
  },
  patient: {
    icon: '🧑', title: 'ישות: מטופל', color: C.entity, bg: C.entityBg,
    body: 'ישות המייצגת מטופל הנרשם לתורים במרפאה.',
    attrs: [
      { name: 'מספר ת.ז.',   isPK: true,  desc: 'מפתח ראשי — תעודת זהות' },
      { name: 'שם מטופל',    isPK: false, desc: 'שם מלא של המטופל' },
      { name: 'מספר טלפון',  isPK: false, desc: 'מספר טלפון ליצירת קשר' },
    ],
    cardinality: [
      { side: 'מטופל בקשר "קובע"', notation: '(0,N)', meaning: 'מטופל יכול לקבוע 0 עד הרבה תורים' },
    ],
    note: 'משתתף בקשר אחד: קובע → תור (יחס 1:N)',
  },
  appointment: {
    icon: '📅', title: 'ישות: תור', color: C.entity, bg: C.entityBg,
    body: 'ישות המייצגת תור — חיבור בין מטופל לרופא במועד מסוים.',
    attrs: [
      { name: 'מספר תור',   isPK: true,  desc: 'מפתח ראשי (auto-increment)' },
      { name: 'תאריך ושעה', isPK: false, desc: 'TIMESTAMPTZ — מועד התור' },
      { name: 'סיבת ביקור', isPK: false, desc: 'תיאור חופשי של הביקור' },
    ],
    fks: ['מספר רישיון → רופא', 'מספר ת.ז. → מטופל'],
    cardinality: [
      { side: 'תור בקשר "מקבל"', notation: '(1,1)', meaning: 'כל תור משויך לבדיוק רופא אחד' },
      { side: 'תור בקשר "קובע"', notation: '(1,1)', meaning: 'כל תור משויך לבדיוק מטופל אחד' },
    ],
    note: 'משתתף בשני קשרים: N:1 עם רופא · N:1 עם מטופל',
  },
  recv: {
    icon: '🔗', title: 'קשר: מקבל', color: C.relation, bg: C.relationBg,
    body: 'קשר בין "רופא" ל"תור" — רופא מקבל מטופלים לתורים.',
    ratio: '1 : N',
    cardinality: [
      { side: 'רופא',  notation: '(0,N)', meaning: 'רופא יכול להשתתף בין 0 לתורים רבים' },
      { side: 'תור',   notation: '(1,1)', meaning: 'כל תור שייך לבדיוק רופא אחד' },
    ],
  },
  book: {
    icon: '📋', title: 'קשר: קובע', color: C.relation, bg: C.relationBg,
    body: 'קשר בין "מטופל" ל"תור" — מטופל קובע תורים.',
    ratio: '1 : N',
    cardinality: [
      { side: 'מטופל', notation: '(0,N)', meaning: 'מטופל יכול לקבוע בין 0 לתורים רבים' },
      { side: 'תור',   notation: '(1,1)', meaning: 'כל תור שייך לבדיוק מטופל אחד' },
    ],
  },
};

/* ── SVG primitives ─────────────────────────────────────────────── */

function EntityRect({ cx, cy, label, w = 160, h = 50, active, ...events }) {
  return (
    <g style={{ cursor: 'pointer' }} {...events}>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h}
        fill={active ? C.entityHlBg : C.entityBg}
        stroke={active ? C.entityHl : C.entity}
        strokeWidth={active ? 3.5 : 2.5} rx={4}
        style={{ filter: active ? 'drop-shadow(0 0 8px rgba(204,0,0,0.45))' : 'none', transition: 'all 0.18s' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={16} fontWeight="bold"
        fill={active ? C.entityHl : C.entity} fontFamily={FONT}>{label}</text>
    </g>
  );
}

function RelDiamond({ cx, cy, label, hw = 62, hh = 36, active, ...events }) {
  const pts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
  return (
    <g style={{ cursor: 'pointer' }} {...events}>
      <polygon points={pts}
        fill={active ? C.relationHlBg : C.relationBg}
        stroke={active ? C.relationHl : C.relation}
        strokeWidth={active ? 3 : 2.5}
        style={{ filter: active ? 'drop-shadow(0 0 8px rgba(109,40,217,0.4))' : 'none', transition: 'all 0.18s' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={14} fontWeight="bold"
        fill={active ? C.relationHl : C.relation} fontFamily={FONT}>{label}</text>
    </g>
  );
}

function AttrEllipse({ cx, cy, label, isPK = false, rx = 64, ry = 21, active }) {
  const stroke = isPK ? C.pk : C.attr;
  const fill   = active ? (isPK ? '#fecaca' : '#99f6e4') : (isPK ? C.pkBg : C.attrBg);
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
        fill={fill} stroke={stroke}
        strokeWidth={active ? 2.5 : (isPK ? 2 : 1.5)}
        style={{ transition: 'all 0.18s' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={11} fill={isPK ? C.pk : C.attr}
        fontWeight={isPK ? 'bold' : 'normal'}
        textDecoration={isPK ? 'underline' : 'none'}
        fontFamily={FONT}>{label}</text>
    </g>
  );
}

function ConnLine({ x1, y1, x2, y2, main = false, active }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={active ? (main ? C.mainLineHl : C.lineHl) : (main ? C.mainLine : C.line)}
      strokeWidth={active ? (main ? 3 : 2) : (main ? 2 : 1.5)}
      style={{ transition: 'all 0.18s' }} />
  );
}

/** Big participation badge with dotted leader to the line.
    `entityName` — a short tag like "רופא" shown above the (min,max).        */
function ParticipationTag({ pos, label, entityName, color = '#1e293b', active }) {
  const w = 78, h = 38;
  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Leader line from anchor on-line point to badge center */}
      <line x1={pos.anchorX} y1={pos.anchorY} x2={pos.x} y2={pos.y}
        stroke={color} strokeWidth={1.2} strokeDasharray="3,2" opacity={0.55} />
      {/* Anchor dot ON the relationship line */}
      <circle cx={pos.anchorX} cy={pos.anchorY} r={3} fill={color} />
      {/* Badge */}
      <rect x={pos.x - w/2} y={pos.y - h/2} width={w} height={h} rx={8}
        fill="#fff" stroke={color} strokeWidth={active ? 2.5 : 2}
        style={{ filter: active ? `drop-shadow(0 0 6px ${color}66)` : 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))', transition: 'all 0.18s' }} />
      {/* Entity tag (small, top) */}
      <text x={pos.x} y={pos.y - 7} textAnchor="middle" dominantBaseline="middle"
        fontSize={10} fontWeight={600} fill="#64748b" fontFamily={FONT}>
        {entityName}
      </text>
      {/* (min,max) (big, bottom) */}
      <text x={pos.x} y={pos.y + 8} textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight={800} fill={color} fontFamily={FONT}>
        {label}
      </text>
    </g>
  );
}

/** Big "1 : N" ratio badge — drawn near the diamond. */
function RatioBadge({ x, y, ratio = '1 : N', active }) {
  const w = 64, h = 30;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={x - w/2} y={y - h/2} width={w} height={h} rx={15}
        fill={active ? C.relationHl : '#fff'}
        stroke={C.relationHl} strokeWidth={2}
        style={{ filter: 'drop-shadow(0 1px 3px rgba(124,58,237,0.25))', transition: 'all 0.18s' }} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
        fontSize={15} fontWeight={800}
        fill={active ? '#fff' : C.relationHl} fontFamily={FONT}>
        {ratio}
      </text>
    </g>
  );
}

/** Tiny "1" / "N" marker placed right at the entity end of a line — classic Chen ratio. */
function RatioTick({ pos, label, color }) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      <circle cx={pos.x} cy={pos.y} r={11} fill="#fff" stroke={color} strokeWidth={2} />
      <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
        fontSize={12} fontWeight={800} fill={color} fontFamily={FONT}>
        {label}
      </text>
    </g>
  );
}

/* ── Legend item ────────────────────────────────────────────────── */
function LegendItem({ shape, color, bg, label, isPK }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg width={38} height={26}>
        {shape === 'rect'    && <rect x={3} y={5} width={32} height={16} rx={2} fill={bg} stroke={color} strokeWidth={2} />}
        {shape === 'diamond' && <polygon points="19,2 35,13 19,24 3,13" fill={bg} stroke={color} strokeWidth={2} />}
        {shape === 'ellipse' && <ellipse cx={19} cy={13} rx={16} ry={10} fill={bg} stroke={color} strokeWidth={isPK ? 2 : 1.5} />}
      </svg>
      <span style={{ color: '#475569', fontSize: '0.82rem' }}>
        {isPK ? <u>{label}</u> : label}
      </span>
    </div>
  );
}

/* ── Info panel ─────────────────────────────────────────────────── */
function InfoPanel({ nodeId, onClose }) {
  const info = INFO[nodeId];
  if (!info) return null;
  return (
    <div style={{
      background: info.bg, border: `2px solid ${info.color}`,
      borderRadius: '12px', padding: '1rem 1.25rem',
      marginTop: '1rem', position: 'relative',
      animation: 'erdFadeIn 0.2s ease',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: '0.6rem', left: '0.75rem',
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '1rem', color: '#94a3b8', lineHeight: 1,
      }} title="סגור">✕</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', paddingLeft: '1.8rem' }}>
        <span style={{ fontSize: '1.6rem' }}>{info.icon}</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: info.color }}>
            {info.title}
            {info.ratio && (
              <span style={{
                marginRight: '0.6rem',
                background: C.relationHl, color: '#fff',
                padding: '0.15rem 0.6rem', borderRadius: '999px',
                fontSize: '0.75rem', fontWeight: 800,
              }}>{info.ratio}</span>
            )}
          </h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{info.body}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
        {info.attrs && (
          <div style={{ flex: '1 1 220px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>תכונות</div>
            {info.attrs.map(a => (
              <div key={a.name} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{
                  background: a.isPK ? C.pkBg : C.attrBg,
                  color: a.isPK ? C.pk : C.attr,
                  border: `1px solid ${a.isPK ? C.pk : C.attr}`,
                  borderRadius: '4px', padding: '0.1rem 0.45rem',
                  fontSize: '0.78rem', fontWeight: a.isPK ? 700 : 400,
                  textDecoration: a.isPK ? 'underline' : 'none',
                  whiteSpace: 'nowrap',
                }}>{a.name}</span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{a.desc}</span>
              </div>
            ))}
          </div>
        )}
        {info.fks && (
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>מפתחות זרים</div>
            {info.fks.map(fk => (
              <div key={fk} style={{ fontSize: '0.8rem', color: '#0f766e', marginBottom: '0.25rem' }}>
                🔑 {fk}
              </div>
            ))}
          </div>
        )}
        {info.cardinality && (
          <div style={{ flex: '1 1 280px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>קרדינליות (min,max)</div>
            {info.cardinality.map(c => (
              <div key={c.side} style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{
                  background: '#1e293b', color: '#fff',
                  borderRadius: '5px', padding: '0.1rem 0.45rem',
                  fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap',
                }}>{c.notation}</span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  <strong style={{ color: '#334155' }}>{c.side}:</strong> {c.meaning}
                </span>
              </div>
            ))}
          </div>
        )}
        {info.note && (
          <div style={{ flex: '1 1 100%', fontSize: '0.78rem', color: '#64748b', borderTop: `1px solid ${info.color}40`, paddingTop: '0.5rem', marginTop: '0.2rem' }}>
            ℹ️ {info.note}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function ERDView() {
  const [hovered,  setHovered]  = useState(null);
  const [selected, setSelected] = useState(null);
  const active = hovered ?? selected;

  const ev = (node) => ({
    onMouseEnter: () => setHovered(node),
    onMouseLeave: () => setHovered(null),
    onClick:      () => setSelected(s => s === node ? null : node),
  });

  /* ── Layout ── */
  const DOC  = { x: 720, y: 210 };
  const PAT  = { x: 270, y: 210 };
  const APT  = { x: 495, y: 440 };
  const RECV = { x: 615, y: 325 };
  const BOOK = { x: 375, y: 325 };

  const DA_PK = { x: 870, y: 120 };
  const DA_NM = { x: 870, y: 300 };
  const PA_PK = { x: 120, y: 120 };
  const PA_NM = { x:  90, y: 210 };
  const PA_PH = { x: 120, y: 300 };
  const AA_PK = { x: 495, y: 555 };
  const AA_DT = { x: 315, y: 555 };
  const AA_RS = { x: 670, y: 555 };

  /* ── Cardinality positions ── */
  /* (min,max) participation tags — placed perpendicular to each line.
     Sign of `d` decides which side of the line the badge sits.
     For DOC→RECV (going down-left) we use d=-50 → upper-right of line.
     For PAT→BOOK (going down-right) we use d=+50 → upper-left  of line.
     For RECV→APT and BOOK→APT we use the same convention.            */
  const POS_DOC      = offsetOn(DOC,  RECV, 0.42, -55);   // near DOC, outward
  const POS_APT_RECV = offsetOn(APT,  RECV, 0.42, +55);   // near APT, outward (right side)
  const POS_PAT      = offsetOn(PAT,  BOOK, 0.42, +55);   // near PAT, outward (left side)
  const POS_APT_BOOK = offsetOn(APT,  BOOK, 0.42, -55);   // near APT, outward (left side)

  /* "1 / N" ratio ticks placed AT the entity-end of each line */
  const TICK_DOC      = lerp(DOC,  RECV, 0.18);
  const TICK_APT_RECV = lerp(APT,  RECV, 0.20);
  const TICK_PAT      = lerp(PAT,  BOOK, 0.18);
  const TICK_APT_BOOK = lerp(APT,  BOOK, 0.20);

  /* "1 : N" ratio badges — placed NEXT to each diamond (outward). */
  const RATIO_RECV = { x: RECV.x + 100, y: RECV.y };
  const RATIO_BOOK = { x: BOOK.x - 100, y: BOOK.y };

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', fontWeight: 700 }}>
          דיאגרמת ERD — Chen Notation (עם קרדינליות מלאה)
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {hovered && !selected && (
            <span style={{
              background: '#1e293b', color: '#fff',
              borderRadius: '6px', padding: '0.25rem 0.7rem',
              fontSize: '0.74rem', fontWeight: 600,
              animation: 'erdFadeIn 0.15s ease',
            }}>לחץ לפרטים</span>
          )}
          <span style={{
            background: colors.primaryBg, color: colors.primary,
            borderRadius: '8px', padding: '0.3rem 0.75rem',
            fontSize: '0.78rem', fontWeight: 600,
          }}>3 ישויות · 2 קשרים · 8 תכונות</span>
        </div>
      </div>

      {/* Parking note */}
      <div style={{
        background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px',
        padding: '0.7rem 1rem', marginBottom: '1rem',
        fontSize: '0.82rem', color: '#92400e',
        display: 'flex', gap: '0.5rem',
      }}>
        <span style={{ flexShrink: 0 }}>ℹ️</span>
        <span>
          <strong>הערה — כלל "גורמים לא רלוונטיים":</strong> תכונת <strong>חניה</strong> הוסרה מהמודל.
          החניה שייכת לכלל צוות הרופאים (מאפיין של הארגון) ולא לרופא בודד — לכן אינה תכונה של ישות <em>רופא</em>.
        </span>
      </div>

      {/* SVG canvas */}
      <div style={{
        background: '#fafcff', borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '1rem', overflowX: 'auto',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        userSelect: 'none',
      }}>
        <svg viewBox="0 0 990 620" style={{ width: '100%', minWidth: '780px', display: 'block' }}>

          <text x={495} y={28} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily={FONT}>
            ✦ רחף מעל ישות / קשר לסימון · לחץ לפרטים
          </text>

          {/* Attribute lines */}
          <ConnLine x1={DOC.x} y1={DOC.y} x2={DA_PK.x} y2={DA_PK.y} active={directly('doctor', active)} />
          <ConnLine x1={DOC.x} y1={DOC.y} x2={DA_NM.x} y2={DA_NM.y} active={directly('doctor', active)} />
          <ConnLine x1={PAT.x} y1={PAT.y} x2={PA_PK.x} y2={PA_PK.y} active={directly('patient', active)} />
          <ConnLine x1={PAT.x} y1={PAT.y} x2={PA_NM.x} y2={PA_NM.y} active={directly('patient', active)} />
          <ConnLine x1={PAT.x} y1={PAT.y} x2={PA_PH.x} y2={PA_PH.y} active={directly('patient', active)} />
          <ConnLine x1={APT.x} y1={APT.y} x2={AA_PK.x} y2={AA_PK.y} active={directly('appointment', active)} />
          <ConnLine x1={APT.x} y1={APT.y} x2={AA_DT.x} y2={AA_DT.y} active={directly('appointment', active)} />
          <ConnLine x1={APT.x} y1={APT.y} x2={AA_RS.x} y2={AA_RS.y} active={directly('appointment', active)} />

          {/* Main relationship lines */}
          <ConnLine x1={DOC.x}  y1={DOC.y}  x2={RECV.x} y2={RECV.y} main active={hl('recv', active)} />
          <ConnLine x1={RECV.x} y1={RECV.y} x2={APT.x}  y2={APT.y}  main active={hl('recv', active)} />
          <ConnLine x1={PAT.x}  y1={PAT.y}  x2={BOOK.x} y2={BOOK.y} main active={hl('book', active)} />
          <ConnLine x1={BOOK.x} y1={BOOK.y} x2={APT.x}  y2={APT.y}  main active={hl('book', active)} />

          {/* ── Classic Chen ratio ticks: 1 / N right at the entity ── */}
          <RatioTick pos={TICK_DOC}      label="1" color={C.entity} />
          <RatioTick pos={TICK_APT_RECV} label="N" color={C.entity} />
          <RatioTick pos={TICK_PAT}      label="1" color={C.entity} />
          <RatioTick pos={TICK_APT_BOOK} label="N" color={C.entity} />

          {/* ── (min,max) participation tags with leader lines ── */}
          <ParticipationTag pos={POS_DOC}      label="(0,N)" entityName="רופא"  color="#1e293b" active={hl('recv', active)} />
          <ParticipationTag pos={POS_APT_RECV} label="(1,1)" entityName="תור"   color={C.entityHl} active={hl('recv', active)} />
          <ParticipationTag pos={POS_PAT}      label="(0,N)" entityName="מטופל" color="#1e293b" active={hl('book', active)} />
          <ParticipationTag pos={POS_APT_BOOK} label="(1,1)" entityName="תור"   color={C.entityHl} active={hl('book', active)} />

          {/* ── Big "1 : N" ratio badges next to each diamond ── */}
          <RatioBadge x={RATIO_RECV.x} y={RATIO_RECV.y} ratio="1 : N" active={hl('recv', active)} />
          <RatioBadge x={RATIO_BOOK.x} y={RATIO_BOOK.y} ratio="1 : N" active={hl('book', active)} />

          {/* ── Entities ── */}
          <EntityRect cx={DOC.x} cy={DOC.y} label="רופא"   active={hl('doctor', active)}      {...ev('doctor')} />
          <EntityRect cx={PAT.x} cy={PAT.y} label="מטופל"  active={hl('patient', active)}     {...ev('patient')} />
          <EntityRect cx={APT.x} cy={APT.y} label="תור" w={185} active={hl('appointment', active)} {...ev('appointment')} />

          {/* ── Relationships ── */}
          <RelDiamond cx={RECV.x} cy={RECV.y} label="מקבל" active={hl('recv', active)} {...ev('recv')} />
          <RelDiamond cx={BOOK.x} cy={BOOK.y} label="קובע" active={hl('book', active)} {...ev('book')} />

          {/* ── Attributes ── */}
          <AttrEllipse cx={DA_PK.x} cy={DA_PK.y} label="מספר רישיון" isPK active={directly('doctor', active)} />
          <AttrEllipse cx={DA_NM.x} cy={DA_NM.y} label="שם רופא"          active={directly('doctor', active)} />
          <AttrEllipse cx={PA_PK.x} cy={PA_PK.y} label="מספר ת.ז."  isPK active={directly('patient', active)} />
          <AttrEllipse cx={PA_NM.x} cy={PA_NM.y} label="שם מטופל"         active={directly('patient', active)} />
          <AttrEllipse cx={PA_PH.x} cy={PA_PH.y} label="מספר טלפון"       active={directly('patient', active)} />
          <AttrEllipse cx={AA_PK.x} cy={AA_PK.y} label="מספר תור"   isPK active={directly('appointment', active)} />
          <AttrEllipse cx={AA_DT.x} cy={AA_DT.y} label="תאריך ושעה"       active={directly('appointment', active)} />
          <AttrEllipse cx={AA_RS.x} cy={AA_RS.y} label="סיבת ביקור"       active={directly('appointment', active)} />

          {/* FK micro-labels (tucked under appointment, near attribute lines) */}
          <text x={575} y={425} fontSize={9} fill="#94a3b8" fontFamily={FONT} textAnchor="middle">FK: מספר רישיון</text>
          <text x={415} y={425} fontSize={9} fill="#94a3b8" fontFamily={FONT} textAnchor="middle">FK: מספר ת.ז.</text>
        </svg>
      </div>

      {/* Info panel */}
      {selected && <InfoPanel nodeId={selected} onClose={() => setSelected(null)} />}

      {/* Cardinality summary table — always visible */}
      <div style={{
        background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
        padding: '0.85rem 1.25rem', marginTop: '1rem',
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.6rem' }}>
          📊 סיכום קרדינליות
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', direction: 'rtl' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>קשר</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>צד שמאל</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>(min,max)</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>יחס</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>(min,max)</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>צד ימין</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0.55rem', color: C.relation, fontWeight: 700 }}>מקבל ◇</td>
                <td style={{ padding: '0.55rem', textAlign: 'center', color: C.entity, fontWeight: 600 }}>רופא</td>
                <td style={{ padding: '0.55rem', textAlign: 'center' }}>
                  <span style={{ background: '#1e293b', color: '#fff', borderRadius: '5px', padding: '0.1rem 0.45rem', fontWeight: 700 }}>(0,N)</span>
                </td>
                <td style={{ padding: '0.55rem', textAlign: 'center' }}>
                  <span style={{ background: C.relationHl, color: '#fff', borderRadius: '999px', padding: '0.15rem 0.65rem', fontWeight: 800 }}>1 : N</span>
                </td>
                <td style={{ padding: '0.55rem', textAlign: 'center' }}>
                  <span style={{ background: C.entityHl, color: '#fff', borderRadius: '5px', padding: '0.1rem 0.45rem', fontWeight: 700 }}>(1,1)</span>
                </td>
                <td style={{ padding: '0.55rem', textAlign: 'center', color: C.entity, fontWeight: 600 }}>תור</td>
              </tr>
              <tr style={{ background: '#fafafa' }}>
                <td style={{ padding: '0.55rem', color: C.relation, fontWeight: 700 }}>קובע ◇</td>
                <td style={{ padding: '0.55rem', textAlign: 'center', color: C.entity, fontWeight: 600 }}>מטופל</td>
                <td style={{ padding: '0.55rem', textAlign: 'center' }}>
                  <span style={{ background: '#1e293b', color: '#fff', borderRadius: '5px', padding: '0.1rem 0.45rem', fontWeight: 700 }}>(0,N)</span>
                </td>
                <td style={{ padding: '0.55rem', textAlign: 'center' }}>
                  <span style={{ background: C.relationHl, color: '#fff', borderRadius: '999px', padding: '0.15rem 0.65rem', fontWeight: 800 }}>1 : N</span>
                </td>
                <td style={{ padding: '0.55rem', textAlign: 'center' }}>
                  <span style={{ background: C.entityHl, color: '#fff', borderRadius: '5px', padding: '0.1rem 0.45rem', fontWeight: 700 }}>(1,1)</span>
                </td>
                <td style={{ padding: '0.55rem', textAlign: 'center', color: C.entity, fontWeight: 600 }}>תור</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
        padding: '0.85rem 1.25rem', marginTop: '1rem',
        display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#475569' }}>מקרא:</span>
        <LegendItem shape="rect"    color={C.entity}   bg={C.entityBg}   label="ישות (Entity)" />
        <LegendItem shape="diamond" color={C.relation} bg={C.relationBg} label="קשר (Relationship)" />
        <LegendItem shape="ellipse" color={C.attr}     bg={C.attrBg}     label="תכונה (Attribute)" />
        <LegendItem shape="ellipse" color={C.pk}       bg={C.pkBg}       label="מפתח ראשי (PK)" isPK />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: 22, height: 22, border: `2px solid ${C.entity}`, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', color: C.entity }}>1</span>
          <span style={{ width: 22, height: 22, border: `2px solid ${C.entity}`, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', color: C.entity }}>N</span>
          <span style={{ color: '#475569', fontSize: '0.82rem' }}>יחס Chen (1 : N)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ background: '#1e293b', color: '#fff', borderRadius: '5px', padding: '0.1rem 0.45rem', fontSize: '0.75rem', fontWeight: 700 }}>(0,N)</span>
          <span style={{ background: C.entityHl, color: '#fff', borderRadius: '5px', padding: '0.1rem 0.45rem', fontSize: '0.75rem', fontWeight: 700 }}>(1,1)</span>
          <span style={{ color: '#475569', fontSize: '0.82rem' }}>קרדינליות (min,max)</span>
        </div>
      </div>

      <style>{`
        @keyframes erdFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}
