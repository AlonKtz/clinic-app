import { useState } from 'react';
import { colors } from './styles';

/* ── Palette ────────────────────────────────────────────────────── */
const C = {
  entity: '#AA0000', entityBg: '#FFF0F0',
  entityHl: '#CC0000', entityHlBg: '#FFD8D8',
  relation: '#6d28d9', relationBg: '#EDE9FE',
  relationHl: '#5b21b6', relationHlBg: '#DDD6FE',
  attr: '#0f766e', attrBg: '#F0FDFA',
  pk: '#B91C1C', pkBg: '#FEF2F2',
  line: '#CBD5E1', mainLine: '#9B2020',
  lineHl: '#94A3B8', mainLineHl: '#CC0000',
};
const FONT = "'Segoe UI', Arial, sans-serif";

/* ── Highlight graph ─────────────────────────────────────────────── */
const RELATED = {
  doctor:      ['recv', 'appointment'],
  patient:     ['book', 'appointment'],
  appointment: ['recv', 'book', 'doctor', 'patient'],
  recv:        ['doctor', 'appointment'],
  book:        ['patient', 'appointment'],
};
const hl       = (node, active) => !!active && (active === node || !!RELATED[active]?.includes(node));
const directly = (node, active) => active === node;

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

/* ── SVG Primitives ─────────────────────────────────────────────── */

function EntityRect({ cx, cy, label, w = 164, h = 54, active, ...events }) {
  return (
    <g style={{ cursor: 'pointer' }} {...events}>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h}
        fill={active ? C.entityHlBg : C.entityBg}
        stroke={active ? C.entityHl : C.entity}
        strokeWidth={active ? 3.5 : 2.5} rx={7}
        style={{
          filter: active
            ? 'drop-shadow(0 2px 12px rgba(204,0,0,0.30))'
            : 'drop-shadow(0 1px 4px rgba(0,0,0,0.09))',
          transition: 'all 0.2s',
        }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={17} fontWeight="700"
        fill={active ? C.entityHl : C.entity} fontFamily={FONT}>{label}</text>
    </g>
  );
}

/* Diamond shows relationship name + "1:N" ratio inside */
function RelDiamond({ cx, cy, label, ratio = '1 : N', hw = 72, hh = 46, active, ...events }) {
  const pts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
  const stroke = active ? C.relationHl : C.relation;
  const fill   = active ? C.relationHlBg : C.relationBg;
  return (
    <g style={{ cursor: 'pointer' }} {...events}>
      <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={active ? 3 : 2.5}
        style={{
          filter: active
            ? 'drop-shadow(0 2px 10px rgba(91,33,182,0.30))'
            : 'drop-shadow(0 1px 3px rgba(0,0,0,0.07))',
          transition: 'all 0.2s',
        }} />
      <text x={cx} y={cy - 9} textAnchor="middle" dominantBaseline="middle"
        fontSize={14} fontWeight="700"
        fill={active ? C.relationHl : C.relation} fontFamily={FONT}>{label}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle"
        fontSize={10.5} fontWeight="600" opacity={0.8}
        fill={active ? C.relationHl : '#7C3AED'} fontFamily={FONT}>{ratio}</text>
    </g>
  );
}

function AttrEllipse({ cx, cy, label, isPK = false, rx = 68, ry = 23, active }) {
  const stroke = isPK ? C.pk : C.attr;
  const fill   = active ? (isPK ? '#fecaca' : '#99f6e4') : (isPK ? C.pkBg : C.attrBg);
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
        fill={fill} stroke={stroke}
        strokeWidth={active ? 2.5 : (isPK ? 2 : 1.5)}
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.06))', transition: 'all 0.2s' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={11.5} fill={isPK ? C.pk : C.attr}
        fontWeight={isPK ? '700' : '400'}
        textDecoration={isPK ? 'underline' : 'none'}
        fontFamily={FONT}>{label}</text>
    </g>
  );
}

function ConnLine({ x1, y1, x2, y2, main = false, active }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={active ? (main ? C.mainLineHl : C.lineHl) : (main ? C.mainLine : C.line)}
      strokeWidth={active ? (main ? 3.5 : 2) : (main ? 2 : 1.5)}
      style={{ transition: 'all 0.2s' }} />
  );
}

/* Clean cardinality badge — sits directly on the line, no leader */
function CardinalityBadge({ x, y, label, entityName, color = '#1E293B', active }) {
  const w = 66, h = 40;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={9}
        fill="white" stroke={color} strokeWidth={active ? 2.2 : 1.6}
        style={{
          filter: active
            ? `drop-shadow(0 0 6px ${color}44)`
            : 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))',
          transition: 'all 0.2s',
        }} />
      <text x={x} y={y - 8} textAnchor="middle" dominantBaseline="middle"
        fontSize={9.5} fontWeight="600" fill="#64748B" fontFamily={FONT}>
        {entityName}
      </text>
      <text x={x} y={y + 9} textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight="800" fill={color} fontFamily={FONT}>
        {label}
      </text>
    </g>
  );
}

/* ── Legend item ────────────────────────────────────────────────── */
function LegendItem({ shape, color, bg, label, isPK }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
      <svg width={36} height={26}>
        {shape === 'rect'    && <rect x={2} y={5} width={32} height={16} rx={3} fill={bg} stroke={color} strokeWidth={2} />}
        {shape === 'diamond' && <polygon points="18,2 34,13 18,24 2,13" fill={bg} stroke={color} strokeWidth={2} />}
        {shape === 'ellipse' && <ellipse cx={18} cy={13} rx={16} ry={10} fill={bg} stroke={color} strokeWidth={isPK ? 2 : 1.5} />}
      </svg>
      <span style={{ color: '#475569', fontSize: '0.81rem' }}>
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
        position: 'absolute', top: '0.65rem', left: '0.8rem',
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '1rem', color: '#94a3b8', lineHeight: 1,
      }} title="סגור">✕</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', paddingLeft: '1.8rem' }}>
        <span style={{ fontSize: '1.6rem' }}>{info.icon}</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: info.color, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {info.title}
            {info.ratio && (
              <span style={{
                background: C.relationHl, color: '#fff',
                padding: '0.15rem 0.6rem', borderRadius: '999px',
                fontSize: '0.75rem', fontWeight: 800,
              }}>{info.ratio}</span>
            )}
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>{info.body}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
        {info.attrs && (
          <div style={{ flex: '1 1 220px' }}>
            <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#475569', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>תכונות</div>
            {info.attrs.map(a => (
              <div key={a.name} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.32rem' }}>
                <span style={{
                  background: a.isPK ? C.pkBg : C.attrBg,
                  color: a.isPK ? C.pk : C.attr,
                  border: `1px solid ${a.isPK ? C.pk : C.attr}`,
                  borderRadius: '4px', padding: '0.1rem 0.45rem',
                  fontSize: '0.77rem', fontWeight: a.isPK ? 700 : 400,
                  textDecoration: a.isPK ? 'underline' : 'none', whiteSpace: 'nowrap',
                }}>{a.name}</span>
                <span style={{ fontSize: '0.77rem', color: '#64748b' }}>{a.desc}</span>
              </div>
            ))}
          </div>
        )}
        {info.fks && (
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#475569', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>מפתחות זרים</div>
            {info.fks.map(fk => (
              <div key={fk} style={{ fontSize: '0.8rem', color: '#0f766e', marginBottom: '0.25rem' }}>🔑 {fk}</div>
            ))}
          </div>
        )}
        {info.cardinality && (
          <div style={{ flex: '1 1 280px' }}>
            <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#475569', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>קרדינליות (min,max)</div>
            {info.cardinality.map(c => (
              <div key={c.side} style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{
                  background: '#1e293b', color: '#fff',
                  borderRadius: '5px', padding: '0.1rem 0.45rem',
                  fontSize: '0.77rem', fontWeight: 700, whiteSpace: 'nowrap',
                }}>{c.notation}</span>
                <span style={{ fontSize: '0.77rem', color: '#64748b' }}>
                  <strong style={{ color: '#334155' }}>{c.side}:</strong> {c.meaning}
                </span>
              </div>
            ))}
          </div>
        )}
        {info.note && (
          <div style={{ flex: '1 1 100%', fontSize: '0.77rem', color: '#64748b', borderTop: `1px solid ${info.color}40`, paddingTop: '0.5rem', marginTop: '0.15rem' }}>
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

  /* ── Entity / relation positions ── */
  const PAT  = { x: 215, y: 195 };
  const DOC  = { x: 885, y: 195 };
  const APT  = { x: 550, y: 460 };
  const BOOK = { x: 368, y: 316 };
  const RECV = { x: 732, y: 316 };

  /* ── Attribute positions ── */
  const PA_PK = { x: 75,   y:  98 };
  const PA_NM = { x: 58,   y: 195 };   // rx=68 → left edge = -10, clipped — pull right
  const PA_PH = { x: 75,   y: 292 };
  const DA_PK = { x: 1025, y:  98 };
  const DA_NM = { x: 1042, y: 195 };
  const AA_PK = { x: 550,  y: 572 };
  const AA_DT = { x: 358,  y: 572 };
  const AA_RS = { x: 742,  y: 572 };

  /* ── Cardinality badge positions (manually placed on each line) ── */
  /* Near-entity badges sit roughly 35% along the entity→diamond segment.
     Near-appointment badges sit roughly 62% along the diamond→appointment segment. */
  const CARD_PAT       = { x: 277, y: 238 };   // PAT side of קובע
  const CARD_APT_BOOK  = { x: 464, y: 406 };   // APT side of קובע
  const CARD_DOC       = { x: 823, y: 238 };   // DOC side of מקבל
  const CARD_APT_RECV  = { x: 636, y: 406 };   // APT side of מקבל

  return (
    <div>
      {/* ── Header ── */}
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
            }}>לחץ לפרטים</span>
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
        padding: '0.65rem 1rem', marginBottom: '1rem',
        fontSize: '0.81rem', color: '#92400e',
        display: 'flex', gap: '0.5rem',
      }}>
        <span style={{ flexShrink: 0 }}>ℹ️</span>
        <span>
          <strong>הערה — כלל "גורמים לא רלוונטיים":</strong> תכונת <strong>חניה</strong> הוסרה מהמודל —
          היא מאפיין של הארגון, לא של רופא בודד.
        </span>
      </div>

      {/* ── SVG canvas ── */}
      <div style={{
        background: '#f8faff', borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '0.75rem',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        userSelect: 'none', overflowX: 'auto',
      }}>
        <svg viewBox="0 0 1100 640" style={{ width: '100%', minWidth: '820px', display: 'block' }}>

          {/* Subtle dot-grid background */}
          <defs>
            <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#CBD5E1" opacity="0.45" />
            </pattern>
          </defs>
          <rect width="1100" height="640" fill="url(#dot-grid)" />

          {/* Hint text */}
          <text x={550} y={24} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily={FONT}>
            ✦ רחף מעל ישות / קשר לסימון · לחץ לפרטים
          </text>

          {/* ── Attribute lines (drawn first, behind everything) ── */}
          <ConnLine x1={PAT.x} y1={PAT.y} x2={PA_PK.x} y2={PA_PK.y} active={directly('patient', active)} />
          <ConnLine x1={PAT.x} y1={PAT.y} x2={PA_NM.x} y2={PA_NM.y} active={directly('patient', active)} />
          <ConnLine x1={PAT.x} y1={PAT.y} x2={PA_PH.x} y2={PA_PH.y} active={directly('patient', active)} />
          <ConnLine x1={DOC.x} y1={DOC.y} x2={DA_PK.x} y2={DA_PK.y} active={directly('doctor', active)} />
          <ConnLine x1={DOC.x} y1={DOC.y} x2={DA_NM.x} y2={DA_NM.y} active={directly('doctor', active)} />
          <ConnLine x1={APT.x} y1={APT.y} x2={AA_PK.x} y2={AA_PK.y} active={directly('appointment', active)} />
          <ConnLine x1={APT.x} y1={APT.y} x2={AA_DT.x} y2={AA_DT.y} active={directly('appointment', active)} />
          <ConnLine x1={APT.x} y1={APT.y} x2={AA_RS.x} y2={AA_RS.y} active={directly('appointment', active)} />

          {/* ── Main relationship lines ── */}
          <ConnLine x1={PAT.x}  y1={PAT.y}  x2={BOOK.x} y2={BOOK.y} main active={hl('book', active)} />
          <ConnLine x1={BOOK.x} y1={BOOK.y} x2={APT.x}  y2={APT.y}  main active={hl('book', active)} />
          <ConnLine x1={DOC.x}  y1={DOC.y}  x2={RECV.x} y2={RECV.y} main active={hl('recv', active)} />
          <ConnLine x1={RECV.x} y1={RECV.y} x2={APT.x}  y2={APT.y}  main active={hl('recv', active)} />

          {/* ── Cardinality badges (drawn before entities/diamonds so they appear under them) ── */}
          <CardinalityBadge x={CARD_PAT.x}      y={CARD_PAT.y}      label="(0,N)" entityName="מטופל" color="#1E293B" active={hl('book', active)} />
          <CardinalityBadge x={CARD_APT_BOOK.x} y={CARD_APT_BOOK.y} label="(1,1)" entityName="תור"   color={C.entityHl} active={hl('book', active)} />
          <CardinalityBadge x={CARD_DOC.x}      y={CARD_DOC.y}      label="(0,N)" entityName="רופא"  color="#1E293B" active={hl('recv', active)} />
          <CardinalityBadge x={CARD_APT_RECV.x} y={CARD_APT_RECV.y} label="(1,1)" entityName="תור"   color={C.entityHl} active={hl('recv', active)} />

          {/* ── Entities ── */}
          <EntityRect cx={PAT.x} cy={PAT.y} label="מטופל"  active={hl('patient', active)}     {...ev('patient')} />
          <EntityRect cx={DOC.x} cy={DOC.y} label="רופא"   active={hl('doctor', active)}      {...ev('doctor')} />
          <EntityRect cx={APT.x} cy={APT.y} label="תור" w={190} active={hl('appointment', active)} {...ev('appointment')} />

          {/* ── Relationships (ratio text inside diamond) ── */}
          <RelDiamond cx={BOOK.x} cy={BOOK.y} label="קובע"  ratio="1 : N" active={hl('book', active)} {...ev('book')} />
          <RelDiamond cx={RECV.x} cy={RECV.y} label="מקבל" ratio="1 : N" active={hl('recv', active)} {...ev('recv')} />

          {/* ── Attributes ── */}
          <AttrEllipse cx={PA_PK.x} cy={PA_PK.y} label="מספר ת.ז."    isPK active={directly('patient', active)} />
          <AttrEllipse cx={PA_NM.x} cy={PA_NM.y} label="שם מטופל"          active={directly('patient', active)} />
          <AttrEllipse cx={PA_PH.x} cy={PA_PH.y} label="מספר טלפון"        active={directly('patient', active)} />
          <AttrEllipse cx={DA_PK.x} cy={DA_PK.y} label="מספר רישיון"  isPK active={directly('doctor', active)} />
          <AttrEllipse cx={DA_NM.x} cy={DA_NM.y} label="שם רופא"           active={directly('doctor', active)} />
          <AttrEllipse cx={AA_PK.x} cy={AA_PK.y} label="מספר תור"    isPK active={directly('appointment', active)} />
          <AttrEllipse cx={AA_DT.x} cy={AA_DT.y} label="תאריך ושעה"        active={directly('appointment', active)} />
          <AttrEllipse cx={AA_RS.x} cy={AA_RS.y} label="סיבת ביקור"        active={directly('appointment', active)} />
        </svg>
      </div>

      {/* ── Info panel ── */}
      {selected && <InfoPanel nodeId={selected} onClose={() => setSelected(null)} />}

      {/* ── Cardinality summary table ── */}
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
              <tr style={{ background: '#f8fafc' }}>
                {['קשר','צד שמאל','(min,max) שמאל','יחס','(min,max) ימין','צד ימין'].map((h, i) => (
                  <th key={i} style={{ padding: '0.5rem 0.75rem', textAlign: i === 0 ? 'right' : 'center', color: '#475569', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>
                    {h.replace(' שמאל','').replace(' ימין','')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { rel: 'מקבל ◇', left: 'רופא',   leftCard: '(0,N)', ratio: '1 : N', rightCard: '(1,1)', right: 'תור', shade: false },
                { rel: 'קובע ◇',  left: 'מטופל',  leftCard: '(0,N)', ratio: '1 : N', rightCard: '(1,1)', right: 'תור', shade: true  },
              ].map(row => (
                <tr key={row.rel} style={{ background: row.shade ? '#fafafa' : 'white' }}>
                  <td style={{ padding: '0.55rem 0.75rem', color: C.relation, fontWeight: 700 }}>{row.rel}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', color: C.entity, fontWeight: 600 }}>{row.left}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>
                    <span style={{ background: '#1e293b', color: '#fff', borderRadius: '5px', padding: '0.1rem 0.45rem', fontWeight: 700 }}>{row.leftCard}</span>
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>
                    <span style={{ background: C.relationHl, color: '#fff', borderRadius: '999px', padding: '0.15rem 0.65rem', fontWeight: 800 }}>{row.ratio}</span>
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>
                    <span style={{ background: C.entityHl, color: '#fff', borderRadius: '5px', padding: '0.1rem 0.45rem', fontWeight: 700 }}>{row.rightCard}</span>
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', color: C.entity, fontWeight: 600 }}>{row.right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{
        background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
        padding: '0.85rem 1.25rem', marginTop: '1rem',
        display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.81rem', color: '#475569' }}>מקרא:</span>
        <LegendItem shape="rect"    color={C.entity}   bg={C.entityBg}   label="ישות (Entity)" />
        <LegendItem shape="diamond" color={C.relation} bg={C.relationBg} label="קשר (Relationship)" />
        <LegendItem shape="ellipse" color={C.attr}     bg={C.attrBg}     label="תכונה (Attribute)" />
        <LegendItem shape="ellipse" color={C.pk}       bg={C.pkBg}       label="מפתח ראשי (PK)" isPK />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            background: '#1e293b', color: '#fff',
            borderRadius: '5px', padding: '0.1rem 0.45rem',
            fontSize: '0.75rem', fontWeight: 700,
          }}>(0,N)</span>
          <span style={{
            background: C.entityHl, color: '#fff',
            borderRadius: '5px', padding: '0.1rem 0.45rem',
            fontSize: '0.75rem', fontWeight: 700,
          }}>(1,1)</span>
          <span style={{ color: '#475569', fontSize: '0.81rem' }}>קרדינליות (min,max)</span>
        </div>
      </div>

      <style>{`
        @keyframes erdFadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
