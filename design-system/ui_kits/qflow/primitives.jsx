// Shared primitives for the QFlow UI kit
// Loads after React. Exports components onto window for cross-script use.

const QF = {
  red50:'#FFF1F1', red100:'#FFE0E0', red300:'#FF9090', red400:'#F85959',
  red500:'#E11D2C', red600:'#C00C1F', red700:'#9B0518',
  bg:'#FBF7F7', surface:'#FFFFFF', surface2:'#FAF3F3',
  line:'#EFE0E0', line2:'#E2D2D2',
  fg1:'#1A1414', fg2:'#4D3838', fg3:'#8A6F6F', fg4:'#B59A9A',
  success:'#14B8A6', successSoft:'#CFFAF1',
  warning:'#F59E0B', warningSoft:'#FEF3C7',
  danger:'#B91C1C', dangerSoft:'#FEE2E2',
  violet:'#7C3AED', violetSoft:'#EDE9FE',
  font:"'Heebo','Segoe UI','Arial Hebrew',system-ui,sans-serif",
  ease:'cubic-bezier(0.22,1,0.36,1)',
  shadow1:'0 1px 2px rgba(180,12,31,0.06)',
  shadow2:'0 4px 14px rgba(180,12,31,0.09), 0 1px 2px rgba(0,0,0,0.04)',
  shadow3:'0 14px 40px rgba(180,12,31,0.14), 0 2px 6px rgba(0,0,0,0.05)',
  glow:'0 0 0 6px rgba(225,29,44,0.16), 0 8px 28px rgba(225,29,44,0.28)',
  grad3d:'radial-gradient(120% 100% at 30% 20%, #FF7E7E 0%, #E11D2C 38%, #9B0518 78%, #420009 100%)',
};

// ── Lucide-equivalent inline SVGs (2px stroke) ────────────────
function I({d, size=18, weight=2}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke="currentColor" strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink:0}}>
      {d}
    </svg>
  );
}
const Icons = {
  hospital: <I d={<><path d="M12 6v4"/><path d="M8 8h8"/><path d="M9 22V12h6v10"/><path d="M5 22V4h14v18"/></>} />,
  calendar: <I d={<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>} />,
  steth:    <I d={<><circle cx="11" cy="5" r="2"/><path d="M11 7v8a4 4 0 0 0 8 0V9M19 7v2"/></>} />,
  user:     <I d={<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>} />,
  id:       <I d={<><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M8 11h2M8 15h6"/></>} />,
  phone:    <I d={<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>} />,
  clock:    <I d={<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>} />,
  trash:    <I d={<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>} />,
  save:     <I d={<path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-3 7 3z"/>} />,
  x:        <I d={<path d="M18 6 6 18M6 6l12 12"/>} />,
  plus:     <I d={<path d="M12 5v14M5 12h14"/>} />,
  check:    <I d={<path d="M20 6 9 17l-5-5"/>} />,
  alert:    <I d={<><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></>} />,
  database: <I d={<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></>} />,
};

// ── Buttons ──────────────────────────────────────────────────
function Button({variant='primary', children, glow, ...rest}) {
  const base = {
    fontFamily:'inherit', fontWeight:700, fontSize:14, border:'none',
    borderRadius:10, padding:'10px 18px', cursor:'pointer',
    display:'inline-flex', alignItems:'center', gap:6,
    transition:`all 220ms ${QF.ease}`,
  };
  const variants = {
    primary: {background:QF.red500, color:'#fff', boxShadow:glow?QF.glow:QF.shadow2},
    ghost:   {background:'#f5eded', color:QF.fg2},
    danger:  {background:QF.dangerSoft, color:QF.danger, padding:'8px 14px', fontSize:13},
    outline: {background:'#fff', color:QF.red600, border:`1.5px solid ${QF.red300}`},
  };
  return <button style={{...base, ...variants[variant]}} {...rest}>{children}</button>;
}

// ── Badge ────────────────────────────────────────────────────
function Badge({tone='primary', children, live}) {
  const tones = {
    primary: [QF.red50, QF.red500],
    success: [QF.successSoft, QF.success],
    warning: [QF.warningSoft, '#92400e'],
    muted:   ['#f1f5f9', '#64748b'],
    violet:  [QF.violetSoft, QF.violet],
  };
  const [bg, fg] = tones[tone];
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      background:bg, color:fg, borderRadius:999, padding:'3px 10px',
      fontSize:11, fontWeight:700, whiteSpace:'nowrap',
    }}>
      {live && <span style={{
        width:6, height:6, borderRadius:'50%', background:'currentColor',
        animation:'qf-pulse-soft 1.8s ease-in-out infinite',
      }} />}
      {children}
    </span>
  );
}

// ── Card ─────────────────────────────────────────────────────
function Card({children, accent, past, style, ...rest}) {
  return (
    <div style={{
      background:QF.surface, border:`1px solid ${QF.line}`, borderRadius:14,
      padding:'14px 18px', display:'flex', alignItems:'center', gap:14,
      boxShadow:QF.shadow1,
      borderRight: accent ? `4px solid ${accent}` : undefined,
      opacity: past ? 0.75 : 1,
      transition:`box-shadow 220ms ${QF.ease}, background 220ms ${QF.ease}`,
      ...style,
    }} {...rest}>{children}</div>
  );
}

// ── Field ────────────────────────────────────────────────────
function Field({label, error, hint, children}) {
  return (
    <div>
      <label style={{
        display:'block', fontSize:11, fontWeight:600, color:QF.fg3,
        marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em',
      }}>{label}</label>
      {children}
      {error && <p style={{color:QF.danger, fontSize:11, margin:'4px 0 0'}}>{error}</p>}
      {hint && !error && <p style={{color:QF.fg3, fontSize:11, margin:'4px 0 0'}}>{hint}</p>}
    </div>
  );
}
function Input({error, ...rest}) {
  return <input style={{
    width:'100%', boxSizing:'border-box', padding:'10px 12px',
    borderRadius:10, border:`1.5px solid ${error?QF.danger:QF.line}`,
    background: error ? '#fff5f5' : '#fff',
    fontSize:14, fontFamily:'inherit', color:QF.fg1, outline:'none',
    transition:'border-color 150ms, box-shadow 150ms',
  }} onFocus={e=>{if(!error){e.target.style.borderColor=QF.red400;e.target.style.boxShadow='0 0 0 4px rgba(225,29,44,.15)';}}}
     onBlur={e=>{e.target.style.borderColor=error?QF.danger:QF.line;e.target.style.boxShadow='none';}}
     {...rest} />;
}
function Select({error, children, ...rest}) {
  return <select style={{
    width:'100%', boxSizing:'border-box', padding:'10px 12px',
    borderRadius:10, border:`1.5px solid ${error?QF.danger:QF.line}`,
    background:'#fff', fontSize:14, fontFamily:'inherit',
    color:QF.fg1, outline:'none',
  }} {...rest}>{children}</select>;
}

// ── Logo Mark ────────────────────────────────────────────────
function LogoMark({size=44, pulse=true}) {
  return (
    <div style={{
      width:size, height:size, borderRadius:size*0.23,
      background:QF.grad3d, display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow:QF.shadow2, position:'relative', flexShrink:0,
    }}>
      {pulse && <span style={{
        position:'absolute', inset:-3, borderRadius:size*0.27,
        border:`2px solid ${QF.red500}`, opacity:0.4, pointerEvents:'none',
        animation:'qf-pulse-ring 1.8s cubic-bezier(.22,1,.36,1) infinite',
      }} />}
      <svg viewBox="0 0 32 32" width={size*0.55} height={size*0.55} fill="none"
           stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 16h5l3-7 4 14 3-9 3 4h6"/>
      </svg>
    </div>
  );
}

Object.assign(window, { QF, Icons, Button, Badge, Card, Field, Input, Select, LogoMark });
