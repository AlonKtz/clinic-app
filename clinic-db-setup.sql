-- ============================================================
--  QFlow — Supabase Database Setup
--  Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Doctors
CREATE TABLE IF NOT EXISTS clinic_doctors (
  license_number TEXT        PRIMARY KEY,
  doctor_name    TEXT        NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patients
CREATE TABLE IF NOT EXISTS clinic_patients (
  id_number    TEXT        PRIMARY KEY,
  patient_name TEXT        NOT NULL,
  phone_number TEXT        NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Appointments
CREATE TABLE IF NOT EXISTS clinic_appointments (
  id             SERIAL      PRIMARY KEY,
  date_time      TIMESTAMPTZ NOT NULL,
  reason         TEXT        NOT NULL,
  doctor_license TEXT        NOT NULL REFERENCES clinic_doctors(license_number) ON DELETE CASCADE,
  patient_id     TEXT        NOT NULL REFERENCES clinic_patients(id_number)     ON DELETE CASCADE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Row Level Security — allow all (demo / academic project)
ALTER TABLE clinic_doctors      ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_patients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qflow_doctors_all"      ON clinic_doctors      FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "qflow_patients_all"     ON clinic_patients     FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "qflow_appointments_all" ON clinic_appointments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. Sample data (optional — delete if you don't want it)
INSERT INTO clinic_doctors (license_number, doctor_name) VALUES
  ('54321', 'ד"ר יעל כהן'),
  ('67890', 'ד"ר משה לוי'),
  ('11223', 'ד"ר רחל גולדברג'),
  ('44556', 'ד"ר אבי שפירא')
ON CONFLICT DO NOTHING;

INSERT INTO clinic_patients (id_number, patient_name, phone_number) VALUES
  ('123456789', 'דנה אברהם',  '0521234567'),
  ('234567891', 'יוסי מזרחי', '0531234567'),
  ('345678902', 'מרים כהן',   '0541234567'),
  ('456789013', 'אורן לוי',   '0521111222'),
  ('567890124', 'שירה ברק',   '0503333444'),
  ('678901235', 'נועם גוטמן', '0544444555')
ON CONFLICT DO NOTHING;

INSERT INTO clinic_appointments (date_time, reason, doctor_license, patient_id) VALUES
  ('2026-05-08T09:00:00+03', 'בדיקה שגרתית',   '54321', '123456789'),
  ('2026-05-08T10:30:00+03', 'בדיקות דם',       '67890', '234567891'),
  ('2026-05-09T08:30:00+03', 'כאבים / תלונות', '11223', '345678902'),
  ('2026-05-09T11:00:00+03', 'מעקב טיפול',      '44556', '456789013'),
  ('2026-05-12T14:00:00+03', 'ייעוץ',           '54321', '567890124'),
  ('2026-05-13T09:30:00+03', 'המשך טיפול',      '67890', '678901235'),
  ('2026-05-14T16:00:00+03', 'בדיקה שגרתית',   '11223', '123456789'),
  ('2026-05-15T10:00:00+03', 'בדיקות דם',       '54321', '234567891')
ON CONFLICT DO NOTHING;
