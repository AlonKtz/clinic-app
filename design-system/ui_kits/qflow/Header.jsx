function Header({tab}) {
  const tabs = [
    {id:'appointments', label:'תורים', icon:Icons.calendar, count:8},
    {id:'doctors', label:'רופאים', icon:Icons.steth, count:4},
    {id:'patients', label:'מטופלים', icon:Icons.user, count:6},
  ];
  return (
    <header style={{
      background: QF.grad3d, color:'#fff',
      padding:'18px 28px', position:'relative', overflow:'hidden',
      boxShadow:'0 2px 14px rgba(180,0,0,0.35)',
    }}>
      {/* gloss highlight */}
      <div style={{position:'absolute', top:-60, left:'-10%', width:'70%', height:140,
        background:'radial-gradient(ellipse, rgba(255,255,255,0.22), transparent 70%)',
        pointerEvents:'none'}} />
      <div style={{maxWidth:960, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, position:'relative'}}>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <LogoMark size={48} />
          <div>
            <div style={{display:'flex', alignItems:'baseline', gap:10}}>
              <h1 style={{margin:0, fontSize:28, fontWeight:800, letterSpacing:'-0.02em'}}>QFlow</h1>
              <span style={{opacity:0.78, fontSize:13, fontWeight:500}}>מערכת ניהול תורים</span>
            </div>
            <p style={{margin:'2px 0 0', opacity:0.65, fontSize:11}}>By Alon &amp; Afik</p>
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          {tabs.map(t => (
            <div key={t.id} style={{
              background:'rgba(255,255,255,0.16)', backdropFilter:'blur(8px)',
              borderRadius:12, padding:'8px 14px', minWidth:62,
              textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:2,
              border:'1px solid rgba(255,255,255,0.18)',
            }}>
              <span style={{opacity:0.85}}>{React.cloneElement(t.icon, {size:16})}</span>
              <div style={{fontSize:18, fontWeight:800, lineHeight:1}}>{t.count}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

function Tabs({tab, setTab}) {
  const tabs = [
    {id:'appointments', label:'תורים', icon:Icons.calendar, count:8},
    {id:'doctors', label:'רופאים', icon:Icons.steth, count:4},
    {id:'patients', label:'מטופלים', icon:Icons.user, count:6},
    {id:'erd', label:'ERD', icon:Icons.database, count:null},
  ];
  return (
    <nav style={{background:'#fff', borderBottom:`1px solid ${QF.line}`, boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
      <div style={{maxWidth:960, margin:'0 auto', display:'flex'}}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'14px 20px', border:'none', background:'none', cursor:'pointer',
              fontFamily:'inherit', fontWeight: active?800:600,
              color: active ? QF.red500 : QF.fg3,
              borderBottom: `3px solid ${active?QF.red500:'transparent'}`,
              fontSize:14, display:'flex', alignItems:'center', gap:8,
              transition:`all 180ms ${QF.ease}`,
            }}>
              <span>{React.cloneElement(t.icon, {size:18})}</span>
              <span>{t.label}</span>
              {t.count !== null && (
                <span style={{
                  background: active?QF.red50:'#f5eded', color: active?QF.red500:'#b08080',
                  borderRadius:999, padding:'1px 8px', fontSize:11, fontWeight:700,
                }}>{t.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

Object.assign(window, { Header, Tabs });
