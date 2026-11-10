// Avvio dell'auto 3D. Il disegno SVG resta come ripiego quando:
// non c'è WebGL2, è attivo "riduci movimento", c'è il risparmio dati, oppure il telefono ha 2 GB di memoria o meno.
// three.js si scarica solo dopo il caricamento della pagina, quando il riquadro dell'auto è vicino allo schermo.
function puoi3D() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (navigator.connection?.saveData) return false;
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) return false;
  try { return Boolean(document.createElement('canvas').getContext('webgl2')); } catch { return false; }
}

// Lo script in testa mette html.auto-3d quando il 3D è atteso: dal primo fotogramma si vede la foto della stessa auto
// nella stessa posa, e il 3D prende il suo posto senza che cambi niente. Se il 3D non può partire torna il disegno.
const ripiego = (stage) => { document.documentElement.classList.remove('auto-3d'); stage?.classList.remove('is-3d'); };

export function avviaAuto3D() {
  const stage = document.querySelector('[data-auto3d]');
  if (!stage || !puoi3D()) { ripiego(stage); return; }
  const parti = () => {
    const io = new IntersectionObserver(([v]) => {
      if (!v.isIntersecting) return;
      io.disconnect();
      import('./scena.js').then((m) => m.monta(stage)).catch(() => ripiego(stage));
    }, { rootMargin: '200px' });
    io.observe(stage);
  };
  const quandoLibero = () => ('requestIdleCallback' in window ? requestIdleCallback(parti, { timeout: 1500 }) : setTimeout(parti, 200));
  // si parte a sequenza d'apertura finita (titolo, frase e scheda già fermi): il 3D non le ruba il primo secondo.
  // L'ultima a fermarsi è la scheda dei lavori; se la sua entrata non c'è (o è già finita) si parte subito.
  const dopoApertura = () => {
    const entrata = document.querySelector('.hero__lavori')?.getAnimations?.().find((a) => a.animationName === 'entra');
    if (!entrata) { quandoLibero(); return; }
    entrata.finished.then(quandoLibero, quandoLibero);
  };
  if (document.readyState === 'complete') dopoApertura(); else addEventListener('load', dopoApertura, { once: true });
}
