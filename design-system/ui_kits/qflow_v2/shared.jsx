// Shared modal, toast, field, search, list-row helpers and seed data

const QF_REASONS = ['בדיקה שגרתית','מעקב טיפול','כאבים / תלונות','בדיקות דם','המשך טיפול','ייעוץ','אחר'];

const SEED_DOCTORS = [
  {licenseNumber:'54321', doctorName:'ד״ר יעל כהן',     spec:'משפחה',     online:true},
  {licenseNumber:'67890', doctorName:'ד״ר משה לוי',     spec:'פנימית',    online:true},
  {licenseNumber:'11223', doctorName:'ד״ר רחל גולדברג', spec:'ילדים',     online:true},
  {licenseNumber:'44556', doctorName:'ד״ר אבי שפירא',   spec:'אורתופדיה', online:false},
];
const SEED_PATIENTS = [
  {idNumber:'123456789', patientName:'דנה אברהם',  phoneNumber:'052-1234567'},
  {idNumber:'234567891', patientName:'יוסי מזרחי', phoneNumber:'053-1234567'},
  {idNumber:'345678902', patientName:'מרים כהן',   phoneNumber:'054-1234567'},
  {idNumber:'456789013', patientName:'אורן לוי',   phoneNumber:'052-1111222'},
  {idNumber:'567890124', patientName:'שירה ברק',   phoneNumber:'050-3333444'},
  {idNumber:'678901235', patientName:'נועם גוטמן', phoneNumber:'054-4444555'},
];
const SEED_APPOINTMENTS = [
  {appointmentNumber:101, dateTime:'2026-05-13T09:00', reason:'בדיקה שגרתית',   doctorLicense:'54321', patientId:'123456789'},
  {appointmentNumber:102, dateTime:'2026-05-13T10:30', reason:'בדיקות דם',       doctorLicense:'67890', patientId:'234567891'},
  {appointmentNumber:103, dateTime:'2026-05-13T11:00', reason:'מעקב טיפול',      doctorLicense:'67890', patientId:'345678902'},
  {appointmentNumber:104, dateTime:'2026-05-14T08:30', reason:'כאבים / תלונות', doctorLicense:'11223', patientId:'456789013'},
  {appointmentNumber:105, dateTime:'2026-05-14T14:00', reason:'ייעוץ',           doctorLicense:'54321', patientId:'567890124'},
  {appointmentNumber:106, dateTime:'2026-05-15T09:30', reason:'המשך טיפול',      doctorLicense:'67890', patientId:'678901235'},
  {appointmentNumber:107, dateTime:'2026-05-09T11:00', reason:'בדיקה שגרתית',   doctorLicense:'11223', patientId:'123456789'},
  {appointmentNumber:108, dateTime:'2026-05-15T16:00', reason:'בדיקה שגרתית',   doctorLicense:'44556', patientId:'234567891'},
];

const initials = (name) => name.replace(/^ד״ר\s*/, '').split(/\s+/).map(w=>w[0]).join('').slice(0,2);

const fmtDateTime = (dt) => {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
};

// ── Field ────────────────────────────────────────────────
function Field({label, error, children}) {
  return (
    <div className={`field ${error?'err':''}`}>
      <label>{label}</label>
      {children}
      {error && <span className="errmsg">{error}</span>}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────
function Modal({title, sub, onClose, children}) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={(e)=>{ if(e.target.classList.contains('modal-overlay')) onClose(); }}>
      <div className="modal" dir="rtl">
        <div className="head">
          <div>
            {sub && <div className="sub">{sub}</div>}
            <h2 style={{marginTop:4}}>{title}</h2>
          </div>
          <button className="close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Toast host (manages a queue) ─────────────────────────
function useToasts() {
  const [items, setItems] = React.useState([]);
  const push = React.useCallback((message, type='success') => {
    const id = Math.random().toString(36).slice(2);
    setItems(arr => [...arr, {id, message, type}]);
    setTimeout(() => setItems(arr => arr.filter(t=>t.id!==id)), 2800);
  }, []);
  const host = (
    <div className="toast-host">
      {items.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="dot"/><span>{t.message}</span>
        </div>
      ))}
    </div>
  );
  return [push, host];
}

// ── Confirm prompt ───────────────────────────────────────
function useConfirm() {
  const [state, setState] = React.useState(null);
  const ask = React.useCallback((message) => new Promise(resolve => {
    setState({message, resolve});
  }), []);
  const node = state && (
    <div className="modal-overlay" onClick={(e)=>{ if(e.target.classList.contains('modal-overlay')) { state.resolve(false); setState(null); } }}>
      <div className="modal" dir="rtl" style={{maxWidth:460, textAlign:'center'}}>
        <div style={{margin:'0 auto 20px', width:60, height:60, borderRadius:18, background:'var(--red-soft)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,45,85,0.4)'}}>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FF5577" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
        </div>
        <h2 style={{margin:0, fontSize:22}}>{state.message}</h2>
        <p style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-3)', letterSpacing:'0.18em', textTransform:'uppercase', marginTop:8}}>This action cannot be undone</p>
        <div style={{display:'flex', gap:10, justifyContent:'center', marginTop:24}}>
          <button className="btn ghost" onClick={()=>{ state.resolve(false); setState(null); }}>ביטול</button>
          <button className="btn" style={{background:'rgba(255,45,85,0.16)', color:'var(--red-bright)', border:'1px solid rgba(255,45,85,0.4)'}} onClick={()=>{ state.resolve(true); setState(null); }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            כן, מחק
          </button>
        </div>
      </div>
    </div>
  );
  return [ask, node];
}

// ── Empty state ─────────────────────────────────────────
function EmptyState({title, sub, icon}) {
  return (
    <div className="empty" dir="rtl">
      <div className="ic-host">{icon}</div>
      <div className="t">{title}</div>
      <div className="s">{sub}</div>
    </div>
  );
}

// ── Search box ──────────────────────────────────────────
function Search({value, onChange, placeholder}) {
  return (
    <div className="search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>
    </div>
  );
}

// ── Page head ───────────────────────────────────────────
function PageHead({eyebrow, title, count, countLabel, action}) {
  return (
    <div className="page-head">
      <div className="title-block">
        <span className="label">{eyebrow}</span>
        <h1>{title}</h1>
        <div className="ksub">{count !== undefined ? `${String(count).padStart(2,'0')} · ${countLabel}` : ''}</div>
      </div>
      {action}
    </div>
  );
}

Object.assign(window, {
  QF_REASONS, SEED_DOCTORS, SEED_PATIENTS, SEED_APPOINTMENTS,
  initials, fmtDateTime,
  Field, Modal, useToasts, useConfirm, EmptyState, Search, PageHead,
});
