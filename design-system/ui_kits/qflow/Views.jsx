function fmtDateTime(dt){
  const d = new Date(dt);
  return d.toLocaleString('he-IL', {dateStyle:'short', timeStyle:'short'});
}

function AppointmentForm({doctors, patients, onSave, onCancel}) {
  const [f, setF] = React.useState({dateTime:'', reason:'', doctorLicense:'', patientId:''});
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <form onSubmit={e=>{e.preventDefault(); if(f.dateTime&&f.reason&&f.doctorLicense&&f.patientId){onSave({...f, appointmentNumber:Math.floor(Math.random()*900+100)}); setF({dateTime:'',reason:'',doctorLicense:'',patientId:''});}}} style={{
      background:'#fff', borderRadius:14, border:`2px solid ${QF.red400}`,
      padding:18, marginBottom:14, boxShadow:QF.shadow2,
      animation:`qf-fade-in 220ms ${QF.ease}`,
    }}>
      <h3 style={{margin:'0 0 14px', color:QF.red500, fontSize:16, display:'flex', alignItems:'center', gap:8}}>
        {Icons.calendar} קביעת תור חדש
      </h3>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <Field label="רופא מקבל">
          <Select value={f.doctorLicense} onChange={e=>set('doctorLicense', e.target.value)}>
            <option value="">— בחר רופא —</option>
            {doctors.map(d=> <option key={d.licenseNumber} value={d.licenseNumber}>{d.doctorName} (רישיון: {d.licenseNumber})</option>)}
          </Select>
        </Field>
        <Field label="מטופל קובע">
          <Select value={f.patientId} onChange={e=>set('patientId', e.target.value)}>
            <option value="">— בחר מטופל —</option>
            {patients.map(p=> <option key={p.idNumber} value={p.idNumber}>{p.patientName} (ת.ז.: {p.idNumber})</option>)}
          </Select>
        </Field>
        <Field label="תאריך ושעה">
          <Input type="datetime-local" value={f.dateTime} onChange={e=>set('dateTime', e.target.value)} />
        </Field>
        <Field label="סיבת ביקור">
          <Select value={f.reason} onChange={e=>set('reason', e.target.value)}>
            <option value="">— בחר סיבה —</option>
            {['בדיקה שגרתית','מעקב טיפול','כאבים / תלונות','בדיקות דם','המשך טיפול','ייעוץ'].map(r=> <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
      </div>
      <div style={{display:'flex', gap:10, marginTop:14}}>
        <Button type="submit" glow>{Icons.save} שמור תור</Button>
        <Button variant="ghost" type="button" onClick={onCancel}>{Icons.x} ביטול</Button>
      </div>
    </form>
  );
}

function AppointmentsView({appointments, doctors, patients, onAdd, onDelete}) {
  const [open, setOpen] = React.useState(false);
  const getDoctor = l => doctors.find(d => d.licenseNumber === l);
  const getPatient = i => patients.find(p => p.idNumber === i);
  const sorted = [...appointments].sort((a,b)=>new Date(a.dateTime)-new Date(b.dateTime));

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
        <h2 style={{margin:0, fontSize:22, fontWeight:800, color:QF.fg1}}>ניהול תורים</h2>
        <Button variant={open?'ghost':'primary'} glow={!open} onClick={()=>setOpen(o=>!o)}>
          {open ? <>{Icons.x} ביטול</> : <>{Icons.plus} קבע תור</>}
        </Button>
      </div>

      {open && <AppointmentForm doctors={doctors} patients={patients} onSave={a=>{onAdd(a); setOpen(false);}} onCancel={()=>setOpen(false)} />}

      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {sorted.map(a => {
          const past = new Date(a.dateTime) < new Date();
          const doc = getDoctor(a.doctorLicense);
          const pat = getPatient(a.patientId);
          return (
            <Card key={a.appointmentNumber} accent={past?'#94a3b8':QF.red400} past={past}>
              <div style={{
                width:42, height:42, borderRadius:'50%',
                background: past?'#f1f5f9':QF.red50,
                color: past?'#94a3b8':QF.red500,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:800, fontSize:13, flexShrink:0,
              }}>#{a.appointmentNumber}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap'}}>
                  <span style={{fontWeight:700, fontSize:14, color:QF.fg1, display:'inline-flex', alignItems:'center', gap:6}}>
                    {React.cloneElement(Icons.clock, {size:14})}
                    {fmtDateTime(a.dateTime)}
                  </span>
                  {past && <Badge tone="muted">עבר</Badge>}
                  {!past && <Badge tone="primary" live>פעיל</Badge>}
                  <Badge tone="primary">{a.reason}</Badge>
                </div>
                <div style={{fontSize:12, color:QF.fg3, display:'flex', gap:14, flexWrap:'wrap'}}>
                  <span style={{display:'inline-flex',alignItems:'center',gap:4}}>{React.cloneElement(Icons.steth,{size:13})} {doc?.doctorName}</span>
                  <span style={{display:'inline-flex',alignItems:'center',gap:4}}>{React.cloneElement(Icons.user,{size:13})} {pat?.patientName}</span>
                  {pat && <span style={{display:'inline-flex',alignItems:'center',gap:4}}>{React.cloneElement(Icons.phone,{size:13})} {pat.phoneNumber}</span>}
                </div>
              </div>
              <Button variant="danger" onClick={()=>onDelete(a.appointmentNumber)}>{Icons.trash} מחק</Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function DoctorsView({doctors, appointments, onAdd, onDelete}) {
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
        <h2 style={{margin:0, fontSize:22, fontWeight:800, color:QF.fg1}}>רשימת רופאים</h2>
        <Button>{Icons.plus} הוסף רופא</Button>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {doctors.map(d => {
          const count = appointments.filter(a => a.doctorLicense === d.licenseNumber).length;
          return (
            <Card key={d.licenseNumber}>
              <div style={{
                width:46, height:46, borderRadius:'50%',
                background:QF.red50, color:QF.red500,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>{React.cloneElement(Icons.steth, {size:22})}</div>
              <div style={{flex:1}}>
                <p style={{margin:0, fontWeight:700, fontSize:15, color:QF.fg1}}>{d.doctorName}</p>
                <p style={{margin:'3px 0 0', fontSize:12, color:QF.fg3, display:'flex', gap:14}}>
                  <span style={{display:'inline-flex',alignItems:'center',gap:4}}>{React.cloneElement(Icons.id,{size:13})} רישיון: <strong style={{color:QF.fg2}}>{d.licenseNumber}</strong></span>
                  <span style={{display:'inline-flex',alignItems:'center',gap:4}}>{React.cloneElement(Icons.calendar,{size:13})} {count} תורים</span>
                </p>
              </div>
              <Badge tone={count>0?'primary':'muted'}>{count} תורים</Badge>
              <Button variant="danger" onClick={()=>onDelete(d.licenseNumber)}>{Icons.trash} מחק</Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PatientsView({patients, appointments, onDelete}) {
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
        <h2 style={{margin:0, fontSize:22, fontWeight:800, color:QF.fg1}}>רשימת מטופלים</h2>
        <Button>{Icons.plus} הוסף מטופל</Button>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {patients.map(p => {
          const count = appointments.filter(a => a.patientId === p.idNumber).length;
          return (
            <Card key={p.idNumber}>
              <div style={{
                width:46, height:46, borderRadius:'50%',
                background:QF.successSoft, color:QF.success,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>{React.cloneElement(Icons.user, {size:22})}</div>
              <div style={{flex:1}}>
                <p style={{margin:0, fontWeight:700, fontSize:15, color:QF.fg1}}>{p.patientName}</p>
                <p style={{margin:'3px 0 0', fontSize:12, color:QF.fg3, display:'flex', gap:14, flexWrap:'wrap'}}>
                  <span style={{display:'inline-flex',alignItems:'center',gap:4}}>{React.cloneElement(Icons.id,{size:13})} ת.ז.: <strong style={{color:QF.fg2}}>{p.idNumber}</strong></span>
                  <span style={{display:'inline-flex',alignItems:'center',gap:4}}>{React.cloneElement(Icons.phone,{size:13})} <strong style={{color:QF.fg2}}>{p.phoneNumber}</strong></span>
                  <span style={{display:'inline-flex',alignItems:'center',gap:4}}>{React.cloneElement(Icons.calendar,{size:13})} {count} תורים</span>
                </p>
              </div>
              <Badge tone={count>0?'success':'muted'}>{count} תורים</Badge>
              <Button variant="danger" onClick={()=>onDelete(p.idNumber)}>{Icons.trash} מחק</Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { AppointmentsView, DoctorsView, PatientsView });
