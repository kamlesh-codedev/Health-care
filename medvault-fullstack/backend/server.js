const express = require('express');
const cors = require('cors');
const db = require('./data');

const app = express();
app.use(cors());
app.use(express.json());

const ok = (res, data) => res.json({ ok: true, data });
const fail = (res, status, message) => res.status(status).json({ ok: false, message });

/* ---------------------------- Auth ---------------------------- */
// Demo auth only: any name/phone works, OTP is always 123456.
// Swap for real auth (Firebase, Auth0, your own JWT flow) before shipping.

app.post('/api/auth/register', (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return fail(res, 400, 'name and phone are required');
  const code = db.requestOtp(phone);
  console.log(`[demo OTP] ${phone} -> ${code}`);
  ok(res, { message: 'OTP sent', demoOtp: code });
});

app.post('/api/auth/login', (req, res) => {
  const { phone } = req.body;
  if (!phone) return fail(res, 400, 'phone is required');
  const code = db.requestOtp(phone);
  console.log(`[demo OTP] ${phone} -> ${code}`);
  ok(res, { message: 'OTP sent', demoOtp: code });
});

app.post('/api/auth/otp/verify', (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return fail(res, 400, 'phone and otp are required');
  const valid = db.verifyOtp(phone, otp);
  if (!valid) return fail(res, 401, 'Incorrect or expired OTP');
  ok(res, { token: `demo-token-${Date.now()}`, phone });
});

/* ------------------------ Prescriptions ------------------------ */

app.get('/api/prescriptions', (req, res) => ok(res, db.listPrescriptions()));

app.post('/api/prescriptions', (req, res) => {
  const { doctor, clinic, meds } = req.body;
  if (!doctor || !clinic) return fail(res, 400, 'doctor and clinic are required');
  const rx = db.addPrescription({ doctor, clinic, meds: meds || [] });
  ok(res, rx);
});

/* --------------------------- Reminders -------------------------- */

app.get('/api/reminders', (req, res) => ok(res, db.listReminders()));

app.patch('/api/reminders/:id', (req, res) => {
  const updated = db.updateReminder(req.params.id, req.body);
  if (!updated) return fail(res, 404, 'Reminder not found');
  ok(res, updated);
});

/* ----------------------------- Fraud ----------------------------- */

app.get('/api/fraud/:rxId', (req, res) => {
  const report = db.getFraudReport(req.params.rxId);
  if (!report) return fail(res, 404, 'No fraud report for that prescription');
  ok(res, report);
});

/* ---------------------------- Consent ---------------------------- */

app.get('/api/consent', (req, res) => ok(res, db.listConsent()));

app.patch('/api/consent/:id', (req, res) => {
  const updated = db.updateConsent(req.params.id, req.body);
  if (!updated) return fail(res, 404, 'Doctor not found');
  ok(res, updated);
});

/* --------------------------- Settings ----------------------------- */

app.get('/api/settings', (req, res) => ok(res, db.getSettings()));

app.patch('/api/settings', (req, res) => ok(res, db.updateSettings(req.body)));

/* -------------------------- AI analysis --------------------------- */
// Rule-based stand-ins so the app runs end-to-end offline. Point these
// at a real model (Anthropic API, your own service) when you're ready.

app.post('/api/ai/symptom', (req, res) => {
  const { symptom } = req.body;
  if (!symptom) return fail(res, 400, 'symptom text is required');
  const lower = symptom.toLowerCase();
  let note = 'No known match against your active prescriptions — if it persists, mention it to your doctor.';
  if (lower.includes('drowsy') || lower.includes('sleepy')) note = 'Drowsiness is a listed side effect of Cetirizine in your active prescriptions.';
  if (lower.includes('stomach') || lower.includes('nausea')) note = 'Mild stomach upset is a common side effect of Amoxicillin taken without food.';
  ok(res, { symptom, note });
});

app.post('/api/ai/interaction', (req, res) => {
  const list = db.listPrescriptions();
  const allMeds = list.flatMap((rx) => rx.meds.map((m) => m.split(' ')[0]));
  const hasIbuprofen = allMeds.includes('Ibuprofen');
  const hasMontelukast = allMeds.includes('Montelukast');
  const flagged = hasIbuprofen && hasMontelukast;
  ok(res, {
    flagged,
    message: flagged
      ? 'Ibuprofen and Montelukast both appear across your recent scripts — moderate interaction risk, review with your doctor.'
      : 'No known interactions detected across your current prescriptions.',
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`MedVault backend running on http://localhost:${PORT}`));
