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

/** true  → element `node` should be visually highlighted */
const hl = (node, active) =>
  !!active && (active === node || !!RELATED[active]?.includes(node));

/** true  → only when this exact element is selected/hovered */
const directly = (node, active) => active === node;

/* ── Info data for the panel ─────────────────────────────────── */
const INFO = {
  doctor: {
    icon: '👨‍⚕️', title: 'ישות: רופא', type: 'entity',
    color: C.entity, bg: C.entityBg,
    body: 'ישות המייצגת רופא הפועל במרפאה. מזוהה ע"י מספר רישיון ייחודי.',
    attrs: [
      { name: 'מספר רישיון', isPK: true,  desc: 'מפתח ראשי — מזהה ייחודי' },
      { name: 'שם רופא',     isPK: false, desc: 'שם מלא כפי שמופיע ברישיון' },
    ],
    note: 'קשר 1:N עם תור — רופא אחד יכול לקבל תורים רבים',
  },
  patient: {
    icon: '🧑', title: 'ישות: מטופל', type: 'entity',
    color: C.entity, bg: C.entityBg,
    body: 'ישות המייצגת מטופל הנרשם לתורים במרפאה.',
    attrs: [
      { name: 'מספר ת.ז.',    isPK: true,  desc: 'מפתח ראשי — תעודת זהות' },
      { name: 'שם מטופל',    isPK: false, desc: 'שם מלא של המטופל' },
      { name: 'מספר טלפון',  isPK: false, desc: 'מספר טלפון ליצירת קשר' },
    ],
    note: 'קשר 1:N עם תור — מטופל אחד יכול לקבוע תורים רבים',
  },
  appointment: {
    icon: '📅', title: 'ישות: תור', type: 'entity',
    color: C.entity, bg: C.entityBg,
    body: 'ישות חלשה המייצגת תור — חיבור בין מטופל לרופא במועד מסוים.',
    attrs: [
      { name: 'מספר תור',    isPK: true,  desc: 'מפתח ראשי (auto-increment)' },
      { name: 'תאריך ושעה', isPK: false, desc: 'TIMESTAMPTZ — מועד התור' },
      { name: 'סיבת ביקור', isPK: false, desc: 'תיאור חופשי של הביקור' },
    ],
    fks: ['מספר רישיון → רופא (FK)', 'מספר ת.ז. → מטופל (FK)'],
    note: 'N:1 עם רופא · N:1 עם מטופל',
  },
  recv: {
    icon: '🔗', title: 'קשר: מקבל', type: 'relation',
    color: C.relation, bg: C.relationBg,
    body: 'קשר בין "רופא" ל"תור" — רופא מקבל מטופלים לתורים.',
    cardinality: [
      { side: 'רופא',  notation: '(0,N)', meaning: 'רופא יכול להשתתף בין אפס לתורים רבים' },
      { side: 'תור',   notation: '(1,1)', meaning: 'כל תור שייך לבדיוק רופא אחד' },
    ],
  },
  book: {
    icon: '📋', title: 'קשר: קובע', type: 'relation',
    color: C.relation, bg: C.relationBg,
    body: 'קשר בין "מטופל" ל"תור" — מטופל קובע תורים.',
    cardinality: [
      { side: 'מטופל', notation: '(0,N)', meaning: 'מטופל יכול לקבוע בין אפס לתורים רבים' },
      { side: 'תור',   notation: '(1,1)', meaning: 'כל תור שייך לבדיוק מטופל אחד' },
    ],
  },
};

/* ── SVG primitives ──────────────────────────────────────────────── */

function EntityRect({ cx, cy, label, w = 160, h = 48, active, ...events }) {
  return (
    <g style={{ cursor: 'pointer' }} {...events}>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h}
        fill={active ? C.entityHlBg : C.entityBg}
        stroke={active ? C.entityHl : C.entity}
        strokeWidth={active ? 3.5 : 2.5} rx={4}
        style={{ filter: active ? 'drop-shadow(0 0 8px rgba(204,0,0,0.45))' : 'none', transition: 'all 0.18s' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={15} fontWeight="bold"
        fill={active ? C.entityHl : C.entity} fontFamily={FONT}>{label}</text>
    </g>
  );
}

function RelDiamond({ cx, cy, label, hw = 58, hh = 33, active, ...events }) {
  const pts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
  return (
    <g style={{ cursor: 'pointer' }} {...events}>
      <polygon points={pts}
        fill={active ? C.relationHlBg : C.relationBg}
        stroke={active ? C.relationHl : C.relation}
        strokeWidth={active ? 3 : 2.5}
        style={{ filter: active ? 'drop-shadow(0 0 8px rgba(109,40,217,0.4))' : 'none', transition: 'all 0.18s' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight="bold"
        fill={active ? C.relationHl : C.relation} fontFamily={FONT}>{label}</text>
    </g>
  );
}

function AttrEllipse({ cx, cy, label, isPK = false, rx = 64, ry = 21, active }) {
  const stroke = isPK ? C.pk : C.attr;
  const fill   = active
    ? (isPK ? '#fecaca' : '#99f6e4')
    : (isPK ? C.pkBg   : C.attrBg);
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

/** Styled cardinality badge — dark pill for the (min,max) label */
function CardBadge({ x, y, label, accent = false }) {
  const len = label.length;
  const w   = len <= 1 ? 22 : len <= 3 ? 30 : 46;
  const bg  = accent ? C.entityHl : '#1e293b';
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={x - w / 2} y={y - 11} width={w} height={22} rx={5} fill={bg} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
        fontSize={11} fontWeight="bold" fill="#fff" fontFamily={FONT}>{label}</text>
    </g>
  );
}

/* ── Legend item ─────────────────────────────────────────────────── */
function LegendItem({ shape, color, bg, label, isPK }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg width={38} height={26}>
        {shape === 'rect' && <rect x={3} y={5} width={32} height={16} rx={2} fill={bg} stroke={color} strokeWidth={2} />}
        {shape === 'diamond' && <polygon points="19,2 35,13 19,24 3,13" fill={bg} stroke={color} strokeWidth={2} />}
        {shape === 'ellipse' && <ellipse cx={19} cy={13} rx={16} ry={10} fill={bg} stroke={color} strokeWidth={isPK ? 2 : 1.5} />}
      </svg>
      <span style={{ color: '#475569', fontSize: '0.82rem' }}>
        {isPK ? <u>{label}</u> : label}
      </span>
    </div>
  );
}

/* ── Info panel ──────────────────────────────────────────────────── */
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
      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: '0.6rem', left: '0.75rem',
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '1rem', color: '#94a3b8', lineHeight: 1,
      }} title="סגור">✕</button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', paddingLeft: '1.8rem' }}>
        <span style={{ fontSize: '1.6rem' }}>{info.icon}</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: info.color }}>{info.title}</h3>
          <p  style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{info.body}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>

        {/* Attributes */}
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

        {/* FKs */}
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

        {/* Cardinality */}
        {info.cardinality && (
          <div style={{ flex: '1 1 260px' }}>
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

        {/* Note */}
        {info.note && (
          <div style={{ flex: '1 1 100%', fontSize: '0.78rem', color: '#64748b', borderTop: `1px solid ${info.color}40`, paddingTop: '0.5rem', marginTop: '0.2rem' }}>
            ℹ️ {info.note}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export default function ERDView() {
  const [hovered,  setHovered]  = useState(null);
  const [selected, setSelected] = useState(null);

  const active = hovered ?? selected;

  /** event handlers for a node */
  const ev = (node) => ({
    onMouseEnter: () => setHovered(node),
    onMouseLeave: () => setHovered(null),
    onClick:      () => setSelected(s => s === node ? null : node),
  });

  /* ── Layout coordinates ── */
  const DOC  = { x: 710, y: 205 };
  const PAT  = { x: 270, y: 205 };
  const APT  = { x: 490, y: 420 };
  const RECV = { x: 610, y: 320 };
  const BOOK = { x: 375, y: 320 };

  const DA_PK = { x: 858, y: 115 };
  const DA_NM = { x: 858, y: 295 };
  const PA_PK = { x: 122, y: 115 };
  const PA_NM = { x:  95, y: 205 };
  const PA_PH = { x: 122, y: 295 };
  const AA_PK = { x: 490, y: 530 };
  const AA_DT = { x: 315, y: 530 };
  const AA_RS = { x: 665, y: 530 };

  /* ── Cardinality badge positions ──
     (0,N) placed ~25 % from entity toward diamond (near entity)
     (1,1) placed ~75 % from diamond toward entity (near entity) — but on the opposite side
     Standard Chen: label near the ENTITY it annotates                 */
  // Doctor side: (0,N) at 25 % Doc→RECV
  const CD_DOC  = { x: Math.round(DOC.x  + .25*(RECV.x-DOC.x)),  y: Math.round(DOC.y  + .25*(RECV.y-DOC.y))  }; // ≈ (685,234)
  // Appointment side from RECV: (1,1) at 25 % APT→RECV
  const CD_APT1 = { x: Math.round(APT.x  + .25*(RECV.x-APT.x)),  y: Math.round(APT.y  + .25*(RECV.y-APT.y))  }; // ≈ (520,395)
  // Patient side: (0,N) at 25 % PAT→BOOK
  const CD_PAT  = { x: Math.round(PAT.x  + .25*(BOOK.x-PAT.x)),  y: Math.round(PAT.y  + .25*(BOOK.y-PAT.y))  }; // ≈ (296,234)
  // Appointment side from BOOK: (1,1) at 25 % APT→BOOK
  const CD_APT2 = { x: Math.round(APT.x  + .25*(BOOK.x-APT.x)),  y: Math.round(APT.y  + .25*(BOOK.y-APT.y))  }; // ≈ (461,395)

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', fontWeight: 700 }}>
          דיאגרמת ERD — Chen Notation
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {hovered && !selected && (
            <span style={{
              background: '#1e293b', color: '#fff',
              borderRadius: '6px', padding: '0.25rem 0.7rem',
              fontSize: '0.74rem', fontWeight: 600,
              animation: 'erdFadeIn 0.15s ease',
            }}>
              לחץ לפרטים
            </span>
          )}
          <span style={{
            background: colors.primaryBg, color: colors.primary,
            borderRadius: '8px', padding: '0.3rem 0.75rem',
            fontSize: '0.78rem', fontWeight: 600,
          }}>3 ישויות · 2 קשרים · 8 תכונות</span>
        </div>
      </div>

      {/* ── Parking note ── */}
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

      {/* ── SVG canvas ── */}
      <div style={{
        background: '#fafcff', borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '1rem', overflowX: 'auto',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        userSelect: 'none',
      }}>
        <svg viewBox="0 0 990 585" style={{ width: '100%', minWidth: '740px', display: 'block' }}>

          {/* Hint */}
          <text x={495} y={28} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily={FONT}>
            ✦ רחף מעל ישות / קשר לסימון · לחץ לפרטים
          </text>

          {/* ── Attr lines (below everything) ── */}
          <ConnLine x1={DOC.x} y1={DOC.y} x2={DA_PK.x} y2={DA_PK.y} active={directly('doctor', active)} />
          <ConnLine x1={DOC.x} y1={DOC.y} x2={DA_NM.x} y2={DA_NM.y} active={directly('doctor', active)} />
          <ConnLine x1={PAT.x} y1={PAT.y} x2={PA_PK.x} y2={PA_PK.y} active={directly('patient', active)} />
          <ConnLine x1={PAT.x} y1={PAT.y} x2={PA_NM.x} y2={PA_NM.y} active={directly('patient', active)} />
          <ConnLine x1={PAT.x} y1={PAT.y} x2={PA_PH.x} y2={PA_PH.y} active={directly('patient', active)} />
          <ConnLine x1={APT.x} y1={APT.y} x2={AA_PK.x} y2={AA_PK.y} active={directly('appointment', active)} />
          <ConnLine x1={APT.x} y1={APT.y} x2={AA_DT.x} y2={AA_DT.y} active={directly('appointment', active)} />
          <ConnLine x1={APT.x} y1={APT.y} x2={AA_RS.x} y2={AA_RS.y} active={directly('appointment', active)} />

          {/* ── Main relationship lines ── */}
          <ConnLine x1={DOC.x}  y1={DOC.y}  x2={RECV.x} y2={RECV.y} main active={hl('recv', active)} />
          <ConnLine x1={RECV.x} y1={RECV.y} x2={APT.x}  y2={APT.y}  main active={hl('recv', active)} />
          <ConnLine x1={PAT.x}  y1={PAT.y}  x2={BOOK.x} y2={BOOK.y} main active={hl('book', active)} />
          <ConnLine x1={BOOK.x} y1={BOOK.y} x2={APT.x}  y2={APT.y}  main active={hl('book', active)} />

          {/* ── Cardinality badges (drawn BEFORE entities so entities sit on top) ── */}
          {/* Doctor side of מקבל → (0,N) near Doctor */}
          <CardBadge x={CD_DOC.x}  y={CD_DOC.y}  label="(0,N)" />
          {/* Appointment side of מקבל → (1,1) near Appointment */}
          <CardBadge x={CD_APT1.x} y={CD_APT1.y} label="(1,1)" accent />
          {/* Patient side of קובע → (0,N) near Patient */}
          <CardBadge x={CD_PAT.x}  y={CD_PAT.y}  label="(0,N)" />
          {/* Appointment side of קובע → (1,1) near Appointment */}
          <CardBadge x={CD_APT2.x} y={CD_APT2.y} label="(1,1)" accent />

          {/* ── Entities ── */}
          <EntityRect cx={DOC.x} cy={DOC.y} label="רופא"
            active={hl('doctor', active)} {...ev('doctor')} />
          <EntityRect cx={PAT.x} cy={PAT.y} label="מטופל"
            active={hl('patient', active)} {...ev('patient')} />
          <EntityRect cx={APT.x} cy={APT.y} label="תור" w={185}
            active={hl('appointment', active)} {...ev('appointment')} />

          {/* ── Relationships ── */}
          <RelDiamond cx={RECV.x} cy={RECV.y} label="מקבל"
            active={hl('recv', active)} {...ev('recv')} />
          <RelDiamond cx={BOOK.x} cy={BOOK.y} label="קובע"
            active={hl('book', active)} {...ev('book')} />

          {/* ── Attributes ── */}
          <AttrEllipse cx={DA_PK.x} cy={DA_PK.y} label="מספר רישיון" isPK active={directly('doctor', active)} />
          <AttrEllipse cx={DA_NM.x} cy={DA_NM.y} label="שם רופא"              active={directly('doctor', active)} />
          <AttrEllipse cx={PA_PK.x} cy={PA_PK.y} label="מספר ת.ז."  isPK active={directly('patient', active)} />
          <AttrEllipse cx={PA_NM.x} cy={PA_NM.y} label="שם מטופל"             active={directly('patient', active)} />
          <AttrEllipse cx={PA_PH.x} cy={PA_PH.y} label="מספר טלפון"           active={directly('patient', active)} />
          <AttrEllipse cx={AA_PK.x} cy={AA_PK.y} label="מספר תור"   isPK active={directly('appointment', active)} />
          <AttrEllipse cx={AA_DT.x} cy={AA_DT.y} label="תאריך ושעה"           active={directly('appointment', active)} />
          <AttrEllipse cx={AA_RS.x} cy={AA_RS.y} label="סיבת ביקור"           active={directly('appointment', active)} />

          {/* ── FK micro-labels ── */}
          <text x={568} y={408} fontSize={9} fill="#94a3b8" fontFamily={FONT} textAnchor="middle">FK: מספר רישיון</text>
          <text x={422} y={408} fontSize={9} fill="#94a3b8" fontFamily={FONT} textAnchor="middle">FK: מספר ת.ז.</text>

        </svg>
      </div>

      {/* ── Info panel ── */}
      {selected && <InfoPanel nodeId={selected} onClose={() => setSelected(null)} />}

      {/* ── Legend ── */}
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
