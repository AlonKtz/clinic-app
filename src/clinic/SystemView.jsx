// QFlow OS v2 — System Architecture View
const W = 1100, H = 500;

// ── Layout constants ──────────────────────────────────────────────────────────
// Row Y positions
const R1Y = 130;  // top row: React, API, DB
const R2Y = 372;  // bottom row: GitHub, Realtime
const COL = [50, 252, 488, 730]; // x for: Browser, React/GitHub, API/Realtime, DB

const NODES = [
  {
    id: 'browser', label: 'Client Browser', sub: 'HTTPS · Web App',
    color: '#6BB7FF', soft: 'rgba(107,183,255,0.11)',
    x: COL[0], y: 198, w: 152, h: 104,
    tags: ['React SPA', 'Mobile + Desktop'],
  },
  {
    id: 'react', label: 'QFlow OS v2', sub: 'React 18 · Vite 5',
    color: '#FF5577', soft: 'rgba(255,45,85,0.11)',
    x: COL[1], y: R1Y, w: 186, h: 176,
    tags: ['Dashboard', 'Appointments', 'Doctors', 'Patients'],
  },
  {
    id: 'hosting', label: 'GitHub Pages', sub: 'Static CDN · CI/CD',
    color: '#6BB7FF', soft: 'rgba(107,183,255,0.09)',
    x: COL[1], y: R2Y, w: 186, h: 72,
    tags: ['alonktz.github.io'],
  },
  {
    id: 'api', label: 'PostgREST API', sub: 'Supabase · REST',
    color: '#00E5C7', soft: 'rgba(0,229,199,0.11)',
    x: COL[2], y: R1Y, w: 192, h: 176,
    tags: ['/clinic_doctors', '/clinic_patients', '/clinic_appointments'],
  },
  {
    id: 'realtime', label: 'Realtime Engine', sub: 'WebSocket · Pub/Sub',
    color: '#FFB454', soft: 'rgba(255,180,84,0.11)',
    x: COL[2], y: R2Y, w: 192, h: 72,
    tags: ['CDC · Live Sync'],
  },
  {
    id: 'db', label: 'PostgreSQL', sub: 'Supabase · Database',
    color: '#C58FFF', soft: 'rgba(197,143,255,0.11)',
    x: COL[3], y: 90, w: 352, h: 220,
    tags: ['clinic_doctors', 'clinic_patients', 'clinic_appointments', 'Row Level Security'],
  },
];

// Pre-computed edge connection points
// React:    right=438, bottom=306, mid-y=218
// API:      left=488, right=680, bottom=306, mid-y=218
// DB:       left=730, bottom=310, mid-y=200
// Browser:  right=202, mid-y=250
// GitHub:   top=372, mid-x=345
// Realtime: left=488, right=680, top=372, mid-y=408

const EDGES = [
  // ── Forward paths (left→right) — labels shown ────────────────────────────
  { id:'br-re', color:'#6BB7FF', dur:'3.0s', label:'SPA Load',
    d:'M202,250 C228,250 228,218 252,218' },

  { id:'gh-re', color:'#6BB7FF', dur:'4.5s', label:'Bundle',
    d:'M345,372 L345,306' },

  { id:'re-ap', color:'#00E5C7', dur:'1.8s', label:'REST Requests',
    d:'M438,206 L488,206' },

  { id:'ap-db', color:'#C58FFF', dur:'2.2s', label:'SQL Queries',
    d:'M680,206 L730,206' },

  { id:'db-rt', color:'#FFB454', dur:'2.8s', label:'Change Events',
    d:'M730,262 C698,262 698,408 680,408' },

  { id:'rt-re', color:'#FFB454', dur:'2.1s', label:'Live Push',
    d:'M584,372 C584,312 438,312 438,228' },

  // ── Return paths (right→left) — no label to avoid upside-down text ───────
  { id:'ap-re', color:'#FF5577', dur:'1.6s', label:'',
    d:'M488,228 L438,228' },

  { id:'db-ap', color:'#C58FFF', dur:'1.9s', label:'',
    d:'M906,310 C906,470 584,470 584,306' },
];

// ── SVG Node ──────────────────────────────────────────────────────────────────
function Node({ n }) {
  const { x, y, w, h, label, sub, color, soft, tags } = n;
  const chipW = (t) => Math.min(w - 28, Math.max(56, t.length * 5.5 + 18));

  return (
    <g>
      <rect x={x+3} y={y+5} width={w} height={h} rx={12}
        fill="rgba(0,0,0,0.45)" filter="url(#blur6)"/>
      <rect x={x} y={y} width={w} height={h} rx={12}
        fill={soft} stroke={`${color}50`} strokeWidth={1.5}/>
      {/* Top accent */}
      <rect x={x+1} y={y} width={w-2} height={3} rx={1.5} fill={color}/>
      <rect x={x+1} y={y} width={w-2} height={3} rx={1.5}
        fill={color} filter="url(#blur8)" opacity={0.65}/>
      {/* Title */}
      <text x={x+14} y={y+26} fill="#fff" fontSize={14} fontWeight="700"
        fontFamily="Space Grotesk, Heebo, system-ui">{label}</text>
      {/* Sub */}
      <text x={x+14} y={y+41} fill={color} fontSize={8} opacity={0.8}
        fontFamily="JetBrains Mono, monospace" letterSpacing="1.3">
        {sub.toUpperCase()}
      </text>
      {/* Divider */}
      <line x1={x+14} y1={y+49} x2={x+w-14} y2={y+49}
        stroke={`${color}28`} strokeWidth={1}/>
      {/* Tag chips */}
      {tags.map((tag, i) => {
        const cw = chipW(tag);
        const ty = y + 57 + i * 21;
        return (
          <g key={tag}>
            <rect x={x+14} y={ty} width={cw} height={16} rx={4}
              fill={`${color}18`} stroke={`${color}40`} strokeWidth={0.8}/>
            <text x={x+22} y={ty+11} fill={color} fontSize={8.5} fontWeight={600}
              fontFamily="JetBrains Mono, monospace">{tag}</text>
          </g>
        );
      })}
    </g>
  );
}

// ── SVG Edge ──────────────────────────────────────────────────────────────────
function Edge({ e }) {
  const pid = `p${e.id}`;
  const dur = parseFloat(e.dur);

  return (
    <g>
      <path id={pid} d={e.d} fill="none"
        stroke={e.color} strokeWidth={10} opacity={0.07} strokeLinecap="round"/>
      <path d={e.d} fill="none"
        stroke={e.color} strokeWidth={2} opacity={0.5}
        strokeDasharray="8 5" strokeLinecap="round"
        style={{ animation: `edge-flow ${e.dur} linear infinite` }}/>
      {e.label && (
        <text>
          <textPath href={`#${pid}`} startOffset="28%"
            style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'9px',
              fill: e.color, opacity: 0.6, letterSpacing: '0.08em' }}>
            {e.label}
          </textPath>
        </text>
      )}
      {[0, 1/3, 2/3].map((frac, i) => (
        <circle key={i} r={5} fill={e.color}
          style={{ filter: `drop-shadow(0 0 7px ${e.color})` }}>
          <animateMotion dur={e.dur} begin={`-${(dur*frac).toFixed(2)}s`} repeatCount="indefinite">
            <mpath href={`#${pid}`}/>
          </animateMotion>
        </circle>
      ))}
    </g>
  );
}

// ── View ───────────────────────────────────────────────────────────────────────
export default function SystemView() {
  return (
    <div className="reveal" style={{ animationDelay: '.05s' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)',
          letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:6 }}>
          05 · ARCHITECTURE
        </div>
        <h1 style={{ margin:0, fontFamily:'var(--font-sans)', fontSize:36, fontWeight:800,
          letterSpacing:'-0.02em', lineHeight:1,
          background:'linear-gradient(180deg,#fff 40%,rgba(255,255,255,0.45))',
          WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent' }}>
          System Architecture
        </h1>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)',
          letterSpacing:'0.15em', textTransform:'uppercase', marginTop:8 }}>
          React · PostgREST · PostgreSQL · Realtime WebSocket · GitHub Pages
        </div>
      </div>

      <div style={{ borderRadius:16, overflow:'hidden',
        background:'rgba(4,5,12,0.9)', border:'1px solid rgba(255,255,255,0.07)',
        boxShadow:'0 0 60px rgba(0,0,0,0.5)' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          preserveAspectRatio="xMinYMin meet"
          style={{ display:'block', width:'100%', height:'auto' }}
        >
          <defs>
            <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
            <filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.055)"/>
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#dots)"/>
          {EDGES.map(e => <Edge key={e.id} e={e}/>)}
          {NODES.map(n => <Node key={n.id} n={n}/>)}
          <text x={20} y={H-12} fill="rgba(255,255,255,0.15)" fontSize={8.5}
            fontFamily="JetBrains Mono,monospace" letterSpacing="2">
            LIVE ANIMATION · QFLOW OS v2
          </text>
        </svg>
      </div>
    </div>
  );
}
