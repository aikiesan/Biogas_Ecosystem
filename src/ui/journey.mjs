// "Siga o carbono": uma partícula percorre o ciclo curto do carbono,
// do ar à lavoura, à usina, à rede, ao fogão, e de volta ao ar.
// O quadro não se move; a zona de cada trecho ganha contorno.
import { STREAMS } from "./palette.mjs";

const LEGS = [
  { tag: "agro", stream: "co2", text: "A cana captura CO₂ do ar enquanto cresce.", pts: [[110, 60, 120], [110, 100, 14]] },
  { tag: "agro", stream: "substrato", text: "A palha segue de caminhão até a usina.", pts: [[110, 100, 14], [236, 108, 5], [270, 108, 5], [270, 452, 5], [338, 452, 5]] },
  { tag: "recepcao", stream: "substrato", text: "Na recepção, os resíduos são misturados.", pts: [[338, 452, 5], [357, 452, 8], [357, 410, 8], [372, 356, 24]] },
  { tag: "cstr", stream: "biogas", text: "No biodigestor, microrganismos transformam o carbono em metano (CH₄).", pts: [[372, 356, 24], [404, 356, 4], [404, 290, 4], [440, 290, 46], [476, 290, 4]] },
  { tag: "biogas", stream: "biogas", text: "O biogás fica guardado no gasômetro.", pts: [[476, 290, 4], [500, 290, 4], [500, 232, 4], [548, 232, 26]] },
  { tag: "upgrading", stream: "biometano", text: "As membranas separam o CO₂: nasce o biometano.", pts: [[548, 232, 26], [580, 245, 4], [600, 245, 4], [600, 372, 4], [552, 397, 34]] },
  { tag: "injecao", stream: "biometano", text: "Medido e odorizado, entra na rede de gás.", pts: [[552, 397, 34], [590, 410, 4], [590, 441, 4], [622, 441, 14], [648, 441, 4]] },
  { tag: "casa", stream: "biometano", text: "Pelo gasoduto, chega ao fogão da sua casa.", pts: [[648, 441, 4], [700, 441, 4], [700, 600, 4], [722, 600, 4], [722, 864, 4], [743, 862, 8]] },
  { tag: "casa", stream: "co2", text: "Ao cozinhar, o carbono volta ao ar como CO₂…", pts: [[743, 862, 8], [743, 862, 130]] },
  { tag: "agro", stream: "co2", text: "…e a lavoura o captura de novo. É o ciclo curto do carbono.", pts: [[743, 862, 130], [430, 480, 210], [110, 60, 120]] },
];

export function createJourney(stage, { caption, onState }) {
  const { svg, iso } = stage;
  const layer = svg.querySelector("#L-journey");
  // pré-calcula trechos em coordenadas de tela
  const legs = LEGS.map((l) => {
    const pts = l.pts.map(iso);
    const segs = []; let total = 0;
    for (let i = 0; i < pts.length - 1; i++) { const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); segs.push({ a: pts[i], b: pts[i + 1], len, start: total }); total += len; }
    return { ...l, segs, total, d: "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join("L") };
  });
  const SPEED = 110; // unidades de tela por segundo
  const PAUSE = 1.6; // segundos parado no fim de cada trecho
  let running = false, t0 = 0, legIdx = -1;

  layer.innerHTML = `<path class="jtrail" id="jtrail"/><g id="jtok" class="jtok"><circle class="jglow" r="20"/><circle class="jcore" r="9"/><text class="jt" y="0.5">C</text></g>`;
  const tok = layer.querySelector("#jtok"), trail = layer.querySelector("#jtrail");
  layer.style.display = "none";

  const at = (leg, d) => {
    const s = leg.segs.find((g) => d <= g.start + g.len) || leg.segs[leg.segs.length - 1];
    const u = s.len ? Math.min(1, (d - s.start) / s.len) : 1;
    return [s.a[0] + (s.b[0] - s.a[0]) * u, s.a[1] + (s.b[1] - s.a[1]) * u];
  };

  stage.onFrame((t) => {
    if (!running) return;
    let e = t - t0, i = 0;
    while (i < legs.length && e > legs[i].total / SPEED + PAUSE) { e -= legs[i].total / SPEED + PAUSE; i++; }
    if (i >= legs.length) { stop(); return; }
    const leg = legs[i];
    if (i !== legIdx) {
      legIdx = i;
      const c = STREAMS[leg.stream].color;
      tok.style.setProperty("--c", c);
      tok.querySelector(".jt").textContent = leg.stream === "co2" ? "CO₂" : leg.stream === "substrato" ? "C" : "CH₄";
      trail.setAttribute("d", leg.d); trail.style.setProperty("--c", c);
      caption(leg.text, i, legs.length);
      stage.hover(leg.tag, { halo: false });
    }
    const [x, y] = at(leg, Math.min(leg.total, e * SPEED));
    const k = stage.scale();
    tok.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(2)})`);
  });

  function start() { running = true; legIdx = -1; t0 = performance.now() / 1000; layer.style.display = ""; onState(true); }
  function stop() { running = false; layer.style.display = "none"; stage.hover(null); caption(null); onState(false); }
  return { start, stop, get running() { return running; } };
}
