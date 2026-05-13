// Appointments view — list, filter, booking modal
function todayMin() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function AppointmentForm({doctors, patients, onSave, onCancel}) {
  const [f, setF] = React.useState({dateTime:'', reason:'', otherReason:'', doctorLicense:'', patientId:''});
  const [errs, setErrs] = React.useState({});
  const set = (k,v) => { setF(p=>({...p,[k]:v})); if(errs[k]) setErrs(p=>({...p,[k]:null})); };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.dateTime) er.dateTime = 'שדה חובה';
    if (!f.reason) er.reason = 'שדה חובה';
    if (f.reason === 'אחר' && !f.otherReason.trim()) er.otherReason = 'נא פרט';
    if (!f.doctorLicense) er.doctorLicense = 'יש לבחור רופא';
    if (!f.patientId) er.patientId = 'יש לבחור מטופל';
    if (Object.keys(er).length) { setErrs(er); return; }
    onSave({
      appointmentNumber: Math.floor(Math.random()*9000+1000),
      dateTime: f.dateTime,
      reason: f.reason === 'אחר' ? f.otherReason.trim() : f.reason,
      doctorLicense: f.doctorLicense, patientId: f.patientId,
    });
  };

  return (
    <form onSubmit={submit}>
      <div className="grid2">
        <Field label="רופא מקבל" error={errs.doctorLicense}>
          <select value={f.doctorLicense} onChange={e=>set('doctorLicense',e.target.value)}>
            <option value="">— בחר רופא —</option>
            {doctors.map(d => <option key={d.licenseNumber} value={d.licenseNumber}>{d.doctorName} · {d.licenseNumber}</option>)}
          </select>
        </Field>
        <Field label="מטופל קובע" error={errs.patientId}>
          <select value={f.patientId} onChange={e=>set('patientId',e.target.value)}>
            <option value="">— בחר מטופל —</option>
            {patients.map(p => <option key={p.idNumber} value={p.idNumber}>{p.patientName} · {p.idNumber}</option>)}
          </select>
        </Field>
        <Field label="תאריך ושעה" error={errs.dateTime}>
          <input type="datetime-local" min={todayMin()} value={f.dateTime} onChange={e=>set('dateTime',e.target.value)}/>
        </Field>
        <Field label="סיבת ביקור" error={errs.reason}>
          <select value={f.reason} onChange={e=>set('reason',e.target.value)}>
            <option value="">— בחר סיבה —</option>
            {QF_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>
      {f.reason === 'אחר' && (
        <div style={{marginTop:16}}>
          <Field label="פרט את הסיבה" error={errs.otherReason}>
            <input value={f.otherReason} onChange={e=>set('otherReason',e.target.value)} placeholder="תאר את הסיבה לביקור"/>
          </Field>
        </div>
      )}
      <div className="actions">
        <button type="button" className="btn ghost" onClick={onCancel}>ביטול</button>
        <button type="submit" className="btn primary">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-3 7 3z"/></svg>
          שמור תור
        </button>
      </div>
    </form>
  );
}

function AppointmentsView({appointments, doctors, patients, onAdd, onDelete}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [filterDoc, setFilterDoc] = React.useState('');
  const now = new Date();

  const getDoctor = (l) => doctors.find(d => d.licenseNumber === l);
  const getPatient = (i) => patients.find(p => p.idNumber === i);

  const filtered = React.useMemo(() => {
    const q = search.trim();
    return [...appointments]
      .filter(a => !filterDoc || a.doctorLicense === filterDoc)
      .filter(a => {
        if (!q) return true;
        const doc = getDoctor(a.doctorLicense)?.doctorName || '';
        const pat = getPatient(a.patientId)?.patientName || '';
        return (doc + pat + a.reason).includes(q);
      })
      .sort((a,b)=> new Date(a.dateTime) - new Date(b.dateTime));
  }, [appointments, search, filterDoc, doctors, patients]);

  return (
    <div className="reveal" style={{animationDelay:'.05s'}}>
      <PageHead
        eyebrow="01 · APPOINTMENTS"
        title="ניהול תורים"
        count={appointments.length} countLabel="LIVE IN SYSTEM"
        action={
          <button className="btn primary live" onClick={()=>setOpen(true)} style={{padding:'14px 22px', fontSize:14}}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            קבע תור חדש
          </button>
        }
      />

      <div className="filter-bar">
        <Search value={search} onChange={setSearch} placeholder="חפש מטופל, רופא או סיבה..."/>
        <Field label="">
          <select value={filterDoc} onChange={e=>setFilterDoc(e.target.value)} style={{padding:'10px 14px', fontSize:13, paddingLeft:32}}>
            <option value="">כל הרופאים</option>
            {doctors.map(d => <option key={d.licenseNumber} value={d.licenseNumber}>{d.doctorName}</option>)}
          </select>
        </Field>
        {(filterDoc || search) && (
          <button className="btn ghost" onClick={()=>{setSearch(''); setFilterDoc('');}} style={{padding:'10px 16px', fontSize:12}}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            נקה
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="אין תורים להצגה"
          sub={appointments.length===0 ? 'CLICK NEW APPOINTMENT TO BEGIN' : 'NO MATCHES FOR FILTER'}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
        />
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          {filtered.map((a, i) => {
            const isPast = new Date(a.dateTime) < now;
            const doc = getDoctor(a.doctorLicense);
            const pat = getPatient(a.patientId);
            return (
              <div key={a.appointmentNumber} className="list-row" style={{
                animation:'reveal-up 500ms var(--ease) backwards',
                animationDelay: `${i*0.04}s`,
                opacity: isPast ? 0.6 : 1,
                ...(isPast ? {} : {borderRight: '2px solid var(--red)'}),
              }}>
                <div className="av" style={isPast ? {background:'rgba(255,255,255,0.08)'} : {}}>
                  {pat ? initials(pat.patientName) : '??'}
                </div>
                <div className="body">
                  <div className="name">{pat ? pat.patientName : <em style={{color:'var(--red-bright)'}}>מטופל נמחק</em>}</div>
                  <div className="meta">
                    <span><strong>{fmtDateTime(a.dateTime)}</strong></span>
                    <span className="sep">·</span>
                    <span>{doc ? doc.doctorName : <em style={{color:'var(--red-bright)'}}>רופא נמחק</em>}</span>
                    <span className="sep">·</span>
                    <span style={{color:'var(--red-bright)'}}>{a.reason}</span>
                  </div>
                </div>
                <span className="stat" style={{fontFamily:'var(--font-mono)'}}>#{a.appointmentNumber}</span>
                {isPast
                  ? <span className="stat done">COMPLETE</span>
                  : <span className="stat live"><span style={{width:6,height:6,borderRadius:'50%',background:'currentColor', animation:'blip 1.2s infinite'}}/>SCHEDULED</span>
                }
                <button className="btn icon" onClick={()=>onDelete(a.appointmentNumber)} title="מחק">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <Modal title="קביעת תור חדש" sub="NEW APPOINTMENT · SCHEDULE PATIENT VISIT" onClose={()=>setOpen(false)}>
          <AppointmentForm doctors={doctors} patients={patients} onSave={a=>{ onAdd(a); setOpen(false); }} onCancel={()=>setOpen(false)}/>
        </Modal>
      )}
    </div>
  );
}

// ── Doctors view ────────────────────────────────────────────
function DoctorForm({existing, onSave, onCancel}) {
  const [f, setF] = React.useState({licenseNumber:'', doctorName:'', spec:''});
  const [errs, setErrs] = React.useState({});
  const set = (k,v) => { setF(p=>({...p,[k]:v})); if(errs[k]) setErrs(p=>({...p,[k]:null})); };
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    const lic = f.licenseNumber.trim();
    const nm = f.doctorName.trim();
    if (!lic) er.licenseNumber = 'שדה חובה';
    else if (!/^\d+$/.test(lic)) er.licenseNumber = 'ספרות בלבד';
    else if (existing.find(d=>d.licenseNumber===lic)) er.licenseNumber = 'מספר רישיון כבר קיים';
    if (!nm) er.doctorName = 'שדה חובה';
    else if (nm.length < 2) er.doctorName = 'שם קצר מדי';
    if (Object.keys(er).length) { setErrs(er); return; }
    onSave({licenseNumber: lic, doctorName: nm, spec: f.spec.trim() || 'כללי', online: true});
  };
  return (
    <form onSubmit={submit}>
      <div className="grid2">
        <Field label="שם הרופא" error={errs.doctorName}>
          <input autoFocus value={f.doctorName} onChange={e=>set('doctorName',e.target.value)} placeholder='ד״ר ישראל ישראלי'/>
        </Field>
        <Field label="מספר רישיון · PK" error={errs.licenseNumber}>
          <input value={f.licenseNumber} onChange={e=>set('licenseNumber',e.target.value)} placeholder="123456"/>
        </Field>
      </div>
      <div style={{marginTop:16}}>
        <Field label="תחום התמחות">
          <input value={f.spec} onChange={e=>set('spec',e.target.value)} placeholder="משפחה / פנימית / ילדים / ..."/>
        </Field>
      </div>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={onCancel}>ביטול</button>
        <button type="submit" className="btn primary">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-3 7 3z"/></svg>
          הוסף רופא
        </button>
      </div>
    </form>
  );
}

function DoctorsView({doctors, appointments, onAdd, onDelete}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const filtered = React.useMemo(() => {
    const q = search.trim();
    return doctors.filter(d => !q || (d.doctorName+d.licenseNumber+d.spec).includes(q));
  }, [doctors, search]);

  return (
    <div className="reveal" style={{animationDelay:'.05s'}}>
      <PageHead
        eyebrow="02 · DOCTORS"
        title="צוות הרופאים"
        count={doctors.length} countLabel="REGISTERED"
        action={
          <button className="btn primary" onClick={()=>setOpen(true)} style={{padding:'14px 22px', fontSize:14}}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            הוסף רופא
          </button>
        }
      />
      <div className="filter-bar">
        <Search value={search} onChange={setSearch} placeholder="חפש רופא לפי שם, רישיון או התמחות..."/>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="אין רופאים במערכת" sub="ADD A DOCTOR TO BEGIN"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="5" r="2"/><path d="M11 7v8a4 4 0 0 0 8 0V9M19 7v2"/></svg>}/>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          {filtered.map((d, i) => {
            const count = appointments.filter(a=>a.doctorLicense===d.licenseNumber).length;
            return (
              <div key={d.licenseNumber} className="list-row" style={{animation:'reveal-up 500ms var(--ease) backwards', animationDelay:`${i*0.05}s`}}>
                <div className="av">
                  {initials(d.doctorName)}
                  {d.online && <span className="pulse"/>}
                </div>
                <div className="body">
                  <div className="name">{d.doctorName}</div>
                  <div className="meta">
                    <span>רישיון <strong>#{d.licenseNumber}</strong></span>
                    <span className="sep">·</span>
                    <span>{d.spec}</span>
                    <span className="sep">·</span>
                    <span>{count} תורים</span>
                  </div>
                </div>
                <span className="stat" style={count>0?{background:'var(--red-soft)', color:'var(--red-bright)', borderColor:'rgba(255,45,85,0.4)'}:{}}>{count} APT</span>
                <span className={`stat ${d.online?'done':''}`}>{d.online ? 'ONLINE' : 'OFFLINE'}</span>
                <button className="btn icon" onClick={()=>onDelete(d.licenseNumber)} title="מחק">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <Modal title="הוספת רופא חדש" sub="NEW DOCTOR · ADD TO ROSTER" onClose={()=>setOpen(false)}>
          <DoctorForm existing={doctors} onSave={d=>{ onAdd(d); setOpen(false); }} onCancel={()=>setOpen(false)}/>
        </Modal>
      )}
    </div>
  );
}

// ── Patients view ──────────────────────────────────────────
function PatientForm({existing, onSave, onCancel}) {
  const [f, setF] = React.useState({idNumber:'', patientName:'', phoneNumber:''});
  const [errs, setErrs] = React.useState({});
  const set = (k,v) => { setF(p=>({...p,[k]:v})); if(errs[k]) setErrs(p=>({...p,[k]:null})); };
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    const id = f.idNumber.trim();
    const nm = f.patientName.trim();
    const ph = f.phoneNumber.trim();
    if (!id) er.idNumber = 'שדה חובה';
    else if (!/^\d{9}$/.test(id)) er.idNumber = 'תעודת זהות = 9 ספרות';
    else if (existing.find(p=>p.idNumber===id)) er.idNumber = 'ת.ז. כבר קיימת';
    if (!nm) er.patientName = 'שדה חובה';
    if (!ph) er.phoneNumber = 'שדה חובה';
    else if (!/^0\d{8,9}$/.test(ph.replace(/[-\s]/g,''))) er.phoneNumber = 'מספר טלפון לא תקין';
    if (Object.keys(er).length) { setErrs(er); return; }
    onSave({idNumber: id, patientName: nm, phoneNumber: ph});
  };
  return (
    <form onSubmit={submit}>
      <div className="grid3">
        <Field label="שם מלא" error={errs.patientName}>
          <input autoFocus value={f.patientName} onChange={e=>set('patientName',e.target.value)} placeholder="ישראל ישראלי"/>
        </Field>
        <Field label="ת.ז. · 9 ספרות · PK" error={errs.idNumber}>
          <input value={f.idNumber} maxLength={9} onChange={e=>set('idNumber',e.target.value.replace(/\D/g,''))} placeholder="123456789"/>
        </Field>
        <Field label="טלפון" error={errs.phoneNumber}>
          <input value={f.phoneNumber} onChange={e=>set('phoneNumber',e.target.value)} placeholder="0501234567"/>
        </Field>
      </div>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={onCancel}>ביטול</button>
        <button type="submit" className="btn primary">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-3 7 3z"/></svg>
          הוסף מטופל
        </button>
      </div>
    </form>
  );
}

function PatientsView({patients, appointments, onAdd, onDelete}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const filtered = React.useMemo(() => {
    const q = search.trim();
    return patients.filter(p => !q || (p.patientName+p.idNumber+p.phoneNumber).includes(q));
  }, [patients, search]);

  return (
    <div className="reveal" style={{animationDelay:'.05s'}}>
      <PageHead
        eyebrow="03 · PATIENTS"
        title="רשימת מטופלים"
        count={patients.length} countLabel="REGISTERED"
        action={
          <button className="btn primary" onClick={()=>setOpen(true)} style={{padding:'14px 22px', fontSize:14}}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            הוסף מטופל
          </button>
        }
      />
      <div className="filter-bar">
        <Search value={search} onChange={setSearch} placeholder="חפש מטופל לפי שם, ת.ז. או טלפון..."/>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="אין מטופלים במערכת" sub="ADD A PATIENT TO BEGIN"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>}/>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          {filtered.map((p, i) => {
            const count = appointments.filter(a=>a.patientId===p.idNumber).length;
            return (
              <div key={p.idNumber} className="list-row" style={{animation:'reveal-up 500ms var(--ease) backwards', animationDelay:`${i*0.05}s`}}>
                <div className="av teal">{initials(p.patientName)}</div>
                <div className="body">
                  <div className="name">{p.patientName}</div>
                  <div className="meta">
                    <span>ת.ז. <strong>{p.idNumber}</strong></span>
                    <span className="sep">·</span>
                    <span>טלפון <strong>{p.phoneNumber}</strong></span>
                    <span className="sep">·</span>
                    <span>{count} תורים</span>
                  </div>
                </div>
                <span className="stat" style={count>0?{background:'var(--teal-soft)', color:'var(--teal)', borderColor:'rgba(0,229,199,0.4)'}:{}}>{count} APT</span>
                <button className="btn icon" onClick={()=>onDelete(p.idNumber)} title="מחק">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <Modal title="הוספת מטופל חדש" sub="NEW PATIENT · REGISTER" onClose={()=>setOpen(false)}>
          <PatientForm existing={patients} onSave={p=>{ onAdd(p); setOpen(false); }} onCancel={()=>setOpen(false)}/>
        </Modal>
      )}
    </div>
  );
}

Object.assign(window, { AppointmentsView, DoctorsView, PatientsView });
