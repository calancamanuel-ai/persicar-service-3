"""Genera le pagine di servizio: privacy.html, cookie.html e 404.html.

Testi semplici e onesti, del tu. Sono bozze: prima del lancio vanno fatte verificare a un consulente
(vedi MANCANTI.md). Restano evidenziati (data-da-confermare) solo il fornitore di hosting e la riga della bozza.
Uso: python3 scripts/genera-pagine.py
"""

AGGIORNATO = "7 novembre 2026"
WA = "https://wa.me/393667212576"
TEL = "tel:+390516871521"
PIVA = '04045401207'
EMAIL = '<a class="link" href="mailto:officinapersicarservice@gmail.com">officinapersicarservice@<wbr>gmail.com</a>'
BOZZA = ('<p class="piccolo legale__bozza"><span data-da-confermare>Bozza da far verificare a un consulente '
         'prima della pubblicazione.</span></p>')


def pagina(nome, titolo, descrizione, corpo, indicizza=True):
    classe = "pagina legale" + (" legale--breve" if nome == "404.html" else "")
    robots = "" if indicizza else '\n  <meta name="robots" content="noindex">'
    return f"""<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{titolo} · Persicar Service</title>
  <meta name="description" content="{descrizione}">{robots}
  <meta name="theme-color" content="#D7D6D1">
  <link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/fonts/besley-800-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/libre-franklin-400-600-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/src/styles/pagine.css">
</head>
<body>
  <a class="salta" href="#contenuto">Vai al contenuto</a>
  <div class="{classe}">
    <div class="foglio foglio--denti-sotto">
      <header class="foglio__intestazione legale__testata">
        <a class="logo" href="/"><img src="/brand/logo-chiaro.svg" alt="Persicar Service, torna alla home" width="220" height="52"></a>
        <a class="link piccolo forte" href="/">Torna alla home</a>
      </header>
      <main id="contenuto" class="legale__corpo">
{corpo}
      </main>
    </div>
    <footer class="legale__piede">
      <p class="piccolo tenue">Persicar Service S.r.l.s. · Via Cento 60, 40017 San Giovanni in Persiceto (BO) · P.IVA {PIVA} · <a class="link" href="/privacy.html">Privacy</a> · <a class="link" href="/cookie.html">Cookie</a></p>
    </footer>
  </div>
</body>
</html>
"""


PRIVACY = f"""        <h1 class="titolo">Privacy</h1>
        <p class="lead">Questo sito non ha moduli e non ti chiede dati. Li trattiamo solo quando ci scrivi o ci chiami.</p>
        {BOZZA}

        <h2>Chi tratta i tuoi dati</h2>
        <p>Persicar Service S.r.l.s., Via Cento 60, 40017 San Giovanni in Persiceto (BO), P.IVA {PIVA}. Per qualsiasi domanda sulla privacy scrivici a {EMAIL} o chiamaci allo <a class="link" href="{TEL}">051 687 1521</a>.</p>

        <h2>Quali dati e perché</h2>
        <p>Quando ci scrivi su WhatsApp o ci chiami usiamo il tuo numero, il tuo nome e quello che ci racconti della tua auto (per esempio modello e targa) per risponderti, fissare l'appuntamento e fare il lavoro. Se poi lasci l'auto in officina, i dati servono anche per i documenti che la legge ci chiede, come la fattura.</p>
        <p>Il messaggio che parte dal bottone "Scrivici su WhatsApp" lo componi tu sul sito, ma lo leggiamo solo quando decidi di mandarlo. Prima di allora non arriva a nessuno.</p>

        <h2>Su che base</h2>
        <p>Rispondere a una tua richiesta e fare il lavoro che ci chiedi (art. 6.1.b del GDPR); rispettare gli obblighi di legge, per esempio fiscali (art. 6.1.c).</p>

        <h2>Per quanto tempo</h2>
        <p>I messaggi e i dati dell'appuntamento li teniamo per il tempo che serve a seguire il lavoro. I documenti fiscali li conserviamo per il tempo previsto dalla legge, di solito dieci anni.</p>

        <h2>Con chi li condividiamo</h2>
        <p>Con nessuno per pubblicità o marketing, e non li vendiamo. Possono vederli solo chi ci aiuta a lavorare, come il commercialista, e i servizi che usi per scriverci: WhatsApp è un servizio di WhatsApp Ireland Ltd., con la sua informativa.</p>
        <p>Il sito è ospitato da <span data-da-confermare>[fornitore di hosting da scegliere]</span>, che per sicurezza può registrare dati tecnici delle visite, come l'indirizzo IP e l'ora.</p>

        <h2>I tuoi diritti</h2>
        <p>Puoi chiederci in ogni momento di vedere i tuoi dati, correggerli, cancellarli, limitarne l'uso o opporti. Basta un messaggio. Se pensi che non li abbiamo trattati bene puoi rivolgerti al Garante per la protezione dei dati personali (garanteprivacy.it).</p>

        <p class="piccolo tenue">Ultimo aggiornamento: {AGGIORNATO}.</p>"""

COOKIE = f"""        <h1 class="titolo">Cookie</h1>
        <p class="lead">Questo sito non usa cookie e non salva niente sul tuo dispositivo. Per questo non trovi nessun banner.</p>
        {BOZZA}

        <h2>Cosa c'è e cosa no</h2>
        <p>Niente statistiche, niente pubblicità, niente mappe o video incorporati. I caratteri e le foto stanno sul nostro sito, non su quelli di altri.</p>

        <h2>Quando esci dal sito</h2>
        <p>I link a WhatsApp, Google Maps, alle recensioni su Google e a Instagram ti portano sui loro siti. Lì valgono le loro regole sui cookie, che trovi nelle loro pagine.</p>

        <h2>Se cambia qualcosa</h2>
        <p>Se un giorno aggiungeremo qualcosa che usa i cookie, lo scriveremo qui e te lo chiederemo prima.</p>

        <p class="piccolo tenue">Ultimo aggiornamento: {AGGIORNATO}.</p>"""

NON_TROVATA = f"""        <h1 class="titolo">Questa pagina non c'è.</h1>
        <p class="lead">Forse il link è vecchio, o c'è un errore nell'indirizzo. La scheda per prenotare è nella home.</p>
        <div class="legale__azioni">
          <a class="bottone bottone--secondario" href="/">Torna alla home</a>
          <a class="bottone bottone--whatsapp" href="{WA}">Scrivici su WhatsApp</a>
        </div>"""

PAGINE = [
    ("privacy.html", "Privacy", "Come Persicar Service tratta i dati di chi scrive o chiama l'officina.", PRIVACY, True),
    ("cookie.html", "Cookie", "Il sito di Persicar Service non usa cookie.", COOKIE, True),
    ("404.html", "Pagina non trovata", "Questa pagina non c'è.", NON_TROVATA, False),
]

for nome, titolo, descrizione, corpo, indicizza in PAGINE:
    html = pagina(nome, titolo, descrizione, corpo, indicizza)
    open(nome, "w", encoding="utf-8").write(html)
    print(nome, len(html.encode("utf-8")), "byte")
