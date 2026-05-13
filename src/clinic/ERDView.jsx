import { useState, useRef } from 'react';

// ── Dark-aurora color palette ─────────────────────────────────────────────────
const C = {
  entity:     '#FF5577', entityBg:   'rgba(255,45,85,0.10)',
  relation:   '#C58FFF', relationBg: 'rgba(197,143,255,0.10)',
  attr:       '#00E5C7', attrBg:     'rgba(0,229,199,0.08)',
  pk:         '#FFB454', pkBg:       'rgba(255,180,84,0.12)',
  line:       'rgba(255,255,255,0.15)', mainLine: 'rgba(255,85,119,0.6)',
};
const FONT = "'Space Grotesk','Heebo',system-ui,sans-serif";

/* ── Entity rectangle ─────────────────────────────────────── */
function Entity({ cx, cy, label, fieldCount, w = 155, h = 62, isWeak = false }) {
  return (
    <g>
      <rect x={cx - w/2} y={cy - h/2} width={w} height={h} rx={8}
        fill={C.entityBg} stroke={C.entity} strokeWidth={2}
        style={{ filter: 'drop-shadow(0 0 12px rgba(255,45,85,0.3))' }} />
      {isWeak && (
        <rect x={cx - w/2 + 5} y={cy - h/2 + 5} width={w - 10} height={h - 10} rx={5}
          fill="none" stroke={C.entity} strokeWidth={1} strokeDasharray="3 2" />
      )}
      <text x={cx} y={cy - 9} textAnchor="middle" dominantBaseline="middle"
        fontSize={15} fontWeight="700" fill={C.entity} fontFamily={FONT}>
        {label}
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle"
        fontSize={10} fill="rgba(255,255,255,0.35)" fontFamily={FONT}>
        ({fieldCount} שדות)
      </text>
    </g>
  );
}

/* ── Relationship diamond ─────────────────────────────────── */
function Relation({ cx, cy, label, hw = 66, hh = 40, isIdentifying = false }) {
  const pts  = `${cx},${cy-hh} ${cx+hw},${cy} ${cx},${cy+hh} ${cx-hw},${cy}`;
  const s    = 0.72;
  const ipts = `${cx},${cy-hh*s} ${cx+hw*s},${cy} ${cx},${cy+hh*s} ${cx-hw*s},${cy}`;
  return (
    <g>
      <polygon points={pts} fill={C.relationBg} stroke={C.relation} strokeWidth={2}
        style={{ filter: 'drop-shadow(0 0 10px rgba(197,143,255,0.3))' }} />
      {isIdentifying && (
        <polygon points={ipts} fill="none" stroke={C.relation} strokeWidth={1} strokeDasharray="3 2" />
      )}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight="700" fill={C.relation} fontFamily={FONT}>
        {label}
      </text>
    </g>
  );
}

/* ── Attribute ellipse ────────────────────────────────────── */
function Attr({ cx, cy, label, isPK = false, rx = 65, ry = 22 }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
        fill={isPK ? C.pkBg : C.attrBg}
        stroke={isPK ? C.pk : C.attr}
        strokeWidth={isPK ? 2 : 1.5}
        style={{ filter: isPK ? 'drop-shadow(0 0 8px rgba(255,180,84,0.25))' : 'none' }} />
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

/* ── Connector line ───────────────────────────────────────── */
function Line({ x1, y1, x2, y2, main = false }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={main ? C.mainLine : C.line}
      strokeWidth={main ? 2 : 1.5}
      strokeDasharray={main ? 'none' : '4 3'} />
  );
}

/* ── Cardinality label ────────────────────────────────────── */
function Cardinality({ x, y, label }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
      fontSize={11} fontWeight="700" fill="#FFB454" fontFamily={FONT}
      direction="ltr" unicodeBidi="bidi-override">
      {label}
    </text>
  );
}

/* ── Geometry helpers ─────────────────────────────────────── */
const lerp    = (a, b, t) => a + t * (b - a);
const perpOff = (x1, y1, x2, y2, t, d) => {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  return {
    x: Math.round(lerp(x1, x2, t) + (-dy / len) * d),
    y: Math.round(lerp(y1, y2, t) + ( dx / len) * d),
  };
};

/* ── Cardinality legend ───────────────────────────────────── */
const CARD_LEGEND = [
  { label: '(1,1)', desc: 'בדיוק אחד',     color: '#FF5577', border: 'rgba(255,85,119,0.5)' },
  { label: '(0,1)', desc: 'אופציונלי יחיד', color: '#FFB454', border: 'rgba(255,180,84,0.5)' },
  { label: '(1,N)', desc: 'לפחות אחד',      color: '#00E5C7', border: 'rgba(0,229,199,0.5)'  },
  { label: '(0,N)', desc: 'אופציונלי רבים', color: '#C58FFF', border: 'rgba(197,143,255,0.5)' },
];

const BAR = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '10px 16px',
  marginBottom: 12,
  backdropFilter: 'blur(10px)',
};

export default function ERDView() {
  const [pan, setPan]             = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart                  = useRef({ x: 0, y: 0 });
  const containerRef              = useRef(null);

  const SVG_W = 800, SVG_H = 498, CONTAINER_H = 498, SLACK = 0;

  const onMouseDown = (e) => {
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const onMouseMove = (e) => {
    if (!isPanning) return;
    const cw = containerRef.current ? containerRef.current.clientWidth : SVG_W;
    const newX = Math.min(SLACK, Math.max(cw - SVG_W - SLACK, e.clientX - panStart.current.x));
    const newY = Math.min(SLACK, Math.max(CONTAINER_H - SVG_H - SLACK, e.clientY - panStart.current.y));
    setPan({ x: newX, y: newY });
  };
  const onMouseUp = () => setIsPanning(false);

  const PAT  = { x: 220, y: 190 };
  const DOC  = { x: 740, y: 190 };
  const APT  = { x: 480, y: 420 };
  const INV  = { x: 350, y: 305 };
  const RECV = { x: 610, y: 305 };

  const PA_PK = { x: 78,  y: 83  };
  const PA_NM = { x: 68,  y: 190 };
  const PA_PH = { x: 78,  y: 297 };
  const DA_PK = { x: 882, y: 83  };
  const DA_NM = { x: 892, y: 190 };
  const AA_PK = { x: 480, y: 537 };
  const AA_DT = { x: 300, y: 537 };
  const AA_RS = { x: 660, y: 537 };

  return (
    <div dir="rtl">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>
            04 · DATABASE
          </div>
          <h2 style={{ margin: 0, color: 'var(--fg)', fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
            ERD Diagram
          </h2>
        </div>
        <span style={{
          background: 'rgba(255,180,84,0.12)', color: '#FFB454',
          border: '1px solid rgba(255,180,84,0.3)',
          borderRadius: 999, padding: '5px 14px',
          fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
        }}>
          3 ישויות · 2 קשרים · 8 תכונות
        </span>
      </div>

      {/* Exclusion note */}
      <div style={{
        ...BAR,
        display: 'flex', gap: 8, alignItems: 'flex-start',
        fontSize: 13, color: 'var(--fg-2)', fontFamily: 'var(--font-he)',
      }}>
        <span style={{ color: '#FFB454', flexShrink: 0 }}>⚠</span>
        <span>
          <strong style={{ color: '#FFB454' }}>גורם לא רלוונטי שהוצא מהמודל:</strong>{' '}
          תכונת <strong>חניה</strong> — משאב ארגוני של המרפאה כולה, ולא מאפיין של רופא בודד.
        </span>
      </div>

      {/* Cardinality legend */}
      <div style={{ ...BAR, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          קרדינליות:
        </span>
        {CARD_LEGEND.map(({ label, desc, color, border }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              background: color + '18', color, border: `1.5px solid ${border}`,
              borderRadius: 999, padding: '2px 10px',
              fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
              direction: 'ltr', display: 'inline-block',
            }}>{label}</span>
            <span style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--font-he)' }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* SVG canvas */}
      <div
        ref={containerRef}
        style={{
          background: 'rgba(6,8,15,0.6)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 40px rgba(255,45,85,0.06), inset 0 0 60px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab',
          userSelect: 'none', height: 498, position: 'relative',
          backdropFilter: 'blur(10px)',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <svg width="100%" height="100%" viewBox="0 0 980 610" preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block', transform: `translate(${pan.x}px, ${pan.y}px)`, transition: isPanning ? 'none' : 'transform 0.05s' }}>

          <defs>
            <pattern id="dg" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.06)" />
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
          <Entity cx={APT.x} cy={APT.y} label="תור"   fieldCount={3} w={165} isWeak />

          {/* Relationships */}
          <Relation cx={INV.x}  cy={INV.y}  label="מזמין" isIdentifying />
          <Relation cx={RECV.x} cy={RECV.y} label="מקבל"  isIdentifying />

          {/* Attributes */}
          <Attr cx={PA_PK.x} cy={PA_PK.y} label="מספר ת.ז."    isPK />
          <Attr cx={PA_NM.x} cy={PA_NM.y} label="שם מטופל" />
          <Attr cx={PA_PH.x} cy={PA_PH.y} label="מספר טלפון" />
          <Attr cx={DA_PK.x} cy={DA_PK.y} label="מספר רישיון"  isPK />
          <Attr cx={DA_NM.x} cy={DA_NM.y} label="שם רופא" />
          <Attr cx={AA_PK.x} cy={AA_PK.y} label="מספר תור"     isPK />
          <Attr cx={AA_DT.x} cy={AA_DT.y} label="תאריך ושעה" />
          <Attr cx={AA_RS.x} cy={AA_RS.y} label="סיבת ביקור" />

          {/* Hint */}
          <text x={490} y={24} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.2)" fontFamily={FONT}>
            מפתח ראשי (PK) מסומן בקו תחתון · ישות חלשה = מסגרת מקווקוות · קשר מזהה = יהלום כפול
          </text>
        </svg>
      </div>

      {/* Shape legend */}
      <div style={{
        ...BAR, marginBottom: 0, marginTop: 12,
        display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center',
        fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--font-he)',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          מקרא:
        </span>
        {[
          { shape: 'rect',     color: C.entity,   bg: C.entityBg,   label: 'ישות חזקה' },
          { shape: 'weakRect', color: C.entity,   bg: C.entityBg,   label: 'ישות חלשה' },
          { shape: 'diamond',  color: C.relation, bg: C.relationBg, label: 'קשר מזהה' },
          { shape: 'ellipse',  color: C.attr,     bg: C.attrBg,     label: 'תכונה' },
          { shape: 'ellipse',  color: C.pk,       bg: C.pkBg,       label: 'מפתח ראשי (PK)', isPK: true },
        ].map(({ shape, color, bg, label, isPK }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={36} height={26}>
              {shape === 'rect'     && <rect x={1} y={5} width={34} height={16} rx={4} fill={bg} stroke={color} strokeWidth={2} />}
              {shape === 'weakRect' && <>
                <rect x={1} y={5} width={34} height={16} rx={4} fill={bg} stroke={color} strokeWidth={2} />
                <rect x={4} y={8} width={28} height={10} rx={2} fill="none" stroke={color} strokeWidth={1} strokeDasharray="2 1.5" />
              </>}
              {shape === 'diamond' && <>
                <polygon points="18,1 35,13 18,25 1,13" fill={bg} stroke={color} strokeWidth={2} />
                <polygon points="18,5 30,13 18,21 6,13" fill="none" stroke={color} strokeWidth={1} strokeDasharray="2 1.5" />
              </>}
              {shape === 'ellipse' && <ellipse cx={18} cy={13} rx={17} ry={11} fill={bg} stroke={color} strokeWidth={isPK ? 2 : 1.5} />}
            </svg>
            <span style={{ color: 'var(--fg-2)', textDecoration: isPK ? 'underline' : 'none' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
