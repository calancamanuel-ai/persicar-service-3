# Design system: "La scheda"

La pagina è la scheda di accettazione dell'officina: un foglio di carta con i bordi veri, posato su un piano di
pietra. Tutto passa dai token in `src/styles/tokens.css`. La pagina interna `componenti.html` (noindex) mostra
ogni pezzo.

## File
- `src/styles/sito.css`: punto d'ingresso, importa nell'ordine i file qui sotto.
- `src/styles/fonts.css`: Besley 800 e Libre Franklin 400–600, ospitati in `public/fonts/` (OFL, circa 80 KB in
  tutto), con ripieghi a metriche vicine.
- `src/styles/tokens.css`: colori, cinque misure di testo, spazi, forme, movimento.
- `src/styles/base.css`: reset, tipo, griglia, link, segnaposto `data-da-confermare`, reduced motion.
- `src/styles/componenti.css`: i componenti.
- `public/brand/`: `logo-chiaro.svg`, `logo-scuro.svg` e `favicon.svg` (la "P" del logo col filetto tricolore).

## Colori (ruoli)
| Token | Valore | Uso |
| --- | --- | --- |
| `--piano` | #D7D6D1 | fondo della pagina: grigio pietra, poco caldo (foglio/piano 1,29:1) |
| `--foglio` / `--foglio-2` | #F2F1EE / #E8E7E2 | carta del modulo, e il passo di tono per bande e caselle |
| `--inchiostro` / `--inchiostro-tenue` | #1C211F / #4D5551 | testo, note secondarie (6,8:1 sul foglio, 5,3:1 sul piano) |
| `--verde` | #2E7D55 | **solo** bottone WhatsApp e spunte (testo bianco 5:1) |
| `--timbro` | #A4444C | rosso del logo scurito: **solo** il timbro dell'officina, piccolo (5,3:1 sul foglio) |
| `--campo` | #1C211F | il campo scuro: sezione sull'officina con la foto dell'esterno, logo bianco |
| `--evidenziatore` | #F1E39A | dati da confermare: sparisce al lancio |

## Tipo
Cinque misure: piccola 14px, testo 17–19px, lead 20–24px, titolo 28–56px (29px a 390), display 30–88px (38px a 390,
sotto i 400px cala con lo schermo per restare su due righe). Besley solo per titoli
e display; Libre Franklin per tutto il resto. Interlinea 0,95 per il display, 1,05 per i titoli e 1,55 per il
testo.

## Componenti
- **Testata**: logo, link (da 64em), bottone WhatsApp. Su telefono il bottone sta nella barra del pollice.
- **Bottoni**: rettangoli pieni, raggio 0, alti 52px. `--whatsapp` verde, `--secondario` sul foglio-2,
  `--su-campo` sul campo scuro. Pressione 0,97 in 120ms.
- **Caselle** (`.voci-contenitore > .voci > .voce`):
  - checkbox vere, bersagli di 52px, casella col bordo da 2px, spunta verde;
  - 2, 3 o 4 colonne secondo lo spazio (container query); su 2 colonne l'ultima voce dispari prende tutta la
    riga.
- **Foglio**:
  - `.foglio--denti-sotto` e `--denti-sopra` fanno i bordi a denti con una maschera SVG; insieme (listino,
    scontrino della revisione) i denti stanno su entrambi i bordi;
  - `.foglio__intestazione` è la banda d'intestazione;
  - `.strappo` è la perforazione a puntini da 4px nel colore del piano.
- **Listino** (`.listino > .riga`): nome, guida a puntini da 4px, valore. La guida resta sulla prima riga anche
  quando il valore va a capo.
- **Banda**: la riga dell'indirizzo e degli orari, ricorrente.
- **Foto**: angoli vivi, `--verticale` 4:5, `--alta` 2:3, `--orizzontale` 3:2, `--riempi` per riempire
  un'altezza data. `.cartellino` attaccato sotto, in quattro coppie di colori (foglio-2, scuro, foglio, creta) che
  girano nella galleria, con una seconda riga (gruppo del listino e via) che su telefono sparisce.
- **Campo scuro**: `.campo-scuro` (`.su-campo` per il focus chiaro), per la sezione sull'officina. Il rosa
  intonaco è stato tolto il 7/11.
- **Timbro** (`.timbro`, `.timbro__grande`, `.timbro__piccolo`):
  - riquadro rosso da 3px, inchiostro `--timbro`, ruotato di −4°, `mix-blend-mode: multiply`;
  - statico per il retro della scheda ("Persicar Service · Via Cento 60");
  - `.timbro--ricevuto` dentro `.scheda-lavori` compare ("Ricevuto") appena c'è una spunta, solo con CSS
    (`:has`). È `aria-hidden`: per chi usa un lettore di schermo contano le caselle;
  - mai campi rossi, mai vicino al bottone WhatsApp.
- **Stato**: "aperto adesso", testo piccolo e niente di più.
- **Barra del pollice**: fissa in fondo sotto i 48em, WhatsApp 2/3 e Chiama 1/3. Piatta, con margine in fondo
  alla pagina.

## Eccezioni decise (non sono errori)
- **`covered-text` a 390px**: la barra del pollice è fissa e, scorrendo, copre per un attimo il testo che passa
  sotto. È voluto (CTA sempre raggiungibile). Nei controlli a 390px si passa `--allow covered-text` e le
  sovrapposizioni vere si verificano sugli screenshot e a 1440px, dove la barra non c'è.
- **Intestazione del foglio**: nell'hero il foglio parte dall'alto e la sua intestazione è la testata del sito
  (`<header>` in cima alla pagina). Così l'ispettore non la scambia per un'etichetta sopra il titolo.
- **Bordo della casella**: è un campo di modulo, quindi la linea è ammessa dalle regole della casa (form fields).
- **Perforazioni e guide a puntini**: puntini rotondi da 4px, cioè un bordo disegnato e non una riga sottile.

## Auto 3D (fase 5)
- **File**:
  - `src/js/auto3d/avvio.js`: entra nel pacchetto principale. Decide se partire e quando.
  - `src/js/auto3d/scena.js`: la scena, la luce, il tocco e il trascinamento.
  - `src/js/auto3d/forma.js`: la forma dell'auto e le zone.
  - three.js (circa 150 KB compressi) si scarica a parte, dopo il caricamento della pagina, quando il riquadro
    dell'auto è vicino allo schermo.
- **Forma**:
  - è estrusa dallo stesso profilo del disegno SVG dell'hero: il disegno è il prospetto laterale dell'auto;
  - è generica, color creta, senza loghi né griglie di marca;
  - circa 35 chiamate di disegno e 13 mila triangoli.
- **Luce**:
  - `RoomEnvironment`, nessun file da scaricare;
  - una luce calda, alta e di lato, come da una finestra;
  - un'ombra di contatto disegnata (niente shadow map);
  - tone mapping Neutral, così i colori restano quelli dei token.
- **Gesti**:
  - un tocco su una parte clicca il bottone della zona. È prenota.js che spunta e scrive il messaggio, poi manda
    l'evento `lavori:aggiornati`, che accende i cerchietti dell'auto;
  - un trascinamento orizzontale gira l'auto;
  - la pagina continua a scorrere in verticale (`touch-action: pan-y`).
- **Rendering**: si disegna solo mentre qualcosa si muove (entrata, giro, cerchietto che si spunta) e mai fuori
  dallo schermo.
- **Ripiego**: resta il disegno SVG, con le stesse zone e le stesse caselle, quando:
  - non c'è WebGL2;
  - è attivo "riduci movimento";
  - c'è il risparmio dati;
  - il telefono ha 2 GB di memoria o meno.
  - Il disegno fa anche da segnaposto finché il 3D non è pronto, poi sparisce in dissolvenza.
- **Laboratorio**: `lab-auto.html`, solo in sviluppo (`npx vite`), non entra nella build.

