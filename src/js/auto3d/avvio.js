// Avvio dell'auto 3D. Il disegno SVG resta come ripiego (e come segnaposto finché il 3D non è pronto) quando:
// non c'è WebGL2, è attivo "riduci movimento", c'è il risparmio dati, oppure il telefono ha 2 GB di memoria o meno.
// three.js si scarica solo dopo il caricamento della pagina, quando il riquadro dell'auto è vicino allo schermo.
function puoi3D() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (navigator.connection?.saveData) return false;
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) return false;
  try { return Boolean(document.createElement('canvas').getContext('webgl2')); } catch { return false; }
}

export function avviaAuto3D() {
  const stage = document.querySelector('[data-auto3d]');
  if (!stage || !puoi3D()) return;
  const parti = () => {
    const io = new IntersectionObserver(([v]) => {
      if (!v.isIntersecting) return;
      io.disconnect();
      import('./scena.js').then((m) => m.monta(stage)).catch(() => stage.classList.remove('is-3d'));
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
