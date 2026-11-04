// Destinos: indústria, posto de biometano, subestação, cidade e universidade (CP2b).
import { iso, box, cyl, dome, gable, sawtooth, windows, door, stripe, band, ladder, tree, pathOf, groundRect, groundLine, groundText, sideText, fence, streetLight, tower, house, pylon, depth } from "../kit.mjs";

export const PYLONS = [[652, 300], [770, 322], [870, 322], [930, 262]];
export const PYLON_TOP = 54;
export const HOME = { x: 732, y: 852 };

export function buildCidade(S) {
  // ================= INDÚSTRIA (alimentos e bebidas: usa biometano e CO2)
  S.add(sawtooth(744, 20, 120, 60, 20, 6, "wall", "roofGrey") + stripe(744, 20, 120, 60, 0.5, 6, "storefront") + door(744, 20, 120, 60, "y", 20, 12, 9, "gate") + door(744, 20, 120, 60, "y", 50, 12, 9, "gate") + windows(744, 20, 120, 60, 8, 18, "x", 6, 1), [804, 50, 0], "industria");
  for (const [x, y] of [[890, 34], [912, 34]]) S.add(cyl(x, y, 8, 0, 34, "wall", { steps: 28 }) + band(x, y, 8, 12) + dome(x, y, 8, 34, "wall", { squash: 0.5, bands: 0 }) + sideText("CO₂", [x - 4, y + 7.6], 20, "left", 4, "facelabel dark"), [x, y, 0], "industria");
  S.add(tower(940, 22, 70, 46, 18, { mat: "wallBlue", lit: 2 }), [975, 45, 0], "industria");
  S.add(cyl(1050, 40, 5, 0, 50, "steel", { steps: 18 }) + band(1050, 40, 5, 44, "ln band red-band") + ladder(1050, 40, 5, 0, 50), [1050, 40, 0], "industria");
  S.add(box(760, 94, 22, 9, 1.6, 9, "wall") + box(782, 95, 7, 7, 1.6, 8, "petrol") + box(760, 94, 29, 9, 0, 1.8, "petrol"), [774, 98, 0], "industria");
  for (const [x, y] of [[1084, 110], [930, 130], [1040, 134], [880, 120]]) S.add(tree(x, y, 1.15), [x, y, 0]);

  // ================= POSTO DE BIOMETANO (bio-GNV)
  S.add(box(742, 196, 42, 30, 0, 12, "wall") + stripe(742, 196, 42, 30, 0.5, 8, "storefront") + door(742, 196, 42, 30, "y", 16, 6, 7) + box(740, 194, 46, 34, 12, 2, "green"), [763, 211, 0], "posto");
  for (const [x, y] of [[806, 206], [862, 206], [806, 262], [862, 262]]) S.add(box(x - 1.4, y - 1.4, 2.8, 2.8, 0, 18, "steel"), [x, y, 0], "posto");
  for (const [x, y] of [[822, 224], [846, 224], [822, 246], [846, 246]]) S.add(box(x - 1, y - 6, 2, 12, 1.6, 0.8, "concrete") + box(x - 2.4, y - 1.8, 4.8, 3.6, 2.4, 8, "wall") + box(x - 2.6, y - 2, 5.2, 4, 8.6, 1.4, "green"), [x, y, 0], "posto");
  S.addAt(box(798, 198, 74, 74, 18, 3, "green") + groundText("BIO-GNV", 806, 266, 8, "facelogo", "x", 21.2), depth([872, 272, 0]) + 0.5, "posto");
  // totem com preço
  S.add(`<path class="ln pole" d="${pathOf([[880, 296, 1.7], [880, 296, 26]])}"/>` + box(876, 294, 8, 4, 22, 10, "green") + sideText("BIO", [877, 298], 29, "left", 3.2, "facelabel"), [880, 296, 0], "posto");
  // ônibus a biometano estacionado
  S.add(box(746, 248, 42, 11, 1.6, 12, "lima") + windows(746, 248, 42, 11, 5, 12, "y", 7, 1, "win") + box(746, 248, 42, 11, 1.6, 2, "petrol") + box(750, 250, 30, 7, 13.6, 2, "steel"), [767, 254, 0], "posto");

  // ================= SUBESTAÇÃO
  S.floor(groundRect(924, 194, 70, 50, "gravel", 1.75));
  S.floor(fence([[924, 194], [994, 194], [994, 244], [924, 244], [924, 194]], 5));
  for (let i = 0; i < 3; i++) S.add(box(932 + i * 20, 204, 12, 12, 1.6, 12, "steelDark") + windows(932 + i * 20, 204, 12, 12, 2, 10, "y", 3, 1, "louvre") + cyl(936 + i * 20, 208, 1.1, 13.6, 7, "wall", { steps: 8 }) + cyl(940 + i * 20, 212, 1.1, 13.6, 7, "wall", { steps: 8 }), [938 + i * 20, 210, 2], "subestacao");
  for (const [x, y] of [[996, 296], [920, 296]]) S.add(tree(x, y, 1.15), [x, y, 0]);

  // ================= CITY GATE: chegada do gasoduto de transporte, filtragem,
  // aquecimento, redução de pressão, medição e odorização → rede da distribuidora
  S.floor(groundRect(1024, 190, 70, 96, "gravel", 1.75));
  S.floor(fence([[1024, 190], [1094, 190], [1094, 286], [1024, 286], [1024, 190]], 5));
  for (const [x, y] of [[1036, 204], [1048, 204], [1060, 204]]) S.add(cyl(x, y, 3.6, 1.6, 16, "steel", { steps: 16 }) + dome(x, y, 3.6, 17.6, "steel", { squash: 0.6, bands: 0 }), [x, y, 0], "citygate");
  S.add(box(1032, 222, 40, 14, 1.6, 6, "amber") + box(1036, 224, 32, 10, 7.6, 3, "steelDark"), [1052, 229, 0], "citygate");
  S.add(box(1030, 244, 22, 16, 1.6, 9, "steel") + windows(1030, 244, 22, 16, 3, 8, "y", 2, 1, "louvre"), [1041, 252, 0], "citygate");
  S.add(box(1060, 246, 28, 30, 0, 12, "wall") + windows(1060, 246, 28, 30, 3, 10, "y", 3, 1, "win", 2) + box(1058, 244, 32, 34, 12, 1.4, "green") + sideText("CITY GATE", [1062, 276], 13, "left", 2.6, "facelabel"), [1074, 261, 0], "citygate");
  S.add(cyl(1084, 214, 1, 1.6, 10, "red", { steps: 8 }) + box(1080, 212, 8, 4, 10, 4, "wall"), [1084, 214, 0], "citygate");

  // torres de transmissão (CHP -> subestação)
  PYLONS.forEach(([x, y]) => S.add(pylon(x, y, PYLON_TOP), [x, y, 0], "chp"));

  // ================= CIDADE
  // escola e quadra
  S.add(box(740, 390, 112, 42, 0, 14, "wallSand") + stripe(740, 390, 112, 42, 0.5, 2.5, "brandband") + windows(740, 390, 112, 42, 3, 12, "y", 10, 1, "win", 4) + windows(740, 390, 112, 42, 3, 12, "x", 3, 1) + box(738, 388, 116, 46, 14, 1.6, "amber") + groundText("ESCOLA", 750, 426, 7, "facelogo", "x", 15.8), [796, 411, 0], "cidade");
  S.floor(groundRect(740, 444, 112, 72, "court") + groundLine([[796, 444], [796, 516]], "courtline", 1.8) + groundLine([[740, 444], [852, 444], [852, 516], [740, 516], [740, 444]], "courtline", 1.8));
  // sede do governo (decisores públicos)
  S.floor(groundRect(740, 528, 150, 100, "plaza"));
  let gov = box(752, 548, 100, 50, 0, 3, "concrete") + box(756, 552, 92, 42, 3, 18, "wall") + windows(756, 552, 92, 42, 6, 19, "x", 4, 1, "win");
  for (let i = 0; i < 7; i++) gov += cyl(760 + i * 13.5, 597, 1.3, 3, 18, "wall", { steps: 10 });
  gov += box(752, 548, 100, 52, 21, 2.4, "steel") + box(770, 560, 64, 26, 23.4, 6, "wall") + box(768, 558, 68, 30, 29.4, 1.4, "steel");
  S.add(gov, [804, 573, 0], "governo");
  S.add(`<path class="ln pole" d="${pathOf([[870, 612, 1.7], [870, 612, 36]])}"/><path class="flag" d="${pathOf([[870, 612, 35], [870, 624, 35], [870, 624, 29], [870, 612, 29]], true)}"/>`, [870, 612, 0], "governo");
  S.add(groundText("GOVERNO", 760, 622, 7, "gt", "x", 1.8), [800, 622, 0]);

  // casas (oeste da rua 910, sul da rua 640)
  const walls = ["wall", "wallWarm", "wallBlue", "wallSand"];
  const roofs = ["roofRed", "roofRed", "roofGrey", "roofRed", "roofGreen"];
  let n = 0;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    if (i === 0 && j === 3) continue;
    const x = 730 + i * 42, y = 662 + j * 62;
    S.add(house(x, y, { wall: walls[n % 4], roof: roofs[n % 5], ridge: n % 2 ? "x" : "y", solar: n % 3 === 0 }), [x + 8, y + 7, 0], "cidade");
    n++;
  }
  // a "sua casa" — maior, com medidor de gás na frente
  S.add(house(HOME.x, HOME.y, { w: 22, d: 20, h: 10, wall: "wallWarm", roof: "roofRed", ridge: "y", solar: true }) + box(HOME.x + 23.4, HOME.y + 5, 2, 3, 0, 5, "amber") + sideText("MEU LAR", [HOME.x + 4, HOME.y + 20], 13, "left", 2.6, "facelabel dark"), [HOME.x + 11, HOME.y + 10, 0], "casa");

  // prédios (leste da rua 910)
  const blds = [[928, 382, 36, 30, 64, "wall"], [976, 384, 30, 30, 46, "wallBlue"], [1026, 380, 44, 34, 78, "wall"], [1078, 386, 18, 26, 30, "wallSand"],
    [1034, 540, 46, 34, 52, "wall"],
    [928, 660, 36, 32, 54, "wall"], [980, 656, 32, 36, 70, "wallBlue"], [1036, 664, 44, 30, 42, "wallSand"], [940, 742, 30, 30, 32, "wall"], [988, 744, 42, 34, 48, "wall"], [1048, 736, 36, 40, 60, "wallBlue"], [936, 826, 42, 40, 26, "wallSand"], [996, 830, 36, 32, 38, "wall"], [1048, 830, 40, 40, 30, "wall"]];
  for (const [x, y, w, d, h, mat] of blds) S.add(tower(x, y, w, d, h, { mat, balcony: h > 40 && x % 3 !== 1, solar: w >= 36 }), [x + w / 2, y + d / 2, 0], "cidade");
  // distribuidora de gás canalizado: centro de operação que monitora a rede
  S.add(tower(926, 534, 42, 36, 30, { mat: "wallBlue", lit: 3 }) + stripe(926, 534, 42, 36, 26, 28, "gasband") + sideText("DISTRIBUIDORA DE GÁS", [930, 570], 22, "left", 2.2, "facelabel dark"), [947, 552, 0], "distribuidora");
  S.add(`<path class="ln pole" d="${pathOf([[960, 540, 31], [960, 540, 44]])}"/>` + cyl(960, 540, 3, 44, 0.6, "steel", { steps: 12 }), [960, 540, 31], "distribuidora");
  // parque com lago (lazer e drenagem urbana)
  S.floor(groundRect(976, 530, 54, 50, "park"));
  { const [lx, ly] = iso([1002, 556, 1.75]); S.floor(`<ellipse class="bankfill" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" rx="22" ry="11"/><ellipse class="pond" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" rx="19" ry="9.5"/>`); }
  for (const [x, y] of [[982, 534], [1024, 576], [982, 578], [1026, 534], [1004, 532]]) S.add(tree(x, y, 1.15), [x, y, 0], "cidade");
  for (const [x, y] of [[870, 400], [870, 470], [870, 520], [1080, 600], [880, 912], [1088, 912], [960, 912], [740, 640 - 8]]) S.add(tree(x, y, 1.15), [x, y, 0]);
  // arborização das calçadas
  for (let x = 754; x < 1100; x += 48) if (x < 900 || x > 920) S.add(tree(x, 633, 0.95), [x, 633, 0], "cidade");
  for (let y = 424; y < 930; y += 52) if (y < 630 || y > 652) S.add(tree(900, y, 0.95), [900, y, 0], "cidade");
  for (let x = 930; x < 1100; x += 34) S.add(tree(x, 526, 0.85), [x, 526, 0], "cidade");
  // postes de luz
  for (let x = 730; x < 1100; x += 48) S.add(streetLight(x, 631, [0, 1]), [x, 631, 0]);
  for (let y = 400; y < 930; y += 52) S.add(streetLight(901, y, [1, 0]), [901, y, 0]);
}

export function buildUniversidade(S) {
  // lote: x 0–250, y 688–920 (ao lado da estrada principal)
  S.floor(groundRect(10, 820, 232, 7, "walk") + groundRect(104, 696, 7, 214, "walk"));
  // CP2b: prédio de pesquisa com laboratório e telhado verde
  let cp = box(124, 700, 96, 54, 0, 24, "wall") + stripe(124, 700, 96, 54, 0.5, 5, "storefront") + windows(124, 700, 96, 54, 7, 22, "y", 12, 2, "win", 4) + windows(124, 700, 96, 54, 7, 22, "x", 6, 2, "win", 3);
  cp += stripe(124, 700, 96, 54, 23, 24.4, "brandband") + box(124, 700, 96, 54, 24, 1.6, "steel") + box(128, 704, 88, 46, 25.6, 0.8, "grassDark");
  for (const x of [138, 150, 162]) cp += cyl(x, 710, 1.6, 26.4, 7, "steelDark", { steps: 10 });
  cp += groundText("CP2b", 174, 744, 13, "facelogo roof", "x", 26.6);
  cp += sideText("CP2b", [132, 754], 20, "left", 6, "facelabel brand");
  S.add(cp, [172, 727, 0], "cp2b");
  // planta-piloto: mini biodigestores e gasômetro
  S.floor(groundRect(12, 698, 84, 54, "gravel", 1.75));
  for (const [x, y] of [[28, 714], [52, 714]]) S.add(cyl(x, y, 8, 1.6, 12, "green", { steps: 32 }) + band(x, y, 8, 7, "ln band m-green") + dome(x, y, 7.5, 13.6, "wall", { squash: 0.45, bands: 1 }), [x, y, 0], "cp2b");
  S.add(dome(78, 722, 9, 1.7, "wall", { squash: 0.7, bands: 1 }), [78, 722, 0], "cp2b");
  S.add(box(16, 732, 30, 14, 0, 8, "wallBlue") + windows(16, 732, 30, 14, 2, 7, "y", 3, 1, "win", 2), [31, 739, 0], "cp2b");
  // salas de aula e biblioteca
  S.add(tower(14, 766, 74, 40, 16, { mat: "wallSand", lit: 2, solar: true }), [51, 786, 0], "cp2b");
  S.add(gable(124, 766, 96, 42, 14, 6, "wall", "roofGrey", "x") + windows(124, 766, 96, 42, 3, 12, "y", 9, 1, "win", 2) + windows(124, 766, 96, 42, 3, 12, "x", 4, 1), [172, 787, 0], "cp2b");
  S.add(tower(14, 840, 70, 46, 12, { mat: "wallBlue", lit: 1 }), [49, 863, 0], "cp2b");
  for (const [x, y] of [[100, 760], [232, 714], [236, 800], [96, 900], [120, 834], [236, 840]]) S.add(tree(x, y, 1.2), [x, y, 0], "cp2b");

}
