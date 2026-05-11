const BASE = import.meta.env.VITE_SUPABASE_URL;
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function req(path, opts = {}) {
  const { headers: extraHeaders, ...restOpts } = opts;
  const res = await fetch(`${BASE}/rest/v1/${path}`, {
    ...restOpts,
    headers: { ...headers, ...(extraHeaders || {}) },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Supabase error ${res.status}: ${msg}`);
  }
  return res.status === 204 ? null : res.json();
}

// ─── Mappers: DB (snake_case) ↔ App (camelCase) ───────────────────────────

const fromDoctor = (d) => ({
  licenseNumber: d.license_number,
  doctorName:    d.doctor_name,
});

const toDoctor = (d) => ({
  license_number: d.licenseNumber,
  doctor_name:    d.doctorName,
});

const fromPatient = (p) => ({
  idNumber:    p.id_number,
  patientName: p.patient_name,
  phoneNumber: p.phone_number,
});

const toPatient = (p) => ({
  id_number:    p.idNumber,
  patient_name: p.patientName,
  phone_number: p.phoneNumber,
});

const fromAppointment = (a) => ({
  appointmentNumber: a.id,
  dateTime:          a.date_time ? a.date_time.slice(0, 16) : '',
  reason:            a.reason,
  doctorLicense:     a.doctor_license,
  patientId:         a.patient_id,
});

const toAppointment = (a) => ({
  date_time:      new Date(a.dateTime).toISOString(),
  reason:         a.reason,
  doctor_license: a.doctorLicense,
  patient_id:     a.patientId,
});

// ─── Doctors ──────────────────────────────────────────────────────────────

export const getDoctors = () =>
  req('clinic_doctors?order=doctor_name').then(rows => rows.map(fromDoctor));

export const addDoctor = (doc) =>
  req('clinic_doctors', { method: 'POST', body: JSON.stringify(toDoctor(doc)) })
    .then(rows => fromDoctor(rows[0]));

export const deleteDoctor = (licenseNumber) =>
  req(`clinic_doctors?license_number=eq.${encodeURIComponent(licenseNumber)}`, {
    method: 'DELETE',
    headers: { Prefer: '' },
  });

// ─── Patients ─────────────────────────────────────────────────────────────

export const getPatients = () =>
  req('clinic_patients?order=patient_name').then(rows => rows.map(fromPatient));

export const addPatient = (pat) =>
  req('clinic_patients', { method: 'POST', body: JSON.stringify(toPatient(pat)) })
    .then(rows => fromPatient(rows[0]));

export const deletePatient = (idNumber) =>
  req(`clinic_patients?id_number=eq.${encodeURIComponent(idNumber)}`, {
    method: 'DELETE',
    headers: { Prefer: '' },
  });

// ─── Appointments ─────────────────────────────────────────────────────────

export const getAppointments = () =>
  req('clinic_appointments?order=date_time').then(rows => rows.map(fromAppointment));

export const addAppointment = (apt) =>
  req('clinic_appointments', { method: 'POST', body: JSON.stringify(toAppointment(apt)) })
    .then(rows => fromAppointment(rows[0]));

export const deleteAppointment = (id) =>
  req(`clinic_appointments?id=eq.${id}`, {
    method: 'DELETE',
    headers: { Prefer: '' },
  });

// ─── Cascade helpers (used when deleting doctor/patient) ──────────────────

export const deleteAppointmentsByDoctor = (licenseNumber) =>
  req(`clinic_appointments?doctor_license=eq.${encodeURIComponent(licenseNumber)}`, {
    method: 'DELETE',
    headers: { Prefer: '' },
  });

export const deleteAppointmentsByPatient = (idNumber) =>
  req(`clinic_appointments?patient_id=eq.${encodeURIComponent(idNumber)}`, {
    method: 'DELETE',
    headers: { Prefer: '' },
  });
