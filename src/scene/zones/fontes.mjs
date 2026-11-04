// Zonas de origem dos resíduos: agricultura, pecuária, agroindústria e cidade.
import { box, cyl, prism, dome, cone, gable, sawtooth, windows, door, stripe, band, ladder, silo, tree, pathOf, circleRing, groundRect, groundLine, fence, sideText } from "../kit.mjs";

const liquid = (cx, cy, r, z, cls) => `<path class="liquid ${cls}" d="${pathOf(circleRing(cx, cy, r, 56).map(([a, b]) => [a, b, z]), true)}"/>`;

export function buildFontes(S) {
  // ================= AGRICULTURA: canavial, colheita, palha
  S.floor(groundRect(10, 12, 190, 184, "field"));
  for (let i = 0; i < 15; i++) {
    const y = 18 + i * 12;
    const cut = i >= 11; // talhão já colhido: só a palha no chão
    if (cut) S.floor(groundRect(14, y, 182, 5, "strawrow", 1.75));
    else S.add(box(14, y, 182, 5, 1.6, 7 + (i % 3), "cane", { r: 2, steps: 3 }), [105, y + 2.5, 0], "agro");
  }
  // fardos de palha empilhados
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) S.add(box(208 + j * 14, 130 + i * 18, 12, 14, 1.6, i === 0 ? 12 : 6, "straw") + `<path class="ln twine" d="${pathOf([[214 + j * 14, 130 + i * 18, (i === 0 ? 13.6 : 7.6)], [214 + j * 14, 144 + i * 18, (i === 0 ? 13.6 : 7.6)]])}"/>`, [214 + j * 14, 137 + i * 18, 0], "agro");
  // galpão de máquinas e sede
  S.add(gable(206, 20, 34, 24, 10, 6, "wallWarm", "roofRed", "y") + door(206, 20, 34, 24, "y", 10, 12, 8, "gate"), [223, 32, 0], "agro");
  for (const [x, y] of [[232, 70], [240, 100], [236, 200], [6, 206]]) S.add(tree(x, y, 1.15), [x, y, 0]);

  // ================= PECUÁRIA: suínos, aves, gado leiteiro
  S.add(gable(16, 246, 120, 24, 9, 6, "wall", "roofGrey", "x", { ridgeVent: true }) + windows(16, 246, 120, 24, 2, 7, "y", 12, 1, "louvre"), [76, 258, 0], "pec");
  S.add(gable(16, 282, 120, 24, 9, 6, "wall", "roofGrey", "x", { ridgeVent: true }) + windows(16, 282, 120, 24, 2, 7, "y", 12, 1, "louvre"), [76, 294, 0], "pec");
  S.add(silo(142, 252, 5.5, 22), [142, 252, 0], "pec");
  S.add(silo(142, 290, 5.5, 22), [142, 290, 0], "pec");
  // pasto com vacas
  S.floor(groundRect(160, 244, 82, 74, "pasture"));
  S.floor(fence([[160, 244], [242, 244], [242, 318], [160, 318], [160, 244]], 3.6));
  const cows = [[170, 256, 0], [188, 270, 1], [208, 252, 0], [224, 282, 1], [176, 298, 0], [200, 302, 1], [226, 304, 0], [214, 266, 0]];
  for (const [x, y, c] of cows) {
    const m = c ? "cowBrown" : "cow";
    const dl = ((x * 7 + y * 3) % 50) / 10;
    S.add(`<g class="cow" style="animation-delay:-${dl}s;animation-duration:${9 + (x % 5)}s">` + box(x, y, 8, 3.6, 3, 3.6, m) + `<g class="cowhead">` + box(x + 8, y + 0.6, 2.6, 2.4, 5, 2.6, m) + `</g>` + box(x + 1, y + 0.4, 1, 1, 1.7, 1.4, "petrol") + box(x + 6, y + 2.2, 1, 1, 1.7, 1.4, "petrol") + `</g>`, [x + 4, y + 2, 0], "pec");
  }
  // free-stall do gado leiteiro
  S.add(gable(166, 330, 70, 30, 8, 6, "wall", "roofGreen", "x", { overhang: 2 }), [201, 345, 0], "pec");
  // esterqueira a céu aberto (emite metano!)
  S.add(cyl(60, 382, 32, 0, 5, "concrete", { steps: 56 }) + liquid(60, 382, 29, 4.6, "manure"), [60, 382, 0], "pec");
  S.add(cyl(130, 392, 12, 0, 14, "steel") + band(130, 392, 12, 7) + ladder(130, 392, 12, 0, 14), [130, 392, 0], "pec");
  for (const [x, y] of [[236, 380], [210, 428], [118, 432], [10, 330]]) S.add(tree(x, y, 1.15), [x, y, 0]);

  // ================= AGROINDÚSTRIA: usina de cana, vinhaça, alimentos
  // pátio de cana
  S.add(prism([[20, 560], [60, 560], [60, 584], [20, 584]], 0, 6, "cane") + prism([[24, 564], [56, 564], [56, 580], [24, 580]], 6, 3, "cane"), [40, 572, 0], "ind");
  // prédio da moenda/caldeira
  S.add(box(18, 474, 92, 56, 0, 30, "wall") + stripe(18, 474, 92, 56, 0.5, 6, "storefront") + windows(18, 474, 92, 56, 8, 27, "y", 10, 2) + windows(18, 474, 92, 56, 8, 27, "x", 6, 2) + box(16, 472, 96, 60, 30, 2, "roofGrey") + sideText("USINA", [30, 530], 18, "left", 6.5, "facelabel"), [64, 502, 0], "ind");
  S.add(cyl(34, 488, 5, 32, 56, "steel", { steps: 18 }) + band(34, 488, 5, 80, "ln band red-band"), [34, 488, 0], "ind");
  S.add(cyl(54, 488, 5, 32, 46, "steel", { steps: 18 }) + band(54, 488, 5, 70, "ln band red-band"), [54, 488, 0], "ind");
  S.add(box(114, 482, 20, 40, 0, 44, "steelDark") + box(116, 484, 16, 36, 44, 4, "steel") + windows(114, 482, 20, 40, 4, 40, "x", 3, 5, "louvre"), [124, 502, 0], "ind");
  // esteira de bagaço até a pilha
  S.add(`<path class="ln conveyor" d="${pathOf([[70, 530, 26], [70, 600, 12]])}"/><path class="ln conveyor" d="${pathOf([[74, 530, 26], [74, 600, 12]])}"/>`, [72, 560, 30], "ind");
  S.add(prism(circleRing(72, 618, 30, 36), 0, 6, "bagasse") + prism(circleRing(72, 618, 21, 32), 6, 5, "bagasse") + dome(72, 618, 13, 11, "bagasse", { squash: 0.6, bands: 0 }), [72, 618, 0], "ind");
  // tanques de vinhaça
  for (const [x, y] of [[166, 490], [206, 490]]) S.add(cyl(x, y, 16, 0, 22, "steel", { steps: 40 }) + band(x, y, 16, 8) + band(x, y, 16, 15) + ladder(x, y, 16, 0, 22) + sideText("VINHAÇA", [x - 8, y + 14], 14, "left", 3.4, "facelabel dark"), [x, y, 0], "ind");
  // fábrica de alimentos (sheds)
  S.add(sawtooth(132, 584, 96, 52, 14, 5, "wall", "roofGreen") + stripe(132, 584, 96, 52, 0.5, 5, "storefront") + door(132, 584, 96, 52, "y", 60, 10, 7, "gate"), [180, 610, 0], "ind");
  for (const [x, y] of [[240, 476], [240, 652], [10, 652], [120, 650]]) S.add(tree(x, y, 1.15), [x, y, 0]);

  // ================= RESÍDUOS URBANOS: aterro, ETE, triagem/compostagem
  for (let i = 0; i < 4; i++) {
    const s = i * 10;
    S.add(box(14 + s, 702 + s, 124 - 2 * s, 110 - 2 * s, i * 7, 7, i === 3 ? "grassDark" : "soil", { r: 6, steps: 4 }), [76, 757, i * 7], "urb");
  }
  for (const [x, y] of [[60, 737], [92, 747], [76, 772], [104, 772]]) S.add(cyl(x, y, 1.3, 28, 9, "steelDark", { steps: 10 }) + cyl(x, y, 2, 37, 1.2, "steelDark", { steps: 10 }), [x, y, 30], "urb");
  // ETE: decantadores com ponte, tanque de aeração e digestor de lodo
  for (const [x, y] of [[180, 722], [180, 772]]) S.add(cyl(x, y, 20, 0, 7, "concrete", { steps: 56 }) + liquid(x, y, 18, 6.6, "water") + box(x - 1, y - 19, 2, 38, 7, 1.4, "steelDark") + cyl(x, y, 2.4, 7, 2.4, "steelDark", { steps: 12 }), [x, y, 0], "urb");
  S.add(box(146, 814, 92, 40, 0, 7, "concrete") + groundRect(149, 817, 86, 34, "liquid water aer", 6.6) + box(146, 832, 92, 2, 7, 1.2, "steelDark"), [192, 834, 0], "urb");
  S.add(cyl(46, 852, 11, 0, 20, "steel") + dome(46, 852, 11, 20, "steel", { squash: 0.45, bands: 0 }) + ladder(46, 852, 11, 0, 20), [46, 852, 0], "urb");
  // galpão de triagem do orgânico
  S.add(gable(74, 836, 46, 30, 10, 6, "wallBlue", "roofGrey", "x") + door(74, 836, 46, 30, "y", 8, 12, 8, "gate") + door(74, 836, 46, 30, "y", 28, 12, 8, "gate"), [97, 851, 0], "urb");
  S.add(box(130, 880, 20, 14, 0, 9, "green") + box(152, 880, 20, 14, 0, 9, "steelDark") + box(174, 880, 20, 14, 0, 9, "urban"), [162, 887, 0], "urb");
  for (const [x, y] of [[14, 900], [240, 700], [222, 906], [240, 880]]) S.add(tree(x, y, 1.15), [x, y, 0]);
}
