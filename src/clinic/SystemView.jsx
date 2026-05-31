// QFlow OS v2 — System Architecture View
const W = 1100, H = 530;

// ── Nodes ─────────────────────────────────────────────────────────────────────
const NODES = [
  {
    id: 'browser', label: 'Client Browser', sub: 'HTTPS · Web App',
    color: '#6BB7FF', soft: 'rgba(107,183,255,0.11)',
    x: 18, y: 210, w: 155, h: 105,
    tags: ['React SPA', 'Mobile + Desktop'],
  },
  {
    id: 'react', label: 'QFlow OS v2', sub: 'React 18 · Vite 5',
    color: '#FF5577', soft: 'rgba(255,45,85,0.11)',
    x: 220, y: 138, w: 182, h: 172,
    tags: ['Dashboard', 'Appointments', 'Doctors', 'Patients'],
  },
  {
    id: 'hosting', label: 'GitHub Pages', sub: 'Static CDN · CI/CD',
    color: '#6BB7FF', soft: 'rgba(107,183,255,0.09)',
    x: 220, y: 385, w: 182, h: 72,
    tags: ['alonktz.github.io'],
  },
  {
    id: 'api', label: 'PostgREST API', sub: 'Supabase · REST',
    color: '#00E5C7', soft: 'rgba(0,229,199,0.11)',
    x: 455, y: 138, w: 190, h: 172,
    tags: ['/clinic_doctors', '/clinic_patients', '/clinic_appointments'],
  },
  {
    id: 'realtime', label: 'Realtime Engine', sub: 'WebSocket · Pub/Sub',
    color: '#FFB454', soft: 'rgba(255,180,84,0.11)',
    x: 455, y: 385, w: 190, h: 72,
    tags: ['CDC · Live Sync'],
  },
  {
    id: 'db', label: 'PostgreSQL', sub: 'Supabase · Database',
    color: '#C58FFF', soft: 'rgba(197,143,255,0.11)',
    x: 702, y: 95, w: 380, h: 260,
    tags: ['clinic_doctors', 'clinic_patients', 'clinic_appointments', 'Row Level Security'],
  },
];

// Edges — label only on left-to-right paths (textPath reads L→R naturally)
// Return paths (R→L) have no label to avoid upside-down text
const EDGES = [
  { id:'br-re', label:'SPA Load',        color:'#6BB7FF', dur:'3.0s',
    d:'M173,262 C196,262 196,224 220,224' },

  { id:'gh-re', label:'Serves Bundle',   color:'#6BB7FF', dur:'4.5s',
    d:'M311,385 L311,310' },

  { id:'re-ap', label:'REST Requests',   color:'#00E5C7', dur:'1.8s',
    d:'M402,215 L455,215' },

  { id:'ap-re', label:'',               color:'#FF5577', dur:'1.6s',
    d:'M455,240 L402,240' },

  { id:'ap-db', label:'SQL Queries',    color:'#C58FFF', dur:'2.2s',
    d:'M645,215 L702,215' },

  { id:'db-ap', label:'',               color:'#C58FFF', dur:'1.9s',
    d:'M892,355 C892,440 550,440 550,310' },

  { id:'db-rt', label:'Change Events',  color:'#FFB454', dur:'2.8s',
    d:'M702,295 C672,295 672,421 645,421' },

  { id:'rt-re', label:'Live Push',      color:'#FFB454', dur:'2.1s',
    d:'M550,385 C550,328 402,328 402,224' },
];

// ── Node component ─────────────────────────────────────────────────────────────
function Node({ n }) {
  const { x, y, w, h, label, sub, color, soft, tags } = n;

  // Compact chip sizing — character width ~5.2px at fontSize 8.5
  const chipW = (tag) => Math.min(w - 30, Math.max(58, tag.length * 5.4 + 20));

  return (
    <g>
      {/* Shadow */}
      <rect x={x+3} y={y+5} width={w} height={h} rx={12} fill="rgba(0,0,0,0.5)" filter="url(#blur6)"/>
      {/* Body */}
      <rect x={x} y={y} width={w} height={h} rx={12} fill={soft} stroke={`${color}50`} strokeWidth={1.5}/>
      {/* Top accent */}
      <rect x={x+1} y={y} width={w-2} height={3} rx={1.5} fill={color}/>
      <rect x={x+1} y={y} width={w-2} height={3} rx={1.5} fill={color} filter="url(#blur8)" opacity={0.7}/>

      {/* Title */}
      <text x={x+14} y={y+28} fill="#fff" fontSize={14} fontWeight="700"
        fontFamily="Space Grotesk, Heebo, system-ui">{label}</text>

      {/* Sub label */}
      <text x={x+14} y={y+43} fill={color} fontSize={8.5} opacity={0.8}
        fontFamily="JetBrains Mono, monospace" letterSpacing="1.2">
        {sub.toUpperCase()}
      </text>

      {/* Divider */}
      <line x1={x+14} y1={y+51} x2={x+w-14} y2={y+51} stroke={`${color}30`} strokeWidth={1}/>

      {/* Tag chips — left-aligned, compact */}
      {tags.map((tag, i) => {
        const cw = chipW(tag);
        const ty = y + 60 + i * 21;
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

// ── Edge component ─────────────────────────────────────────────────────────────
function Edge({ e }) {
  const pid = `p${e.id}`;
  const dur = parseFloat(e.dur);

  return (
    <g>
      {/* Glow path (also acts as mpath target) */}
      <path id={pid} d={e.d} fill="none"
        stroke={e.color} strokeWidth={10} opacity={0.08} strokeLinecap="round"/>
      {/* Dashed stroke */}
      <path d={e.d} fill="none"
        stroke={e.color} strokeWidth={2} opacity={0.55}
        strokeDasharray="8 5" strokeLinecap="round"
        style={{ animation: `edge-flow ${e.dur} linear infinite` }}/>
      {/* Label (only on L→R edges) */}
      {e.label && (
        <text>
          <textPath href={`#${pid}`} startOffset="30%"
            style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'9px',
              fill: e.color, opacity: 0.65, letterSpacing: '0.1em' }}>
            {e.label}
          </textPath>
        </text>
      )}
      {/* Particles */}
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
      {/* Header */}
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
          letterSpacing:'0.16em', textTransform:'uppercase', marginTop:8 }}>
          React · PostgREST · PostgreSQL · Realtime WebSocket · GitHub Pages
        </div>
      </div>

      {/* Canvas */}
      <div style={{ borderRadius:16, overflow:'hidden',
        background:'rgba(4,5,12,0.9)', border:'1px solid rgba(255,255,255,0.07)',
        boxShadow:'0 0 80px rgba(0,0,0,0.6)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block' }}>
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

          <text x={16} y={H-12} fill="rgba(255,255,255,0.16)" fontSize={8.5}
            fontFamily="JetBrains Mono,monospace" letterSpacing="2">
            LIVE ANIMATION · QFLOW OS v2
          </text>
        </svg>
      </div>
    </div>
  );
}
