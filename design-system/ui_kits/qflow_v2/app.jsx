// App root — orchestrates nav, state, all views.
// LiveDashboard rebinds the Dashboard's hardcoded data to live state.

function LiveDashboard({doctors, patients, appointments, onGoto}) {
  // We patch globals temporarily so Dashboard uses live data.
  React.useEffect(() => {
    const prevS = window.STREAM, prevD = window.DOCTORS;
    const now = new Date();
    const todayKey = now.toISOString().slice(0,10);
    const todays = appointments
      .filter(a => a.dateTime.slice(0,10) === todayKey)
      .sort((a,b)=> new Date(a.dateTime) - new Date(b.dateTime));
    // build stream from today's appts
    let livedSet = false;
    window.STREAM = todays.length ? todays.map((a,i) => {
      const doc = doctors.find(d=>d.licenseNumber===a.doctorLicense);
      const pat = patients.find(p=>p.idNumber===a.patientId);
      const dt = new Date(a.dateTime);
      const past = dt < now;
      let status = 'wait';
      if (past) status = 'done';
      else if (!livedSet) { status = 'next'; livedSet = true; }
      return {
        time: dt.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'}),
        name: pat?.patientName || '—',
        doc: doc?.doctorName || '—',
        reason: a.reason,
        status,
      };
    }) : prevS;
    window.DOCTORS = doctors.length ? doctors.map(d => ({
      id: d.licenseNumber,
      name: d.doctorName,
      initials: initials(d.doctorName),
      online: d.online !== false,
      spec: d.spec || 'כללי',
    })) : prevD;
    return () => { window.STREAM = prevS; window.DOCTORS = prevD; };
  }, [doctors, patients, appointments]);
  // Force render with key
  const key = doctors.length + '-' + patients.length + '-' + appointments.length;
  return <Dashboard key={key}/>;
}

function SideNav({tab, setTab}) {
  const items = [
    {id:'dashboard',    label:'Dashboard',   he:'לוח בקרה',   ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>},
    {id:'appointments', label:'Appointments',he:'תורים',     ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>},
    {id:'doctors',      label:'Doctors',     he:'רופאים',    ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="5" r="2"/><path d="M11 7v8a4 4 0 0 0 8 0V9M19 7v2"/></svg>},
    {id:'patients',     label:'Patients',    he:'מטופלים',   ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>},
  ];
  return (
    <nav className="sidenav">
      {items.map(it => (
        <button key={it.id} className={tab===it.id?'active':''} onClick={()=>setTab(it.id)} title={it.label}>
          {it.ic}
          <span className="tip">{it.he}</span>
        </button>
      ))}
    </nav>
  );
}

function App() {
  const [tab, setTab] = React.useState('dashboard');
  const [doctors, setDoctors] = React.useState(SEED_DOCTORS);
  const [patients, setPatients] = React.useState(SEED_PATIENTS);
  const [appointments, setAppointments] = React.useState(SEED_APPOINTMENTS);
  const [toast, toastHost] = useToasts();
  const [confirm, confirmNode] = useConfirm();

  const addAppt = (a) => { setAppointments(p=>[...p,a]); toast('התור נקבע בהצלחה'); };
  const delAppt = async (n) => { if (await confirm('למחוק תור זה?')) { setAppointments(p=>p.filter(a=>a.appointmentNumber!==n)); toast('התור נמחק', 'error'); } };
  const addDoc = (d) => { setDoctors(p=>[...p,d]); toast(`${d.doctorName} נוסף`); };
  const delDoc = async (l) => { if (await confirm('למחוק רופא? כל התורים שלו יימחקו.')) {
    setDoctors(p=>p.filter(d=>d.licenseNumber!==l));
    setAppointments(p=>p.filter(a=>a.doctorLicense!==l));
    toast('הרופא נמחק', 'error');
  } };
  const addPat = (p) => { setPatients(arr=>[...arr,p]); toast(`${p.patientName} נוסף/ה`); };
  const delPat = async (i) => { if (await confirm('למחוק מטופל? כל התורים שלו יימחקו.')) {
    setPatients(p=>p.filter(pt=>pt.idNumber!==i));
    setAppointments(p=>p.filter(a=>a.patientId!==i));
    toast('המטופל נמחק', 'error');
  } };

  return (
    <>
      <AuroraStage/>
      <SideNav tab={tab} setTab={setTab}/>
      <div className="shell" data-screen-label={`0${'dashboard appointments doctors patients'.split(' ').indexOf(tab)+1} ${tab}`}>
        {tab === 'dashboard' && (
          <LiveDashboard doctors={doctors} patients={patients} appointments={appointments} onGoto={setTab}/>
        )}
        {tab === 'appointments' && (
          <AppointmentsView appointments={appointments} doctors={doctors} patients={patients} onAdd={addAppt} onDelete={delAppt}/>
        )}
        {tab === 'doctors' && (
          <DoctorsView doctors={doctors} appointments={appointments} onAdd={addDoc} onDelete={delDoc}/>
        )}
        {tab === 'patients' && (
          <PatientsView patients={patients} appointments={appointments} onAdd={addPat} onDelete={delPat}/>
        )}
      </div>
      {toastHost}
      {confirmNode}
    </>
  );
}

Object.assign(window, { App });
