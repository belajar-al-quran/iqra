import Framework7 from 'framework7/lite-bundle';
import 'framework7/css/bundle';
import './style.css';
import { App as CapApp } from '@capacitor/app';

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

const HURUF = [
  ['ا', 'Alif'], ['ب', 'Ba'], ['ت', 'Ta'], ['ث', 'Tsa'], ['ج', 'Jim'], ['ح', 'Ha'], ['خ', 'Kha'],
  ['د', 'Dal'], ['ذ', 'Dzal'], ['ر', 'Ra'], ['ز', 'Zai'], ['س', 'Sin'], ['ش', 'Syin'], ['ص', 'Shad'],
  ['ض', 'Dhad'], ['ط', 'Tha'], ['ظ', 'Zha'], ['ع', 'Ain'], ['غ', 'Ghain'], ['ف', 'Fa'], ['ق', 'Qaf'],
  ['ك', 'Kaf'], ['ل', 'Lam'], ['م', 'Mim'], ['ن', 'Nun'], ['و', 'Wawu'], ['ه', 'Ha (ه)'], ['ي', 'Ya']
];

let quranCache = null;
let audioFiles = [];
const loadJSON = (u) => fetch(u).then((r) => r.json());
const loadQuran = () =>
  quranCache ? Promise.resolve(quranCache) : loadJSON('./data/quran.json').then((d) => (quranCache = d));
const loadAudio = () =>
  loadJSON('./data/audio.json').catch(() => []).then((d) => (audioFiles = d));

const base = (f) => f.replace(/\.[^.]+$/, '').toLowerCase();
function audioFor(i) {
  const name = HURUF[i][1].toLowerCase();
  const byName = audioFiles.find((f) => base(f) === name);
  if (byName && name !== 'ha') return byName;
  if (audioFiles.length === HURUF.length && audioFiles.every((f) => /^\d+$/.test(base(f)))) return audioFiles[i];
  return byName || null;
}

const fail = (resolve) => () =>
  resolve({ content: page('Gagal', '<div class="block">Data belum tersedia.</div>') });

const routes = [
  {
    path: '/',
    content: page(
      'Iqra',
      `<div class="list inset"><ul>
        <li><a href="/huruf/" class="item-link item-content"><div class="item-inner"><div class="item-title">Huruf Hijaiyah</div></div></a></li>
        <li><a href="/quran/" class="item-link item-content"><div class="item-inner"><div class="item-title">Al-Qur'an</div></div></a></li>
        <li><a href="/tentang/" class="item-link item-content"><div class="item-inner"><div class="item-title">Tentang</div></div></a></li>
      </ul></div>`,
      false
    )
  },
  {
    path: '/huruf/',
    async: function ({ resolve }) {
      loadAudio().then(() => {
        const grid = HURUF.map(
          (h, i) => `<button class="huruf-btn" data-i="${i}"><div class="ar">${h[0]}</div><small>${esc(h[1])}</small></button>`
        ).join('');
        resolve({ content: page('Huruf Hijaiyah', `<div class="status"></div><div class="huruf-grid">${grid}</div>`) });
      });
    }
  },
  {
    path: '/quran/',
    async: function ({ resolve }) {
      loadQuran()
        .then((q) => {
          const items = q
            .map(
              (s) => `<li class="surah-item" data-k="${esc((s.n + ' ' + s.l + ' ' + s.t).toLowerCase())}">
              <a href="/surah/${s.n}/" class="item-link item-content">
                <div class="item-inner">
                  <div class="item-title">${s.n}. ${esc(s.l)}<div class="item-footer">${esc(s.t)} · ${s.y.length} ayat</div></div>
                  <div class="item-after ar ar-name">${esc(s.a)}</div>
                </div>
              </a></li>`
            )
            .join('');
          resolve({
            content: page(
              "Al-Qur'an",
              `<div class="block" style="margin-bottom:0"><input id="cari" type="search" placeholder="Cari surah..." style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(128,128,128,.4)"></div>
               <div class="list"><ul>${items}</ul></div>`
            )
          });
        })
        .catch(fail(resolve));
    }
  },
  {
    path: '/surah/:n/',
    async: function ({ to, resolve }) {
      loadQuran()
        .then((q) => {
          const s = q[+to.params.n - 1];
          const bism = s.n !== 1 && s.n !== 9 ? '<div class="bismillah ar">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>' : '';
          const ayat = s.y
            .map(
              (a, i) => `<div class="ayat"><div class="ar">${esc(a[0])} <span class="no">﴿${i + 1}﴾</span></div><div class="trj">${esc(a[1])}</div></div>`
            )
            .join('');
          resolve({
            content: page(
              s.l,
              `<div class="block"><div class="sur-ar ar">${esc(s.a)}</div><p style="text-align:center;margin:4px 0">${esc(s.t)} · ${s.y.length} ayat</p></div>${bism}${ayat}`
            )
          });
        })
        .catch(fail(resolve));
    }
  },
  {
    path: '/tentang/',
    content: page(
      'Tentang',
      `<div class="block">
        <p>Iqra: belajar huruf Hijaiyah dan membaca Al-Qur'an, bisa dipakai tanpa internet.</p>
        <p>Audio dan font huruf berasal dari proyek <b>belajar-ngaji</b> oleh awahids (lisensi MIT).</p>
        <p>Teks Al-Qur'an dan terjemahan Indonesia dari api.alquran.cloud.</p>
      </div>`
    )
  }
];

const app = new Framework7({ el: '#app', name: 'Iqra', theme: 'auto', routes });
const view = app.views.create('.view-main', { url: '/' });

let player;
document.addEventListener('click', (e) => {
  const b = e.target.closest('.huruf-btn');
  if (!b) return;
  const i = +b.dataset.i;
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
});

document.addEventListener('input', (e) => {
  if (e.target.id !== 'cari') return;
  const q = e.target.value.trim().toLowerCase();
  document.querySelectorAll('.page-current .surah-item').forEach((li) => {
    li.style.display = li.dataset.k.includes(q) ? '' : 'none';
  });
});

CapApp.addListener('backButton', () => {
  if (view.router.history.length > 1) view.router.back();
  else CapApp.exitApp();
});
