import { mkdir, writeFile, readdir } from 'node:fs/promises';

await mkdir('public/data', { recursive: true });

let files = [];
try {
  files = (await readdir('public/audio'))
    .filter((f) => f.endsWith('.ogg'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
} catch {}

await writeFile('public/data/audio.json', JSON.stringify(files));
console.log(`Audio: ${files.length}`);
