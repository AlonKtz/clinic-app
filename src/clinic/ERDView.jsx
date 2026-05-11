import { useState, useRef } from 'react';

const C = {
  entity:     '#AA0000', entityBg:   '#FFF0F0',
  relation:   '#6d28d9', relationBg: '#EDE9FE',
  attr:       '#0f766e', attrBg:     '#F0FDFA',
  pk:         '#B91C1C', pkBg:       '#FEF2F2',
  line:       '#CBD5E1', mainLine:   '#9B2020',
};
const FONT = "'Segoe UI', Arial, sans-serif";

/* ── Entity rectangle (with field count) ── */
function Entity({ cx, cy, label, fieldCount, w = 155, h = 62 }) {
  return (
    <g>
      <rect x={cx - w/2} y={cy - h/2} width={w} height={h} rx={5}
        fill={C.entityBg} stroke={C.entity} strokeWidth={2.5}
        style={{ filter: 'drop-shadow(0 2px 6px rgba(170,0,0,0.12))' }} />
      <text x={cx} y={cy - 9} textAnchor="middle" dominantBaseline="middle"
        fontSize={16} fontWeight="700" fill={C.entity} fontFamily={FONT}>
        {label}
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle"
        fontSize={10} fill="#9CA3AF" fontFamily={FONT}>
        ({fieldCount} שדות)
      </text>
    </g>
  );
}

/* ── Relationship diamond ── */
function Relation({ cx, cy, label, hw = 66, hh = 40 }) {
  const pts = `${cx},${cy-hh} ${cx+hw},${cy} ${cx},${cy+hh} ${cx-hw},${cy}`;
  return (
    <g>
      <polygon points={pts} fill={C.relationBg} stroke={C.relation} strokeWidth={2.5}
        style={{ filter: 'drop-shadow(0 2px 6px rgba(109,40,217,0.12))' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight="700" fill={C.relation} fontFamily={FONT}>
        {label}
      </text>
    </g>
  );
}

/* ── Attribute ellipse ── */
function Attr({ cx, cy, label, isPK = false, rx = 65, ry = 22 }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
        fill={isPK ? C.pkBg : C.attrBg}
        stroke={isPK ? C.pk : C.attr}
        strokeWidth={isPK ? 2 : 1.5} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={11} fontWeight={isPK ? '700' : '400'}
        fill={isPK ? C.pk : C.attr}
        textDecoration={isPK ? 'underline' : 'none'}
        fontFamily={FONT}>
        {label}
      </text>
    </g>
  );
}

/* ── Connector line ── */
function Line({ x1, y1, x2, y2, main = false }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={main ? C.mainLine : C.line}
      strokeWidth={main ? 2 : 1.5} />
  );
}

/* ── Cardinality label (LTR forced) ── */
function Cardinality({ x, y, label }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
      fontSize={11} fontWeight="700" fill="#DC2626" fontFamily={FONT}
      direction="ltr" unicodeBidi="bidi-override">
      {label}
    </text>
  );
}

/* ── Geometry helpers ── */
const lerp    = (a, b, t) => a + t * (b - a);
const perpOff = (x1, y1, x2, y2, t, d) => {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  return {
    x: Math.round(lerp(x1, x2, t) + (-dy / len) * d),
    y: Math.round(lerp(y1, y2, t) + ( dx / len) * d),
  };
};

/* ── Cardinality legend items ── */
const CARD_LEGEND = [
  { label: '(1,1)', desc: 'בדיוק אחד',       color: '#DC2626', bg: '#FEF2F2' },
  { label: '(0,1)', desc: 'אופציונלי יחיד',   color: '#D97706', bg: '#FFFBEB' },
  { label: '(1,N)', desc: 'לפחות אחד',        color: '#059669', bg: '#ECFDF5' },
  { label: '(0,N)', desc: 'אופציונלי רבים',   color: '#6366F1', bg: '#EEF2FF' },
];

export default function ERDView() {
  /* ── Pan state ── */
  const [pan, setPan]           = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart                = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const onMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
  };
  const onMouseUp   = () => setIsPanning(false);

  /* ── Layout ── */
  const PAT  = { x: 225, y: 215 };
  const DOC  = { x: 755, y: 215 };
  const APT  = { x: 490, y: 445 };
  const INV  = { x: 358, y: 330 };
  const RECV = { x: 622, y: 330 };

  const PA_PK = { x: 80,  y: 108 };
  const PA_NM = { x: 68,  y: 215 };
  const PA_PH = { x: 80,  y: 322 };
  const DA_PK = { x: 900, y: 108 };
  const DA_NM = { x: 912, y: 215 };
  const AA_PK = { x: 490, y: 562 };
  const AA_DT = { x: 310, y: 562 };
  const AA_RS = { x: 670, y: 562 };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem', fontWeight: 700 }}>
          דיאגרמת ERD — Chen Notation
        </h2>
        <span style={{
          background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D',
          borderRadius: '8px', padding: '0.25rem 0.65rem', fontSize: '0.75rem', fontWeight: 600,
        }}>
          3 ישויות · 2 קשרים · 8 תכונות
        </span>
      </div>

      {/* Parking exclusion note */}
      <div style={{
        background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '10px',
        padding: '0.6rem 0.9rem', marginBottom: '0.85rem',
        fontSize: '0.8rem', color: '#92400E', display: 'flex', gap: '0.45rem',
      }}>
        <span>⚠️</span>
        <span>
          <strong>גורם לא רלוונטי שהוצא מהמודל:</strong> תכונת <strong>חניה</strong> —
          משאב ארגוני של המרפאה כולה, ולא מאפיין של רופא בודד.
        </span>
      </div>

      {/* ── Cardinality legend bar ── */}
      <div style={{
        display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center',
        background: 'white', borderRadius: '10px', border: '1px solid #E5E7EB',
        padding: '0.55rem 1rem', marginBottom: '0.85rem',
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginLeft: '0.25rem' }}>
          קרדינליות:
        </span>
        {CARD_LEGEND.map(({ label, desc, color, bg }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{
              background: bg, color, border: `1.5px solid ${color}`,
              borderRadius: '999px', padding: '0.1rem 0.55rem',
              fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace',
              direction: 'ltr', display: 'inline-block',
            }}>
              {label}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* SVG canvas — pannable */}
      <div
        style={{
          background: '#F9FAFB', borderRadius: '14px', border: '1px solid #E5E7EB',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab',
          userSelect: 'none', height: '520px', position: 'relative',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <svg width="980" height="610"
          style={{ display: 'block', transform: `translate(${pan.x}px, ${pan.y}px)`, transition: isPanning ? 'none' : 'transform 0.05s' }}>

          <defs>
            <pattern id="dg" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#D1D5DB" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="980" height="610" fill="url(#dg)" />

          {/* Attribute lines */}
          <Line x1={PAT.x} y1={PAT.y} x2={PA_PK.x} y2={PA_PK.y} />
          <Line x1={PAT.x} y1={PAT.y} x2={PA_NM.x} y2={PA_NM.y} />
          <Line x1={PAT.x} y1={PAT.y} x2={PA_PH.x} y2={PA_PH.y} />
          <Line x1={DOC.x} y1={DOC.y} x2={DA_PK.x} y2={DA_PK.y} />
          <Line x1={DOC.x} y1={DOC.y} x2={DA_NM.x} y2={DA_NM.y} />
          <Line x1={APT.x} y1={APT.y} x2={AA_PK.x} y2={AA_PK.y} />
          <Line x1={APT.x} y1={APT.y} x2={AA_DT.x} y2={AA_DT.y} />
          <Line x1={APT.x} y1={APT.y} x2={AA_RS.x} y2={AA_RS.y} />

          {/* Relationship lines */}
          <Line x1={PAT.x}  y1={PAT.y}  x2={INV.x}  y2={INV.y}  main />
          <Line x1={INV.x}  y1={INV.y}  x2={APT.x}  y2={APT.y}  main />
          <Line x1={DOC.x}  y1={DOC.y}  x2={RECV.x} y2={RECV.y} main />
          <Line x1={RECV.x} y1={RECV.y} x2={APT.x}  y2={APT.y}  main />

          {/* Cardinality */}
          {(() => { const p = perpOff(PAT.x,PAT.y,   INV.x,INV.y,   0.22, +18); return <Cardinality key="c1" x={p.x} y={p.y} label="(0,N)" />; })()}
          {(() => { const p = perpOff(INV.x,INV.y,   APT.x,APT.y,   0.48, +18); return <Cardinality key="c2" x={p.x} y={p.y} label="(1,1)" />; })()}
          {(() => { const p = perpOff(DOC.x,DOC.y,   RECV.x,RECV.y, 0.22, -18); return <Cardinality key="c3" x={p.x} y={p.y} label="(0,N)" />; })()}
          {(() => { const p = perpOff(RECV.x,RECV.y, APT.x,APT.y,   0.48, -18); return <Cardinality key="c4" x={p.x} y={p.y} label="(1,1)" />; })()}

          {/* Entities */}
          <Entity cx={PAT.x} cy={PAT.y} label="מטופל" fieldCount={3} />
          <Entity cx={DOC.x} cy={DOC.y} label="רופא"  fieldCount={2} />
          <Entity cx={APT.x} cy={APT.y} label="תור"   fieldCount={3} w={165} />

          {/* Relationships */}
          <Relation cx={INV.x}  cy={INV.y}  label="מזמין" />
          <Relation cx={RECV.x} cy={RECV.y} label="מקבל" />

          {/* Attributes */}
          <Attr cx={PA_PK.x} cy={PA_PK.y} label="מספר ת.ז."    isPK />
          <Attr cx={PA_NM.x} cy={PA_NM.y} label="שם מטופל" />
          <Attr cx={PA_PH.x} cy={PA_PH.y} label="מספר טלפון" />
          <Attr cx={DA_PK.x} cy={DA_PK.y} label="מספר רישיון"  isPK />
          <Attr cx={DA_NM.x} cy={DA_NM.y} label="שם רופא" />
          <Attr cx={AA_PK.x} cy={AA_PK.y} label="מספר תור"     isPK />
          <Attr cx={AA_DT.x} cy={AA_DT.y} label="תאריך ושעה" />
          <Attr cx={AA_RS.x} cy={AA_RS.y} label="סיבת ביקור" />

          {/* Pan hint */}
          <text x={490} y={24} textAnchor="middle" fontSize={10.5} fill="#9CA3AF" fontFamily={FONT}>
            גרור להזזה · מפתח ראשי (PK) מסומן בקו תחתון
          </text>
        </svg>
      </div>

      {/* Shape legend */}
      <div style={{
        display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center',
        background: 'white', borderRadius: '10px', border: '1px solid #E5E7EB',
        padding: '0.7rem 1rem', marginTop: '0.85rem', fontSize: '0.8rem', color: '#475569',
      }}>
        <span style={{ fontWeight: 700 }}>מקרא:</span>
        {[
          { shape: 'rect',    color: C.entity,   bg: C.entityBg,   label: 'ישות' },
          { shape: 'diamond', color: C.relation, bg: C.relationBg, label: 'קשר' },
          { shape: 'ellipse', color: C.attr,     bg: C.attrBg,     label: 'תכונה' },
          { shape: 'ellipse', color: C.pk,       bg: C.pkBg,       label: 'מפתח ראשי (PK)', isPK: true },
        ].map(({ shape, color, bg, label, isPK }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width={34} height={24}>
              {shape === 'rect'    && <rect    x={1}  y={4} width={32} height={16} rx={3} fill={bg} stroke={color} strokeWidth={2} />}
              {shape === 'diamond' && <polygon points="17,1 33,12 17,23 1,12"      fill={bg} stroke={color} strokeWidth={2} />}
              {shape === 'ellipse' && <ellipse cx={17} cy={12} rx={16} ry={10}     fill={bg} stroke={color} strokeWidth={isPK ? 2 : 1.5} />}
            </svg>
            <span style={{ textDecoration: isPK ? 'underline' : 'none' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
