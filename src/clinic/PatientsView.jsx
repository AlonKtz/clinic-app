import { useState } from 'react';
import { s, QF, colors } from './styles';
import { PatIcon, IDIcon, PhoneIcon, CalIcon, PlusIcon, XIcon, SaveIcon, TrashIcon } from './icons';

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
          {open ? <><XIcon size={15} /> ביטול</> : <><PlusIcon size={15} /> הוסף מטופל</>}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} style={s.form}>
          <h3 style={{ margin: '0 0 1rem', color: QF.red500, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusIcon size={16} /> הוספת מטופל חדש
          </h3>
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
          <button type='submit' style={s.submitBtn}><SaveIcon size={15} /> שמור מטופל</button>
        </form>
      )}

      {patients.length === 0 ? (
        <div style={s.empty}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', opacity: 0.35 }}>
            <PatIcon size={48} />
          </div>
          <div style={{ fontWeight: 600 }}>אין מטופלים במערכת עדיין</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: QF.fg3 }}>לחץ על "הוסף מטופל" כדי להתחיל</div>
        </div>
      ) : (
        <div style={s.stack}>
          {patients.map(pat => {
            const count = appointments.filter(a => a.patientId === pat.idNumber).length;
            return (
              <div key={pat.idNumber} style={s.card}>
                {/* Avatar */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: QF.successSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: QF.success, flexShrink: 0,
                }}>
                  <PatIcon size={22} />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: QF.fg1, fontSize: '15px' }}>
                    {pat.patientName}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: QF.fg3, display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IDIcon size={13} /> {pat.idNumber}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <PhoneIcon size={13} /> {pat.phoneNumber}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalIcon size={13} /> {count} תורים
                    </span>
                  </p>
                </div>

                <span style={s.badge(count > 0 ? QF.successSoft : QF.surface2, count > 0 ? QF.success : QF.fg4)}>
                  {count} תורים
                </span>

                <button onClick={() => onDelete(pat.idNumber)} style={s.deleteBtn}>
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
