// Ponto de entrada: liga diorama (stage), painel e navegação.
//
// Dois modos:
//  • Visão geral — o quadro fica PARADO. Tocar num pino/zona só abre o painel
//    e destaca a zona no mapa (sem zoom).
//  • Tour guiado — a câmera aproxima suavemente cada etapa, em ordem.
import { STOPS, CHAPTERS } from "./content/paradas.mjs";
import { createStage } from "./ui/stage.mjs";
import { renderIndex, renderStop, renderLegend } from "./ui/panel.mjs";
import { addLife } from "./ui/life.mjs";
import { createJourney } from "./ui/journey.mjs";
import { createAmbient } from "./ui/ambient.mjs";
import { addPeople } from "./ui/people.mjs";
import { POTENCIAL_SP, CAPACIDADE_SP_DIA, CBIO, CASA_M3_MES, ONIBUS_M3_DIA_REF, EVITADO_DIESEL } from "./data/numeros.mjs";

const $ = (id) => document.getElementById(id);
const svg = $("world"), panel = $("panel"), body = $("panel-body"), progress = $("progress");
const mobile = matchMedia("(max-width: 820px)");

let mode = "overview"; // "overview" | "tour"
let index = -1; // etapa aberta (-1 = índice)
const tourStops = STOPS;
const exploreStops = STOPS.filter((s) => !s.tourOnly);

const stage = createStage(svg, { stops: STOPS, onPick: (id) => open(id) });
$("loading").remove();
addLife(stage);
addPeople(stage, { houses: stage.night.houses });

// ---------- contador ao vivo (dados CP2b e ANP)
const POT_S = (POTENCIAL_SP.medianaBiAno * 1e9) / (365 * 86400); // m³ CH₄/s ≈ 189
const REAL_S = (CAPACIDADE_SP_DIA * 1e6) / 86400; // m³/s ≈ 4,6
const t0 = performance.now();
const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
let lastHud = 0;
// equivalências que se alternam a cada 5 s (fontes em DATA.md)
const EQS = [
  { f: (m) => m / CASA_M3_MES, t: "casas abastecidas por um mês (≈ 8,2 m³/mês, ARSESP)" },
  { f: (m) => m / ONIBUS_M3_DIA_REF, t: "ônibus rodando um dia inteiro (≈ 150–240 m³/dia)" },
  { f: (m) => m * EVITADO_DIESEL.ref, t: "t de CO₂e evitadas, se substituíssem diesel (EPE)" },
  { f: (m) => (m * CBIO.porMil_m3) / 1000, t: "CBIOs, se virassem biometano certificado (ref. EPE)" },
];
stage.onFrame((t) => {
  if (t - lastHud < 0.1) return; lastHud = t;
  const s = (performance.now() - t0) / 1000;
  $("hud-pot").textContent = nf.format(s * POT_S);
  $("hud-real").textContent = nf.format(s * REAL_S);
  const m3 = s * POT_S, eq = EQS[Math.floor(s / 5) % EQS.length];
  $("hud-eq").innerHTML = `≈ <b>${nf.format(eq.f(m3))}</b> ${eq.t}`;
});
$("hud-bar-real").style.width = `${(REAL_S / POT_S) * 100}%`;

// ---------- relógio: dia/noite, demanda de gás e safra da cana
const ambient = createAmbient(stage, {
  night: stage.night,
  onTick({ h, month, safra, pico, night, gasLevel }) {
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 10) * 10;
    $("clk-time").textContent = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    $("clk-ico").textContent = night > 0.5 ? "☾" : h < 8 || h > 17 ? "◐" : "☀";
    $("clk-month").textContent = month;
    $("clk-season").textContent = safra ? (pico ? "pico da safra" : "safra da cana") : "entressafra";
    $("clk-season").classList.toggle("off", !safra);
    $("gas-lvl").style.width = `${Math.round(gasLevel * 100)}%`;
  },
});
$("clk-pause").onclick = () => { const r = ambient.toggle(); $("clk-pause").textContent = r ? "❚❚" : "▶"; $("clk-pause").setAttribute("aria-label", r ? "Pausar o relógio" : "Retomar o relógio"); };

// ---------- figuras do painel conversam com o mapa
body.addEventListener("pointerover", (e) => { const g = e.target.closest("[data-tag]"); if (g && !journey.running) stage.hover(g.dataset.tag); });
body.addEventListener("pointerout", (e) => { if (e.target.closest("[data-tag]") && !journey.running) stage.hover(null); });

// ---------- "Siga o carbono"
const journey = createJourney(stage, {
  caption(text, i, n) {
    $("caption").hidden = !text;
    if (text) { $("cap-step").innerHTML = Array.from({ length: n }, (_, k) => `<i class="${k < i ? "done" : k === i ? "on" : ""}"></i>`).join(""); $("cap-text").textContent = text; $("cap-text").classList.remove("in"); void $("cap-text").offsetWidth; $("cap-text").classList.add("in"); }
  },
  onState(on) { $("journey-btn").textContent = on ? "■ Parar" : "▶ Siga o carbono"; document.body.classList.toggle("journey", on); },
});
$("journey-btn").onclick = () => (journey.running ? journey.stop() : (stage.frame(null, 700), journey.start()));

// ---------- passar o mouse: rótulo da peça e conexões acesas
const LABELS = Object.fromEntries(STOPS.filter((s) => s.tags && !s.badge).map((s) => [s.tags[0], s.kicker]));
Object.assign(LABELS, { aterro: "Aterro sanitário", nativa: "Mata Atlântica (floresta nativa)", agua: "Rio, represa e mata ciliar", distribuidora: "Distribuidora de gás canalizado", usina: "Usina de biogás", cidade: "Cidade", governo: "Governo e políticas públicas", industria: "Indústria", subestacao: "Subestação de energia", posto: "Posto de biometano" });
const tip = $("tip");
svg.addEventListener("pointermove", (e) => {
  if (journey.running || e.pointerType === "touch") return;
  const tag = stage.tagAt(e.target);
  stage.hover(tag);
  if (!tag || !LABELS[tag]) { tip.hidden = true; return; }
  const r = $("map").getBoundingClientRect();
  tip.hidden = false;
  tip.innerHTML = `<b>${LABELS[tag]}</b><span>clique para saber mais</span>`;
  tip.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top + 14}px)`;
});
svg.addEventListener("pointerleave", () => { if (!journey.running) stage.hover(null); tip.hidden = true; });

// legenda / camadas
$("legend").innerHTML = renderLegend();
$("legend").addEventListener("click", (e) => {
  const b = e.target.closest("[data-stream]");
  if (b) b.setAttribute("aria-pressed", String(stage.toggleStream(b.dataset.stream)));
});

function padding() {
  // no celular o painel cobre a parte de baixo do mapa
  if (!mobile.matches) return { top: 0, bottom: 0 };
  return { top: 0, bottom: 0 };
}

function list() { return mode === "tour" ? tourStops : exploreStops; }

function showIndex() {
  index = -1;
  body.innerHTML = renderIndex(STOPS, CHAPTERS);
  body.scrollTop = 0;
  $("panel-nav").hidden = true;
  stage.highlight(null);
  history.replaceState(null, "", location.pathname);
}

function show(i) {
  const L = list();
  index = Math.max(0, Math.min(L.length - 1, i));
  const stop = L[index];
  body.innerHTML = renderStop(stop, { index, total: L.length, inTour: mode === "tour" });
  body.scrollTop = 0;
  $("panel-nav").hidden = false;
  $("prev").disabled = index === 0;
  $("next").disabled = index === L.length - 1;
  progress.style.setProperty("--p", `${((index + 1) / L.length) * 100}%`);
  progress.setAttribute("aria-label", `Etapa ${index + 1} de ${L.length}`);
  stage.highlight(stop.tags || stop.streams !== "all" ? stop : null);
  stage.frame(stop);
  panel.classList.remove("min");
  history.replaceState(null, "", `#${stop.id}`);
}

function open(id) {
  const L = list();
  const i = L.findIndex((s) => s.id === id);
  if (i >= 0) show(i);
  else if (mode === "tour") { setMode("overview"); open(id); }
}

function setMode(m) {
  mode = m;
  document.body.dataset.mode = m;
  stage.setFollow(m === "tour");
  $("btn-overview").classList.toggle("on", m === "overview");
  $("btn-tour").classList.toggle("on", m === "tour");
  $("btn-overview").setAttribute("aria-pressed", String(m === "overview"));
  $("btn-tour").setAttribute("aria-pressed", String(m === "tour"));
  $("back-overview").hidden = m !== "tour";
  if (m === "tour") show(0);
  else { stage.frame(null, 900); showIndex(); }
}

$("btn-overview").onclick = () => setMode("overview");
$("back-overview").onclick = () => setMode("overview");
$("btn-tour").onclick = () => setMode("tour");
$("prev").onclick = () => show(index - 1);
$("next").onclick = () => show(index + 1);
$("sheet-handle").onclick = () => panel.classList.toggle("min");
body.addEventListener("click", (e) => {
  if (e.target.closest("[data-home]")) showIndex();
  if (e.target.closest("[data-tour]")) setMode("tour");
  const go = e.target.closest("[data-go]");
  if (go) open(go.dataset.go);
});
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea, summary")) return;
  if (e.key === "ArrowRight" && index >= 0) show(index + 1);
  if (e.key === "ArrowLeft" && index >= 0) show(index - 1);
  if (e.key === "Escape") setMode("overview");
});
addEventListener("resize", () => { stage.setPadding(padding()); stage.relayout(); });

// início: visão geral parada; um #id na URL abre direto a etapa
stage.setPadding(padding());
document.body.dataset.mode = mode;
stage.frame(null, 1);
const fromHash = location.hash.slice(1);
if (fromHash && STOPS.some((s) => s.id === fromHash)) {
  if (STOPS.find((s) => s.id === fromHash).tourOnly) { setMode("tour"); show(tourStops.findIndex((s) => s.id === fromHash)); }
  else open(fromHash);
} else showIndex();
