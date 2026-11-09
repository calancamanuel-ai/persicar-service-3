// La forma dell'auto 3D: generica, stilizzata, senza loghi né griglie di marca.
// Tutto nasce dallo stesso profilo del disegno SVG dell'hero (viewBox 800×330): il disegno è il prospetto laterale
// di quest'auto, così il passaggio dal disegno al 3D non salta. Unità = unità del disegno; il gruppo viene scalato
// in metri (circa 4 m di lunghezza). Asse x lungo l'auto (davanti verso -x), y in alto (0 = terra), z di lato.
import {
  BoxGeometry, CanvasTexture, CylinderGeometry, ExtrudeGeometry, Group, LatheGeometry, Mesh, MeshBasicMaterial,
  MeshPhysicalMaterial, MeshStandardMaterial, PlaneGeometry, Shape, SRGBColorSpace, Sprite, SpriteMaterial, Vector2,
} from 'three';

export const SCALA = 0.0058;            // unità del disegno → metri
const X = (x) => x - 400;               // centro dell'auto
const Y = (y) => 320 - y;               // il disegno ha la y in giù; 320 = terra (fondo delle gomme)

// misure di larghezza (z), in unità del disegno
const CORPO = 260, SMUSSO = 20;          // carrozzeria: 260 + 2×20 = 300 (≈ 1,75 m)
const META = CORPO / 2 + SMUSSO;        // 150: fianco della carrozzeria
const ABITACOLO = 216;                  // abitacolo più stretto: si vede la rastremazione sopra la linea di cintura
const CORNICE = 10;                     // spessore dei montanti sui fianchi

const COLORI = {
  creta: '#B5B1A8', cretaScura: '#8F8B84', inchiostro: '#1C211F', foglio: '#F2F1EE', gomma: '#2A2D2C',
  verde: '#2E7D55',
};

// curve di Bézier quadratiche del profilo, punti (x, y) del disegno
const q = (a, b, c, t) => [
  (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * b[0] + t ** 2 * c[0],
  (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * b[1] + t ** 2 * c[1],
];
const campiona = (a, b, c, da = 0, a1 = 1, n = 16) => Array.from({ length: n + 1 }, (_, i) => q(a, b, c, da + ((a1 - da) * i) / n));
// il contorno esterno del tetto (carrozzeria) e quello dei vetri, come nel disegno
const ESTERNO = [[[236, 170], [300, 104], [372, 94]], [[372, 94], [520, 76], [640, 108]], [[640, 108], [704, 126], [726, 164]]];
const VETRI = [[[262, 168], [318, 114], [376, 106]], [[376, 106], [500, 92], [612, 114]], [[612, 114], [652, 128], [676, 166]]];

const forma = (punti) => {
  const s = new Shape();
  punti.forEach(([x, y], i) => (i ? s.lineTo(X(x), Y(y)) : s.moveTo(X(x), Y(y))));
  s.closePath();
  return s;
};
// estrude una forma e la centra sullo spessore: va da -larghezza/2 a +larghezza/2 (smusso compreso)
function estrudi(shape, profondita, smusso = 0, lato = 0) {
  const g = new ExtrudeGeometry(shape, {
    depth: profondita, curveSegments: 24, bevelEnabled: smusso > 0,
    bevelThickness: smusso, bevelSize: lato, bevelSegments: 4,
  });
  g.translate(0, 0, -profondita / 2);
  return g;
}

function carrozzeria() {
  // il corpo sotto la linea di cintura: muso, cofano, coda e passaruota
  const s = new Shape();
  s.moveTo(X(74), Y(262));
  s.lineTo(X(62), Y(236));
  s.quadraticCurveTo(X(56), Y(206), X(86), Y(196));
  s.lineTo(X(236), Y(170));
  s.lineTo(X(700), Y(163));
  s.quadraticCurveTo(X(718), Y(162), X(728), Y(168));
  s.lineTo(X(742), Y(204));
  s.quadraticCurveTo(X(752), Y(236), X(738), Y(262));
  s.lineTo(X(680), Y(262));
  s.absarc(X(610), Y(262), 70, 0, Math.PI, false);   // passaruota dietro
  s.lineTo(X(260), Y(262));
  s.absarc(X(190), Y(262), 70, 0, Math.PI, false);   // passaruota davanti
  s.closePath();
  return estrudi(s, CORPO, SMUSSO, 6);
}

function vetri() {
  const punti = [[248, 178], ...VETRI.flatMap(([a, b, c], i) => campiona(a, b, c).slice(i ? 1 : 0)), [688, 178]];
  return estrudi(forma(punti), ABITACOLO, 6, 2);
}

// il telaio dei finestrini (montanti e bordo del tetto) sui due fianchi
function montanti() {
  const fuori = ESTERNO.flatMap(([a, b, c], i) => campiona(a, b, c).slice(i ? 1 : 0));
  const dentro = VETRI.flatMap(([a, b, c], i) => campiona(a, b, c).slice(i ? 1 : 0)).reverse();
  return forma([...fuori, ...dentro]);
}

// il tetto: la fascia fra il profilo esterno e i vetri, solo nella parte alta, per tutta la larghezza
function tetto() {
  const fuori = [...campiona(...ESTERNO[0], 0.82, 1, 6), ...campiona(...ESTERNO[1], 0, 1, 20).slice(1), ...campiona(...ESTERNO[2], 0, 0.14, 4).slice(1)];
  const dentro = [...campiona(...VETRI[0], 0.9, 1, 4), ...campiona(...VETRI[1], 0, 1, 20).slice(1), ...campiona(...VETRI[2], 0, 0.12, 4).slice(1)].reverse();
  return estrudi(forma([...fuori, ...dentro]), ABITACOLO + 2 * CORNICE, 4, 1);
}

function gomma() {
  // sezione arrotondata della gomma, girata intorno all'asse
  const p = [[34, -17], [49, -17], [53.5, -15.5], [56, -11], [56, 11], [53.5, 15.5], [49, 17], [34, 17]].map(([r, y]) => new Vector2(r, y));
  const g = new LatheGeometry(p, 40);
  g.rotateX(Math.PI / 2);
  return g;
}

// un'etichetta tonda come i cerchietti della scheda: vuota col bordo d'inchiostro, piena di verde quando è spuntata
function texturePunto(scelto) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  x.beginPath();
  x.arc(64, 64, 44, 0, Math.PI * 2);
  x.fillStyle = scelto ? COLORI.verde : COLORI.foglio;
  x.fill();
  x.lineWidth = 14;
  x.strokeStyle = scelto ? COLORI.verde : COLORI.inchiostro;
  x.stroke();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function textureOmbra() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); // taste-skill-ignore: ombra di contatto del 3D, non HTML
  g.addColorStop(0, 'rgba(28,33,31,0.55)');
  g.addColorStop(0.55, 'rgba(28,33,31,0.22)');
  g.addColorStop(1, 'rgba(28,33,31,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

// le zone da toccare: segno (dove sta il cerchietto) e scatola di presa, grande per il pollice
export const ZONE = {
  luci: { segno: [-300, 112, META + 14], presa: [[-358, 86, -META - 10], [-282, 132, META + 10]] },
  tagliando: { segno: [-200, 162, 70], presa: [[-300, 132, -META - 10], [-130, 186, META + 10]] },
  freni: { segno: [-250, 98, META + 12], presa: [[-282, -4, -META - 30], [-136, 132, META + 30]] },
  gomme: { segno: [250, 98, META + 12], presa: [[136, -4, -META - 30], [282, 132, META + 30]] },
  revisione: { segno: [-362, 80, 0], presa: [[-380, 62, -90], [-340, 108, 90], [340, 62, -90], [380, 108, 90]] },
};

export function costruisciAuto() {
  const auto = new Group();
  auto.name = 'auto';
  auto.scale.setScalar(SCALA);

  const mat = {
    creta: new MeshPhysicalMaterial({ color: COLORI.creta, roughness: 0.5, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
    vetri: new MeshStandardMaterial({ color: COLORI.inchiostro, roughness: 0.14, metalness: 0.25 }),
    gomma: new MeshStandardMaterial({ color: COLORI.gomma, roughness: 0.92 }),
    cerchio: new MeshStandardMaterial({ color: COLORI.cretaScura, roughness: 0.38, metalness: 0.55 }),
    scuro: new MeshStandardMaterial({ color: COLORI.inchiostro, roughness: 0.6 }),
    faro: new MeshStandardMaterial({ color: COLORI.foglio, roughness: 0.2, emissive: COLORI.foglio, emissiveIntensity: 0.25 }),
    fanale: new MeshStandardMaterial({ color: COLORI.cretaScura, roughness: 0.3 }),
    targa: new MeshStandardMaterial({ color: COLORI.foglio, roughness: 0.6 }),
  };
  const aggiungi = (geo, m, nome) => { const o = new Mesh(geo, m); if (nome) o.name = nome; auto.add(o); return o; };

  aggiungi(carrozzeria(), mat.creta, 'carrozzeria');
  aggiungi(vetri(), mat.vetri, 'vetri');
  aggiungi(tetto(), mat.creta, 'tetto');
  const telaio = estrudi(montanti(), CORNICE, 2, 1);
  for (const lato of [-1, 1]) {
    aggiungi(telaio, mat.creta).position.z = lato * (ABITACOLO / 2 + CORNICE / 2);
  }
  // montante centrale
  aggiungi(new BoxGeometry(14, 70, ABITACOLO + 2 * CORNICE + 4), mat.creta).position.set(X(473), Y(134), 0);
  // la linea sul fianco, come nel disegno
  for (const lato of [-1, 1]) aggiungi(new BoxGeometry(632, 3, 1), mat.fanale).position.set(X(412), Y(214), lato * (META + 6.5));
  // fari (sui fianchi e sul muso), fanali dietro
  // i fari: una fascia di luce che segue il muso appena fuori dalla carrozzeria e gira sui fianchi
  aggiungi(estrudi(forma([[55, 215], [60, 207], [68, 199], [84, 193], [132, 188], [128, 207], [112, 215]]), 2 * META + 2), mat.faro, 'fari');
  aggiungi(new BoxGeometry(8, 9, 110), mat.scuro).position.set(X(58), Y(228), 0); // presa d'aria, senza marchio
  aggiungi(new BoxGeometry(22, 30, 2 * META + 4), mat.fanale).position.set(X(723), Y(185), 0);
  // targhe: bianche, con la cornice nera (la firma dell'officina, qui senza scritte)
  for (const [x, y, verso] of [[57, 240, -1], [753, 235, 1]]) {
    aggiungi(new BoxGeometry(6, 26, 98), mat.scuro).position.set(X(x), Y(y), 0);
    aggiungi(new BoxGeometry(6, 19, 90), mat.targa).position.set(X(x) + verso * 1.5, Y(y), 0);
  }
  // specchietti
  for (const lato of [-1, 1]) aggiungi(new BoxGeometry(12, 10, 24), mat.creta).position.set(X(268), Y(160), lato * (META + 10));

  // ruote: gomma, cerchio, mozzo
  const geoGomma = gomma();
  const geoCerchio = new CylinderGeometry(33, 33, 26, 40).rotateX(Math.PI / 2);
  const geoMozzo = new CylinderGeometry(9, 9, 30, 20).rotateX(Math.PI / 2);
  for (const x of [190, 610]) {
    for (const lato of [-1, 1]) {
      const z = lato * (META - 19);
      aggiungi(geoGomma, mat.gomma).position.set(X(x), Y(264), z);
      aggiungi(geoCerchio, mat.cerchio).position.set(X(x), Y(264), z);
      aggiungi(geoMozzo, mat.scuro).position.set(X(x), Y(264), z);
    }
  }

  // ombra di contatto: un piano con una sfumatura, niente shadow map
  const ombra = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: textureOmbra(), transparent: true, depthWrite: false }));
  ombra.rotation.x = -Math.PI / 2;
  ombra.scale.set(980, 420, 1);
  ombra.position.set(0, 0.5, 0);
  ombra.renderOrder = -1;
  auto.add(ombra);

  // le parti ferme non ricalcolano la matrice a ogni fotogramma
  auto.traverse((o) => { if (o !== auto) { o.updateMatrix(); o.matrixAutoUpdate = false; } });

  // segni e scatole di presa per ogni zona
  const texture = { vuoto: texturePunto(false), pieno: texturePunto(true) };
  const segni = {}, prese = [];
  const invisibile = new MeshBasicMaterial({ visible: false });
  for (const [voce, z] of Object.entries(ZONE)) {
    const s = new Sprite(new SpriteMaterial({ map: texture.vuoto, depthTest: true, depthWrite: false }));
    s.position.set(...z.segno);
    s.scale.setScalar(30);
    s.userData = { voce, scelto: false, impulso: 0 };
    s.renderOrder = 2;
    auto.add(s);
    segni[voce] = s;
    for (let i = 0; i < z.presa.length; i += 2) {
      const [a, b] = [z.presa[i], z.presa[i + 1]];
      const box = new Mesh(new BoxGeometry(b[0] - a[0], b[1] - a[1], b[2] - a[2]), invisibile);
      box.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
      box.userData.voce = voce;
      auto.add(box);
      prese.push(box);
    }
  }
  return { auto, segni, prese, texture };
}
