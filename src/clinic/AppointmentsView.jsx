import { useState, useMemo } from 'react';
import { s, QF, colors } from './styles';
import { DocIcon, PatIcon, CalIcon, ClockIcon, PhoneIcon, AlertIcon, PlusIcon, XIcon, SaveIcon, TrashIcon, FilterXIcon } from './icons';

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
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238A6F6F' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
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
          {open ? <><XIcon size={15} /> ביטול</> : <><PlusIcon size={15} /> קבע תור</>}
        </button>
      </div>

      {/* Warning banner */}
      {(noDoctors || noPatients) && !open && (
        <div style={{
          background: QF.warningSoft, border: `1px solid ${QF.warning}`,
          borderRadius: '10px', padding: '12px 16px', marginBottom: '1rem',
          fontSize: '13px', color: '#92400e',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <AlertIcon size={16} />
          {noDoctors && noPatients ? 'יש להוסיף רופאים ומטופלים' : noDoctors ? 'יש להוסיף רופא תחילה' : 'יש להוסיף מטופל תחילה'} לפני קביעת תור.
        </div>
      )}

      {/* Add form */}
      {open && (
        <form onSubmit={handleSubmit} style={s.form}>
          <h3 style={{ margin: '0 0 1rem', color: QF.red500, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalIcon size={16} /> קביעת תור חדש
          </h3>

          <div style={s.grid2}>
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

          <button type='submit' style={s.submitBtn}><SaveIcon size={15} /> שמור תור</button>
        </form>
      )}

      {/* Filters */}
      {appointments.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <select
              style={{ ...s.input(false), fontSize: '13px', padding: '8px 12px' }}
              value={filterDoctor}
              onChange={e => setFilterDoctor(e.target.value)}
            >
              <option value=''>כל הרופאים</option>
              {doctors.map(d => <option key={d.licenseNumber} value={d.licenseNumber}>{d.doctorName}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <select
              style={{ ...s.input(false), fontSize: '13px', padding: '8px 12px' }}
              value={filterPatient}
              onChange={e => setFilterPatient(e.target.value)}
            >
              <option value=''>כל המטופלים</option>
              {patients.map(p => <option key={p.idNumber} value={p.idNumber}>{p.patientName}</option>)}
            </select>
          </div>
          {(filterDoctor || filterPatient) && (
            <button
              onClick={() => { setFilterDoctor(''); setFilterPatient(''); }}
              style={{ ...s.cancelBtn, fontSize: '13px', padding: '8px 14px' }}
            >
              <FilterXIcon size={14} /> נקה סינון
            </button>
          )}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', opacity: 0.35 }}>
            <CalIcon size={48} />
          </div>
          <div style={{ fontWeight: 600 }}>
            {appointments.length === 0 ? 'אין תורים במערכת עדיין' : 'לא נמצאו תורים לפי הסינון הנבחר'}
          </div>
          {appointments.length === 0 && (
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: QF.fg3 }}>לחץ על "קבע תור" כדי להתחיל</div>
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
                borderRight: `4px solid ${isPast ? QF.line2 : QF.red500}`,
                opacity: isPast ? 0.75 : 1,
              }}>
                {/* Appointment number */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: isPast ? QF.surface2 : QF.red50,
                  color: isPast ? QF.fg4 : QF.red500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '13px', flexShrink: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  #{apt.appointmentNumber}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Date + badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: QF.fg1, fontSize: '14px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <ClockIcon size={14} /> {formatDateTime(apt.dateTime)}
                    </span>
                    {isPast && (
                      <span style={s.badge(QF.surface2, QF.fg4)}>עבר</span>
                    )}
                    <span style={s.badge(QF.red50, QF.red500)}>{apt.reason}</span>
                  </div>
                  {/* Doctor & Patient */}
                  <div style={{ fontSize: '12px', color: QF.fg3, display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <DocIcon size={13} />
                      {doc ? doc.doctorName : <em style={{ color: QF.danger }}>רופא נמחק</em>}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <PatIcon size={13} />
                      {pat ? pat.patientName : <em style={{ color: QF.danger }}>מטופל נמחק</em>}
                    </span>
                    {pat && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <PhoneIcon size={13} /> {pat.phoneNumber}
                      </span>
                    )}
                  </div>
                </div>

                <button onClick={() => onDelete(apt.appointmentNumber)} style={s.deleteBtn}>
                  <TrashIcon size={14} /> מחק
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
