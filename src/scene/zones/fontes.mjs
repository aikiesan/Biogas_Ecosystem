// Zonas de origem dos resíduos: agricultura, pecuária, agroindústria e cidade.
import { iso, box, cyl, prism, dome, cone, gable, sawtooth, windows, door, stripe, band, ladder, silo, tree, pathOf, circleRing, groundRect, groundLine, fence, sideText } from "../kit.mjs";

const liquid = (cx, cy, r, z, cls) => `<path class="liquid ${cls}" d="${pathOf(circleRing(cx, cy, r, 56).map(([a, b]) => [a, b, z]), true)}"/>`;

export function buildFontes(S) {
  // ================= AGRICULTURA: canavial, colheita, palha
  S.floor(groundRect(10, 12, 190, 184, "field"));
  for (let i = 0; i < 15; i++) {
    const y = 18 + i * 12;
    const cut = i >= 11; // talhão já colhido: só a palha no chão
    if (cut) S.floor(groundRect(14, y, 182, 5, "strawrow", 1.75));
    else S.add(`<g class="canerow" style="transition-delay:${i * 0.12}s">` + box(14, y, 182, 5, 1.6, 7 + (i % 3), "cane", { r: 2, steps: 3 }) + `</g>`, [105, y + 2.5, 0], "agro");
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
  // açude (represinha da fazenda)
  S.floor(`<ellipse class="bankfill" cx="${iso([206, 404, 1.7])[0].toFixed(1)}" cy="${iso([206, 404, 1.7])[1].toFixed(1)}" rx="27" ry="13.5"/><ellipse class="pond" cx="${iso([206, 404, 1.75])[0].toFixed(1)}" cy="${iso([206, 404, 1.75])[1].toFixed(1)}" rx="23" ry="11.5"/>`);
  for (const [x, y] of [[238, 384], [236, 430], [118, 432], [10, 330], [180, 430]]) S.add(tree(x, y, 1.15), [x, y, 0]);

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
}
