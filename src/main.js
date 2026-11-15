import Framework7 from 'framework7/lite-bundle';
import 'framework7/css/bundle';
import './style.css';
import { App as CapApp } from '@capacitor/app';
import { LEVELS, HURUF, forms } from './iqra.js';

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const page = (title, body, back = true) => `
<div class="page">
  <div class="navbar"><div class="navbar-bg"></div>
    <div class="navbar-inner sliding">
      ${back ? '<div class="left"><a class="link back"><i class="icon icon-back"></i><span class="if-not-md">Kembali</span></a></div>' : ''}
      <div class="title">${esc(title)}</div>
    </div>
  </div>
  <div class="page-content">${body}</div>
</div>`;

/* progres */
const KEY = 'iqra-progress';
let prog = {};
try { prog = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch {}
const isDone = (k) => !!prog[k];
const setDone = (k) => {
  prog[k] = true;
  try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch {}
};
const lvDone = (lv) => lv.pages.filter((_, i) => isDone(`${lv.id}-${i}`)).length;

function paint(root) {
  root.querySelectorAll('[data-lv]').forEach((el) => {
    const lv = LEVELS[+el.dataset.lv - 1];
    el.textContent = `${lvDone(lv)}/${lv.pages.length}`;
  });
  root.querySelectorAll('[data-pg]').forEach((el) => {
    el.textContent = isDone(el.dataset.pg) ? '✓' : '';
  });
}

/* audio huruf */
let audioFiles = [];
fetch('./data/audio.json').then((r) => r.json()).then((d) => (audioFiles = d)).catch(() => {});
const base = (f) => f.replace(/\.[^.]+$/, '').toLowerCase();
function audioFor(i) {
  const name = HURUF[i][1].toLowerCase();
  const byName = audioFiles.find((f) => base(f) === name);
  if (byName && name !== 'ha') return byName;
  if (audioFiles.length === HURUF.length && audioFiles.every((f) => /^\d+$/.test(base(f)))) return audioFiles[i];
  return byName || null;
}

/* isi halaman */
function lessonBody(lv, pi) {
  const pg = lv.pages[pi];
  let body = `<div class="block"><p class="lv-sub">${esc(lv.title)} · Halaman ${pi + 1}/${lv.pages.length}</p>${pg.note ? `<p>${esc(pg.note)}</p>` : ''}<div class="status"></div></div>`;

  if (pg.kind === 'grid') {
    body += `<div class="cells c${pg.cols}">${pg.items
      .map(
        (c, i) => `<button class="cell"${pg.audio ? ` data-a="${i}"` : ''}><div class="ar">${esc(c.t)}</div>${c.s ? `<small>${esc(c.s)}</small>` : ''}</button>`
      )
      .join('')}</div>`;
  } else if (pg.kind === 'forms') {
    body += `<div class="forms"><b>Huruf</b><b>Sendiri</b><b>Awal</b><b>Tengah</b><b>Akhir</b>${HURUF.map(
      ([c, n]) => `<span>${esc(n)}</span>${forms(c).map((f) => `<span class="ar">${esc(f)}</span>`).join('')}`
    ).join('')}</div>`;
  } else {
    body += `<div class="list"><ul>${pg.items
      .map(
        (c) => `<li class="item-content"><div class="item-inner"><div class="item-title">${esc(c.s)}</div><div class="item-after ar">${esc(c.t)}</div></div></li>`
      )
      .join('')}</ul></div>`;
  }

  const next = pi + 1 < lv.pages.length ? `/level/${lv.id}/${pi + 1}/` : '';
  body += `<div class="block"><button class="button button-large button-fill btn-done" data-key="${lv.id}-${pi}" data-next="${next}">${next ? 'Selesai, lanjut' : 'Selesai'}</button></div>`;
  return page(pg.title, body);
}

const routes = [
  {
    path: '/',
    content: page(
      'Iqra',
      `<div class="level-list">${LEVELS.map(
        (lv) => `<a href="/level/${lv.id}/" class="level-card">
          <div class="lv-no">${lv.id}</div>
          <div class="lv-txt"><b>Level ${lv.id} – ${esc(lv.title)}</b><span>${esc(lv.desc)}</span></div>
          <div class="lv-prog" data-lv="${lv.id}"></div></a>`
      ).join('')}</div>
      <div class="block" style="text-align:center"><a href="/tentang/">Tentang aplikasi</a></div>`,
      false
    )
  },
  {
    path: '/level/:id/',
    async: function ({ to, resolve }) {
      const lv = LEVELS[+to.params.id - 1];
      resolve({
        content: page(
          lv.title,
          `<div class="list"><ul>${lv.pages
            .map(
              (pg, i) => `<li><a href="/level/${lv.id}/${i}/" class="item-link item-content"><div class="item-inner"><div class="item-title">${i + 1}. ${esc(pg.title)}</div><div class="item-after" data-pg="${lv.id}-${i}"></div></div></a></li>`
            )
            .join('')}</ul></div>`
        )
      });
    }
  },
  {
    path: '/level/:id/:p/',
    async: function ({ to, resolve }) {
      const lv = LEVELS[+to.params.id - 1];
      resolve({ content: lessonBody(lv, +to.params.p) });
    }
  },
  {
    path: '/tentang/',
    content: page(
      'Tentang',
      `<div class="block">
        <p>Iqra: belajar membaca huruf Hijaiyah bertahap dari Jilid 1 sampai Jilid 6, bisa dipakai tanpa internet.</p>
        <p>Audio dan font huruf berasal dari proyek <b>belajar-ngaji</b> oleh awahids (lisensi MIT).</p>
      </div>`
    )
  }
];

const app = new Framework7({ el: '#app', name: 'Iqra', theme: 'auto', routes });
const view = app.views.create('.view-main', { url: '/' });
app.on('pageInit', (p) => paint(p.el));
app.on('pageBeforeIn', (p) => paint(p.el));

let player;
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-a]');
  if (b) {
    const i = +b.dataset.a;
    const f = audioFor(i);
    const st = document.querySelector('.page-current .status');
    if (!f) {
      if (st) st.textContent = 'Audio untuk huruf ini belum terhubung.';
      return;
    }
    if (st) st.textContent = HURUF[i][1];
    if (player) player.pause();
    player = new Audio('./audio/' + encodeURIComponent(f));
    player.play().catch(() => {});
    return;
  }
  const d = e.target.closest('.btn-done');
  if (d) {
    setDone(d.dataset.key);
    if (d.dataset.next) view.router.navigate(d.dataset.next, { reloadCurrent: true });
    else view.router.back();
  }
});

CapApp.addListener('backButton', () => {
  if (view.router.history.length > 1) view.router.back();
  else CapApp.exitApp();
});
