// Static data mode — no Supabase, no network calls.
// Data frozen from production snapshot on 2026-07-01.
import { DOCTORS_RAW, PATIENTS_RAW, APPOINTMENTS_RAW } from './staticData';

// ─── Mappers: DB (snake_case) → App (camelCase) ───────────────────────────

const fromDoctor = (d) => ({
  licenseNumber: d.license_number,
  doctorName:    d.doctor_name,
});

const fromPatient = (p) => ({
  idNumber:    p.id_number,
  patientName: p.patient_name,
  phoneNumber: p.phone_number,
});

const fromAppointment = (a) => ({
  appointmentNumber: a.id,
  dateTime:          a.date_time ? a.date_time.slice(0, 16) : '',
  reason:            a.reason,
  doctorLicense:     a.doctor_license,
  patientId:         a.patient_id,
});

const READ_ONLY = () => Promise.reject(new Error('מצב תצוגה — הנתונים קפואים'));

// ─── Doctors ──────────────────────────────────────────────────────────────

export const getDoctors = () =>
  Promise.resolve(DOCTORS_RAW.map(fromDoctor));

export const addDoctor                  = READ_ONLY;
export const deleteDoctor               = READ_ONLY;

// ─── Patients ─────────────────────────────────────────────────────────────

export const getPatients = () =>
  Promise.resolve(PATIENTS_RAW.map(fromPatient));

export const addPatient                 = READ_ONLY;
export const deletePatient              = READ_ONLY;

// ─── Appointments ─────────────────────────────────────────────────────────

export const getAppointments = () =>
  Promise.resolve(APPOINTMENTS_RAW.map(fromAppointment));

export const addAppointment             = READ_ONLY;
export const deleteAppointment          = READ_ONLY;
export const deleteAppointmentsByDoctor = READ_ONLY;
export const deleteAppointmentsByPatient = READ_ONLY;
