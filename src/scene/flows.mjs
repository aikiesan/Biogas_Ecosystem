// Fluxos de matéria e energia: tubulações no chão, linhas aéreas e
// "pontes de conhecimento" (CP2b ↔ usina, indústria, governo).
import { pathOf } from "./kit.mjs";
import { PYLONS, PYLON_TOP } from "./zones/cidade.mjs";

const Z = 2;
// tag = zona a que o trecho pertence (para destaque nas paradas)
export const PIPES = [
  { id: "f-pre", tags: ["recepcao"], stream: "substrato", pts: [[357, 424], [357, 414]] },
  { id: "f-pre2", tags: ["recepcao"], stream: "substrato", pts: [[355, 392], [365, 368]] },
  { id: "f-feed", tags: ["recepcao", "cstr"], stream: "substrato", pts: [[386, 356], [404, 356], [404, 290]] },
  { id: "f-feed2", tags: ["recepcao", "cstr"], stream: "substrato", pts: [[404, 356], [404, 390]] },
  { id: "f-dig", tags: ["cstr", "digestato"], stream: "digestato", pts: [[440, 326], [440, 354]] },
  { id: "f-dig2", tags: ["cstr", "digestato"], stream: "digestato", pts: [[440, 426], [440, 459]] },
  { id: "f-bg1", tags: ["cstr", "biogas"], stream: "biogas", pts: [[476, 290], [500, 290], [500, 232], [516, 232]] },
  { id: "f-bg2", tags: ["cstr", "biogas"], stream: "biogas", pts: [[476, 390], [500, 390], [500, 290]] },
  { id: "f-bg3", tags: ["digestato", "biogas"], stream: "biogas", pts: [[476, 495], [500, 495], [500, 390]] },
  { id: "f-chp", tags: ["biogas", "chp"], stream: "biogas", pts: [[548, 264], [548, 300]] },
  { id: "f-upg", tags: ["biogas", "upgrading"], stream: "biogas", pts: [[580, 245], [600, 245], [600, 372], [570, 372], [570, 380]] },
  { id: "f-flare", tags: ["biogas"], stream: "biogas", pts: [[580, 220], [636, 220], [636, 204]] },
  { id: "f-heat", tags: ["chp", "cstr"], stream: "calor", pts: [[520, 316], [486, 316], [486, 300], [476, 300]] },
  { id: "f-heat2", tags: ["chp", "cstr"], stream: "calor", pts: [[486, 316], [486, 400], [476, 400]] },
  { id: "f-bm", tags: ["upgrading", "injecao"], stream: "biometano", pts: [[574, 410], [590, 410], [590, 441], [606, 441]] },
  { id: "f-grid", tags: ["injecao", "cidade", "casa"], stream: "biometano", pts: [[648, 441], [700, 441], [700, 600], [722, 600], [722, 650], [910, 650], [910, 930]] },
  { id: "f-grid2", tags: ["injecao", "casa", "cidade"], stream: "biometano", pts: [[722, 650], [722, 864], [732, 864]] },
  { id: "f-grid3", tags: ["injecao", "cidade"], stream: "biometano", pts: [[910, 720], [1090, 720]] },
  { id: "f-grid4", tags: ["injecao", "cidade"], stream: "biometano", pts: [[722, 650], [722, 750], [900, 750]] },
  { id: "f-gov", tags: ["injecao", "governo"], stream: "biometano", pts: [[722, 600], [722, 573], [752, 573]] },
  { id: "f-posto", tags: ["injecao", "posto"], stream: "biometano", pts: [[700, 441], [700, 312], [834, 312], [834, 272]] },
  { id: "f-ind", tags: ["injecao", "industria"], stream: "biometano", pts: [[700, 312], [700, 90], [800, 90], [800, 80]] },
  { id: "f-co2", tags: ["upgrading", "co2"], stream: "co2", pts: [[574, 392], [604, 392], [604, 480], [588, 480], [588, 497]] },
  { id: "f-co2b", tags: ["co2"], stream: "co2", pts: [[612, 513], [612, 560], [637, 560], [637, 572]] },
  { id: "f-co2c", tags: ["co2", "industria"], stream: "co2", pts: [[622, 524], [690, 524], [690, 108], [890, 108], [890, 42]] },
  { id: "f-digout", tags: ["digestato"], stream: "digestato", pts: [[476, 510], [490, 510], [490, 548], [492, 548]] },
  { id: "f-digout2", tags: ["digestato"], stream: "digestato", pts: [[492, 552], [436, 552], [436, 577]] },
  { id: "f-digout3", tags: ["digestato"], stream: "digestato", pts: [[518, 556], [518, 604]] },
  { id: "f-aterro", tags: ["aterro", "biogas"], stream: "biogas", pts: [[432, 800], [446, 800], [446, 738], [500, 738], [500, 495]] },
  { id: "f-ete", tags: ["ete", "biogas"], stream: "biogas", pts: [[670, 787], [670, 738], [500, 738]] },
  { id: "f-esgoto", tags: ["ete", "cidade"], stream: "esgoto", pts: [[880, 905], [716, 905], [716, 798], [644, 798]] },
  { id: "f-esgoto2", tags: ["ete", "cidade"], stream: "esgoto", pts: [[716, 860], [880, 860]] },
  { id: "f-gn", tags: ["citygate"], stream: "gasnatural", pts: [[1126, 232], [1094, 232], [1072, 232]] },
  { id: "f-gn2", tags: ["citygate", "cidade", "distribuidora"], stream: "gasnatural", pts: [[1052, 286], [1052, 356], [926, 356], [926, 646], [912, 652]] },
  { id: "f-gnc", tags: ["gnc", "upgrading"], stream: "biometano", pts: [[590, 441], [590, 474], [576, 474]] },
  { id: "f-eGrid", tags: ["subestacao", "cidade"], stream: "eletricidade", pts: [[1012, 240], [1012, 330], [1100, 330]] },
  { id: "f-eGrid2", tags: ["subestacao", "cidade"], stream: "eletricidade", pts: [[1012, 330], [918, 330], [918, 640], [1090, 640]] },
  { id: "f-eGrid3", tags: ["subestacao", "cidade"], stream: "eletricidade", pts: [[918, 520], [868, 520], [868, 432], [852, 432]] },
];

function arc(a, b, lift, n = 24) {
  const pts = [];
  for (let t = 0; t <= n; t++) { const u = t / n; pts.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u + Math.sin(Math.PI * u) * lift]); }
  return pts;
}

export function buildFlows() {
  const pipes = PIPES.map((f) => {
    const d = pathOf(f.pts.map(([x, y]) => [x, y, Z]));
    return `<g class="flow s-${f.stream}" data-stream="${f.stream}"><path class="pipe" d="${d}"/><path class="core" id="${f.id}" d="${d}"/></g>`;
  }).join("");

  // linhas aéreas de energia: CHP -> torres -> subestação (com catenária)
  const wire = [[578, 309, 16], ...PYLONS.map(([x, y]) => [x, y, PYLON_TOP - 6]), [944, 210, 20]];
  const overhead = [];
  for (let i = 0; i < wire.length - 1; i++) overhead.push({ id: `w-${i}`, tags: ["chp", "subestacao"], stream: "eletricidade", d: pathOf(arc(wire[i], wire[i + 1], -6, 12)) });

  // pontes de conhecimento do CP2b (arcos altos)
  const cp2b = [172, 727, 34];
  const links = [
    { id: "k-usina", tags: ["cp2b", "cstr"], to: [499, 451, 14] },
    { id: "k-gov", tags: ["cp2b", "governo"], to: [804, 573, 30] },
    { id: "k-ind", tags: ["cp2b", "industria"], to: [975, 45, 20] },
  ].map((k) => ({ id: k.id, tags: k.tags, stream: "conhecimento", d: pathOf(arc(cp2b, k.to, 90 + Math.hypot(k.to[0] - cp2b[0], k.to[1] - cp2b[1]) * 0.12)) }));

  const lines = (list, cls) => `<g class="flow s-${list[0].stream} ${cls}" data-stream="${list[0].stream}">${list.map((w) => `<path class="core" id="${w.id}" d="${w.d}"/>`).join("")}</g>`;
  return {
    pipes,
    overhead: lines(overhead, "overhead") + lines(links, "overhead knowledge"),
    ids: PIPES.concat(overhead, links).map(({ id, stream, tags }) => ({ id, stream, tags })),
  };
}
