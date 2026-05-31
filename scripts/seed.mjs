// QFlow seed script — realistic clinic data for a 3-month window
// Run: node scripts/seed.mjs

const URL = 'https://pvqucrpxfupqefhvcohc.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2cXVjcnB4ZnVwcWVmaHZjb2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzkzMDQsImV4cCI6MjA5MzY1NTMwNH0.LWnayXYA3X34oEs2laj6Ep3HIOiTejjAYoys033fNh0';

const H = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function req(path, method = 'GET', body) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: H,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function wipe() {
  console.log('🗑  Wiping existing data…');
  await fetch(`${URL}/rest/v1/clinic_appointments?id=gte.0`,         { method: 'DELETE', headers: { ...H, Prefer: '' } });
  await fetch(`${URL}/rest/v1/clinic_doctors?license_number=gte.0`,  { method: 'DELETE', headers: { ...H, Prefer: '' } });
  await fetch(`${URL}/rest/v1/clinic_patients?id_number=gte.0`,      { method: 'DELETE', headers: { ...H, Prefer: '' } });
}

// ── Static data ───────────────────────────────────────────────────────────────
const DOCTORS = [
  { license_number: '54321', doctor_name: 'ד"ר יעל כהן'     },
  { license_number: '67890', doctor_name: 'ד"ר משה לוי'      },
  { license_number: '11223', doctor_name: 'ד"ר רחל גולדברג'  },
  { license_number: '44556', doctor_name: 'ד"ר אבי שפירא'    },
  { license_number: '78901', doctor_name: 'ד"ר נועה ברק'     },
  { license_number: '33445', doctor_name: 'ד"ר דוד אזולאי'   },
];

const PATIENTS = [
  { id_number: '123456789', patient_name: 'אורן לוי',       phone_number: '0501234567' },
  { id_number: '234567890', patient_name: 'דנה אברהם',      phone_number: '0521234567' },
  { id_number: '345678901', patient_name: 'יוסי מזרחי',     phone_number: '0541234567' },
  { id_number: '456789012', patient_name: 'מרים כהן',       phone_number: '0531234567' },
  { id_number: '567890123', patient_name: 'שירה ברק',       phone_number: '0521234568' },
  { id_number: '678901234', patient_name: 'נועם גוטמן',     phone_number: '0501234568' },
  { id_number: '789012345', patient_name: 'תמר בן-דוד',     phone_number: '0541234568' },
  { id_number: '890123456', patient_name: 'איתן ארז',       phone_number: '0531234568' },
  { id_number: '901234567', patient_name: 'ליאור שמש',      phone_number: '0521234569' },
  { id_number: '112345678', patient_name: 'ענת פרץ',        phone_number: '0501234569' },
  { id_number: '223456789', patient_name: 'אסף קרטון',      phone_number: '0541234569' },
  { id_number: '334567890', patient_name: 'רוני אלון',      phone_number: '0531234569' },
  { id_number: '445678901', patient_name: 'הילה שפיר',      phone_number: '0521234560' },
  { id_number: '556789012', patient_name: 'גל מנשה',        phone_number: '0501234560' },
  { id_number: '667890123', patient_name: 'מיכל רוזן',      phone_number: '0541234560' },
  { id_number: '778901234', patient_name: 'יובל גרין',      phone_number: '0531234560' },
  { id_number: '889012345', patient_name: 'טל ניר',         phone_number: '0521234561' },
  { id_number: '990123456', patient_name: 'שקד אמיר',       phone_number: '0501234561' },
  { id_number: '119012345', patient_name: 'לירן אלישע',     phone_number: '0541234561' },
  { id_number: '228901234', patient_name: 'נדב ששון',       phone_number: '0531234561' },
  { id_number: '337890123', patient_name: 'אביגיל חיים',    phone_number: '0521234562' },
  { id_number: '446890123', patient_name: 'בן שלום',        phone_number: '0501234562' },
  { id_number: '557890123', patient_name: 'כרמל דהן',       phone_number: '0541234562' },
  { id_number: '668890123', patient_name: 'עמית סלע',       phone_number: '0531234562' },
  // 10 new patients
  { id_number: '771234567', patient_name: 'רם ביטון',       phone_number: '0521234563' },
  { id_number: '882345678', patient_name: 'עדן מולא',       phone_number: '0501234563' },
  { id_number: '993456789', patient_name: 'ישי פרידמן',     phone_number: '0541234563' },
  { id_number: '114567890', patient_name: 'נטלי גבאי',      phone_number: '0531234563' },
  { id_number: '225678901', patient_name: 'עומר חדד',       phone_number: '0521234564' },
  { id_number: '336789012', patient_name: 'שני אוחיון',     phone_number: '0501234564' },
  { id_number: '447890123', patient_name: 'בר כץ',          phone_number: '0541234564' },
  { id_number: '558901234', patient_name: 'יהל מזרחי',      phone_number: '0531234564' },
  { id_number: '669012345', patient_name: 'לאה שטרן',       phone_number: '0521234565' },
  { id_number: '770123456', patient_name: 'עידו נחום',      phone_number: '0501234565' },
];

const REASONS = [
  'בדיקה שגרתית',
  'מעקב טיפול',
  'כאבים / תלונות',
  'בדיקות דם',
  'המשך טיפול',
  'ייעוץ',
];

// Clinic slots: 08:00–17:30 every 30 min (weekdays only)
const SLOTS = [];
for (let h = 8; h < 18; h++) {
  SLOTS.push({ h, m: 0 });
  SLOTS.push({ h, m: 30 });
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Returns a random working-day date between offsetDaysMin and offsetDaysMax from today
function randomWorkDay(minDays, maxDays) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let attempts = 0;
  while (attempts++ < 100) {
    const offset = minDays + Math.floor(Math.random() * (maxDays - minDays));
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    if (d.getDay() !== 6) return d; // skip Saturday
  }
  return null;
}

// Build appointments: 3 per patient, spread naturally across the window
// - Appointment 1: past (1–20 days ago)   → shows as history / COMPLETE
// - Appointment 2: near future (1–45 days) → SCHEDULED, relevant for this month
// - Appointment 3: further out (46–90 days) → 2–3 months ahead
function buildAppointments(licences, patientIds) {
  const apts = [];
  const usedSlots = new Set(); // "license|YYYY-MM-DD|HH:MM" — no two same doctor+slot

  function trySlot(license, day) {
    // Shuffle slots and find one not already used for this doctor+day
    const dayKey = day.toISOString().slice(0, 10);
    const shuffled = [...SLOTS].sort(() => Math.random() - 0.5);
    for (const { h, m } of shuffled) {
      const key = `${license}|${dayKey}|${h}:${String(m).padStart(2,'0')}`;
      if (!usedSlots.has(key)) {
        usedSlots.add(key);
        const dt = new Date(day);
        dt.setHours(h, m, 0, 0);
        return dt;
      }
    }
    return null; // all slots full for this doctor on this day (unlikely)
  }

  const windows = [
    { min: -20, max: -1  },  // past — shows as COMPLETE
    { min:   1, max:  45 },  // near future
    { min:  46, max:  90 },  // far future
  ];

  for (const patId of patientIds) {
    for (const { min, max } of windows) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts++ < 20) {
        const day = randomWorkDay(min, max);
        if (!day) continue;
        const license = pick(licences);
        const dt = trySlot(license, day);
        if (dt) {
          apts.push({
            date_time:      dt.toISOString(),
            reason:         pick(REASONS),
            doctor_license: license,
            patient_id:     patId,
          });
          placed = true;
        }
      }
    }
  }

  // Sort chronologically
  apts.sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
  return apts;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  await wipe();

  console.log('👨‍⚕️  Inserting doctors…');
  const docs = await req('clinic_doctors', 'POST', DOCTORS);
  console.log(`   ✓ ${docs.length} doctors`);

  console.log('🧑  Inserting patients…');
  const pats = await req('clinic_patients', 'POST', PATIENTS);
  console.log(`   ✓ ${pats.length} patients`);

  const licences   = DOCTORS.map(d => d.license_number);
  const patientIds = PATIENTS.map(p => p.id_number);

  const apts = buildAppointments(licences, patientIds);
  console.log(`📅  Inserting ${apts.length} appointments…`);

  // Insert in chunks of 100
  let inserted = 0;
  for (let i = 0; i < apts.length; i += 100) {
    await req('clinic_appointments', 'POST', apts.slice(i, i + 100));
    inserted += Math.min(100, apts.length - i);
    process.stdout.write(`\r   ✓ ${inserted}/${apts.length}`);
  }

  console.log(`\n\n✅  Seeded:`);
  console.log(`   ${docs.length} doctors`);
  console.log(`   ${pats.length} patients`);
  console.log(`   ${apts.length} appointments  (past → +3 months, 3 per patient)`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
