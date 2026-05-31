// QFlow OS v2 — Main app (ES module, Supabase wired)
import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardView, { AuroraStage } from './clinic/DashboardView';
import AppointmentsView from './clinic/AppointmentsView';
import DoctorsView from './clinic/DoctorsView';
import PatientsView from './clinic/PatientsView';
import ERDView from './clinic/ERDView';
import SystemView from './clinic/SystemView';
import { useToasts, useConfirm, fmtDateTime } from './clinic/shared';
import {
  getDoctors, addDoctor, deleteDoctor, deleteAppointmentsByDoctor,
  getPatients, addPatient, deletePatient, deleteAppointmentsByPatient,
  getAppointments, addAppointment, deleteAppointment,
} from './utils/db';

// ── Vitals counter (counts up from 0 with optional start delay) ───────────────
function VitalsCounter({ to, delay = 0 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = performance.now();
      const dur = 1800;
      let raf;
      const step = (t) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        setN(Math.round(eased * to));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(timer);
  }, [to, delay]);
  return <>{String(n).padStart(2, '0')}</>;
}

// ── Clinic Vitals full-screen overlay ────────────────────────────────────────
function VitalsScreen({ doctors, patients, appointments, onClose }) {
  useEffect(() => {
    const h = (e) => {
      if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const stats = [
    { label: 'PATIENTS',     value: patients.length,     color: '#00E5C7', glow: 'rgba(0,229,199,0.5)',     delay: 0   },
    { label: 'APPOINTMENTS', value: appointments.length,  color: '#FF5577', glow: 'rgba(255,45,85,0.6)',      delay: 320 },
    { label: 'DOCTORS',      value: doctors.length,       color: '#C58FFF', glow: 'rgba(197,143,255,0.5)',    delay: 640 },
  ];

  // ECG path — 9 reps (1080px) so the loop is seamless:
  // viewBox is 960px; animating −120px means the path right-edge lands exactly
  // on the viewport edge at t=100%, then snaps back with no gap.
  const ekgPath = Array.from({ length: 9 }, (_, i) => {
    const o = i * 120;
    return [
      `M${o},30 L${o+32},30`,
      `C${o+34},30 ${o+38},22 ${o+43},22 C${o+48},22 ${o+52},30 ${o+54},30`,
      `L${o+63},30 L${o+66},35 L${o+70},4 L${o+74},52`,
      `C${o+77},52 ${o+82},18 ${o+90},18 C${o+97},18 ${o+103},30 ${o+107},30`,
      `L${o+120},30`,
    ].join(' ');
  }).join(' ');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(4,5,10,0.97)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        animation: 'fade-in 400ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Brand */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.45em',
        color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 64,
        animation: 'reveal-up 700ms cubic-bezier(0.22,1,0.36,1) backwards',
      }}>
        QFlow · Clinic Operating System · v2
      </div>

      {/* Giant numbers */}
      <div style={{ display: 'flex', gap: 72, alignItems: 'flex-start', direction: 'ltr' }}>
        {stats.map(({ label, value, color, glow, delay }) => (
          <div key={label} style={{
            textAlign: 'center',
            animation: `reveal-up 700ms cubic-bezier(0.22,1,0.36,1) ${delay + 100}ms backwards`,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.35em',
              color: 'rgba(255,255,255,0.35)', marginBottom: 16, textTransform: 'uppercase',
            }}>
              {label}
            </div>
            <div style={{
              fontFamily: 'var(--font-sans)', fontWeight: 700,
              fontSize: 'clamp(80px, 14vw, 180px)',
              lineHeight: 1, letterSpacing: '-0.04em',
              color, textShadow: `0 0 100px ${glow}, 0 0 40px ${glow}`,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <VitalsCounter to={value} delay={delay}/>
            </div>
            {/* Thin underline in color */}
            <div style={{
              height: 2, marginTop: 16, borderRadius: 2,
              background: color, boxShadow: `0 0 16px ${glow}`,
              animation: `vitals-bar 600ms cubic-bezier(0.22,1,0.36,1) ${delay + 400}ms backwards`,
            }}/>
          </div>
        ))}
      </div>

      {/* EKG line */}
      <div style={{ position: 'absolute', bottom: 72, left: 0, right: 0, height: 56, overflow: 'hidden', opacity: 0.7 }}>
        <svg viewBox="0 0 960 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="vGrad" x1="0" x2="1">
              <stop offset="0"   stopColor="#FF2D55" stopOpacity="0"/>
              <stop offset="0.3" stopColor="#FF2D55" stopOpacity="1"/>
              <stop offset="0.7" stopColor="#FF5577" stopOpacity="1"/>
              <stop offset="1"   stopColor="#FF2D55" stopOpacity="0"/>
            </linearGradient>
            <filter id="vGlow"><feGaussianBlur stdDeviation="3"/></filter>
          </defs>
          <g>
            <animateTransform attributeName="transform" type="translate"
              from="0,0" to="-120,0" dur="0.9s" repeatCount="indefinite"/>
            <path d={ekgPath} fill="none" stroke="url(#vGrad)" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round" filter="url(#vGlow)"/>
            <path d={ekgPath} fill="none" stroke="#FFD0DA" strokeWidth="1.2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        </svg>
      </div>

      {/* Dismiss hint */}
      <div style={{
        position: 'absolute', bottom: 28,
        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.28em',
        color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase',
        animation: 'fade-in 1s 1.8s backwards',
      }}>
        CLICK OR PRESS ANY KEY TO CONTINUE
      </div>
    </div>
  );
}

// ── Side navigation ───────────────────────────────────────────────────────────
function SideNav({ tab, setTab, onVitals }) {
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
      ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17" r="3"/><path d="M8 17Q17 17 17 10V6"/><circle cx="17" cy="4" r="2"/></svg>,
    },
    {
      id: 'patients', label: 'Patients', he: 'מטופלים',
      ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
    },
    {
      id: 'erd', label: 'ERD', he: 'ERD',
      ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>,
    },
    {
      id: 'system', label: 'System', he: 'מערכת',
      ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="4" height="4" rx="1"/><rect x="18" y="3" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1"/><rect x="2" y="17" width="4" height="4" rx="1"/><rect x="18" y="17" width="4" height="4" rx="1"/><path d="M6 5h4M18 5h-4M12 10V7M6 19h4M18 19h-4M12 14v3M4 7v10M20 7v10"/></svg>,
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
      {/* Divider + Vitals button */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 6px' }}/>
      <button onClick={onVitals} title="Vitals — press V" style={{ position: 'relative' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h4l3-8 4 16 3-8h4"/>
        </svg>
        <span className="tip">Vitals</span>
        {/* pulsing dot */}
        <span style={{
          position: 'absolute', top: 8, right: 8,
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--red)', boxShadow: '0 0 8px var(--red-glow)',
          animation: 'blip 1.6s infinite',
        }}/>
      </button>
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
  const [tab, setTab]     = useState('dashboard');
  const [vitals, setVitals] = useState(false);

  const [doctors,      setDoctors]      = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const [showToast, toastHost]   = useToasts();
  const [confirm,   confirmNode] = useConfirm();

  // ── Keyboard shortcut: V → vitals ─────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if ((e.key === 'v' || e.key === 'V') &&
          !['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
        setVitals(v => !v);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

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
    const doctor   = doctors.find(d => d.licenseNumber === licenseNumber);
    const apptCount = appointments.filter(a => a.doctorLicense === licenseNumber).length;
    const msg = apptCount > 0
      ? `למחוק את ${doctor?.doctorName}?\n${apptCount} תורים קשורים יימחקו גם כן.`
      : `למחוק את ${doctor?.doctorName}?`;
    const ok = await confirm(msg);
    if (!ok) return;
    try {
      await deleteAppointmentsByDoctor(licenseNumber);
      await deleteDoctor(licenseNumber);
      setDoctors(p => p.filter(d => d.licenseNumber !== licenseNumber));
      setAppointments(p => p.filter(a => a.doctorLicense !== licenseNumber));
      showToast(`${doctor?.doctorName} נמחק${apptCount > 0 ? ` · ${apptCount} תורים הוסרו` : ''}`, 'error');
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
    const patient   = patients.find(p => p.idNumber === idNumber);
    const apptCount = appointments.filter(a => a.patientId === idNumber).length;
    const msg = apptCount > 0
      ? `למחוק את ${patient?.patientName}?\n${apptCount} תורים קשורים יימחקו גם כן.`
      : `למחוק את ${patient?.patientName}?`;
    const ok = await confirm(msg);
    if (!ok) return;
    try {
      await deleteAppointmentsByPatient(idNumber);
      await deletePatient(idNumber);
      setPatients(p => p.filter(pt => pt.idNumber !== idNumber));
      setAppointments(p => p.filter(a => a.patientId !== idNumber));
      showToast(`${patient?.patientName} נמחק/ה${apptCount > 0 ? ` · ${apptCount} תורים הוסרו` : ''}`, 'error');
    } catch (e) { showToast(e.message, 'error'); }
  };

  // ── Appointments ───────────────────────────────────────────────────────────
  const handleAddAppointment = async (apt) => {
    // Guard: same doctor can't have two appointments within 30 minutes
    const newDt = new Date(apt.dateTime);
    const clash = appointments.find(a => {
      if (a.doctorLicense !== apt.doctorLicense) return false;
      return Math.abs(new Date(a.dateTime) - newDt) < 30 * 60 * 1000;
    });
    if (clash) {
      const doc = doctors.find(d => d.licenseNumber === apt.doctorLicense);
      showToast(
        `ל${doc?.doctorName || 'רופא זה'} כבר יש תור בשעה ${fmtDateTime(clash.dateTime)}`,
        'error'
      );
      return;
    }

    try {
      const created = await addAppointment(apt);
      setAppointments(p => [...p, created].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)));
      showToast('התור נקבע בהצלחה ✓');
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
      <SideNav tab={tab} setTab={setTab} onVitals={() => setVitals(true)}/>
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
        {tab === 'system' && <SystemView/>}
      </div>
      {toastHost}
      {confirmNode}
      {vitals && (
        <VitalsScreen
          doctors={doctors} patients={patients} appointments={appointments}
          onClose={() => setVitals(false)}
        />
      )}
    </>
  );
}
