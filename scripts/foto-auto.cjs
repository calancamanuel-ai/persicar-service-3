// La foto di attesa dell'auto 3D: la stessa scena, fotografata nella posa da cui parte il 3D, sul fondo del riquadro.
// Si vede dal primo fotogramma finché three.js non è pronto; poi il 3D prende il suo posto e non cambia niente.
// Uso: npm run build, npx vite preview, poi node scripts/foto-auto.cjs (scrive public/img/auto-posa-*), di nuovo build.
// Va rifatta ogni volta che cambiano la forma, la luce o l'inquadratura dell'auto (src/js/auto3d/).
const { chromium } = require('playwright');
const sharp = require('sharp');
const path = require('path');

const BASE = process.argv[2] || 'http://127.0.0.1:4173';
const USCITA = path.join(__dirname, '..', 'public', 'img');
const LARGHEZZE = [616, 1232]; // il riquadro più largo è di 616 px (a 768 di schermo): una misura e il suo doppio

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  // a 768 px il riquadro dell'auto è il più largo (616 px); a pixel ratio 2 la scena si disegna a 1232 px
  const page = await browser.newPage({ viewport: { width: 768, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('[data-auto3d]')?.classList.contains('is-3d'), null, { timeout: 60000 });
  await page.addStyleTag({ content: '.zona { visibility: hidden !important; }' });
  await page.evaluate(() => scrollTo(0, 0));
  // ferma nella posa di riposo, con tutti i lavori tolti
  await page.waitForFunction(() => { const a = document.querySelector('[data-auto3d]').auto3d; return Math.abs(a.imbardata() - a.voluta()) < 0.001; });
  await page.waitForTimeout(500);
  const foto = await page.locator('[data-auto3d]').screenshot();
  const { width, height } = await sharp(foto).metadata();
  for (const w of LARGHEZZE) {
    const h = Math.round((height * w) / width);
    const base = sharp(foto).resize(w, h, { kernel: 'lanczos3' });
    await base.clone().avif({ quality: 62, effort: 9 }).toFile(path.join(USCITA, `auto-posa-${w}.avif`));
    await base.clone().webp({ quality: 82, effort: 6 }).toFile(path.join(USCITA, `auto-posa-${w}.webp`));
    console.log(`auto-posa-${w}: ${w}×${h}`);
  }
  console.log(`dalla scena a ${width}×${height}`);
  await browser.close();
})();
