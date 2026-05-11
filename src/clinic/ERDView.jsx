const C = {
  entityBorder:   '#D97706',
  entityHeaderBg: '#FEF3C7',
  entityBodyBg:   '#FFFFFF',
  entityText:     '#92400E',
  pk:             '#B91C1C',
  attr:           '#374151',
  fk:             '#9CA3AF',
  relBorder:      '#059669',
  relBg:          '#D1FAE5',
  relText:        '#065F46',
  line:           '#94A3B8',
  cardinality:    '#DC2626',
};
const FONT   = "'Segoe UI', Arial, sans-serif";
const CARD_W = 160;
const HDR_H  = 34;
const ROW_H  = 21;
const PAD_B  = 12;

const cardHeight = (attrs, fks) =>
  HDR_H + (1 + attrs.length + fks.length) * ROW_H + PAD_B;

/* ── Entity card (DB-table style) ───────────────────────────────── */
function EntityCard({ cx, cy, label, pk, attrs = [], fks = [], w = CARD_W }) {
  const h   = cardHeight(attrs, fks);
  const x   = cx - w / 2;
  const y   = cy - h / 2;
  const row = (i) => y + HDR_H + i * ROW_H + ROW_H / 2;

  return (
    <g>
      {/* shadow */}
      <rect x={x + 2} y={y + 3} width={w} height={h} rx={8}
        fill="rgba(0,0,0,0.07)" />
      {/* body */}
      <rect x={x} y={y} width={w} height={h} rx={8}
        fill={C.entityBodyBg} stroke={C.entityBorder} strokeWidth={2} />
      {/* header fill */}
      <clipPath id={`hdr-${label}`}>
        <rect x={x} y={y} width={w} height={HDR_H} rx={8} />
      </clipPath>
      <rect x={x} y={y} width={w} height={HDR_H + 8} rx={0}
        fill={C.entityHeaderBg} clipPath={`url(#hdr-${label})`} />
      {/* header bottom border */}
      <line x1={x} y1={y + HDR_H} x2={x + w} y2={y + HDR_H}
        stroke={C.entityBorder} strokeWidth={1.5} />
      {/* entity name */}
      <text x={cx} y={y + HDR_H / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight="700" fill={C.entityText} fontFamily={FONT}>
        {label}
      </text>
      {/* PK */}
      <text x={cx} y={row(0)} textAnchor="middle" dominantBaseline="middle"
        fontSize={11} fontWeight="600" textDecoration="underline"
        fill={C.pk} fontFamily={FONT}>{pk}</text>
      {/* attrs */}
      {attrs.map((a, i) => (
        <text key={a} x={cx} y={row(i + 1)} textAnchor="middle" dominantBaseline="middle"
          fontSize={11} fill={C.attr} fontFamily={FONT}>{a}</text>
      ))}
      {/* FKs */}
      {fks.map((fk, i) => (
        <text key={fk} x={cx} y={row(attrs.length + i + 1)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={10.5} fill={C.fk} fontFamily={FONT}>
          🔑 {fk}
        </text>
      ))}
      {/* field count */}
      <text x={cx} y={y + h - 5} textAnchor="middle" dominantBaseline="auto"
        fontSize={9} fill="#CBD5E1" fontFamily={FONT}>
        ({1 + attrs.length + fks.length} שדות)
      </text>
    </g>
  );
}

/* ── Relationship diamond ────────────────────────────────────────── */
function RelDiamond({ cx, cy, label, hw = 56, hh = 33 }) {
  const pts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
  return (
    <g>
      <polygon points={pts} fill={C.relBg} stroke={C.relBorder} strokeWidth={2}
        style={{ filter: 'drop-shadow(0 1px 4px rgba(5,150,105,0.18))' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight="700" fill={C.relText} fontFamily={FONT}>
        {label}
      </text>
    </g>
  );
}

/* ── Cardinality label ───────────────────────────────────────────── */
function Card({ x, y, label, anchor = 'middle' }) {
  return (
    <text x={x} y={y} textAnchor={anchor} dominantBaseline="middle"
      fontSize={11} fontWeight="700" fill={C.cardinality} fontFamily={FONT}>
      {label}
    </text>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
export default function ERDView() {

  /* ── Entity definitions ── */
  const entities = {
    patient: {
      label: 'מטופל', pk: 'מספר ת.ז.',
      attrs: ['שם מטופל', 'מספר טלפון'], fks: [],
    },
    doctor: {
      label: 'רופא', pk: 'מספר רישיון',
      attrs: ['שם רופא'], fks: [],
    },
    appointment: {
      label: 'תור', pk: 'מספר תור',
      attrs: ['תאריך ושעה', 'סיבת ביקור'],
      fks: ['מספר רישיון', 'מספר ת.ז.'],
    },
  };

  /* ── Heights ── */
  const patH = cardHeight(entities.patient.attrs,     entities.patient.fks);      // 34+3*21+12 = 109
  const docH = cardHeight(entities.doctor.attrs,      entities.doctor.fks);       // 34+2*21+12 = 88
  const aptH = cardHeight(entities.appointment.attrs, entities.appointment.fks);  // 34+5*21+12 = 151

  /* ── Canvas & positions ──
      Entities share the SAME top-Y so the diagram top is flush.
      Diamonds sit midway between entity bottoms and appointment top.   */
  const TOP_Y   = 55;                          // common top edge for מטופל & רופא
  const PAT_CX  = 195;
  const DOC_CX  = 605;
  const APT_CX  = 400;

  const patCY   = TOP_Y + patH / 2;            // centre of מטופל
  const docCY   = TOP_Y + docH / 2;            // centre of רופא (shorter card)
  const patBot  = TOP_Y + patH;                // bottom edge of מטופל  (=164)
  const docBot  = TOP_Y + docH;                // bottom edge of רופא   (=143)

  /* Place diamonds so each sits in the gap between its entity and תור  */
  const DIAM_Y  = patBot + 62;                 // 164+62 = 226
  const BOOK_CX = 295;
  const RECV_CX = 505;
  const HH      = 33;                          // diamond half-height
  const diamBot = DIAM_Y + HH;                 // 259

  const APT_TOP_Y = diamBot + 50;              // 309  → תור top edge
  const aptCY     = APT_TOP_Y + aptH / 2;      // centre of תור

  const CANVAS_H  = APT_TOP_Y + aptH + 30;     // 309+151+30 = 490

  /* ── Connection coordinates ── */
  // entity → diamond: from entity bottom-centre to diamond top vertex
  const ln1 = { x1: PAT_CX, y1: patBot,  x2: BOOK_CX, y2: DIAM_Y - HH };
  const ln2 = { x1: DOC_CX, y1: docBot,  x2: RECV_CX, y2: DIAM_Y - HH };
  // diamond → תור: from diamond bottom vertex to תור top-centre
  const ln3 = { x1: BOOK_CX, y1: DIAM_Y + HH, x2: APT_CX, y2: APT_TOP_Y };
  const ln4 = { x1: RECV_CX, y1: DIAM_Y + HH, x2: APT_CX, y2: APT_TOP_Y };

  /* ── Cardinality label positions ──
      Placed at t=0.25 / t=0.75 along each segment, offset perpendicular. */
  const lerp  = (a, b, t) => a + t * (b - a);
  const perpOff = (x1, y1, x2, y2, t, d) => {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const px = -dy / len * d, py = dx / len * d;       // CCW perpendicular
    return { x: lerp(x1, x2, t) + px, y: lerp(y1, y2, t) + py };
  };

  // (0,N) labels — near entity bottom, offset outward
  const c0n_pat = perpOff(ln1.x1, ln1.y1, ln1.x2, ln1.y2, 0.18, -18);
  const c0n_doc = perpOff(ln2.x1, ln2.y1, ln2.x2, ln2.y2, 0.18,  18);
  // (1,1) labels — near תור top, offset to the side
  const c11_book = perpOff(ln3.x1, ln3.y1, ln3.x2, ln3.y2, 0.82, -20);
  const c11_recv = perpOff(ln4.x1, ln4.y1, ln4.x2, ln4.y2, 0.82,  20);

  return (
    <div>
      <h2 style={{ margin: '0 0 1rem', color: '#1e293b', fontSize: '1.2rem', fontWeight: 700 }}>
        דיאגרמת ERD — Chen Notation
      </h2>

      <div style={{
        background: '#F9FAFB', borderRadius: '14px',
        border: '1px solid #E5E7EB', padding: '0.75rem',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        userSelect: 'none', overflowX: 'auto',
      }}>
        <svg viewBox={`0 0 800 ${CANVAS_H}`}
          style={{ width: '100%', minWidth: '560px', display: 'block' }}>

          {/* Dot grid */}
          <defs>
            <pattern id="dg" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#D1D5DB" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="800" height={CANVAS_H} fill="url(#dg)" />

          {/* ── Lines (drawn behind everything) ── */}
          {[ln1, ln2, ln3, ln4].map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={C.line} strokeWidth={1.8} />
          ))}

          {/* ── Cardinality labels ── */}
          <Card x={c0n_pat.x}   y={c0n_pat.y}   label="(0,N)" />
          <Card x={c0n_doc.x}   y={c0n_doc.y}   label="(0,N)" />
          <Card x={c11_book.x}  y={c11_book.y}  label="(1,1)" />
          <Card x={c11_recv.x}  y={c11_recv.y}  label="(1,1)" />

          {/* ── Entities ── */}
          <EntityCard cx={PAT_CX} cy={patCY} {...entities.patient} />
          <EntityCard cx={DOC_CX} cy={docCY} {...entities.doctor} />
          <EntityCard cx={APT_CX} cy={aptCY} w={175} {...entities.appointment} />

          {/* ── Diamonds ── */}
          <RelDiamond cx={BOOK_CX} cy={DIAM_Y} label="קובע" />
          <RelDiamond cx={RECV_CX} cy={DIAM_Y} label="מקבל" />
        </svg>
      </div>
    </div>
  );
}
