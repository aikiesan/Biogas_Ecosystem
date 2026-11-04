// Usina de biogás e biometano.
import { box, cyl, prism, dome, gable, windows, door, stripe, band, ladder, tree, pathOf, circleRing, groundRect, groundLine, fence, sideText, depth } from "../kit.mjs";

const liquid = (cx, cy, r, z, cls) => `<path class="liquid ${cls}" d="${pathOf(circleRing(cx, cy, r, 72).map(([a, b]) => [a, b, z]), true)}"/>`;
export const DIGESTERS = [[440, 290], [440, 390], [440, 495]];

export function buildUsina(S) {
  // cerca com portão voltado à estrada
  S.floor(fence([[334, 440], [334, 176], [662, 176], [662, 720], [334, 720], [334, 466]], 4));
  // balança rodoviária na entrada
  S.floor(groundRect(296, 446, 30, 12, "weigh", 1.8));

  // ---------- Recepção e pré-tratamento (coberta)
  S.add(box(340, 424, 34, 56, 0, 5, "concrete") + groundRect(343, 427, 28, 50, "liquid manure", 4.6), [357, 452, 0], "recepcao");
  for (const [x, y] of [[340, 424], [374, 424], [340, 480], [374, 480]]) S.add(box(x - 1, y - 1, 2, 2, 0, 16, "steelDark"), [x, y, 0], "recepcao");
  S.addAt(box(336, 420, 42, 64, 16, 1.6, "roofGrey"), depth([378, 484, 0]) + 0.2, "recepcao");
  S.add(box(344, 392, 22, 22, 0, 10, "steelDark") + prism([[344, 392], [366, 392], [366, 414], [344, 414]], 10, 2, "steel") + box(350, 386, 10, 6, 4, 6, "steel"), [355, 403, 0], "recepcao");
  S.add(cyl(372, 356, 14, 0, 20, "steel") + band(372, 356, 14, 10) + dome(372, 356, 14, 20, "steel", { squash: 0.3, bands: 0 }) + cyl(372, 356, 2, 24, 5, "petrol", { steps: 10 }) + ladder(372, 356, 14, 0, 20), [372, 356, 0], "recepcao");

  // ---------- Biodigestores CSTR + pós-digestor
  DIGESTERS.forEach(([x, y], i) => {
    const mat = i < 2 ? "green" : "leafDark";
    let s = cyl(x, y, 36, 0, 30, mat, { steps: 72 });
    for (const z of [8, 16, 24]) s += band(x, y, 36, z, `ln band m-${mat}`);
    s += ladder(x, y, 36, 0, 30, -0.7);
    // janela de inspeção e agitadores laterais
    s += box(x + 30, y + 14, 6, 6, 4, 5, "steelDark") + box(x + 12, y + 31, 6, 6, 4, 5, "steelDark");
    s += cyl(x, y, 37, 29.5, 1.4, "steelDark", { steps: 72 });
    s += dome(x, y, 34, 30.9, "wall", { squash: 0.42, bands: 2, cls: "digdome" });
    s += cyl(x + 18, y - 10, 1.6, 30, 14, "petrol", { steps: 10 }) + cyl(x - 6, y + 12, 3, 40, 2.2, "steelDark", { steps: 12 });
    S.add(s, [x, y, 0], i < 2 ? "cstr" : "digestato");
  });
  // passarela entre os topos
  S.add(box(476, 286, 10, 4, 22, 1.2, "steelDark") + box(476, 386, 10, 4, 22, 1.2, "steelDark") + `<path class="ln rail" d="${pathOf([[476, 290, 25], [486, 290, 25]])}"/>`, [481, 340, 22], "cstr");
  // sala de controle (operação da usina)
  S.add(box(482, 440, 34, 22, 0, 12, "wallBlue") + windows(482, 440, 34, 22, 3, 10, "y", 4, 1, "win", 2) + door(482, 440, 34, 22, "x", 8, 3, 6) + box(480, 438, 38, 26, 12, 1.4, "petrol"), [499, 451, 0], "cstr");

  // ---------- Gasômetro e flare
  S.add(cyl(548, 232, 33, 0, 2, "concrete", { steps: 72 }) + dome(548, 232, 32, 2, "wall", { squash: 0.7, bands: 3, cls: "gasholder" }) + cyl(578, 246, 1.2, 2, 8, "steelDark", { steps: 8 }), [548, 232, 0], "biogas");
  S.add(box(626, 190, 20, 20, 0, 1.4, "concrete") + cyl(636, 200, 4, 1.4, 4, "steelDark", { steps: 14 }) + cyl(636, 200, 2.4, 5, 38, "steelDark", { steps: 14 }) + band(636, 200, 2.4, 20) + cyl(636, 200, 3.4, 43, 3, "petrol", { steps: 14 }), [636, 200, 0], "biogas");

  // ---------- Cogeração (CHP): contêiner, radiadores, chaminé
  S.add(box(520, 300, 46, 18, 0, 15, "green") + windows(520, 300, 46, 18, 3, 12, "y", 6, 1, "louvre") + door(520, 300, 46, 18, "x", 6, 4, 8) + box(526, 302, 22, 14, 15, 1.6, "steelDark") + box(527, 303, 9, 12, 16.6, 2.6, "steel") + box(538, 303, 9, 12, 16.6, 2.6, "steel") + cyl(560, 309, 2.2, 15, 18, "steelDark", { steps: 12 }) + sideText("CHP", [526, 318], 11, "left", 5, "facelabel"), [543, 309, 0], "chp");
  S.add(box(572, 302, 12, 14, 0, 12, "steel") + windows(572, 302, 12, 14, 2, 10, "y", 1, 1, "louvre") + `<path class="ln insul" d="${pathOf([[578, 309, 12], [578, 309, 16]])}"/>`, [578, 309, 0], "chp");

  // ---------- Purificação (upgrading por membranas)
  S.add(box(510, 378, 64, 38, 0, 3, "concrete"), [542, 397, 0], "upgrading");
  S.add(box(514, 382, 20, 30, 3, 13, "wall") + windows(514, 382, 20, 30, 5, 14, "y", 2, 1, "louvre") + windows(514, 382, 20, 30, 5, 14, "x", 3, 1, "louvre") + sideText("UPGRADING", [516, 412], 14, "left", 2.6, "facelabel dark"), [524, 397, 3], "upgrading");
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) S.add(cyl(542 + i * 9, 388 + j * 14, 3.4, 3, 30, "steel", { steps: 16 }) + band(542 + i * 9, 388 + j * 14, 3.4, 12) + cyl(542 + i * 9, 388 + j * 14, 3.7, 33, 1.5, "petrol", { steps: 16 }), [542 + i * 9, 388 + j * 14, 3], "upgrading");

  // ---------- Medição, odorização e ponto de injeção
  S.add(box(606, 430, 32, 22, 0, 9, "wall") + stripe(606, 430, 32, 22, 0.5, 2.5, "brandband") + windows(606, 430, 32, 22, 3, 8, "y", 3, 1, "louvre") + box(604, 428, 36, 26, 9, 1.4, "petrol"), [622, 441, 0], "injecao");
  S.add(cyl(648, 440, 2.4, 0, 12, "amber", { steps: 12 }) + cyl(648, 440, 3.6, 12, 2.4, "amber", { steps: 12 }) + cyl(648, 454, 2.4, 0, 8, "amber", { steps: 12 }), [648, 446, 0], "injecao");

  // ---------- CO2: tanques criogênicos, liquefação e poço de injeção
  for (const [x, y] of [[588, 505], [612, 505]]) S.add(cyl(x, y, 8, 0, 36, "wall", { steps: 28 }) + band(x, y, 8, 12) + dome(x, y, 8, 36, "wall", { squash: 0.5, bands: 0 }) + sideText("CO₂", [x - 4, y + 7.6], 22, "left", 4, "facelabel dark"), [x, y, 0], "co2");
  S.add(box(578, 524, 44, 12, 0, 7, "steelDark") + windows(578, 524, 44, 12, 2, 6, "y", 4, 1, "louvre"), [600, 530, 0], "co2");
  S.add(box(626, 570, 22, 22, 0, 1.6, "concrete") + cyl(637, 581, 2.6, 1.6, 10, "red", { steps: 12 }) + cyl(637, 581, 4.2, 11, 2, "red", { steps: 12 }) + box(632, 579, 10, 4, 7, 1.2, "red") + cyl(637, 581, 1.2, 13, 4, "red", { steps: 8 }), [637, 581, 0], "co2");

  // ---------- Digestato: separador, lagoa e pilha
  S.add(box(492, 540, 26, 16, 0, 4, "steelDark") + cyl(504, 548, 6, 4, 12, "steel", { steps: 20 }) + box(512, 544, 12, 8, 4, 9, "steel"), [504, 548, 0], "digestato");
  S.add(cyl(396, 615, 40, 0, 12, "green", { steps: 72 }) + band(396, 615, 40, 6, "ln band m-green") + liquid(396, 615, 38, 11.5, "dig") + ladder(396, 615, 40, 0, 12), [396, 615, 0], "digestato");
  S.add(box(474, 596, 54, 46, 0, 3, "concrete") + prism(circleRing(500, 620, 19, 30), 3, 5, "digestate") + dome(500, 620, 14, 8, "digestate", { squash: 0.55, bands: 0 }), [500, 620, 0], "digestato");
  S.add(gable(474, 596, 54, 46, 14, 5, "wall", "roofGrey", "y", { noWalls: true, overhang: 0 }), [530, 645, 14], "digestato");
  for (const [x, y] of [[474, 596], [528, 596], [474, 642], [528, 642]]) S.add(box(x - 1, y - 1, 2, 2, 0, 14, "steelDark"), [x, y, 0], "digestato");

  // oficina / almoxarifado
  S.add(gable(560, 640, 64, 40, 12, 6, "wall", "roofGrey", "x") + door(560, 640, 64, 40, "y", 10, 12, 9, "gate") + windows(560, 640, 64, 40, 3, 10, "x", 3, 1, "win"), [592, 660, 0], "usina");

  for (const [x, y] of [[344, 186], [344, 706], [650, 706], [460, 706], [656, 330], [656, 620], [400, 186], [560, 708]]) S.add(tree(x, y, 1.15), [x, y, 0]);
}
