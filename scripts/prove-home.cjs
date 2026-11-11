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
    await page.waitForTimeout(1500);
    const ripiego = await page.evaluate(() => ({ canvas: !!document.querySelector('canvas.auto3d'), svg: getComputedStyle(document.querySelector('svg.auto')).visibility }));
    ripiego.posa = await page.evaluate(() => getComputedStyle(document.querySelector('.auto__posa')).display);
    ok('reduced motion: niente 3D, resta il disegno', !ripiego.canvas && ripiego.svg === 'visible' && ripiego.posa === 'none', JSON.stringify(ripiego));
    const fermo = await page.evaluate(() => ({ classi: document.documentElement.className, entra: document.querySelectorAll('[data-entra]').length }));
    ok('reduced motion: niente entrate né scorrimento morbido', !/entrate|lenis/.test(fermo.classi) && fermo.entra === 0, JSON.stringify(fermo));
    await ctx.close();
  }

  // ---------- auto 3D ----------
  for (const [larghezza, mobile] of [[1440, false], [390, true]]) {
    const ctx = await browser.newContext({ viewport: { width: larghezza, height: 900 }, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const errori = [];
    page.on('pageerror', (e) => errori.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const pronto = await page.waitForFunction(() => document.querySelector('[data-auto3d]')?.classList.contains('is-3d'), null, { timeout: 30000 }).then(() => true, () => false);
    ok(`3D ${larghezza}: l'auto si monta dopo il caricamento`, pronto);
    const dopoMontata = await page.evaluate(() => ({ posa: getComputedStyle(document.querySelector('.auto__posa')).visibility, canvas: getComputedStyle(document.querySelector('canvas.auto3d') || document.body).opacity }));
    ok(`3D ${larghezza}: il 3D prende il posto della foto di attesa`, pronto && dopoMontata.posa === 'hidden' && dopoMontata.canvas === '1', JSON.stringify(dopoMontata));
    if (pronto) {
      await page.waitForTimeout(1500);
      // un tocco sull'auto, nel punto del cerchietto, spunta il lavoro come il bottone
      for (const voce of ['tagliando', 'gomme']) {
        const pos = await page.evaluate((v) => document.querySelector('[data-auto3d]').auto3d.posizione(v), voce);
        if (mobile) await page.touchscreen.tap(pos.x, pos.y); else await page.mouse.click(pos.x, pos.y);
        await page.waitForTimeout(300);
      }
      const spunte = await page.evaluate(() => ['tagliando', 'gomme'].map((v) => document.querySelector(`input[value="${v}"]`).checked));
      const wa = await page.locator('[data-whatsapp]').first().getAttribute('href');
      ok(`3D ${larghezza}: toccare l'auto spunta le caselle e scrive il messaggio`, spunte.every(Boolean) && /tagliando e gomme/.test(decodeURIComponent(wa)), JSON.stringify(spunte));
      // un trascinamento orizzontale gira l'auto e non spunta niente
      const prima = await page.evaluate(() => document.querySelector('[data-auto3d]').auto3d.imbardata());
      const box = await page.locator('canvas.auto3d').boundingBox();
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(900);
      const dopo = await page.evaluate(() => document.querySelector('[data-auto3d]').auto3d.imbardata());
      const ancora = await page.evaluate(() => document.querySelectorAll('input[name="lavori"]:checked').length);
      ok(`3D ${larghezza}: trascinare gira l'auto senza spuntare`, Math.abs(dopo - prima) > 0.3 && ancora === 2, `imbardata ${prima.toFixed(2)} → ${dopo.toFixed(2)}, spunte ${ancora}`);
      // la scena di scroll: mentre la scheda esce l'auto gira, e torna quando si risale
      const ferma = await page.evaluate(() => document.querySelector('[data-auto3d]').auto3d.voluta());
      await page.evaluate(() => scrollTo(0, 300));
      await page.waitForTimeout(400);
      const scorsa = await page.evaluate(() => document.querySelector('[data-auto3d]').auto3d.voluta());
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(400);
      const tornata = await page.evaluate(() => document.querySelector('[data-auto3d]').auto3d.voluta());
      ok(`3D ${larghezza}: l'auto gira mentre la scheda scorre via`, scorsa - ferma > 0.15 && Math.abs(tornata - ferma) < 0.01, `posa ${ferma.toFixed(2)} → ${scorsa.toFixed(2)} → ${tornata.toFixed(2)}`);
      const info = await page.evaluate(() => document.querySelector('[data-auto3d]').auto3d.info());
      ok(`3D ${larghezza}: meno di 60 chiamate di disegno`, info.chiamate < 60, JSON.stringify(info));
      const tocco = await page.locator('canvas.auto3d').evaluate((c) => getComputedStyle(c).touchAction);
      ok(`3D ${larghezza}: la pagina scorre anche sopra l'auto`, tocco === 'pan-y', tocco);
    }
    ok(`3D ${larghezza}: nessun errore in console`, errori.length === 0, errori.join(' | '));
    await ctx.close();
  }

  // ---------- movimento (fase 7) ----------
  for (const [larghezza, mobile] of [[1440, false], [390, true]]) {
    const ctx = await browser.newContext({ viewport: { width: larghezza, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const errori = [];
    page.on('pageerror', (e) => errori.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); });
    // la sequenza d'apertura, misurata a ogni fotogramma dal primo
    await page.addInitScript(() => {
      window.__apertura = null;
      const giro = () => {
        const parti = [...document.querySelectorAll('.hero .display .linea, .hero__titolo .lead, .hero__lavori')];
        if (parti.length === 4 && parti.every((e) => parseFloat(getComputedStyle(e).opacity) >= 0.99 && getComputedStyle(e).transform === 'none')) { window.__apertura = performance.now(); return; }
        if (performance.now() < 4000) requestAnimationFrame(giro);
      };
      requestAnimationFrame(giro);
    });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const apertura = await page.evaluate(() => ({ fine: window.__apertura, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime }));
    const durata = apertura.fine && apertura.fcp ? Math.round(apertura.fine - apertura.fcp) : null;
    ok(`movimento ${larghezza}: titolo, frase e scheda fermi entro 1,2 s dal primo fotogramma`, durata !== null && durata <= 1200, `${durata} ms`);

    // Lenis solo con mouse o trackpad
    const lenis = await page.evaluate(() => document.documentElement.classList.contains('lenis'));
    ok(`movimento ${larghezza}: scorrimento morbido ${mobile ? 'spento col tocco' : 'acceso col mouse'}`, lenis === !mobile, `lenis=${lenis}`);

    // le transizioni dei controlli: al massimo 300 ms, sempre con la curva dell'interfaccia (mai ease-in)
    const controlli = await page.evaluate(() => {
      const numeri = (c) => (c.match(/-?\d*\.?\d+/g) || []).map(Number).join(','); // ".23" e "0.23" sono la stessa curva
      const curva = numeri(getComputedStyle(document.documentElement).getPropertyValue('--ease-ui'));
      const fuori = [];
      for (const sel of ['.bottone', '.voce', '.voce__casella', '.zona', '.link', '.testata__link', '.testata-fissa', '.timbro--ricevuto', '.salta']) {
        for (const e of document.querySelectorAll(sel)) {
          const s = getComputedStyle(e);
          const durate = s.transitionDuration.split(',').map((d) => parseFloat(d) * (d.trim().endsWith('ms') ? 1 : 1000));
          const curve = s.transitionTimingFunction.replace(/\s+/g, '').split(/,(?![^(]*\))/);
          durate.forEach((d, i) => { if (d > 300 || (d > 0 && numeri(curve[i % curve.length]) !== curva)) fuori.push(`${sel} ${d}ms ${curve[i % curve.length]}`); });
        }
      }
      return [...new Set(fuori)];
    });
    ok(`movimento ${larghezza}: controlli sotto i 300 ms, curva dell'interfaccia`, controlli.length === 0, controlli.join(' | '));

    // uno scorrimento piano fino in fondo: ogni parte entra, niente resta nascosto
    const preparati = await page.evaluate(() => document.querySelectorAll('[data-entra]').length);
    const altezza = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= altezza; y += 250) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(90); }
    await page.waitForTimeout(1800);
    const rimasti = await page.evaluate(() => [...document.querySelectorAll('[data-entra]')].map((e) => `${e.dataset.entra} ${e.className || e.tagName}`));
    const trasparenti = await page.evaluate(() => [...document.querySelectorAll('main *, footer *')].filter((e) => e.offsetParent && !e.matches('input, .timbro--ricevuto, .timbro--ricevuto *') && parseFloat(getComputedStyle(e).opacity) < 0.99).map((e) => e.className || e.tagName));
    ok(`movimento ${larghezza}: dopo lo scorrimento tutte le parti sono entrate`, preparati > 20 && rimasti.length === 0 && trasparenti.length === 0, `preparate ${preparati}, rimaste ${rimasti.join(', ') || 0}, trasparenti ${trasparenti.join(', ') || 0}`);

    if (!mobile) {
      // un link della testata: scorre morbido, la sezione arriva sotto la testata fissa, il focus la segue
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(600);
      await page.locator('.hero .testata__link[href="#revisioni"]').click();
      await page.waitForTimeout(2500);
      const arrivo = await page.evaluate(() => {
        const s = document.querySelector('#revisioni').getBoundingClientRect();
        const t = document.querySelector('.testata-fissa').getBoundingClientRect();
        return { cima: Math.round(s.top), testata: Math.round(t.bottom), hash: location.hash, focus: document.activeElement?.id };
      });
      const margine = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#revisioni')).scrollMarginTop));
      ok('movimento 1440: il link "Revisioni" porta alla sezione, sotto la testata fissa', arrivo.hash === '#revisioni' && arrivo.focus === 'revisioni' && arrivo.cima >= arrivo.testata - 1 && Math.abs(arrivo.cima - margine) <= 2, JSON.stringify({ ...arrivo, margine }));
    }
    ok(`movimento ${larghezza}: nessun errore in console`, errori.length === 0, errori.join(' | '));
    await ctx.close();
  }

  // ---------- il titolo della scheda: sempre due righe, a ogni larghezza ----------
  {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const righe = [];
    for (const larghezza of [320, 390, 768, 1023, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width: larghezza, height: 900 });
      if (!righe.length) await page.goto(BASE + '/', { waitUntil: 'networkidle' });
      righe.push([larghezza, await page.evaluate(() => {
        // le righe vere sono le righe del testo: si contano le altezze distinte dei pezzi di testo
        const h = document.querySelector('.hero .display'); const cime = new Set();
        const giro = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
        for (let t = giro.nextNode(); t; t = giro.nextNode()) {
          if (!t.textContent.trim()) continue;
          const g = document.createRange(); g.selectNodeContents(t);
          for (const r of g.getClientRects()) if (r.width > 1) cime.add(Math.round(r.top));
        }
        return cime.size;
      })]);
    }
    ok('titolo della scheda su due righe a ogni larghezza', righe.every(([, n]) => n === 2), righe.map(([w, n]) => `${w}:${n}`).join(' '));
    await ctx.close();
  }

  // ---------- la foto di attesa del 3D: dal primo fotogramma, al posto del disegno ----------
  for (const [larghezza, mobile] of [[1440, false], [390, true]]) {
    const ctx = await browser.newContext({ viewport: { width: larghezza, height: 900 }, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    await page.route('**/scena-*.js', (r) => new Promise(() => {})); // three.js non arriva mai: si guarda l'attesa
    await page.goto(BASE + '/', { waitUntil: 'load' });
    const attesa = await page.evaluate(() => {
      const img = document.querySelector('.auto__posa img');
      return { classe: document.documentElement.classList.contains('auto-3d'), posa: getComputedStyle(document.querySelector('.auto__posa')).display, foto: img.complete && img.naturalWidth > 0, disegno: getComputedStyle(document.querySelector('svg.auto')).visibility };
    });
    ok(`3D ${larghezza}: finché il 3D non c'è si vede la sua foto, non il disegno`, attesa.classe && attesa.posa === 'block' && attesa.foto && attesa.disegno === 'hidden', JSON.stringify(attesa));
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
    const disegno = await page.evaluate(() => ({ svg: getComputedStyle(document.querySelector('svg.auto')).visibility, posa: getComputedStyle(document.querySelector('.auto__posa')).display }));
    ok('senza JS: resta il disegno, niente foto di attesa', disegno.svg === 'visible' && disegno.posa === 'none', JSON.stringify(disegno));
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(300);
    const coperti = await page.evaluate(() => [...document.querySelectorAll('main h1, main h2, main p, main figure, main picture, main li, main tr, footer p, footer li, .timbro:not(.timbro--ricevuto)')].filter((e) => { const s = getComputedStyle(e); return parseFloat(s.opacity) < 0.99 || s.transform !== 'none' && !e.matches('.timbro') || s.clipPath !== 'none'; }).map((e) => e.className || e.tagName));
    ok('senza JS: nessuna parte resta nascosta in attesa di un\'entrata', coperti.length === 0, coperti.join(', '));
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
