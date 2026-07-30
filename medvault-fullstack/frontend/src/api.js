const API_BASE = 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.ok === false) {
    throw new Error(body.message || `Request to ${path} failed`);
  }
  return body.data;
}

export const api = {
  // auth
  login: (phone) => request('/auth/login', { method: 'POST', body: JSON.stringify({ phone }) }),
  register: (name, phone) => request('/auth/register', { method: 'POST', body: JSON.stringify({ name, phone }) }),
  verifyOtp: (phone, otp) => request('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone, otp }) }),

  // prescriptions
  getPrescriptions: () => request('/prescriptions'),
  addPrescription: (payload) => request('/prescriptions', { method: 'POST', body: JSON.stringify(payload) }),

  // reminders
  getReminders: () => request('/reminders'),
  updateReminder: (id, patch) => request(`/reminders/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  // consent
  getConsent: () => request('/consent'),
  updateConsent: (id, patch) => request(`/consent/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  // settings
  getSettings: () => request('/settings'),
  updateSettings: (patch) => request('/settings', { method: 'PATCH', body: JSON.stringify(patch) }),

  // fraud
  getFraudReport: (rxId) => request(`/fraud/${rxId}`),

  // AI
  analyzeSymptom: (symptom) => request('/ai/symptom', { method: 'POST', body: JSON.stringify({ symptom }) }),
  checkInteractions: () => request('/ai/interaction', { method: 'POST', body: JSON.stringify({}) }),
};
