import { useState, useEffect, useCallback } from 'react';
import DoctorsView from './clinic/DoctorsView';
import PatientsView from './clinic/PatientsView';
import AppointmentsView from './clinic/AppointmentsView';
import ERDView from './clinic/ERDView';
import { QF, colors } from './clinic/styles';
import { DocIcon, PatIcon, CalIcon, DBIcon } from './clinic/icons';
import {
  getDoctors, addDoctor, deleteDoctor, deleteAppointmentsByDoctor,
  getPatients, addPatient, deletePatient, deleteAppointmentsByPatient,
  getAppointments, addAppointment, deleteAppointment,
} from './utils/db';

// ── QFlow logo mark (ECG waveform) ────────────────────────────────────────
function LogoMark({ size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.23),
      background: QF.grad3d,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: QF.shadow2, position: 'relative', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', inset: -3, borderRadius: Math.round(size * 0.27),
        border: `2px solid ${QF.red500}`, opacity: 0.4, pointerEvents: 'none',
        animation: 'qf-pulse-ring 1.8s cubic-bezier(.22,1,.36,1) infinite',
      }} />
      <svg viewBox="0 0 32 32" width={size * 0.55} height={size * 0.55} fill="none"
        stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 16h5l3-7 4 14 3-9 3 4h6"/>
      </svg>
    </div>
  );
}

// ── Loading screen ────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: QF.bg, gap: '1rem', fontFamily: QF.font,
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        border: `3px solid ${QF.red100}`,
        borderTop: `3px solid ${QF.red500}`,
        animation: 'qf-spin 0.8s linear infinite',
      }} />
      <p style={{ color: QF.fg3, fontSize: '14px', margin: 0, fontWeight: 500 }}>טוען נתונים...</p>
    </div>
  );
}

// ── Error screen ──────────────────────────────────────────────────────────
function ErrorScreen({ message, onRetry }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: QF.bg, gap: '1rem', padding: '2rem', fontFamily: QF.font,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: QF.dangerSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: QF.danger,
      }}>
        <svg viewBox="0 0 24 24" width={28} height={28} fill="none"
          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4M12 17h.01"/>
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        </svg>
      </div>
      <h2 style={{ margin: 0, color: QF.danger, fontFamily: QF.font }}>שגיאה בחיבור למסד הנתונים</h2>
      <p style={{ color: QF.fg3, fontSize: '14px', textAlign: 'center', maxWidth: '400px', margin: 0 }}>
        {message}
      </p>
      <button onClick={onRetry} style={{
        background: QF.red500, color: '#fff', border: 'none',
        borderRadius: '10px', padding: '10px 22px', fontWeight: 700,
        fontSize: '14px', cursor: 'pointer', fontFamily: QF.font,
        boxShadow: QF.shadow2,
      }}>נסה שוב</button>
    </div>
  );
}

// ── Toast notification ────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
      background: type === 'error' ? QF.danger : QF.success,
      color: '#fff', borderRadius: '10px', padding: '10px 20px',
      fontSize: '14px', fontWeight: 600, zIndex: 9999,
      boxShadow: QF.shadow3, fontFamily: QF.font,
      animation: 'slideUp 0.2s ease', direction: 'rtl',
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      {type === 'error' ? '❌' : '✅'} {message}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

// ── Tab icon wrapper ──────────────────────────────────────────────────────
const TABS = [
  { id: 'appointments', label: 'תורים',   Icon: CalIcon, count: true },
  { id: 'doctors',      label: 'רופאים',  Icon: DocIcon, count: true },
  { id: 'patients',     label: 'מטופלים', Icon: PatIcon, count: true },
  { id: 'erd',          label: 'ERD',     Icon: DBIcon,  count: false },
];

// ── Main App ──────────────────────────────────────────────────────────────
export default function ClinicApp() {
  const [tab, setTab] = useState('appointments');

  const [doctors,      setDoctors]      = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [toast,   setToast]   = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

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

  // ── Doctors ─────────────────────────────────────────────────────────────
  const handleAddDoctor = async (doc) => {
    try {
      const created = await addDoctor(doc);
      setDoctors(p => [...p, created].sort((a, b) => a.doctorName.localeCompare(b.doctorName, 'he')));
      showToast(`${created.doctorName} נוסף בהצלחה`);
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeleteDoctor = async (licenseNumber) => {
    if (!window.confirm('למחוק רופא זה? כל התורים שלו יימחקו גם כן.')) return;
    try {
      await deleteAppointmentsByDoctor(licenseNumber);
      await deleteDoctor(licenseNumber);
      setDoctors(p => p.filter(d => d.licenseNumber !== licenseNumber));
      setAppointments(p => p.filter(a => a.doctorLicense !== licenseNumber));
      showToast('הרופא נמחק');
    } catch (e) { showToast(e.message, 'error'); }
  };

  // ── Patients ────────────────────────────────────────────────────────────
  const handleAddPatient = async (pat) => {
    try {
      const created = await addPatient(pat);
      setPatients(p => [...p, created].sort((a, b) => a.patientName.localeCompare(b.patientName, 'he')));
      showToast(`${created.patientName} נוסף/ה בהצלחה`);
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeletePatient = async (idNumber) => {
    if (!window.confirm('למחוק מטופל זה? כל התורים שלו יימחקו גם כן.')) return;
    try {
      await deleteAppointmentsByPatient(idNumber);
      await deletePatient(idNumber);
      setPatients(p => p.filter(pt => pt.idNumber !== idNumber));
      setAppointments(p => p.filter(a => a.patientId !== idNumber));
      showToast('המטופל נמחק');
    } catch (e) { showToast(e.message, 'error'); }
  };

  // ── Appointments ─────────────────────────────────────────────────────────
  const handleAddAppointment = async (apt) => {
    try {
      const created = await addAppointment(apt);
      setAppointments(p => [...p, created].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)));
      showToast('התור נקבע בהצלחה');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeleteAppointment = async (num) => {
    if (!window.confirm('למחוק תור זה?')) return;
    try {
      await deleteAppointment(num);
      setAppointments(p => p.filter(a => a.appointmentNumber !== num));
      showToast('התור נמחק');
    } catch (e) { showToast(e.message, 'error'); }
  };

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen message={error} onRetry={() => { setLoading(true); fetchAll(); }} />;

  const counts = { appointments: appointments.length, doctors: doctors.length, patients: patients.length };

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: QF.bg, fontFamily: QF.font }}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header style={{
        background: QF.grad3d,
        color: '#fff',
        padding: '0.85rem 1.5rem',
        boxShadow: QF.shadow3,
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <LogoMark size={44} />
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>QFlow</h1>
                <span style={{ opacity: 0.78, fontSize: '0.8rem', fontWeight: 400, color: '#fff' }}>מערכת ניהול תורים</span>
              </div>
            </div>
          </div>

          {/* Stat chips */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {TABS.filter(t => t.count).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: tab === t.id ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.14)',
                border: tab === t.id ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid transparent',
                borderRadius: '12px', padding: '6px 12px',
                color: '#fff', cursor: 'pointer', fontFamily: QF.font,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                minWidth: '52px', transition: `all 220ms ${QF.ease}`,
              }}>
                <span style={{ opacity: 0.85, color: '#fff', display: 'flex' }}>
                  <t.Icon size={18} />
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>{counts[t.id]}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Tab Bar ───────────────────────────────────────────────────── */}
      <nav style={{ background: QF.surface, borderBottom: `2px solid ${QF.line}`, boxShadow: QF.shadow1 }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex' }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '13px 20px', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: active ? 700 : 500, fontFamily: QF.font,
                color: active ? QF.red500 : QF.fg3,
                borderBottom: `3px solid ${active ? QF.red500 : 'transparent'}`,
                fontSize: '14px', display: 'flex', alignItems: 'center', gap: '7px',
                transition: `color 180ms ${QF.ease}, border-color 180ms ${QF.ease}`,
              }}>
                <span style={{ color: active ? QF.red500 : QF.fg4, display: 'flex' }}>
                  <t.Icon size={16} />
                </span>
                <span>{t.label}</span>
                {t.count && (
                  <span style={{
                    background: active ? QF.red50 : QF.surface2,
                    color: active ? QF.red500 : QF.fg4,
                    borderRadius: '999px', padding: '2px 8px',
                    fontSize: '11px', fontWeight: 700,
                  }}>{counts[t.id]}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem 1rem' }}>
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
        {tab === 'erd' && <ERDView />}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center', padding: '1.25rem', color: QF.fg4,
        fontSize: '13px', borderTop: `1px solid ${QF.line}`,
        marginTop: '2rem', background: QF.surface, fontFamily: QF.font,
      }}>
        <span style={{ fontWeight: 700, color: QF.red500 }}>QFlow</span>
        {' '}— מערכת ניהול תורים לקליניקה
      </footer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
