// Prove funzionali della home sulla build: npm run build, npx vite preview, poi node scripts/prove-home.cjs.
// Usa il Playwright e il Chromium preinstallati (/opt/pw-browsers/chromium), niente playwright install.
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:4173';
const NUMERO = 'https://wa.me/393667212576';
const risultati = [];
const ok = (nome, cond, dettaglio = '') => risultati.push({ nome, ok: !!cond, dettaglio });

const testoWa = (href) => { const u = new URL(href); return u.searchParams.get('text'); };

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });

  // ---------- computer ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'it-IT' });
    const page = await ctx.newPage();
    const errori = [];
    page.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); });
    page.on('pageerror', (e) => errori.push(String(e)));
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });

    // ogni zona spunta la casella giusta, e la togli col secondo tocco
    for (const voce of ['luci', 'tagliando', 'revisione', 'freni', 'gomme']) {
      const zona = page.locator(`.zona[data-voce="${voce}"]`);
      const casella = page.locator(`input[data-parola][value="${voce}"], input[name][value="${voce}"]`).first();
      await zona.click();
      const spuntata = await casella.isChecked();
      const premuta = await zona.getAttribute('aria-pressed');
      const punto = await page.locator(`.auto__punto[data-voce="${voce}"]`).evaluate((el) => el.classList.contains('is-scelto'));
      await zona.click();
      const tolta = !(await casella.isChecked()) && (await zona.getAttribute('aria-pressed')) === 'false';
      ok(`zona ${voce} → casella`, spuntata && premuta === 'true' && punto && tolta, `spuntata=${spuntata} aria-pressed=${premuta} punto=${punto} tolta=${tolta}`);
    }

    // la casella aggiorna anche la zona
    await page.locator('label:has(input[value="freni"])').click();
    ok('casella freni → zona premuta', (await page.locator('.zona[data-voce="freni"]').getAttribute('aria-pressed')) === 'true');
    await page.locator('label:has(input[value="freni"])').click();

    // messaggi WhatsApp
    const href = () => page.locator('.hero__azioni [data-whatsapp]').getAttribute('href');
    let h = await href();
    ok('wa.me senza lavori', h.startsWith(NUMERO) && testoWa(h) === "Buongiorno, vorrei prenotare un intervento. Quando posso portarvi l'auto?", testoWa(h));
    await page.locator('.zona[data-voce="revisione"]').click();
    h = await href();
    ok('wa.me solo revisione', /revisione/.test(testoWa(h)) && /Quando posso passare\?$/.test(testoWa(h)), testoWa(h));
    await page.locator('.zona[data-voce="tagliando"]').click();
    h = await href();
    ok('wa.me tagliando + revisione', /tagliando e revisione/i.test(testoWa(h)) && h.startsWith(NUMERO + '?text='), testoWa(h));
    const riepilogo = await page.locator('[data-riepilogo]').innerText();
    ok('riepilogo aria-live', /tagliando/i.test(riepilogo) && (await page.locator('[data-riepilogo]').getAttribute('aria-live')) !== null, riepilogo);
    const tuttiWa = await page.locator('[data-whatsapp]').evaluateAll((els) => els.map((e) => e.href));
    ok('tutti i link WhatsApp hanno il messaggio', tuttiWa.every((x) => x.startsWith(NUMERO + '?text=')), `${tuttiWa.length} link`);
    const ricevuto = await page.locator('.timbro--ricevuto').evaluate((el) => getComputedStyle(el).opacity);
    ok('timbro Ricevuto visibile con una spunta', parseFloat(ricevuto) > 0.5, `opacity=${ricevuto}`);

    // un timbro per schermata: conta i timbri visibili in ogni schermata
    const altezza = await page.evaluate(() => document.documentElement.scrollHeight);
    let massimo = 0;
    for (let y = 0; y < altezza; y += 450) {
      await page.evaluate((y) => scrollTo(0, y), y);
      const n = await page.evaluate(() => [...document.querySelectorAll('.timbro')].filter((t) => {
        const r = t.getBoundingClientRect(); const s = getComputedStyle(t);
        return r.bottom > 0 && r.top < innerHeight && parseFloat(s.opacity) > 0.1 && s.display !== 'none';
      }).length);
      massimo = Math.max(massimo, n);
    }
    ok('al massimo un timbro per schermata (1440)', massimo <= 1, `massimo=${massimo}`);

    // telefono: tutti i tel: giusti
    const tel = await page.locator('a[href^="tel:"]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('href')))]);
    ok('Chiama è un tel: giusto', tel.length === 1 && tel[0] === 'tel:+390516871521', tel.join(' '));

    // testata fissa dopo l'hero
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(300);
    const primaNascosta = await page.locator('.testata-fissa').evaluate((el) => !el.classList.contains('is-visibile'));
    await page.evaluate(() => scrollTo(0, document.querySelector('#lavori').offsetTop + 200));
    await page.waitForTimeout(500);
    const poiVisibile = await page.locator('.testata-fissa').evaluate((el) => el.classList.contains('is-visibile') && el.getAttribute('aria-hidden') !== 'true');
    ok('testata fissa compare dopo l\'hero', primaNascosta && poiVisibile, `prima nascosta=${primaNascosta} poi visibile=${poiVisibile}`);

    // stato aperto/chiuso
    const stato = await page.locator('[data-stato]').first().innerText();
    ok('stato aperto/chiuso scritto', /^(Aperto|Chiuso)/.test(stato.trim()), stato.trim());

    // tastiera: tab fino alla prima zona, Invio la spunta, focus visibile
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator('.zona[data-voce="tagliando"]').click(); await page.locator('.zona[data-voce="revisione"]').click(); // azzera
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    let trovata = false, focusVisibile = false;
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(() => { const a = document.activeElement; const s = getComputedStyle(a); return { voce: a.dataset?.voce, cls: a.className, outline: s.outlineStyle + ' ' + s.outlineWidth }; });
      if (f.voce === 'luci' && /zona/.test(f.cls)) { trovata = true; focusVisibile = !/^none/.test(f.outline); break; }
    }
    if (trovata) await page.keyboard.press('Enter');
    const daTastiera = trovata && (await page.locator('input[value="luci"]').isChecked());
    ok('zona usabile da tastiera, focus visibile', daTastiera && focusVisibile, `trovata=${trovata} focus=${focusVisibile}`);
    await page.keyboard.press('Space');
    // casella da tastiera
    await page.locator('input[value="clima"]').focus();
    await page.keyboard.press('Space');
    ok('casella usabile da tastiera', await page.locator('input[value="clima"]').isChecked());
    const linkSalta = await page.evaluate(() => !!document.querySelector('a.salta[href="#contenuto"]') && !!document.getElementById('contenuto'));
    ok('link "Vai al contenuto"', linkSalta);

    ok('nessun errore in console (1440)', errori.length === 0, errori.join(' | '));
    await ctx.close();
  }

  // ---------- telefono ----------
  for (const larghezza of [390, 320]) {
    const ctx = await browser.newContext({ viewport: { width: larghezza, height: 844 }, locale: 'it-IT', hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errori = [];
    page.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); });
    page.on('pageerror', (e) => errori.push(String(e)));
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const larga = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`nessuno scorrimento orizzontale a ${larghezza}`, larga <= 0, `in più: ${larga}px`);
    if (larghezza === 390) {
      const barra = page.locator('[data-barra]');
      const etichettaPrima = (await barra.innerText()).trim();
      await page.locator('.zona[data-voce="freni"]').tap();
      await page.locator('label:has(input[value="gomme"])').tap();
      const etichettaDopo = (await barra.innerText()).trim();
      const h = await barra.getAttribute('href');
      ok('barra del pollice: testo e link cambiano', etichettaPrima === 'Scrivici su WhatsApp' && /2 lavori/.test(etichettaDopo) && /freni e gomme/i.test(testoWa(h)), `${etichettaPrima} → ${etichettaDopo} · ${testoWa(h)}`);
      const doppioni = await page.evaluate(() => [...document.querySelectorAll('.hero__foglio .bottone, .orari .bottone--whatsapp')].filter((b) => getComputedStyle(b).display !== 'none' && b.offsetParent !== null).map((b) => b.textContent.trim()));
      ok('nessun bottone doppione della barra nella scheda (390)', doppioni.length === 0, doppioni.join(', '));
      const bersagli = await page.evaluate(() => [...document.querySelectorAll('.barra-pollice a, .zona, .voce')].map((e) => e.getBoundingClientRect()).filter((r) => r.width).map((r) => Math.min(r.width, r.height)));
      ok('bersagli di almeno 44px', bersagli.every((x) => x >= 44), `minimo ${Math.min(...bersagli).toFixed(1)}px`);
      const fondo = await page.evaluate(() => { scrollTo(0, document.documentElement.scrollHeight); const b = document.querySelector('.barra-pollice').getBoundingClientRect(); const ultimo = document.querySelector('.piede__imprint').getBoundingClientRect(); return { barraTop: b.top, imprintBottom: ultimo.bottom }; });
      ok('la barra non copre la fine della pagina', fondo.imprintBottom <= fondo.barraTop, JSON.stringify(fondo));
      // un timbro per schermata
      const altezza = await page.evaluate(() => document.documentElement.scrollHeight);
      let massimo = 0;
      for (let y = 0; y < altezza; y += 300) {
        await page.evaluate((y) => scrollTo(0, y), y);
        const n = await page.evaluate(() => [...document.querySelectorAll('.timbro')].filter((t) => { const r = t.getBoundingClientRect(); const s = getComputedStyle(t); return r.bottom > 0 && r.top < innerHeight && parseFloat(s.opacity) > 0.1; }).length);
        massimo = Math.max(massimo, n);
      }
      ok('al massimo un timbro per schermata (390)', massimo <= 1, `massimo=${massimo}`);
    }
    ok(`nessun errore in console (${larghezza})`, errori.length === 0, errori.join(' | '));
    await ctx.close();
  }

  // ---------- reduced motion ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const nascosti = await page.evaluate(() => [...document.querySelectorAll('main h1, main h2, main p, main figure, main .voce, main .zona')].filter((e) => {
      const s = getComputedStyle(e); return s.display !== 'none' && (parseFloat(s.opacity) < 0.99 || s.visibility === 'hidden') && !e.closest('[hidden]');
    }).length);
    ok('reduced motion: tutto visibile', nascosti === 0, `${nascosti} elementi trasparenti`);
    await ctx.close();
  }

  // ---------- senza JavaScript ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'load' });
    const zoneVisibili = await page.locator('.zona').evaluateAll((els) => els.filter((e) => getComputedStyle(e).display !== 'none').length);
    const caselle = await page.locator('.voce').count();
    const wa = await page.locator('[data-barra]').getAttribute('href');
    ok('senza JS: caselle visibili, zone nascoste, WhatsApp funziona', zoneVisibili === 0 && caselle === 8 && wa === NUMERO, `zone=${zoneVisibili} caselle=${caselle} wa=${wa}`);
    await ctx.close();
  }

  // ---------- pagine di servizio ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    for (const p of ['/privacy.html', '/cookie.html', '/404.html']) {
      const r = await page.goto(BASE + p);
      const larga = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const home = await page.locator('a[href="/"]').count();
      ok(`${p} risponde, torna alla home, niente scorrimento orizzontale`, r.status() === 200 && home >= 1 && larga <= 0, `status=${r.status()} link=${home} largo=${larga}`);
    }
    const links = await (await page.goto(BASE + '/')) && await page.locator('a[href="/privacy.html"], a[href="/cookie.html"]').count();
    ok('il footer porta a privacy e cookie', links === 2, `${links}`);
    await ctx.close();
  }

  await browser.close();
  const falliti = risultati.filter((r) => !r.ok);
  for (const r of risultati) console.log(`${r.ok ? 'OK  ' : 'NO  '} ${r.nome}${r.dettaglio ? '  — ' + r.dettaglio : ''}`);
  console.log(`\n${risultati.length - falliti.length}/${risultati.length} prove passate`);
  process.exit(falliti.length ? 1 : 0);
})();
