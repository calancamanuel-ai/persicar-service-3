# Persicar Service: regole del progetto

Sito di Persicar Service: officina autorizzata Renault e Dacia e revisioni, Via Cento 60, San Giovanni in
Persiceto (BO), gestita da tre fratelli. L'obiettivo è uno solo: la prenotazione su WhatsApp, quasi sempre da
telefono.

## Decisioni fissate dal cliente
- **Direzione A "La scheda"**: la pagina è la scheda di accettazione dell'officina, un foglio su piano di pietra.
  - Titoli in **Besley 800**, testo in **Libre Franklin 400/600**, font ospitati nel sito. Mai Inter.
  - Colori: `--piano #E3DFD6`, `--foglio #F2F1EE`, `--inchiostro #1C211F`, accento `--verde #2E7D55` (solo
    bottone WhatsApp e spunte).
  - `--intonaco #E8CBBE` (rosa del capannone) come campo della sezione "chi siamo / l'officina".
  - Logo: `materiale/brand/logo-chiaro.svg` sul chiaro, `logo-scuro.svg` sullo scuro.
- **Unica cosa viva**: auto 3D generica e stilizzata, costruita in three.js, senza loghi, in luce naturale.
  - Si toccano le parti dell'auto, si spuntano i lavori e si compone il messaggio WhatsApp.
  - Zone di tocco grandi per il pollice; caselle HTML sempre visibili su telefono.
  - Ripiego statico con reduced motion o senza WebGL.
- **Foto**: fotogrammi dai video Instagram (scelti dal cliente) e, per i soggetti mancanti, le foto pulite di
  persicar-service-2.
  - Mani e braccia sì; niente volti, loghi di terzi, interfaccia Instagram o targhe leggibili.
  - Riquadri medi o piccoli, mai a tutta larghezza, mai ingrandite. L'hero non dipende da una foto.
- **Contatti**: segnaposto evidenziati (`data-da-confermare`), elenco in `MANCANTI.md`.
- **Niente**: prezzi, voto Google (spazio predisposto), deploy.
- **Stack**: Vite + JavaScript vanilla, `three`, `gsap`, `lenis` da npm con versioni esatte.

## Voce dei testi
- **Solo per il tono, da non scrivere mai nel sito**: i tre fratelli sono giovani. Nei testi niente età, niente
  "giovani", niente riferimenti che invecchiano ("nuova generazione", "da poco", "freschi di…").
- Usa formule che restano vere nel tempo: "tre fratelli", "un'officina sola". **Niente nomi** e **niente anno**
  per ora: hanno preso l'officina nel 2022, ma non si scrive.
- **Revisioni**: l'auto in revisione la portano loro e il cliente la lascia. Frase guida: "Alla revisione pensiamo
  noi". Mai "centro revisioni" né "la facciamo qui". Si scrive "la tua auto", senza elencare veicoli.
- **WhatsApp**: il bottone dice "Scrivici su WhatsApp". La frase "solo messaggi" non va nel sito.
- Tono: diretto, fresco, poco formale, da persona a persona, col "noi". Mai da startup, mai da social, niente
  gergo da concessionaria, niente punti esclamativi a raffica ed emoji.
- In primo piano la competenza concreta:
  - officina autorizzata Renault e Dacia;
  - revisioni;
  - i lavori veri che si vedono nelle foto.
- Instagram (@persicarservice) come richiamo sobrio, dove ha senso: "I lavori di tutti i giorni li mettiamo su
  Instagram", vicino alle foto del lavoro e nel footer. Mai un feed incorporato.
- La direzione visiva non cambia: "officina di paese seria". La freschezza sta solo nelle parole.

## Regole sulle skill
Dove le skill si contraddicono vincono il piano e gli stop di fase del cliente. Lo stack del progetto vince sugli
esempi delle skill (CDN, React, Netlify o Vercel).
1. A fine fase ci si ferma con un riepilogo breve. Dentro una fase le scelte minori si decidono e si elencano.
2. Al massimo 3 giri di revisione per fase: screenshot a 1440 e 390 px, `inspect.mjs` (si legge la riga RESULT,
   non il codice di uscita), i 3 punti più deboli corretti. Niente "voto 8" né "minimo 2 giri".
3. Font e colori restano quelli fissati qui (`draw.mjs --keep palette,type`). La libreria dà solo le
   composizioni delle sezioni. awesome-design serve solo come spunto per i colori.
4. Una sola cosa viva per pagina: l'auto. Scadenze della revisione e "aperto ora" sono testo, non giochi.
5. Al massimo una scena di scroll pesante. Su telefono niente blocchi di scroll oltre circa 1,5 schermi. Lenis
   solo su computer e mai con reduced motion. Niente preloader.
6. Movimento da un solo file di token. Interfaccia: sotto 300 ms, `cubic-bezier(0.23, 1, 0.32, 1)`, pressione
   0.97, mai ease-in. Entrate con ritardi di 60–90 ms e spostamenti di 16–32 px.
7. La luce del 3D segue le skill 3D. L'HTML intorno segue le regole della casa di design-taste-frontend:
   niente gradienti, ombre a riposo, vetro, etichette maiuscole minuscole, monospazio, numerazioni 01/02 o
   righe sottili.
8. Barra WhatsApp/Chiama su telefono: piatta, bersagli di almeno 44 px, margine in fondo alla pagina.
9. Nessuna prova sociale, nessun numero e nessun prezzo inventati.
10. Se la rete blocca qualcosa lo si dice subito e lo si annota in `MANCANTI.md`.
11. Test con playwright-cli (`@playwright/cli`) sul Chromium preinstallato `/opt/pw-browsers/chromium`. Niente
    `playwright install`.
