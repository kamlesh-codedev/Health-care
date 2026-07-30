# MedVault — full-stack app

A React frontend + Node/Express backend implementing the workflow: Login/OTP,
Home Dashboard, Prescription Vault, AI Analysis, Medication Reminder, Fraud
Detection, Consent Sharing, and Settings.

```
medvault-fullstack/
  backend/     Node + Express API (in-memory data store)
  frontend/    React + Vite app (talks to the backend over HTTP)
```

## 1. Run the backend

```
cd backend
npm install
npm run dev
```

Starts the API on **http://localhost:4000**. Leave this terminal running.

## 2. Run the frontend (in a second terminal)

```
cd frontend
npm install
npm run dev
```

Starts the app on **http://localhost:5173** and opens the browser there.

## 3. Sign in

The login screen asks for a phone number, then an OTP. This is a demo auth
flow — no real SMS is sent. The OTP is always shown on-screen after you
request it (also printed in the backend terminal), so just copy it into the
OTP field to continue.

## What's real vs. mocked

- **Prescriptions, reminders, consent, settings** — live data served from
  the backend's in-memory store. Toggling a reminder or a doctor's access,
  or scanning a new prescription, actually hits the API and persists for
  as long as the backend process stays running (it resets on restart —
  swap `backend/data.js` for a real database when you're ready).
- **OCR upload** — "Scan now" adds a placeholder prescription record rather
  than running real OCR; wire in an OCR service (Tesseract, Google Vision,
  etc.) inside `backend/server.js`'s `POST /api/prescriptions` route.
- **AI analysis (symptom check, drug interaction)** — simple rule-based
  logic in `backend/server.js` so the app works fully offline. Swap in a
  real model call (e.g. the Anthropic API) inside those two routes.
- **Fraud detection score** — a fixed sample report for `RX-2260`. Extend
  `backend/data.js` to compute this per-prescription.

## Notes

- CORS is open on the backend for local development. Lock it down before
  deploying anywhere public.
- The frontend expects the backend at `http://localhost:4000/api`
  (see `frontend/src/api.js`) — change `API_BASE` there if you deploy the
  backend elsewhere.
