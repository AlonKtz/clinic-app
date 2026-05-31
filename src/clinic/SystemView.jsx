// QFlow OS v2 — System Architecture View
const W = 1180, H = 520;

// ── Nodes ─────────────────────────────────────────────────────────────────────
// Columns:  Browser  React/GitHub  API/Realtime  DB
//           x=70     x=285         x=545         x=800
const NODES = [
  {
    id: 'browser', label: 'Client Browser', sub: 'HTTPS · Web App',
    color: '#6BB7FF', soft: 'rgba(107,183,255,0.11)',
    x: 70, y: 205, w: 165, h: 108,
    tags: ['React SPA', 'Mobile + Desktop'],
  },
  {
    id: 'react', label: 'QFlow OS v2', sub: 'React 18 · Vite 5',
    color: '#FF5577', soft: 'rgba(255,45,85,0.11)',
    x: 285, y: 130, w: 195, h: 180,
    tags: ['Dashboard', 'Appointments', 'Doctors', 'Patients'],
  },
  {
    id: 'hosting', label: 'GitHub Pages', sub: 'Static CDN · CI/CD',
    color: '#6BB7FF', soft: 'rgba(107,183,255,0.09)',
    x: 285, y: 388, w: 195, h: 74,
    tags: ['alonktz.github.io'],
  },
  {
    id: 'api', label: 'PostgREST API', sub: 'Supabase · REST',
    color: '#00E5C7', soft: 'rgba(0,229,199,0.11)',
    x: 545, y: 130, w: 200, h: 180,
    tags: ['/clinic_doctors', '/clinic_patients', '/clinic_appointments'],
  },
  {
    id: 'realtime', label: 'Realtime Engine', sub: 'WebSocket · Pub/Sub',
    color: '#FFB454', soft: 'rgba(255,180,84,0.11)',
    x: 545, y: 388, w: 200, h: 74,
    tags: ['CDC · Live Sync'],
  },
  {
    id: 'db', label: 'PostgreSQL', sub: 'Supabase · Database',
    color: '#C58FFF', soft: 'rgba(197,143,255,0.11)',
    x: 800, y: 90, w: 320, h: 220,
    tags: ['clinic_doctors', 'clinic_patients', 'clinic_appointments', 'Row Level Security'],
  },
];

// Connection reference points:
// browser: right=235, midY=259
// react:   left=285, right=480, bottom=310, midY=220
// github:  top=388, midX=382
// api:     left=545, right=745, bottom=310, midY=220
// realtime:left=545, right=745, top=388, midY=425
// db:      left=800, bottom=310, midY=200

const EDGES = [
  // Forward (L→R) — labelled
  { id:'br-re', color:'#6BB7FF', dur:'3.0s', label:'SPA Load',
    d:'M235,259 C262,259 262,220 285,220' },

  { id:'gh-re', color:'#6BB7FF', dur:'4.5s', label:'Bundle',
    d:'M382,388 L382,310' },

  { id:'re-ap', color:'#00E5C7', dur:'1.8s', label:'REST Requests',
    d:'M480,208 L545,208' },

  { id:'ap-db', color:'#C58FFF', dur:'2.2s', label:'SQL Queries',
    d:'M745,208 L800,208' },

  { id:'db-rt', color:'#FFB454', dur:'2.8s', label:'Change Events',
    d:'M800,265 C765,265 765,425 745,425' },

  { id:'rt-re', color:'#FFB454', dur:'2.1s', label:'Live Push',
    d:'M645,388 C645,330 480,330 480,230' },

  // Return (R→L) — no label (textPath would render upside-down)
  { id:'ap-re', color:'#FF5577', dur:'1.6s', label:'',
    d:'M545,232 L480,232' },

  { id:'db-ap', color:'#C58FFF', dur:'1.9s', label:'',
    d:'M960,310 C960,475 645,475 645,310' },
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
      {e.label && (
        <text>
          <textPath href={`#${pid}`} startOffset="26%"
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

      {/* Aspect-ratio wrapper: width 100%, height locked to viewBox ratio.
          direction:ltr defeats the RTL overflow that was clipping the left.
          SVG is absolutely positioned to fill the box exactly — no height:auto
          ambiguity, no intrinsic-size conflicts. */}
      <div style={{
        position:'relative', width:'100%', aspectRatio:`${W} / ${H}`,
        borderRadius:16, overflow:'hidden', direction:'ltr',
        background:'rgba(4,5,12,0.9)', border:'1px solid rgba(255,255,255,0.07)',
        boxShadow:'0 0 60px rgba(0,0,0,0.5)',
      }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }}
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
