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

## Foto scelte (`foto-scelte/`, master in WebP senza perdita) → `public/img/`
Approvate dal cliente il 6/11: una foto per servizio, più revisioni, chi siamo e lavoro di tutti i giorni.
I numeri si riferiscono a `anteprima-fotogrammi.jpg`.

| File | Sezione | Fonte |
| --- | --- | --- |
| `tagliando-filtro-olio` | Cosa facciamo: tagliando e olio | fotogramma 14 (v3, 32,5 s) |
| `freni-disco` | Cosa facciamo: freni | fotogramma 6 (v3, 60 s) |
| `gomme-pressione` | Cosa facciamo: gomme | fotogramma 3 (v5, 42,25 s) |
| `sospensioni-ammortizzatore` | Cosa facciamo: sospensioni e assetto | vecchia `sospensioni.webp` |
| `cambio-coppa` | Cosa facciamo: cambio automatico (se confermato) | fotogramma 7 (v4, 53,25 s) |
| `motore-vano` | Cosa facciamo: diagnosi e motore | fotogramma 12 (v3, 12,75 s), marchio sfocato |
| `revisione-ponte` | Revisioni | fotogramma 2 (v4, 15,75 s), ovale sfocato |
| `officina-esterno` | Chi siamo (campo rosa) | vecchia `esterno.webp`, marchi sfocati |
| `officina-bussole` | Chi siamo | fotogramma 11 (v5, 15,5 s) |
| `lavoro-sottoscocca` | Dal lavoro di tutti i giorni | fotogramma 15 (v4, 28,75 s) |
| `lavoro-recupero-olio` | Dal lavoro di tutti i giorni | fotogramma 9 (v3, 14 s) |

- Pesi in `public/img/` (AVIF): circa 191 KB su telefono (640 px) e circa 447 KB su computer, di cui 218 KB per
  l'esterno a 1464 px. In WebP circa il 50% in più. I dettagli sono in `public/img/foto.json`.
- Sono le foto dell'officina stessa (dal suo Instagram), quindi non serve una riga di crediti.

## Foto di riserva (`foto-riserva/`, non pubblicate)
Fotogrammi 1, 5, 8, 10, 13 e 4 (la Focus al tramonto: l'auto è di un cliente e il logo sfocato si vede), più
quattro vecchie foto (Z3 sul ponte, carrello attrezzi, vano motore col guanto, straccio sulla coppa).

## Foto di persicar-service-2 (`foto-originali/`)
- Copiate tutte, tranne `hero.webp` (doppione di `esterno.webp`) e `clima.webp` (generata con l'IA).
- Pulite e usate solo quelle che i fotogrammi non coprono meglio.
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
- `anteprima-fotogrammi.jpg`: griglia dei 15 candidati. Scelta fatta: vedi "Foto scelte".

## Script
- `scripts/foto.mjs`: genera AVIF e WebP per telefono (640 px) e computer (larghezza piena fino a 1464 px),
  senza mai ingrandire, e stampa i pesi (`npm run foto`).
