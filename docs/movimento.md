# Movimento (fase 7)

Il movimento accompagna la lettura e conferma i gesti, senza mai trattenere il contenuto. L'unica cosa viva resta
l'auto 3D; tutto il resto si posa una volta sola e poi sta fermo.

## Dove sta
- **`src/styles/tokens.css`**: l'unico file dei valori (tempi, curve, distanze, soglie). Anche il JS li legge da
  qui, con `token()`, `tempo()` e `numero()` di `src/js/movimento.js`: nei file `.js` non c'è scritto nessun tempo.
- **`src/styles/movimento.css`**: la sequenza d'apertura della scheda, i modi d'entrata e la barra del pollice.
- **`src/js/movimento.js`**: la coreografia (cosa entra e come, sezione per sezione), l'observer e Lenis.
- **`src/js/auto3d/scena.js`**: la scena di scroll dell'auto.

## I valori
| Token | Valore | Per cosa |
| --- | --- | --- |
| `--ease-ui` | `cubic-bezier(0.23, 1, 0.32, 1)` | tutto ciò che risponde a un gesto, anche le uscite |
| `--ease-entrata` | `cubic-bezier(0.22, 1, 0.36, 1)` | le entrate delle sezioni |
| `--t-pressione` | 120 ms | bottoni e caselle premuti, a `--scala-pressione` 0.97 |
| `--t-hover` | 180 ms | colori al passaggio del mouse, la barra che cambia testo |
| `--t-ui` | 240 ms | testata fissa che entra, timbri, il cerchietto dell'auto che si spunta |
| `--t-uscita` | 170 ms | ciò che se ne va (la testata fissa): circa il 70% dell'entrata |
| `--t-entrata` | 720 ms | le parti di una sezione |
| `--t-apertura` | 700 ms | lo scontrino che esce |
| `--ritardo-parti` | 70 ms | fra un passo e l'altro di una sequenza |
| `--ritardo-righe` | 90 ms | fra le righe di un titolo |
| `--salita` / `--salita-corta` | 24 / 16 px | quanto salgono le parti entrando |
| `--soglia-entrata` | 12% | le entrate partono all'88% dello schermo |
| `--lenis-lerp` | 0.12 | scorrimento morbido su computer |
| `--auto-giro-scroll` | 0.6 rad | quanto gira l'auto mentre la scheda esce |

Niente ease-in, niente rimbalzi. Si animano solo `opacity`, `transform` e `clip-path`.

## La scheda, al primo fotogramma
Solo CSS, dipende da `html.js` (uno script in linea in testa), ferma entro 1,2 s dal primo fotogramma:
1. le due righe del titolo salgono di 24 px, a 90 ms l'una dall'altra;
2. la frase d'apertura sale di 16 px;
3. la scheda dei lavori sale di 24 px.

Restano ferme l'intestazione, la navigazione, la striscia dello strappo e il riquadro dell'auto. Nel riquadro, dal
primo fotogramma, c'è la foto della stessa auto 3D nella posa da cui parte; il 3D si carica a sequenza finita e
prende il suo posto senza che cambi niente (vedi "Foto di attesa" in `docs/design-system.md`).

## Le entrate delle sezioni
Una volta sola, quando l'elemento arriva all'88% dello schermo. Quello che entra nello stesso momento si mette in
fila in ordine di lettura, al massimo in quattro passi. Ogni sezione ha il suo modo:

| Modo | Cosa fa | Dove |
| --- | --- | --- |
| `righe` | il titolo si divide nelle righe in cui è andato a capo, ognuna sale; poi torna testo semplice | i titoli h2 |
| `sale` | 24 px e opacità, come un foglio che si posa | frasi d'apertura, tutte le foto, logo, saluto |
| `fila` | 16 px, una voce dopo l'altra | gruppi del listino, fatti, paragrafi della lettera, righe degli orari, contatti, cartellini |
| `stampa` | lo scontrino si scopre dall'alto in basso scendendo di 24 px | la ricevuta delle revisioni |
| `timbro` | il timbro si posa da 1.18 a 1, dopo il resto | il timbro del footer |

Sicurezze:
- senza JavaScript, se lo script non parte, con "riduci movimento" o senza IntersectionObserver non si nasconde
  niente;
- quello che è già in vista all'avvio (un link a `#orari`, una pagina ricaricata a metà) resta com'è;
- un elemento che prende il focus da tastiera si vede subito;
- se la larghezza cambia prima che un titolo sia entrato, il titolo torna intero;
- a entrata finita l'elemento perde attributi e ritardi, e torna com'era.

## La scena di scroll: l'auto gira mentre la scheda esce
È l'unica scena della pagina, leggera e senza pin. Fra la cima della pagina e il momento in cui il riquadro
dell'auto esce in alto, l'auto gira di 0,6 rad verso chi guarda, lineare con lo scorrimento. Si somma a quanto l'hai
girata tu col dito o col mouse. Fa capire anche su telefono, senza dirlo, che l'auto è un oggetto da girare e
toccare. Si disegna solo mentre l'auto è in vista.

## Lenis
Solo con mouse o trackpad e senza "riduci movimento"; si scarica a parte (circa 6 KB compressi), quindi il telefono
non lo carica. I link interni scorrono morbidi, si fermano sotto la testata fissa (`scroll-margin-top` delle
sezioni), aggiornano l'indirizzo e portano il focus sulla sezione. Il link "Vai al contenuto" resta quello normale
del browser.

## Eccezioni volute
- Le entrate durano 700–720 ms, oltre i 300 ms dell'interfaccia: non rispondono a un gesto, accompagnano la lettura.
  Niente resta coperto più di 0,9 s.
- Lo smorzamento dell'auto (`SMORZAMENTO` in `scena.js`) è una costante fisica, non un tempo: la posa voluta si
  raggiunge con un ease-out esponenziale di circa 0,25 s.
- Le foto non si mascherano mai: entrano intere, salendo. Una lastra che si ritirava dal bordo (prima versione)
  le faceva sembrare tagliate ai bordi delle sezioni (cliente, 11/11); con `clip-path`, inoltre, il browser non
  scarica le foto "lazy" finché sono mascherate.

## Cosa non si usa, e perché
- **GSAP**: senza pin e senza scrub lunghi bastano CSS e un observer, e il telefono scarica circa 45 KB in meno.
  Resta nel `package.json` perché fa parte dello stack fissato.
- **Pin e blocchi di scroll**: nessuno, né su computer né su telefono.
- **Preloader, cursori personalizzati, testo che si scrive da solo, loop**: nessuno.
- **Hover sulle foto**: le foto non sono link, quindi non rispondono al mouse.

## Come si controlla
`node scripts/prove-home.cjs` misura la sequenza d'apertura, la presenza di Lenis, i tempi e le curve dei
controlli, che nessuna parte resti nascosta dopo uno scorrimento, i link interni, la rotazione dell'auto con lo
scorrimento, e la pagina con "riduci movimento" e senza JavaScript.
