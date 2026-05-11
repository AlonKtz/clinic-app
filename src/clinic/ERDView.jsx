const C = {
  entity:     '#AA0000', entityBg:   '#FFF0F0',
  relation:   '#6d28d9', relationBg: '#EDE9FE',
  attr:       '#0f766e', attrBg:     '#F0FDFA',
  pk:         '#B91C1C', pkBg:       '#FEF2F2',
  line:       '#CBD5E1', mainLine:   '#9B2020',
};
const FONT = "'Segoe UI', Arial, sans-serif";

/* ── Entity rectangle ── */
function Entity({ cx, cy, label, w = 155, h = 50 }) {
  return (
    <g>
      <rect x={cx - w/2} y={cy - h/2} width={w} height={h} rx={5}
        fill={C.entityBg} stroke={C.entity} strokeWidth={2.5}
        style={{ filter: 'drop-shadow(0 2px 6px rgba(170,0,0,0.12))' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={16} fontWeight="700" fill={C.entity} fontFamily={FONT}>
        {label}
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

/* ── Thin connector line ── */
function Line({ x1, y1, x2, y2, main = false }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={main ? C.mainLine : C.line}
      strokeWidth={main ? 2 : 1.5} />
  );
}

export default function ERDView() {
  /* ── Entity centres ── */
  const PAT  = { x: 225, y: 215 };   // מטופל
  const DOC  = { x: 755, y: 215 };   // רופא
  const APT  = { x: 490, y: 445 };   // תור

  /* ── Relationship centres ── */
  const INV  = { x: 358, y: 330 };   // מזמין  (מטופל → תור)
  const RECV = { x: 622, y: 330 };   // מקבל   (רופא  → תור)

  /* ── Patient attribute positions ── */
  const PA_PK = { x: 80,  y: 108 };  // מספר ת.ז.  (PK)
  const PA_NM = { x: 68,  y: 215 };  // שם מטופל
  const PA_PH = { x: 80,  y: 322 };  // מספר טלפון

  /* ── Doctor attribute positions ── */
  const DA_PK = { x: 900, y: 108 };  // מספר רישיון (PK)
  const DA_NM = { x: 912, y: 215 };  // שם רופא

  /* ── Appointment attribute positions ── */
  const AA_PK = { x: 490, y: 562 };  // מספר תור  (PK)
  const AA_DT = { x: 310, y: 562 };  // תאריך ושעה
  const AA_RS = { x: 670, y: 562 };  // סיבת ביקור

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
        padding: '0.6rem 0.9rem', marginBottom: '1rem',
        fontSize: '0.8rem', color: '#92400E', display: 'flex', gap: '0.45rem',
      }}>
        <span>⚠️</span>
        <span>
          <strong>גורם לא רלוונטי שהוצא מהמודל:</strong> תכונת <strong>חניה</strong> —
          משאב ארגוני של המרפאה כולה, ולא מאפיין של רופא בודד.
        </span>
      </div>

      {/* SVG canvas */}
      <div style={{
        background: '#F9FAFB', borderRadius: '14px', border: '1px solid #E5E7EB',
        padding: '0.75rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        userSelect: 'none', overflowX: 'auto',
      }}>
        <svg viewBox="0 0 980 610" style={{ width: '100%', minWidth: '620px', display: 'block' }}>

          {/* Dot grid */}
          <defs>
            <pattern id="dg" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#D1D5DB" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="980" height="610" fill="url(#dg)" />

          {/* ── Attribute lines (drawn first, behind everything) ── */}
          {/* Patient */}
          <Line x1={PAT.x} y1={PAT.y} x2={PA_PK.x} y2={PA_PK.y} />
          <Line x1={PAT.x} y1={PAT.y} x2={PA_NM.x} y2={PA_NM.y} />
          <Line x1={PAT.x} y1={PAT.y} x2={PA_PH.x} y2={PA_PH.y} />
          {/* Doctor */}
          <Line x1={DOC.x} y1={DOC.y} x2={DA_PK.x} y2={DA_PK.y} />
          <Line x1={DOC.x} y1={DOC.y} x2={DA_NM.x} y2={DA_NM.y} />
          {/* Appointment */}
          <Line x1={APT.x} y1={APT.y} x2={AA_PK.x} y2={AA_PK.y} />
          <Line x1={APT.x} y1={APT.y} x2={AA_DT.x} y2={AA_DT.y} />
          <Line x1={APT.x} y1={APT.y} x2={AA_RS.x} y2={AA_RS.y} />

          {/* ── Main relationship lines ── */}
          <Line x1={PAT.x}  y1={PAT.y}  x2={INV.x}  y2={INV.y}  main />
          <Line x1={INV.x}  y1={INV.y}  x2={APT.x}  y2={APT.y}  main />
          <Line x1={DOC.x}  y1={DOC.y}  x2={RECV.x} y2={RECV.y} main />
          <Line x1={RECV.x} y1={RECV.y} x2={APT.x}  y2={APT.y}  main />

          {/* ── Entities ── */}
          <Entity cx={PAT.x} cy={PAT.y} label="מטופל" />
          <Entity cx={DOC.x} cy={DOC.y} label="רופא" />
          <Entity cx={APT.x} cy={APT.y} label="תור" w={165} />

          {/* ── Relationships ── */}
          <Relation cx={INV.x}  cy={INV.y}  label="מזמין" />
          <Relation cx={RECV.x} cy={RECV.y} label="מקבל" />

          {/* ── Attribute ellipses ── */}
          {/* Patient */}
          <Attr cx={PA_PK.x} cy={PA_PK.y} label="מספר ת.ז."   isPK />
          <Attr cx={PA_NM.x} cy={PA_NM.y} label="שם מטופל" />
          <Attr cx={PA_PH.x} cy={PA_PH.y} label="מספר טלפון" />
          {/* Doctor */}
          <Attr cx={DA_PK.x} cy={DA_PK.y} label="מספר רישיון" isPK />
          <Attr cx={DA_NM.x} cy={DA_NM.y} label="שם רופא" />
          {/* Appointment */}
          <Attr cx={AA_PK.x} cy={AA_PK.y} label="מספר תור"    isPK />
          <Attr cx={AA_DT.x} cy={AA_DT.y} label="תאריך ושעה" />
          <Attr cx={AA_RS.x} cy={AA_RS.y} label="סיבת ביקור" />

          {/* ── Hint ── */}
          <text x={490} y={24} textAnchor="middle" fontSize={10.5}
            fill="#9CA3AF" fontFamily={FONT}>
            מפתח ראשי (PK) מסומן בקו תחתון באליפסה
          </text>
        </svg>
      </div>

      {/* Legend */}
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
              {shape === 'diamond' && <polygon points="17,1 33,12 17,23 1,12"       fill={bg} stroke={color} strokeWidth={2} />}
              {shape === 'ellipse' && <ellipse cx={17} cy={12} rx={16} ry={10}      fill={bg} stroke={color} strokeWidth={isPK ? 2 : 1.5} />}
            </svg>
            <span style={{ textDecoration: isPK ? 'underline' : 'none' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
