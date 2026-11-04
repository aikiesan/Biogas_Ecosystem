// Planta geral do diorama (coordenadas de mundo: x desce para a direita,
// y desce para a esquerda, z para cima; 1 unidade ≈ 1 px na visão geral).
// Faixa norte (y < 0): rio com mata ciliar, Mata Atlântica, eucalipto e represa.
export const BASE = { x: -40, y: -300, w: 1170, d: 1260 };
export const RIVER = { y0: -48, y1: -16 };

// Lotes de cada zona. id = etiqueta usada para destacar objetos.
export const PLOTS = [
  { id: "agro", x: 0, y: 0, w: 250, d: 215, mat: "plotAgro", label: "AGRICULTURA" },
  { id: "pec", x: 0, y: 232, w: 250, d: 210, mat: "plotPec", label: "PECUÁRIA" },
  { id: "ind", x: 0, y: 459, w: 250, d: 212, mat: "plotInd", label: "AGROINDÚSTRIA" },
  { id: "cp2b", x: 0, y: 688, w: 250, d: 232, mat: "plotUni", label: "UNIVERSIDADE · CP2b" },
  { id: "usina", x: 328, y: 170, w: 340, d: 556, mat: "plant", label: "USINA DE BIOGÁS E BIOMETANO" },
  { id: "urb", x: 300, y: 758, w: 392, d: 170, mat: "plotUrb", label: "RESÍDUOS URBANOS E ESGOTO" },
  { id: "silvicultura", x: 300, y: -282, w: 370, d: 214, mat: "plotForest", label: "FLORESTA PLANTADA" },
  { id: "industria", x: 728, y: 0, w: 372, d: 160, mat: "plotInd", label: "INDÚSTRIA" },
  { id: "posto", x: 728, y: 178, w: 160, d: 130, mat: "city", label: "POSTO" },
  { id: "subestacao", x: 905, y: 178, w: 100, d: 130, mat: "city", label: "SUBESTAÇÃO" },
  { id: "citygate", x: 1015, y: 178, w: 85, d: 130, mat: "city", label: "CITY GATE" },
  { id: "cidade", x: 728, y: 372, w: 372, d: 556, mat: "city", label: "CIDADE" },
];

export const ROAD_W = 14;
// Ruas ao longo de x: [y, x0, x1]  e ao longo de y: [x, y0, y1]
export const ROADS_X = [
  [108, 236, 284], [330, 236, 284], [565, 236, 284], [800, 236, 284],
  [452, 270, 338], [742, 270, 712], [340, 690, 1100], [640, 712, 1100], [520, 910, 1100],
  [-120, 640, 712],
];
export const ROADS_Y = [
  [270, 60, 850], [705, -130, 940], [910, 340, 940],
];
