// La scheda: caselle e zone dell'auto spuntano gli stessi lavori e scrivono il messaggio WhatsApp.
const NUMERO = '393667212576';

const elenco = (parole) => (parole.length < 2 ? parole.join('') : `${parole.slice(0, -1).join(', ')} e ${parole.at(-1)}`);

export function messaggio(parole) {
  if (!parole.length) return 'Buongiorno, vorrei prenotare un intervento. Quando posso portarvi l\'auto?';
  if (parole.length === 1 && parole[0] === 'revisione') return 'Buongiorno, vorrei portarvi l\'auto per la revisione. Quando posso passare?';
  return `Buongiorno, vorrei prenotare: ${elenco(parole)}. Quando posso portarvi l'auto?`;
}

// barra del pollice: senza spunte "Scrivici su WhatsApp"; con le spunte due righe, il gesto e quanti lavori
function etichettaBarra(barra, quanti) {
  if (!quanti) { barra.textContent = 'Scrivici su WhatsApp'; return; }
  const riga = document.createElement('span');
  riga.className = 'barra-pollice__riga';
  riga.textContent = 'Manda la richiesta';
  const nota = document.createElement('span');
  nota.className = 'barra-pollice__nota';
  nota.textContent = `${quanti} ${quanti === 1 ? 'lavoro' : 'lavori'} · su WhatsApp`;
  barra.replaceChildren(riga, nota);
}

export function avviaPrenota() {
  const caselle = [...document.querySelectorAll('input[name="lavori"]')];
  if (!caselle.length) return;
  const zone = [...document.querySelectorAll('.zona[data-voce]')];
  const punti = [...document.querySelectorAll('.auto__punto[data-voce]')];
  const riepilogo = document.querySelector('[data-riepilogo]');
  const linkWhatsapp = [...document.querySelectorAll('[data-whatsapp]')];
  const barra = document.querySelector('[data-barra]');

  const aggiorna = () => {
    const scelte = caselle.filter((c) => c.checked);
    const parole = scelte.map((c) => c.dataset.parola);
    const href = `https://wa.me/${NUMERO}?text=${encodeURIComponent(messaggio(parole))}`;
    for (const a of linkWhatsapp) a.href = href;
    for (const z of zone) {
      const c = caselle.find((x) => x.value === z.dataset.voce);
      z.setAttribute('aria-pressed', String(Boolean(c && c.checked)));
    }
    for (const p of punti) p.classList.toggle('is-scelto', caselle.some((x) => x.value === p.dataset.voce && x.checked));
    if (riepilogo) riepilogo.textContent = parole.length ? `Hai scelto: ${elenco(parole)}.` : 'Spunta i lavori, il messaggio lo scriviamo noi.';
    if (barra) etichettaBarra(barra, parole.length);
    // l'auto 3D ascolta questo evento per accendere i suoi cerchietti
    document.dispatchEvent(new CustomEvent('lavori:aggiornati', { detail: { voci: scelte.map((c) => c.value) } }));
  };

  for (const c of caselle) c.addEventListener('change', aggiorna);
  for (const z of zone) {
    z.addEventListener('click', () => {
      const c = caselle.find((x) => x.value === z.dataset.voce);
      if (!c) return;
      c.checked = !c.checked;
      aggiorna();
    });
  }
  aggiorna();
}
