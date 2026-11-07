// Su computer, passata la scheda, compare una testata sottile col logo e WhatsApp: l'azione resta raggiungibile.
export function avviaTestataFissa() {
  const testata = document.querySelector('.testata-fissa');
  const scheda = document.querySelector('.hero__foglio');
  if (!testata || !scheda || !('IntersectionObserver' in window)) return;
  const link = testata.querySelectorAll('a');
  new IntersectionObserver(([voce]) => {
    const visibile = !voce.isIntersecting && voce.boundingClientRect.top < 0;
    testata.classList.toggle('is-visibile', visibile);
    testata.setAttribute('aria-hidden', String(!visibile));
    for (const a of link) a.tabIndex = visibile ? 0 : -1;
  }, { threshold: 0 }).observe(scheda);
}
