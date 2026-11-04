// Planta geral do diorama (coordenadas de mundo: x desce para a direita,
// y desce para a esquerda, z para cima; 1 unidade ≈ 1 px na visão geral).
export const BASE = { x: -40, y: -40, w: 1170, d: 1000 };

// Lotes de cada zona. id = etiqueta usada para destacar objetos.
export const PLOTS = [
  { id: "agro", x: 0, y: 0, w: 250, d: 215, mat: "plotAgro", label: "AGRICULTURA" },
  { id: "pec", x: 0, y: 232, w: 250, d: 210, mat: "plotPec", label: "PECUÁRIA" },
  { id: "ind", x: 0, y: 459, w: 250, d: 212, mat: "plotInd", label: "AGROINDÚSTRIA" },
  { id: "urb", x: 0, y: 688, w: 250, d: 232, mat: "plotUrb", label: "RESÍDUOS URBANOS" },
  { id: "usina", x: 328, y: 170, w: 340, d: 556, mat: "plant", label: "USINA DE BIOGÁS E BIOMETANO" },
  { id: "cp2b", x: 300, y: 758, w: 392, d: 170, mat: "plotUni", label: "UNIVERSIDADE · CP2b" },
  { id: "industria", x: 728, y: 0, w: 372, d: 160, mat: "plotInd", label: "INDÚSTRIA" },
  { id: "posto", x: 728, y: 178, w: 160, d: 130, mat: "city", label: "POSTO" },
  { id: "subestacao", x: 905, y: 178, w: 195, d: 130, mat: "city", label: "SUBESTAÇÃO" },
  { id: "cidade", x: 728, y: 372, w: 372, d: 556, mat: "city", label: "CIDADE" },
];

export const ROAD_W = 14;
// Ruas ao longo de x: [y, x0, x1]  e ao longo de y: [x, y0, y1]
export const ROADS_X = [
  [108, 236, 284], [330, 236, 284], [565, 236, 284], [800, 236, 284],
  [452, 270, 338], [742, 270, 712], [340, 690, 1100], [640, 712, 1100], [520, 910, 1100],
];
export const ROADS_Y = [
  [270, 60, 850], [705, -30, 940], [910, 340, 940],
];
