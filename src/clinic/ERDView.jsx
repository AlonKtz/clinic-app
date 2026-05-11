const C = {
  entityBorder:   '#D97706',
  entityHeaderBg: '#FEF3C7',
  entityBodyBg:   '#FFFBEB',
  entityText:     '#92400E',
  pk:             '#B91C1C',
  attr:           '#374151',
  fk:             '#6B7280',
  relBorder:      '#059669',
  relBg:          '#D1FAE5',
  relText:        '#065F46',
  line:           '#9CA3AF',
  cardinality:    '#DC2626',
};
const FONT  = "'Segoe UI', Arial, sans-serif";
const W     = 168;   // card width
const HDR   = 34;    // header height
const ROW   = 22;    // row height
const PAD_B = 12;    // bottom padding

/** Compute total card height for a given set of rows */
function cardH(attrs, fks) {
  return HDR + (1 + attrs.length + fks.length) * ROW + PAD_B;
}

/** DB-style entity card */
function EntityCard({ cx, cy, label, pk, attrs = [], fks = [] }) {
  const totalH = cardH(attrs, fks);
  const x = cx - W / 2;
  const y = cy - totalH / 2;
  const rowY = (i) => y + HDR + i * ROW + ROW / 2;   // vertical centre of row i (0 = PK row)

  return (
    <g>
      {/* Drop shadow */}
      <rect x={x + 2} y={y + 3} width={W} height={totalH} rx={7}
        fill="rgba(0,0,0,0.07)" />

      {/* Card body */}
      <rect x={x} y={y} width={W} height={totalH} rx={7}
        fill={C.entityBodyBg} stroke={C.entityBorder} strokeWidth={2} />

      {/* Header fill (clip bottom corners square so border shows) */}
      <rect x={x + 1.5} y={y + 1.5} width={W - 3} height={HDR - 1.5}
        fill={C.entityHeaderBg} />
      <line x1={x} y1={y + HDR} x2={x + W} y2={y + HDR}
        stroke={C.entityBorder} strokeWidth={1.5} />

      {/* Entity name */}
      <text x={cx} y={y + HDR / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight="700" fill={C.entityText} fontFamily={FONT}>
        {label}
      </text>

      {/* PK row */}
      <text x={cx} y={rowY(0)} textAnchor="middle" dominantBaseline="middle"
        fontSize={11} fontWeight="600" textDecoration="underline"
        fill={C.pk} fontFamily={FONT}>
        {pk}
      </text>

      {/* Attribute rows */}
      {attrs.map((a, i) => (
        <text key={a} x={cx} y={rowY(i + 1)} textAnchor="middle" dominantBaseline="middle"
          fontSize={11} fill={C.attr} fontFamily={FONT}>
          {a}
        </text>
      ))}

      {/* FK rows */}
      {fks.map((fk, i) => (
        <text key={fk} x={cx} y={rowY(attrs.length + i + 1)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={10.5} fill={C.fk} fontFamily={FONT}>
          🔑 {fk}
        </text>
      ))}

      {/* Field count */}
      <text x={cx} y={y + totalH - 5} textAnchor="middle" dominantBaseline="auto"
        fontSize={9.5} fill="#9CA3AF" fontFamily={FONT}>
        ({1 + attrs.length + fks.length} שדות)
      </text>
    </g>
  );
}

/** Relationship diamond */
function RelDiamond({ cx, cy, label, hw = 62, hh = 37 }) {
  const pts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
  return (
    <g>
      <polygon points={pts} fill={C.relBg} stroke={C.relBorder} strokeWidth={2}
        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.10))' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight="700" fill={C.relText} fontFamily={FONT}>
        {label}
      </text>
    </g>
  );
}

/** Cardinality label on a line */
function CardLabel({ x, y, label }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
      fontSize={11} fontWeight="700" fill={C.cardinality} fontFamily={FONT}>
      {label}
    </text>
  );
}

export default function ERDView() {
  /* ── Entity centres ── */
  const PAT  = { x: 185, y: 200 };   // מטופל  — totalH = 34 + 3*22 + 12 = 112
  const DOC  = { x: 715, y: 200 };   // רופא   — totalH = 34 + 2*22 + 12 = 90
  const APT  = { x: 450, y: 455 };   // תור    — totalH = 34 + 5*22 + 12 = 156

  const patH = cardH(['שם מטופל','מספר טלפון'], []);            // 112
  const docH = cardH(['שם רופא'], []);                           // 90
  const aptH = cardH(['תאריך ושעה','סיבת ביקור'],
                     ['מספר רישיון','מספר ת.ז.']);               // 156

  /* bottom/top edge of each entity card */
  const patBot = PAT.y + patH / 2;   // 200 + 56 = 256
  const docBot = DOC.y + docH / 2;   // 200 + 45 = 245
  const aptTop = APT.y - aptH / 2;   // 455 - 78 = 377

  /* ── Diamond centres ── */
  const BOOK = { x: 318, y: 316 };   // קובע   (hh=37 → top=279, bot=353)
  const RECV = { x: 582, y: 316 };   // מקבל

  const diamTop = 316 - 37;   // 279
  const diamBot = 316 + 37;   // 353

  return (
    <div>
      <h2 style={{ margin: '0 0 1rem', color: '#1e293b', fontSize: '1.2rem', fontWeight: 700 }}>
        דיאגרמת ERD — Chen Notation
      </h2>

      <div style={{
        background: '#f8faff', borderRadius: '14px',
        border: '1px solid #e2e8f0', padding: '0.75rem',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        userSelect: 'none', overflowX: 'auto',
      }}>
        <svg viewBox="0 0 900 560" style={{ width: '100%', minWidth: '580px', display: 'block' }}>

          {/* Dot-grid background */}
          <defs>
            <pattern id="dg" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#CBD5E1" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="900" height="560" fill="url(#dg)" />

          {/* ── Relationship lines ── */}
          <line x1={PAT.x}  y1={patBot}  x2={BOOK.x} y2={diamTop} stroke={C.line} strokeWidth={1.8} />
          <line x1={BOOK.x} y1={diamBot} x2={APT.x}  y2={aptTop}  stroke={C.line} strokeWidth={1.8} />
          <line x1={DOC.x}  y1={docBot}  x2={RECV.x} y2={diamTop} stroke={C.line} strokeWidth={1.8} />
          <line x1={RECV.x} y1={diamBot} x2={APT.x}  y2={aptTop}  stroke={C.line} strokeWidth={1.8} />

          {/* ── Cardinality labels ── */}
          {/* (0,N) near מטופל — t=0.22 along PAT→BOOK segment */}
          <CardLabel x={PAT.x  + 0.22 * (BOOK.x - PAT.x)  - 22}
                     y={patBot + 0.22 * (diamTop - patBot) -  2}
                     label="(0,N)" />
          {/* (0,N) near רופא — t=0.22 along DOC→RECV */}
          <CardLabel x={DOC.x  + 0.22 * (RECV.x - DOC.x)  + 22}
                     y={docBot + 0.22 * (diamTop - docBot) -  2}
                     label="(0,N)" />
          {/* (1,1) near תור from קובע — t=0.78 along BOOK→APT */}
          <CardLabel x={BOOK.x + 0.78 * (APT.x - BOOK.x)  - 24}
                     y={diamBot + 0.78 * (aptTop - diamBot) + 4}
                     label="(1,1)" />
          {/* (1,1) near תור from מקבל — t=0.78 along RECV→APT */}
          <CardLabel x={RECV.x + 0.78 * (APT.x - RECV.x)  + 24}
                     y={diamBot + 0.78 * (aptTop - diamBot) + 4}
                     label="(1,1)" />

          {/* ── Entities ── */}
          <EntityCard cx={PAT.x} cy={PAT.y} label="מטופל"
            pk="מספר ת.ז." attrs={['שם מטופל','מספר טלפון']} />
          <EntityCard cx={DOC.x} cy={DOC.y} label="רופא"
            pk="מספר רישיון" attrs={['שם רופא']} />
          <EntityCard cx={APT.x} cy={APT.y} label="תור"
            pk="מספר תור"
            attrs={['תאריך ושעה','סיבת ביקור']}
            fks={['מספר רישיון','מספר ת.ז.']} />

          {/* ── Relationships ── */}
          <RelDiamond cx={BOOK.x} cy={BOOK.y} label="קובע" />
          <RelDiamond cx={RECV.x} cy={RECV.y} label="מקבל" />
        </svg>
      </div>
    </div>
  );
}
