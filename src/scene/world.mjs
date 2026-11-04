// Composição do diorama: base, lotes, ruas, zonas, fluxos e veículos.
import { createScene, slab, groundRect, groundLine, zoneLabel, pine, tree, iso, gradients, takeShadows, pathOf, box } from "./kit.mjs";
import { BASE, PLOTS, ROADS_X, ROADS_Y, ROAD_W } from "./layout.mjs";
import { buildFontes } from "./zones/fontes.mjs";
import { buildUsina } from "./zones/usina.mjs";
import { buildCidade, buildUniversidade } from "./zones/cidade.mjs";
import { buildFlows } from "./flows.mjs";
import { buildVehicles } from "./vehicles.mjs";

export { iso };

export function buildWorld() {
  const S = createScene();
  const B = BASE;

  takeShadows(); // zera o coletor
  // base do diorama: camadas de solo visíveis nas laterais (efeito "terrário")
  S.floor(slab({ ...B, r: 18 }, -26, 26, "base", "basebox"));
  const strata = [[-26, -17, "rock"], [-17, -7, "clay"], [-7, -1.5, "topsoil"]];
  for (const [z0, z1, cls] of strata) {
    const xr = B.x + B.w, yb = B.y + B.d;
    S.floor(`<path class="strata ${cls}" d="${pathOf([[xr, B.y + 18, z0], [xr, yb - 2, z0], [xr, yb - 2, z1], [xr, B.y + 18, z1]], true)}"/>` +
      `<path class="strata ${cls} s" d="${pathOf([[B.x + 18, yb, z0], [xr - 2, yb, z0], [xr - 2, yb, z1], [B.x + 18, yb, z1]], true)}"/>`);
  }
  // raízes/pedras nas camadas
  for (let i = 0; i < 26; i++) { const u = (i * 37) % 100 / 100; const z = -24 + ((i * 13) % 20); S.floor(`<circle class="pebble" cx="${iso([B.x + 30 + u * (B.w - 60), B.y + B.d, z])[0].toFixed(1)}" cy="${iso([B.x + 30 + u * (B.w - 60), B.y + B.d, z])[1].toFixed(1)}" r="${(1 + (i % 3) * 0.6).toFixed(1)}"/>`); }
  S.floor(slab({ x: B.x + 4, y: B.y + 4, w: B.w - 8, d: B.d - 8, r: 15 }, -0.01, 0.01, "grass", "lawn"));
  // lotes
  for (const p of PLOTS) S.floor(`<g data-tag="${p.id}" id="pl-${p.id}" class="plotg">${slab({ x: p.x, y: p.y, w: p.w, d: p.d, r: 6 }, 0, 1.6, p.mat, `plot plot-${p.id}`, 6)}</g>`);
  // ruas, calçadas e faixas
  const W = ROAD_W;
  for (const [y, x0, x1] of ROADS_X) S.floor(groundRect(x0, y - W / 2, x1 - x0, W, "road", 1.7));
  for (const [x, y0, y1] of ROADS_Y) S.floor(groundRect(x - W / 2, y0, W, y1 - y0, "road", 1.7));
  for (const [x, y0, y1] of ROADS_Y) S.floor(groundLine([[x, y0 + 4], [x, y1 - 4]], "lane", 1.8));
  for (const [y, x0, x1] of ROADS_X) if (x1 - x0 > 60) S.floor(groundLine([[x0 + 4, y], [x1 - 4, y]], "lane", 1.8));
  // faixas de pedestre na cidade
  for (const [x, y] of [[910, 630], [910, 650], [910, 510], [722, 640]]) S.floor(groundRect(x - 6, y - 2, 12, 4, "zebra", 1.85));
  // nomes das zonas pintados no chão
  for (const p of PLOTS) if (p.label) S.floor(zoneLabel(p.label, p.x + 8, p.y + p.d - 5, p.d > 300 ? 11 : 8.5));

  // estacionamentos
  const parking = (x, y, w, d, n, cars = []) => {
    S.floor(groundRect(x, y, w, d, "lot", 1.72));
    for (let i = 1; i < n; i++) S.floor(groundLine([[x + (i * w) / n, y + 1], [x + (i * w) / n, y + d * 0.42]], "stall", 1.78) + groundLine([[x + (i * w) / n, y + d - 1], [x + (i * w) / n, y + d * 0.58]], "stall", 1.78));
    for (const [k, row, mat] of cars) S.add(box(x + (k + 0.5) * (w / n) - 2.2, y + (row ? d - 9.5 : 1.5), 4.4, 8, 1.7, 3, mat, { r: 1 }) + box(x + (k + 0.5) * (w / n) - 2, y + (row ? d - 7.6 : 3.4), 4, 4.2, 4.7, 1.8, "glass", { r: 0.8, noShadow: true }), [x + (k + 0.5) * (w / n), y + (row ? d - 5 : 5), 0]);
  };
  parking(596, 846, 80, 24, 8, [[0, 0, "red"], [2, 1, "wall"], [3, 0, "urban"], [6, 1, "steelDark"], [7, 0, "lima"]]);
  parking(1000, 76, 90, 24, 9, [[1, 0, "wall"], [2, 1, "petrol"], [5, 0, "red"], [7, 1, "steel"]]);
  parking(588, 588, 60, 24, 6, [[0, 0, "wall"], [3, 1, "urban"]]);

  buildFontes(S);
  buildUsina(S);
  buildCidade(S);
  buildUniversidade(S);

  // vegetação de borda
  for (const [x, y] of [[-20, 300], [-22, 560], [-24, 640], [-20, 860], [300, -20], [380, -22], [470, -18], [620, -20], [-20, 40], [1110, 200], [1110, 760], [1112, 520], [1110, 880], [160, 940], [420, 944], [600, 944], [-22, 940]]) S.add(pine(x, y, 1.3), [x, y, 0]);
  for (const [x, y] of [[300, 200], [300, 700], [300, 40], [690, 20], [690, 700], [300, 590]]) S.add(tree(x, y, 1.3), [x, y, 0]);

  // sombras projetadas: uma camada, logo acima do chão
  S.floor(`<path class="shadow" d="${takeShadows()}"/>`);
  const flows = buildFlows();
  const vehicles = buildVehicles();
  takeShadows(); // descarta sombras dos veículos (eles se movem)
  const scene = S.render();
  // nuvens ao fundo, atrás do diorama
  const clouds = [[-700, 40, 1], [-250, -60, 0.8], [520, -40, 1.1], [760, 120, 0.9], [-820, 420, 0.7], [880, 600, 0.8]].map(([x, y, k], i) =>
    `<g class="cloud c${i % 3}" transform="translate(${x} ${y}) scale(${k})"><ellipse cx="0" cy="0" rx="46" ry="16"/><ellipse cx="-24" cy="-8" rx="24" ry="16"/><ellipse cx="14" cy="-14" rx="28" ry="20"/><ellipse cx="38" cy="-4" rx="20" ry="12"/></g>`).join("");

  const corners = [[B.x, B.y, 0], [B.x + B.w, B.y, 0], [B.x, B.y + B.d, 0], [B.x + B.w, B.y + B.d, 0], [B.x, B.y + B.d, -26], [B.x + B.w, B.y + B.d, -26], [B.x, B.y, 70]].map(iso);
  const xs = corners.map((c) => c[0]), ys = corners.map((c) => c[1]);
  const bounds = { x: Math.min(...xs) - 10, y: Math.min(...ys) - 20, w: Math.max(...xs) - Math.min(...xs) + 20, h: Math.max(...ys) - Math.min(...ys) + 30 };

  return {
    bounds,
    defs: gradients(),
    layers: { sky: clouds, ground: scene.ground, pipes: flows.pipes, vehicles: vehicles.map((v) => v.svg).join(""), objects: scene.objects, overhead: flows.overhead },
    vehicles,
    flows: flows.ids,
  };
}

// Caixa no chão (mundo) -> retângulo de tela, para o enquadramento do tour.
export function focusRect([x0, y0, x1, y1], zTop = 40) {
  const pts = [[x0, y0, 0], [x1, y0, 0], [x0, y1, 0], [x1, y1, 0], [x0, y0, zTop], [x1, y0, zTop]].map(iso);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}
