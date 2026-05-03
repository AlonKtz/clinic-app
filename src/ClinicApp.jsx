import { useState, useEffect } from 'react';
import DoctorsView from './clinic/DoctorsView';
import PatientsView from './clinic/PatientsView';
import AppointmentsView from './clinic/AppointmentsView';
import ERDView from './clinic/ERDView';
import { colors } from './clinic/styles';

const KEYS = {
  DOCTORS: 'clinic_doctors',
  PATIENTS: 'clinic_patients',
  APPOINTMENTS: 'clinic_appointments',
  NEXT_ID: 'clinic_next_appointment_id',
};

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export default function ClinicApp() {
  const [tab, setTab] = useState('appointments');
  const [doctors, setDoctors] = useState(() => load(KEYS.DOCTORS, []));
  const [patients, setPatients] = useState(() => load(KEYS.PATIENTS, []));
  const [appointments, setAppointments] = useState(() => load(KEYS.APPOINTMENTS, []));
  const [nextId, setNextId] = useState(() => load(KEYS.NEXT_ID, 1));

  useEffect(() => { localStorage.setItem(KEYS.DOCTORS, JSON.stringify(doctors)); }, [doctors]);
  useEffect(() => { localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem(KEYS.NEXT_ID, JSON.stringify(nextId)); }, [nextId]);

  const addDoctor = (doc) => setDoctors(p => [...p, doc]);
  const deleteDoctor = (license) => {
    if (!window.confirm('למחוק רופא זה? כל התורים שלו יימחקו גם כן.')) return;
    setDoctors(p => p.filter(d => d.licenseNumber !== license));
    setAppointments(p => p.filter(a => a.doctorLicense !== license));
  };

  const addPatient = (pat) => setPatients(p => [...p, pat]);
  const deletePatient = (id) => {
    if (!window.confirm('למחוק מטופל זה? כל התורים שלו יימחקו גם כן.')) return;
    setPatients(p => p.filter(pt => pt.idNumber !== id));
    setAppointments(p => p.filter(a => a.patientId !== id));
  };

  const addAppointment = (apt) => {
    setAppointments(p => [...p, { ...apt, appointmentNumber: nextId }]);
    setNextId(p => p + 1);
  };
  const deleteAppointment = (num) => {
    if (!window.confirm('למחוק תור זה?')) return;
    setAppointments(p => p.filter(a => a.appointmentNumber !== num));
  };

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
            {/* Logo mark */}
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
              <p style={{ margin: 0, opacity: 0.7, fontSize: '0.73rem', letterSpacing: '0.02em' }}>
                By Alon &amp; Afik
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {tabs.filter(t => t.count !== null).map(t => (
              <div key={t.id} style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '0.35rem 0.7rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                textAlign: 'center',
                minWidth: '44px',
              }}>
                <div style={{ fontSize: '1rem' }}>{t.icon}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{t.count}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <nav style={{
        background: colors.white,
        borderBottom: `2px solid ${colors.border}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '0.85rem 1.4rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? colors.primary : colors.textMuted,
                borderBottom: `3px solid ${tab === t.id ? colors.primary : 'transparent'}`,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count !== null && (
                <span style={{
                  background: tab === t.id ? colors.primaryBg : '#f5f0f0',
                  color: tab === t.id ? colors.primary : '#b08080',
                  borderRadius: '999px',
                  padding: '0.1rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
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
            appointments={appointments}
            doctors={doctors}
            patients={patients}
            onAdd={addAppointment}
            onDelete={deleteAppointment}
          />
        )}
        {tab === 'doctors' && (
          <DoctorsView
            doctors={doctors}
            appointments={appointments}
            onAdd={addDoctor}
            onDelete={deleteDoctor}
          />
        )}
        {tab === 'patients' && (
          <PatientsView
            patients={patients}
            appointments={appointments}
            onAdd={addPatient}
            onDelete={deletePatient}
          />
        )}
        {tab === 'erd' && <ERDView />}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '1.25rem',
        color: '#b08080',
        fontSize: '0.78rem',
        borderTop: `1px solid ${colors.border}`,
        marginTop: '2rem',
        background: colors.white,
      }}>
        <span style={{ fontWeight: 700, color: colors.primary }}>QFlow</span>
        {' '}— מערכת ניהול תורים לקליניקה &nbsp;·&nbsp; By Alon &amp; Afik
      </footer>
    </div>
  );
}
