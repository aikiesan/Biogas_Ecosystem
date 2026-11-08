// Água e floresta: rio com mata ciliar, Mata Atlântica com nascente,
// floresta plantada de eucalipto (com talhão colhido e serraria) e represa.
import { box, cyl, dome, gable, windows, door, tree, sphere, pathOf, groundPoly, groundRect, groundLine, castShadow, circleRing, iso, fence } from "../kit.mjs";
import { RIVER } from "../layout.mjs";

// pseudo-aleatório determinístico
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// Margem sinuosa de um rio ao longo de x.
function riverBank(x0, x1, y, amp, phase) {
  const pts = [];
  for (let x = x0; x <= x1; x += 10) pts.push([x, y + Math.sin(x / 70 + phase) * amp + Math.sin(x / 23 + phase * 2) * amp * 0.3]);
  return pts;
}
export const RIVER_N = riverBank(-36, 1126, RIVER.y0, 5, 0);
export const RIVER_S = riverBank(-36, 1126, RIVER.y1, 5, 1.3);

// Árvore nativa: copa larga, tons variados; algumas floridas (ipês).
function nativeTree(x, y, s, i) {
  const r = rnd(i);
  const mat = r < 0.07 ? "ipeYellow" : r < 0.12 ? "ipePink" : ["leafDark", "leaf", "roofGreen", "leafDark", "leafLight"][Math.floor(rnd(i + 9) * 5)];
  return tree(x, y, s, mat);
}
// Copa de floresta: uma única esfera grande, sem tronco (os troncos ficam
// escondidos sob o dossel). Muito mais leve que árvores inteiras.
const CANOPY = ["leafDark", "roofGreen", "leaf", "leafDark", "leafLight", "roofGreen"];
function crown(x, y, r, i, z = 7) {
  castShadow(circleRing(x, y, r * 0.9, 10), z + r * 0.6);
  const t = rnd(i);
  const mat = t < 0.05 ? "ipeYellow" : t < 0.08 ? "ipePink" : CANOPY[Math.floor(rnd(i + 3) * CANOPY.length)];
  return sphere([x, y, z + r * 0.5], r, mat);
}
// Eucalipto: tronco alto e fino, copa estreita e clara.
function euca(x, y, s = 1, i = 0) {
  castShadow(circleRing(x, y, 2.6 * s, 8), 20 * s);
  const [bx, by] = iso([x, y, 1.6]), [tx, ty] = iso([x, y, 13 * s]);
  return `<path class="ln euca-trunk" d="M${bx.toFixed(1)},${by.toFixed(1)}L${tx.toFixed(1)},${ty.toFixed(1)}"/>` +
    `<ellipse class="euca-crown ${rnd(i) < 0.5 ? "a" : "b"}" cx="${tx.toFixed(1)}" cy="${(ty - 5 * s).toFixed(1)}" rx="${(3.6 * s).toFixed(1)}" ry="${(8 * s).toFixed(1)}"/>`;
}

export function buildNatureza(S) {
  // ---------- Rio (com faixa de areia nas margens)
  const water = RIVER_N.concat(RIVER_S.slice().reverse());
  S.floor(groundPoly(RIVER_N.map(([x, y]) => [x, y - 3]).concat(RIVER_S.map(([x, y]) => [x, y + 3]).reverse()), "bank", 0.3));
  S.floor(`<g data-tag="agua">${groundPoly(water, "river", 0.4)}</g>`);
  // correnteza: linhas que deslizam rio abaixo
  for (let k = 0; k < 5; k++) {
    const yy = RIVER.y0 + 6 + k * 5;
    S.under(groundLine(riverBank(-30, 1120, yy, 4, 0.6 + k * 0.15), `current c${k % 3}`, 0.6));
  }
  // ponte da estrada (x = 705) sobre o rio
  S.add(box(698, RIVER.y0 - 8, 14, RIVER.y1 - RIVER.y0 + 16, 2, 2.2, "concrete", { noShadow: true }) +
    `<path class="ln rail" d="${pathOf([[698, RIVER.y0 - 8, 6], [698, RIVER.y1 + 8, 6]])}"/><path class="ln rail" d="${pathOf([[712, RIVER.y0 - 8, 6], [712, RIVER.y1 + 8, 6]])}"/>` +
    box(699, RIVER.y0 + 6, 3, 4, 0, 2.2, "concrete") + box(708, RIVER.y0 + 6, 3, 4, 0, 2.2, "concrete") +
    `<path class="road" d="${pathOf([[698, RIVER.y0 - 8, 4.3], [712, RIVER.y0 - 8, 4.3], [712, RIVER.y1 + 8, 4.3], [698, RIVER.y1 + 8, 4.3]], true)}"/>`, [705, RIVER.y1 + 8, 0], "agua");
  // mata ciliar (APP) nas duas margens
  let i = 0;
  for (let x = -24; x < 1120; x += 18) {
    if (x > 684 && x < 726) continue;
    const yn = RIVER_N.find((p) => p[0] >= x)?.[1] ?? RIVER.y0;
    const ys = RIVER_S.find((p) => p[0] >= x)?.[1] ?? RIVER.y1;
    S.add(crown(x + rnd(i) * 6, yn - 10 - rnd(i + 1) * 4, 7.2 + rnd(i + 2) * 2.5, i, 5), [x, yn - 10, 0], "agua"); i++;
    if ((x < 300 || x > 730) && Math.floor(x / 18) % 2 === 0) { S.add(crown(x + 7 + rnd(i) * 5, ys + 9 + rnd(i + 3) * 3, 6.8 + rnd(i + 4) * 2, i, 5), [x + 7, ys + 9, 0], "agua"); i++; }
  }

  // ---------- Mata Atlântica (floresta nativa) com nascente e córrego
  const creek = [[118, -246], [112, -220], [126, -192], [114, -160], [132, -128], [124, -96], [140, -66], [148, RIVER.y0 + 2]];
  S.floor(groundLine(creek, "creek", 0.5));
  S.floor(`<ellipse class="spring" cx="${iso([118, -248, 0.5])[0].toFixed(1)}" cy="${iso([118, -248, 0.5])[1].toFixed(1)}" rx="9" ry="4.5"/>`);
  // dossel contínuo: copas grandes e irregulares, com algumas emergentes e ipês floridos
  for (let gx = -26; gx < 290; gx += 28) for (let gy = -282; gy < -62; gy += 25) {
    const x = gx + rnd(i) * 12, y = gy + rnd(i + 5) * 10;
    const near = creek.some(([cx, cy]) => Math.hypot(cx - x, cy - y) < 14);
    i++;
    if (near) continue;
    const big = rnd(i + 7) < 0.14;
    S.add(crown(x, y, big ? 16 : 11.5 + rnd(i) * 3.5, i, big ? 14 : 8), [x, y, 0], "nativa");
  }
  // placa da APP
  S.add(box(150, -70, 1, 1, 0, 8, "trunk") + box(146, -71, 9, 2, 6, 4, "green"), [150, -70, 0], "nativa");

  // ---------- Floresta plantada (eucalipto): talhões, talhão colhido, pátio de toras e serraria
  for (let gx = 314; gx < 560; gx += 16) for (let gy = -274; gy < -78; gy += 16) {
    if (gx > 470 && gy > -150) continue; // talhão já colhido
    S.add(euca(gx, gy, 1.08 + rnd(i) * 0.15, i), [gx, gy, 0], "silvicultura"); i++;
  }
  // talhão colhido: tocos e pilhas de toras
  for (let gx = 480; gx < 560; gx += 18) for (let gy = -144; gy < -78; gy += 18) S.add(cyl(gx, gy, 1.2, 1.6, 1.2, "log", { steps: 6, noShadow: true }), [gx, gy, 0], "silvicultura");
  for (let k = 0; k < 3; k++) S.add(box(572, -150 + k * 24, 26, 10, 1.6, 6, "log", { r: 2.5, steps: 4 }) + box(574, -148 + k * 24, 22, 6, 7.6, 3, "log", { r: 2, steps: 4 }), [585, -145 + k * 24, 0], "silvicultura");
  // serraria + caldeira a biomassa (resíduos: cascas, galhos, serragem)
  S.add(gable(600, -230, 50, 34, 11, 6, "wallWarm", "roofGrey", "x") + door(600, -230, 50, 34, "y", 10, 14, 8, "gate"), [625, -213, 0], "silvicultura");
  S.add(cyl(640, -170, 9, 1.6, 7, "bagasse", { steps: 24 }) + dome(640, -170, 9, 8.6, "log", { squash: 0.7, bands: 0 }), [640, -170, 0], "silvicultura");
  S.add(box(606, -180, 22, 16, 0, 14, "steelDark") + cyl(622, -172, 2.6, 14, 20, "steel", { steps: 12 }), [617, -172, 0], "silvicultura");

  // ---------- Represa
  const lake = [];
  for (let k = 0; k < 40; k++) {
    const a = (k / 40) * Math.PI * 2;
    const rx = 158 + Math.sin(a * 3) * 18 + Math.cos(a * 5) * 8, ry = 90 + Math.cos(a * 2) * 10;
    lake.push([928 + Math.cos(a) * rx, -172 + Math.sin(a) * ry]);
  }
  S.floor(groundPoly(lake.map(([x, y]) => [928 + (x - 928) * 1.06, -172 + (y + 172) * 1.08]), "bank", 0.3));
  S.floor(`<g data-tag="agua">${groundPoly(lake, "lake", 0.4)}</g>`);
  // píer e casa de bombas da captação de água
  S.add(box(742, -150, 34, 6, 1.2, 1.4, "log", { noShadow: true }) + box(722, -162, 18, 16, 0, 8, "wallBlue") + box(720, -164, 22, 20, 8, 1.4, "petrol"), [740, -150, 0], "agua");
  for (let k = 0; k < 14; k++) { const a = rnd(k + 300) * Math.PI * 2; const x = 928 + Math.cos(a) * 196, y = -172 + Math.sin(a) * 110; if (x > 690 && x < 1120 && y > -290) S.add(crown(x, y, 7, k + 500, 5), [x, y, 0], "agua"); }
}
