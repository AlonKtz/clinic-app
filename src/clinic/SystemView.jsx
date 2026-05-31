// QFlow OS v2 — System Architecture View
const W = 1300, H = 600;

// ── Nodes ─────────────────────────────────────────────────────────────────────
// Columns:  Browser   React/GitHub   API/Realtime   DB
//           x=60      x=325          x=635          x=950
const NODES = [
  {
    id: 'browser', label: 'Client Browser', sub: 'HTTPS · Web App',
    color: '#6BB7FF', soft: 'rgba(107,183,255,0.11)',
    x: 60, y: 245, w: 180, h: 112,
    tags: ['React SPA', 'Mobile + Desktop'],
  },
  {
    id: 'react', label: 'QFlow OS v2', sub: 'React 18 · Vite 5',
    color: '#FF5577', soft: 'rgba(255,45,85,0.11)',
    x: 325, y: 150, w: 205, h: 190,
    tags: ['Dashboard', 'Appointments', 'Doctors', 'Patients'],
  },
  {
    id: 'hosting', label: 'GitHub Pages', sub: 'Static CDN · CI/CD',
    color: '#6BB7FF', soft: 'rgba(107,183,255,0.09)',
    x: 325, y: 452, w: 205, h: 78,
    tags: ['alonktz.github.io'],
  },
  {
    id: 'api', label: 'PostgREST API', sub: 'Supabase · REST',
    color: '#00E5C7', soft: 'rgba(0,229,199,0.11)',
    x: 635, y: 150, w: 210, h: 190,
    tags: ['/clinic_doctors', '/clinic_patients', '/clinic_appointments'],
  },
  {
    id: 'realtime', label: 'Realtime Engine', sub: 'WebSocket · Pub/Sub',
    color: '#FFB454', soft: 'rgba(255,180,84,0.11)',
    x: 635, y: 452, w: 210, h: 78,
    tags: ['CDC · Live Sync'],
  },
  {
    id: 'db', label: 'PostgreSQL', sub: 'Supabase · Database',
    color: '#C58FFF', soft: 'rgba(197,143,255,0.11)',
    x: 950, y: 120, w: 350, h: 240,
    tags: ['clinic_doctors', 'clinic_patients', 'clinic_appointments', 'Row Level Security'],
  },
];

// Edge connection points for this layout:
//  browser  right=240  midY=301
//  react    left=325 right=530 top=150 bottom=340 midY=245
//  github   top=452 midX=427
//  api      left=635 right=845 top=150 bottom=340 midY=245
//  realtime left=635 right=845 top=452 midY=491
//  db       left=950 right=1300 bottom=360 midY=240
//
// lx/ly = explicit horizontal label anchor (plain <text>, never path-rotated)
const EDGES = [
  { id:'br-re', color:'#6BB7FF', dur:'3.0s', label:'SPA Load',      lx:283, ly:266,
    d:'M240,301 C283,301 283,245 325,245' },

  { id:'gh-re', color:'#6BB7FF', dur:'4.5s', label:'Bundle',        lx:427, ly:401,
    d:'M427,452 L427,340' },

  { id:'re-ap', color:'#00E5C7', dur:'1.8s', label:'REST Requests', lx:582, ly:226,
    d:'M530,236 L635,236' },

  { id:'ap-re', color:'#FF5577', dur:'1.6s', label:'JSON',          lx:582, ly:283,
    d:'M635,262 L530,262' },

  { id:'ap-db', color:'#C58FFF', dur:'2.2s', label:'SQL Queries',   lx:897, ly:226,
    d:'M845,236 L950,236' },

  { id:'db-ap', color:'#C58FFF', dur:'1.9s', label:'Query Results', lx:845, ly:572,
    d:'M1125,360 C1125,548 740,548 740,340' },

  { id:'db-rt', color:'#FFB454', dur:'2.8s', label:'Change Events', lx:920, ly:401,
    d:'M950,300 C905,300 905,491 845,491' },

  { id:'rt-re', color:'#FFB454', dur:'2.1s', label:'Live Push',     lx:600, ly:398,
    d:'M740,452 C740,400 530,400 530,260' },
];

// ── SVG Node ──────────────────────────────────────────────────────────────────
function Node({ n }) {
  const { x, y, w, h, label, sub, color, soft, tags } = n;
  const chipW = (t) => Math.min(w - 28, Math.max(56, t.length * 5.6 + 18));

  return (
    <g>
      <rect x={x+3} y={y+5} width={w} height={h} rx={12}
        fill="rgba(0,0,0,0.45)" filter="url(#blur6)"/>
      <rect x={x} y={y} width={w} height={h} rx={12}
        fill={soft} stroke={`${color}50`} strokeWidth={1.5}/>
      <rect x={x+1} y={y} width={w-2} height={3} rx={1.5} fill={color}/>
      <rect x={x+1} y={y} width={w-2} height={3} rx={1.5}
        fill={color} filter="url(#blur8)" opacity={0.65}/>
      <text x={x+15} y={y+27} fill="#fff" fontSize={14} fontWeight="700"
        fontFamily="Space Grotesk, Heebo, system-ui">{label}</text>
      <text x={x+15} y={y+42} fill={color} fontSize={8} opacity={0.8}
        fontFamily="JetBrains Mono, monospace" letterSpacing="1.3">
        {sub.toUpperCase()}
      </text>
      <line x1={x+15} y1={y+50} x2={x+w-15} y2={y+50}
        stroke={`${color}28`} strokeWidth={1}/>
      {tags.map((tag, i) => {
        const cw = chipW(tag);
        const ty = y + 58 + i * 21;
        return (
          <g key={tag}>
            <rect x={x+15} y={ty} width={cw} height={16} rx={4}
              fill={`${color}18`} stroke={`${color}40`} strokeWidth={0.8}/>
            <text x={x+23} y={ty+11} fill={color} fontSize={8.5} fontWeight={600}
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
      {[0, 1/3, 2/3].map((frac, i) => (
        <circle key={i} r={5} fill={e.color}
          style={{ filter: `drop-shadow(0 0 7px ${e.color})` }}>
          <animateMotion dur={e.dur} begin={`-${(dur*frac).toFixed(2)}s`} repeatCount="indefinite">
            <mpath href={`#${pid}`}/>
          </animateMotion>
        </circle>
      ))}
      {/* Horizontal label with dark halo — always readable, never path-rotated */}
      {e.label && (
        <text x={e.lx} y={e.ly} textAnchor="middle"
          style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'9.5px',
            fontWeight:600, fill:e.color, letterSpacing:'0.06em',
            paintOrder:'stroke', stroke:'#05060c', strokeWidth:4, strokeLinejoin:'round' }}>
          {e.label}
        </text>
      )}
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

      {/* Height follows width via aspect-ratio (no letterbox void). The shell
          goes full-width on this tab (see .shell[data-tab="system"] in CSS) so
          the diagram can actually grow on big screens. maxHeight guards very
          wide/short monitors; the SVG meet-centers either way. */}
      <div style={{ borderRadius:16, overflow:'hidden', direction:'ltr',
        width:'100%', aspectRatio:`${W} / ${H}`, maxHeight:'82vh',
        background:'rgba(4,5,12,0.9)', border:'1px solid rgba(255,255,255,0.07)',
        boxShadow:'0 0 60px rgba(0,0,0,0.5)',
        backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize:'30px 30px' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ display:'block', width:'100%', height:'100%' }}
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
          <text x={24} y={H-14} fill="rgba(255,255,255,0.15)" fontSize={8.5}
            fontFamily="JetBrains Mono,monospace" letterSpacing="2">
            LIVE ANIMATION · QFLOW OS v2
          </text>
        </svg>
      </div>
    </div>
  );
}
