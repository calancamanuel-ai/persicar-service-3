// "Aperto adesso" con l'ora di Roma e gli orari confermati (lun–ven 8:30–12:30, 14:30–18:15).
const TURNI = [[8 * 60 + 30, 12 * 60 + 30], [14 * 60 + 30, 18 * 60 + 15]];
const ora = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

export function statoAdesso(data = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(data).map((x) => [x.type, x.value]));
  const giorno = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  const minuti = Number(p.hour) * 60 + Number(p.minute);
  const feriale = giorno >= 1 && giorno <= 5;
  if (feriale) {
    for (const [da, a] of TURNI) if (minuti >= da && minuti < a) return { aperto: true, testo: `Aperto adesso · fino alle ${ora(a)}` };
    if (minuti < TURNI[0][0]) return { aperto: false, testo: `Chiuso adesso · apriamo alle ${ora(TURNI[0][0])}` };
    if (minuti < TURNI[1][0]) return { aperto: false, testo: `Chiuso per pranzo · riapriamo alle ${ora(TURNI[1][0])}` };
  }
  const prossimo = giorno >= 1 && giorno <= 4 ? 'domani' : 'lunedì';
  return { aperto: false, testo: `Chiuso adesso · riapriamo ${prossimo} alle ${ora(TURNI[0][0])}` };
}

export function avviaStato() {
  const nodi = document.querySelectorAll('[data-stato]');
  if (!nodi.length) return;
  const scrivi = () => { const s = statoAdesso(); for (const n of nodi) { n.textContent = s.testo; n.dataset.aperto = String(s.aperto); } };
  scrivi();
  setInterval(scrivi, 60_000);
}
