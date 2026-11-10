// La scena dell'auto 3D: luce naturale, ombra di contatto, nessuna post-produzione.
// Si disegna solo quando qualcosa si muove (entrata, trascinamento, spunta). Le zone si toccano sull'auto oppure
// coi bottoni HTML: il 3D non decide niente da solo, clicca il bottone della zona e ascolta l'evento dei lavori.
import {
  Box3, DirectionalLight, Group, NeutralToneMapping, PerspectiveCamera, PMREMGenerator, Raycaster, Scene, Timer, Vector2,
  Vector3, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { costruisciAuto } from './forma.js';
import { numero, tempo } from '../movimento.js';

// pose e gesti dell'auto; i tempi vengono dai token (tokens.css), come per il resto del sito
const IMBARDATA_RIPOSO = 0.42;  // radianti: tre quarti anteriore, il muso verso chi guarda (è la posa della foto di attesa)
const SMORZAMENTO = 9;          // costante fisica, non un tempo: l'auto raggiunge la posa voluta con un ease-out esponenziale (≈0,25 s)
const SOGLIA_TOCCO = 6;         // px: sotto è un tocco, sopra è un trascinamento
const GIRI_PER_PX = 0.0105;
const IMPULSO = tempo('--t-ui') / 1000;          // s: il cerchietto che si spunta cresce e torna, sotto i 300 ms
const GIRO_SCROLL = numero('--auto-giro-scroll') || 0; // radianti: quanto gira mentre la scheda esce dallo schermo
const DIAMETRO_SEGNO = 30;      // unità del disegno (≈ 17 cm): il cerchietto si vede come nel disegno

export async function monta(stage) {
  const canvas = document.createElement('canvas');
  canvas.className = 'auto3d';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', "Auto 3D: trascinala per girarla, tocca una parte per spuntare il lavoro. Le stesse scelte sono nei bottoni e nelle caselle.");
  stage.append(canvas);

  const tattile = matchMedia('(pointer: coarse)').matches;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  // al massimo 2: il riquadro è piccolo (su telefono circa 280 × 120 px), quindi costa poco, e il 3D resta nitido
  // quanto la foto di attesa che sostituisce
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.75;
  pmrem.dispose();
  // la luce principale: calda, alta e di lato, come da una finestra
  const sole = new DirectionalLight(0xfff1e0, 1.35);
  sole.position.set(-3, 5, 4);
  scene.add(sole);

  const { auto, segni, prese, texture } = costruisciAuto();
  const perno = new Group(); // gira intorno al centro dell'auto
  perno.add(auto);
  scene.add(perno);

  const camera = new PerspectiveCamera(22, 2, 0.1, 60);
  const centro = new Vector3(0, 0.6, 0);
  // gli spigoli dell'ingombro dell'auto (metri), girati come a riposo e di profilo: l'inquadratura li contiene tutti
  const spigoli = [];
  for (const a of [IMBARDATA_RIPOSO, 0]) {
    for (const x of [-2.04, 2.04]) for (const y of [0, 1.32]) for (const z of [-0.88, 0.88]) {
      spigoli.push(new Vector3(x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)));
    }
  }
  const p = new Vector3();
  const inquadra = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // la prospettiva ingrandisce il muso girato verso chi guarda: si centra e si allontana la camera finché
    // l'ingombro proiettato sta nel riquadro, col 6% di margine in larghezza e il 10% in altezza
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    let d = Math.max(4.3 / (2 * tan * camera.aspect), 1.9 / (2 * tan));
    centro.set(0, 0.6, 0);
    for (let i = 0; i < 6; i++) {
      camera.position.set(centro.x, centro.y + d * 0.24, d);
      camera.lookAt(centro);
      camera.updateMatrixWorld();
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const s of spigoli) {
        p.copy(s).project(camera);
        x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
      }
      centro.x += ((x0 + x1) / 2) * d * tan * camera.aspect;
      centro.y += ((y0 + y1) / 2) * d * tan;
      d *= Math.max((x1 - x0) / 2 / 0.94, (y1 - y0) / 2 / 0.9);
    }
    camera.position.set(centro.x, centro.y + d * 0.24, d);
    camera.lookAt(centro);
    richiedi();
  };

  // stato del movimento: la posa voluta è riposo + quanto l'hai girata tu + quanto è scorsa la pagina
  // il 3D parte fermo nella posa della foto di attesa (public/img/auto-posa-*): quando prende il suo posto non cambia niente
  let imbardata = IMBARDATA_RIPOSO, girata = 0, voluta = IMBARDATA_RIPOSO;
  // la scena di scroll: mentre la scheda esce dallo schermo l'auto gira, lineare con lo scorrimento (da 0 a 1
  // fra la cima della pagina e il momento in cui il riquadro dell'auto è uscito in alto). Niente pin.
  const giroScroll = () => {
    const fondo = stage.getBoundingClientRect().bottom + scrollY;
    return fondo > 0 ? Math.min(1, Math.max(0, scrollY / fondo)) * GIRO_SCROLL : 0;
  };
  const aggiornaVoluta = () => { voluta = IMBARDATA_RIPOSO + girata + giroScroll(); };
  const timer = new Timer();
  timer.connect(document);
  let attivo = false;

  function fotogramma() {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    let ancora = false;
    const diff = voluta - imbardata;
    if (Math.abs(diff) > 0.0005) { imbardata += diff * (1 - Math.exp(-SMORZAMENTO * dt)); ancora = true; } else imbardata = voluta;
    perno.rotation.y = imbardata;
    for (const s of Object.values(segni)) {
      if (s.userData.impulso > 0) {
        s.userData.impulso = Math.max(0, s.userData.impulso - dt / IMPULSO);
        const k = Math.sin(s.userData.impulso * Math.PI);
        s.scale.setScalar(DIAMETRO_SEGNO * (1 + 0.3 * k));
        ancora = true;
      }
    }
    renderer.render(scene, camera);
    if (!ancora) { renderer.setAnimationLoop(null); attivo = false; }
  }
  function richiedi() {
    if (attivo) return;
    attivo = true;
    timer.update();
    renderer.setAnimationLoop(fotogramma);
  }

  // i lavori spuntati: arrivano da prenota.js, qualunque sia stato il gesto (auto, bottone o casella)
  const aggiornaSegni = (voci) => {
    for (const [voce, s] of Object.entries(segni)) {
      const scelto = voci.includes(voce);
      if (scelto !== s.userData.scelto) {
        s.userData.scelto = scelto;
        s.material.map = scelto ? texture.pieno : texture.vuoto;
        s.material.needsUpdate = true;
        if (scelto) s.userData.impulso = 1;
      }
    }
    richiedi();
  };
  const voci = () => [...document.querySelectorAll('input[name="lavori"]:checked')].map((c) => c.value);
  aggiornaSegni(voci());
  document.addEventListener('lavori:aggiornati', (e) => aggiornaSegni(e.detail.voci));

  // tocco e trascinamento: niente OrbitControls, la pagina continua a scorrere in verticale (touch-action: pan-y)
  const raycaster = new Raycaster();
  const puntatore = new Vector2();
  const colpita = (e) => {
    const r = canvas.getBoundingClientRect();
    puntatore.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(puntatore, camera);
    return raycaster.intersectObjects(prese, false)[0]?.object.userData.voce;
  };
  let inizio = null;
  canvas.addEventListener('pointerdown', (e) => {
    inizio = { x: e.clientX, y: e.clientY, girata, trascina: false, id: e.pointerId };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!inizio) {
      if (!tattile) canvas.style.cursor = colpita(e) ? 'pointer' : 'grab';
      return;
    }
    const dx = e.clientX - inizio.x;
    if (!inizio.trascina && Math.abs(dx) > SOGLIA_TOCCO && Math.abs(dx) > Math.abs(e.clientY - inizio.y)) {
      inizio.trascina = true;
      canvas.setPointerCapture(inizio.id);
      canvas.style.cursor = 'grabbing';
    }
    if (inizio.trascina) { girata = inizio.girata + dx * GIRI_PER_PX; aggiornaVoluta(); richiedi(); }
  });
  const fine = (e) => {
    if (!inizio) return;
    const tocco = !inizio.trascina && e.type === 'pointerup';
    inizio = null;
    if (!tattile) canvas.style.cursor = 'grab';
    if (!tocco) return;
    const voce = colpita(e);
    if (voce) document.querySelector(`.zona[data-voce="${voce}"]`)?.click();
  };
  canvas.addEventListener('pointerup', fine);
  canvas.addEventListener('pointercancel', fine);

  new ResizeObserver(inquadra).observe(canvas);
  // fuori dallo schermo non si disegna niente
  let inVista = true;
  new IntersectionObserver(([v]) => { inVista = v.isIntersecting; if (inVista) { aggiornaVoluta(); richiedi(); } else { renderer.setAnimationLoop(null); attivo = false; } }).observe(canvas);
  // lo scorrimento muove solo la posa voluta; il fotogramma la raggiunge con lo smorzamento di sempre
  addEventListener('scroll', () => { if (inVista && GIRO_SCROLL) { aggiornaVoluta(); richiedi(); } }, { passive: true });

  inquadra();
  aggiornaVoluta();
  imbardata = voluta;
  await renderer.compileAsync(scene, camera);
  renderer.render(scene, camera);
  stage.classList.add('is-3d');
  richiedi();

  // per le prove: dove sta sullo schermo il cerchietto di una zona, e quanto costa disegnare
  const v = new Vector3();
  stage.auto3d = {
    posizione(voce) {
      segni[voce].getWorldPosition(v).project(camera);
      const r = canvas.getBoundingClientRect();
      return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
    },
    info: () => ({ chiamate: renderer.info.render.calls, triangoli: renderer.info.render.triangles, texture: renderer.info.memory.textures }),
    imbardata: () => imbardata,
    gira(a) { girata = a - IMBARDATA_RIPOSO - giroScroll(); aggiornaVoluta(); richiedi(); },
    voluta: () => voluta,
    ingombro: () => new Box3().setFromObject(auto),
  };
  return stage.auto3d;
}
