import { LEVELS, HURUF, forms } from './data.js';

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clone = (o) => JSON.parse(JSON.stringify(o));
const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ===== penyimpanan ===== */
const KEY = 'iqra-v2';
const DEF = { done: {}, best: {}, streak: { last: '', n: 0 }, set: { dark: 'auto', size: 100, rate: 0.6, sound: true } };
function load() {
  const s = clone(DEF);
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || '{}');
    Object.assign(s.done, d.done);
    Object.assign(s.best, d.best);
    Object.assign(s.streak, d.streak);
    Object.assign(s.set, d.set);
  } catch {}
  return s;
}
const S = load();
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {}
};

const dayStr = (d) => d.toLocaleDateString('en-CA');
function touchStreak() {
  const t = dayStr(new Date());
  if (S.streak.last === t) return;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  S.streak.n = S.streak.last === dayStr(y) ? S.streak.n + 1 : 1;
  S.streak.last = t;
}
function streakNow() {
  const t = dayStr(new Date());
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return S.streak.last === t || S.streak.last === dayStr(y) ? S.streak.n : 0;
}

/* ===== progres ===== */
const key = (lv, i) => `${lv.id}-${i}`;
const lvDone = (lv) => lv.pages.filter((_, i) => S.done[key(lv, i)]).length;
const totalPages = () => LEVELS.reduce((a, l) => a + l.pages.length, 0);
const totalDone = () => LEVELS.reduce((a, l) => a + lvDone(l), 0);
function nextTodo() {
  for (const lv of LEVELS) for (let i = 0; i < lv.pages.length; i++) if (!S.done[key(lv, i)]) return { lv, i };
  return null;
}
const canQuiz = (pg) => pg.kind === 'grid' && new Set(pg.items.filter((c) => c.r).map((c) => c.r)).size >= 4;

/* ===== pengaturan ===== */
const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
function applySettings() {
  const dark = S.set.dark === 'on' || (S.set.dark === 'auto' && mq && mq.matches);
  document.documentElement.classList.toggle('theme-dark', dark);
  document.documentElement.style.setProperty('--ar-scale', S.set.size / 100);
}
if (mq && mq.addEventListener) mq.addEventListener('change', applySettings);
applySettings();

/* ===== suara ===== */
let audioFiles = [];
fetch('data/audio.json').then((r) => r.json()).then((d) => (audioFiles = d)).catch(() => {});
const base = (f) => f.replace(/\.[^.]+$/, '').toLowerCase();
function audioFor(i) {
  const name = HURUF[i][1].toLowerCase();
  const byName = audioFiles.find((f) => base(f) === name);
  if (byName && name !== 'ha') return byName;
  if (audioFiles.length === HURUF.length && audioFiles.every((f) => /^\d+$/.test(base(f)))) return audioFiles[i];
  return byName || null;
}
let player;
function stopAll() {
  if (player) player.pause();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
function speak(text) {
  if (!('speechSynthesis' in window)) return toast('Suara belum tersedia di perangkat ini.');
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  u.rate = S.set.rate;
  u.onerror = (e) => {
    if (e.error !== 'canceled' && e.error !== 'interrupted')
      toast('Suara Arab belum terpasang. Pasang di Pengaturan HP > Teks ke ucapan > Google.');
  };
  speechSynthesis.speak(u);
}
function say(text, audioIdx) {
  stopAll();
  if (!S.set.sound) return;
  if (audioIdx != null) {
    const f = audioFor(audioIdx);
    if (f) {
      player = new Audio('audio/' + encodeURIComponent(f));
      player.play().catch(() => speak(text));
      return;
    }
  }
  speak(text);
}

/* ===== tampilan ===== */
const ring = (p, size = 64, stroke = 7) => {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, m = size / 2;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${m}" cy="${m}" r="${r}" class="ring-bg" stroke-width="${stroke}" fill="none"/>
    <circle cx="${m}" cy="${m}" r="${r}" class="ring-fg" stroke-width="${stroke}" fill="none" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}" transform="rotate(-90 ${m} ${m})"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".35em" class="ring-t">${Math.round(p * 100)}%</text></svg>`;
};

const page = (name, title, body, back = true) => `
<div class="page" data-name="${name}">
  <div class="navbar"><div class="navbar-bg"></div>
    <div class="navbar-inner sliding">
      ${back ? '<div class="left"><a class="link back"><i class="icon icon-back"></i><span class="if-not-md">Kembali</span></a></div>' : ''}
      <div class="title">${esc(title)}</div>
    </div>
  </div>
  <div class="page-content"><div class="wrap">${body}</div></div>
</div>`;

function homeBody() {
  const d = totalDone(), t = totalPages(), nx = nextTodo();
  const cont = nx
    ? `<a class="button button-large button-fill" href="/level/${nx.lv.id}/${nx.i}/">${d ? 'Lanjutkan' : 'Mulai belajar'}: ${esc(nx.lv.title)}</a>`
    : '<p class="all-done">Semua halaman selesai. Barakallahu fiik! 🎉</p>';
  const levels = LEVELS.map(
    (lv) => `<a href="/level/${lv.id}/" class="lv-card"><div class="lv-badge">${lv.id}</div>
      <div class="lv-main"><b>${esc(lv.title)}</b><span>${esc(lv.desc)}</span>
      <div class="bar"><i data-bar="${lv.id}"></i></div><small data-lvtxt="${lv.id}"></small></div></a>`
  ).join('');
  return `<div class="hero"><div>${ring(t ? d / t : 0)}</div>
    <div><h2>Belajar Iqra</h2><p>Dari Jilid 1 sampai Jilid 6, bisa tanpa internet.</p>
    <span class="chip">🔥 ${streakNow()} hari beruntun</span></div></div>
    <div class="actions">${cont}</div><div class="level-grid">${levels}</div>`;
}

function statBody() {
  const d = totalDone(), t = totalPages();
  const bests = Object.values(S.best);
  const avg = bests.length ? Math.round(bests.reduce((a, b) => a + b, 0) / bests.length) : 0;
  const rows = LEVELS.map(
    (lv) => `<div class="stat-row"><b>${esc(lv.title)}</b><small data-lvtxt="${lv.id}"></small>
      <div class="bar"><i data-bar="${lv.id}"></i></div></div>`
  ).join('');
  return `<div class="stat-top">
    <div class="stat-card">${ring(t ? d / t : 0, 96, 9)}<span>Halaman selesai</span></div>
    <div class="stat-card"><b class="big">${streakNow()}</b><span>Hari beruntun</span></div>
    <div class="stat-card"><b class="big">${bests.length}</b><span>Kuis dikerjakan</span></div>
    <div class="stat-card"><b class="big">${avg}%</b><span>Rata-rata kuis</span></div></div>
    <div class="card-block"><h3>Per level</h3>${rows}</div>`;
}

function setBody() {
  const s = S.set;
  const seg = (v, l) => `<button class="seg-b${s.dark === v ? ' on' : ''}" data-dark="${v}">${l}</button>`;
  return `<div class="card-block"><h3>Tampilan</h3>
    <div class="seg">${seg('auto', 'Otomatis')}${seg('off', 'Terang')}${seg('on', 'Gelap')}</div>
    <label class="row-lbl">Ukuran huruf Arab <b id="v-size">${s.size}%</b></label>
    <input type="range" id="set-size" min="80" max="150" step="5" value="${s.size}">
    <div class="ar prev">بِسْمِ ٱللَّهِ</div></div>
    <div class="card-block"><h3>Suara</h3>
    <div class="row"><span>Suara aktif</span><label class="toggle"><input type="checkbox" id="set-sound" ${s.sound ? 'checked' : ''}><i class="toggle-icon"></i></label></div>
    <label class="row-lbl">Kecepatan suara <b id="v-rate">${s.rate}</b></label>
    <input type="range" id="set-rate" min="0.3" max="1" step="0.1" value="${s.rate}"></div>
    <div class="card-block"><h3>Data</h3><button class="button button-large button-outline color-red" id="btn-reset">Reset progres</button></div>
    <div class="card-block"><h3>Tentang</h3>
    <p>Iqra: belajar membaca huruf Hijaiyah bertahap dari Jilid 1 sampai Jilid 6, bisa dipakai tanpa internet.</p>
    <p>Audio nama huruf dan font berasal dari proyek <b>belajar-ngaji</b> oleh awahids (lisensi MIT). Susunan materi mengacu pada buku Iqro (Team Tadarus AMM) dan tanda waqaf Mushaf Standar Indonesia (Kemenag).</p>
    <p>Suara sukukata memakai suara bawaan perangkat sebagai perkiraan. Aplikasi ini alat bantu, belajarlah langsung dengan guru ngaji untuk pengucapan yang tepat.</p></div>`;
}

function levelBody(lv) {
  return `<div class="level-head"><div class="lv-badge big">${lv.id}</div><div><h2>${esc(lv.title)}</h2><p>${esc(lv.desc)}</p></div></div>
    <p class="note">${esc(lv.intro)}</p><div class="bar"><i data-bar="${lv.id}"></i></div><small data-lvtxt="${lv.id}"></small>
    <div class="list-card">${lv.pages
      .map(
        (pg, i) => `<a class="li-link" href="/level/${lv.id}/${i}/"><span class="n">${i + 1}</span><span class="t">${esc(pg.title)}</span><span class="r" data-pg="${key(lv, i)}"></span></a>`
      )
      .join('')}</div>`;
}

function lessonBody(lv, pi) {
  const pg = lv.pages[pi];
  const m = { 2: 140, 3: 96, 4: 72 }[pg.cols] || 96;
  let body = `<div class="lesson-head"><span class="chip">${esc(lv.title)} · ${pi + 1}/${lv.pages.length}</span>
    ${pg.note ? `<p class="note">${esc(pg.note)}</p>` : ''}<div class="status"></div></div>`;
  if (pg.kind === 'grid') {
    body += `<div class="cells c${pg.cols}" style="--m:${m}px">${pg.items
      .map(
        (c, i) => `<button class="cell" data-t="${esc(c.t)}" data-r="${esc(c.r)}"${pg.audio ? ` data-a="${i}"` : ''}><div class="ar">${esc(c.t)}</div>${c.r ? `<small>${esc(c.r)}</small>` : ''}</button>`
      )
      .join('')}</div>`;
  } else if (pg.kind === 'forms') {
    body += `<div class="forms"><b>Huruf</b><b>Sendiri</b><b>Awal</b><b>Tengah</b><b>Akhir</b>${HURUF.map(
      ([c, n]) => `<span>${esc(n)}</span>${forms(c).map((f) => `<span class="ar">${esc(f)}</span>`).join('')}`
    ).join('')}</div>`;
  } else {
    body += `<div class="list-card">${pg.items
      .map((c) => `<button class="li-row" data-t="${esc(c.t)}"><span class="ar">${esc(c.t)}</span><span>${esc(c.s)}</span></button>`)
      .join('')}</div>`;
  }
  const next = pi + 1 < lv.pages.length ? `/level/${lv.id}/${pi + 1}/` : '';
  body += `<div class="actions">${canQuiz(pg) ? `<a class="button button-large button-outline" href="/quiz/${lv.id}/${pi}/">Kuis</a>` : ''}
    <button class="button button-large button-fill btn-done" data-key="${key(lv, pi)}" data-next="${next}">${next ? 'Selesai, lanjut' : 'Selesai'}</button></div>`;
  return page('lesson', pg.title, body);
}

function paint(root) {
  root.querySelectorAll('[data-pg]').forEach((e) => {
    const k = e.dataset.pg;
    e.textContent = (S.done[k] ? '✓ ' : '') + (S.best[k] != null ? S.best[k] + '%' : '');
  });
  root.querySelectorAll('[data-bar]').forEach((e) => {
    const lv = LEVELS[+e.dataset.bar - 1];
    e.style.width = (lvDone(lv) / lv.pages.length) * 100 + '%';
  });
  root.querySelectorAll('[data-lvtxt]').forEach((e) => {
    const lv = LEVELS[+e.dataset.lvtxt - 1];
    e.textContent = `${lvDone(lv)}/${lv.pages.length} halaman`;
  });
}
function refreshRoots() {
  [['home', homeBody], ['stat', statBody]].forEach(([n, fn]) =>
    document.querySelectorAll(`.page[data-name="${n}"] .wrap`).forEach((w) => {
      w.innerHTML = fn();
      paint(w);
    })
  );
}

/* ===== kuis ===== */
let Q = null;
function startQuiz(p) {
  const lv = LEVELS[+p.route.params.id - 1], pi = +p.route.params.p, pg = lv.pages[pi];
  const pool = pg.items.map((c, i) => ({ ...c, i })).filter((c) => c.r);
  Q = { lv, pi, pg, pool, el: p.el, picks: shuffle(pool).slice(0, 10), n: 0, score: 0, locked: false, cur: null };
  renderQ();
}
function renderQ() {
  const box = Q.el.querySelector('.quiz-box');
  if (!box) return;
  if (Q.n >= Q.picks.length) {
    const pct = Math.round((Q.score / Q.picks.length) * 100);
    const k = key(Q.lv, Q.pi);
    S.best[k] = Math.max(S.best[k] || 0, pct);
    let msg = 'Ayo coba lagi, kamu pasti bisa.';
    if (pct >= 70) {
      S.done[k] = true;
      touchStreak();
      msg = 'Lulus! Halaman ini ditandai selesai.';
    }
    save();
    refreshRoots();
    box.innerHTML = `<div class="q-result"><div class="big">${pct}%</div><p>${Q.score} dari ${Q.picks.length} benar</p><p>${msg}</p>
      <button class="button button-large button-fill q-again">Ulangi kuis</button>
      <a class="button button-large button-outline back">Kembali ke latihan</a></div>`;
    return;
  }
  const cur = Q.picks[Q.n];
  Q.cur = cur;
  const wrong = shuffle([...new Set(Q.pool.map((c) => c.r))].filter((r) => r !== cur.r)).slice(0, 3);
  const opts = shuffle([cur.r, ...wrong]);
  box.innerHTML = `<div class="q-count">Soal ${Q.n + 1}/${Q.picks.length} · Skor ${Q.score}</div>
    <div class="q-card ar">${esc(cur.t)}</div>
    <button class="button button-outline q-listen">Dengarkan</button>
    <div class="q-opts">${opts.map((o) => `<button class="q-opt" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
}

/* ===== rute ===== */
const routes = [
  { path: '/', content: page('home', 'Iqra', homeBody(), false) },
  { path: '/stat/', content: page('stat', 'Progres', statBody(), false) },
  { path: '/set/', content: page('set', 'Pengaturan', setBody(), false) },
  {
    path: '/level/:id/',
    async: function ({ to, resolve }) {
      const lv = LEVELS[+to.params.id - 1];
      resolve({ content: page('level', lv.title, levelBody(lv)) });
    }
  },
  {
    path: '/level/:id/:p/',
    async: function ({ to, resolve }) {
      resolve({ content: lessonBody(LEVELS[+to.params.id - 1], +to.params.p) });
    }
  },
  {
    path: '/quiz/:id/:p/',
    async: function ({ to, resolve }) {
      const lv = LEVELS[+to.params.id - 1];
      resolve({ content: page('quiz', 'Kuis: ' + lv.pages[+to.params.p].title, '<div class="quiz-box"></div>') });
    }
  }
];

const app = new Framework7({
  el: '#app',
  name: 'Iqra',
  theme: 'auto',
  routes,
  on: {
    pageInit(p) {
      paint(p.el);
      if (p.name === 'quiz') startQuiz(p);
    },
    pageBeforeIn(p) {
      paint(p.el);
    }
  }
});
const toast = (text) => app.toast.create({ text, closeTimeout: 3000, position: 'center' }).open();

/* ===== interaksi ===== */
document.addEventListener('click', (e) => {
  const c = e.target.closest('.cell');
  if (c) {
    c.parentElement.querySelectorAll('.cell.on').forEach((x) => x.classList.remove('on'));
    c.classList.add('on');
    const st = c.closest('.wrap').querySelector('.status');
    if (st) st.textContent = c.dataset.r || '';
    say(c.dataset.t, c.dataset.a !== undefined ? +c.dataset.a : null);
    return;
  }
  const row = e.target.closest('.li-row');
  if (row) return say(row.dataset.t, null);

  const done = e.target.closest('.btn-done');
  if (done) {
    stopAll();
    S.done[done.dataset.key] = true;
    touchStreak();
    save();
    refreshRoots();
    const router = app.views.current.router;
    if (done.dataset.next) router.navigate(done.dataset.next, { reloadCurrent: true });
    else {
      toast('Bagian ini selesai. Barakallahu fiik!');
      router.back();
    }
    return;
  }

  const opt = e.target.closest('.q-opt');
  if (opt && Q && !Q.locked) {
    Q.locked = true;
    const ok = opt.dataset.v === Q.cur.r;
    if (ok) Q.score++;
    opt.classList.add(ok ? 'ok' : 'bad');
    if (!ok) Q.el.querySelectorAll('.q-opt').forEach((b) => b.dataset.v === Q.cur.r && b.classList.add('ok'));
    setTimeout(() => { Q.n++; Q.locked = false; renderQ(); }, ok ? 700 : 1400);
    return;
  }
  if (e.target.closest('.q-listen') && Q) return say(Q.cur.t, Q.pg.audio ? Q.cur.i : null);
  if (e.target.closest('.q-again') && Q) {
    Q.picks = shuffle(Q.pool).slice(0, 10);
    Q.n = 0; Q.score = 0; Q.locked = false;
    return renderQ();
  }

  const seg = e.target.closest('.seg-b');
  if (seg) {
    S.set.dark = seg.dataset.dark;
    save();
    applySettings();
    seg.parentElement.querySelectorAll('.seg-b').forEach((b) => b.classList.toggle('on', b === seg));
    return;
  }
  if (e.target.closest('#btn-reset')) {
    app.dialog.confirm('Hapus semua progres dan nilai kuis?', 'Reset progres', () => {
      S.done = {}; S.best = {}; S.streak = { last: '', n: 0 };
      save();
      refreshRoots();
      toast('Progres direset');
    });
  }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'set-size') {
    S.set.size = +e.target.value;
    document.getElementById('v-size').textContent = S.set.size + '%';
    applySettings();
    save();
  } else if (e.target.id === 'set-rate') {
    S.set.rate = +e.target.value;
    document.getElementById('v-rate').textContent = S.set.rate;
    save();
  }
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'set-sound') {
    S.set.sound = e.target.checked;
    save();
  }
});

/* tombol kembali Android (Capacitor) */
const capApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
if (capApp) {
  capApp.addListener('backButton', () => {
    const v = app.views.current;
    if (v && v.router.history.length > 1) v.router.back();
    else if (!document.getElementById('view-home').classList.contains('tab-active')) app.tab.show('#view-home');
    else capApp.exitApp();
  });
}

/* offline untuk versi web */
const native = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
if ('serviceWorker' in navigator && !native) navigator.serviceWorker.register('sw.js').catch(() => {});
