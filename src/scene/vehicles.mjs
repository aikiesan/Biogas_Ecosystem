// Veículos animados: caminhões (substratos e digestato), ônibus e carros.
import { box, iso, depth } from "./kit.mjs";

export const ROUTES = [
  { id: "t-agro", kind: "truck", cargo: "straw", pts: [[236, 108], [270, 108], [270, 452], [338, 452]] },
  { id: "t-pec", kind: "tanker", cargo: "manure", pts: [[236, 330], [270, 330], [270, 452], [338, 452]] },
  { id: "t-ind", kind: "tanker", cargo: "steel", pts: [[236, 565], [270, 565], [270, 452], [338, 452]] },
  { id: "t-urb", kind: "truck", cargo: "urban", pts: [[236, 800], [270, 800], [270, 452], [338, 452]] },
  { id: "t-dig", kind: "tanker", cargo: "digestate", pts: [[338, 452], [264, 452], [264, 120], [236, 120]] },
  { id: "t-dig2", kind: "truck", cargo: "digestate", pts: [[338, 452], [264, 452], [264, 342], [236, 342]] },
  { id: "t-bus", kind: "bus", cargo: "lima", pts: [[699, 940], [699, 334], [1100, 334]] },
  { id: "c-1", kind: "car", cargo: "urban", pts: [[1100, 646], [711, 646], [711, -30]] },
  { id: "c-2", kind: "car", cargo: "red", pts: [[904, 940], [904, 346], [1100, 346]] },
  { id: "c-3", kind: "car", cargo: "wall", pts: [[916, 340], [916, 940]] },
  { id: "c-4", kind: "car", cargo: "steelDark", pts: [[1100, 514], [916, 514], [916, 940]] },
  { id: "c-5", kind: "car", cargo: "amber", pts: [[270, 745], [699, 745], [699, 940]] },
];

// Peças em coordenadas locais: u ao longo do sentido, v lateral.
const SHAPES = {
  truck: (c) => [[-15, -1, -3.6, 3.6, 1.6, 9, c], [-15, 6, -3, 3, 0, 1.8, "petrol"], [0, 6, -3.4, 3.4, 1.6, 8, "wall"], [3.6, 6.05, -3, 3, 4.2, 7.4, "glass"]],
  tanker: (c) => [[-15, -1, -3.4, 3.4, 2, 8.6, c], [-15, 6, -3, 3, 0, 1.8, "petrol"], [0, 6, -3.4, 3.4, 1.6, 8, "wall"], [3.6, 6.05, -3, 3, 4.2, 7.4, "glass"]],
  bus: (c) => [[-14, 8, -3.6, 3.6, 1.6, 10, c], [-14, 8, -3.6, 3.6, 0, 1.8, "petrol"], [7.8, 8.05, -3, 3, 4.5, 9, "glass"]],
  car: (c) => [[-4, 4, -2.2, 2.2, 0.6, 3.4, c], [-2.4, 2, -2, 2, 3.4, 5.4, "glass"], [-2.2, 1.8, -2.1, 2.1, 5.4, 5.8, c]],
};

function shape(kind, cargo, h) {
  const map = (u, v) => h === "px" ? [u, v] : h === "nx" ? [-u, -v] : h === "py" ? [-v, u] : [v, -u];
  const out = SHAPES[kind](cargo).map(([u0, u1, v0, v1, z0, z1, m]) => {
    const a = map(u0, v0), b = map(u1, v1);
    const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = Math.abs(a[0] - b[0]), d = Math.abs(a[1] - b[1]);
    return { d: depth([x + w / 2, y + d / 2, z0]), s: box(x, y, w, d, z0, z1 - z0, m, { r: kind === "car" ? 1 : 0.8 }) };
  });
  out.sort((p, q) => p.d - q.d);
  return out.map((p) => p.s).join("");
}

export function buildVehicles() {
  return ROUTES.map((r) => {
    const variants = ["px", "nx", "py", "ny"].map((h) => `<g class="veh-${h}" style="display:none">${shape(r.kind, r.cargo, h)}</g>`).join("");
    return { ...r, svg: `<g class="vehicle ${r.kind}" id="${r.id}">${variants}</g>`, screen: r.pts.map(([x, y]) => iso([x, y, 1.7])) };
  });
}
