// QFlow OS v2 — System Architecture View
// n8n-style animated node graph with live data-flow particles
import { useRef } from 'react';

// ── Canvas dimensions ─────────────────────────────────────────────────────────
const W = 950, H = 520;

// ── Node definitions ──────────────────────────────────────────────────────────
const NODES = [
  {
    id: 'browser', label: 'Client Browser', sub: 'HTTPS · Web App',
    color: '#6BB7FF', soft: 'rgba(107,183,255,0.15)',
    x: 8,   y: 198, w: 150, h: 88,
    tags: ['React SPA', 'Mobile / Desktop'],
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>
      </svg>
    ),
  },
  {
    id: 'react', label: 'QFlow OS v2', sub: 'React 18 · Vite 5',
    color: '#FF5577', soft: 'rgba(255,45,85,0.15)',
    x: 205, y: 130, w: 172, h: 138,
    tags: ['Dashboard', 'Appointments', 'Doctors', 'Patients'],
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="2"/>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"/>
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"/>
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)"/>
      </svg>
    ),
  },
  {
    id: 'hosting', label: 'GitHub Pages', sub: 'Static CDN · CI/CD',
    color: '#6BB7FF', soft: 'rgba(107,183,255,0.12)',
    x: 205, y: 348, w: 172, h: 72,
    tags: ['alonktz.github.io'],
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
      </svg>
    ),
  },
  {
    id: 'api', label: 'PostgREST API', sub: 'Supabase · REST Layer',
    color: '#00E5C7', soft: 'rgba(0,229,199,0.15)',
    x: 442, y: 130, w: 182, h: 138,
    tags: ['/clinic_doctors', '/clinic_patients', '/clinic_appointments'],
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z"/>
      </svg>
    ),
  },
  {
    id: 'realtime', label: 'Realtime Engine', sub: 'WebSocket · Pub/Sub',
    color: '#FFB454', soft: 'rgba(255,180,84,0.15)',
    x: 442, y: 348, w: 182, h: 72,
    tags: ['CDC · Live Sync'],
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M1 6l11 6 11-6"/><path d="M1 12l11 6 11-6"/><path d="M1 18l11 6 11-6"/>
      </svg>
    ),
  },
  {
    id: 'db', label: 'PostgreSQL', sub: 'Supabase · Database',
    color: '#C58FFF', soft: 'rgba(197,143,255,0.15)',
    x: 690, y: 105, w: 250, h: 198,
    tags: ['clinic_doctors', 'clinic_patients', 'clinic_appointments', 'Row Level Security'],
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
      </svg>
    ),
  },
];

// ── Edge helpers ──────────────────────────────────────────────────────────────
const nodeById = (id) => NODES.find(n => n.id === id);
const ncx = (id) => { const n = nodeById(id); return n.x + n.w / 2; };
const ncy = (id) => { const n = nodeById(id); return n.y + n.h / 2; };

function edge(fromId, toId, label, color, dur, c1, c2) {
  const x1 = ncx(fromId), y1 = ncy(fromId);
  const x2 = ncx(toId),   y2 = ncy(toId);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const d = `M${x1},${y1} C${(c1 || [mx, y1]).join(',')} ${(c2 || [mx, y2]).join(',')} ${x2},${y2}`;
  return { id: `${fromId}→${toId}`, label, color, dur, d };
}

const EDGES = [
  edge('browser',  'react',    'SPA Load',        '#6BB7FF', '3.0s'),
  edge('hosting',  'react',    'Serves Bundle',   '#6BB7FF', '4.5s', [291, 348], [291, 268]),
  edge('react',    'api',      'REST Requests',   '#00E5C7', '1.8s'),
  edge('api',      'db',       'SQL Queries',     '#C58FFF', '2.2s'),
  edge('db',       'api',      'Query Results',   '#C58FFF', '1.9s', [780, 295], [533, 310]),
  edge('api',      'react',    'JSON Responses',  '#FF5577', '1.6s', [533, 318], [381, 318]),
  edge('db',       'realtime', 'Change Events',   '#FFB454', '2.8s', [780, 405], [624, 420]),
  edge('realtime', 'react',    'Live Push',       '#FFB454', '2.1s', [442, 384], [377, 384]),
];

// ── Node Card (HTML over SVG) ─────────────────────────────────────────────────
function NodeCard({ node }) {
  return (
    <div style={{
      position: 'absolute',
      left: node.x, top: node.y, width: node.w, height: node.h,
      background: `linear-gradient(135deg, ${node.soft}, rgba(255,255,255,0.03))`,
      border: `1px solid ${node.color}44`,
      borderTop: `2px solid ${node.color}`,
      borderRadius: 14,
      padding: '12px 14px',
      boxShadow: `0 0 0 1px ${node.color}18, 0 8px 32px rgba(0,0,0,0.4), 0 0 40px ${node.color}22`,
      backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', gap: 5,
      zIndex: 2,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: node.color, display: 'flex', flexShrink: 0 }}>{node.icon}</span>
        <div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontWeight: 700,
            fontSize: 13, color: '#fff', lineHeight: 1.2,
          }}>{node.label}</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase',
            marginTop: 2,
          }}>{node.sub}</div>
        </div>
      </div>
      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
        {node.tags.map(t => (
          <span key={t} style={{
            background: `${node.color}18`, color: node.color,
            border: `1px solid ${node.color}33`,
            borderRadius: 6, padding: '2px 6px',
            fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 600,
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ── Animated edge with particles ──────────────────────────────────────────────
function Edge({ e }) {
  const pathId = `p-${e.id.replace(/[→]/g, '-')}`;
  const delays = [0, 0.33, 0.66];
  const durSec = parseFloat(e.dur);

  return (
    <g>
      {/* Glow path */}
      <path id={pathId} d={e.d} fill="none"
        stroke={e.color} strokeWidth={8} opacity={0.12}
        style={{ filter: `blur(4px)` }}/>
      {/* Crisp dashed path */}
      <path d={e.d} fill="none"
        stroke={e.color} strokeWidth={1.5} opacity={0.45}
        strokeDasharray="7 5"
        style={{ animation: `edge-flow ${e.dur} linear infinite` }}/>
      {/* Arrowhead at end approximated via a small circle at destination */}
      {/* Flowing particles */}
      {delays.map((frac, i) => (
        <circle key={i} r={4} fill={e.color}
          style={{ filter: `drop-shadow(0 0 5px ${e.color})` }}>
          <animateMotion
            dur={e.dur}
            begin={`-${(durSec * frac).toFixed(2)}s`}
            repeatCount="indefinite"
            rotate="auto">
            <mpath href={`#${pathId}`}/>
          </animateMotion>
        </circle>
      ))}
      {/* Edge label (midpoint) */}
      <text style={{ pointerEvents: 'none' }}>
        <textPath href={`#${pathId}`} startOffset="42%"
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px',
            fill: e.color, opacity: 0.7, letterSpacing: '0.12em',
          }}>
          {e.label}
        </textPath>
      </text>
    </g>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function SystemView() {
  return (
    <div className="reveal" style={{ animationDelay: '.05s' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)',
          letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 6,
        }}>05 · ARCHITECTURE</div>
        <h1 style={{
          margin: 0, fontFamily: 'var(--font-he)', fontSize: 40, fontWeight: 800,
          letterSpacing: '-0.02em', lineHeight: 1,
          background: 'linear-gradient(180deg, #fff 40%, rgba(255,255,255,0.45))',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}>System Architecture</h1>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
          letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 8,
        }}>React · Supabase · PostgreSQL · Realtime · GitHub Pages</div>
      </div>

      {/* Centered canvas */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          position: 'relative',
          width: W, height: H,
          flexShrink: 0,
          borderRadius: 18,
          background: 'rgba(4,5,12,0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 0 80px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          overflow: 'hidden',
        }}>
          {/* SVG layer — edges + particles */}
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width={W} height={H}
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
          >
            {EDGES.map(e => <Edge key={e.id} e={e}/>)}
          </svg>

          {/* HTML node cards */}
          {NODES.map(n => <NodeCard key={n.id} node={n}/>)}

          {/* Legend */}
          <div style={{
            position: 'absolute', bottom: 14, left: 16,
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'rgba(255,255,255,0.18)', letterSpacing: '0.2em',
            textTransform: 'uppercase', zIndex: 3,
          }}>
            LIVE ANIMATION
          </div>
        </div>
      </div>
    </div>
  );
}
