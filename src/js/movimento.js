// Movimento: legge i token da tokens.css, fa entrare le parti delle sezioni una volta sola e, su computer,
// accende lo scorrimento morbido (Lenis). Tempi, curve e distanze stanno tutti in tokens.css: qui non c'è
// scritto nessun numero del movimento. Le regole e le eccezioni sono in docs/movimento.md.

const radice = document.documentElement;
export const token = (nome) => getComputedStyle(radice).getPropertyValue(nome).trim();
export const numero = (nome) => parseFloat(token(nome));
/** un tempo dei token in millisecondi ("240ms" → 240, "0.9s" → 900) */
export const tempo = (nome) => { const v = token(nome); return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000; };

const ridotto = matchMedia('(prefers-reduced-motion: reduce)');
export const movimentoRidotto = () => ridotto.matches;

// La coreografia, sezione per sezione: selettore, modo d'entrata e, se serve, l'elemento che la fa partire
// (per le foto è la figura intera, così la didascalia segue la sua foto). I modi sono in movimento.css.
const COREOGRAFIA = [
  // Cosa facciamo: il listino. Il foglio resta fermo, entra quello che c'è scritto sopra.
  ['#titolo-lavori', 'righe'],
  ['.lavori__testa > p', 'sale'],
  ['.listino__gruppo', 'fila'],
  ['.lavori__spillata', 'sale'],
  // Dal lavoro di tutti i giorni: le tessere si posano, il cartellino segue la sua foto
  ['#titolo-galleria', 'righe'],
  ['.galleria__testa .lead', 'sale'],
  ['.galleria__foto picture', 'sale', 'figure'],
  ['.galleria__foto .cartellino', 'fila', 'figure'],
  // Revisioni: i fatti in fila, la foto del ponte, lo scontrino che esce
  ['#titolo-revisioni', 'righe'],
  ['.revisioni__testo > .lead', 'sale'],
  ['.revisioni__fatti > div', 'fila'],
  ['.revisioni__foto picture', 'sale', 'figure'],
  ['.revisioni__foto figcaption', 'fila', 'figure'],
  ['.revisioni__ricevuta', 'stampa'],
  // L'officina, sul campo scuro: la lettera arriva un paragrafo alla volta, mentre si legge
  ['.officina__logo', 'sale'],
  ['#titolo-officina', 'righe'],
  ['.officina__lettera > p', 'fila'],
  ['.officina__foto picture', 'sale', 'figure'],
  ['.officina__foto figcaption', 'fila', 'figure'],
  ['.officina__recensioni', 'sale'],
  // Orari e dove siamo: il biglietto si compila riga per riga
  ['#titolo-orari', 'righe'],
  ['.orari__indirizzo', 'sale'],
  ['.orari__tabella tr', 'fila'],
  ['.orari__biglietto > .stato, .orari__contatti, .orari__mappa, .orari__azioni', 'fila'],
  ['.orari__foto picture', 'sale', 'figure'],
  ['.orari__foto figcaption', 'fila', 'figure'],
  // Il retro della cartolina: il saluto, i contatti, e per ultimo il timbro che si posa
  ['.piede__saluto > *', 'sale'],
  ['.piede__lista > li', 'fila'],
  ['.piede__timbro', 'timbro'],
];
const PASSI_MASSIMI = 3; // al massimo quattro passi in una sequenza (0–3)

// righe: il titolo diviso nelle righe in cui è andato a capo; alla fine torna testo semplice
function dividiInRighe(el) {
  const testo = el.textContent.trim().replace(/\s+/g, ' ');
  el.dataset.testo = testo;
  el.textContent = '';
  const parole = testo.split(' ').map((p) => {
    const s = document.createElement('span');
    s.style.display = 'inline-block';
    s.textContent = p;
    el.append(s, ' ');
    return s;
  });
  const righe = [];
  for (const p of parole) {
    const ultima = righe.at(-1);
    if (ultima && Math.abs(ultima.cima - p.offsetTop) < 4) ultima.parole.push(p.textContent);
    else righe.push({ cima: p.offsetTop, parole: [p.textContent] });
  }
  el.textContent = '';
  righe.forEach((r, i) => {
    const linea = document.createElement('span');
    linea.className = 'linea';
    linea.style.setProperty('--r', i);
    linea.textContent = r.parole.join(' ');
    el.append(linea, ' ');
  });
}
const rimettiTesto = (el) => { if (el.dataset.testo) { el.textContent = el.dataset.testo; delete el.dataset.testo; } };

// a entrata finita l'elemento torna com'era: niente attributi né ritardi lasciati in giro
function pulisci(el) {
  if (el.dataset.entra === 'righe') rimettiTesto(el);
  el.removeAttribute('data-entra');
  el.classList.remove('is-dentro');
  el.style.removeProperty('--i');
  if (!el.getAttribute('style')) el.removeAttribute('style');
}
const PROPRIETA_FINALE = { sale: 'opacity', fila: 'opacity', timbro: 'transform', righe: 'opacity', stampa: 'clip-path' };

function entra(el, passo, subito = false) {
  if (!el.dataset.entra || el.classList.contains('is-dentro')) return;
  if (subito) { pulisci(el); return; }
  const modo = el.dataset.entra;
  const ultimo = modo === 'righe' ? [...el.querySelectorAll('.linea')].at(-1) : el;
  if (!ultimo) { pulisci(el); return; }
  ultimo.addEventListener('transitionend', function fatto(e) {
    if (e.target !== ultimo || e.propertyName !== PROPRIETA_FINALE[modo]) return;
    ultimo.removeEventListener('transitionend', fatto);
    pulisci(el);
  });
  el.style.setProperty('--i', passo);
  el.classList.add('is-dentro');
}

function avviaEntrate() {
  if (movimentoRidotto() || !('IntersectionObserver' in window)) return;
  const soglia = token('--soglia-entrata') || '12%';
  const linea = innerHeight * (1 - parseFloat(soglia) / 100);

  // chi fa partire cosa: di solito l'elemento stesso, per le foto la figura
  const gruppi = new Map();
  for (const [selettore, modo, dentro] of COREOGRAFIA) {
    for (const el of document.querySelectorAll(selettore)) {
      const via = (dentro && el.closest(dentro)) || el;
      // quello che è già in vista (o sopra) all'avvio resta com'è: non si nasconde niente sotto gli occhi
      if (via.getBoundingClientRect().top < linea) continue;
      if (modo === 'righe') { if (el.children.length) continue; dividiInRighe(el); }
      el.dataset.entra = modo;
      if (!gruppi.has(via)) gruppi.set(via, []);
      gruppi.get(via).push(el);
    }
  }
  if (!gruppi.size) return;
  for (const membri of gruppi.values()) membri.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  radice.classList.add('entrate');

  // quello che entra nello stesso momento si mette in fila, in ordine di lettura: 70 ms fra un passo e l'altro
  const io = new IntersectionObserver((voci) => {
    const arrivati = voci.filter((v) => v.isIntersecting).map((v) => v.target)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    arrivati.forEach((via, k) => {
      io.unobserve(via);
      gruppi.get(via).forEach((el, j) => entra(el, Math.min(k + j, PASSI_MASSIMI)));
      gruppi.delete(via);
    });
  }, { rootMargin: `0px 0px -${soglia} 0px` });
  for (const via of gruppi.keys()) io.observe(via);

  const tuttoDentro = () => {
    for (const [via, membri] of gruppi) { io.unobserve(via); membri.forEach((el) => entra(el, 0, true)); }
    gruppi.clear();
  };
  // con la tastiera si arriva prima dell'entrata: quello che prende il focus si vede subito
  document.addEventListener('focusin', (e) => {
    for (let el = e.target.closest('[data-entra]'); el; el = el.parentElement?.closest('[data-entra]')) entra(el, 0, true);
  });
  // se cambia la larghezza prima che un titolo sia entrato, il titolo torna intero: le sue righe non valgono più
  let larghezza = innerWidth;
  addEventListener('resize', () => {
    if (innerWidth === larghezza) return;
    larghezza = innerWidth;
    for (const el of document.querySelectorAll('[data-entra="righe"]:not(.is-dentro)')) entra(el, 0, true);
  });
  // "riduci movimento" acceso a pagina aperta: tutto al suo posto, subito
  ridotto.addEventListener('change', () => { if (ridotto.matches) tuttoDentro(); });
}

// Lenis: solo con mouse o trackpad e senza "riduci movimento"; il telefono non lo scarica nemmeno
async function avviaScorrimento() {
  const computer = matchMedia('(hover: hover) and (pointer: fine)');
  if (!computer.matches || movimentoRidotto()) return;
  const { default: Lenis } = await import('lenis');
  const lenis = new Lenis({ lerp: numero('--lenis-lerp'), autoRaf: true });
  // i link interni scorrono morbidi e si fermano sotto la testata fissa (Lenis legge da sé lo scroll-margin-top
  // delle sezioni); come un link normale, aggiornano l'indirizzo e portano il focus sulla sezione
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('salta') || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = a.getAttribute('href');
    const meta = id.length > 1 && document.getElementById(decodeURIComponent(id.slice(1)));
    if (!meta) return;
    e.preventDefault();
    lenis.scrollTo(meta, {
      onComplete: () => {
        history.pushState(null, '', id);
        if (!meta.hasAttribute('tabindex')) meta.setAttribute('tabindex', '-1');
        meta.focus({ preventScroll: true });
      },
    });
  });
  ridotto.addEventListener('change', () => { if (ridotto.matches) lenis.destroy(); });
}

export function avviaMovimento() {
  // la divisione in righe dei titoli vuole i font veri: si prepara tutto quando sono pronti
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(avviaEntrate);
  const scorrimento = () => avviaScorrimento().catch(() => {}); // senza Lenis la pagina scorre normale
  const quandoLibero = () => ('requestIdleCallback' in window ? requestIdleCallback(scorrimento, { timeout: 1500 }) : setTimeout(scorrimento, 200));
  if (document.readyState === 'complete') quandoLibero(); else addEventListener('load', quandoLibero, { once: true });
}
