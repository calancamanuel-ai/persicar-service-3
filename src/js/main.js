// Punto d'ingresso. La pagina funziona anche senza JavaScript: caselle vere, link WhatsApp e telefono veri.
import { avviaPrenota } from './prenota.js';
import { avviaStato } from './stato.js';
import { avviaRecensioni } from './recensioni.js';
import { avviaTestataFissa } from './testata.js';

document.documentElement.classList.add('js');
avviaPrenota();
avviaStato();
avviaRecensioni();
avviaTestataFissa();
