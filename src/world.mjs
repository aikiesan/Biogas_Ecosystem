// Monta o diorama isométrico do ecossistema do biogás.
// Geometria (câmera, extrusão, sombreamento em 4 tons) vem do kit do Anatomy
// (src/vendor/iso-kit.mjs, MIT). Cores seguem a identidade visual do CP2B.
import * as K from "./vendor/iso-kit.mjs";

export const P = { origin: [0, 0], scale: 1 };
const CAM = K.cameraOf(P);
const KS = CAM.k;
const R = (n) => Math.round(n * 10) / 10;
export const iso = (p) => K.iso(p, P);
const depth = (p) => K.depthOf(p, P);
const pt = (p) => { const [x, y] = iso(p); return `${R(x)},${R(y)}`; };
const pathOf = (pts, closed = false) => "M" + pts.map(pt).join("L") + (closed ? "Z" : "");
const VIEW = K.towardViewer(P);

// ---------------------------------------------------------------- materiais
// Paleta CP2B (Manual de Identidade Visual 2025) + tons de apoio.
export const MATERIALS = {
  base: "#2B5263",      // laterais do diorama (azul petróleo clareado)
  grass: "#CFE5B4",
  grassDark: "#9CCB72",
  soil: "#C9A27A",
  plotAgro: "#DDEDC3",
  plotPec: "#EADCC6",
  plotInd: "#E5E1D6",
  plotUrb: "#D7E6EE",
  plant: "#EEF2F3",
  city: "#E9EEF0",
  road: "#B8C4C9",
  concrete: "#E3E8EA",
  wall: "#F7F7F4",
  steel: "#D6DEE2",
  steelDark: "#9AAAB2",
  petrol: "#1E3E4C",
  green: "#00573A",
  leaf: "#5CA032",
  lima: "#B6E03B",
  amber: "#D37402",
  ochre: "#A15500",
  roofRed: "#C86B45",
  roofGrey: "#8FA3AC",
  roofGreen: "#3E7F4F",
  water: "#8CC3D9",
  manure: "#7A5230",
  digestate: "#6B4A2B",
  cane: "#7DB843",
  straw: "#E2C268",
  bagasse: "#D8B98A",
  cow: "#FAFAF7",
  cowBrown: "#8C5A3C",
  glass: "#BFE0EA",
  urban: "#166E97",
  red: "#D9534F",
  yellow: "#F2B705",
  co2: "#8FA6B0",
};

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };

export function materialCss() {
  let css = "";
  for (const [name, c] of Object.entries(MATERIALS)) {
    css += `.m-${name}{--t:${mix(c, "#ffffff", 0.28)};--s3:${mix(c, "#ffffff", 0.08)};--s2:${c};--s1:${mix(c, "#0b1d25", 0.14)};--s0:${mix(c, "#0b1d25", 0.26)};--e:${mix(c, "#0f2530", 0.62)}}\n`;
  }
  return css;
}
function gradients() {
  const domeMats = ["wall", "steel", "lima", "roofGreen", "leaf", "green", "grassDark", "straw", "bagasse", "digestate", "amber"];
  let g = "";
  for (const m of domeMats) {
    const c = MATERIALS[m];
    g += `<radialGradient id="g-${m}" cx="38%" cy="28%" r="78%"><stop offset="0" stop-color="${mix(c, "#ffffff", 0.55)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${mix(c, "#0b1d25", 0.3)}"/></radialGradient>`;
  }
  return g;
}

// ---------------------------------------------------------------- primitivas
function solidSvg(paths, mat, cls = "") {
  let s = `<g class="sd m-${mat} ${cls}"><path class="f" d="${paths.fill}"/>`;
  paths.shades.forEach((d, i) => { if (d) s += `<path class="s${i}" d="${d}"/>`; });
  s += `<path class="t" d="${paths.top}"/>`;
  if (paths.crease) s += `<path class="ln cr" d="${paths.crease}"/>`;
  s += `<path class="ln ol" d="${paths.outline}"/></g>`;
  return s;
}
const boxPaths = (x, y, w, d, z, h, r = 0.6, steps = 2) => K.slabOf({ x, y, w, d, r }, z, h, P, steps);
const box = (x, y, w, d, z, h, mat, o = {}) => solidSvg(boxPaths(x, y, w, d, z, h, o.r ?? 0.6, o.steps ?? 2), mat, o.cls);
const cyl = (cx, cy, r, z, h, mat, o = {}) => solidSvg(K.cylinder(cx, cy, r, z, h, P, o.steps ?? 36), mat, o.cls);
const prism = (ring, z, h, mat, o = {}) => solidSvg(K.extrude(ring, z, h, P, { convex: o.convex ?? true }), mat, o.cls);

function hull(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function frontArc(cx, cy, r, z, n = 48) {
  // arco da metade da circunferência voltada ao observador, em ordem contínua
  const a0 = Math.atan2(VIEW[1], VIEW[0]);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 - Math.PI / 2 + (i / n) * Math.PI;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z]);
  }
  return pts;
}
// Cúpula (hemisfério achatado). squash = altura / raio.
function dome(cx, cy, r, z, mat, { squash = 1, bands = 2, cls = "" } = {}) {
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const phi = (i / 12) * Math.PI / 2;
    for (let j = 0; j < 48; j++) {
      const th = (j / 48) * Math.PI * 2;
      pts.push(iso([cx + r * Math.cos(phi) * Math.cos(th), cy + r * Math.cos(phi) * Math.sin(th), z + r * squash * Math.sin(phi)]));
    }
  }
  const h = hull(pts);
  let s = `<g class="dome ${cls}"><path class="dm m-${mat}" fill="url(#g-${mat})" d="M${h.map(([x, y]) => `${R(x)},${R(y)}`).join("L")}Z"/>`;
  for (let b = 1; b <= bands; b++) {
    const phi = (b / (bands + 1)) * Math.PI / 2;
    s += `<path class="ln band m-${mat}" d="${pathOf(frontArc(cx, cy, r * Math.cos(phi), z + r * squash * Math.sin(phi)))}"/>`;
  }
  s += `<path class="ln ol m-${mat}" d="M${h.map(([x, y]) => `${R(x)},${R(y)}`).join("L")}Z"/></g>`;
  return s;
}
function sphere(c, r, mat, cls = "") {
  const [x, y] = iso(c);
  return `<circle class="sph m-${mat} ${cls}" cx="${R(x)}" cy="${R(y)}" r="${R(r * KS)}" fill="url(#g-${mat})"/>`;
}
// Galpão com telhado de duas águas. ridge: "x" ou "y".
function gable(x, y, w, d, h, rh, wallMat, roofMat, ridge = "x", o = {}) {
  let s = box(x, y, w, d, 0, h, wallMat);
  const ov = o.overhang ?? 1.2;
  const x0 = x - ov, x1 = x + w + ov, y0 = y - ov, y1 = y + d + ov;
  const top = h + rh;
  const roof = (pts, shade) => `<path class="rf m-${roofMat} ${shade}" d="${pathOf(pts, true)}"/>`;
  if (ridge === "x") {
    const ym = y + d / 2;
    s += roof([[x0, y0, h], [x1, y0, h], [x1, ym, top], [x0, ym, top]], "rt");
    s += `<path class="gb m-${wallMat}" d="${pathOf([[x + w, y, h], [x + w, y + d, h], [x + w, ym, top]], true)}"/>`;
    s += roof([[x0, ym, top], [x1, ym, top], [x1, y1, h], [x0, y1, h]], "rl");
  } else {
    const xm = x + w / 2;
    s += roof([[x0, y0, h], [xm, y0, top], [xm, y1, top], [x0, y1, h]], "rt");
    s += `<path class="gb m-${wallMat}" d="${pathOf([[x, y + d, h], [x + w, y + d, h], [xm, y + d, top]], true)}"/>`;
    s += roof([[xm, y0, top], [x1, y0, h], [x1, y1, h], [xm, y1, top]], "rl");
  }
  return s;
}
// Janelas em faixa numa face vertical (+y ou +x).
function windows(x, y, w, d, z0, z1, face, cols, rows, cls = "win") {
  let s = "";
  const gw = (face === "y" ? w : d) / cols;
  const gh = (z1 - z0) / rows;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const a = c * gw + gw * 0.25, b = c * gw + gw * 0.75;
    const za = z0 + r * gh + gh * 0.28, zb = z0 + r * gh + gh * 0.78;
    const q = face === "y"
      ? [[x + a, y + d, za], [x + b, y + d, za], [x + b, y + d, zb], [x + a, y + d, zb]]
      : [[x + w, y + a, za], [x + w, y + b, za], [x + w, y + b, zb], [x + w, y + a, zb]];
    s += `<path class="${cls}" d="${pathOf(q, true)}"/>`;
  }
  return s;
}
const groundPoly = (pts, cls, z = 0) => `<path class="${cls}" d="${pathOf(pts.map(([x, y]) => [x, y, z]), true)}"/>`;
const groundLine = (pts, cls, z = 0) => `<path class="${cls}" d="${pathOf(pts.map(([x, y, zz]) => [x, y, zz ?? z]))}"/>`;
function groundText(text, x, y, size, cls = "gt", along = "x", z = 0.2) {
  return `<text class="${cls}" transform="${K.topMatrix([x, y], z, P, along)}" font-size="${size}">${text}</text>`;
}
function tree(x, y, s = 1, mat = "leaf") {
  return cyl(x, y, 0.9 * s, 0, 5 * s, "ochre", { steps: 10 }) + sphere([x, y, 9 * s], 5 * s, mat);
}
function pine(x, y, s = 1) {
  return cyl(x, y, 0.8 * s, 0, 4 * s, "ochre", { steps: 8 }) + dome(x, y, 4.2 * s, 3 * s, "roofGreen", { squash: 3.2, bands: 0 });
}

// ---------------------------------------------------------------- cena
export function buildWorld() {
  const ground = [];   // sempre ao fundo
  const objs = [];     // ordenados por profundidade
  const add = (svg, at, id) => objs.push({ d: depth(at), svg, id });

  // --- base do diorama
  const B = { x: -40, y: -40, w: 1170, d: 990 };
  ground.push(solidSvg(K.slabOf({ ...B, r: 18 }, -26, 26, P, 8), "base", "basebox"));
  ground.push(solidSvg(K.slabOf({ x: B.x + 4, y: B.y + 4, w: B.w - 8, d: B.d - 8, r: 15 }, -0.01, 0.01, P, 8), "grass", "lawn"));

  // --- lotes (zonas)
  const plot = (x, y, w, d, mat, id) => ground.push(solidSvg(K.slabOf({ x, y, w, d, r: 6 }, 0, 1.6, P, 6), mat, `plot plot-${id}`));
  plot(0, 0, 250, 215, "plotAgro", "agro");
  plot(0, 232, 250, 210, "plotPec", "pec");
  plot(0, 459, 250, 212, "plotInd", "ind");
  plot(0, 688, 250, 222, "plotUrb", "urb");
  plot(328, 170, 340, 560, "plant", "usina");
  plot(728, 0, 372, 160, "plotInd", "industria");
  plot(728, 178, 160, 130, "city", "posto");
  plot(905, 178, 195, 130, "city", "subestacao");
  plot(728, 372, 372, 538, "city", "cidade");

  // --- estradas
  const roadW = 14;
  const roadsX = [ // [y, x0, x1]
    [108, 236, 284], [330, 236, 284], [565, 236, 284], [800, 236, 284],
    [452, 270, 352], [612, 666, 712], [340, 690, 1100], [640, 712, 1100],
  ];
  const roadsY = [ // [x, y0, y1]
    [270, 60, 850], [705, -30, 930], [910, 340, 930],
  ];
  for (const [y, x0, x1] of roadsX) ground.push(groundPoly([[x0, y - roadW / 2], [x1, y - roadW / 2], [x1, y + roadW / 2], [x0, y + roadW / 2]], "road", 1.7));
  for (const [x, y0, y1] of roadsY) ground.push(groundPoly([[x - roadW / 2, y0], [x + roadW / 2, y0], [x + roadW / 2, y1], [x - roadW / 2, y1]], "road", 1.7));
  for (const [x, y0, y1] of roadsY) ground.push(groundLine([[x, y0 + 4], [x, y1 - 4]], "lane", 1.8));
  for (const [y, x0, x1] of roadsX) if (x1 - x0 > 60) ground.push(groundLine([[x0 + 4, y], [x1 - 4, y]], "lane", 1.8));

  // --- nomes pintados no chão
  ground.push(groundText("AGRICULTURA", 12, 210, 10, "gt", "x", 1.7));
  ground.push(groundText("PECUÁRIA", 12, 437, 10, "gt", "x", 1.7));
  ground.push(groundText("AGROINDÚSTRIA", 12, 666, 10, "gt", "x", 1.7));
  ground.push(groundText("RESÍDUOS URBANOS", 12, 905, 10, "gt", "x", 1.7));
  ground.push(groundText("USINA DE BIOGÁS E BIOMETANO", 336, 724, 11, "gt", "x", 1.7));
  ground.push(groundText("INDÚSTRIA", 736, 155, 10, "gt", "x", 1.7));
  ground.push(groundText("POSTO BIOMETANO", 736, 304, 8, "gt", "x", 1.7));
  ground.push(groundText("CIDADE", 736, 905, 12, "gt", "x", 1.7));

  // ================= A1 AGRICULTURA: canavial, colhedora, palha
  ground.push(groundPoly([[10, 12], [200, 12], [200, 196], [10, 196]], "field", 1.7));
  for (let i = 0; i < 15; i++) {
    const y = 18 + i * 12;
    add(box(14, y, 182, 5, 1.6, 7 + (i % 3), "cane", { r: 2, steps: 3 }), [105, y + 2.5, 0]);
  }
  // colhedora
  add(box(206, 40, 22, 12, 1.6, 9, "lima") + box(220, 42, 8, 8, 10.6, 6, "glass") + box(204, 38, 4, 16, 1.6, 4, "petrol"), [217, 46, 0]);
  // fardos de palha
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) add(box(208 + j * 14, 130 + i * 18, 12, 14, 1.6, 6 + (i === 0 ? 6 : 0), "straw"), [214 + j * 14, 137 + i * 18, 0]);
  for (const [x, y] of [[232, 18], [240, 80], [236, 192]]) add(tree(x, y, 1.1), [x, y, 0]);

  // ================= A2 PECUÁRIA: galpões, pasto, esterqueira
  add(gable(16, 246, 120, 26, 10, 7, "wall", "roofRed", "x") + windows(16, 246, 120, 26, 2, 8, "y", 10, 1), [76, 259, 0]);
  add(gable(16, 286, 120, 26, 10, 7, "wall", "roofRed", "x") + windows(16, 286, 120, 26, 2, 8, "y", 10, 1), [76, 299, 0]);
  ground.push(groundPoly([[150, 244], [240, 244], [240, 316], [150, 316]], "pasture", 1.7));
  ground.push(groundLine([[150, 244], [240, 244], [240, 316], [150, 316], [150, 244]], "fence", 4));
  const cows = [[162, 256, 0], [180, 270, 1], [202, 252, 0], [220, 280, 1], [170, 296, 0], [196, 300, 1], [226, 304, 0], [210, 268, 0]];
  for (const [x, y, c] of cows) {
    const m = c ? "cowBrown" : "cow";
    add(box(x, y, 8, 3.6, 3, 3.6, m, { cls: "cowb" }) + box(x + 8, y + 0.6, 2.6, 2.4, 5, 2.6, m), [x + 4, y + 2, 0]);
  }
  // esterqueira (lagoa de dejetos) e tanque
  add(cyl(60, 380, 30, 0, 5, "concrete", { steps: 48 }) + `<path class="liquid manure" d="${pathOf(K.circleRing(60, 380, 27, 48).map(([x, y]) => [x, y, 4.6]), true)}"/>`, [60, 380, 0]);
  add(cyl(140, 372, 14, 0, 16, "steel") , [140, 372, 0]);
  add(cyl(176, 400, 8, 0, 22, "lima", { steps: 24 }) + dome(176, 400, 8, 22, "lima", { squash: 0.5, bands: 0 }), [176, 400, 0]);
  for (const [x, y] of [[230, 360], [210, 420], [120, 425]]) add(tree(x, y, 1.1), [x, y, 0]);

  // ================= A3 AGROINDÚSTRIA: usina de cana, vinhaça, laticínio
  add(box(18, 475, 90, 56, 0, 30, "wall") + windows(18, 475, 90, 56, 4, 26, "y", 9, 2) + windows(18, 475, 90, 56, 4, 26, "x", 5, 2) + box(14, 471, 98, 64, 30, 2, "roofGrey"), [63, 503, 0]);
  add(cyl(34, 490, 5, 32, 56, "steel", { steps: 18 }), [34, 490, 0]);
  add(cyl(54, 490, 5, 32, 46, "steel", { steps: 18 }), [54, 490, 0]);
  add(box(112, 482, 20, 40, 0, 44, "steelDark") + box(114, 484, 16, 36, 44, 4, "steel"), [122, 502, 0]);
  // tanques de vinhaça
  for (const [x, y] of [[166, 490], [208, 490]]) add(cyl(x, y, 17, 0, 22, "amber", { steps: 40 }) + `<path class="ln" d="${pathOf(frontArc(x, y, 17, 11))}"/>`, [x, y, 0]);
  // pilha de bagaço
  add(prism(K.circleRing(60, 610, 34, 36), 0, 6, "bagasse") + prism(K.circleRing(60, 610, 24, 32), 6, 6, "bagasse") + dome(60, 610, 15, 12, "bagasse", { squash: 0.6, bands: 0 }), [60, 610, 0]);
  // laticínio / alimentos (telhado shed)
  add(box(130, 580, 96, 56, 0, 16, "wall") + windows(130, 580, 96, 56, 3, 13, "y", 8, 1), [178, 608, 0]);
  for (let i = 0; i < 4; i++) add(gable(132 + i * 23, 582, 23, 52, 0.01, 7, "wall", "roofGreen", "y", { overhang: 0 }).replace(/^<g[^]*?<\/g>/, ""), [143 + i * 23, 608, 17 + i]);
  for (const [x, y] of [[236, 486], [240, 650], [12, 660]]) add(tree(x, y, 1.1), [x, y, 0]);

  // ================= A4 URBANO: aterro, ETE, coleta
  // aterro sanitário em patamares
  for (let i = 0; i < 4; i++) {
    const s = i * 10;
    add(box(14 + s, 700 + s, 124 - 2 * s, 110 - 2 * s, i * 7, 7, i === 3 ? "grassDark" : "soil", { r: 6, steps: 4 }), [76, 755, i * 7]);
  }
  for (const [x, y] of [[60, 735], [92, 745], [76, 770]]) add(cyl(x, y, 1.3, 28, 10, "steelDark", { steps: 10 }), [x, y, 30]);
  // ETE: decantadores e tanque de aeração
  for (const [x, y] of [[178, 720], [178, 772]]) add(cyl(x, y, 21, 0, 7, "concrete", { steps: 48 }) + `<path class="liquid water" d="${pathOf(K.circleRing(x, y, 19, 48).map(([a, b]) => [a, b, 6.6]), true)}"/>` + box(x - 1, y - 19, 2, 38, 7, 1.4, "steelDark"), [x, y, 0]);
  add(box(150, 812, 86, 40, 0, 7, "concrete") + groundPoly([[153, 815], [233, 815], [233, 849], [153, 849]], "liquid water", 6.6), [193, 832, 0]);
  add(cyl(52, 850, 10, 0, 20, "steel") + dome(52, 850, 10, 20, "steel", { squash: 0.4, bands: 0 }), [52, 850, 0]);
  add(box(80, 838, 40, 24, 0, 12, "wall") + windows(80, 838, 40, 24, 3, 10, "y", 4, 1) + box(78, 836, 44, 28, 12, 1.5, "petrol"), [100, 850, 0]);
  for (const [x, y] of [[16, 880], [240, 700], [140, 890]]) add(tree(x, y, 1.1), [x, y, 0]);

  // ================= B USINA
  // Recepção e pré-tratamento
  add(box(338, 425, 34, 56, 0, 5, "concrete") + groundPoly([[341, 428], [369, 428], [369, 478], [341, 478]], "liquid manure", 4.6), [355, 453, 0]);
  add(box(344, 392, 22, 22, 0, 10, "steelDark") + prism([[344, 392], [366, 392], [366, 414], [344, 414]], 10, 2, "steel"), [355, 403, 0]);
  add(cyl(372, 360, 14, 0, 20, "steel") + dome(372, 360, 14, 20, "steel", { squash: 0.3, bands: 0 }) + cyl(372, 360, 1.5, 24, 6, "petrol", { steps: 10 }), [372, 360, 0]);
  // Biodigestores CSTR (2) + pós-digestor
  const digesters = [[440, 290], [440, 390], [440, 495]];
  digesters.forEach(([x, y], i) => {
    const mat = i < 2 ? "green" : "leaf";
    let s = cyl(x, y, 36, 0, 30, mat, { steps: 72 });
    s += `<path class="ln band m-${mat}" d="${pathOf(frontArc(x, y, 36, 10))}"/><path class="ln band m-${mat}" d="${pathOf(frontArc(x, y, 36, 20))}"/>`;
    s += dome(x, y, 34, 30, "wall", { squash: 0.42, bands: 2, cls: "digdome" });
    s += cyl(x + 20, y - 8, 1.6, 30, 12, "petrol", { steps: 10 });
    add(s, [x, y, 0], `dig${i}`);
  });
  // Gasômetro
  add(dome(548, 232, 32, 0.2, "wall", { squash: 0.7, bands: 3, cls: "gasholder" }), [548, 232, 0], "gasholder");
  // Flare
  add(cyl(636, 200, 4, 0, 4, "concrete", { steps: 14 }) + cyl(636, 200, 2.4, 4, 40, "steelDark", { steps: 14 }) + cyl(636, 200, 3.2, 44, 3, "petrol", { steps: 14 }), [636, 200, 0], "flare");
  // CHP (motogerador em contêiner)
  add(box(520, 300, 46, 18, 0, 15, "green") + box(528, 302, 18, 14, 15, 3, "steel") + cyl(560, 309, 2.2, 15, 18, "steelDark", { steps: 12 }) + windows(520, 300, 46, 18, 3, 12, "y", 6, 1, "louvre"), [543, 309, 0], "chp");
  // Upgrading: compressor + membranas + skid
  add(box(512, 380, 60, 34, 0, 4, "steelDark"), [542, 397, 0]);
  add(box(516, 384, 18, 26, 4, 12, "wall") + windows(516, 384, 18, 26, 5, 14, "y", 2, 1, "louvre"), [525, 397, 4]);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) add(cyl(542 + i * 9, 388 + j * 13, 3.4, 4, 30, "steel", { steps: 16 }) + cyl(542 + i * 9, 388 + j * 13, 3.6, 34, 1.5, "petrol", { steps: 16 }), [542 + i * 9, 388 + j * 13, 4]);
  // Estação de medição/odorização e injeção
  add(box(608, 430, 30, 20, 0, 9, "lima") + box(606, 428, 34, 24, 9, 1.4, "petrol") + cyl(646, 440, 2.2, 0, 14, "amber", { steps: 12 }) + cyl(646, 440, 3.4, 14, 3, "amber", { steps: 12 }), [622, 440, 0], "injecao");
  // Captura de CO2: tanques criogênicos + poço de injeção
  for (const [x, y] of [[588, 505], [612, 505]]) add(cyl(x, y, 8, 0, 36, "wall", { steps: 28 }) + dome(x, y, 8, 36, "wall", { squash: 0.5, bands: 0 }), [x, y, 0]);
  add(box(580, 524, 40, 12, 0, 6, "steelDark"), [600, 530, 0]);
  add(box(628, 572, 18, 18, 0, 2, "concrete") + cyl(637, 581, 2.6, 2, 10, "red", { steps: 12 }) + cyl(637, 581, 4.2, 12, 2, "red", { steps: 12 }) + box(633, 579, 8, 4, 8, 1.2, "red"), [637, 581, 0], "poco");
  // Digestato: separador, lagoa e pilha
  add(box(490, 540, 24, 16, 0, 4, "steelDark") + cyl(502, 548, 6, 4, 12, "steel", { steps: 20 }) + box(510, 544, 12, 8, 4, 9, "steel"), [502, 548, 0], "separador");
  add(cyl(396, 615, 40, 0, 12, "green", { steps: 72 }) + `<path class="liquid dig" d="${pathOf(K.circleRing(396, 615, 38, 72).map(([a, b]) => [a, b, 11.5]), true)}"/>`, [396, 615, 0], "lagoa");
  add(prism(K.circleRing(500, 625, 22, 30), 0, 5, "digestate") + dome(500, 625, 16, 5, "digestate", { squash: 0.55, bands: 0 }), [500, 625, 0], "pilha");
  // Centro de pesquisa / sala de controle CP2B
  add(box(560, 640, 64, 40, 0, 18, "wall") + windows(560, 640, 64, 40, 4, 16, "y", 6, 1, "win") + windows(560, 640, 64, 40, 4, 16, "x", 4, 1, "win") + box(557, 637, 70, 46, 18, 2, "green") + groundText("CP2B", 568, 678, 10, "facelogo", "x", 20.2), [592, 660, 0], "lab");
  for (const [x, y] of [[340, 190], [340, 700], [650, 700], [470, 700], [656, 330], [656, 620], [400, 190]]) add(tree(x, y, 1.15), [x, y, 0]);

  // ================= C1 INDÚSTRIA (alimentos/bebidas: usa CO2 e biometano)
  add(box(744, 20, 120, 60, 0, 22, "wall") + windows(744, 20, 120, 60, 4, 18, "y", 10, 2) + windows(744, 20, 120, 60, 4, 18, "x", 5, 2), [804, 50, 0]);
  for (let i = 0; i < 5; i++) add(gable(744 + i * 24, 20, 24, 60, 0.01, 8, "wall", "roofGrey", "y", { overhang: 0 }).replace(/^<g[^]*?<\/g>/, ""), [756 + i * 24, 50, 23 + i]);
  for (const [x, y] of [[890, 36], [912, 36]]) add(cyl(x, y, 8, 0, 34, "wall", { steps: 28 }) + dome(x, y, 8, 34, "wall", { squash: 0.5, bands: 0 }), [x, y, 0]);
  add(box(940, 20, 80, 50, 0, 14, "wall") + windows(940, 20, 80, 50, 3, 12, "y", 7, 1) + box(938, 18, 84, 54, 14, 2, "petrol"), [980, 45, 0]);
  add(cyl(1050, 40, 5, 0, 50, "steel", { steps: 18 }), [1050, 40, 0]);
  for (const [x, y] of [[1080, 100], [930, 120], [1040, 130]]) add(tree(x, y, 1.1), [x, y, 0]);

  // ================= C2 POSTO DE BIOMETANO (bio-GNV)
  add(box(742, 196, 42, 30, 0, 12, "wall") + windows(742, 196, 42, 30, 2, 10, "y", 3, 1) + box(740, 194, 46, 34, 12, 2, "green"), [763, 211, 0]);
  const canopy = { x: 800, y: 200, w: 70, d: 70 };
  for (const [x, y] of [[806, 206], [862, 206], [806, 262], [862, 262]]) add(box(x - 1.2, y - 1.2, 2.4, 2.4, 0, 18, "steelDark"), [x, y, 0]);
  for (const [x, y] of [[822, 222], [846, 222], [822, 248], [846, 248]]) add(box(x - 3, y - 2, 6, 4, 0, 8, "lima"), [x, y, 0]);
  objs.push({ d: depth([870, 270, 0]) + 0.5, svg: box(canopy.x, canopy.y, canopy.w, canopy.d, 18, 3, "green") + groundText("BIOMETANO", 806, 268, 7, "facelogo", "x", 21.2), id: "canopy" });
  // ônibus a biometano
  add(box(746, 248, 40, 12, 1.6, 12, "lima") + windows(746, 248, 40, 12, 5, 11, "y", 6, 1, "win"), [766, 254, 0]);

  // ================= C3 SUBESTAÇÃO
  add(box(930, 200, 60, 40, 0, 2, "concrete"), [960, 220, 0]);
  for (let i = 0; i < 3; i++) add(box(936 + i * 18, 206, 12, 12, 2, 12, "steelDark") + cyl(942 + i * 18, 212, 1.4, 14, 8, "wall", { steps: 10 }), [942 + i * 18, 212, 2]);
  add(box(1010, 196, 70, 44, 0, 12, "wall") + windows(1010, 196, 70, 44, 2, 10, "y", 6, 1) + box(1008, 194, 74, 48, 12, 1.5, "petrol"), [1045, 218, 0]);
  for (const [x, y] of [[1090, 290], [918, 296]]) add(tree(x, y, 1.1), [x, y, 0]);

  // Torres de transmissão (treliça simplificada)
  const towers = [[652, 300], [760, 330], [866, 330], [930, 262]];
  const towerTop = 54;
  const towerSvg = (x, y) => {
    let s = "";
    const legs = [[-4, -4], [4, -4], [4, 4], [-4, 4]];
    for (const [a, b] of legs) s += `<path class="ln tower" d="${pathOf([[x + a, y + b, 0], [x + a * 0.25, y + b * 0.25, towerTop]])}"/>`;
    for (let z = 10; z < towerTop; z += 11) {
      const f = 1 - (z / towerTop) * 0.75;
      s += `<path class="ln tower" d="${pathOf([[x - 4 * f, y - 4 * f, z], [x + 4 * f, y + 4 * f, z + 11]])}"/><path class="ln tower" d="${pathOf([[x + 4 * f, y - 4 * f, z], [x - 4 * f, y + 4 * f, z + 11]])}"/>`;
    }
    s += `<path class="ln tower" d="${pathOf([[x - 10, y + 10, towerTop - 6], [x + 10, y - 10, towerTop - 6]])}"/><path class="ln tower" d="${pathOf([[x - 7, y + 7, towerTop - 14], [x + 7, y - 7, towerTop - 14]])}"/>`;
    return s;
  };
  towers.forEach(([x, y]) => add(towerSvg(x, y), [x, y, 0]));

  // ================= C4 CIDADE
  const houseRoofs = ["roofRed", "roofGrey", "roofRed", "roofGreen", "roofRed"];
  let hn = 0;
  const house = (x, y, big = false) => {
    const w = big ? 22 : 16, d = big ? 20 : 14;
    const s = gable(x, y, w, d, big ? 11 : 9, 6, "wall", houseRoofs[hn++ % houseRoofs.length], hn % 2 ? "x" : "y") + windows(x, y, w, d, 2, 8, "y", 2, 1, "win") + windows(x, y, w, d, 2, 8, "x", 2, 1, "win");
    add(s, [x + w / 2, y + d / 2, 0]);
  };
  // quarteirão de casas (oeste da rua 910, sul da rua 640)
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    if (i === 0 && j === 3) continue; // reservado para "sua casa"
    house(730 + i * 42, 660 + j * 64);
  }
  // Sua casa (destaque)
  house(732, 852, true);
  add(box(758, 860, 3, 3, 0, 5, "amber"), [759, 861, 0], "medidor");
  // prédios (leste da rua 910)
  const blds = [[930, 380, 34, 30, 60], [980, 384, 28, 28, 44], [1030, 380, 40, 32, 72], [930, 450, 30, 34, 38], [990, 460, 36, 30, 54], [1046, 450, 34, 34, 30],
    [930, 664, 34, 30, 50], [984, 660, 30, 34, 66], [1040, 668, 40, 28, 40], [940, 740, 30, 30, 30], [990, 744, 40, 34, 46], [1050, 736, 34, 40, 58], [940, 820, 40, 40, 24], [1000, 830, 34, 30, 36]];
  for (const [x, y, w, d, h] of blds) add(box(x, y, w, d, 0, h, "wall") + windows(x, y, w, d, 2, h - 2, "y", Math.round(w / 8), Math.round(h / 8)) + windows(x, y, w, d, 2, h - 2, "x", Math.round(d / 8), Math.round(h / 8)) + box(x + 2, y + 2, w - 4, d - 4, h, 1.5, "steel"), [x + w / 2, y + d / 2, 0]);
  // escola
  add(box(740, 392, 110, 40, 0, 14, "wall") + windows(740, 392, 110, 40, 3, 12, "y", 10, 1) + box(738, 390, 114, 44, 14, 1.6, "amber") + groundText("ESCOLA", 750, 428, 7, "facelogo", "x", 15.8), [795, 412, 0]);
  ground.push(groundPoly([[740, 446], [850, 446], [850, 520], [740, 520]], "court", 1.7));
  ground.push(groundLine([[795, 446], [795, 520]], "courtline", 1.8));
  for (const [x, y] of [[870, 400], [870, 470], [870, 560], [740, 560], [800, 560], [1080, 560], [960, 560], [1020, 560], [880, 900], [1080, 900]]) add(tree(x, y, 1.15), [x, y, 0]);
  for (const [x, y] of [[-20, 300], [-22, 560], [-24, 640], [-20, 860], [300, -20], [380, -22], [470, -18], [620, -20], [-20, 40], [1110, 200], [1110, 760], [1112, 520], [1110, 880], [160, 925], [420, 926], [600, 926]]) add(pine(x, y, 1.3), [x, y, 0]);
  for (const [x, y] of [[300, 200], [300, 690], [310, 900], [690, 760], [690, 880], [300, 40], [690, 20]]) add(tree(x, y, 1.3), [x, y, 0]);

  // ---------------------------------------------------------------- fluxos (tubulações)
  // Cada fluxo: id, stream, pontos no mundo (z ~ 2 = na superfície)
  const Z = 2;
  const flows = [
    { id: "f-pre", stream: "substrato", pts: [[355, 425], [355, 414]] },
    { id: "f-pre2", stream: "substrato", pts: [[355, 392], [372, 374]] },
    { id: "f-feed", stream: "substrato", pts: [[386, 360], [404, 360], [404, 290]] },
    { id: "f-feed2", stream: "substrato", pts: [[404, 360], [404, 390]] },
    { id: "f-dig", stream: "digestato", pts: [[440, 326], [440, 354]] },
    { id: "f-dig2", stream: "digestato", pts: [[440, 426], [440, 459]] },
    { id: "f-bg1", stream: "biogas", pts: [[476, 290], [500, 290], [500, 232], [516, 232]] },
    { id: "f-bg2", stream: "biogas", pts: [[476, 390], [500, 390], [500, 290]] },
    { id: "f-bg3", stream: "biogas", pts: [[476, 495], [500, 495], [500, 390]] },
    { id: "f-chp", stream: "biogas", pts: [[548, 264], [548, 300]] },
    { id: "f-upg", stream: "biogas", pts: [[580, 245], [600, 245], [600, 372], [570, 372], [570, 380]] },
    { id: "f-flare", stream: "biogas", pts: [[580, 220], [636, 220], [636, 204]] },
    { id: "f-heat", stream: "calor", pts: [[520, 316], [484, 316], [484, 300], [476, 300]] },
    { id: "f-heat2", stream: "calor", pts: [[484, 316], [484, 400], [476, 400]] },
    { id: "f-bm", stream: "biometano", pts: [[572, 404], [590, 404], [590, 440], [608, 440]] },
    { id: "f-grid", stream: "biometano", pts: [[646, 440], [700, 440], [700, 600], [722, 600], [722, 650], [910, 650], [910, 920]] },
    { id: "f-grid2", stream: "biometano", pts: [[722, 650], [722, 862], [758, 862]] },
    { id: "f-grid3", stream: "biometano", pts: [[910, 720], [1090, 720]] },
    { id: "f-grid4", stream: "biometano", pts: [[722, 650], [722, 760], [880, 760]] },
    { id: "f-posto", stream: "biometano", pts: [[700, 440], [700, 300], [834, 300], [834, 266]] },
    { id: "f-ind", stream: "biometano", pts: [[700, 300], [700, 90], [800, 90], [800, 80]] },
    { id: "f-co2", stream: "co2", pts: [[572, 386], [600, 386], [600, 480], [588, 480], [588, 497]] },
    { id: "f-co2b", stream: "co2", pts: [[612, 513], [612, 560], [637, 560], [637, 572]] },
    { id: "f-co2c", stream: "co2", pts: [[620, 520], [690, 520], [690, 110], [890, 110], [890, 44]] },
    { id: "f-digout", stream: "digestato", pts: [[476, 510], [490, 510], [490, 548]] },
    { id: "f-digout2", stream: "digestato", pts: [[490, 552], [436, 552], [436, 590]] },
    { id: "f-digout3", stream: "digestato", pts: [[514, 552], [514, 603]] },
    { id: "f-eGrid", stream: "eletricidade", pts: [[1010, 240], [1010, 330], [1100, 330]] },
    { id: "f-eGrid2", stream: "eletricidade", pts: [[1010, 330], [920, 330], [920, 640], [1090, 640]] },
  ];
  const flowSvg = flows.map((f) => {
    const d = pathOf(f.pts.map(([x, y]) => [x, y, Z]));
    return `<g class="flow s-${f.stream}" data-stream="${f.stream}"><path class="pipe" d="${d}"/><path class="core" id="${f.id}" d="${d}"/></g>`;
  }).join("");
  // linhas aéreas de energia (CHP → torres → subestação)
  const wire = [[564, 309, 28], ...towers.map(([x, y]) => [x, y, towerTop - 6]), [960, 212, 22]];
  let wires = "";
  for (let i = 0; i < wire.length - 1; i++) {
    const a = wire[i], b = wire[i + 1];
    const pts = [];
    for (let t = 0; t <= 12; t++) { const u = t / 12; pts.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u - Math.sin(Math.PI * u) * 6]); }
    wires += `<path class="core wire" id="w-${i}" d="${pathOf(pts)}"/>`;
  }
  const wireSvg = `<g class="flow s-eletricidade overhead" data-stream="eletricidade">${wires}</g>`;

  // ---------------------------------------------------------------- rotas de caminhões
  const routes = [
    { id: "t-agro", cargo: "straw", pts: [[236, 108], [270, 108], [270, 452], [338, 452]] },
    { id: "t-pec", cargo: "manure", pts: [[236, 330], [270, 330], [270, 452], [338, 452]] },
    { id: "t-ind", cargo: "amber", pts: [[236, 565], [270, 565], [270, 452], [338, 452]] },
    { id: "t-urb", cargo: "urban", pts: [[236, 800], [270, 800], [270, 452], [338, 452]] },
    { id: "t-dig", cargo: "digestate", pts: [[352, 452], [264, 452], [264, 120], [236, 120]] },
    { id: "t-dig2", cargo: "digestate", pts: [[352, 452], [264, 452], [264, 342], [236, 342]] },
    { id: "t-bus", cargo: "lima", pts: [[705, 930], [705, 340], [1100, 340]] },
    { id: "t-car", cargo: "urban", pts: [[1100, 640], [705, 640], [705, -30]] },
  ];
  const truckPart = (h, cargo) => {
    // h = direção: px, nx, py, ny. Peças em coordenadas locais (u ao longo, v lateral)
    const parts = [ // [u0,u1,v0,v1,z0,z1,mat]
      [-15, -1, -3.6, 3.6, 1.6, 9, cargo],
      [-15, 6, -3, 3, 0, 1.8, "petrol"],
      [0, 6, -3.4, 3.4, 1.6, 8, "wall"],
      [3.6, 6.05, -3, 3, 4.2, 7.4, "glass"],
    ];
    const map = (u, v) => h === "px" ? [u, v] : h === "nx" ? [-u, -v] : h === "py" ? [-v, u] : [v, -u];
    const out = parts.map(([u0, u1, v0, v1, z0, z1, m]) => {
      const a = map(u0, v0), b = map(u1, v1);
      const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]);
      return { d: depth([x + Math.abs(a[0] - b[0]) / 2, y + Math.abs(a[1] - b[1]) / 2, z0]), s: box(x, y, Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), z0, z1 - z0, m, { r: 0.8 }) };
    });
    out.sort((p, q) => p.d - q.d);
    return out.map((p) => p.s).join("");
  };
  const cargoMat = { straw: "straw", manure: "manure", amber: "amber", urban: "urban", digestate: "digestate", lima: "lima" };
  const vehicles = routes.map((r) => {
    const variants = ["px", "nx", "py", "ny"].map((h) => `<g class="veh-${h}" style="display:none">${truckPart(h, cargoMat[r.cargo])}</g>`).join("");
    return { ...r, svg: `<g class="vehicle" id="${r.id}">${variants}</g>`, screen: r.pts.map(([x, y]) => iso([x, y, 1.7])) };
  });

  // ---------------------------------------------------------------- composição
  objs.sort((a, b) => a.d - b.d);
  const corners = [[B.x, B.y, 0], [B.x + B.w, B.y, 0], [B.x, B.y + B.d, 0], [B.x + B.w, B.y + B.d, 0], [B.x, B.y + B.d, -26], [B.x + B.w, B.y + B.d, -26], [B.x, B.y, 90]].map(iso);
  const xs = corners.map((c) => c[0]), ys = corners.map((c) => c[1]);
  const bounds = { x: Math.min(...xs) - 20, y: Math.min(...ys) - 30, w: Math.max(...xs) - Math.min(...xs) + 40, h: Math.max(...ys) - Math.min(...ys) + 50 };

  const objSvg = objs.map((o) => (o.id ? `<g id="o-${o.id}">${o.svg}</g>` : o.svg)).join("");
  return {
    bounds,
    defs: gradients(),
    layers: {
      ground: ground.join(""),
      flows: flowSvg,
      vehicles: vehicles.map((v) => v.svg).join(""),
      objects: objSvg,
      wires: wireSvg,
    },
    vehicles,
    flows: flows.map((f) => ({ id: f.id, stream: f.stream })).concat(wire.slice(0, -1).map((_, i) => ({ id: `w-${i}`, stream: "eletricidade" }))),
  };
}

// Converte uma caixa no chão (mundo) num retângulo de tela, para enquadrar a câmera.
export function focusRect([x0, y0, x1, y1], zTop = 40) {
  const pts = [[x0, y0, 0], [x1, y0, 0], [x0, y1, 0], [x1, y1, 0], [x0, y0, zTop], [x1, y0, zTop]].map(iso);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}
