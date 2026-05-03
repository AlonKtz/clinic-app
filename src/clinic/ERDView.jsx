import { colors } from './styles';

const C = {
  entity: '#AA0000',
  entityBg: '#FFE8E8',
  relation: '#7c3aed',
  relationBg: '#ede9fe',
  attr: '#0f766e',
  attrBg: '#f0fdfa',
  pk: '#CC0000',
  pkBg: '#fff0f0',
  line: '#c4a0a0',
  mainLine: '#9B2020',
};

const FONT = 'Segoe UI, Arial, sans-serif';

function EntityRect({ cx, cy, label, w = 160, h = 48 }) {
  return (
    <g>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h}
        fill={C.entityBg} stroke={C.entity} strokeWidth={2.5} rx={4} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={15} fontWeight="bold" fill={C.entity} fontFamily={FONT}>
        {label}
      </text>
    </g>
  );
}

function RelDiamond({ cx, cy, label, hw = 58, hh = 33 }) {
  const pts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
  return (
    <g>
      <polygon points={pts} fill={C.relationBg} stroke={C.relation} strokeWidth={2.5} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight="bold" fill={C.relation} fontFamily={FONT}>
        {label}
      </text>
    </g>
  );
}

function AttrEllipse({ cx, cy, label, isPK = false, rx = 64, ry = 21 }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
        fill={isPK ? C.pkBg : C.attrBg}
        stroke={isPK ? C.pk : C.attr}
        strokeWidth={isPK ? 2 : 1.5} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={11} fill={isPK ? C.pk : C.attr}
        fontWeight={isPK ? 'bold' : 'normal'}
        textDecoration={isPK ? 'underline' : 'none'}
        fontFamily={FONT}>
        {label}
      </text>
    </g>
  );
}

function ConnLine({ x1, y1, x2, y2, main = false }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={main ? C.mainLine : C.line}
      strokeWidth={main ? 2 : 1.5} />
  );
}

function CardLabel({ x, y, label }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
      fontSize={15} fontWeight="bold" fill="#0f172a" fontFamily={FONT}>
      {label}
    </text>
  );
}

function LegendItem({ shape, color, bg, label, isPK }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg width={38} height={26}>
        {shape === 'rect' && (
          <rect x={3} y={5} width={32} height={16} rx={2}
            fill={bg} stroke={color} strokeWidth={2} />
        )}
        {shape === 'diamond' && (
          <polygon points="19,2 35,13 19,24 3,13"
            fill={bg} stroke={color} strokeWidth={2} />
        )}
        {shape === 'ellipse' && (
          <ellipse cx={19} cy={13} rx={16} ry={10}
            fill={bg} stroke={color} strokeWidth={isPK ? 2 : 1.5} />
        )}
      </svg>
      <span style={{ color: '#475569', fontSize: '0.82rem' }}>
        {isPK ? <u>{label}</u> : label}
      </span>
    </div>
  );
}

export default function ERDView() {
  // Entity centers
  const DOC = { x: 710, y: 205 };
  const PAT = { x: 270, y: 205 };
  const APT = { x: 490, y: 420 };

  // Relationship diamond centers
  const RECV = { x: 610, y: 320 };
  const BOOK = { x: 375, y: 320 };

  // Doctor attributes
  const DA_PK = { x: 858, y: 115 };   // מספר רישיון (PK)
  const DA_NM = { x: 858, y: 295 };   // שם רופא

  // Patient attributes
  const PA_PK = { x: 122, y: 115 };   // מספר ת.ז. (PK)
  const PA_NM = { x: 95,  y: 205 };   // שם מטופל
  const PA_PH = { x: 122, y: 295 };   // מספר טלפון

  // Appointment attributes
  const AA_PK = { x: 490, y: 530 };   // מספר תור (PK)
  const AA_DT = { x: 315, y: 530 };   // תאריך ושעה
  const AA_RS = { x: 665, y: 530 };   // סיבת ביקור

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', fontWeight: 700 }}>
          דיאגרמת ERD — Chen Notation
        </h2>
        <span style={{
          background: colors.primaryBg, color: colors.primary,
          borderRadius: '8px', padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 600,
        }}>
          3 ישויות · 2 קשרים · 8 תכונות
        </span>
      </div>

      {/* Parking exclusion note */}
      <div style={{
        background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px',
        padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#92400e',
        display: 'flex', gap: '0.5rem',
      }}>
        <span style={{ flexShrink: 0 }}>ℹ️</span>
        <span>
          <strong>הערה — כלל "גורמים לא רלוונטיים":</strong> תכונת <strong>חניה</strong> הוסרה מהמודל.
          החניה שייכת לכלל צוות הרופאים (מאפיין של הארגון), ולא לרופא בודד — ולכן אינה תכונה של ישות <em>רופא</em>.
        </span>
      </div>

      {/* SVG ERD Canvas */}
      <div style={{
        background: '#fafcff', borderRadius: '12px', border: '1px solid #e2e8f0',
        padding: '1rem', overflowX: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <svg viewBox="0 0 990 585" style={{ width: '100%', minWidth: '740px', display: 'block' }}>

          {/* ── Attribute connector lines (draw first, behind shapes) ── */}

          {/* Doctor attrs */}
          <ConnLine x1={DOC.x} y1={DOC.y} x2={DA_PK.x} y2={DA_PK.y} />
          <ConnLine x1={DOC.x} y1={DOC.y} x2={DA_NM.x} y2={DA_NM.y} />

          {/* Patient attrs */}
          <ConnLine x1={PAT.x} y1={PAT.y} x2={PA_PK.x} y2={PA_PK.y} />
          <ConnLine x1={PAT.x} y1={PAT.y} x2={PA_NM.x} y2={PA_NM.y} />
          <ConnLine x1={PAT.x} y1={PAT.y} x2={PA_PH.x} y2={PA_PH.y} />

          {/* Appointment attrs */}
          <ConnLine x1={APT.x} y1={APT.y} x2={AA_PK.x} y2={AA_PK.y} />
          <ConnLine x1={APT.x} y1={APT.y} x2={AA_DT.x} y2={AA_DT.y} />
          <ConnLine x1={APT.x} y1={APT.y} x2={AA_RS.x} y2={AA_RS.y} />

          {/* ── Relationship lines (entity ↔ diamond ↔ entity) ── */}

          {/* Doctor ─ מקבל ─ Appointment */}
          <ConnLine x1={DOC.x} y1={DOC.y} x2={RECV.x} y2={RECV.y} main />
          <ConnLine x1={RECV.x} y1={RECV.y} x2={APT.x} y2={APT.y} main />

          {/* Patient ─ קובע ─ Appointment */}
          <ConnLine x1={PAT.x} y1={PAT.y} x2={BOOK.x} y2={BOOK.y} main />
          <ConnLine x1={BOOK.x} y1={BOOK.y} x2={APT.x} y2={APT.y} main />

          {/* ── Cardinality labels ── */}
          <CardLabel x={676} y={242} label="1" />
          <CardLabel x={541} y={390} label="N" />
          <CardLabel x={308} y={242} label="1" />
          <CardLabel x={441} y={390} label="N" />

          {/* ── Entities (on top of lines) ── */}
          <EntityRect cx={DOC.x} cy={DOC.y} label="רופא" />
          <EntityRect cx={PAT.x} cy={PAT.y} label="מטופל" />
          <EntityRect cx={APT.x} cy={APT.y} label="תור" w={185} />

          {/* ── Relationships ── */}
          <RelDiamond cx={RECV.x} cy={RECV.y} label="מקבל" />
          <RelDiamond cx={BOOK.x} cy={BOOK.y} label="קובע" />

          {/* ── Attributes ── */}

          {/* Doctor */}
          <AttrEllipse cx={DA_PK.x} cy={DA_PK.y} label="מספר רישיון" isPK />
          <AttrEllipse cx={DA_NM.x} cy={DA_NM.y} label="שם רופא" />

          {/* Patient */}
          <AttrEllipse cx={PA_PK.x} cy={PA_PK.y} label="מספר ת.ז." isPK />
          <AttrEllipse cx={PA_NM.x} cy={PA_NM.y} label="שם מטופל" />
          <AttrEllipse cx={PA_PH.x} cy={PA_PH.y} label="מספר טלפון" />

          {/* Appointment */}
          <AttrEllipse cx={AA_PK.x} cy={AA_PK.y} label="מספר תור" isPK />
          <AttrEllipse cx={AA_DT.x} cy={AA_DT.y} label="תאריך ושעה" />
          <AttrEllipse cx={AA_RS.x} cy={AA_RS.y} label="סיבת ביקור" />

          {/* ── FK labels (small, on lines near Appointment) ── */}
          <text x={565} y={408} fontSize={9} fill="#94a3b8" fontFamily={FONT} textAnchor="middle">
            FK: מספר רישיון
          </text>
          <text x={418} y={408} fontSize={9} fill="#94a3b8" fontFamily={FONT} textAnchor="middle">
            FK: מספר ת.ז.
          </text>

        </svg>
      </div>

      {/* Legend */}
      <div style={{
        background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
        padding: '0.85rem 1.25rem', marginTop: '1rem',
        display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#475569' }}>מקרא:</span>
        <LegendItem shape="rect"    color={C.entity}   bg={C.entityBg}   label="ישות (Entity)" />
        <LegendItem shape="diamond" color={C.relation} bg={C.relationBg} label="קשר (Relationship)" />
        <LegendItem shape="ellipse" color={C.attr}     bg={C.attrBg}     label="תכונה (Attribute)" />
        <LegendItem shape="ellipse" color={C.pk}       bg={C.pkBg}       label="מפתח ראשי — מסומן בקו תחתון (PK)" isPK />
        <span style={{ fontSize: '0.82rem', color: '#475569' }}>
          <strong>1 : N</strong> — יחס של אחד לרבים
        </span>
      </div>
    </div>
  );
}
