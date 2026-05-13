// QFlow OS v2 — Patients view (ES module)
import { useState, useMemo } from 'react';
import { Field, Modal, EmptyState, Search, PageHead, initials } from './shared';

function PatientForm({ existing, onSave, onCancel }) {
  const [f, setF] = useState({ idNumber: '', patientName: '', phoneNumber: '' });
  const [errs, setErrs] = useState({});
  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); if (errs[k]) setErrs(p => ({ ...p, [k]: null })); };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    const id = f.idNumber.trim();
    const nm = f.patientName.trim();
    const ph = f.phoneNumber.trim();
    if (!id) er.idNumber = 'שדה חובה';
    else if (!/^\d{9}$/.test(id)) er.idNumber = 'תעודת זהות = 9 ספרות';
    else if (existing.find(p => p.idNumber === id)) er.idNumber = 'ת.ז. כבר קיימת';
    if (!nm) er.patientName = 'שדה חובה';
    if (!ph) er.phoneNumber = 'שדה חובה';
    else if (!/^0\d{8,9}$/.test(ph.replace(/[-\s]/g, ''))) er.phoneNumber = 'מספר טלפון לא תקין';
    if (Object.keys(er).length) { setErrs(er); return; }
    onSave({ idNumber: id, patientName: nm, phoneNumber: ph });
  };

  return (
    <form onSubmit={submit}>
      <div className="grid3">
        <Field label="שם מלא" error={errs.patientName}>
          <input autoFocus value={f.patientName} onChange={e => set('patientName', e.target.value)} placeholder="ישראל ישראלי"/>
        </Field>
        <Field label="ת.ז. · 9 ספרות · PK" error={errs.idNumber}>
          <input value={f.idNumber} maxLength={9} onChange={e => set('idNumber', e.target.value.replace(/\D/g, ''))} placeholder="123456789"/>
        </Field>
        <Field label="טלפון" error={errs.phoneNumber}>
          <input value={f.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} placeholder="0501234567"/>
        </Field>
      </div>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={onCancel}>ביטול</button>
        <button type="submit" className="btn primary">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-3 7 3z"/>
          </svg>
          הוסף מטופל
        </button>
      </div>
    </form>
  );
}

export default function PatientsView({ patients, appointments, onAdd, onDelete }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim();
    return patients.filter(p => !q || (p.patientName + p.idNumber + p.phoneNumber).includes(q));
  }, [patients, search]);

  return (
    <div className="reveal" style={{ animationDelay: '.05s' }}>
      <PageHead
        eyebrow="03 · PATIENTS"
        title="רשימת מטופלים"
        count={patients.length} countLabel="REGISTERED"
        action={
          <button className="btn primary" onClick={() => setOpen(true)} style={{ padding: '14px 22px', fontSize: 14 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            הוסף מטופל
          </button>
        }
      />

      <div className="filter-bar">
        <Search value={search} onChange={setSearch} placeholder="חפש מטופל לפי שם, ת.ז. או טלפון..."/>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="אין מטופלים במערכת"
          sub="ADD A PATIENT TO BEGIN"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((p, i) => {
            const count = appointments.filter(a => a.patientId === p.idNumber).length;
            return (
              <div key={p.idNumber} className="list-row" style={{ animation: 'reveal-up 500ms var(--ease) backwards', animationDelay: `${i * 0.05}s` }}>
                <div className="av teal">{initials(p.patientName)}</div>
                <div className="body">
                  <div className="name">{p.patientName}</div>
                  <div className="meta">
                    <span>ת.ז. <strong>{p.idNumber}</strong></span>
                    <span className="sep">·</span>
                    <span>טלפון <strong>{p.phoneNumber}</strong></span>
                    <span className="sep">·</span>
                    <span>{count} תורים</span>
                  </div>
                </div>
                <span className="stat" style={count > 0 ? { background: 'var(--teal-soft)', color: 'var(--teal)', borderColor: 'rgba(0,229,199,0.4)' } : {}}>{count} APT</span>
                <button className="btn icon" onClick={() => onDelete(p.idNumber)} title="מחק">
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
        <Modal title="הוספת מטופל חדש" sub="NEW PATIENT · REGISTER" onClose={() => setOpen(false)}>
          <PatientForm
            existing={patients}
            onSave={p => { onAdd(p); setOpen(false); }}
            onCancel={() => setOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
