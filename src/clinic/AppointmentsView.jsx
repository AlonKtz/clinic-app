import { useState, useMemo } from 'react';
import { s, colors } from './styles';

const REASONS = [
  'בדיקה שגרתית',
  'מעקב טיפול',
  'כאבים / תלונות',
  'בדיקות דם',
  'המשך טיפול',
  'ייעוץ',
  'אחר',
];

function todayMin() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function formatDateTime(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AppointmentsView({ appointments, doctors, patients, onAdd, onDelete }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ dateTime: '', reason: '', otherReason: '', doctorLicense: '', patientId: '' });
  const [errors, setErrors] = useState({});
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterPatient, setFilterPatient] = useState('');

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.dateTime) e.dateTime = 'שדה חובה';
    if (!form.reason) e.reason = 'שדה חובה';
    if (form.reason === 'אחר' && !form.otherReason.trim()) e.otherReason = 'נא פרט את הסיבה';
    if (!form.doctorLicense) e.doctorLicense = 'יש לבחור רופא';
    if (!form.patientId) e.patientId = 'יש לבחור מטופל';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onAdd({
      dateTime: form.dateTime,
      reason: form.reason === 'אחר' ? form.otherReason.trim() : form.reason,
      doctorLicense: form.doctorLicense,
      patientId: form.patientId,
    });
    setForm({ dateTime: '', reason: '', otherReason: '', doctorLicense: '', patientId: '' });
    setErrors({});
    setOpen(false);
  };

  const filtered = useMemo(() => {
    return appointments
      .filter(a => !filterDoctor || a.doctorLicense === filterDoctor)
      .filter(a => !filterPatient || a.patientId === filterPatient)
      .slice()
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  }, [appointments, filterDoctor, filterPatient]);

  const getDoctor = (license) => doctors.find(d => d.licenseNumber === license);
  const getPatient = (id) => patients.find(p => p.idNumber === id);

  const selectStyle = (hasError) => ({
    ...s.input(hasError),
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left 0.75rem center',
    paddingLeft: '2.25rem',
  });

  const noDoctors = doctors.length === 0;
  const noPatients = patients.length === 0;
  const canAdd = !noDoctors && !noPatients;

  return (
    <div>
      <div style={s.pageHeader}>
        <h2 style={s.h2}>ניהול תורים</h2>
        <button
          onClick={() => canAdd && setOpen(p => !p)}
          style={{ ...(open ? s.cancelBtn : s.addBtn), opacity: canAdd ? 1 : 0.5, cursor: canAdd ? 'pointer' : 'not-allowed' }}
          title={!canAdd ? 'יש להוסיף רופאים ומטופלים תחילה' : ''}
        >
          {open ? '✕ ביטול' : '+ קבע תור'}
        </button>
      </div>

      {(noDoctors || noPatients) && !open && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#92400e' }}>
          ⚠️ {noDoctors && noPatients ? 'יש להוסיף רופאים ומטופלים' : noDoctors ? 'יש להוסיף רופא תחילה' : 'יש להוסיף מטופל תחילה'} לפני קביעת תור.
        </div>
      )}

      {open && (
        <form onSubmit={handleSubmit} style={s.form}>
          <h3 style={{ margin: '0 0 1rem', color: colors.primary, fontSize: '1rem' }}>📅 קביעת תור חדש</h3>

          <div style={s.grid2}>
            {/* Doctor */}
            <div>
              <label style={s.label}>רופא מקבל</label>
              <select style={selectStyle(errors.doctorLicense)} value={form.doctorLicense} onChange={e => set('doctorLicense', e.target.value)}>
                <option value=''>— בחר רופא —</option>
                {doctors.map(d => (
                  <option key={d.licenseNumber} value={d.licenseNumber}>
                    {d.doctorName} (רישיון: {d.licenseNumber})
                  </option>
                ))}
              </select>
              {errors.doctorLicense && <p style={s.errorText}>{errors.doctorLicense}</p>}
            </div>
            {/* Patient */}
            <div>
              <label style={s.label}>מטופל קובע</label>
              <select style={selectStyle(errors.patientId)} value={form.patientId} onChange={e => set('patientId', e.target.value)}>
                <option value=''>— בחר מטופל —</option>
                {patients.map(p => (
                  <option key={p.idNumber} value={p.idNumber}>
                    {p.patientName} (ת.ז.: {p.idNumber})
                  </option>
                ))}
              </select>
              {errors.patientId && <p style={s.errorText}>{errors.patientId}</p>}
            </div>
          </div>

          <div style={{ ...s.grid2, marginTop: '1rem' }}>
            {/* Date & Time */}
            <div>
              <label style={s.label}>תאריך ושעה</label>
              <input
                type='datetime-local'
                style={s.input(errors.dateTime)}
                min={todayMin()}
                value={form.dateTime}
                onChange={e => set('dateTime', e.target.value)}
              />
              {errors.dateTime && <p style={s.errorText}>{errors.dateTime}</p>}
            </div>
            {/* Reason */}
            <div>
              <label style={s.label}>סיבת ביקור</label>
              <select style={selectStyle(errors.reason)} value={form.reason} onChange={e => set('reason', e.target.value)}>
                <option value=''>— בחר סיבה —</option>
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.reason && <p style={s.errorText}>{errors.reason}</p>}
            </div>
          </div>

          {form.reason === 'אחר' && (
            <div style={{ marginTop: '1rem' }}>
              <label style={s.label}>פירוט הסיבה</label>
              <input
                style={s.input(errors.otherReason)}
                placeholder='תאר את הסיבה לביקור...'
                value={form.otherReason}
                onChange={e => set('otherReason', e.target.value)}
              />
              {errors.otherReason && <p style={s.errorText}>{errors.otherReason}</p>}
            </div>
          )}

          <button type='submit' style={s.submitBtn}>💾 שמור תור</button>
        </form>
      )}

      {/* Filters */}
      {appointments.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <select
              style={{ ...s.input(false), fontSize: '0.82rem', padding: '0.5rem 0.7rem' }}
              value={filterDoctor}
              onChange={e => setFilterDoctor(e.target.value)}
            >
              <option value=''>👨‍⚕️ כל הרופאים</option>
              {doctors.map(d => <option key={d.licenseNumber} value={d.licenseNumber}>{d.doctorName}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <select
              style={{ ...s.input(false), fontSize: '0.82rem', padding: '0.5rem 0.7rem' }}
              value={filterPatient}
              onChange={e => setFilterPatient(e.target.value)}
            >
              <option value=''>🧑 כל המטופלים</option>
              {patients.map(p => <option key={p.idNumber} value={p.idNumber}>{p.patientName}</option>)}
            </select>
          </div>
          {(filterDoctor || filterPatient) && (
            <button
              onClick={() => { setFilterDoctor(''); setFilterPatient(''); }}
              style={{ ...s.cancelBtn, fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
            >✕ נקה סינון</button>
          )}
        </div>
      )}

      {/* Appointment List */}
      {filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📅</div>
          <div>{appointments.length === 0 ? 'אין תורים במערכת עדיין' : 'לא נמצאו תורים לפי הסינון הנבחר'}</div>
          {appointments.length === 0 && (
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>לחץ על "קבע תור" כדי להתחיל</div>
          )}
        </div>
      ) : (
        <div style={s.stack}>
          {filtered.map(apt => {
            const doc = getDoctor(apt.doctorLicense);
            const pat = getPatient(apt.patientId);
            const isPast = new Date(apt.dateTime) < new Date();
            return (
              <div key={apt.appointmentNumber} style={{
                ...s.card,
                borderRight: `4px solid ${isPast ? '#94a3b8' : colors.primaryLight}`,
                opacity: isPast ? 0.75 : 1,
              }}>
                {/* Appointment number badge */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: isPast ? '#f1f5f9' : colors.primaryBg,
                  color: isPast ? '#94a3b8' : colors.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                }}>
                  #{apt.appointmentNumber}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Date & Reason */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: colors.text, fontSize: '0.9rem' }}>
                      🕐 {formatDateTime(apt.dateTime)}
                    </span>
                    {isPast && <span style={s.badge('#f1f5f9', '#94a3b8')}>עבר</span>}
                    <span style={s.badge(colors.primaryBg, colors.primary)}>{apt.reason}</span>
                  </div>
                  {/* Doctor & Patient */}
                  <div style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span>👨‍⚕️ {doc ? doc.doctorName : <em style={{ color: colors.danger }}>רופא נמחק</em>}</span>
                    <span>🧑 {pat ? pat.patientName : <em style={{ color: colors.danger }}>מטופל נמחק</em>}</span>
                    {pat && <span>📞 {pat.phoneNumber}</span>}
                  </div>
                </div>

                <button onClick={() => onDelete(apt.appointmentNumber)} style={s.deleteBtn}>
                  🗑️ מחק
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
