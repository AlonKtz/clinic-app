import { useState, useEffect, useCallback } from 'react';
import DoctorsView from './clinic/DoctorsView';
import PatientsView from './clinic/PatientsView';
import AppointmentsView from './clinic/AppointmentsView';
import ERDView from './clinic/ERDView';
import { colors } from './clinic/styles';
import {
  getDoctors, addDoctor, deleteDoctor, deleteAppointmentsByDoctor,
  getPatients, addPatient, deletePatient, deleteAppointmentsByPatient,
  getAppointments, addAppointment, deleteAppointment,
} from './utils/db';

// ── Loading screen ─────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: colors.bg, gap: '1rem',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        border: `4px solid ${colors.primaryBg}`,
        borderTop: `4px solid ${colors.primary}`,
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: colors.textMuted, fontSize: '0.9rem', margin: 0 }}>טוען נתונים...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Error screen ───────────────────────────────────────────────────────────
function ErrorScreen({ message, onRetry }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: colors.bg, gap: '1rem', padding: '2rem',
    }}>
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h2 style={{ margin: 0, color: colors.danger }}>שגיאה בחיבור למסד הנתונים</h2>
      <p style={{ color: colors.textMuted, fontSize: '0.85rem', textAlign: 'center', maxWidth: '400px' }}>
        {message}
      </p>
      <button onClick={onRetry} style={{
        background: colors.primary, color: '#fff', border: 'none',
        borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: 700,
        fontSize: '0.9rem', cursor: 'pointer',
      }}>נסה שוב</button>
    </div>
  );
}

// ── Toast notification ─────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
      background: type === 'error' ? colors.danger : '#16a34a',
      color: '#fff', borderRadius: '10px', padding: '0.7rem 1.4rem',
      fontSize: '0.88rem', fontWeight: 600, zIndex: 9999,
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      animation: 'slideUp 0.2s ease',
      direction: 'rtl',
    }}>
      {type === 'error' ? '❌ ' : '✅ '}{message}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function ClinicApp() {
  const [tab, setTab] = useState('appointments');

  const [doctors,      setDoctors]      = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [toast,   setToast]   = useState(null); // { message, type }

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Fetch all data ────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [d, p, a] = await Promise.all([getDoctors(), getPatients(), getAppointments()]);
      setDoctors(d);
      setPatients(p);
      setAppointments(a);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Doctors ───────────────────────────────────────────────────────────────
  const handleAddDoctor = async (doc) => {
    try {
      const created = await addDoctor(doc);
      setDoctors(p => [...p, created].sort((a, b) => a.doctorName.localeCompare(b.doctorName, 'he')));
      showToast(`${created.doctorName} נוסף בהצלחה`);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDeleteDoctor = async (licenseNumber) => {
    if (!window.confirm('למחוק רופא זה? כל התורים שלו יימחקו גם כן.')) return;
    try {
      await deleteAppointmentsByDoctor(licenseNumber);
      await deleteDoctor(licenseNumber);
      setDoctors(p => p.filter(d => d.licenseNumber !== licenseNumber));
      setAppointments(p => p.filter(a => a.doctorLicense !== licenseNumber));
      showToast('הרופא נמחק בהצלחה');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // ── Patients ──────────────────────────────────────────────────────────────
  const handleAddPatient = async (pat) => {
    try {
      const created = await addPatient(pat);
      setPatients(p => [...p, created].sort((a, b) => a.patientName.localeCompare(b.patientName, 'he')));
      showToast(`${created.patientName} נוסף/ה בהצלחה`);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDeletePatient = async (idNumber) => {
    if (!window.confirm('למחוק מטופל זה? כל התורים שלו יימחקו גם כן.')) return;
    try {
      await deleteAppointmentsByPatient(idNumber);
      await deletePatient(idNumber);
      setPatients(p => p.filter(pt => pt.idNumber !== idNumber));
      setAppointments(p => p.filter(a => a.patientId !== idNumber));
      showToast('המטופל נמחק בהצלחה');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // ── Appointments ──────────────────────────────────────────────────────────
  const handleAddAppointment = async (apt) => {
    try {
      const created = await addAppointment(apt);
      setAppointments(p => [...p, created].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)));
      showToast('התור נקבע בהצלחה');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDeleteAppointment = async (num) => {
    if (!window.confirm('למחוק תור זה?')) return;
    try {
      await deleteAppointment(num);
      setAppointments(p => p.filter(a => a.appointmentNumber !== num));
      showToast('התור נמחק בהצלחה');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen message={error} onRetry={() => { setLoading(true); fetchAll(); }} />;

  const tabs = [
    { id: 'appointments', label: 'תורים',   icon: '📅',  count: appointments.length },
    { id: 'doctors',      label: 'רופאים',  icon: '👨‍⚕️', count: doctors.length },
    { id: 'patients',     label: 'מטופלים', icon: '🧑',  count: patients.length },
    { id: 'erd',          label: 'ERD',     icon: '🗂️',  count: null },
  ];

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: colors.bg, fontFamily: 'Segoe UI, Arial, sans-serif' }}>

      {/* Header */}
      <header style={{
        background: `linear-gradient(135deg, #AA0000, ${colors.primary}, ${colors.primaryLight})`,
        color: '#fff',
        padding: '0.85rem 1.5rem',
        boxShadow: '0 2px 14px rgba(180,0,0,0.35)',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', flexShrink: 0,
            }}>🏥</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>QFlow</h1>
                <span style={{ opacity: 0.75, fontSize: '0.8rem', fontWeight: 400 }}>מערכת ניהול תורים</span>
              </div>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '0.73rem' }}>By Alon &amp; Afik</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {tabs.filter(t => t.count !== null).map(t => (
              <div key={t.id} style={{
                background: 'rgba(255,255,255,0.15)', borderRadius: '10px',
                padding: '0.35rem 0.7rem', fontSize: '0.78rem', fontWeight: 600,
                textAlign: 'center', minWidth: '44px',
              }}>
                <div style={{ fontSize: '1rem' }}>{t.icon}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{t.count}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <nav style={{ background: colors.white, borderBottom: `2px solid ${colors.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '0.85rem 1.4rem', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? colors.primary : colors.textMuted,
              borderBottom: `3px solid ${tab === t.id ? colors.primary : 'transparent'}`,
              fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'color 0.15s, border-color 0.15s',
            }}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count !== null && (
                <span style={{
                  background: tab === t.id ? colors.primaryBg : '#f5f0f0',
                  color: tab === t.id ? colors.primary : '#b08080',
                  borderRadius: '999px', padding: '0.1rem 0.5rem',
                  fontSize: '0.72rem', fontWeight: 700,
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
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

      <footer style={{
        textAlign: 'center', padding: '1.25rem', color: '#b08080',
        fontSize: '0.78rem', borderTop: `1px solid ${colors.border}`,
        marginTop: '2rem', background: colors.white,
      }}>
        <span style={{ fontWeight: 700, color: colors.primary }}>QFlow</span>
        {' '}— מערכת ניהול תורים לקליניקה &nbsp;·&nbsp; By Alon &amp; Afik
      </footer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
