#!/usr/bin/env python3
"""Genera index.html dalla struttura qui sotto: tiene uguali le parti ripetute (caselle, foto, zone).

    python3 scripts/genera-home.py
I testi vengono da copy.md (qui riportati a mano). Le misure delle foto da public/img/foto.json.
"""
import json
from html import escape

FOTO = {r["nome"]: r for r in json.load(open("public/img/foto.json"))}
WA = "https://wa.me/393667212576"
TEL = "tel:+390516871521"


def picture(nome, alt, sizes, lazy=True):
    r = FOTO[nome]
    v = r["varianti"]
    big = v[-1]
    src = lambda ext: ", ".join(f"/img/{nome}-{x['larghezza']}.{ext} {x['larghezza']}w" for x in v)
    load = ' loading="lazy" decoding="async"' if lazy else ' decoding="async"'
    return (f'<picture><source type="image/avif" srcset="{src("avif")}" sizes="{sizes}">'
            f'<source type="image/webp" srcset="{src("webp")}" sizes="{sizes}">'
            f'<img src="/img/{nome}-{v[0]["larghezza"]}.webp" alt="{escape(alt)}" width="{big["larghezza"]}" height="{big["altezza"]}"{load}></picture>')


SPUNTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"/></svg>'

VOCI = [  # valore, etichetta visibile, parola nel messaggio
    ("tagliando", "Tagliando", "tagliando"),
    ("freni", "Freni", "freni"),
    ("gomme", "Gomme", "gomme"),
    ("cambio", "Cambio automatico", "cambio automatico"),
    ("clima", "Clima", "clima"),
    ("diagnosi", "Diagnosi e centraline", "diagnosi e centraline"),
    ("luci", "Luci ed elettrauto", "luci ed elettrauto"),
    ("revisione", "Revisione", "revisione"),
]
voci = "\n".join(
    f'              <label class="voce"><input type="checkbox" name="lavori" value="{v}" data-parola="{p}"><span class="voce__casella" aria-hidden="true">{SPUNTA}</span><span class="voce__testo">{e}</span></label>'
    for v, e, p in VOCI)

ZONE = [  # voce, parte dell'auto, etichetta, posizione nel riquadro (fila sopra e fila sotto l'auto)
    ("luci", "Fari", "Luci", "2%", "11%", "sinistra"),
    ("tagliando", "Cofano", "Tagliando", "40%", "11%", "centro"),
    ("revisione", "Targa", "Revisione", "98%", "11%", "destra"),
    ("freni", "Ruota anteriore", "Freni", "24%", "93%", "centro"),
    ("gomme", "Ruota posteriore", "Gomme", "76%", "93%", "centro"),
]
zone = "\n".join(
    f'            <button type="button" class="zona" data-voce="{v}" aria-pressed="false"><span class="zona__segno" aria-hidden="true">{SPUNTA}</span><span class="solo-schermo-lettore">{parte}: </span>{lab}</button>'
    for v, parte, lab, x, y, al in ZONE)

# l'auto: una compatta a cinque porte di profilo, il tetto disegnato come la linea del logo. Muso a sinistra.
AUTO = '''<svg class="auto" viewBox="0 0 800 330" role="img" aria-labelledby="auto-titolo">
              <title id="auto-titolo">Disegno di un'auto generica, di profilo</title>
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
              <circle class="auto__punto" data-voce="luci" cx="102" cy="205" r="12"/>
              <circle class="auto__punto" data-voce="tagliando" cx="178" cy="186" r="12"/>
              <circle class="auto__punto" data-voce="revisione" cx="732" cy="235" r="12"/>
              <circle class="auto__punto" data-voce="freni" cx="150" cy="226" r="12"/>
              <circle class="auto__punto" data-voce="gomme" cx="650" cy="226" r="12"/>
            </svg>'''

LAVORO = [  # nome foto, alt, cartellino sinistra, destra, variante colore
    ("gomme-pressione", "Guanto arancione col manometro sulla valvola della gomma", "Gomme", "la pressione, col manometro", ""),
    ("sospensioni-ammortizzatore", "Mani coi guanti che montano un ammortizzatore", "Sospensioni", "ammortizzatore nuovo", " cartellino--scuro"),
    ("cambio-coppa", "Guanti arancioni sulla coppa del cambio automatico, appena pulita", "Cambio automatico", "la coppa, pulita", " cartellino--foglio"),
    ("motore-vano", "Vano motore di una spider anni Novanta col cofano aperto", "Motore", "spider anni '90", " cartellino--scuro"),
    ("lavoro-sottoscocca", "Due mani coi guanti arancioni al lavoro sotto l'auto", "Sotto l'auto", "sul ponte", " cartellino--foglio"),
    ("lavoro-recupero-olio", "Recupero dell'olio vecchio, coi ponti rossi dell'officina sullo sfondo", "Olio", "si recupera tutto", ""),
]
galleria = "\n".join(
    f'''          <figure class="foto foto--verticale galleria__foto">
            {picture(n, alt, "(min-width: 64em) 30vw, (min-width: 48em) 45vw, 46vw")}
            <figcaption class="cartellino{c}"><span class="cartellino__riga"><span>{escape(a)}</span><span>{escape(b)}</span></span></figcaption>
          </figure>''' for n, alt, a, b, c in LAVORO)

LISTINO = [
    ("Manutenzione", [
        ("Tagliando", "tutte le marche", "Olio, filtri e i controlli del libretto, anche sulle sportive."),
        ("Cambio automatico", "olio e filtro", "Scarichiamo l'olio vecchio, puliamo i tappi magnetici e riempiamo."),
        ("Clima", "ricarica e controllo", "Prima che arrivi il caldo, o quando l'aria non raffredda più."),
        ("Gomme", "cambio e pressione", "Cambio stagionale, montaggio e controllo della pressione."),
    ]),
    ("Riparazioni", [
        ("Freni", "dischi e pastiglie", "Li controlliamo e li cambiamo quando serve, non prima."),
        ("Sospensioni e assetto", "ammortizzatori", "Dalla molla stanca all'assetto rifatto, anche sulle auto d'epoca."),
        ("Diagnosi e centraline", "diagnosi elettronica", "Leggiamo gli errori e programmiamo le centraline."),
        ("Luci ed elettrauto", "fari e impianto", "Lampadine, fari, batteria e impianto elettrico."),
    ]),
]
listino = "\n".join(
    "              <div class=\"listino__gruppo\">\n"
    f"                <h3 class=\"listino__nome-gruppo\">{g}</h3>\n" +
    "\n".join(f'                <div class="riga"><span class="riga__nome">{escape(n)}</span><span class="riga__guida" aria-hidden="true"></span><span class="riga__valore">{escape(v)}</span><p class="riga__nota">{escape(d)}</p></div>' for n, v, d in righe) +
    "\n              </div>" for g, righe in LISTINO)

JSONLD = {
    "@context": "https://schema.org", "@type": "AutoRepair", "name": "Persicar Service",
    "description": "Officina autorizzata Renault e Dacia a San Giovanni in Persiceto. Tagliandi, freni, gomme, cambio automatico, clima, diagnosi e revisioni.",
    "telephone": "+39 051 687 1521",
    "email": "officinapersicarservice@gmail.com",
    "vatID": "IT04045401207",
    "address": {"@type": "PostalAddress", "streetAddress": "Via Cento, 60", "postalCode": "40017", "addressLocality": "San Giovanni in Persiceto", "addressRegion": "BO", "addressCountry": "IT"},
    "openingHoursSpecification": [
        {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "08:30", "closes": "12:30"},
        {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "14:30", "closes": "18:15"},
    ],
    "sameAs": ["https://www.instagram.com/persicarservice/"],
}

MAPPA = "https://www.google.com/maps/search/?api=1&query=Persicar+Service+Via+Cento+60+San+Giovanni+in+Persiceto"
RECENSIONI = "https://www.google.com/search?q=Persicar+Service+Autofficina+San+Giovanni+in+Persiceto+recensioni"

html = f'''<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Persicar Service · Officina Renault e Dacia a San Giovanni in Persiceto</title>
  <meta name="description" content="Officina autorizzata Renault e Dacia in Via Cento 60 a San Giovanni in Persiceto. Tagliandi, freni, gomme, cambio automatico, clima, diagnosi; alla revisione pensiamo noi. Prenoti su WhatsApp.">
  <meta name="theme-color" content="#D7D6D1">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="it_IT">
  <meta property="og:title" content="Persicar Service · Officina Renault e Dacia a San Giovanni in Persiceto">
  <meta property="og:description" content="Tre fratelli, un'officina sola. Scegli cosa serve alla tua auto e scrivici su WhatsApp.">
  <meta property="og:image" content="/img/officina-esterno-1200.webp">
  <link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/fonts/besley-800-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/libre-franklin-400-600-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/src/styles/sito.css">
  <script type="application/ld+json">{json.dumps(JSONLD, ensure_ascii=False)}</script>
  <script type="module" src="/src/js/main.js"></script>
</head>
<body>
  <a class="salta" href="#contenuto">Vai al contenuto</a>

  <div class="testata-fissa" aria-hidden="true">
    <div class="pagina testata-fissa__riga">
      <a class="logo" href="#contenuto" tabindex="-1"><img src="/brand/logo-chiaro.svg" alt="Persicar Service" width="220" height="52"></a>
      <a class="bottone bottone--whatsapp" href="{WA}" data-whatsapp tabindex="-1">Scrivici su WhatsApp</a>
    </div>
  </div>

  <main id="contenuto">
    <!-- 1. La scheda di accettazione -->
    <section class="hero pagina" aria-labelledby="titolo-hero">
      <div class="foglio foglio--denti-sotto hero__foglio">
        <header class="foglio__intestazione hero__testata">
          <a class="logo" href="/"><img src="/brand/logo-chiaro.svg" alt="Persicar Service" width="220" height="52"></a>
          <p class="piccolo forte hero__qualifica">Officina autorizzata Renault e Dacia · Revisioni</p>
          <nav class="testata__nav" aria-label="Sezioni">
            <a class="testata__link" href="#lavori">Lavori</a>
            <a class="testata__link" href="#revisioni">Revisioni</a>
            <a class="testata__link" href="#officina">Officina</a>
            <a class="testata__link" href="#orari">Orari</a>
          </nav>
        </header>

        <div class="hero__corpo">
          <div class="hero__titolo">
            <h1 id="titolo-hero" class="display">Noi la tua auto la conosciamo.</h1>
            <p class="lead">Officina autorizzata Renault e Dacia in Via Cento 60, a San Giovanni in Persiceto. Scegli cosa serve alla tua auto: ti rispondiamo noi, su WhatsApp.</p>
          </div>

          <figure class="hero__veicolo">
            <figcaption class="piccolo forte hero__veicolo-titolo">Veicolo</figcaption>
            <div class="hero__disegno">
            {AUTO}
{zone}
            </div>
            <p class="piccolo tenue hero__veicolo-nota">Tocca l'auto dove serve, o spunta i lavori.</p>
          </figure>

          <div class="hero__lavori scheda-lavori">
            <div class="scheda-lavori__testa" aria-hidden="true">
              <p class="forte">Lavori richiesti</p>
              <span class="timbro timbro--ricevuto"><span class="timbro__grande">Ricevuto</span><span class="timbro__piccolo">Persicar Service · Via Cento 60</span></span>
            </div>
            <fieldset class="voci-contenitore">
              <legend class="solo-schermo-lettore">Lavori richiesti</legend>
              <div class="voci">
{voci}
              </div>
            </fieldset>
            <p class="scheda-lavori__riepilogo" data-riepilogo aria-live="polite">Spunta i lavori, il messaggio lo scriviamo noi.</p>
            <div class="hero__azioni">
              <a class="bottone bottone--whatsapp" href="{WA}" data-whatsapp>Scrivici su WhatsApp</a>
              <a class="bottone bottone--secondario" href="{TEL}">Chiama</a>
            </div>
            <p class="stato" data-stato>Lun–ven 8:30–12:30 e 14:30–18:15</p>
          </div>
        </div>

        <div class="strappo hero__strappo">
          <p class="forte cifre">Via Cento 60, San Giovanni in Persiceto</p>
          <p class="cifre">Lun–ven 8:30–12:30 e 14:30–18:15 · sabato e domenica chiuso</p>
        </div>
      </div>
    </section>

    <!-- 2. Cosa facciamo: il listino -->
    <section id="lavori" class="sezione pagina lavori" aria-labelledby="titolo-lavori">
      <div class="lavori__testa sezione-testa">
        <h2 id="titolo-lavori" class="titolo">Cosa facciamo</h2>
        <p class="lead">Siamo autorizzati Renault e Dacia e lavoriamo su tutte le marche, dalla city car di tutti i giorni alle sportive.</p>
      </div>
      <div class="lavori__corpo">
        <div class="foglio foglio--denti-sopra foglio--denti-sotto lavori__listino">
          <div class="listino">
{listino}
              <div class="listino__gruppo">
                <div class="riga"><span class="riga__nome">Revisione</span><span class="riga__guida" aria-hidden="true"></span><span class="riga__valore">la portiamo noi</span><p class="riga__nota"><a class="link" href="#revisioni">Come funziona la revisione</a></p></div>
              </div>
          </div>
        </div>
        <div class="lavori__foto">
          <figure class="foto foto--verticale lavori__spillata lavori__spillata--prima">
            {picture("tagliando-filtro-olio", "Mano col guanto nero che regge il filtro dell'olio nuovo", "(min-width: 64em) 24vw, 46vw")}
            <figcaption class="cartellino"><span class="cartellino__riga"><span>Tagliando</span><span>filtro nuovo</span></span></figcaption>
          </figure>
          <figure class="foto foto--verticale lavori__spillata lavori__spillata--seconda">
            {picture("freni-disco", "Disco del freno e molla, con la ruota smontata", "(min-width: 64em) 24vw, 46vw")}
            <figcaption class="cartellino cartellino--scuro"><span class="cartellino__riga"><span>Freni</span><span>disco e molla</span></span></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- 3. Dal lavoro di tutti i giorni -->
    <section id="lavoro" class="sezione pagina galleria" aria-labelledby="titolo-galleria">
      <div class="galleria__testa sezione-testa">
        <h2 id="titolo-galleria" class="titolo">Dal lavoro di tutti i giorni</h2>
        <p class="lead">Foto vere, dall'officina. I lavori di tutti i giorni li mettiamo su Instagram: <a class="link" href="https://www.instagram.com/persicarservice/">@persicarservice</a>.</p>
      </div>
      <div class="galleria__griglia">
{galleria}
      </div>
    </section>

    <!-- 4. Revisioni: il percorso su una ricevuta -->
    <section id="revisioni" class="sezione pagina revisioni" aria-labelledby="titolo-revisioni">
      <div class="revisioni__testo">
        <h2 id="titolo-revisioni" class="titolo">Alla revisione pensiamo noi</h2>
        <p class="lead">Lasciaci l'auto e al resto pensiamo noi: la portiamo in revisione e te la riconsegniamo pronta.</p>
        <dl class="revisioni__fatti">
          <div><dt class="forte">Quando</dt><dd>La prima revisione si fa quattro anni dopo l'immatricolazione, poi ogni due anni, entro il mese della scadenza.</dd></div>
          <div><dt class="forte">Cosa portare</dt><dd>Il documento unico, o la vecchia carta di circolazione.</dd></div>
        </dl>
        <figure class="foto foto--verticale revisioni__foto">
          {picture("revisione-ponte", "Una berlina sul ponte, sotto la volta dell'officina", "(min-width: 64em) 22vw, 60vw")}
          <figcaption class="foto__didascalia">Sul ponte, sotto la volta dell'officina.</figcaption>
        </figure>
      </div>
      <div class="foglio foglio--denti-sotto revisioni__ricevuta">
        <h3 class="revisioni__ricevuta-titolo">Come funziona</h3>
        <dl class="percorso">
          <div class="percorso__passo"><dt>Prima</dt><dd>ci scrivi su WhatsApp e fissiamo il giorno.</dd></div>
          <div class="percorso__passo"><dt>Poi</dt><dd>porti l'auto in Via Cento e la lasci a noi.</dd></div>
          <div class="percorso__passo"><dt>Intanto</dt><dd>la portiamo noi in revisione.</dd></div>
          <div class="percorso__passo"><dt>Alla fine</dt><dd>te la riconsegniamo pronta, con l'esito.</dd></div>
        </dl>
        <p class="strappo revisioni__nota">Se vuoi, prima facciamo un controllo o il tagliando: così la porti una volta sola.</p>
      </div>
    </section>

    <!-- 5. L'officina: campo scuro -->
    <section id="officina" class="campo-scuro su-campo officina" aria-labelledby="titolo-officina">
      <div class="pagina sezione officina__griglia">
        <div class="officina__lettera-colonna">
          <img class="officina__logo" src="/brand/logo-scuro.svg" alt="" width="220" height="52">
          <h2 id="titolo-officina" class="titolo">Un'officina sola</h2>
          <div class="foglio foglio--denti-sotto officina__lettera">
            <p>Siamo tre fratelli e questa è la nostra officina, in Via Cento 60.</p>
            <p>Siamo autorizzati Renault e Dacia, ma qui entra ogni marca: l'utilitaria che usi tutti i giorni come la sportiva della domenica.</p>
            <p>Chi ti risponde su WhatsApp è chi lavora sulla tua auto. Niente centralino, niente passaggi: ci dici cosa serve, ti diciamo quando portarla.</p>
            <p>E prima di mettere mano, ti spieghiamo cosa facciamo e perché.</p>
            <p class="officina__firma">I tre fratelli di Persicar Service</p>
            <p class="strappo officina__strappo cifre"><span>Via Cento 60</span><a class="link" href="{TEL}">051 687 1521</a></p>
          </div>
        </div>
        <div class="officina__foto">
          <figure class="foto foto--orizzontale officina__esterno">
            {picture("officina-esterno", "Il capannone dell'officina in Via Cento, con due auto parcheggiate davanti", "(min-width: 64em) 46vw, 92vw")}
            <figcaption class="foto__didascalia">Il capannone in Via Cento.</figcaption>
          </figure>
          <figure class="foto foto--verticale officina__bussole">
            {picture("officina-bussole", "La cassetta delle bussole, ogni attrezzo al suo posto", "(min-width: 64em) 20vw, 46vw")}
            <figcaption class="foto__didascalia">Ogni attrezzo al suo posto.</figcaption>
          </figure>
        </div>
        <p class="officina__recensioni lead">Cosa dicono di noi: <a class="link" href="{RECENSIONI}">leggi le recensioni su Google</a>.</p>
        <div class="recensioni" data-recensioni hidden></div>
      </div>
    </section>

    <!-- 6. Orari e dove siamo: il biglietto -->
    <section id="orari" class="sezione pagina orari" aria-labelledby="titolo-orari">
      <div class="foglio orari__biglietto">
        <h2 id="titolo-orari" class="titolo">Orari e dove siamo</h2>
        <address class="orari__indirizzo">Via Cento 60<br>40017 San Giovanni in Persiceto (BO)</address>
        <table class="orari__tabella">
          <caption class="solo-schermo-lettore">Orari di apertura</caption>
          <tbody>
            <tr><th scope="row">Lunedì–venerdì</th><td>8:30–12:30 e 14:30–18:15</td></tr>
            <tr><th scope="row">Sabato e domenica</th><td>chiuso</td></tr>
          </tbody>
        </table>
        <p class="stato" data-stato>Lun–ven 8:30–12:30 e 14:30–18:15</p>
        <p class="orari__contatti cifre"><a class="link" href="{TEL}">Telefono 051 687 1521</a> · <a class="link" href="{WA}" data-whatsapp>WhatsApp 366 721 2576</a></p>
        <div class="orari__azioni">
          <a class="bottone bottone--secondario" href="{MAPPA}">Indicazioni</a>
          <a class="bottone bottone--whatsapp orari__whatsapp" href="{WA}" data-whatsapp>Scrivici su WhatsApp</a>
        </div>
      </div>
      <figure class="foto foto--verticale orari__foto">
        {picture("arrivo-focus", "Una Focus RS bianca, appena uscita dal tagliando, col sole dietro", "(min-width: 64em) 38vw, 92vw")}
        <figcaption class="foto__didascalia">Una Focus RS appena uscita dal tagliando.</figcaption>
      </figure>
    </section>
  </main>

  <!-- 7. Il retro della scheda -->
  <footer class="pagina piede">
    <div class="foglio foglio--denti-sopra piede__retro">
      <div class="piede__saluto">
        <p class="titolo">A presto in Via Cento.</p>
        <p>Per prenotare scrivici su WhatsApp, per una cosa veloce chiamaci. Se passi, ci trovi in officina.</p>
      </div>
      <div class="piede__contatti">
        <span class="timbro piede__timbro" aria-hidden="true"><span class="timbro__grande">Persicar Service</span><span class="timbro__piccolo">Via Cento 60 · San Giovanni in Persiceto</span></span>
        <ul class="piede__lista">
          <li><a class="link" href="{WA}" data-whatsapp>WhatsApp 366 721 2576</a></li>
          <li><a class="link" href="{TEL}">Telefono 051 687 1521</a></li>
          <li><a class="link" href="mailto:officinapersicarservice@gmail.com">officinapersicarservice@<wbr>gmail.com</a></li>
          <li><a class="link" href="https://www.instagram.com/persicarservice/">Instagram @persicarservice</a></li>
        </ul>
      </div>
      <p class="piccolo tenue piede__imprint">Persicar Service S.r.l.s. · Via Cento 60, 40017 San Giovanni in Persiceto (BO) · P.IVA 04045401207 · <a class="link" href="/privacy.html">Privacy</a> · <a class="link" href="/cookie.html">Cookie</a></p>
    </div>
  </footer>

  <nav class="barra-pollice" aria-label="Contatti rapidi">
    <a class="bottone bottone--whatsapp" href="{WA}" data-whatsapp data-barra>Scrivici su WhatsApp</a>
    <a class="bottone bottone--secondario" href="{TEL}">Chiama</a>
  </nav>
</body>
</html>
'''
open("index.html", "w", encoding="utf-8").write(html)
print("index.html", len(html), "byte")
