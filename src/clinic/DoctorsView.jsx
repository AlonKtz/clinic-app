// QFlow OS v2 — Doctors view (ES module)
import { useState, useMemo } from 'react';
import { Field, Modal, EmptyState, Search, PageHead, initials } from './shared';

function DoctorForm({ existing, onSave, onCancel }) {
  const [f, setF] = useState({ licenseNumber: '', doctorName: '' });
  const [errs, setErrs] = useState({});
  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); if (errs[k]) setErrs(p => ({ ...p, [k]: null })); };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    const lic = f.licenseNumber.trim();
    const nm = f.doctorName.trim();
    if (!lic) er.licenseNumber = 'שדה חובה';
    else if (!/^\d+$/.test(lic)) er.licenseNumber = 'ספרות בלבד';
    else if (existing.find(d => d.licenseNumber === lic)) er.licenseNumber = 'מספר רישיון כבר קיים';
    if (!nm) er.doctorName = 'שדה חובה';
    else if (nm.length < 2) er.doctorName = 'שם קצר מדי';
    if (Object.keys(er).length) { setErrs(er); return; }
    onSave({ licenseNumber: lic, doctorName: nm });
  };

  return (
    <form onSubmit={submit}>
      <div className="grid2">
        <Field label="שם הרופא" error={errs.doctorName}>
          <input autoFocus value={f.doctorName} onChange={e => set('doctorName', e.target.value)} placeholder='ד״ר ישראל ישראלי'/>
        </Field>
        <Field label="מספר רישיון · PK" error={errs.licenseNumber}>
          <input value={f.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} placeholder="123456"/>
        </Field>
      </div>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={onCancel}>ביטול</button>
        <button type="submit" className="btn primary">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-3 7 3z"/>
          </svg>
          הוסף רופא
        </button>
      </div>
    </form>
  );
}

export default function DoctorsView({ doctors, appointments, onAdd, onDelete }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim();
    return doctors.filter(d => !q || (d.doctorName + d.licenseNumber).includes(q));
  }, [doctors, search]);

  return (
    <div className="reveal" style={{ animationDelay: '.05s' }}>
      <PageHead
        eyebrow="02 · DOCTORS"
        title="צוות הרופאים"
        count={doctors.length} countLabel="REGISTERED"
        action={
          <button className="btn primary" onClick={() => setOpen(true)} style={{ padding: '14px 22px', fontSize: 14 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            הוסף רופא
          </button>
        }
      />

      <div className="filter-bar">
        <Search value={search} onChange={setSearch} placeholder="חפש רופא לפי שם או מספר רישיון..."/>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="אין רופאים במערכת"
          sub="ADD A DOCTOR TO BEGIN"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="5" r="2"/><path d="M11 7v8a4 4 0 0 0 8 0V9M19 7v2"/></svg>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((d, i) => {
            const count = appointments.filter(a => a.doctorLicense === d.licenseNumber).length;
            return (
              <div key={d.licenseNumber} className="list-row" style={{ animation: 'reveal-up 500ms var(--ease) backwards', animationDelay: `${i * 0.05}s` }}>
                <div className="av">
                  {initials(d.doctorName)}
                  <span className="pulse"/>
                </div>
                <div className="body">
                  <div className="name">{d.doctorName}</div>
                  <div className="meta">
                    <span>רישיון <strong>#{d.licenseNumber}</strong></span>
                    <span className="sep">·</span>
                    <span>{count} תורים</span>
                  </div>
                </div>
                <span className="stat" style={count > 0 ? { background: 'var(--red-soft)', color: 'var(--red-bright)', borderColor: 'rgba(255,45,85,0.4)' } : {}}>{count} APT</span>
                <button className="btn icon" onClick={() => onDelete(d.licenseNumber)} title="מחק">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <Modal title="הוספת רופא חדש" sub="NEW DOCTOR · ADD TO ROSTER" onClose={() => setOpen(false)}>
          <DoctorForm
            existing={doctors}
            onSave={d => { onAdd(d); setOpen(false); }}
            onCancel={() => setOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
