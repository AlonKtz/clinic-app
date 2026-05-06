const C = {
  entity: '#AA0000', entityBg: '#FFF0F0',
  relation: '#6d28d9', relationBg: '#EDE9FE',
  line: '#CBD5E1', mainLine: '#9B2020',
};
const FONT = "'Segoe UI', Arial, sans-serif";

function EntityRect({ cx, cy, label, w = 164, h = 54 }) {
  return (
    <g>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h}
        fill={C.entityBg} stroke={C.entity} strokeWidth={2.5} rx={7}
        style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.09))' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={17} fontWeight="700" fill={C.entity} fontFamily={FONT}>{label}</text>
    </g>
  );
}

function RelDiamond({ cx, cy, label, hw = 72, hh = 46 }) {
  const pts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
  return (
    <g>
      <polygon points={pts} fill={C.relationBg} stroke={C.relation} strokeWidth={2.5}
        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.07))' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize={14} fontWeight="700" fill={C.relation} fontFamily={FONT}>{label}</text>
    </g>
  );
}

export default function ERDView() {
  const PAT  = { x: 215, y: 195 };
  const DOC  = { x: 885, y: 195 };
  const APT  = { x: 550, y: 460 };
  const BOOK = { x: 368, y: 316 };
  const RECV = { x: 732, y: 316 };

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
        <svg viewBox="0 0 1100 640" style={{ width: '100%', minWidth: '600px', display: 'block' }}>

          <defs>
            <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#CBD5E1" opacity="0.45" />
            </pattern>
          </defs>
          <rect width="1100" height="640" fill="url(#dot-grid)" />

          {/* Relationship lines */}
          <line x1={PAT.x}  y1={PAT.y}  x2={BOOK.x} y2={BOOK.y} stroke={C.mainLine} strokeWidth={2} />
          <line x1={BOOK.x} y1={BOOK.y} x2={APT.x}  y2={APT.y}  stroke={C.mainLine} strokeWidth={2} />
          <line x1={DOC.x}  y1={DOC.y}  x2={RECV.x} y2={RECV.y} stroke={C.mainLine} strokeWidth={2} />
          <line x1={RECV.x} y1={RECV.y} x2={APT.x}  y2={APT.y}  stroke={C.mainLine} strokeWidth={2} />

          {/* Entities */}
          <EntityRect cx={PAT.x} cy={PAT.y} label="מטופל" />
          <EntityRect cx={DOC.x} cy={DOC.y} label="רופא" />
          <EntityRect cx={APT.x} cy={APT.y} label="תור" w={190} />

          {/* Relationships */}
          <RelDiamond cx={BOOK.x} cy={BOOK.y} label="קובע" />
          <RelDiamond cx={RECV.x} cy={RECV.y} label="מקבל" />
        </svg>
      </div>
    </div>
  );
}
