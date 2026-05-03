import { useState } from 'react';
import { s, colors } from './styles';

export default function PatientsView({ patients, appointments, onAdd, onDelete }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ idNumber: '', patientName: '', phoneNumber: '' });
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const e = {};
    const id = form.idNumber.trim();
    const name = form.patientName.trim();
    const phone = form.phoneNumber.trim();

    if (!id) e.idNumber = 'שדה חובה';
    else if (!/^\d{9}$/.test(id)) e.idNumber = 'תעודת זהות חייבת להכיל בדיוק 9 ספרות';
    else if (patients.find(p => p.idNumber === id)) e.idNumber = 'תעודת זהות כבר קיימת במערכת';

    if (!name) e.patientName = 'שדה חובה';
    else if (name.length < 2) e.patientName = 'שם חייב להכיל לפחות 2 תווים';

    if (!phone) e.phoneNumber = 'שדה חובה';
    else if (!/^0\d{8,9}$/.test(phone.replace(/[-\s]/g, ''))) e.phoneNumber = 'מספר טלפון לא תקין (לדוג׳: 0501234567)';

    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onAdd({
      idNumber: form.idNumber.trim(),
      patientName: form.patientName.trim(),
      phoneNumber: form.phoneNumber.trim(),
    });
    setForm({ idNumber: '', patientName: '', phoneNumber: '' });
    setErrors({});
    setOpen(false);
  };

  return (
    <div>
      <div style={s.pageHeader}>
        <h2 style={s.h2}>רשימת מטופלים</h2>
        <button onClick={() => setOpen(p => !p)} style={open ? s.cancelBtn : s.addBtn}>
          {open ? '✕ ביטול' : '+ הוסף מטופל'}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} style={s.form}>
          <h3 style={{ margin: '0 0 1rem', color: colors.primary, fontSize: '1rem' }}>➕ הוספת מטופל חדש</h3>
          <div style={s.grid3}>
            <div>
              <label style={s.label}>שם מלא</label>
              <input
                style={s.input(errors.patientName)}
                placeholder='ישראל ישראלי'
                value={form.patientName}
                onChange={e => set('patientName', e.target.value)}
                autoFocus
              />
              {errors.patientName && <p style={s.errorText}>{errors.patientName}</p>}
            </div>
            <div>
              <label style={s.label}>תעודת זהות (PK — 9 ספרות)</label>
              <input
                style={s.input(errors.idNumber)}
                placeholder='123456789'
                maxLength={9}
                value={form.idNumber}
                onChange={e => set('idNumber', e.target.value.replace(/\D/g, ''))}
              />
              {errors.idNumber && <p style={s.errorText}>{errors.idNumber}</p>}
            </div>
            <div>
              <label style={s.label}>מספר טלפון</label>
              <input
                style={s.input(errors.phoneNumber)}
                placeholder='0501234567'
                value={form.phoneNumber}
                onChange={e => set('phoneNumber', e.target.value)}
              />
              {errors.phoneNumber && <p style={s.errorText}>{errors.phoneNumber}</p>}
            </div>
          </div>
          <button type='submit' style={s.submitBtn}>💾 שמור מטופל</button>
        </form>
      )}

      {patients.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧑</div>
          <div>אין מטופלים במערכת עדיין</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>לחץ על "הוסף מטופל" כדי להתחיל</div>
        </div>
      ) : (
        <div style={s.stack}>
          {patients.map(pat => {
            const count = appointments.filter(a => a.patientId === pat.idNumber).length;
            return (
              <div key={pat.idNumber} style={s.card}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: '#f0fdf4', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
                }}>🧑</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: colors.text, fontSize: '0.95rem' }}>
                    {pat.patientName}
                  </p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: colors.textMuted, display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>🪪 ת.ז.: <strong>{pat.idNumber}</strong></span>
                    <span>📞 <strong>{pat.phoneNumber}</strong></span>
                    <span>📅 {count} תורים</span>
                  </p>
                </div>
                <span style={s.badge(count > 0 ? '#f0fdf4' : '#f1f5f9', count > 0 ? colors.success : '#94a3b8')}>
                  {count} תורים
                </span>
                <button onClick={() => onDelete(pat.idNumber)} style={s.deleteBtn}>
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
