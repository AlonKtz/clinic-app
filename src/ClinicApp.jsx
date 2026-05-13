// QFlow OS v2 — Main app (ES module, Supabase wired)
import { useState, useEffect, useCallback } from 'react';
import DashboardView, { AuroraStage } from './clinic/DashboardView';
import AppointmentsView from './clinic/AppointmentsView';
import DoctorsView from './clinic/DoctorsView';
import PatientsView from './clinic/PatientsView';
import ERDView from './clinic/ERDView';
import { useToasts, useConfirm } from './clinic/shared';
import {
  getDoctors, addDoctor, deleteDoctor, deleteAppointmentsByDoctor,
  getPatients, addPatient, deletePatient, deleteAppointmentsByPatient,
  getAppointments, addAppointment, deleteAppointment,
} from './utils/db';

// ── Side navigation ───────────────────────────────────────────────────────────
function SideNav({ tab, setTab }) {
  const items = [
    {
      id: 'dashboard', label: 'Dashboard', he: 'לוח בקרה',
      ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>,
    },
    {
      id: 'appointments', label: 'Appointments', he: 'תורים',
      ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    },
    {
      id: 'doctors', label: 'Doctors', he: 'רופאים',
      ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2v3M19 2v3"/><path d="M6 5a6 6 0 0 1 12 0"/><path d="M12 11v6"/><circle cx="12" cy="20" r="2"/></svg>,
    },
    {
      id: 'patients', label: 'Patients', he: 'מטופלים',
      ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
    },
    {
      id: 'erd', label: 'ERD', he: 'ERD',
      ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>,
    },
  ];

  return (
    <nav className="sidenav">
      {items.map(it => (
        <button key={it.id} className={tab === it.id ? 'active' : ''} onClick={() => setTab(it.id)} title={it.label}>
          {it.ic}
          <span className="tip">{it.he}</span>
        </button>
      ))}
    </nav>
  );
}

// ── Loading spinner ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', gap: '1rem',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid rgba(255,45,85,0.2)',
        borderTop: '3px solid var(--red)',
        animation: 'qf-spin 0.8s linear infinite',
      }}/>
      <p style={{ color: 'var(--fg-3)', fontSize: 14, margin: 0, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}>
        LOADING · QFlow OS
      </p>
    </div>
  );
}

// ── Error screen ──────────────────────────────────────────────────────────────
function ErrorScreen({ message, onRetry }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', gap: '1rem', padding: '2rem',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--red-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--red-bright)',
      }}>
        <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M12 9v4M12 17h.01"/>
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        </svg>
      </div>
      <h2 style={{ margin: 0, color: 'var(--red-bright)', fontFamily: 'var(--font-sans)' }}>שגיאה בחיבור למסד הנתונים</h2>
      <p style={{ color: 'var(--fg-3)', fontSize: 14, textAlign: 'center', maxWidth: 400, margin: 0, fontFamily: 'var(--font-he)' }}>
        {message}
      </p>
      <button onClick={onRetry} style={{
        background: 'var(--red)', color: '#fff', border: 'none',
        borderRadius: 10, padding: '10px 22px', fontWeight: 700,
        fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-sans)',
      }}>נסה שוב</button>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function ClinicApp() {
  const [tab, setTab] = useState('dashboard');

  const [doctors,      setDoctors]      = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const [showToast, toastHost]   = useToasts();
  const [confirm,   confirmNode] = useConfirm();

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [d, p, a] = await Promise.all([getDoctors(), getPatients(), getAppointments()]);
      setDoctors(d); setPatients(p); setAppointments(a);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Doctors ────────────────────────────────────────────────────────────────
  const handleAddDoctor = async (doc) => {
    try {
      const created = await addDoctor(doc);
      setDoctors(p => [...p, created].sort((a, b) => a.doctorName.localeCompare(b.doctorName, 'he')));
      showToast(`${created.doctorName} נוסף בהצלחה`);
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeleteDoctor = async (licenseNumber) => {
    const ok = await confirm('למחוק רופא זה? כל התורים שלו יימחקו גם כן.');
    if (!ok) return;
    try {
      await deleteAppointmentsByDoctor(licenseNumber);
      await deleteDoctor(licenseNumber);
      setDoctors(p => p.filter(d => d.licenseNumber !== licenseNumber));
      setAppointments(p => p.filter(a => a.doctorLicense !== licenseNumber));
      showToast('הרופא נמחק', 'error');
    } catch (e) { showToast(e.message, 'error'); }
  };

  // ── Patients ───────────────────────────────────────────────────────────────
  const handleAddPatient = async (pat) => {
    try {
      const created = await addPatient(pat);
      setPatients(p => [...p, created].sort((a, b) => a.patientName.localeCompare(b.patientName, 'he')));
      showToast(`${created.patientName} נוסף/ה בהצלחה`);
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeletePatient = async (idNumber) => {
    const ok = await confirm('למחוק מטופל זה? כל התורים שלו יימחקו גם כן.');
    if (!ok) return;
    try {
      await deleteAppointmentsByPatient(idNumber);
      await deletePatient(idNumber);
      setPatients(p => p.filter(pt => pt.idNumber !== idNumber));
      setAppointments(p => p.filter(a => a.patientId !== idNumber));
      showToast('המטופל נמחק', 'error');
    } catch (e) { showToast(e.message, 'error'); }
  };

  // ── Appointments ───────────────────────────────────────────────────────────
  const handleAddAppointment = async (apt) => {
    try {
      const created = await addAppointment(apt);
      setAppointments(p => [...p, created].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)));
      showToast('התור נקבע בהצלחה');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeleteAppointment = async (num) => {
    const ok = await confirm('למחוק תור זה?');
    if (!ok) return;
    try {
      await deleteAppointment(num);
      setAppointments(p => p.filter(a => a.appointmentNumber !== num));
      showToast('התור נמחק', 'error');
    } catch (e) { showToast(e.message, 'error'); }
  };

  if (loading) return <LoadingScreen/>;
  if (error)   return <ErrorScreen message={error} onRetry={() => { setLoading(true); fetchAll(); }}/>;

  return (
    <>
      <AuroraStage/>
      <SideNav tab={tab} setTab={setTab}/>
      <div className="shell" data-tab={tab}>
        {tab === 'dashboard' && (
          <DashboardView appointments={appointments} doctors={doctors} patients={patients}/>
        )}
        {tab === 'appointments' && (
          <AppointmentsView
            appointments={appointments} doctors={doctors} patients={patients}
            onAdd={handleAddAppointment} onDelete={handleDeleteAppointment}
          />
        )}
        {tab === 'doctors' && (
          <DoctorsView
            doctors={doctors} appointments={appointments}
            onAdd={handleAddDoctor} onDelete={handleDeleteDoctor}
          />
        )}
        {tab === 'patients' && (
          <PatientsView
            patients={patients} appointments={appointments}
            onAdd={handleAddPatient} onDelete={handleDeletePatient}
          />
        )}
        {tab === 'erd' && (
          <div className="glass" style={{ padding: 24 }}>
            <ERDView/>
          </div>
        )}
      </div>
      {toastHost}
      {confirmNode}
    </>
  );
}
