# Materiale: logo e foto

## Logo (`brand/`)
- `logo-originale.png`: copiato da persicar-service-2 (`assets/img/logo.png`), 1067×251. Lettering bianco,
  onda verde, linea del tetto bianca e tocco rosso, su fondo trasparente. È fatto per fondo scuro.
- `logo-chiaro.png`: versione per fondo chiaro ricavata dall'originale. I pixel neutri passano all'inchiostro
  `#1C211F`, con opacità pari alla loro luminosità. Verde e rosso restano identici.
- `logo-chiaro.svg` / `logo-scuro.svg`: ricalco vettoriale fedele (potrace) dei tre strati, per usi grandi e
  per la nitidezza. Il PNG ha bordi sgranati al 100% perché il sorgente è stato ingrandito da un JPEG.
  - Colori misurati come mediana dei pixel pieni: verde `#3B8F64`, rosso `#B35058`, lettering `#1C211F`
    (chiaro) o `#FFFFFF` (scuro).
  - Usa l'SVG ovunque. Il PNG chiaro serve solo come ripiego, per esempio nelle email.

## Foto di persicar-service-2 (`foto-originali/` → `foto-pulite/`)
- Copiate tutte, tranne `hero.webp` (doppione di `esterno.webp`) e `clima.webp` (generata con l'IA).
- In `foto-pulite/` ci sono solo quelle che i fotogrammi non coprono meglio: `esterno`, `lavoro-z3`,
  `sospensioni`, `attrezzi`, `diagnosi`, `lavoro-mercedes`.
  - `esterno`: sfocati i marchi VW, Opel e Renault, oltre al badge sul portellone della Golf. Le targhe sono
    coperte dalle cornici "PERSICAR SERVICE".
  - `officina.webp` è la stessa foto di `lavoro-z3.webp` con un taglio diverso: si tiene `lavoro-z3`.
  - Scartate per loghi grandi, interfaccia Instagram o adesivi: `lavoro-gt86` (Toyota, UI Instagram),
    `lavoro-i20n` (Sprint Filter), `gomme` (Hyundai N), `lavoro-focus` (Ford RS). Scartate anche `freni` e
    `olio`, sostituite da fotogrammi più nitidi della stessa scena.
- Colore dell'intonaco misurato su `esterno` (cielo coperto): `#CDB2A1`. Il token del sito `#E8CBBE` è la
  stessa tinta in luce di giorno.

## Fotogrammi dai video Instagram (Drive, cartella "Video Instagram persicar")
- 5 registrazioni schermo 1080×2400. I video **non** sono nel repo e non si usano come video nel sito.
- **Area pulita** ritagliata, senza interfaccia Instagram:
  - Reels: x 0–940, y 300–1740, quindi 940×1440 px
  - post a carosello: x 0–915, y 505–1845
- **Selezione**:
  - campionati 4 fotogrammi al secondo;
  - tenuti i più fermi (differenza dal fotogramma precedente sotto la mediana del video) e i più nitidi
    (varianza del laplaciano);
  - tenuti a distanza di almeno 1,2 s e diversi fra loro (dHash).
- **Scartati**: fotogrammi con volti, con interfaccia Instagram, con loghi grandi (Liqui Moly, Sprint Filter,
  Hyundai), l'adesivo volgare sulla i20N e il carosello GT86 (Toyota ed elf).
- **Loghi piccoli sfocati**:
  - ovale sul paraurti della berlina (n. 2)
  - Ford e RS (n. 4)
  - scritte NGK sulle candele (n. 5)
  - marchio sul pezzo nero (n. 10)
  - marchio sul coperchio motore (n. 12)
- `anteprima-fotogrammi.jpg`: griglia dei 15 candidati per la scelta del cliente. **In attesa della scelta.**
- Pesi di prova (AVIF / WebP, KB):
  - telefono (640 px): 8–30 / 15–42
  - computer (940 px): 12–43 / 24–65

## Script
- `scripts/foto.mjs`: genera AVIF e WebP per telefono (640 px) e computer (larghezza piena fino a 1464 px),
  senza mai ingrandire, e stampa i pesi (`npm run foto`).
