// Resíduos urbanos e esgoto, ao lado da cidade: coleta → triagem
// (recicláveis, orgânicos e rejeitos), aterro sanitário com captação de gás
// e estação de tratamento de esgoto (ETE) com digestor de lodo.
import { box, cyl, prism, dome, cone, gable, windows, door, stripe, band, ladder, tree, pathOf, circleRing, groundRect, sideText } from "../kit.mjs";

const liquid = (cx, cy, r, z, cls) => `<path class="liquid ${cls}" d="${pathOf(circleRing(cx, cy, r, 56).map(([a, b]) => [a, b, z]), true)}"/>`;
export const CLARIFIERS = [[584, 842], [632, 842]];

export function buildResiduos(S) {
  // ---------- aterro sanitário em patamares, com poços de gás
  for (let i = 0; i < 4; i++) {
    const s = i * 10;
    S.add(box(312 + s, 772 + s, 118 - 2 * s, 118 - 2 * s, i * 7, 7, i === 3 ? "grassDark" : "soil", { r: 6, steps: 4 }), [371, 831, i * 7], "aterro");
  }
  for (const [x, y] of [[356, 812], [388, 818], [370, 846], [398, 846]]) S.add(cyl(x, y, 1.3, 28, 9, "steelDark", { steps: 10 }) + cyl(x, y, 2, 37, 1.2, "steelDark", { steps: 10 }), [x, y, 30], "aterro");
  // queimador do gás de aterro
  S.add(cyl(440, 900, 2, 0, 18, "steelDark", { steps: 10 }) + cyl(440, 900, 3, 18, 2, "petrol", { steps: 10 }), [440, 900, 0], "aterro");

  // ---------- triagem (recicláveis) e recepção de orgânicos
  S.add(gable(452, 770, 86, 36, 11, 6, "wallBlue", "roofGrey", "x") + door(452, 770, 86, 36, "y", 8, 12, 8, "gate") + door(452, 770, 86, 36, "y", 30, 12, 8, "gate") + windows(452, 770, 86, 36, 3, 9, "x", 3, 1, "louvre") + sideText("TRIAGEM", [458, 806], 10, "left", 3.6, "facelabel dark"), [495, 788, 0], "urb");
  // fardos de recicláveis por tipo: papel, plástico, metal, vidro
  [["wallBlue", "papel"], ["red", "plástico"], ["steel", "metal"], ["leafLight", "vidro"]].forEach(([m], k) => {
    for (let j = 0; j < 2; j++) S.add(box(454 + k * 20, 814 + j * 9, 14, 7, 1.6, 6, m), [461 + k * 20, 818 + j * 9, 0], "urb");
  });
  // galpão de orgânicos (vai para o biodigestor) e caçambas
  S.add(gable(452, 846, 60, 30, 10, 5, "wall", "roofGreen", "x") + door(452, 846, 60, 30, "y", 22, 14, 8, "gate") + sideText("ORGÂNICOS", [458, 876], 9, "left", 3.4, "facelabel dark"), [482, 861, 0], "urb");
  S.add(box(520, 852, 14, 9, 1.6, 6, "green") + box(520, 866, 14, 9, 1.6, 6, "green") + box(520, 880, 14, 9, 1.6, 6, "steelDark"), [527, 870, 0], "urb");

  // ---------- ETE: tanque de aeração, decantadores, digestor de lodo (ovo) e gasômetro
  S.add(box(552, 770, 92, 38, 0, 7, "concrete") + groundRect(555, 773, 86, 32, "liquid water aer", 6.6) + box(552, 786, 92, 2, 7, 1.2, "steelDark"), [598, 789, 0], "ete");
  for (const [x, y] of CLARIFIERS) S.add(cyl(x, y, 19, 0, 7, "concrete", { steps: 56 }) + liquid(x, y, 17, 6.6, "water") + cyl(x, y, 2.4, 7, 2.4, "steelDark", { steps: 12 }), [x, y, 0], "ete");
  // digestor em forma de ovo: cone embaixo, corpo e domo
  S.add(cyl(670, 800, 11, 0, 4, "concrete", { steps: 32 }) + cyl(670, 800, 13, 4, 22, "wall", { steps: 40 }) + band(670, 800, 13, 14) + dome(670, 800, 13, 26, "wall", { squash: 0.9, bands: 1 }) + ladder(670, 800, 13, 4, 26) + cyl(670, 800, 2, 37, 6, "petrol", { steps: 10 }), [670, 800, 0], "ete");
  S.add(dome(670, 846, 11, 0.3, "wall", { squash: 0.75, bands: 2 }), [670, 846, 0], "ete");
  S.add(box(556, 878, 46, 26, 0, 10, "wall") + windows(556, 878, 46, 26, 3, 9, "y", 5, 1, "win", 2) + box(554, 876, 50, 30, 10, 1.4, "petrol") + sideText("ETE", [562, 904], 11, "left", 4, "facelabel"), [579, 891, 0], "ete");
  for (const [x, y] of [[312, 912], [446, 768], [690, 918], [540, 910], [612, 912]]) S.add(tree(x, y, 1.15), [x, y, 0]);
}
