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
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
        color: '#fff',
        padding: '1rem 1.5rem',
        boxShadow: '0 2px 12px rgba(30,64,175,0.25)',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>🏥 מרפאה — מערכת ניהול תורים</h1>
            <p style={{ margin: '0.2rem 0 0', opacity: 0.85, fontSize: '0.82rem' }}>ניהול רופאים, מטופלים ותורים</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {tabs.filter(t => t.count !== null).map(t => (
              <div key={t.id} style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.1rem' }}>{t.icon}</div>
                <div>{t.count}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <nav style={{ background: colors.white, borderBottom: `1px solid ${colors.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '0.85rem 1.5rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? colors.primary : colors.textMuted,
                borderBottom: `3px solid ${tab === t.id ? colors.primary : 'transparent'}`,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count !== null && (
                <span style={{
                  background: tab === t.id ? colors.primaryBg : '#f1f5f9',
                  color: tab === t.id ? colors.primary : '#94a3b8',
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

      <footer style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.78rem', borderTop: `1px solid ${colors.border}`, marginTop: '2rem' }}>
        מערכת ניהול תורים לקליניקה — פרויקט אקדמי
      </footer>
    </div>
  );
}
