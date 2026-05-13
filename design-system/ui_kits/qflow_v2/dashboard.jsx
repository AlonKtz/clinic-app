// QFlow OS v2 — futuristic clinic dashboard
// Aurora bg, EKG ticker, glass bento, kinetic counters, magnetic 3D hover

// ── Inline Lucide-ish icons ─────────────────────────────
const Ic = {
  pulse: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>,
  cal:   <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  steth: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="5" r="2"/><path d="M11 7v8a4 4 0 0 0 8 0V9M19 7v2"/></svg>,
  user:  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
  arrow: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M9 6l-6 6 6 6M3 12h18"/></svg>,
  check: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>,
  bolt:  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z"/></svg>,
  heart: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>,
};

// ── Seed data ────────────────────────────────────────────
const DOCTORS = [
  {id:'54321', name:'ד״ר יעל כהן',     initials:'יכ', online:true,  spec:'משפחה'},
  {id:'67890', name:'ד״ר משה לוי',     initials:'מל', online:true,  spec:'פנימית'},
  {id:'11223', name:'ד״ר רחל גולדברג', initials:'רג', online:true,  spec:'ילדים'},
  {id:'44556', name:'ד״ר אבי שפירא',   initials:'אש', online:false, spec:'אורתופדיה'},
];
const STREAM = [
  {time:'08:30', name:'אורן לוי',     doc:'ד״ר משה לוי',     reason:'בדיקות דם',     status:'done'},
  {time:'09:00', name:'דנה אברהם',    doc:'ד״ר יעל כהן',     reason:'בדיקה שגרתית', status:'next'},
  {time:'09:30', name:'יוסי מזרחי',   doc:'ד״ר משה לוי',     reason:'מעקב טיפול',    status:'live'},
  {time:'10:00', name:'מרים כהן',     doc:'ד״ר רחל גולדברג', reason:'כאבים / תלונות',status:'wait'},
  {time:'10:30', name:'שירה ברק',     doc:'ד״ר יעל כהן',     reason:'ייעוץ',         status:'wait'},
  {time:'11:00', name:'נועם גוטמן',   doc:'ד״ר אבי שפירא',   reason:'המשך טיפול',    status:'wait'},
  {time:'11:30', name:'תמר בן-דוד',   doc:'ד״ר רחל גולדברג', reason:'בדיקות דם',     status:'wait'},
  {time:'12:00', name:'איתן ארז',     doc:'ד״ר משה לוי',     reason:'בדיקה שגרתית', status:'wait'},
];

// ── Aurora layer (particles + blobs) ─────────────────────
function AuroraStage() {
  const particles = React.useMemo(() => Array.from({length:32}, (_,i) => ({
    left: Math.random()*100,
    delay: Math.random()*18,
    dur: 14 + Math.random()*16,
    size: 1 + Math.random()*2.4,
    hue: Math.random() > 0.6 ? 'var(--teal)' : 'var(--red-bright)',
  })), []);
  return (
    <>
      <div className="aurora-stage">
        <div className="aurora-blob a"/>
        <div className="aurora-blob b"/>
        <div className="aurora-blob c"/>
        <div className="aurora-blob d"/>
      </div>
      <div className="medgrid"/>
      <div className="grain"/>
      <div className="particles">
        {particles.map((p,i) => (
          <span key={i} className="particle" style={{
            left: p.left+'%', animationDelay: `-${p.delay}s`, animationDuration: `${p.dur}s`,
            width: p.size, height: p.size, background: p.hue,
            boxShadow: `0 0 ${p.size*4}px ${p.hue}`,
          }}/>
        ))}
      </div>
    </>
  );
}

// ── EKG line (scrolling heartbeat) ───────────────────────
function EKGLine() {
  const [bpm, setBpm] = React.useState(72);
  React.useEffect(() => {
    const t = setInterval(() => setBpm(b => Math.max(64, Math.min(82, b + (Math.random()-0.5)*4 | 0))), 2400);
    return () => clearInterval(t);
  }, []);
  // one heartbeat unit ~ 200px wide; repeat 6 across an 800px viewBox
  const beat = "0 30 30 30 36 30 40 14 44 46 48 22 52 30 90 30";
  const unit = "M " + beat.split(' ').reduce((a,v,i)=> a + (i%2 ? ','+v+' L ' : v+' '), '').replace(/ L $/, '');
  // Build a long path repeating the unit
  const reps = 8;
  const path = Array.from({length:reps}, (_,i) => {
    const off = i*120;
    return `M ${off} 30 L ${off+30} 30 L ${off+36} 30 L ${off+40} 14 L ${off+44} 46 L ${off+48} 22 L ${off+52} 30 L ${off+120} 30`;
  }).join(' ');
  return (
    <div className="ekg-host">
      <svg viewBox="0 0 960 60" preserveAspectRatio="none" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}>
        <defs>
          <linearGradient id="ekgGrad" x1="0" x2="1">
            <stop offset="0" stopColor="#FF2D55" stopOpacity="0"/>
            <stop offset="0.3" stopColor="#FF2D55" stopOpacity="1"/>
            <stop offset="0.6" stopColor="#FF5577" stopOpacity="1"/>
            <stop offset="1" stopColor="#FF2D55" stopOpacity="0"/>
          </linearGradient>
          <filter id="ekgGlow"><feGaussianBlur stdDeviation="2.5"/></filter>
        </defs>
        <g>
          <path d={path} fill="none" stroke="url(#ekgGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#ekgGlow)" opacity="0.7">
            <animateTransform attributeName="transform" type="translate" from="0,0" to="-480,0" dur="3.6s" repeatCount="indefinite"/>
          </path>
          <path d={path} fill="none" stroke="#FFD0DA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <animateTransform attributeName="transform" type="translate" from="0,0" to="-480,0" dur="3.6s" repeatCount="indefinite"/>
          </path>
        </g>
      </svg>
      <div style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', display:'flex', flexDirection:'column', gap:2, pointerEvents:'none'}}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.18em', textTransform:'uppercase'}}>Clinic vitals</span>
        <span style={{fontFamily:'var(--font-mono)', fontSize:13, color:'#fff', fontWeight:700}}>
          <span style={{color:'var(--red-bright)'}}>♥</span> {bpm} <span style={{color:'var(--fg-3)', fontWeight:400}}>bpm avg</span>
        </span>
      </div>
    </div>
  );
}

// ── Counter that ticks up ────────────────────────────────
function Counter({to, dur=1400, format=(n)=>String(n).padStart(2,'0')}) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    const start = performance.now();
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t-start)/dur);
      const eased = 1 - Math.pow(1-p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  return <>{format(n)}</>;
}

// ── Magnetic 3D tilt wrapper ─────────────────────────────
function Tilt({children, max=8, className='', style}) {
  const ref = React.useRef();
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateX(${-y*max}deg) rotateY(${x*max}deg) translateZ(0)`;
  };
  const onLeave = () => { ref.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0)'; };
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
    className={`tilt ${className}`} style={{transition:'transform 280ms cubic-bezier(0.22,1,0.36,1)', ...style}}>
    {children}
  </div>;
}

// ── Live "now" countdown ────────────────────────────────
function useCountdown(mins=14) {
  const [s, setS] = React.useState(mins*60);
  React.useEffect(() => { const t = setInterval(()=>setS(x=>Math.max(0,x-1)),1000); return ()=>clearInterval(t); },[]);
  const m = Math.floor(s/60), sec = s%60;
  return `${m}:${String(sec).padStart(2,'0')}`;
}

// ── Dashboard ───────────────────────────────────────────
function Dashboard() {
  const live = STREAM.find(s=>s.status==='live');
  const next = STREAM.find(s=>s.status==='next');
  const upcoming = next || live;
  const countdown = useCountdown(14);
  const [filter, setFilter] = React.useState('TODAY');
  const today = new Date().toLocaleDateString('en-GB', {weekday:'long', day:'2-digit', month:'short'});

  return (
    <div className="shell">
      {/* Top bar */}
      <div className="topbar reveal" style={{animationDelay:'0s'}}>
        <div className="brand">
          <div className="mark">{Ic.heart}</div>
          <div>
            <div className="word">QFlow<span style={{color:'var(--red)'}}>.</span>os</div>
            <div className="sub">Clinic Operating System · v2</div>
          </div>
        </div>
        <EKGLine/>
        <div className="vitals">
          <span className="vital"><span className="dot"/><span>live</span><span className="val">on-air</span></span>
          <span className="vital"><span>session</span><span className="val">Alon</span></span>
        </div>
      </div>

      {/* Bento */}
      <div className="bento">
        {/* HERO */}
        <Tilt className="cell hero reveal" style={{animationDelay:'.05s'}}>
          <div className="glass cell hero" style={{position:'relative', overflow:'hidden', height:'100%'}}>
            <div className="pulse-bg"/>
            <div className="hero-content">
              <div className="meta">
                <span className="label">Today's Pulse</span>
                <span className="date">{today}</span>
              </div>
              <div className="big-num">
                <span className="kdisplay"><Counter to={8}/></span>
                <span>
                  <div style={{fontFamily:'var(--font-he)', fontSize:22, fontWeight:700, direction:'rtl'}}>תורים</div>
                  <div className="delta">▲ 2 vs yesterday</div>
                </span>
              </div>
              <div style={{display:'flex', gap:24, alignItems:'flex-end'}}>
                <SparklineSvg/>
                <div style={{flex:1}}>
                  <div className="label" style={{marginBottom:6}}>Booked / Capacity</div>
                  <Capacity used={8} cap={12}/>
                </div>
              </div>
            </div>
          </div>
        </Tilt>

        {/* NEXT */}
        <Tilt className="cell next reveal" style={{animationDelay:'.1s'}}>
          <div className="glass cell next" style={{height:'100%', position:'relative'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <span className="countdown">NEXT UP · in {countdown}</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-3)', letterSpacing:'0.16em'}}>ROOM 03</span>
            </div>
            <div style={{marginTop:14}}>
              <div className="patient-name">{upcoming.name}</div>
              <div className="doctor">
                <span className="av">יכ</span>
                <span>{upcoming.doc}</span>
              </div>
            </div>
            <div className="row">
              <span className="chip">{upcoming.reason}</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:12, color:'var(--fg-2)'}}>{upcoming.time} · 09 may</span>
            </div>
            <div className="actions">
              <button className="btn primary">{Ic.check} CHECK-IN</button>
              <button className="btn ghost">פרטים מלאים</button>
            </div>
          </div>
        </Tilt>

        {/* KPI cells */}
        <Tilt className="cell kpi reveal" style={{animationDelay:'.15s'}}>
          <div className="glass cell kpi" style={{height:'100%'}}>
            <div className="row">
              <div>
                <div className="label">Doctors on duty</div>
                <div className="num"><Counter to={4} format={n=>String(n).padStart(2,'0')}/></div>
                <div className="trend">▲ 100% staffed</div>
              </div>
              <div className="ic">{Ic.steth}</div>
            </div>
          </div>
        </Tilt>

        <Tilt className="cell kpi teal reveal" style={{animationDelay:'.2s'}}>
          <div className="glass cell kpi teal" style={{height:'100%'}}>
            <div className="row">
              <div>
                <div className="label">Total patients</div>
                <div className="num"><Counter to={86} format={n=>String(n).padStart(2,'0')}/></div>
                <div className="trend" style={{color:'var(--teal)'}}>▲ 4 new this week</div>
              </div>
              <div className="ic">{Ic.user}</div>
            </div>
          </div>
        </Tilt>

        <Tilt className="cell kpi purple reveal" style={{animationDelay:'.25s'}}>
          <div className="glass cell kpi purple" style={{height:'100%'}}>
            <div className="row">
              <div>
                <div className="label">Avg wait time</div>
                <div className="num"><Counter to={12}/><span style={{fontSize:24, color:'var(--fg-3)'}}>m</span></div>
                <div className="trend" style={{color:'var(--purple)'}}>▼ 3m faster</div>
              </div>
              <div className="ic">{Ic.bolt}</div>
            </div>
          </div>
        </Tilt>

        {/* DUTY row */}
        <div className="cell duty reveal glass" style={{animationDelay:'.3s'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span className="label">On duty · 4 residents</span>
            <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.18em'}}>SWIPE →</span>
          </div>
          <div className="duty-row">
            {DOCTORS.map(d => (
              <div key={d.id} className={`doc-pill ${d.online?'online':''}`}>
                <div className="av" style={{
                  background: d.online ? 'linear-gradient(135deg, var(--red), var(--purple))' : 'var(--surface-2)',
                  color: d.online ? '#fff' : 'var(--fg-3)',
                }}>{d.initials}</div>
                <div>
                  <div className="nm">{d.name}</div>
                  <div className="meta">{d.spec} · #{d.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STREAM */}
        <div className="cell stream reveal glass" style={{animationDelay:'.35s'}}>
          <div className="stream-head">
            <span className="label">Stream · live appointment timeline</span>
            <div className="stream-toggle">
              {['TODAY','WEEK','MONTH'].map(t => (
                <button key={t} className={filter===t?'active':''} onClick={()=>setFilter(t)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="stream-list">
            <div className="stream-spine"/>
            {STREAM.map((row, i) => (
              <div key={i} className={`stream-row ${row.status}`} style={{animation:`reveal-up 600ms var(--ease) backwards`, animationDelay:`${0.4 + i*0.05}s`}}>
                <div className="body">
                  <div style={{
                    width:34, height:34, borderRadius:'50%',
                    background: row.status==='live' ? 'linear-gradient(135deg, var(--red), var(--purple))' : 'var(--surface-2)',
                    border:'1px solid var(--border-2)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'var(--font-he)', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0,
                  }}>
                    {row.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div className="pname">{row.name}</div>
                    <div className="docname">{row.doc}</div>
                  </div>
                  <div className="reason">
                    <span style={{
                      padding:'4px 10px', borderRadius:999,
                      background: row.status==='live' ? 'var(--red-soft)' : 'var(--surface-2)',
                      color: row.status==='live' ? 'var(--red-bright)' : 'var(--fg-2)',
                      fontSize:12, fontWeight:600,
                      border: '1px solid ' + (row.status==='live' ? 'rgba(255,45,85,0.32)' : 'var(--border)'),
                    }}>{row.reason}</span>
                  </div>
                </div>
                <div className="node"/>
                <div className="time">{row.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{textAlign:'center', marginTop:32, fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.2em'}}>
        QFLOW · OS v2.0 · BUILT WITH PULSE · BY ALON &amp; AFIK
      </div>
    </div>
  );
}

// Sparkline + Capacity widgets
function SparklineSvg() {
  const pts = [4,5,3,6,5,7,6,8];
  const max = Math.max(...pts);
  const w = 130, h = 40;
  const d = pts.map((v,i)=> `${i===0?'M':'L'} ${i*(w/(pts.length-1))} ${h - (v/max)*h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{flexShrink:0}}>
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FF2D55" stopOpacity="0.6"/>
          <stop offset="1" stopColor="#FF2D55" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill="url(#sg)"/>
      <path d={d} fill="none" stroke="#FF2D55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((v,i)=> <circle key={i} cx={i*(w/(pts.length-1))} cy={h-(v/max)*h} r={i===pts.length-1?3.5:2} fill={i===pts.length-1?'#FF5577':'#FF2D55'}/>)}
    </svg>
  );
}
function Capacity({used, cap}) {
  return (
    <div style={{width:'100%'}}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700}}>{used} / {cap}</span>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--teal)'}}>{Math.round(used/cap*100)}%</span>
      </div>
      <div style={{height:6, borderRadius:3, background:'rgba(255,255,255,0.08)', overflow:'hidden'}}>
        <div style={{
          width: (used/cap*100)+'%', height:'100%',
          background:'linear-gradient(90deg, var(--red), var(--red-bright))',
          boxShadow:'0 0 12px var(--red-glow)',
          transition:'width 1s var(--ease)',
        }}/>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, AuroraStage, Ic, Tilt, Counter, EKGLine, useCountdown, DOCTORS, STREAM });
