// In-memory data store. Restarts reset it — swap this module for a real
// database (SQLite, Postgres, Mongo) later without touching server.js's
// route logic, since every route only calls the functions below.

let prescriptions = [
  { id: 'RX-2291', doctor: 'Dr. Meera Nandan', clinic: 'Greenview Clinic', date: '24 Jul 2026', status: 'verified', meds: ['Amoxicillin 500mg — 3x daily', 'Paracetamol 650mg — as needed', 'Cetirizine 10mg — at night'] },
  { id: 'RX-2287', doctor: 'Dr. Arjun Kale', clinic: 'St. Xavier Hospital', date: '18 Jul 2026', status: 'pending', meds: ['Vitamin D3 60000IU — weekly', 'Calcium 500mg — 2x daily'] },
  { id: 'RX-2260', doctor: 'Dr. Priya Ram', clinic: 'Sunrise Diagnostics', date: '02 Jul 2026', status: 'flagged', meds: ['Amoxicillin 500mg — 2x daily', 'Ibuprofen 400mg — as needed', 'Montelukast 10mg — at night', 'Cetirizine 10mg — at night'] },
  { id: 'RX-2214', doctor: 'Dr. Meera Nandan', clinic: 'Greenview Clinic', date: '19 Jun 2026', status: 'verified', meds: ['Azithromycin 250mg — once daily'] },
];

let reminders = [
  { id: 1, med: 'Amoxicillin 500mg', time: '8:00 AM', taken: true },
  { id: 2, med: 'Cetirizine 10mg', time: '1:00 PM', taken: true },
  { id: 3, med: 'Amoxicillin 500mg', time: '2:00 PM', taken: false },
  { id: 4, med: 'Paracetamol 650mg', time: '8:00 PM', taken: false },
];

let consent = [
  { id: 1, name: 'Dr. Meera Nandan', clinic: 'Greenview Clinic', access: true, temp: false },
  { id: 2, name: 'Dr. Arjun Kale', clinic: 'St. Xavier Hospital', access: true, temp: true, expires: '3 days' },
  { id: 3, name: 'Dr. Priya Ram', clinic: 'Sunrise Diagnostics', access: false, temp: false },
];

let settings = { biometric: true, pin: true, notifications: true, security: false, language: 'English' };

const fraudReports = {
  'RX-2260': {
    rxId: 'RX-2260',
    riskScore: 68,
    checks: [
      { title: 'Signature Verification', desc: 'Matches doctor signature on file', status: 'verified' },
      { title: 'QR Verification', desc: 'Clinic QR code validated', status: 'verified' },
      { title: 'Tampering Detection', desc: 'Dosage figure appears altered', status: 'flagged' },
    ],
  },
};

let otpStore = {}; // phone -> otp, cleared once verified
let nextRxId = 2292;
let nextReminderId = 5;

module.exports = {
  // prescriptions
  listPrescriptions: () => prescriptions,
  addPrescription: (p) => {
    const rx = { id: `RX-${nextRxId++}`, status: 'pending', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), ...p };
    prescriptions = [rx, ...prescriptions];
    return rx;
  },

  // reminders
  listReminders: () => reminders,
  updateReminder: (id, patch) => {
    reminders = reminders.map((r) => (r.id === Number(id) ? { ...r, ...patch } : r));
    return reminders.find((r) => r.id === Number(id));
  },

  // consent
  listConsent: () => consent,
  updateConsent: (id, patch) => {
    consent = consent.map((c) => (c.id === Number(id) ? { ...c, ...patch } : c));
    return consent.find((c) => c.id === Number(id));
  },

  // settings
  getSettings: () => settings,
  updateSettings: (patch) => {
    settings = { ...settings, ...patch };
    return settings;
  },

  // fraud
  getFraudReport: (rxId) => fraudReports[rxId] || null,

  // auth (mock — good enough for a demo/local build, not production auth)
  requestOtp: (phone) => {
    const code = '123456'; // fixed demo code so you don't need an SMS provider
    otpStore[phone] = code;
    return code;
  },
  verifyOtp: (phone, code) => {
    const ok = otpStore[phone] === code;
    if (ok) delete otpStore[phone];
    return ok;
  },
};
