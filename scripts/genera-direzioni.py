"""Mockup del solo hero per le due direzioni moderne (ramo claude/direzione-moderna).

B "La firma sulla targa" (one-motif) e C "Il quadro strumenti" (dense-tiles). Stessi testi dell'hero de
"La scheda" (A), così si confronta solo la direzione. Nei mockup l'auto è il disegno statico: il 3D arriva
in fase 5. Stato mostrato: "tagliando" già spuntato.
Uso: python3 scripts/genera-direzioni.py  →  direzioni/b-targa.html, direzioni/c-quadro.html
"""

H1 = "Noi la tua auto<br>la conosciamo."
LEAD = ("Officina autorizzata Renault e Dacia in Via Cento 60, a San Giovanni in Persiceto. "
        "Scegli cosa serve alla tua auto: ti rispondiamo noi, su WhatsApp.")
MSG = "Buongiorno, vorrei prenotare: tagliando. Quando posso portarvi l'auto?"
WA = "https://wa.me/393667212576?text=Buongiorno%2C%20vorrei%20prenotare%3A%20tagliando.%20Quando%20posso%20portarvi%20l%27auto%3F"
TEL = "tel:+390516871521"
SCELTA = {"tagliando"}

VOCI = [("tagliando", "Tagliando"), ("freni", "Freni"), ("gomme", "Gomme"), ("cambio", "Cambio automatico"),
        ("clima", "Clima"), ("diagnosi", "Diagnosi e centraline"), ("luci", "Luci ed elettrauto"),
        ("revisione", "Revisione")]
ZONE = [("luci", "Fari", "Luci"), ("tagliando", "Cofano", "Tagliando"), ("revisione", "Targa", "Revisione"),
        ("freni", "Ruota anteriore", "Freni"), ("gomme", "Ruota posteriore", "Gomme")]
PUNTI = [("luci", 102, 205), ("tagliando", 178, 186), ("revisione", 732, 235), ("freni", 150, 226), ("gomme", 650, 226)]

SPUNTA = ('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" '
          'stroke="currentColor" stroke-width="3" stroke-linecap="square"/></svg>')


def auto():
    punti = "\n".join(
        f'      <circle class="auto__punto{" is-scelto" if v in SCELTA else ""}" data-voce="{v}" cx="{x}" cy="{y}" r="12"/>'
        for v, x, y in PUNTI)
    return f"""<svg class="auto" viewBox="0 0 800 330" role="img" aria-label="Disegno di un'auto generica, di profilo">
      <ellipse class="auto__ombra" cx="400" cy="300" rx="350" ry="16"/>
      <path class="auto__carrozzeria" d="M74 262 L62 236 Q56 206 86 196 L236 170 Q300 104 372 94 Q520 76 640 108 Q704 126 726 164 L742 204 Q752 236 738 262 L676 262 A66 66 0 0 0 544 262 L256 262 A66 66 0 0 0 124 262 Z"/>
      <path class="auto__vetri" d="M262 168 Q318 114 376 106 Q500 92 612 114 Q652 128 676 166 Z"/>
      <rect class="auto__montante" x="466" y="96" width="14" height="72"/>
      <path class="auto__linea" d="M96 214 L728 214"/>
      <path class="auto__faro" d="M70 214 Q72 200 90 198 L132 192 Q128 210 112 214 Z"/>
      <rect class="auto__fanale" x="712" y="170" width="22" height="30"/>
      <rect class="auto__targa" x="722" y="222" width="20" height="26"/>
      <g class="auto__ruota"><circle cx="190" cy="264" r="56"/><circle class="auto__cerchio" cx="190" cy="264" r="32"/><circle cx="190" cy="264" r="9"/></g>
      <g class="auto__ruota"><circle cx="610" cy="264" r="56"/><circle class="auto__cerchio" cx="610" cy="264" r="32"/><circle cx="610" cy="264" r="9"/></g>
{punti}
    </svg>"""


def zone():
    return "\n".join(
        f'    <button type="button" class="zona" data-voce="{v}" aria-pressed="{"true" if v in SCELTA else "false"}">'
        f'<span class="solo-lettore">{parte}: </span>{nome}</button>' for v, parte, nome in ZONE)


def caselle():
    return "\n".join(
        f'      <label class="voce"><input type="checkbox" value="{v}"{" checked" if v in SCELTA else ""}>'
        f'<span class="voce__casella" aria-hidden="true">{SPUNTA}</span><span>{n}</span></label>' for v, n in VOCI)


def barra():
    return f"""<nav class="barra" aria-label="Contatti rapidi">
  <a class="tasto tasto--wa" href="{WA}">Manda la richiesta · 1 lavoro</a>
  <a class="tasto tasto--chiama" href="{TEL}">Chiama</a>
</nav>"""


def testa(titolo, css):
    return f"""<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>{titolo} · Persicar Service (mockup)</title>
  <link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="./{css}">
</head>"""


B = f"""{testa("B · La firma sulla targa", "b-targa.css")}
<body class="b">
<div class="b-schermo">
<header class="b-testata">
  <a class="b-logo" href="#"><img src="/brand/logo-scuro.svg" alt="Persicar Service" width="220" height="52"></a>
  <p class="b-qualifica">Officina autorizzata Renault e Dacia · Revisioni</p>
  <nav class="b-nav" aria-label="Sezioni"><a href="#">Lavori</a><a href="#">Revisioni</a><a href="#">Orari</a></nav>
</header>
<main class="b-hero">
  <div class="b-testo">
    <h1>{H1}</h1>
    <p class="b-lead">{LEAD}</p>
    <div class="b-azioni">
      <a class="tasto tasto--wa" href="{WA}">Scrivici su WhatsApp</a>
      <a class="tasto tasto--chiama" href="{TEL}">Chiama 051 687 1521</a>
    </div>
    <p class="b-stato"><span class="b-stato__punto" aria-hidden="true"></span>Aperto adesso · fino alle 18:15</p>
  </div>
  <figure class="b-cornice">
    <div class="b-finestra">
    {auto()}
{zone()}
    </div>
    <figcaption class="b-fascia"><img src="/brand/logo-scuro.svg" alt="" width="220" height="52"><span>Via Cento 60 · San Giovanni in Persiceto</span></figcaption>
  </figure>
</main>
</div>
<fieldset class="b-lavori">
    <legend>Lavori richiesti</legend>
    <div class="b-voci">
{caselle()}
    </div>
    <p class="b-riepilogo">Hai scelto: tagliando.</p>
</fieldset>
{barra()}
</body>
</html>
"""

C = f"""{testa("C · Il quadro strumenti", "c-quadro.css")}
<body class="c">
<main class="c-plancia">
  <a class="c-tessera c-logo" href="#"><img src="/brand/logo-scuro.svg" alt="Persicar Service" width="220" height="52"></a>
  <nav class="c-tessera c-nav" aria-label="Sezioni">
    <p>Officina autorizzata Renault e Dacia · Revisioni</p>
    <span class="c-nav__link"><a href="#">Lavori</a><a href="#">Revisioni</a><a href="#">Officina</a><a href="#">Orari</a></span>
  </nav>
  <a class="c-tessera c-chiama" href="{TEL}"><span>Chiama</span><span class="c-cifre">051 687 1521</span></a>

  <section class="c-tessera c-titolo">
    <h1>{H1}</h1>
    <p class="c-lead">{LEAD}</p>
  </section>

  <figure class="c-tessera c-auto">
    <figcaption>Veicolo · tocca dove serve</figcaption>
    <div class="c-disegno">
    {auto()}
{zone()}
    </div>
  </figure>

  <figure class="c-tessera c-foto">
    <picture><source type="image/avif" srcset="/img/motore-vano-640.avif"><img src="/img/motore-vano-640.webp" alt="Vano motore di una spider anni '90 in officina" width="640" height="980"></picture>
    <figcaption>Dal lavoro di ogni giorno</figcaption>
  </figure>

  <fieldset class="c-tessera c-lavori">
    <legend>Lavori</legend>
    <div class="c-voci">
{caselle()}
    </div>
  </fieldset>

  <section class="c-tessera c-stato">
    <p class="c-stato__ora">Aperto adesso</p>
    <p class="c-cifre c-stato__fino">fino alle 18:15</p>
    <dl class="c-orari c-cifre"><div><dt>Lun–ven</dt><dd>8:30–12:30 · 14:30–18:15</dd></div><div><dt>Sab–dom</dt><dd>chiuso</dd></div></dl>
    <p class="c-stato__nota">Alla revisione pensiamo noi.</p>
  </section>

  <section class="c-tessera c-messaggio">
    <p class="c-messaggio__titolo">Il tuo messaggio</p>
    <p class="c-messaggio__testo">“{MSG}”</p>
    <a class="c-messaggio__tasto" href="{WA}">Scrivici su WhatsApp</a>
  </section>
</main>
{barra()}
</body>
</html>
"""

for nome, html in [("direzioni/b-targa.html", B), ("direzioni/c-quadro.html", C)]:
    open(nome, "w", encoding="utf-8").write(html)
    print(nome, len(html.encode("utf-8")), "byte")
