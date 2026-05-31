// QFlow OS v2 — System Architecture View
import { } from 'react';

const W = 1100, H = 560;

// ── Nodes ─────────────────────────────────────────────────────────────────────
const NODES = [
  {
    id: 'browser', label: 'Client Browser', sub: 'HTTPS · Web App',
    color: '#6BB7FF', soft: 'rgba(107,183,255,0.11)',
    x: 15, y: 215, w: 162, h: 110,
    tags: ['React SPA', 'Mobile + Desktop'],
  },
  {
    id: 'react', label: 'QFlow OS v2', sub: 'React 18 · Vite 5',
    color: '#FF5577', soft: 'rgba(255,45,85,0.11)',
    x: 220, y: 135, w: 195, h: 188,
    tags: ['Dashboard', 'Appointments', 'Doctors', 'Patients'],
  },
  {
    id: 'hosting', label: 'GitHub Pages', sub: 'Static CDN · CI/CD',
    color: '#6BB7FF', soft: 'rgba(107,183,255,0.09)',
    x: 220, y: 400, w: 195, h: 78,
    tags: ['alonktz.github.io'],
  },
  {
    id: 'api', label: 'PostgREST API', sub: 'Supabase · REST Layer',
    color: '#00E5C7', soft: 'rgba(0,229,199,0.11)',
    x: 468, y: 135, w: 205, h: 188,
    tags: ['/clinic_doctors', '/clinic_patients', '/clinic_appointments'],
  },
  {
    id: 'realtime', label: 'Realtime Engine', sub: 'WebSocket · Pub/Sub',
    color: '#FFB454', soft: 'rgba(255,180,84,0.11)',
    x: 468, y: 400, w: 205, h: 78,
    tags: ['CDC · Live Sync'],
  },
  {
    id: 'db', label: 'PostgreSQL', sub: 'Supabase · Database',
    color: '#C58FFF', soft: 'rgba(197,143,255,0.11)',
    x: 728, y: 95, w: 358, h: 268,
    tags: ['clinic_doctors', 'clinic_patients', 'clinic_appointments', 'Row Level Security'],
  },
];

// Node edge-connection points (precomputed)
// React:    right=415, left=220, top=135, bottom=323, cx=317, cy=229
// API:      right=673, left=468, top=135, bottom=323, cx=570, cy=229
// DB:       right=1086,left=728, top=95,  bottom=363, cx=907, cy=229
// Browser:  right=177, cx=96,  cy=270
// GitHub:   top=400,   cx=317, cy=439
// Realtime: left=468,  right=673, top=400, cx=570, cy=439

const EDGES = [
  // Browser → React (SPA loads from hosting, user hits the app)
  { id:'br-re', label:'SPA Load',       color:'#6BB7FF', dur:'3.0s',
    d:'M177,270 C198,270 198,229 220,229' },

  // GitHub → React (bundle served upward)
  { id:'gh-re', label:'Serves Bundle',  color:'#6BB7FF', dur:'4.5s',
    d:'M317,400 L317,323' },

  // React → API (outgoing requests — upper lane)
  { id:'re-ap', label:'REST Requests',  color:'#00E5C7', dur:'1.8s',
    d:'M415,218 L468,218' },

  // API → React (JSON responses — lower lane)
  { id:'ap-re', label:'JSON Response',  color:'#FF5577', dur:'1.6s',
    d:'M468,242 L415,242' },

  // API → DB (SQL queries — upper lane)
  { id:'ap-db', label:'SQL Queries',    color:'#C58FFF', dur:'2.2s',
    d:'M673,218 L728,218' },

  // DB → API (results — sweeping curve below, fully inside canvas)
  { id:'db-ap', label:'Query Results',  color:'#C58FFF', dur:'1.9s',
    d:'M907,363 C907,450 570,450 570,323' },

  // DB left → Realtime right (change data capture)
  { id:'db-rt', label:'Change Events',  color:'#FFB454', dur:'2.8s',
    d:'M728,308 C698,308 698,439 673,439' },

  // Realtime top → API bottom → React right (live push upward)
  { id:'rt-re', label:'Live Push',      color:'#FFB454', dur:'2.1s',
    d:'M570,400 C570,340 415,340 415,229' },
];

// ── SVG Node ──────────────────────────────────────────────────────────────────
function Node({ n }) {
  const { x, y, w, h, label, sub, color, soft, tags } = n;
  return (
    <g>
      {/* Card shadow */}
      <rect x={x+3} y={y+4} width={w} height={h} rx={13} fill="rgba(0,0,0,0.45)" filter="url(#blur6)"/>
      {/* Card fill */}
      <rect x={x} y={y} width={w} height={h} rx={13} fill={soft} stroke={`${color}55`} strokeWidth={1.5}/>
      {/* Top accent bar */}
      <rect x={x} y={y} width={w} height={3} rx={1.5} fill={color}/>
      <rect x={x} y={y} width={w} height={3} rx={1.5} fill={color} filter="url(#blur8)" opacity={0.8}/>

      {/* Label */}
      <text x={x+16} y={y+30} fill="#fff" fontSize={15} fontWeight="700"
        fontFamily="Space Grotesk, Heebo, system-ui">{label}</text>

      {/* Sub */}
      <text x={x+16} y={y+46} fill={color} fontSize={9}
        fontFamily="JetBrains Mono, monospace" letterSpacing="1.2" opacity={0.85}>
        {sub.toUpperCase()}
      </text>

      {/* Divider */}
      <line x1={x+16} y1={y+56} x2={x+w-16} y2={y+56} stroke={`${color}33`} strokeWidth={1}/>

      {/* Tags */}
      {tags.map((tag, i) => {
        const tw = Math.min(w - 32, tag.length * 7.4 + 20);
        const ty = y + 66 + i * 22;
        return (
          <g key={tag}>
            <rect x={x+16} y={ty} width={tw} height={17} rx={5}
              fill={`${color}1A`} stroke={`${color}44`} strokeWidth={0.8}/>
            <text x={x+26} y={ty+11.5} fill={color} fontSize={8.5} fontWeight={600}
              fontFamily="JetBrains Mono, monospace">{tag}</text>
          </g>
        );
      })}
    </g>
  );
}

// ── SVG Edge ──────────────────────────────────────────────────────────────────
function Edge({ e }) {
  const pathId = `p${e.id}`;
  const dur = parseFloat(e.dur);
  return (
    <g>
      {/* Outer glow */}
      <path id={pathId} d={e.d} fill="none"
        stroke={e.color} strokeWidth={12} opacity={0.07} strokeLinecap="round"/>
      {/* Dashed line */}
      <path d={e.d} fill="none"
        stroke={e.color} strokeWidth={2} opacity={0.5}
        strokeDasharray="8 5" strokeLinecap="round"
        style={{ animation: `edge-flow ${e.dur} linear infinite` }}/>
      {/* Label */}
      <text>
        <textPath href={`#${pathId}`} startOffset="32%"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
            fill: e.color, opacity: 0.65, letterSpacing: '0.1em' }}>
          {e.label}
        </textPath>
      </text>
      {/* 3 glowing particles */}
      {[0, 1/3, 2/3].map((frac, i) => (
        <circle key={i} r={5} fill={e.color}
          style={{ filter: `drop-shadow(0 0 7px ${e.color})` }}>
          <animateMotion dur={e.dur} begin={`-${(dur * frac).toFixed(2)}s`} repeatCount="indefinite">
            <mpath href={`#${pathId}`}/>
          </animateMotion>
        </circle>
      ))}
    </g>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function SystemView() {
  return (
    <div className="reveal" style={{ animationDelay: '.05s' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)',
          letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 6 }}>
          05 · ARCHITECTURE
        </div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 38, fontWeight: 800,
          letterSpacing: '-0.02em', lineHeight: 1,
          background: 'linear-gradient(180deg,#fff 40%,rgba(255,255,255,0.45))',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          System Architecture
        </h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)',
          letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 8 }}>
          React · Supabase PostgREST · PostgreSQL · Realtime · GitHub Pages
        </div>
      </div>

      {/* Full-width SVG — viewBox scales to container */}
      <div style={{
        borderRadius: 18,
        background: 'rgba(4,5,12,0.88)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 0 80px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
            <filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
            {/* dot grid */}
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.06)"/>
            </pattern>
          </defs>

          {/* Background grid */}
          <rect width={W} height={H} fill="url(#dots)"/>

          {/* Edges (behind nodes) */}
          {EDGES.map(e => <Edge key={e.id} e={e}/>)}

          {/* Nodes */}
          {NODES.map(n => <Node key={n.id} n={n}/>)}

          {/* Legend */}
          <text x={16} y={H - 14} fill="rgba(255,255,255,0.18)" fontSize={9}
            fontFamily="JetBrains Mono, monospace" letterSpacing="2">
            LIVE ANIMATION · QFLOW OS v2
          </text>
        </svg>
      </div>
    </div>
  );
}
