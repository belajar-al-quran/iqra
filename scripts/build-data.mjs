import { mkdir, writeFile, readdir } from 'node:fs/promises';

const strip = (s) => s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');

async function get(ed) {
  const r = await fetch(`https://api.alquran.cloud/v1/quran/${ed}`);
  if (!r.ok) throw new Error(`${ed}: HTTP ${r.status}`);
  return (await r.json()).data.surahs;
}

const [ar, id] = await Promise.all([get('quran-uthmani'), get('id.indonesian')]);

const out = ar.map((s, i) => ({
  n: s.number,
  a: s.name,
  l: s.englishName,
  t: s.englishNameTranslation,
  v: s.revelationType,
  y: s.ayahs.map((ay, j) => {
    let t = ay.text;
    if (j === 0 && s.number !== 1 && s.number !== 9) {
      const w = t.split(' ');
      if (strip(w[0]) === 'بسم') t = w.slice(4).join(' ');
    }
    return [t, id[i].ayahs[j].text];
  })
}));

await mkdir('public/data', { recursive: true });
await writeFile('public/data/quran.json', JSON.stringify(out));

let files = [];
try {
  files = (await readdir('public/audio'))
    .filter((f) => f.endsWith('.ogg'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
} catch {}
await writeFile('public/data/audio.json', JSON.stringify(files));

console.log(`Surah: ${out.length}, audio: ${files.length}`);
