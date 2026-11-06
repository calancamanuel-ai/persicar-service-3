// Genera le foto del sito: AVIF e WebP, una misura per telefono e una per computer.
// Regola: mai più grandi dell'originale (niente ingrandimenti), solo riduzioni.
//
//   node scripts/foto.mjs [cartella-sorgente] [cartella-uscita]
//   default: materiale/foto-scelte -> public/img
//
// Per ogni sorgente <nome>.webp|png|jpg scrive <nome>-640.avif, <nome>-640.webp (telefono)
// e <nome>-<larghezza>.avif / .webp (computer, larghezza piena dell'originale fino a 1464 px),
// poi stampa una tabella dei pesi e salva public/img/foto.json con misure e pesi.
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const src = process.argv[2] || 'materiale/foto-scelte';
const out = process.argv[3] || 'public/img';
const TELEFONO = 640;
const COMPUTER_MAX = 1464;
const AVIF = { quality: 52, effort: 6, chromaSubsampling: '4:2:0' };
const WEBP = { quality: 74, effort: 6 };

await mkdir(out, { recursive: true });
const files = (await readdir(src)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
const report = [];
const kb = (n) => Math.round(n / 1024);

for (const f of files) {
  const { name } = parse(f);
  const input = sharp(join(src, f));
  const { width, height } = await input.metadata();
  const sizes = [...new Set([Math.min(TELEFONO, width), Math.min(COMPUTER_MAX, width)])];
  const row = { nome: name, originale: `${width}×${height}`, varianti: [] };
  for (const w of sizes) {
    const h = Math.round((height * w) / width);
    const base = sharp(join(src, f)).resize({ width: w, withoutEnlargement: true });
    const a = join(out, `${name}-${w}.avif`);
    const b = join(out, `${name}-${w}.webp`);
    await base.clone().avif(AVIF).toFile(a);
    await base.clone().webp(WEBP).toFile(b);
    row.varianti.push({ larghezza: w, altezza: h, avif: (await stat(a)).size, webp: (await stat(b)).size });
  }
  report.push(row);
}

await writeFile(join(out, 'foto.json'), JSON.stringify(report, null, 1));
let totA = 0, totW = 0;
console.log('foto'.padEnd(22), 'originale'.padEnd(11), 'variante'.padEnd(10), 'AVIF KB'.padStart(8), 'WebP KB'.padStart(8));
for (const r of report) for (const v of r.varianti) {
  totA += v.avif; totW += v.webp;
  console.log(r.nome.padEnd(22), r.originale.padEnd(11), `${v.larghezza}×${v.altezza}`.padEnd(10), String(kb(v.avif)).padStart(8), String(kb(v.webp)).padStart(8));
}
console.log('totale'.padEnd(44), String(kb(totA)).padStart(8), String(kb(totW)).padStart(8));
