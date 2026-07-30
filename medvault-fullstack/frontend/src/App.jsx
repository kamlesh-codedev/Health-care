import React, { useState, useEffect } from 'react';
import {
  MoreVertical, X, Home, FileText, Brain, Bell, ShieldAlert, Users,
  Settings as SettingsIcon, Upload, Share2, Download, Fingerprint, Lock,
  ChevronRight, Pill, AlertTriangle, CheckCircle2, Clock, QrCode,
  ScanLine, Activity, MessageSquareText, Camera, Search,
  UserCheck, ShieldCheck, TimerReset, BellRing, Languages, Phone, KeyRound, LogOut
} from 'lucide-react';
import { api } from './api';

/* ------------------------------------------------------------------ */
/*  Tokens                                                             */
/* ------------------------------------------------------------------ */

const T = {
  bg: '#F5FAF8',
  surface: '#FFFFFF',
  ink: '#122420',
  inkSoft: '#5C7770',
  line: '#DCE8E3',
  primary: '#154B41',
  primaryDeep: '#0D332B',
  accent: '#2F9E8F',
  accentSoft: '#E4F4F0',
  clay: '#B5533E',
  claySoft: '#F7E7E2',
  amber: '#B98426',
  amberSoft: '#FBF0DA',
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home Dashboard', icon: Home },
  { id: 'vault', label: 'Prescription Vault', icon: FileText },
  { id: 'ai', label: 'AI Analysis', icon: Brain },
  { id: 'reminder', label: 'Medication Reminder', icon: Bell },
  { id: 'fraud', label: 'Fraud Detection', icon: ShieldAlert },
  { id: 'consent', label: 'Consent Sharing', icon: Users },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const STATUS_STYLE = {
  verified: { color: T.primary, bg: T.accentSoft, label: 'VERIFIED', icon: CheckCircle2 },
  pending: { color: T.amber, bg: T.amberSoft, label: 'PENDING', icon: Clock },
  flagged: { color: T.clay, bg: T.claySoft, label: 'FLAGGED', icon: AlertTriangle },
};

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function Stamp({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  const Icon = s.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      border: `1.5px solid ${s.color}`, color: s.color, background: s.bg,
      padding: '3px 9px', borderRadius: 999, fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', transform: 'rotate(-2deg)',
    }}>
      <Icon size={12} strokeWidth={2.5} /> {s.label}
    </span>
  );
}

function PerfEdge({ side = 'left' }) {
  const dots = Array.from({ length: 14 });
  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, [side]: -7, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', width: 14, pointerEvents: 'none' }}>
      {dots.map((_, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: T.bg, border: `1px solid ${T.line}` }} />)}
    </div>
  );
}

function SectionHeader({ eyebrow, title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
      <div>
        {eyebrow && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '0.12em', color: T.accent, fontWeight: 600, marginBottom: 6 }}>{eyebrow}</div>}
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: T.ink, margin: 0, fontWeight: 600 }}>{title}</h1>
        {sub && <p style={{ color: T.inkSoft, fontSize: 13.5, margin: '6px 0 0' }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 18, cursor: onClick ? 'pointer' : 'default', transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease', ...style }}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(21,75,65,0.10)'; e.currentTarget.style.borderColor = T.accent; } }}
      onMouseLeave={(e) => { if (onClick) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = T.line; } }}
    >
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ width: 42, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', background: checked ? T.primary : T.line, position: 'relative', transition: 'background .2s ease', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: checked ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
    </button>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: T.inkSoft, fontSize: 13 }}>
      Loading…
    </div>
  );
}

function ErrorNote({ message }) {
  return (
    <div style={{ background: T.claySoft, border: `1px solid ${T.clay}`, color: T.clay, borderRadius: 10, padding: '10px 14px', fontSize: 12.5, marginBottom: 16 }}>
      {message} — is the backend running on <code>localhost:4000</code>?
    </div>
  );
}

const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6, background: T.primary, color: '#fff', border: 'none',
  borderRadius: 9, padding: '10px 16px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  transition: 'background .15s ease', whiteSpace: 'nowrap',
};
const ghostBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: T.primary,
  border: `1px solid ${T.line}`, borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
};
const linkBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
  color: T.primary, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};

/* ------------------------------------------------------------------ */
/*  Login / OTP                                                        */
/* ------------------------------------------------------------------ */

function Login({ onLoggedIn }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('phone'); // phone | otp
  const [demoOtp, setDemoOtp] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    if (!phone) return setErr('Enter a phone number');
    setBusy(true); setErr('');
    try {
      const data = await api.login(phone);
      setDemoOtp(data.demoOtp);
      setStage('otp');
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const verify = async () => {
    if (!otp) return setErr('Enter the OTP');
    setBusy(true); setErr('');
    try {
      const data = await api.verifyOtp(phone, otp);
      onLoggedIn(data);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
      <div style={{ width: 340, maxWidth: '90vw', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={15} color="#fff" />
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18, color: T.ink }}>MedVault</div>
        </div>

        {stage === 'phone' ? (
          <>
            <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 14 }}>Sign in with your phone number to open your vault.</div>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkSoft, display: 'block', marginBottom: 6 }}>PHONE NUMBER</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${T.line}`, borderRadius: 9, padding: '9px 12px', marginBottom: 14 }}>
              <Phone size={15} color={T.inkSoft} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13.5, fontFamily: 'inherit', color: T.ink }} />
            </div>
            {err && <div style={{ color: T.clay, fontSize: 12, marginBottom: 10 }}>{err}</div>}
            <button onClick={sendOtp} disabled={busy} style={{ ...primaryBtn, width: '100%', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>{busy ? 'Sending…' : 'Send OTP'}</button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 4 }}>Enter the OTP sent to <b>{phone}</b>.</div>
            <div style={{ fontSize: 11.5, color: T.accent, marginBottom: 14 }}>Demo mode — the code is <b>{demoOtp}</b> (no SMS is actually sent).</div>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkSoft, display: 'block', marginBottom: 6 }}>OTP</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${T.line}`, borderRadius: 9, padding: '9px 12px', marginBottom: 14 }}>
              <KeyRound size={15} color={T.inkSoft} />
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13.5, fontFamily: 'inherit', color: T.ink }} />
            </div>
            {err && <div style={{ color: T.clay, fontSize: 12, marginBottom: 10 }}>{err}</div>}
            <button onClick={verify} disabled={busy} style={{ ...primaryBtn, width: '100%', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>{busy ? 'Verifying…' : 'Verify & continue'}</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Screens                                                             */
/* ------------------------------------------------------------------ */

function Dashboard({ go }) {
  const [rx, setRx] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [consent, setConsent] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([api.getPrescriptions(), api.getReminders(), api.getConsent()])
      .then(([rxData, remData, conData]) => { setRx(rxData); setReminders(remData); setConsent(conData); })
      .catch((e) => setErr(e.message));
  }, []);

  const flaggedCount = rx.filter((r) => r.status === 'flagged').length;
  const dueCount = reminders.filter((r) => !r.taken).length;
  const activeDoctors = consent.filter((c) => c.access).length;

  const tiles = [
    { id: 'vault', icon: FileText, title: 'Prescription Vault', desc: 'Upload, verify and store scripts', count: `${rx.length} saved` },
    { id: 'ai', icon: Brain, title: 'AI Analysis', desc: 'Compare, check interactions, dosage', count: 'AI-assisted' },
    { id: 'reminder', icon: Bell, title: 'Medication Reminder', desc: "Today's dosing schedule", count: `${dueCount} still due` },
    { id: 'fraud', icon: ShieldAlert, title: 'Fraud Detection', desc: 'Signature, QR & tamper checks', count: `${flaggedCount} flagged script${flaggedCount === 1 ? '' : 's'}` },
    { id: 'consent', icon: Users, title: 'Consent Sharing', desc: 'Doctors with active access', count: `${activeDoctors} doctors` },
    { id: 'settings', icon: SettingsIcon, title: 'Settings', desc: 'Lock, language, notifications', count: '' },
  ];

  return (
    <div>
      <SectionHeader eyebrow="GOOD EVENING, KAVI" title="Your prescription desk" sub="Everything scanned, verified and scheduled in one place." />
      {err && <ErrorNote message={err} />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 14 }}>
        {tiles.map((t) => (
          <Card key={t.id} onClick={() => go(t.id)} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: T.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <t.icon size={19} color={T.primary} strokeWidth={2} />
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16.5, color: T.ink }}>{t.title}</div>
            <div style={{ fontSize: 12.5, color: T.inkSoft, lineHeight: 1.4 }}>{t.desc}</div>
            {t.count && <div style={{ marginTop: 'auto', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.accent, fontWeight: 600 }}>{t.count}</div>}
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 28 }}>
        <SectionHeader title="Recent prescriptions" sub="Last three scripts added to your vault." action={<button onClick={() => go('vault')} style={linkBtn}>Open vault <ChevronRight size={14} /></button>} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rx.slice(0, 3).map((r) => <RxRow key={r.id} rx={r} />)}
        </div>
      </div>
    </div>
  );
}

function RxRow({ rx }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: '12px 16px' }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: T.primaryDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Pill size={16} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{rx.doctor} <span style={{ color: T.inkSoft, fontWeight: 400 }}>· {rx.clinic}</span></div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.inkSoft, marginTop: 2 }}>{rx.id} · {rx.date} · {(rx.meds || []).length} meds</div>
      </div>
      <Stamp status={rx.status} />
    </div>
  );
}

function Vault() {
  const [rx, setRx] = useState([]);
  const [query, setQuery] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getPrescriptions().then(setRx).catch((e) => setErr(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const scanNow = async () => {
    try {
      await api.addPrescription({ doctor: 'Dr. New Upload', clinic: 'Manually Scanned', meds: ['Pending OCR review'] });
      load();
    } catch (e) { setErr(e.message); }
  };

  const filtered = rx.filter((r) => (r.doctor + r.id + r.clinic).toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <SectionHeader eyebrow="PRESCRIPTION VAULT" title="Your scripts, scanned & stored" sub="Upload a photo or PDF — OCR extracts the text for you to verify." />
      {err && <ErrorNote message={err} />}

      <div style={{ border: `1.5px dashed ${T.accent}`, borderRadius: 14, background: T.accentSoft, padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Upload size={20} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 600, fontSize: 14.5, color: T.ink, fontFamily: "'Fraunces', serif" }}>Upload photo or PDF</div>
          <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 2 }}>OCR extract → edit &amp; verify → save to vault</div>
        </div>
        <button style={primaryBtn} onClick={scanNow}><Camera size={14} /> Scan now</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: '9px 12px', marginBottom: 16 }}>
        <Search size={15} color={T.inkSoft} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by doctor, clinic or Rx ID" style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, background: 'transparent', color: T.ink, fontFamily: 'inherit' }} />
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((rxItem) => (
            <div key={rxItem.id} style={{ position: 'relative', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 4, padding: '16px 20px', overflow: 'visible' }}>
              <PerfEdge side="left" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.accent, fontWeight: 600, letterSpacing: '0.05em' }}>{rxItem.id}</div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16.5, fontWeight: 600, color: T.ink, marginTop: 3 }}>{rxItem.doctor}</div>
                  <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 2 }}>{rxItem.clinic} · {rxItem.date} · {(rxItem.meds || []).length} medicines</div>
                </div>
                <Stamp status={rxItem.status} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, borderTop: `1px dashed ${T.line}`, paddingTop: 12 }}>
                <button style={ghostBtn}><Download size={13} /> Export PDF</button>
                <button style={ghostBtn}><Share2 size={13} /> Share via SMS</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ color: T.inkSoft, fontSize: 13, textAlign: 'center', padding: 20 }}>No prescriptions match "{query}".</div>}
        </div>
      )}
    </div>
  );
}

function AiAnalysis() {
  const tabs = [
    { id: 'compare', label: 'Comparison', icon: FileText },
    { id: 'interact', label: 'Drug Interaction', icon: AlertTriangle },
    { id: 'dosage', label: 'Dosage Analysis', icon: Activity },
    { id: 'symptom', label: 'Symptom Analysis', icon: MessageSquareText },
  ];
  const [tab, setTab] = useState('compare');
  const [rx, setRx] = useState([]);
  const [interaction, setInteraction] = useState(null);
  const [symptom, setSymptom] = useState('');
  const [symptomResult, setSymptomResult] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => { api.getPrescriptions().then(setRx).catch((e) => setErr(e.message)); }, []);

  const runInteractionCheck = async () => {
    try { setInteraction(await api.checkInteractions()); } catch (e) { setErr(e.message); }
  };
  useEffect(() => { if (tab === 'interact' && !interaction) runInteractionCheck(); }, [tab]);

  const analyzeSymptom = async () => {
    if (!symptom.trim()) return;
    try { setSymptomResult(await api.analyzeSymptom(symptom)); } catch (e) { setErr(e.message); }
  };

  return (
    <div>
      <SectionHeader eyebrow="AI ANALYSIS DASHBOARD" title="Cross-check before you take it" sub="Compare scripts, catch interactions, and validate dosage — all AI-assisted." />
      {err && <ErrorNote message={err} />}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, border: `1.5px solid ${tab === t.id ? T.primary : T.line}`, background: tab === t.id ? T.primary : T.surface, color: tab === t.id ? '#fff' : T.inkSoft, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s ease' }}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'compare' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 14 }}>
          {rx.slice(0, 2).map((r) => (
            <Card key={r.id}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.accent, marginBottom: 8 }}>{r.id} · {r.date}</div>
              {(r.meds || []).map((m) => <div key={m} style={{ fontSize: 13, color: T.ink, padding: '7px 0', borderBottom: `1px solid ${T.line}` }}>{m}</div>)}
            </Card>
          ))}
        </div>
      )}

      {tab === 'interact' && (
        <Card style={{ borderColor: interaction?.flagged ? T.clay : T.accent, background: interaction?.flagged ? T.claySoft : T.accentSoft }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <AlertTriangle size={20} color={interaction?.flagged ? T.clay : T.accent} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: T.ink, fontSize: 14 }}>{interaction?.flagged ? 'Possible interaction detected' : 'Interaction check'}</div>
              <p style={{ fontSize: 13, color: T.inkSoft, margin: '6px 0 0', lineHeight: 1.5 }}>{interaction ? interaction.message : 'Checking your prescriptions…'}</p>
            </div>
          </div>
        </Card>
      )}

      {tab === 'dosage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[{ n: 'Amoxicillin', v: 78, note: 'Within standard range' }, { n: 'Ibuprofen', v: 45, note: 'Lower than typical adult dose' }, { n: 'Cetirizine', v: 60, note: 'Within standard range' }].map((d) => (
            <Card key={d.n}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                <span>{d.n}</span><span style={{ color: T.inkSoft, fontWeight: 400 }}>{d.note}</span>
              </div>
              <div style={{ height: 7, borderRadius: 999, background: T.line, overflow: 'hidden' }}>
                <div style={{ width: `${d.v}%`, height: '100%', background: T.accent, borderRadius: 999 }} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'symptom' && (
        <Card>
          <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 10 }}>Describe what you're feeling — AI matches it against your active prescriptions.</div>
          <textarea value={symptom} onChange={(e) => setSymptom(e.target.value)} placeholder="e.g. mild drowsiness since starting the new dose…" rows={3} style={{ width: '100%', border: `1px solid ${T.line}`, borderRadius: 9, padding: 10, fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none', color: T.ink, boxSizing: 'border-box' }} />
          <button style={{ ...primaryBtn, marginTop: 10 }} onClick={analyzeSymptom}>Analyze symptom</button>
          {symptomResult && <div style={{ marginTop: 12, fontSize: 13, color: T.ink, background: T.accentSoft, borderRadius: 9, padding: 12 }}>{symptomResult.note}</div>}
        </Card>
      )}
    </div>
  );
}

function Reminder() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => { api.getReminders().then(setItems).catch((e) => setErr(e.message)); }, []);

  const toggle = async (item) => {
    const next = !item.taken;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, taken: next } : i))); // optimistic
    try { await api.updateReminder(item.id, { taken: next }); } catch (e) { setErr(e.message); }
  };

  return (
    <div>
      <SectionHeader eyebrow="MEDICATION REMINDER" title="Today's schedule" sub="Tap a dose once it's taken — reminders adjust automatically." />
      {err && <ErrorNote message={err} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((i) => (
          <div key={i.id} onClick={() => toggle(i)} style={{ display: 'flex', alignItems: 'center', gap: 14, background: T.surface, border: `1px solid ${i.taken ? T.line : T.accent}`, borderRadius: 12, padding: '13px 16px', cursor: 'pointer', opacity: i.taken ? 0.6 : 1, transition: 'all .15s ease' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${i.taken ? T.primary : T.line}`, background: i.taken ? T.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {i.taken && <CheckCircle2 size={14} color="#fff" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, textDecoration: i.taken ? 'line-through' : 'none' }}>{i.med}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: T.inkSoft }}>
              <Clock size={12} /> {i.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Fraud() {
  const [report, setReport] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.getFraudReport('RX-2260').then(setReport).catch((e) => setErr(e.message)); }, []);

  return (
    <div>
      <SectionHeader eyebrow="FRAUD DETECTION" title="RX-2260 risk review" sub="Automated checks run the moment a script is uploaded." />
      {err && <ErrorNote message={err} />}
      {!report ? <Spinner /> : (
        <>
          <Card style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18, background: T.claySoft, borderColor: T.clay, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 74, height: 74, flexShrink: 0 }}>
              <svg width="74" height="74" viewBox="0 0 74 74">
                <circle cx="37" cy="37" r="31" fill="none" stroke={T.line} strokeWidth="8" />
                <circle cx="37" cy="37" r="31" fill="none" stroke={T.clay} strokeWidth="8" strokeDasharray={2 * Math.PI * 31} strokeDashoffset={2 * Math.PI * 31 * (1 - report.riskScore / 100)} strokeLinecap="round" transform="rotate(-90 37 37)" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, color: T.clay }}>{report.riskScore}%</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: T.ink, fontSize: 15 }}>Elevated fraud risk score</div>
              <p style={{ fontSize: 12.5, color: T.inkSoft, margin: '4px 0 0', lineHeight: 1.5 }}>One check failed. We'd recommend confirming this script directly with the clinic before it's used.</p>
            </div>
          </Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {report.checks.map((c) => {
              const s = STATUS_STYLE[c.status];
              const Icon = c.title.includes('Signature') ? ScanLine : c.title.includes('QR') ? QrCode : AlertTriangle;
              return (
                <Card key={c.title} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={s.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{c.desc}</div>
                  </div>
                  <Stamp status={c.status} />
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Consent() {
  const [doctors, setDoctors] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => { api.getConsent().then(setDoctors).catch((e) => setErr(e.message)); }, []);

  const toggle = async (d) => {
    const next = !d.access;
    setDoctors((prev) => prev.map((x) => (x.id === d.id ? { ...x, access: next } : x)));
    try { await api.updateConsent(d.id, { access: next }); } catch (e) { setErr(e.message); }
  };

  return (
    <div>
      <SectionHeader eyebrow="CONSENT-BASED SHARING" title="Who can see your records" sub="Grant, time-box or revoke doctor access at any moment." />
      {err && <ErrorNote message={err} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {doctors.map((d) => (
          <Card key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.primaryDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
              {d.name.split(' ')[1]?.[0] || 'D'}
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{d.name}</div>
              <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {d.clinic}
                {d.temp && d.access && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: T.amber, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5 }}><TimerReset size={11} /> expires in {d.expires}</span>}
              </div>
            </div>
            <Toggle checked={d.access} onChange={() => toggle(d)} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function Settings() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.getSettings().then(setS).catch((e) => setErr(e.message)); }, []);

  const patch = async (key, value) => {
    setS((prev) => ({ ...prev, [key]: value }));
    try { await api.updateSettings({ [key]: value }); } catch (e) { setErr(e.message); }
  };

  const rows = [
    { key: 'biometric', icon: Fingerprint, title: 'Biometric login', desc: 'Unlock the vault with face or fingerprint' },
    { key: 'pin', icon: Lock, title: 'PIN lock', desc: 'Require a 6-digit PIN on app open' },
    { key: 'notifications', icon: BellRing, title: 'Notifications', desc: 'Dose reminders and access alerts' },
    { key: 'security', icon: ShieldCheck, title: 'Extra security review', desc: 'Flag any script scoring above medium risk' },
  ];

  if (!s) return <Spinner />;

  return (
    <div>
      <SectionHeader eyebrow="SETTINGS" title="Vault preferences" sub="Control how your prescriptions are locked, shared and surfaced." />
      {err && <ErrorNote message={err} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r) => (
          <Card key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: T.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <r.icon size={17} color={T.primary} />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{r.title}</div>
              <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{r.desc}</div>
            </div>
            <Toggle checked={s[r.key]} onChange={(v) => patch(r.key, v)} />
          </Card>
        ))}
        <Card style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: T.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Languages size={17} color={T.primary} />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>Language</div>
            <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>Interface and OCR reading language</div>
          </div>
          <select value={s.language} onChange={(e) => patch('language', e.target.value)} style={{ border: `1px solid ${T.line}`, borderRadius: 8, padding: '6px 10px', fontSize: 12.5, color: T.ink, background: T.surface, fontFamily: 'inherit' }}>
            <option>English</option>
            <option>தமிழ்</option>
            <option>हिन्दी</option>
          </select>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shell: login gate, top bar (three-dot drawer), router               */
/* ------------------------------------------------------------------ */

const SCREENS = { dashboard: Dashboard, vault: Vault, ai: AiAnalysis, reminder: Reminder, fraud: Fraud, consent: Consent, settings: Settings };

export default function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [entering, setEntering] = useState(true);

  const go = (id) => {
    setDrawerOpen(false);
    if (id === view) return;
    setEntering(false);
    setTimeout(() => { setView(id); setEntering(true); }, 140);
  };

  useEffect(() => { setEntering(true); }, []);

  if (!session) return <Login onLoggedIn={setSession} />;

  const Active = SCREENS[view];
  const activeLabel = NAV_ITEMS.find((n) => n.id === view)?.label || '';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: T.bg, minHeight: '100vh', height: '100vh', width: '100vw', color: T.ink, position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; }
        #root { width: 100% !important; max-width: none !important; min-height: 100vh !important; border-inline: none !important; margin: 0 !important; padding: 0 !important; text-align: left !important; display: block !important; }
        ::selection { background: ${T.accentSoft}; }
        .fade-in { animation: fadeIn .32s ease both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-out { animation: fadeOut .14s ease both; }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        .drawer-scrim { transition: opacity .22s ease; }
        .drawer-panel { transition: transform .28s cubic-bezier(.22,.85,.4,1); }
        button { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'rgba(245,250,248,0.9)', backdropFilter: 'blur(6px)', borderBottom: `1px solid ${T.line}` }}>
        <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.line}`, background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'border-color .15s ease' }}>
          <MoreVertical size={17} color={T.primary} />
        </button>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Pill size={13} color="#fff" />
        </div>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15, color: T.ink }}>MedVault</div>
        <div style={{ marginLeft: 'auto', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.inkSoft }}>{activeLabel}</div>
      </div>

      <div style={{ padding: '22px 40px 60px', width: '100%', maxWidth: 1400, margin: '0 auto', overflowY: 'auto', height: 'calc(100vh - 58px)', boxSizing: 'border-box' }}>
        <div key={view} className={entering ? 'fade-in' : 'fade-out'}>
          <Active go={go} />
        </div>
      </div>

      {drawerOpen && <div className="drawer-scrim" onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,51,43,0.35)', zIndex: 30 }} />}

      <div className="drawer-panel" style={{ position: 'fixed', top: 0, bottom: 0, left: 0, width: 268, background: T.surface, zIndex: 31, transform: drawerOpen ? 'translateX(0)' : 'translateX(-104%)', boxShadow: '10px 0 30px rgba(13,51,43,0.15)', display: 'flex', flexDirection: 'column', padding: '18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, padding: '0 6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pill size={13} color="#fff" />
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15, color: T.ink }}>MedVault</div>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={17} color={T.inkSoft} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV_ITEMS.map((item) => {
            const active = item.id === view;
            return (
              <button key={item.id} onClick={() => go(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, border: 'none', background: active ? T.accentSoft : 'transparent', color: active ? T.primary : T.inkSoft, fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background .12s ease', width: '100%' }}>
                <item.icon size={16} /> {item.label}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', padding: '12px 12px 4px', borderTop: `1px solid ${T.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: T.inkSoft }}>
              <UserCheck size={13} color={T.accent} /> {session.phone}
            </div>
            <button onClick={() => setSession(null)} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.inkSoft }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
