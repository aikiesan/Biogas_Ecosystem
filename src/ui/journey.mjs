// "Siga o carbono": uma partícula percorre o ciclo curto do carbono,
// do ar à lavoura, à usina, à rede, ao fogão, e de volta ao ar.
// Funciona no piloto automático contínuo (loop) ou controlado passo a passo.
import { STREAMS } from "./palette.mjs";

const LEGS = [
  { tag: "agro", zone: "1 · Lavoura (Fotossíntese)", mol: "CO₂", stream: "co2", text: "A cana captura CO₂ do ar enquanto cresce.", focus: [0, 0, 260, 215], pts: [[110, 60, 120], [110, 100, 14]] },
  { tag: "agro", zone: "2 · Colheita e Transporte", mol: "C org.", stream: "substrato", text: "A palha segue de caminhão até a usina.", focus: [0, 80, 380, 480], pts: [[110, 100, 14], [236, 108, 5], [270, 108, 5], [270, 452, 5], [338, 452, 5]] },
  { tag: "recepcao", zone: "3 · Recepção e Preparo", mol: "C org.", stream: "substrato", text: "Na recepção, os resíduos são pesados, triturados e misturados.", focus: [290, 320, 430, 500], pts: [[338, 452, 5], [357, 452, 8], [357, 410, 8], [372, 356, 24]] },
  { tag: "cstr", zone: "4 · Biodigestor CSTR", mol: "CH₄ + CO₂", stream: "biogas", text: "Sem oxigênio, microrganismos transformam o carbono em metano (CH₄).", focus: [360, 240, 520, 480], pts: [[372, 356, 24], [404, 356, 4], [404, 290, 4], [440, 290, 46], [476, 290, 4]] },
  { tag: "biogas", zone: "5 · Gasômetro", mol: "Biogás", stream: "biogas", text: "O biogás (≈ 60% CH₄) fica armazenado no gasômetro.", focus: [470, 180, 640, 310], pts: [[476, 290, 4], [500, 290, 4], [500, 232, 4], [548, 232, 26]] },
  { tag: "upgrading", zone: "6 · Purificação (Upgrading)", mol: "CH₄ ≥ 90%", stream: "biometano", text: "Membranas separam o CO₂: nasce o biometano puro.", focus: [490, 220, 650, 450], pts: [[548, 232, 26], [580, 245, 4], [600, 245, 4], [600, 372, 4], [552, 397, 34]] },
  { tag: "injecao", zone: "7 · Injeção na Rede", mol: "Biometano", stream: "biometano", text: "Medido e odorizado, o biometano entra na rede de gás.", focus: [530, 380, 720, 490], pts: [[552, 397, 34], [590, 410, 4], [590, 441, 4], [622, 441, 14], [648, 441, 4]] },
  { tag: "casa", zone: "8 · Consumo Urbano", mol: "CH₄", stream: "biometano", text: "Pelo gasoduto subterrâneo, chega ao fogão da sua casa.", focus: [640, 440, 920, 910], pts: [[648, 441, 4], [700, 441, 4], [700, 600, 4], [722, 600, 4], [722, 864, 4], [743, 862, 8]] },
  { tag: "casa", zone: "9 · Combustão Limpa", mol: "CO₂", stream: "co2", text: "Ao cozinhar, gera calor e devolve CO₂ biogênico ao ar…", focus: [680, 620, 920, 920], pts: [[743, 862, 8], [743, 862, 130]] },
  { tag: "agro", zone: "10 · Ciclo Curto do Carbono", mol: "CO₂ ↻", stream: "co2", text: "…que a lavoura captura de novo, fechando o ciclo neutro em carbono.", focus: "all", pts: [[743, 862, 130], [430, 480, 210], [110, 60, 120]] },
];

export function createJourney(stage, { onStep, onState }) {
  const { iso } = stage;
  const layer = document.getElementById("L-journey");
  const SPEED = 105; // unidades de tela por segundo
  const PAUSE = 2.0; // segundos de leitura no fim de cada trecho

  // pré-calcula trechos em coordenadas de tela e tempo acumulado
  let accTime = 0;
  const legs = LEGS.map((l) => {
    const pts = l.pts.map(iso);
    const segs = []; let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      segs.push({ a: pts[i], b: pts[i + 1], len, start: total });
      total += len;
    }
    const dur = total / SPEED + PAUSE;
    const out = { ...l, segs, total, dur, startT: accTime, d: "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join("L") };
    accTime += dur;
    return out;
  });
  const totalCycleDur = accTime;

  let running = false, paused = false, followCam = true;
  let elapsed = 0, lastT = 0, legIdx = -1;

  layer.innerHTML = `<path class="jtrail" id="jtrail"/><g id="jtok" class="jtok"><circle class="jglow" r="20"/><circle class="jcore" r="9.5"/><text class="jt" y="0.5">C</text></g>`;
  const tok = layer.querySelector("#jtok"), trail = layer.querySelector("#jtrail");
  layer.closest("svg").style.display = "none";

  const at = (leg, d) => {
    const s = leg.segs.find((g) => d <= g.start + g.len) || leg.segs[leg.segs.length - 1];
    const u = s.len ? Math.min(1, (d - s.start) / s.len) : 1;
    return [s.a[0] + (s.b[0] - s.a[0]) * u, s.a[1] + (s.b[1] - s.a[1]) * u];
  };

  function applyLeg(i) {
    legIdx = i;
    const leg = legs[i];
    const c = STREAMS[leg.stream].color;
    tok.style.setProperty("--c", c);
    tok.querySelector(".jt").textContent = leg.stream === "co2" ? "CO₂" : leg.stream === "substrato" ? "C" : "CH₄";
    trail.setAttribute("d", leg.d);
    trail.style.setProperty("--c", c);
    stage.hover(leg.tag, { halo: true });
    if (followCam) {
      stage.setFollow(true);
      stage.frame(leg.focus === "all" ? null : { focus: leg.focus }, 1050);
    }
    onStep?.({ leg, index: i, total: legs.length, color: c, paused, followCam });
  }

  stage.onFrame((t) => {
    if (!running) return;
    const dt = lastT ? Math.min(0.1, t - lastT) : 0;
    lastT = t;
    if (!paused) elapsed = (elapsed + dt) % totalCycleDur;

    let i = legs.findIndex((l) => elapsed < l.startT + l.dur);
    if (i < 0) i = legs.length - 1;
    const leg = legs[i];
    if (i !== legIdx) applyLeg(i);

    const localE = Math.max(0, elapsed - leg.startT);
    const [x, y] = at(leg, Math.min(leg.total, localE * SPEED));
    const k = stage.scale();
    tok.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(2)})`);
  });

  function start() {
    running = true; paused = false; legIdx = -1; elapsed = 0; lastT = performance.now() / 1000;
    layer.closest("svg").style.display = "";
    onState?.(true);
  }
  function stop() {
    if (!running) return;
    running = false; paused = false;
    layer.closest("svg").style.display = "none";
    stage.hover(null);
    onStep?.(null);
    onState?.(false);
  }
  function goTo(idx) {
    if (!running) start();
    const target = ((idx % legs.length) + legs.length) % legs.length;
    elapsed = legs[target].startT + 0.001;
    applyLeg(target);
  }
  function togglePause() {
    if (!running) return false;
    paused = !paused;
    if (legIdx >= 0) onStep?.({ leg: legs[legIdx], index: legIdx, total: legs.length, color: STREAMS[legs[legIdx].stream].color, paused, followCam });
    return paused;
  }
  function toggleFollow() {
    followCam = !followCam;
    if (running && legIdx >= 0) {
      if (followCam) {
        stage.setFollow(true);
        const leg = legs[legIdx];
        stage.frame(leg.focus === "all" ? null : { focus: leg.focus }, 850);
      } else {
        stage.setFollow(false);
        stage.resetView(800);
      }
      onStep?.({ leg: legs[legIdx], index: legIdx, total: legs.length, color: STREAMS[legs[legIdx].stream].color, paused, followCam });
    }
    return followCam;
  }

  return {
    start,
    stop,
    goTo,
    next() { goTo((legIdx + 1) % legs.length); },
    prev() { goTo((legIdx - 1 + legs.length) % legs.length); },
    togglePause,
    toggleFollow,
    get running() { return running; },
    get paused() { return paused; },
    get followCam() { return followCam; },
  };
}
