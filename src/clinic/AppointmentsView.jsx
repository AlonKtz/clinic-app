// QFlow OS v2 — Appointments view (ES module)
import { useState, useMemo } from 'react';
import { QF_REASONS, Field, Modal, EmptyState, Search, PageHead, initials, fmtDateTime } from './shared';

function todayMin() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function AppointmentForm({ doctors, patients, onSave, onCancel }) {
  const [f, setF] = useState({ dateTime: '', reason: '', otherReason: '', doctorLicense: '', patientId: '' });
  const [errs, setErrs] = useState({});
  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); if (errs[k]) setErrs(p => ({ ...p, [k]: null })); };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.dateTime) er.dateTime = 'שדה חובה';
    if (!f.reason) er.reason = 'שדה חובה';
    if (f.reason === 'אחר' && !f.otherReason.trim()) er.otherReason = 'נא פרט';
    if (!f.doctorLicense) er.doctorLicense = 'יש לבחור רופא';
    if (!f.patientId) er.patientId = 'יש לבחור מטופל';
    if (Object.keys(er).length) { setErrs(er); return; }
    onSave({
      dateTime: f.dateTime,
      reason: f.reason === 'אחר' ? f.otherReason.trim() : f.reason,
      doctorLicense: f.doctorLicense,
      patientId: f.patientId,
    });
  };

  return (
    <form onSubmit={submit}>
      <div className="grid2">
        <Field label="רופא מקבל" error={errs.doctorLicense}>
          <select value={f.doctorLicense} onChange={e => set('doctorLicense', e.target.value)}>
            <option value="">— בחר רופא —</option>
            {doctors.map(d => <option key={d.licenseNumber} value={d.licenseNumber}>{d.doctorName} · {d.licenseNumber}</option>)}
          </select>
        </Field>
        <Field label="מטופל קובע" error={errs.patientId}>
          <select value={f.patientId} onChange={e => set('patientId', e.target.value)}>
            <option value="">— בחר מטופל —</option>
            {patients.map(p => <option key={p.idNumber} value={p.idNumber}>{p.patientName} · {p.idNumber}</option>)}
          </select>
        </Field>
        <Field label="תאריך ושעה" error={errs.dateTime}>
          <input type="datetime-local" min={todayMin()} value={f.dateTime} onChange={e => set('dateTime', e.target.value)}/>
        </Field>
        <Field label="סיבת ביקור" error={errs.reason}>
          <select value={f.reason} onChange={e => set('reason', e.target.value)}>
            <option value="">— בחר סיבה —</option>
            {QF_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>
      {f.reason === 'אחר' && (
        <div style={{ marginTop: 16 }}>
          <Field label="פרט את הסיבה" error={errs.otherReason}>
            <input value={f.otherReason} onChange={e => set('otherReason', e.target.value)} placeholder="תאר את הסיבה לביקור"/>
          </Field>
        </div>
      )}
      <div className="actions">
        <button type="button" className="btn ghost" onClick={onCancel}>ביטול</button>
        <button type="submit" className="btn primary">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-3 7 3z"/>
          </svg>
          שמור תור
        </button>
      </div>
    </form>
  );
}

// ── Single appointment row ────────────────────────────────────────────────────
function AptRow({ a, i, isPast, doc, pat, onDelete }) {
  return (
    <div key={a.appointmentNumber} className="list-row" style={{
      animation: 'reveal-up 500ms var(--ease) backwards',
      animationDelay: `${i * 0.04}s`,
      opacity: isPast ? 0.55 : 1,
      ...(isPast ? {} : { borderRight: '2px solid var(--red)' }),
    }}>
      <div className="av" style={isPast ? { background: 'rgba(255,255,255,0.06)' } : {}}>
        {pat ? initials(pat.patientName) : '??'}
      </div>
      <div className="body">
        <div className="name">{pat ? pat.patientName : <em style={{ color: 'var(--red-bright)' }}>מטופל נמחק</em>}</div>
        <div className="meta">
          <span><strong>{fmtDateTime(a.dateTime)}</strong></span>
          <span className="sep">·</span>
          <span>{doc ? doc.doctorName : <em style={{ color: 'var(--red-bright)' }}>רופא נמחק</em>}</span>
          <span className="sep">·</span>
          <span style={{ color: isPast ? 'var(--fg-3)' : 'var(--red-bright)' }}>{a.reason}</span>
        </div>
      </div>
      <span className="stat" style={{ fontFamily: 'var(--font-mono)' }}>#{a.appointmentNumber}</span>
      {isPast
        ? <span className="stat done">COMPLETE</span>
        : <span className="stat live">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', animation: 'blip 1.2s infinite' }}/>
            SCHEDULED
          </span>
      }
      <button className="btn icon" onClick={() => onDelete(a.appointmentNumber)} title="מחק">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        </svg>
      </button>
    </div>
  );
}

export default function AppointmentsView({ appointments, doctors, patients, onAdd, onDelete }) {
  const [open,        setOpen]        = useState(false);
  const [search,      setSearch]      = useState('');
  const [filterDoc,   setFilterDoc]   = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const now = new Date();

  const getDoctor  = (l) => doctors.find(d => d.licenseNumber === l);
  const getPatient = (i) => patients.find(p => p.idNumber === i);

  // Apply filters then split into upcoming / past
  const { upcoming, archived } = useMemo(() => {
    const q = search.trim();
    const base = [...appointments]
      .filter(a => !filterDoc || a.doctorLicense === filterDoc)
      .filter(a => {
        if (!q) return true;
        const doc = getDoctor(a.doctorLicense)?.doctorName || '';
        const pat = getPatient(a.patientId)?.patientName  || '';
        return (doc + pat + a.reason).includes(q);
      });

    const upcoming = base
      .filter(a => new Date(a.dateTime) >= now)
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    const archived = base
      .filter(a => new Date(a.dateTime) < now)
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)); // newest first

    return { upcoming, archived };
  }, [appointments, search, filterDoc, doctors, patients]);

  const totalFiltered = upcoming.length + archived.length;

  return (
    <div className="reveal" style={{ animationDelay: '.05s' }}>
      <PageHead
        eyebrow="01 · APPOINTMENTS"
        title="ניהול תורים"
        count={appointments.length} countLabel="LIVE IN SYSTEM"
        action={
          <button className="btn primary live" onClick={() => setOpen(true)} style={{ padding: '14px 22px', fontSize: 14 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            קבע תור חדש
          </button>
        }
      />

      <div className="filter-bar">
        <Search value={search} onChange={setSearch} placeholder="חפש מטופל, רופא או סיבה..."/>
        <Field label="">
          <select value={filterDoc} onChange={e => setFilterDoc(e.target.value)} style={{ padding: '10px 14px', fontSize: 13, paddingLeft: 32 }}>
            <option value="">כל הרופאים</option>
            {doctors.map(d => <option key={d.licenseNumber} value={d.licenseNumber}>{d.doctorName}</option>)}
          </select>
        </Field>
        {(filterDoc || search) && (
          <button className="btn ghost" onClick={() => { setSearch(''); setFilterDoc(''); }} style={{ padding: '10px 16px', fontSize: 12 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
            נקה
          </button>
        )}
      </div>

      {totalFiltered === 0 ? (
        <EmptyState
          title="אין תורים להצגה"
          sub={appointments.length === 0 ? 'CLICK NEW APPOINTMENT TO BEGIN' : 'NO MATCHES FOR FILTER'}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* ── Upcoming appointments ── */}
          {upcoming.length === 0 && archived.length > 0 ? (
            <div style={{
              textAlign: 'center', padding: '28px 0 12px',
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--fg-3)', letterSpacing: '0.18em',
            }}>
              NO UPCOMING APPOINTMENTS
            </div>
          ) : (
            upcoming.map((a, i) => (
              <AptRow key={a.appointmentNumber} a={a} i={i} isPast={false}
                doc={getDoctor(a.doctorLicense)} pat={getPatient(a.patientId)}
                onDelete={onDelete}/>
            ))
          )}

          {/* ── Archive section ── */}
          {archived.length > 0 && (
            <div style={{ marginTop: upcoming.length ? 8 : 0 }}>

              {/* Collapsible header */}
              <button
                onClick={() => setArchiveOpen(v => !v)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: archiveOpen ? '14px 14px 0 0' : 14,
                  padding: '12px 18px', cursor: 'pointer',
                  transition: 'background 200ms, border-radius 200ms',
                  color: 'var(--fg-3)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Archive box icon */}
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="5" rx="1"/>
                    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/>
                    <path d="M10 12h4"/>
                  </svg>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    ארכיון
                  </span>
                  {/* Count badge */}
                  <span style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 999, padding: '2px 10px',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    color: 'var(--fg-3)',
                  }}>
                    {archived.length} COMPLETE
                  </span>
                </div>
                {/* Chevron */}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                  style={{ transform: archiveOpen ? 'rotate(180deg)' : 'none', transition: 'transform 240ms var(--ease)' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {/* Collapsible body */}
              {archiveOpen && (
                <div style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderTop: 'none',
                  borderRadius: '0 0 14px 14px',
                  padding: '8px 0 4px',
                  display: 'flex', flexDirection: 'column', gap: 6,
                  overflow: 'hidden',
                  animation: 'reveal-up 280ms var(--ease) backwards',
                }}>
                  {archived.map((a, i) => (
                    <div key={a.appointmentNumber} style={{ padding: '0 8px' }}>
                      <AptRow a={a} i={i} isPast={true}
                        doc={getDoctor(a.doctorLicense)} pat={getPatient(a.patientId)}
                        onDelete={onDelete}/>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {open && (
        <Modal title="קביעת תור חדש" sub="NEW APPOINTMENT · SCHEDULE PATIENT VISIT" onClose={() => setOpen(false)}>
          <AppointmentForm
            doctors={doctors} patients={patients}
            onSave={a => { onAdd(a); setOpen(false); }}
            onCancel={() => setOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
