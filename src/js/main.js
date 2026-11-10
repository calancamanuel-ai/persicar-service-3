// Punto d'ingresso. La pagina funziona anche senza JavaScript: caselle vere, link WhatsApp e telefono veri.
import { avviaPrenota } from './prenota.js';
import { avviaStato } from './stato.js';
import { avviaRecensioni } from './recensioni.js';
import { avviaTestataFissa } from './testata.js';
import { avviaAuto3D } from './auto3d/avvio.js';
import { avviaMovimento } from './movimento.js';

document.documentElement.classList.add('js'); // c'è già dallo script in testa; qui per le altre pagine
avviaPrenota();
avviaStato();
avviaRecensioni();
avviaTestataFissa();
avviaAuto3D();
avviaMovimento();
