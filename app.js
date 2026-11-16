'use strict';
// TExES PPR Exam Prep 2026 for Windows: port of the SwiftUI iOS app.
// Hard paywall: content is gated until the user owns a Microsoft Store add-on
// (monthly / yearly subscription or lifetime durable), checked via the Digital Goods API.

// MARK: - Config

const APP_VERSION = '1.0.0';
const BILLING = 'https://store.microsoft.com/billing';
// Partner Center add-on Product IDs (InAppOfferToken). Must match Partner Center exactly.
const PRODUCTS = { monthly: 'ppr_monthly', yearly: 'ppr_yearly', lifetime: 'ppr_lifetime' };
const PRODUCT_ORDER = [PRODUCTS.yearly, PRODUCTS.monthly, PRODUCTS.lifetime];
// Microsoft Store ID (Partner Center > Product identity). Empty until the name is reserved.
const STORE_ID = '9P1S4V17PNNF';
const LINKS = {
  base: 'https://joykhansayan1.github.io/texes-ppr-exam-prep-windows',
  get privacy() { return this.base + '/privacy.html'; },
  get terms() { return this.base + '/terms.html'; },
  get support() { return this.base + '/support.html'; },
  store: STORE_ID ? `https://apps.microsoft.com/detail/${STORE_ID}` : 'https://apps.microsoft.com/search?query=TExES%20PPR%20Exam%20Prep',
  manageSubscriptions: 'https://account.microsoft.com/services'
};
const DISCLAIMER = "TExES PPR Exam Prep 2026 is an independent study aid and is not affiliated with, authorized, endorsed by, or sponsored by the Texas Education Agency (TEA), Pearson Education, or any state testing authority. TExES is used only to describe the exam this app helps you study for. All practice questions are original and were written from the publicly available PPR EC-12 competency framework.";
// Practice mock as in the iOS app: 80 questions, 100 minutes, 75% as a study approximation of the 240 scaled pass score.
const PASS = 75;
const TRACKS = {
  main: { title: 'TExES PPR EC-12 (160)', short: 'PPR', icon: 'closedBook', subtitle: '80 questions · 100 minutes · 75% practice pass', count: 80, minutes: 100 }
};
// Screenshot/demo mode: only on a local dev host so the paywall can't be bypassed from the public site.
const IS_LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);
const PARAMS = new URLSearchParams(location.search);
const DEMO = IS_LOCAL && PARAMS.has('demo');

// MARK: - Icons (inline SVG, stroke style)

const ICON_PATHS = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  stack: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  cards: '<rect x="3" y="7" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M8 11h8M5 14a7 7 0 0 0 14 0"/>',
  plane: '<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>',
  library: '<path d="M4 4h4v16H4zM10 4h4v16h-4zM16 5l3.5-1 2.5 15.5-3.5 1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  snowflake: '<path d="M12 2v20M4.9 6.5l14.2 11M4.9 17.5l14.2-11M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5M3.5 10l3.5 1-1 3.5M20.5 10l-3.5 1 1 3.5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  scale: '<path d="M12 3v18M5 21h14M4 7h16M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  checklist: '<path d="M4 6l2 2 3-3M4 13l2 2 3-3M12 7h8M12 14h8M12 20h8"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  list: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h10M7 17h6"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  bookmarkFill: '<path d="M6 3h12v18l-6-4-6 4z" fill="currentColor"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  flagFill: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5z" fill="currentColor"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  checkFill: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M7.5 12l3 3 6-6.5" stroke="#fff"/>',
  xFill: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  square: '<rect x="4" y="4" width="16" height="16" rx="3"/>',
  squareCheck: '<rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" stroke="none"/><path d="M7.5 12l3 3 6-6.5" stroke="#fff"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
  wifiOff: '<path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4-2.3M19 12.5a10 10 0 0 0-2.6-1.8M2 8.8a15 15 0 0 1 4.6-2.9M22 8.8A15 15 0 0 0 11 5"/><circle cx="12" cy="20" r=".5"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10V6a2 2 0 0 0-4 0v8a8 8 0 0 0 16 0v-3a2 2 0 0 0-4 0"/>',
  doc: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/>',
  closedBook: '<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h12"/>',
  play: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>',
  bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  seal: '<path d="M12 2l2.4 2.2 3.2-.4.9 3.1 2.9 1.5-1 3.1 1 3.1-2.9 1.5-.9 3.1-3.2-.4L12 22l-2.4-2.2-3.2.4-.9-3.1-2.9-1.5 1-3.1-1-3.1 2.9-1.5.9-3.1 3.2.4z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'
};
function icon(name, cls = '', style = '') {
  return `<svg class="${cls}" style="${style}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;
}

// MARK: - Helpers

const $app = document.getElementById('app');
const $modal = document.getElementById('modal-root');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const DAY = 86400000;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const dayKey = (d = Date.now()) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
const toDateInput = dayKey;
const fromDateInput = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
const pctColor = (v) => v >= 0.7 ? 'var(--green)' : 'var(--accent)';
const mmss = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } };

// MARK: - Question bank

const Bank = {
  all: [], byId: new Map(), topicList: [], library: { sections: [] },
  async load() {
    const [qRes, lRes] = await Promise.all([fetch('questions.json'), fetch('library.json')]);
    const data = await qRes.json();
    this.all = data.questions;
    this.topicList = data.topics;
    this.byId = new Map(this.all.map((q) => [q.id, q]));
    try { this.library = await lRes.json(); } catch { this.library = { sections: [] }; }
  },
  forTrack() { return this.all; },
  contains() { return true; },
  topics() { return this.topicList; },
  topicName(key) { return (this.topicList.find((x) => x.key === key) || {}).name || key; },
  inTopic(t, key) { return this.all.filter((q) => q.topicKey === key); },
  sample(t, n, topicKeys = null) {
    let pool = this.all;
    if (topicKeys && topicKeys.length) pool = pool.filter((q) => topicKeys.includes(q.topicKey));
    return shuffle(pool).slice(0, n);
  },
  // Full mock: sample each domain by its modeled weight, as the iOS app does.
  mock() {
    const n = TRACKS.main.count, out = [];
    for (const d of this.topicList) out.push(...shuffle(this.all.filter((q) => q.topicKey === d.key)).slice(0, Math.round(n * d.weight / 100)));
    if (out.length < n) { const ids = new Set(out.map((q) => q.id)); out.push(...shuffle(this.all.filter((q) => !ids.has(q.id))).slice(0, n - out.length)); }
    return shuffle(out.slice(0, n));
  },
  lookup(ids) { return ids.map((id) => this.byId.get(id)).filter(Boolean); },
  section(id) { return this.library.sections.find((x) => x.id === id); },
  libTopic(id) { for (const sec of this.library.sections) { const t = sec.topics.find((x) => x.id === id); if (t) return { sec, t }; } return null; }
};

// MARK: - User progress (persisted)

const PROGRESS_KEY = 'texesppr.progress.v1';
const defaultProgress = () => ({
  onboarded: false, track: 'main', diagnosticDone: false,
  profile: { examDate: null, dailyGoal: 20, goalPercent: 70, reason: '', experience: '' },
  stats: {}, srs: {}, bookmarks: [], mocks: [], studyDays: [], dailyCounts: {}
});
const P = {
  data: defaultProgress(),
  load() {
    const raw = lsGet(PROGRESS_KEY);
    if (raw) {
      try { const d = JSON.parse(raw); this.data = { ...defaultProgress(), ...d, profile: { ...defaultProgress().profile, ...(d.profile || {}) } }; }
      catch { /* corrupt: start fresh */ }
    }
  },
  save() { if (!DEMO) lsSet(PROGRESS_KEY, JSON.stringify(this.data)); },
  get track() { return 'main'; },
  recordAnswer(q, correct) {
    const d = this.data, s = d.stats[q.id] || { seen: 0, correct: 0, last: false, at: 0 };
    s.seen++; if (correct) s.correct++;
    s.last = correct; s.at = Date.now();
    d.stats[q.id] = s;
    this.updateSRS(q.id, correct);
    const day = dayKey();
    if (!d.studyDays.includes(day)) d.studyDays.push(day);
    d.dailyCounts[day] = (d.dailyCounts[day] || 0) + 1;
    this.save();
  },
  // Lightweight SM-2, same constants as the iOS app.
  updateSRS(id, correct) {
    const c = { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: Date.now(), ...(this.data.srs[id] || {}) };
    if (correct) {
      c.reps++;
      c.interval = c.reps === 1 ? 1 : c.reps === 2 ? 3 : Math.max(1, c.interval) * c.ease;
      c.ease = Math.min(2.8, c.ease + 0.08);
    } else {
      c.reps = 0; c.lapses++;
      c.interval = 0.02; // ~30 min, revisit soon
      c.ease = Math.max(1.3, c.ease - 0.2);
    }
    c.due = Date.now() + c.interval * DAY;
    this.data.srs[id] = c;
  },
  dueQuestions(t, limit = 30) {
    const now = Date.now(), srs = this.data.srs;
    let qs = Object.keys(srs).filter((id) => srs[id].due <= now).map((id) => Bank.byId.get(id)).filter((q) => q && Bank.contains(q, t))
      .sort((a, b) => srs[a.id].due - srs[b.id].due);
    if (qs.length < limit) {
      const fresh = shuffle(Bank.forTrack(t).filter((q) => !this.data.stats[q.id]));
      qs = qs.concat(fresh.slice(0, limit - qs.length));
    }
    return qs.slice(0, limit);
  },
  dueCount(t) {
    const now = Date.now(), srs = this.data.srs;
    return Object.keys(srs).filter((id) => { const q = Bank.byId.get(id); return srs[id].due <= now && q && Bank.contains(q, t); }).length;
  },
  isBookmarked(id) { return this.data.bookmarks.includes(id); },
  toggleBookmark(id) {
    const b = this.data.bookmarks, i = b.indexOf(id);
    if (i >= 0) b.splice(i, 1); else b.push(id);
    this.save();
  },
  bookmarked(t) { return Bank.lookup(this.data.bookmarks).filter((q) => Bank.contains(q, t)); },
  incorrect(t) { return Object.entries(this.data.stats).filter(([, s]) => s.seen > 0 && !s.last).map(([id]) => Bank.byId.get(id)).filter((q) => q && Bank.contains(q, t)); },
  saveMock(r) { this.data.mocks.unshift(r); if (this.data.mocks.length > 50) this.data.mocks.length = 50; this.save(); },
  mocks(t) { return this.data.mocks.filter((m) => m.track === t); },
  trackStats(t) {
    let seenQ = 0, seen = 0, correct = 0;
    for (const [id, s] of Object.entries(this.data.stats)) {
      const q = Bank.byId.get(id);
      if (!q || !Bank.contains(q, t)) continue;
      seenQ++; seen += s.seen; correct += s.correct;
    }
    return { seenQ, accuracy: seen ? correct / seen : 0 };
  },
  // 0...1 readiness estimate blending coverage, accuracy and recent mock scores.
  readiness(t) {
    const total = Math.max(1, Bank.forTrack(t).length), st = this.trackStats(t);
    const coverage = Math.min(1, st.seenQ / Math.min(total, 300));
    const recent = this.mocks(t).slice(0, 3).map((m) => m.percent / 100);
    const mockAvg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : st.accuracy;
    return clamp(coverage * 0.25 + st.accuracy * 0.35 + mockAvg * 0.4, 0, 1);
  },
  topicMastery(t) {
    return Bank.topics(t).map((topic) => {
      let seen = 0, correct = 0, n = 0;
      for (const q of Bank.inTopic(t, topic.key)) { const s = this.data.stats[q.id]; if (s) { seen += s.seen; correct += s.correct; n++; } }
      return { topic, mastery: seen ? correct / seen : 0, seen: n };
    });
  },
  get streak() {
    const days = new Set(this.data.studyDays);
    let d = startOfDay(Date.now()), n = 0;
    if (!days.has(dayKey(d))) { d = new Date(d.getTime() - DAY); if (!days.has(dayKey(d))) return 0; }
    while (days.has(dayKey(d))) { n++; d = new Date(d.getTime() - DAY); }
    return n;
  },
  get answeredToday() { return this.data.dailyCounts[dayKey()] || 0; },
  get countdown() {
    const e = this.data.profile.examDate;
    return e == null ? null : Math.max(0, Math.round((startOfDay(e) - startOfDay(Date.now())) / DAY));
  },
  weekly() {
    const out = [];
    for (let i = 6; i >= 0; i--) { const d = Date.now() - i * DAY; out.push({ d, n: this.data.dailyCounts[dayKey(d)] || 0 }); }
    return out;
  },
  reset() {
    const { onboarded, track, profile, diagnosticDone } = this.data;
    this.data = { ...defaultProgress(), onboarded, track, profile, diagnosticDone };
    this.save();
  },
  seedDemo() {
    const d = defaultProgress();
    d.onboarded = true; d.diagnosticDone = true; d.track = 'main';
    d.profile.examDate = Date.now() + 18 * DAY; d.profile.dailyGoal = 25;
    const qs = shuffle(Bank.all), n = 380;
    qs.slice(0, n).forEach((q, i) => {
      const ok = Math.random() < 0.62 + i / n * 0.3, seen = 1 + Math.floor(Math.random() * 3);
      d.stats[q.id] = { seen, correct: ok ? seen : seen - 1, last: ok, at: Date.now() };
      d.srs[q.id] = { ease: 2.0 + Math.random() * 0.7, interval: 1, reps: Math.floor(Math.random() * 5), lapses: 0, due: Date.now() + (Math.random() * 7 - 1) * DAY };
    });
    d.bookmarks.push(...qs.slice(0, 8).map((q) => q.id));
    for (let i = 0; i < 14; i++) { const k = dayKey(Date.now() - i * DAY); d.studyDays.push(k); d.dailyCounts[k] = 18 + Math.floor(Math.random() * 25); }
    d.dailyCounts[dayKey()] = 17;
    for (let i = 4; i >= 0; i--) {
      const correct = 64 + (4 - i) * 4;
      d.mocks.push({ date: Date.now() - (10 - (4 - i) * 2) * DAY, track: 'main', total: 100, correct, percent: correct, durationSec: 7200 + i * 120, topic: {} });
    }
    this.data = d;
  }
};

// MARK: - Microsoft Store purchases (Digital Goods API + Payment Request API)

const ENT_KEY = 'texesppr.entitlement.v1';
const Store = {
  service: null, available: false, loaded: false, details: [], owned: new Set(), error: null,
  async init() {
    if (DEMO) { this.owned = new Set(['demo']); this.loaded = true; return; }
    if (typeof window.getDigitalGoodsService === 'function') {
      try { this.service = await window.getDigitalGoodsService(BILLING); this.available = true; }
      catch { this.available = false; }
    }
    if (this.available) { await this.fetchProducts(); await this.refresh(); }
    this.loaded = true;
  },
  async fetchProducts() {
    try {
      const list = await this.service.getDetails(PRODUCT_ORDER);
      this.details = PRODUCT_ORDER.map((id) => list.find((d) => d.itemId === id)).filter(Boolean);
      this.error = null;
    } catch {
      this.error = "Couldn't load purchase options. Check your connection and try again.";
    }
  },
  async refresh() {
    try {
      const purchases = await this.service.listPurchases();
      this.owned = new Set(purchases.map((p) => p.itemId).filter((id) => PRODUCT_ORDER.includes(id)));
      lsSet(ENT_KEY, JSON.stringify({ ids: [...this.owned], at: Date.now() }));
    } catch {
      // Store unreachable: honour the last known entitlement for up to 7 days.
      try {
        const cached = JSON.parse(lsGet(ENT_KEY) || 'null');
        if (cached && Date.now() - cached.at < 7 * DAY) this.owned = new Set(cached.ids);
      } catch { /* ignore */ }
    }
  },
  async purchase(itemId) {
    this.error = null;
    try {
      const request = new PaymentRequest(
        [{ supportedMethods: BILLING, data: { sku: itemId } }],
        { total: { label: 'Total', amount: { currency: 'USD', value: '0' } } }
      );
      const response = await request.show();
      try { await response.complete('success'); } catch { /* not required by Store billing */ }
    } catch (e) {
      if (e && e.name === 'AbortError') return false;
      this.error = 'Purchase failed: ' + (e && e.message ? e.message : 'please try again.');
      return false;
    }
    await this.refresh();
    return this.isPro;
  },
  async restore() {
    this.error = null;
    if (!this.available) { this.error = 'Install the app from the Microsoft Store to restore purchases.'; return; }
    await this.refresh();
    if (!this.isPro) this.error = 'No previous purchases were found for this Microsoft account.';
  },
  get isPro() { return this.owned.size > 0; },
  get hasLifetime() { return this.owned.has(PRODUCTS.lifetime); },
  detail(id) { return this.details.find((d) => d.itemId === id); },
  money(d, divisor = 1) {
    if (!d || !d.price) return '';
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: d.price.currency }).format(Number(d.price.value) / divisor); }
    catch { return `${d.price.value} ${d.price.currency}`; }
  },
  // ISO 8601 period from the Store (e.g. "P1W") as text, or '' when the add-on has no free trial.
  trialText(d) {
    const m = d && /^P(\d+)([DWMY])$/.exec(d.freeTrialPeriod || '');
    if (!m) return '';
    const n = Number(m[1]), unit = { D: 'day', W: 'week', M: 'month', Y: 'year' }[m[2]];
    return `${n}-${unit}`;
  },
  planName(id) { return id === PRODUCTS.monthly ? 'Monthly' : id === PRODUCTS.yearly ? 'Yearly' : 'Lifetime'; },
  cadence(id) { return id === PRODUCTS.monthly ? 'month' : 'year'; },
  disclosure(id) {
    const d = this.detail(id), p = this.money(d), trial = this.trialText(d);
    if (id === PRODUCTS.lifetime) return `One-time payment of ${p}. No subscription.`;
    return `${trial ? `${trial} free trial, then ` : ''}${p} / ${this.cadence(id)}. Renews automatically until cancelled in your Microsoft account.`;
  }
};

// MARK: - Router & rendering

let route = 'home';
let routeArg = null;
let navStack = [];
const TABS = [
  ['home', 'Home', 'home'], ['practice', 'Practice', 'stack'], ['library', 'Library', 'library'], ['flashcards', 'Flashcards', 'cards'],
  ['review', 'Review', 'undo'], ['settings', 'Settings', 'gear']
];
const TAB_OF = { examinfo: 'practice', sources: 'practice', deck: 'flashcards', libsection: 'library', libtopic: 'library' };

function go(r, arg = null, push = true) {
  if (push && (route !== r || routeArg !== arg) && route !== 'quiz') navStack.push([route, routeArg]);
  route = r; routeArg = arg;
  render();
  window.scrollTo(0, 0);
}
function goTab(r) { navStack = []; go(r, null, false); }
function goBack() {
  const prev = navStack.pop();
  if (prev) { route = prev[0]; routeArg = prev[1]; } else { route = 'home'; routeArg = null; }
  render();
}

function render() {
  stopTimers();
  if (!P.data.onboarded) { $app.innerHTML = Onboarding.view(); return; }
  if (!Store.loaded) { $app.innerHTML = splash(); return; }
  if (!Store.isPro) { $app.innerHTML = Paywall.view(); return; }
  if (route === 'quiz' && Quiz.cur) { $app.innerHTML = Quiz.view(); if (Quiz.cur.mode === 'mock' && !Quiz.cur.finished) startMockTimer(); return; }
  if (route === 'quiz') route = 'home';
  if (route === 'deck' && Deck.cards.length) { $app.innerHTML = Deck.view(); return; }
  const activeTab = TAB_OF[route] || route;
  const views = { home: homeView, practice: practiceView, library: libraryView, libsection: libSectionView, libtopic: libTopicView, flashcards: flashcardsView, review: reviewView, settings: settingsView, examinfo: examInfoView, sources: sourcesView };
  const body = (views[route] || homeView)();
  $app.innerHTML = `
    <div class="shell">
      <nav class="sidebar" aria-label="Main">
        <div class="brand"><img src="icons/logo.png" alt=""><b>TExES PPR Prep</b></div>
        ${TABS.map(([r, l, i]) => `<button class="nav-item ${activeTab === r ? 'active' : ''}" data-act="tab" data-arg="${r}">${icon(i)}<span>${l}</span></button>`).join('')}
        <div class="grow"></div>
        <button class="nav-item" data-act="nav" data-arg="examinfo">${icon('info')}<span>Exam info</span></button>
      </nav>
      <main class="main">${body}</main>
      <nav class="tabbar" aria-label="Main">
        ${TABS.map(([r, l, i]) => `<button class="${activeTab === r ? 'active' : ''}" data-act="tab" data-arg="${r}">${icon(i)}<span>${l}</span></button>`).join('')}
      </nav>
    </div>`;
}

const pageHead = (title, back = false, right = '') => `<div class="page-head">${back ? `<button class="back" data-act="back" aria-label="Back">${icon('back')}</button>` : ''}<h1 class="grow">${esc(title)}</h1>${right}</div>`;
const statTile = (v, l, color) => `<div class="card stat"><div class="v" style="color:${color}">${esc(v)}</div><div class="l">${esc(l)}</div></div>`;
const tile = (ic, color, title, sub, act, arg = '') => `<button class="tile" data-act="${act}" data-arg="${esc(arg)}"><span class="ib" style="background:${color}">${icon(ic)}</span><h3>${esc(title)}</h3><span class="small muted">${esc(sub)}</span></button>`;
const listRow = (ic, color, title, detail, act, arg = '') => `<button class="list-row" data-act="${act}" data-arg="${esc(arg)}">${icon(ic, 'ic', `color:${color}`)}<span class="grow">${esc(title)}</span><span class="small muted">${esc(detail)}</span>${icon('chevron', 'chev')}</button>`;
const linkRow = (ic, title, href) => `<a class="list-row" href="${href}" target="_blank" rel="noopener">${icon(ic, 'ic', 'color:var(--accent)')}<span class="grow">${esc(title)}</span>${icon('chevron', 'chev')}</a>`;
const bar = (v, color) => `<div class="bar"><i style="width:${Math.max(2, Math.round(clamp(v, 0, 1) * 100))}%;background:${color}"></i></div>`;
function ring(value, label, caption, color, size = 160) {
  const r = 52, c = 2 * Math.PI * r, v = clamp(value, 0.001, 1);
  return `<div class="ring" style="width:${size}px;height:${size}px;margin:0" role="img" aria-label="${esc(label)} ${esc(caption)}">
    <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--track)" stroke-width="12"/>
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c * v} ${c}"/></svg>
    <div class="lbl"><b style="font-size:${size < 130 ? 24 : 32}px">${esc(label)}</b><span>${esc(caption)}</span></div></div>`;
}
const splash = () => `<div class="splash"><img class="logo" src="icons/logo.png" alt=""><h2>TExES PPR Exam Prep 2026</h2><div class="muted">PPR EC-12 Practice Test</div><div class="spinner"></div></div>`;
const trackSwitch = () => Object.keys(TRACKS).length < 2 ? '' : `<div class="seg" role="tablist" style="min-width:250px">${Object.entries(TRACKS).map(([k, t]) => `<button class="${P.track === k ? 'on' : ''}" data-act="set-track" data-arg="${k}" role="tab" aria-selected="${P.track === k}">${t.short}</button>`).join('')}</div>`;

function modal(title, message, buttons) {
  $modal.innerHTML = `<div class="modal-back" role="dialog" aria-modal="true"><div class="modal"><h3>${esc(title)}</h3><p class="muted small">${esc(message)}</p>
    <div class="row">${buttons.map((b, i) => `<button class="btn ${b.cls || 'secondary'}" data-modal="${i}">${esc(b.label)}</button>`).join('')}</div></div></div>`;
  $modal.querySelectorAll('[data-modal]').forEach((el) => el.addEventListener('click', () => {
    const b = buttons[Number(el.dataset.modal)];
    $modal.innerHTML = '';
    if (b.run) b.run();
  }));
  const first = $modal.querySelector('[data-modal]');
  if (first) first.focus();
}

// MARK: - Onboarding

const Onboarding = {
  step: 0, track: 'main', goal: '', reason: '', experience: '', pains: new Set(),
  hasDate: true, examDate: Date.now() + 14 * DAY, dailyGoal: 20,
  diag: [], diagIndex: 0, diagCorrect: 0, diagChosen: null,
  total: 8,
  goals: [['bolt', 'Pass on the first try'], ['trend', 'Get certified and start teaching'], ['refresh', 'Refresh before my test date']],
  reasons: [['🎓', 'Finishing my educator preparation program'], ['🔀', 'Alternative certification route'], ['🏫', 'Already teaching on a probationary certificate'], ['📅', 'My exam is scheduled'], ['🔁', 'Retaking the PPR']],
  experiences: ['New to teaching', 'Student teaching or clinical experience', 'Some classroom experience', 'Experienced teacher from another state'],
  painList: ['Long classroom scenarios', 'Choosing the BEST of several good answers', 'Legal and ethical rules', 'Assessment and data questions', 'Learning theories and terms', 'Running out of time'],
  canAdvance() { return { 1: !!this.goal, 2: !!this.reason, 3: !!this.experience, 4: this.pains.size > 0, 6: this.diag.length > 0 && this.diagIndex >= this.diag.length }[this.step] ?? true; },
  title: (t, s) => `<div class="stack-sm"><h1>${esc(t)}</h1><div class="muted">${esc(s)}</div></div>`,
  select(title, sub, lead, on, act, arg, multi = false) {
    const tick = multi ? (on ? 'squareCheck' : 'square') : (on ? 'checkFill' : 'circle');
    return `<button class="select ${on ? 'on' : ''}" data-act="${act}" data-arg="${esc(arg)}" aria-pressed="${on}">${lead}<div class="grow"><h3>${esc(title)}</h3>${sub ? `<div class="tiny muted">${esc(sub)}</div>` : ''}</div>${icon(tick, 'tick')}</button>`;
  },
  view() {
    const s = this.step;
    let body;
    if (s === 0) {
      body = `<div class="stack center" style="padding-top:24px">
        <img class="logo" src="icons/logo.png" alt="">
        <h1 style="font-size:32px">TExES PPR Exam Prep 2026</h1>
        <div class="muted">Everything you need to pass the TExES Pedagogy and Professional Responsibilities EC-12 (160) exam: 2,000+ realistic original questions, timed mock exams, study guides, and progress that shows exactly what to study next. Works 100% offline.</div>
        <div class="tiny muted" style="margin-top:12px">${esc(DISCLAIMER)}</div></div>`;
    } else if (s === 1) {
      body = this.title("What's your goal?", "We'll tailor your experience.") +
        this.goals.map(([i, t]) => this.select(t, '', icon(i, 'ic'), this.goal === t, 'ob-goal', t)).join('');
    } else if (s === 2) {
      body = this.title('Where are you in your journey?', 'This helps us tailor your plan.') +
        this.reasons.map(([e, t]) => this.select(t, '', `<span style="font-size:22px">${e}</span>`, this.reason === t, 'ob-reason', t)).join('');
    } else if (s === 3) {
      body = this.title('What is your background?', "We'll set your starting difficulty.") +
        this.experiences.map((t) => this.select(t, '', '', this.experience === t, 'ob-exp', t)).join('');
    } else if (s === 4) {
      body = this.title("What's holding you back?", 'Select all that apply.') +
        this.painList.map((t) => this.select(t, '', '', this.pains.has(t), 'ob-pain', t, true)).join('');
    } else if (s === 5) {
      body = this.title("Here's how we'll fix that", 'Built for how teachers actually pass the PPR.') +
        [['stack', 'All 4 domains, 13 competencies', 'Instruction design, classroom environment, responsive instruction and professional roles.'], ['closedBook', 'Clear explanations', 'Every answer explains why the best choice is best.'], ['timer', 'Timed mock exams', '80 questions in 100 minutes, weighted like the real PPR.'], ['library', 'Study guide', '75 lessons, a 302-term glossary and public sources.']]
          .map(([i, t, d]) => `<div class="feature" style="align-items:flex-start"><span class="tile" style="padding:0;border:0;box-shadow:none;background:none"><span class="ib" style="background:var(--blue)">${icon(i)}</span></span><div><b>${esc(t)}</b><div class="small muted">${esc(d)}</div></div></div>`).join('');
    } else if (s === 6) {
      body = this.diagView();
    } else {
      const days = Math.max(0, Math.round((startOfDay(this.examDate) - startOfDay(Date.now())) / DAY));
      body = this.title('Your personalised plan', 'Adjust anytime in Settings.') + `
        <div class="list">
          <label class="field"><span>I have a test date</span><input class="toggle" type="checkbox" data-input="ob.hasDate" ${this.hasDate ? 'checked' : ''}></label>
          ${this.hasDate ? `<label class="field"><span>Exam date</span><input type="date" data-input="ob.date" min="${toDateInput(Date.now())}" value="${toDateInput(this.examDate)}"></label>` : ''}
          <label class="field"><span>Daily goal</span><select data-input="ob.goal">${[10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((g) => `<option value="${g}" ${this.dailyGoal === g ? 'selected' : ''}>${g} questions</option>`).join('')}</select></label>
        </div>
        <div class="card stack-sm"><h3>Plan snapshot</h3>
          <div class="small">• Focus: ${esc(TRACKS[this.track].title)}</div>
          <div class="small">• Daily target: ${this.dailyGoal} questions</div>
          ${this.hasDate ? `<div class="small">• Countdown: ${days} days</div>` : ''}
          <div class="small">• Weekly: 2 timed mocks (${TRACKS[this.track].count} Q · ${TRACKS[this.track].minutes} min)</div></div>`;
    }
    const steps = s > 0 ? `<div class="steps">${Array.from({ length: this.total - 1 }, (_, i) => `<i class="${i < s ? 'on' : ''}"></i>`).join('')}</div>` : '';
    let footer;
    if (s === 0) footer = `<button class="btn" data-act="ob-next">Get Started</button>`;
    else if (s === 5) footer = `<button class="btn secondary auto" style="min-width:110px" data-act="ob-back">Back</button><button class="btn" data-act="ob-diag-start">Try a quick diagnostic</button>`;
    else if (s === 6) footer = this.diagIndex >= this.diag.length ? `<button class="btn" data-act="ob-next">Build my plan</button>` : '';
    else if (s === this.total - 1) footer = `<button class="btn secondary auto" style="min-width:110px" data-act="ob-back">Back</button><button class="btn" data-act="ob-finish">Continue</button>`;
    else footer = `<button class="btn secondary auto" style="min-width:110px" data-act="ob-back">Back</button><button class="btn" data-act="ob-next" ${this.canAdvance() ? '' : 'disabled'}>Continue</button>`;
    return `<div class="content narrow stack" style="min-height:100vh;padding-bottom:24px">
      ${steps}<div class="stack" style="flex:1">${body}</div>
      ${footer ? `<div class="row">${footer}</div>` : ''}</div>`;
  },
  diagView() {
    if (this.diagIndex >= this.diag.length) {
      return `<div class="stack center" style="padding-top:40px">${icon('seal', '', 'width:52px;height:52px;color:var(--green);margin:0 auto')}
        <h2>Diagnostic complete</h2><div class="muted">You got ${this.diagCorrect} of ${this.diag.length} right on ${esc(TRACKS[this.track].short)}. A few minutes a day moves you toward the ${PASS}% pass mark.</div></div>`;
    }
    const q = this.diag[this.diagIndex], answered = this.diagChosen != null;
    return `<div class="tiny" style="font-weight:700;color:var(--accent)">Diagnostic ${this.diagIndex + 1} of ${this.diag.length}</div>
      <div class="stem">${esc(q.stem)}</div>
      ${q.options.map((o, i) => optionHTML(o, i, answered ? (i === q.answerIndex ? 'correct' : i === this.diagChosen ? 'wrong' : 'idle') : 'idle', 'ob-diag-pick', answered)).join('')}
      ${answered ? `<div class="small muted">${esc(q.rationale)}</div><button class="btn" data-act="ob-diag-next">${this.diagIndex + 1 < this.diag.length ? 'Next question' : 'See results'}</button>` : ''}`;
  },
  finish() {
    const d = P.data;
    d.track = this.track;
    d.profile.goal = this.goal; d.profile.reason = this.reason; d.profile.experience = this.experience;
    d.profile.dailyGoal = this.dailyGoal; d.profile.goalPercent = 70;
    d.profile.examDate = this.hasDate ? this.examDate : null;
    d.diagnosticDone = this.diag.length > 0;
    d.onboarded = true;
    P.save();
    render();
  }
};

// MARK: - Paywall

const Paywall = {
  selected: PRODUCTS.yearly, busy: false,
  view() {
    const features = [
      ['list', '2,000+ original questions with clear explanations', 'All 4 PPR domains and 13 competencies'],
      ['timer', 'Timed mock exams', '80 questions · 100 minutes'],
      ['library', 'Study guide', '75 lessons, 302-term glossary and public sources'],
      ['brain', 'Per-topic mastery, spaced repetition & flashcards', 'Drill the right areas'],
      ['wifiOff', '100% offline', 'No ads, no tracking']
    ];
    let plans, cta;
    if (!Store.available) {
      plans = `<div class="card flat small muted center">Purchases are handled by the Microsoft Store. Install TExES PPR Exam Prep 2026 from the Microsoft Store on Windows to unlock monthly, yearly or lifetime access.</div>`;
      cta = `<a class="btn navy" href="${LINKS.store}" target="_blank" rel="noopener">Get it from Microsoft Store</a>`;
    } else if (!Store.details.length) {
      plans = Store.error ? `<div class="error">${esc(Store.error)}</div><button class="btn secondary" data-act="pw-reload">Refresh prices</button>` : `<div class="center"><div class="spinner" style="margin:12px auto"></div><div class="small muted">Loading options…</div></div>`;
      cta = '';
    } else {
      if (!Store.detail(this.selected)) this.selected = Store.details[0].itemId;
      plans = Store.details.map((d) => {
        const id = d.itemId, on = id === this.selected, trial = Store.trialText(d);
        const price = id === PRODUCTS.lifetime ? `${Store.money(d)} · one-time` : `${Store.money(d)} / ${Store.cadence(id)}`;
        const badge = id === PRODUCTS.yearly ? (trial ? `<span class="badge" style="background:var(--accent)">${esc(trial.toUpperCase())} FREE TRIAL</span>` : '<span class="badge" style="background:var(--green)">BEST VALUE</span>') : '';
        return `<button class="plan ${on ? 'on' : ''}" data-act="pw-pick" data-arg="${esc(id)}" aria-pressed="${on}">
          <div class="row">${icon(on ? 'checkFill' : 'circle', '', `width:24px;height:24px;flex:none;color:${on ? 'var(--blue)' : 'var(--muted)'}`)}
          <div class="grow"><div class="row" style="gap:8px"><h3>${Store.planName(id)}</h3>${badge}</div><div class="small muted">${esc(price)}</div>
          ${id === PRODUCTS.yearly ? `<div class="tiny muted">≈ ${esc(Store.money(d, 12))} / month</div>` : ''}</div></div></button>`;
      }).join('');
      const d = Store.detail(this.selected), trial = Store.trialText(d);
      const label = this.selected === PRODUCTS.lifetime ? 'Unlock Lifetime Access' : (this.selected === PRODUCTS.yearly && trial ? `Start ${trial} free trial` : 'Subscribe');
      cta = `<button class="btn navy" data-act="pw-buy" ${this.busy ? 'disabled' : ''}>${this.busy ? '<span class="spinner" style="width:18px;height:18px;border-width:2px"></span>' : esc(label)}</button>
        <div class="tiny muted center">${esc(Store.disclosure(this.selected))}</div>
        ${Store.error ? `<div class="error">${esc(Store.error)}</div>` : ''}`;
    }
    return `<div class="content narrow stack" style="padding-top:32px">
      <img class="logo" src="icons/logo.png" alt="" style="width:72px;height:72px;border-radius:16px">
      <h1 class="center">Unlock full access</h1>
      <div class="muted center">Everything you need to pass the TExES PPR. A subscription or one-time purchase is required.</div>
      <div class="card stack-sm">${features.map(([i, t, s]) => `<div class="feature" style="align-items:flex-start">${icon('checkFill', '', 'color:var(--green);margin-top:2px')}<div><b class="small">${esc(t)}</b><div class="tiny muted">${esc(s)}</div></div></div>`).join('')}</div>
      ${plans}${cta}
      ${Store.available ? `<button class="btn link" style="align-self:center" data-act="pw-restore">Restore Purchases</button>` : ''}
      <div class="tiny muted center">Payment is charged to your Microsoft account at confirmation. Subscriptions renew automatically until cancelled; manage or cancel anytime at account.microsoft.com/services.</div>
      <div class="center small"><a href="${LINKS.terms}" target="_blank" rel="noopener">Terms of Use</a> · <a href="${LINKS.privacy}" target="_blank" rel="noopener">Privacy Policy</a></div>
      <div class="tiny muted center">${esc(DISCLAIMER)}</div>
    </div>`;
  }
};

// MARK: - Home

function homeView() {
  const t = P.track, T = TRACKS[t], r = P.readiness(t), days = P.countdown, st = P.trackStats(t);
  const goal = P.data.profile.dailyGoal, today = P.answeredToday;
  const week = P.weekly(), max = Math.max(1, ...week.map((w) => w.n));
  const hasActivity = week.some((w) => w.n > 0);
  const mastery = P.topicMastery(t).sort((a, b) => b.mastery - a.mastery);
  return `<div class="content stack">${pageHead('Ready to pass', false, trackSwitch())}
    <div class="card row" style="gap:20px;padding:20px">
      ${ring(r, `${Math.round(r * 100)}%`, 'ready', 'var(--accent)', 116)}
      <div class="grow stack-sm"><h3>${esc(T.title)}</h3>
        ${days != null ? `<div class="small" style="color:${days <= 3 ? 'var(--red)' : 'var(--muted)'}">${icon('calendar', '', 'width:16px;height:16px;vertical-align:-3px')} ${days} day${days === 1 ? '' : 's'} to exam</div>`
          : `<button class="btn link small" style="padding:0;justify-content:flex-start" data-act="tab" data-arg="settings">${icon('calendar', '', 'width:16px;height:16px')} Set an exam date in Settings</button>`}
        <div class="tiny muted">Aim for ${PASS}% to pass. Keep practising daily to raise your readiness.</div></div></div>
    <div class="grid-3">
      ${statTile(String(P.streak), 'Day streak', 'var(--accent)')}
      ${statTile(`${today}/${goal}`, "Today's goal", today >= goal ? 'var(--green)' : 'var(--blue)')}
      ${statTile(String(st.seenQ), 'Seen', 'var(--blue)')}
    </div>
    ${hasActivity ? `<div class="card stack-sm"><h3 class="small">This week</h3><div class="week">${week.map((w) => `<div class="col"><b>${w.n || ''}</b><i style="height:${Math.round(w.n / max * 90)}%"></i><span>${new Date(w.d).toLocaleDateString(undefined, { weekday: 'narrow' })}</span></div>`).join('')}</div></div>` : ''}
    <div class="tiles">
      ${tile('checklist', 'var(--blue)', 'Mock Exam', `${T.count} Q · ${T.minutes} min`, 'start-mock')}
      ${tile('bolt', 'var(--accent)', 'Quick Practice', '10 mixed questions', 'start-quick', '10')}
      ${tile('brain', 'var(--green)', 'Spaced Review', `${P.dueCount(t)} due`, 'start-srs')}
      ${tile('list', 'var(--blue)', 'By Skill', 'Target weak areas', 'tab', 'practice')}
      ${tile('library', 'var(--accent)', 'Study Library', `${Bank.library.sections.reduce((n, x) => n + x.topics.length, 0)} topics`, 'tab', 'library')}
      ${tile('info', 'var(--muted)', 'Exam Info', 'Format, eligibility & weighting', 'nav', 'examinfo')}
    </div>
    <div class="card stack"><h3>${icon('chart', '', 'width:18px;height:18px;color:var(--accent);vertical-align:-3px')} Topic mastery</h3>
      ${mastery.map((m) => `<div class="stack-sm" style="gap:4px"><div class="row small"><span class="grow">${esc(m.topic.name)}</span><span class="muted" style="font-variant-numeric:tabular-nums">${m.seen ? Math.round(m.mastery * 100) + '%' : '—'}</span></div>${bar(m.mastery, pctColor(m.mastery))}</div>`).join('')}
    </div></div>`;
}

// MARK: - Practice hub

function practiceView() {
  const t = P.track, T = TRACKS[t], mastery = P.topicMastery(t);
  return `<div class="content stack">${pageHead('Practice', false, trackSwitch())}
    <div class="card stack-sm"><h3>${icon('timer', '', 'width:18px;height:18px;color:var(--accent);vertical-align:-3px')} Timed mock exam</h3>
      <div class="small muted">${T.count} questions · ${T.minutes} minutes · ${PASS}% to pass. Mirrors the real ${esc(T.title)} test.</div>
      <button class="btn navy" data-act="start-mock">Start full mock</button></div>
    <div class="card stack-sm"><h3>${icon('bolt', '', 'width:18px;height:18px;color:var(--accent);vertical-align:-3px')} Quick practice</h3>
      <div class="small muted">Untimed, with instant explanations after each answer.</div>
      <div class="grid-3">${[10, 20, 30].map((n) => `<button class="btn secondary" data-act="start-quick" data-arg="${n}">${n} Q</button>`).join('')}</div></div>
    <div class="list-head">Practice by skill area</div>
    <div class="list">${mastery.map((m) => `<button class="list-row" data-act="start-topic" data-arg="${esc(m.topic.key)}">
      <div class="grow"><div style="font-weight:600">${esc(m.topic.name)}</div><div class="tiny muted">${Bank.inTopic(t, m.topic.key).length} questions · ${m.topic.weight}% of mock</div></div>
      ${m.seen ? `<b class="small" style="color:${pctColor(m.mastery)}">${Math.round(m.mastery * 100)}%</b>` : ''}${icon('chevron', 'chev')}</button>`).join('')}</div>
    <div class="list" style="margin-top:14px">
      ${listRow('info', 'var(--blue)', 'Exam information', '', 'nav', 'examinfo')}
    </div></div>`;
}

// MARK: - Quiz engine (mock, practice, review, spaced repetition)

let timerHandle = null;
function stopTimers() { if (timerHandle) { clearInterval(timerHandle); timerHandle = null; } }
function startMockTimer() {
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = setInterval(() => {
    const c = Quiz.cur;
    if (!c || c.finished) { clearInterval(timerHandle); timerHandle = null; return; }
    c.remaining = Math.max(0, Math.round((c.deadline - Date.now()) / 1000));
    const el = document.getElementById('timer');
    if (el) { el.querySelector('span').textContent = mmss(c.remaining); el.classList.toggle('low', c.remaining < 60); }
    if (c.remaining <= 0) { c.timedOut = true; Quiz.finish(); render(); }
  }, 1000);
}

function optionHTML(text, i, state, act, disabled = false) {
  const letter = 'ABCDE'[i] || '';
  const mark = state === 'correct' ? icon('checkFill') : state === 'wrong' ? icon('xFill') : '';
  return `<button class="option ${state}" data-act="${act}" data-arg="${i}" ${disabled ? 'disabled' : ''} aria-label="Option ${letter}: ${esc(text)}" aria-pressed="${state === 'selected'}">
    <span class="ltr">${letter}</span><span class="txt">${esc(text)}</span>${mark}</button>`;
}

const MODE_TITLE = { mock: 'Mock Exam', practice: 'Practice', review: 'Review', srs: 'Spaced Repetition' };
const Quiz = {
  cur: null,
  start(questions, mode, track = P.track) {
    if (!questions.length) { modal('Nothing to practise', 'There are no questions in this set yet.', [{ label: 'OK', cls: '' }]); return; }
    const minutes = TRACKS[track].minutes;
    this.cur = {
      questions, mode, track, index: 0, answers: {}, revealed: new Set(), flagged: new Set(),
      finished: false, timedOut: false, startedAt: Date.now(),
      deadline: Date.now() + minutes * 60000, remaining: minutes * 60, result: null, showReview: false
    };
    go('quiz');
  },
  get q() { return this.cur.questions[this.cur.index]; },
  get feedback() { return this.cur.mode !== 'mock'; },
  // "Select all that apply" questions carry answerIndices; their answer is a sorted array of picks.
  isMulti(q) { return Array.isArray(q.answerIndices); },
  isCorrect(q, a) {
    if (a == null) return false;
    if (!this.isMulti(q)) return a === q.answerIndex;
    return a.length === q.answerIndices.length && a.every((x, k) => x === q.answerIndices[k]);
  },
  isAnswer(q, i) { return this.isMulti(q) ? q.answerIndices.includes(i) : i === q.answerIndex; },
  hasAnswer(q) { const a = this.cur.answers[q.id]; return Array.isArray(a) ? a.length > 0 : a != null; },
  correctCount() { return this.cur.questions.reduce((n, q) => n + (this.isCorrect(q, this.cur.answers[q.id]) ? 1 : 0), 0); },
  choose(i) {
    const c = this.cur, q = this.q;
    if (c.finished || (this.feedback && c.revealed.has(q.id))) return; // lock after reveal
    if (this.isMulti(q)) {
      const cur = new Set(c.answers[q.id] || []);
      cur.has(i) ? cur.delete(i) : cur.add(i);
      c.answers[q.id] = [...cur].sort((a, b) => a - b);
      if (!c.answers[q.id].length) delete c.answers[q.id];
      return;
    }
    c.answers[q.id] = i;
    if (this.feedback) { c.revealed.add(q.id); P.recordAnswer(q, i === q.answerIndex); }
  },
  check() {
    const c = this.cur, q = this.q;
    if (!this.feedback || c.revealed.has(q.id) || !this.hasAnswer(q)) return;
    c.revealed.add(q.id); P.recordAnswer(q, this.isCorrect(q, c.answers[q.id]));
  },
  next() { const c = this.cur; if (c.index < c.questions.length - 1) c.index++; },
  prev() { if (this.cur.index > 0) this.cur.index--; },
  finish() {
    const c = this.cur;
    if (c.finished) return;
    c.finished = true;
    if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
    // mock mode records answers at the end
    if (!this.feedback) for (const q of c.questions) { const a = c.answers[q.id]; if (a != null) P.recordAnswer(q, this.isCorrect(q, a)); }
    const topic = {};
    for (const q of c.questions) {
      const s = topic[q.topicKey] || (topic[q.topicKey] = { correct: 0, total: 0 });
      s.total++; if (this.isCorrect(q, c.answers[q.id])) s.correct++;
    }
    const total = c.questions.length, correct = this.correctCount();
    c.result = { date: Date.now(), track: c.track, total, correct, percent: total ? Math.round(correct / total * 100) : 0, durationSec: Math.round((Date.now() - c.startedAt) / 1000), topic };
    if (c.mode === 'mock') P.saveMock(c.result);
  },
  optionState(i) {
    const c = this.cur, q = this.q, a = c.answers[q.id];
    const picked = Array.isArray(a) ? a.includes(i) : a === i;
    if (c.revealed.has(q.id)) { if (this.isAnswer(q, i)) return 'correct'; if (picked) return 'wrong'; return 'idle'; }
    return picked ? 'selected' : 'idle';
  },
  view() {
    const c = this.cur;
    if (c.finished) return c.showReview ? this.answerReview() : this.resultsView();
    const q = this.q, last = c.index === c.questions.length - 1, revealed = c.revealed.has(q.id);
    const right = (c.mode === 'mock' ? `<span id="timer" class="timer ${c.remaining < 60 ? 'low' : ''}" aria-label="Time remaining">${icon('timer')}<span>${mmss(c.remaining)}</span></span>` : '') +
      `<button class="icon-btn" data-act="q-bookmark" style="color:var(--amber)" aria-label="${P.isBookmarked(q.id) ? 'Remove bookmark' : 'Add bookmark'}">${icon(P.isBookmarked(q.id) ? 'bookmarkFill' : 'bookmark')}</button>`;
    let rationale = '';
    if (revealed) {
      const ok = this.isCorrect(q, c.answers[q.id]), col = ok ? 'var(--green)' : 'var(--red)';
      rationale = `<div class="card stack-sm" style="background:color-mix(in srgb, ${col} 8%, var(--card));border-color:color-mix(in srgb, ${col} 35%, var(--line))">
        <div class="feature" style="color:${col};font-weight:700">${icon(ok ? 'checkFill' : 'xFill', '', `color:${col}`)}<span>${ok ? 'Correct' : 'Not quite'}</span></div>
        <div class="small">${esc(q.rationale)}</div><div class="source">${esc(q.source)}</div></div>`;
    }
    const multi = this.isMulti(q), needsCheck = multi && this.feedback && !revealed;
    const nextDisabled = this.feedback && (!this.hasAnswer(q) || needsCheck);
    const footer = `${c.mode === 'mock' ? `<button class="flag-btn" data-act="q-flag" aria-label="Flag for review">${icon(c.flagged.has(c.index) ? 'flagFill' : 'flag')}</button>` : ''}
      <button class="btn secondary auto" style="min-width:110px" data-act="q-prev" ${c.index === 0 ? 'disabled' : ''}>Back</button>
      <div class="grow"></div>
      ${needsCheck ? `<button class="btn navy auto" style="min-width:150px" data-act="q-check" ${this.hasAnswer(q) ? '' : 'disabled'}>Check answer</button>` : last ? `<button class="btn green auto" style="min-width:150px" data-act="q-submit">${c.mode === 'mock' ? 'Submit' : 'Finish'}</button>`
        : `<button class="btn navy auto" style="min-width:150px" data-act="q-next" ${nextDisabled ? 'disabled' : ''}>Next</button>`}`;
    const grid = c.mode === 'mock' ? `<details class="small"><summary class="muted">Question map (${Object.keys(c.answers).length}/${c.questions.length} answered)</summary>
      <div class="qgrid">${c.questions.map((x, i) => `<button class="${this.hasAnswer(x) ? 'ans' : ''} ${i === c.index ? 'cur' : ''} ${c.flagged.has(i) ? 'flg' : ''}" data-act="q-go" data-arg="${i}">${i + 1}</button>`).join('')}</div></details>` : '';
    return `<div style="min-height:100vh;display:flex;flex-direction:column">
      <div class="quiz-top"><div class="inner stack-sm">
        <div class="row"><button class="icon-btn" data-act="q-quit" aria-label="Close quiz">${icon('close')}</button>
        <div class="grow"><b>${MODE_TITLE[c.mode]}</b> <span class="muted small">· Question ${c.index + 1} of ${c.questions.length}</span></div>${right}</div>
        <div class="progress-thin"><i style="width:${(c.index + 1) / c.questions.length * 100}%;background:var(--accent)"></i></div></div></div>
      <div class="content wide" style="flex:1;padding-bottom:24px;width:100%">
        <div class="quiz-split" style="max-width:760px;margin:0 auto">
          <div class="stack">
            <div class="row"><span class="pill">${esc(q.topic)}</span><div class="grow"></div><span class="tiny muted" style="font-weight:600">${esc(q.difficulty[0].toUpperCase() + q.difficulty.slice(1))}</span></div>
            <div class="stem" style="white-space:pre-line">${esc(q.stem)}</div>
            ${multi ? `<div class="tiny" style="font-weight:700;color:var(--accent)">${icon('checklist', '', 'width:16px;height:16px;vertical-align:-3px')} Select all that apply</div>` : ''}
            ${q.options.map((o, i) => optionHTML(o, i, this.optionState(i), 'q-pick', this.feedback && revealed)).join('')}
            ${rationale}
            <div class="tiny muted">Keyboard: <span class="kbd">A</span>–<span class="kbd">${'ABCDE'[q.options.length - 1]}</span> or <span class="kbd">1</span>–<span class="kbd">${q.options.length}</span> to answer, <span class="kbd">Enter</span> for next, <span class="kbd">←</span> back.</div>
            ${grid}
          </div></div></div>
      <div class="quiz-bottom"><div class="inner">${footer}</div></div></div>`;
  },
  resultsView() {
    const r = this.cur.result, passed = r.percent >= PASS;
    const weak = Object.entries(r.topic).filter(([, s]) => s.total > 0 && s.correct / s.total < 0.7)
      .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total).slice(0, 3);
    const isMock = this.cur.mode === 'mock';
    return `<div class="content stack" style="max-width:680px">${pageHead('Results')}
      <div class="stack center" style="align-items:center">${ring(r.percent / 100, `${r.percent}%`, `${r.correct}/${r.total}`, passed ? 'var(--green)' : 'var(--red)', 160)}
        <h2 style="color:${passed ? 'var(--green)' : 'var(--red)'}">${passed ? (isMock ? 'Pass 🎉' : 'Great session') : 'Keep practising'}</h2>
        ${this.cur.timedOut ? '<div class="small muted">Time is up. Your mock was submitted automatically.</div>' : ''}
        <div class="muted small">${passed ? `You scored above the ${PASS}% pass mark. Consistent mocks build real exam confidence.` : `You need ${PASS}% to pass. Focus on your weak areas below and try again.`}</div></div>
      <div class="grid-3">${statTile(String(r.correct), 'Correct', 'var(--green)')}${statTile(String(r.total - r.correct), 'Incorrect', 'var(--red)')}${statTile(mmss(r.durationSec), 'Time', 'var(--blue)')}</div>
      ${weak.length ? `<div class="stack-sm"><h3>${icon('target', '', 'width:18px;height:18px;color:var(--accent);vertical-align:-3px')} Weak-area drills</h3>
        <div class="tiny muted">Turn mistakes into marks: practise your lowest-scoring topics.</div>
        <div class="list">${weak.map(([k, s]) => `<button class="list-row" data-act="drill" data-arg="${esc(k)}"><div class="grow"><div style="font-weight:600">${esc(Bank.topicName(k))}</div><div class="tiny muted">${s.correct}/${s.total} correct</div></div>${icon('play', 'ic', 'color:var(--accent)')}</button>`).join('')}</div></div>` : ''}
      <div class="card stack"><h3>Topic breakdown</h3>
        ${Object.entries(r.topic).sort((a, b) => a[0].localeCompare(b[0])).map(([k, s]) => `<div class="stack-sm" style="gap:4px"><div class="row small"><span class="grow">${esc(Bank.topicName(k))}</span><span class="muted">${s.correct}/${s.total}</span></div>${bar(s.correct / s.total, pctColor(s.correct / s.total))}</div>`).join('')}</div>
      <button class="btn secondary" data-act="q-review-all">${icon('list', '', 'width:18px;height:18px')} Review all answers</button>
      <button class="btn navy" data-act="q-done">Done</button></div>`;
  },
  answerReview() {
    const c = this.cur;
    return `<div class="content stack" style="max-width:760px">${pageHead('Answer review', true)}
      ${c.questions.map((q, n) => {
        const chosen = c.answers[q.id], picked = (i) => Array.isArray(chosen) ? chosen.includes(i) : i === chosen;
        return `<div class="card stack-sm"><div class="small" style="font-weight:600;white-space:pre-line">Q${n + 1}. ${esc(q.stem)}</div>
          ${q.options.map((o, i) => { const ok = this.isAnswer(q, i), st = ok ? 'checkFill' : picked(i) ? 'xFill' : 'circle', col = ok ? 'var(--green)' : picked(i) ? 'var(--red)' : 'var(--muted)';
            return `<div class="feature small" style="align-items:flex-start">${icon(st, '', `color:${col};margin-top:2px`)}<span style="color:${ok ? 'var(--text)' : 'var(--muted)'}">${esc(o)}</span></div>`; }).join('')}
          ${chosen == null ? '<div class="tiny" style="color:var(--red)">Not answered</div>' : ''}
          <div class="tiny muted">${esc(q.rationale)}</div></div>`;
      }).join('')}</div>`;
  }
};

// MARK: - Flashcards

const Deck = {
  cards: [], index: 0, flipped: false, known: 0,
  start(cards) { if (!cards.length) return; this.cards = cards; this.index = 0; this.flipped = false; this.known = 0; go('deck'); },
  mark(knew) {
    const q = this.cards[this.index];
    if (q) { P.recordAnswer(q, knew); if (knew) this.known++; }
    this.flipped = false; this.index++;
  },
  view() {
    const done = this.index >= this.cards.length, q = this.cards[this.index];
    const body = done
      ? `<div class="card flipcard">${icon('checkFill', '', 'width:60px;height:60px;color:var(--green)')}<h2>Deck complete</h2>
          <div class="muted">You knew ${this.known} of ${this.cards.length} cards. Reviews are scheduled for the rest.</div>
          <button class="btn navy auto" style="min-width:200px" data-act="deck-close">Done</button></div>`
      : `<button class="card flipcard" data-act="deck-flip" aria-label="${this.flipped ? 'Show question' : 'Reveal answer'}" style="width:100%;color:inherit">
          <div class="tiny" style="font-weight:700;letter-spacing:.06em;color:var(--accent)">${this.flipped ? 'ANSWER' : esc(q.topic.toUpperCase())}</div>
          ${this.flipped ? `<h2 style="font-size:20px">${esc((q.answerIndices || [q.answerIndex]).map((k) => q.options[k]).join(' · '))}</h2><div class="muted small">${esc(q.rationale)}</div>`
            : `<h2 style="font-size:22px">${esc(q.stem)}</h2><div class="tiny muted">${icon('hand', '', 'width:16px;height:16px;vertical-align:-3px')} Click or press Space to reveal</div>`}</button>
        <div class="grid-2"><button class="btn secondary" style="color:var(--red)" data-act="deck-mark" data-arg="0">${icon('refresh', '', 'width:18px;height:18px')} Review again</button>
          <button class="btn green" data-act="deck-mark" data-arg="1">${icon('check', '', 'width:18px;height:18px')} Got it</button></div>
        <div class="tiny muted center">Keyboard: <span class="kbd">Space</span> flip · <span class="kbd">1</span> review again · <span class="kbd">2</span> got it</div>`;
    return `<div class="content stack" style="max-width:640px;min-height:100vh">
      <div class="row"><button class="icon-btn" data-act="deck-close" aria-label="Close">${icon('close')}</button><b class="grow center">Flashcards</b><span class="small muted">${Math.min(this.index + 1, this.cards.length)}/${this.cards.length}</span></div>
      ${bar((this.index + (done ? 0 : 1)) / this.cards.length, 'var(--accent)')}${body}</div>`;
  }
};

function flashcardsView() {
  const t = P.track;
  return `<div class="content stack">${pageHead('Flashcards', false, trackSwitch())}
    <div class="card stack-sm"><h3>${icon('cards', '', 'width:18px;height:18px;color:var(--accent);vertical-align:-3px')} Flashcards</h3>
      <div class="small muted">Flip through key questions. Reveal the answer, then mark whether you knew it: we'll schedule reviews for you.</div>
      <button class="btn navy" data-act="deck-all">Shuffle all topics</button></div>
    <div class="list-head">By topic</div>
    <div class="list">${Bank.topics(t).map((x) => listRow('cards', 'var(--accent)', x.name, '', 'deck-topic', x.key)).join('')}</div></div>`;
}

// MARK: - Review

function reviewView() {
  const t = P.track, inc = P.incorrect(t), bm = P.bookmarked(t), due = P.dueCount(t);
  const bucket = (ic, col, title, n, blurb, act) => `<div class="card stack-sm"><div class="row"><b class="grow">${icon(ic, '', `width:18px;height:18px;color:${col};vertical-align:-3px`)} ${esc(title)}</b><b style="color:${col}">${n}</b></div>
    <div class="small muted">${esc(blurb)}</div><button class="btn navy" data-act="${act}" ${n ? '' : 'disabled'}>Review ${Math.min(n, 20)} questions</button></div>`;
  return `<div class="content stack">${pageHead('Review', false, trackSwitch())}
    ${bucket('xFill', 'var(--red)', 'Incorrect answers', inc.length, 'Re-practise every question you last got wrong.', 'review-incorrect')}
    ${bucket('bookmarkFill', 'var(--accent)', 'Bookmarked', bm.length, 'Questions you saved to revisit.', 'review-bookmarks')}
    <div class="card stack-sm"><b>${icon('brain', '', 'width:18px;height:18px;color:var(--green);vertical-align:-3px')} Spaced repetition</b>
      <div class="small muted">${due} questions are due for review to lock them into memory.</div>
      <button class="btn green" data-act="start-srs">Start spaced review</button></div></div>`;
}

// MARK: - Exam info & sources

function examInfoView() {
  const T = TRACKS.main;
  const row = (k, v) => `<div class="list-row"><span class="grow small muted">${esc(k)}</span><span class="small" style="text-align:right;max-width:60%">${esc(v)}</span></div>`;
  const bullet = (s) => `<div class="feature small" style="align-items:flex-start">${icon('check', '', 'color:var(--accent);margin-top:2px')}<span>${esc(s)}</span></div>`;
  return `<div class="content stack">${pageHead('Exam Info', navStack.length > 0)}
    <div class="card stack-sm"><h2>TExES PPR EC-12 (160)</h2><div class="small muted">Pedagogy and Professional Responsibilities EC-12 is the pedagogy exam most Texas teacher candidates must pass for certification. Check the official preparation manual on the TExES site for the current format and policies.</div></div>
    <div class="grid-3">${statTile(String(T.count), 'Mock questions', 'var(--blue)')}${statTile(`${T.minutes}m`, 'Mock time', 'var(--accent)')}${statTile(`${PASS}%`, 'Pass line', 'var(--green)')}</div>
    <div class="list">${row('Format', 'Selected-response questions, many built on classroom scenarios')}${row('Time', 'About 5 hours, computer-administered at Pearson VUE test centers')}${row('Covers', '4 domains and 13 competencies, from instruction design to legal and ethical duties')}${row('Passing score', 'Scaled score of 240 (range 100-300); this app practises to 75%')}${row("This app's mock", `${T.count} questions · ${T.minutes} min · pass at ${PASS}%`)}</div>
    <div class="card stack-sm"><h3>${icon('chart', '', 'width:18px;height:18px;color:var(--accent);vertical-align:-3px')} Topics</h3>
      ${Bank.topicList.map((d) => `<div class="stack-sm" style="gap:4px"><div class="row small"><span class="grow">${esc(d.name)}</span><span class="muted">${d.weight}%</span></div>${bar(d.weight / 40, 'var(--blue)')}</div>`).join('')}</div>
    <div class="card stack-sm"><h3>Getting certified (typical)</h3>${['Enrol in an approved educator preparation program (EPP)', 'Pass your content exam and the PPR EC-12', 'Complete clinical teaching or an internship', 'Apply for your standard certificate through TEA'].map(bullet).join('')}</div>
    <div class="card stack-sm"><h3>Rules change</h3><div class="small muted">Certification rules, exam policies and the Educators' Code of Ethics are updated from time to time. Always check TEA and the official TExES preparation manual.</div></div>
    <div class="list">${listRow('library', 'var(--accent)', 'Study Guides', '', 'tab', 'library')}${listRow('closedBook', 'var(--blue)', 'Sources & disclaimer', '', 'nav', 'sources')}</div></div>`;
}

function sourcesView() {
  const sources = [
    ['TEA: Educator certification', 'https://tea.texas.gov/texas-educators/certification'],
    ['TExES program site (Pearson)', 'https://www.tx.nesinc.com/']
  ];
  return `<div class="content stack">${pageHead('Sources', true)}
    <div class="card flat small muted">All questions, lessons and glossary entries are original, written from the public TEA/Pearson PPR EC-12 competency framework. No real or secured TExES item was used. The full list of public sources is in the Study Library.</div>
    <div class="list-head">Reference sources</div><div class="list">${sources.map(([t, u]) => linkRow('link', t, u)).join('')}</div>
    <div class="list-head">Disclaimer</div><div class="card flat tiny muted">${esc(DISCLAIMER)}</div></div>`;
}

// MARK: - Study library

let libQuery = '';
function libSearch(q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean), out = [];
  if (!words.length) return out;
  for (const sec of Bank.library.sections) for (const t of sec.topics) {
    const hay = [t.title, sec.title, t.reference, ...t.blocks.map((b) => [b.text, b.label, b.note, b.title, ...(b.items || []), ...(b.headers || []), ...(b.rows || []).flat()].join(' '))].join(' ').toLowerCase();
    if (words.every((w) => hay.includes(w))) out.push({ sec, t });
  }
  return out;
}
function libraryView() {
  const L = Bank.library, results = libSearch(libQuery);
  return `<div class="content stack">${pageHead('Study Library')}
    <label class="search">${icon('search')}<input type="search" data-input="lib.q" value="${esc(libQuery)}" placeholder="Search Bloom, IEP, formative assessment…" aria-label="Search the study library"></label>
    <div id="lib-results">${libQuery ? libResultsHTML(results) : ''}</div>
    ${libQuery ? '' : `<div class="list">${L.sections.map((x) => listRow('library', 'var(--accent)', x.title, `${x.topics.length} topics`, 'lib-section', x.id)).join('')}</div>
    <div class="tiny muted">Original study material. Always follow your state's standards of practice.</div>`}</div>`;
}
function libResultsHTML(results) {
  return results.length ? `<div class="list">${results.map(({ sec, t }) => `<button class="list-row" data-act="lib-topic" data-arg="${esc(t.id)}"><div class="grow"><div style="font-weight:600">${esc(t.title)}</div><div class="tiny muted">${esc(sec.title)}</div></div>${icon('chevron', 'chev')}</button>`).join('')}</div>` : '<div class="small muted">No topics match your search.</div>';
}
function libSectionView() {
  const sec = Bank.section(routeArg);
  if (!sec) return libraryView();
  return `<div class="content stack">${pageHead(sec.title, true)}
    <div class="small muted">${esc(sec.summary)}</div>
    <div class="list">${sec.topics.map((t) => listRow('doc', 'var(--blue)', t.title, '', 'lib-topic', t.id)).join('')}</div></div>`;
}
function libBlock(b) {
  if (b.type === 'heading') return `<h3>${esc(b.text)}</h3>`;
  if (b.type === 'paragraph') return `<div class="small" style="line-height:1.6;white-space:pre-line">${esc(b.text)}</div>`;
  if (b.type === 'bullets') return `<ul class="lib-list">${(b.items || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  if (b.type === 'table') return `<div class="lib-table"><table><thead><tr>${(b.headers || []).map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${(b.rows || []).map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if (b.type === 'formula') return `<div class="lib-formula"><span class="tiny muted">${esc(b.label || '')}</span><code>${esc(b.text)}</code>${b.note ? `<span class="tiny muted">${esc(b.note)}</span>` : ''}</div>`;
  if (b.type === 'tip') return `<div class="lib-tip">${icon('bulb', '', 'width:18px;height:18px;flex:none;color:var(--accent)')}<span class="small">${esc(b.text)}</span></div>`;
  if (b.type === 'link') return `<div class="list">${linkRow('link', b.title || b.url, b.url)}</div>`;
  return '';
}
function libTopicView() {
  const hit = Bank.libTopic(routeArg);
  if (!hit) return libraryView();
  return `<div class="content stack" style="max-width:860px">${pageHead(hit.t.title, true)}
    <div class="tiny" style="font-weight:700;color:var(--accent);letter-spacing:.04em">${esc(hit.sec.title.toUpperCase())}</div>
    <div class="card stack">${hit.t.blocks.map(libBlock).join('')}</div>
    ${hit.t.reference ? `<div class="tiny muted">Reference: ${esc(hit.t.reference)}</div>` : ''}</div>`;
}

// MARK: - Settings

function settingsView() {
  const owned = Store.owned, prof = P.data.profile;
  const status = Store.hasLifetime ? 'Lifetime' : owned.has(PRODUCTS.yearly) ? 'Yearly · Active' : owned.has(PRODUCTS.monthly) ? 'Monthly · Active' : Store.isPro ? 'Active' : 'Not subscribed';
  const goals = []; for (let g = 5; g <= 100; g += 5) goals.push(g);
  return `<div class="content">${pageHead('Settings')}
    <div class="list-head">Subscription</div><div class="list">
      <div class="list-row">${icon('seal', 'ic', 'color:var(--blue)')}<span class="grow">Status</span><b class="small" style="color:${Store.isPro ? 'var(--green)' : 'var(--muted)'}">${esc(status)}</b></div>
      <button class="list-row" data-act="settings-restore">${icon('refresh', 'ic', 'color:var(--accent)')}<span class="grow">Restore Purchases</span></button>
      ${Store.isPro && !Store.hasLifetime ? linkRow('card', 'Manage Subscription', LINKS.manageSubscriptions) : ''}
    </div><p class="list-foot">Manage or cancel anytime in your Microsoft account (account.microsoft.com/services).</p>
    <div class="list-head">Study</div><div class="list">
            <label class="field"><span>Daily goal</span><select data-input="set.goal">${goals.map((g) => `<option value="${g}" ${prof.dailyGoal === g ? 'selected' : ''}>${g} questions</option>`).join('')}</select></label>
      <label class="field"><span>Exam date</span><input class="toggle" type="checkbox" data-input="set.hasDate" ${prof.examDate != null ? 'checked' : ''}></label>
      ${prof.examDate != null ? `<label class="field"><span>Date</span><input type="date" data-input="set.date" min="${toDateInput(Date.now())}" value="${toDateInput(prof.examDate)}"></label>` : ''}
    </div>
    <div class="list-head">Information</div><div class="list">
      ${listRow('info', 'var(--accent)', 'Exam information', '', 'nav', 'examinfo')}
      ${listRow('library', 'var(--accent)', 'Study Library', '', 'tab', 'library')}
      ${listRow('closedBook', 'var(--accent)', 'Sources & disclaimer', '', 'nav', 'sources')}
      ${linkRow('hand', 'Privacy Policy', LINKS.privacy)}${linkRow('doc', 'Terms of Use', LINKS.terms)}${linkRow('help', 'Support', LINKS.support)}</div>
    <div class="list-head">Data</div><div class="list"><button class="list-row" data-act="settings-reset" style="color:var(--red)">${icon('trash', 'ic')}<span class="grow">Reset progress</span></button></div>
    <div class="list-head">About</div><div class="list">
      <div class="list-row"><span class="grow">Version</span><span class="muted">${APP_VERSION}</span></div>
      <div class="list-row tiny muted">${esc(DISCLAIMER)} © 2026 MD Shahariar Nazim Joy.</div></div>
  </div>`;
}

// MARK: - Events

const actions = {
  tab: (a) => goTab(a),
  back: () => { if (route === 'quiz' && Quiz.cur?.showReview) { Quiz.cur.showReview = false; render(); return; } goBack(); },
  nav: (a) => go(a),
  'set-track': (a) => { P.data.track = a; P.save(); render(); },
  'start-mock': () => Quiz.start(Bank.mock(P.track), 'mock'),
  'start-quick': (a) => Quiz.start(Bank.sample(P.track, Number(a) || 10), 'practice'),
  'start-srs': () => Quiz.start(P.dueQuestions(P.track, 20), 'srs'),
  'start-topic': (a) => Quiz.start(Bank.sample(P.track, 15, [a]), 'practice'),
  'review-incorrect': () => Quiz.start(shuffle(P.incorrect(P.track)).slice(0, 20), 'review'),
  'review-bookmarks': () => Quiz.start(shuffle(P.bookmarked(P.track)).slice(0, 20), 'review'),
  drill: (a) => { const t = Quiz.cur?.track || P.track; Quiz.cur = null; Quiz.start(Bank.sample(t, 12, [a]), 'practice', t); },
  'lib-section': (a) => go('libsection', a),
  'lib-topic': (a) => go('libtopic', a),
  'q-pick': (a) => { Quiz.choose(Number(a)); render(); },
  'q-check': () => { Quiz.check(); render(); },
  'q-next': () => { Quiz.next(); render(); window.scrollTo(0, 0); },
  'q-prev': () => { Quiz.prev(); render(); window.scrollTo(0, 0); },
  'q-go': (a) => { Quiz.cur.index = Number(a); render(); },
  'q-flag': () => { const c = Quiz.cur; c.flagged.has(c.index) ? c.flagged.delete(c.index) : c.flagged.add(c.index); render(); },
  'q-submit': () => {
    const c = Quiz.cur, left = c.questions.length - Object.keys(c.answers).length;
    if (c.mode !== 'mock' || !left) { Quiz.finish(); render(); window.scrollTo(0, 0); return; }
    modal('Submit your mock?', `You have ${left} unanswered question${left === 1 ? '' : 's'}. Unanswered questions score zero.`, [
      { label: 'Keep going' }, { label: 'Submit', cls: 'navy', run: () => { Quiz.finish(); render(); window.scrollTo(0, 0); } }
    ]);
  },
  'q-bookmark': () => { P.toggleBookmark(Quiz.q.id); render(); },
  'q-quit': () => modal('End this quiz?', Quiz.cur.mode === 'mock' ? "Your mock won't be saved." : 'Answers you have already checked are saved.', [
    { label: 'Keep going' }, { label: 'End quiz', cls: 'red', run: () => { if (timerHandle) clearInterval(timerHandle); timerHandle = null; Quiz.cur = null; goBack(); } }
  ]),
  'q-done': () => { Quiz.cur = null; goBack(); },
  'q-review-all': () => { Quiz.cur.showReview = true; render(); window.scrollTo(0, 0); },
  'deck-all': () => Deck.start(Bank.sample(P.track, 30)),
  'deck-topic': (a) => Deck.start(Bank.sample(P.track, 20, [a])),
  'deck-flip': () => { Deck.flipped = !Deck.flipped; render(); },
  'deck-mark': (a) => { Deck.mark(a === '1'); render(); },
  'deck-close': () => { Deck.cards = []; goBack(); },
  'settings-restore': async () => {
    await Store.restore();
    modal('Restore Purchases', Store.isPro ? 'Your purchases have been restored.' : (Store.error || 'No purchases found for this Microsoft account.'), [{ label: 'OK', cls: 'navy' }]);
    render();
  },
  'settings-reset': () => modal('Reset all study progress?', 'This clears answers, mock history, bookmarks and streak. It cannot be undone. Your purchase is not affected.', [
    { label: 'Cancel' }, { label: 'Reset everything', cls: 'red', run: () => { P.reset(); render(); } }
  ]),
  'pw-pick': (a) => { Paywall.selected = a; render(); },
  'pw-buy': async () => {
    Paywall.busy = true; render();
    await Store.purchase(Paywall.selected);
    Paywall.busy = false; render();
  },
  'pw-restore': async () => {
    await Store.restore();
    render();
    modal('Restore Purchases', Store.isPro ? 'Your purchases have been restored.' : (Store.error || 'No purchases found for this Microsoft account.'), [{ label: 'OK', cls: 'navy' }]);
  },
  'pw-reload': async () => { await Store.fetchProducts(); render(); },
  'ob-next': () => { if (Onboarding.canAdvance()) { Onboarding.step++; render(); window.scrollTo(0, 0); } },
  'ob-back': () => { Onboarding.step = Math.max(0, Onboarding.step - 1); render(); },
  'ob-track': (a) => { Onboarding.track = a; render(); },
  'ob-goal': (a) => { Onboarding.goal = a; render(); },
  'ob-reason': (a) => { Onboarding.reason = a; render(); },
  'ob-exp': (a) => { Onboarding.experience = a; render(); },
  'ob-pain': (a) => { const s = Onboarding.pains; s.has(a) ? s.delete(a) : s.add(a); render(); },
  'ob-diag-start': () => {
    const o = Onboarding;
    o.diag = Bank.sample(o.track, 40).filter((q) => !q.answerIndices).slice(0, 10); o.diagIndex = 0; o.diagCorrect = 0; o.diagChosen = null; o.step = 6;
    render(); window.scrollTo(0, 0);
  },
  'ob-diag-pick': (a) => {
    const o = Onboarding, q = o.diag[o.diagIndex];
    if (o.diagChosen != null) return;
    o.diagChosen = Number(a);
    if (o.diagChosen === q.answerIndex) o.diagCorrect++;
    P.recordAnswer(q, o.diagChosen === q.answerIndex);
    render();
  },
  'ob-diag-next': () => { const o = Onboarding; o.diagChosen = null; o.diagIndex++; render(); window.scrollTo(0, 0); },
  'ob-finish': () => Onboarding.finish()
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled || !$app.contains(el)) return;
  const fn = actions[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el.dataset.arg); }
});

function handleInput(e) {
  const t = e.target, key = t.dataset && t.dataset.input;
  if (!key) return;
  const v = t.type === 'checkbox' ? t.checked : t.value;
  const [group, field] = key.split('.');
  if (group === 'ob') {
    const o = Onboarding;
    if (field === 'hasDate') o.hasDate = v;
    if (field === 'date' && v) o.examDate = fromDateInput(v);
    if (field === 'goal') o.dailyGoal = Number(v);
    if (e.type === 'change') render();
    return;
  }
  if (key === 'lib.q') {
    libQuery = v;
    const el = document.getElementById('lib-results');
    if (el && libQuery) el.innerHTML = libResultsHTML(libSearch(libQuery)); else render();
    return;
  }
  if (group === 'set') {
    const prof = P.data.profile;
    if (field === 'track') P.data.track = v;
    if (field === 'goal') prof.dailyGoal = Number(v);
    if (field === 'hasDate') prof.examDate = v ? Date.now() + 14 * DAY : null;
    if (field === 'date' && v) prof.examDate = fromDateInput(v);
    P.save();
    if (e.type === 'change' && (field === 'hasDate' || field === 'track')) render();
  }
}
document.addEventListener('input', handleInput);
document.addEventListener('change', (e) => { if (e.target.type === 'checkbox' || e.target.tagName === 'SELECT' || e.target.type === 'date') handleInput(e); });

document.addEventListener('keydown', (e) => {
  if ($modal.innerHTML) { if (e.key === 'Escape') $modal.innerHTML = ''; return; }
  if (e.target.matches && e.target.matches('input, select, textarea')) return;
  if (!P.data.onboarded || !Store.isPro) return;
  const k = e.key.toLowerCase();
  if (route === 'quiz' && Quiz.cur && !Quiz.cur.finished) {
    const c = Quiz.cur, idx = { a: 0, b: 1, c: 2, d: 3, e: 4, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 }[k];
    if (idx != null && idx < Quiz.q.options.length) { actions['q-pick'](idx); return; }
    if (k === 'enter') {
      e.preventDefault();
      const last = c.index === c.questions.length - 1;
      if (Quiz.isMulti(Quiz.q) && Quiz.feedback && !c.revealed.has(Quiz.q.id)) { actions['q-check'](); return; }
      if (Quiz.feedback && !Quiz.hasAnswer(Quiz.q)) return;
      last ? actions['q-submit']() : actions['q-next']();
      return;
    }
    if (k === 'arrowleft') { actions['q-prev'](); return; }
    if (k === 'arrowright' && !Quiz.feedback) { actions['q-next'](); return; }
    if (k === 'escape') { actions['q-quit'](); return; }
  }
  if (route === 'deck' && Deck.index < Deck.cards.length) {
    if (k === ' ') { e.preventDefault(); actions['deck-flip'](); return; }
    if (k === '1' || k === '2') { actions['deck-mark'](k === '2' ? '1' : '0'); return; }
    if (k === 'escape') actions['deck-close']();
  }
});

// MARK: - Boot

(async function boot() {
  P.load();
  $app.innerHTML = splash();
  try { await Bank.load(); }
  catch { $app.innerHTML = '<div class="splash"><h2>Could not load questions</h2><p class="muted">Check your connection and reopen the app.</p></div>'; return; }
  if (DEMO) {
    if (!PARAMS.has('fresh')) P.seedDemo();
    P.data.onboarded = !PARAMS.has('onboarding');
    if (PARAMS.get('track')) P.data.track = PARAMS.get('track');
  }
  render();
  await Store.init();
  if (DEMO && PARAMS.has('paywall')) {
    // Screenshot of the paywall with the Store prices (USD).
    Store.owned = new Set(); Store.available = true;
    Store.details = [
      { itemId: PRODUCTS.yearly, price: { currency: 'USD', value: '49.99' } },
      { itemId: PRODUCTS.monthly, price: { currency: 'USD', value: '9.99' } },
      { itemId: PRODUCTS.lifetime, price: { currency: 'USD', value: '99.99' } }
    ];
  }
  if (DEMO && PARAMS.get('screen')) {
    const s = PARAMS.get('screen');
    if (s === 'quiz') { Quiz.start(Bank.sample(P.track, 40).filter((q) => !q.answerIndices).slice(0, 10), 'practice'); Quiz.choose(Quiz.q.answerIndex); }
    else if (s === 'mock') { Quiz.start(Bank.mock(P.track), 'mock'); Quiz.cur.index = 6; Quiz.cur.questions.slice(0, 6).forEach((q) => { Quiz.cur.answers[q.id] = q.answerIndices || q.answerIndex; }); Quiz.cur.remaining = 7480; Quiz.cur.deadline = Date.now() + 7480000; }
    else if (s === 'results') { Quiz.start(Bank.mock(P.track), 'mock'); Quiz.cur.questions.forEach((q, i) => { Quiz.cur.answers[q.id] = i % 5 === 4 ? (q.answerIndex + 1) % q.options.length : (q.answerIndices || q.answerIndex); }); Quiz.cur.startedAt = Date.now() - 6960000; Quiz.finish(); }
    else if (s === 'deck') { Deck.start(Bank.sample(P.track, 20)); Deck.index = 3; Deck.flipped = PARAMS.has('flip'); }
    else go(s, PARAMS.get('arg'), false);
  }
  render();
  if ('serviceWorker' in navigator && !IS_LOCAL) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
