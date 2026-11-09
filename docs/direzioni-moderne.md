# Direzioni moderne: ricerca e proposte (9/11)

Ramo `claude/direzione-moderna`, aperto da `claude/materiale-logo-foto` (1549570). Lì "La scheda" (A) resta intatta,
come termine di confronto.

## Cosa resta uguale
- Il materiale: logo, foto, dati e `MANCANTI.md`.
- Le regole del `CLAUDE.md`.
- L'obiettivo WhatsApp.
- L'auto 3D come unica cosa viva.

I tre hero (A, B e C) hanno gli stessi testi, così si confronta solo la direzione. Nei mockup l'auto è il
disegno statico, perché il 3D arriva in fase 5.

## Ricerca
I siti sono stati aperti dal vivo, con screenshot del primo schermo a 1440 px nella scratchpad della sessione.
Non entrano nel repo.

| Sito | Cosa lo rende accattivante | Cosa si adatta a noi |
| --- | --- | --- |
| RPM Technik (UK), specialista Porsche | Foto piena, etichette dei servizi in un grottesco largo maiuscolo, un solo rosso per i bottoni, angoli vivi. Sembra una squadra tecnica | Un carattere largo per le etichette, un solo colore segnale (il verde) per l'azione. No alla foto a tutta larghezza |
| Lanzante (UK), corse e assistenza | Un'auto su un fondo grigio da studio, quasi niente testo, un numero da gara come segno | Un segno dell'officina usato come grafica: la cornice targa (B) |
| Earthling Automotive (USA), riparazione di auto elettriche | Titolo grande, "Book Service" in alto, servizi in tre voci semplici | Azione e servizi nel primo schermo: la fiducia prima dell'effetto |
| Officine Fioravanti (Torino), fondatore giovane | Una foto forte dell'officina e quasi nessuna parola | Un solo elemento forte, da noi l'auto 3D. No al lusso e alla mancanza di informazioni |
| idGarages (Francia), prenotazione di officine | Si parte dal servizio ("Entretenir mon véhicule") | Il primo gesto è scegliere il lavoro, come le nostre caselle. No al look da portale |
| Nick Ho (libreria), motorsport | Numero enorme, un solo colore per lo stato, foto in grigio che prendono colore quando sono attive | Foto da telefono in grigio uniforme, a colori al passaggio. Il colore solo per lo stato |
| United Carriers (libreria), logistica | Grottesco squadrato, una frase sola, la macchina come oggetto su un fondo scuro | Enfasi col contrasto di colore invece del grassetto, l'auto che poggia su una fascia scura |
| longbow (libreria), marchio di auto | Griglia di costruzione, immagini incastrate nelle celle | Solo la disciplina della griglia (C). Il resto è da casa auto e lo scartiamo |

## Siti non studiati
Sono rimasti fuori per problemi dei siti stessi:
- Romeo Ferraris: connessione chiusa;
- Tuthill Porsche: non risponde;
- Canepa, Fixter e ClickMechanic: dietro verifiche anti-bot, che non si aggirano.

## draw.mjs
- Il comando: `--sector other --have photography --keep palette`, coi toni `bold` e `technical`.
- Su più semi sono uscite più volte due direzioni: `one-motif` e `dense-tiles`.
- I fogli completi sono in `.taste-skill/b-targa/` e `.taste-skill/c-quadro/`. Quello di A resta in
  `.taste-skill/direction.json`.
- Il sorteggio aveva dato Albert Sans (B) e Stack Sans (C). Si tengono invece Barlow e Archivo, come da piano
  approvato:
  - Barlow è disegnato sulle targhe e sui cartelli stradali;
  - Archivo stretto dà le cifre da cruscotto.

## B. "La firma sulla targa" (`one-motif`, tono bold)
- **Idea**: la cornice targa nera "PERSICAR SERVICE" che l'officina mette su ogni auto è l'unico segno del
  sistema.
- **Hero**: una cornice enorme entra da destra, tagliata dallo schermo, con dentro la "targa" chiara e l'auto. Le
  zone sono targhette nere, che diventano verdi quando le spunti.
- **Nel resto del sito**: la cornice torna intorno alle foto, che restano piccole, e sui tasti.
- **Tipo**: Barlow Condensed 700 maiuscolo per i titoli e Barlow 400/500 per il testo.
- **Colori**:
  - asfalto #1B1F1D;
  - cornice #000;
  - gesso #F3F3F0;
  - verde #2E7D55, solo per WhatsApp e le spunte.
- **File**: `direzioni/b-targa.html` e `direzioni/b-targa.css`.

## C. "Il quadro strumenti" (`dense-tiles`, tono tecnico)
- **Idea**: la pagina è il quadro strumenti dell'officina, una plancia di tessere accostate. Ogni tessera dice una
  sola cosa.
- **Le tessere**:
  - il titolo;
  - l'auto da toccare;
  - i lavori;
  - una foto in grigio;
  - "Aperto adesso" con gli orari e la revisione;
  - il messaggio WhatsApp che si compone, col bottone su computer. Su telefono il bottone è quello della barra.
- **Tipo**: Archivo stretto 800 maiuscolo per titoli e cifre, Archivo 400/600 per il testo.
- **Colori**:
  - banco #E6E7E3;
  - piastra #F7F7F5;
  - grafite #181B1A;
  - verde #2E7D55, solo per WhatsApp e le spunte.
- **File**: `direzioni/c-quadro.html` e `direzioni/c-quadro.css`.

## Come si rigenerano
- `python3 scripts/genera-direzioni.py` riscrive i due HTML.
- Si vedono con `npx vite`, alla pagina `/direzioni/b-targa.html` o `/direzioni/c-quadro.html`.
- Il confronto con A sta in `materiale/direzioni/confronto-1440.jpg` e `confronto-390.jpg`.
