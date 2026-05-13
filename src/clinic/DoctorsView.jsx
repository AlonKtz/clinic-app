import { useState } from 'react';
import { s, QF, colors } from './styles';
import { DocIcon, IDIcon, CalIcon, PlusIcon, XIcon, SaveIcon, TrashIcon } from './icons';

export default function DoctorsView({ doctors, appointments, onAdd, onDelete }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ licenseNumber: '', doctorName: '' });
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const e = {};
    const license = form.licenseNumber.trim();
    const name = form.doctorName.trim();
    if (!license) e.licenseNumber = 'שדה חובה';
    else if (!/^\d+$/.test(license)) e.licenseNumber = 'מספר רישיון חייב להכיל ספרות בלבד';
    else if (doctors.find(d => d.licenseNumber === license)) e.licenseNumber = 'מספר רישיון כבר קיים במערכת';
    if (!name) e.doctorName = 'שדה חובה';
    else if (name.length < 2) e.doctorName = 'שם חייב להכיל לפחות 2 תווים';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onAdd({ licenseNumber: form.licenseNumber.trim(), doctorName: form.doctorName.trim() });
    setForm({ licenseNumber: '', doctorName: '' });
    setErrors({});
    setOpen(false);
  };

  return (
    <div>
      <div style={s.pageHeader}>
        <h2 style={s.h2}>רשימת רופאים</h2>
        <button onClick={() => setOpen(p => !p)} style={open ? s.cancelBtn : s.addBtn}>
          {open ? <><XIcon size={15} /> ביטול</> : <><PlusIcon size={15} /> הוסף רופא</>}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} style={s.form}>
          <h3 style={{ margin: '0 0 1rem', color: QF.red500, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusIcon size={16} /> הוספת רופא חדש
          </h3>
          <div style={s.grid2}>
            <div>
              <label style={s.label}>שם הרופא</label>
              <input
                style={s.input(errors.doctorName)}
                placeholder='ד"ר ישראל ישראלי'
                value={form.doctorName}
                onChange={e => set('doctorName', e.target.value)}
                autoFocus
              />
              {errors.doctorName && <p style={s.errorText}>{errors.doctorName}</p>}
            </div>
            <div>
              <label style={s.label}>מספר רישיון (PK — מזהה ייחודי)</label>
              <input
                style={s.input(errors.licenseNumber)}
                placeholder='123456'
                value={form.licenseNumber}
                onChange={e => set('licenseNumber', e.target.value)}
              />
              {errors.licenseNumber && <p style={s.errorText}>{errors.licenseNumber}</p>}
            </div>
          </div>
          <button type='submit' style={s.submitBtn}><SaveIcon size={15} /> שמור רופא</button>
        </form>
      )}

      {doctors.length === 0 ? (
        <div style={s.empty}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', opacity: 0.35 }}>
            <DocIcon size={48} />
          </div>
          <div style={{ fontWeight: 600 }}>אין רופאים במערכת עדיין</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: QF.fg3 }}>לחץ על "הוסף רופא" כדי להתחיל</div>
        </div>
      ) : (
        <div style={s.stack}>
          {doctors.map(doc => {
            const count = appointments.filter(a => a.doctorLicense === doc.licenseNumber).length;
            return (
              <div key={doc.licenseNumber} style={s.card}>
                {/* Avatar */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: QF.red50,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: QF.red500, flexShrink: 0,
                }}>
                  <DocIcon size={22} />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: QF.fg1, fontSize: '15px' }}>
                    {doc.doctorName}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: QF.fg3, display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IDIcon size={13} /> {doc.licenseNumber}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalIcon size={13} /> {count} תורים
                    </span>
                  </p>
                </div>

                <span style={s.badge(count > 0 ? QF.red50 : QF.surface2, count > 0 ? QF.red500 : QF.fg4)}>
                  {count} תורים
                </span>

                <button onClick={() => onDelete(doc.licenseNumber)} style={s.deleteBtn}>
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
