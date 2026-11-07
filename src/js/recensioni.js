// Le recensioni Google vere arriveranno in src/data/recensioni.json: finché è vuoto, la sezione resta nascosta.
// Formato atteso: [{ "testo": "...", "firma": "Iniziali", "data": "2026-10" }]
import recensioni from '../data/recensioni.json';

export function avviaRecensioni() {
  const box = document.querySelector('[data-recensioni]');
  if (!box || !Array.isArray(recensioni) || !recensioni.length) return;
  box.replaceChildren(...recensioni.slice(0, 3).map((r) => {
    const q = document.createElement('blockquote');
    q.className = 'recensione';
    const p = document.createElement('p'); p.textContent = r.testo;
    const f = document.createElement('footer'); f.className = 'piccolo'; f.textContent = [r.firma, r.data].filter(Boolean).join(' · ');
    q.append(p, f);
    return q;
  }));
  box.hidden = false;
}
