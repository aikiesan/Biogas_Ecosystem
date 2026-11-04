// Ponto de entrada: liga diorama (stage), painel e navegação.
//
// Dois modos:
//  • Visão geral — o quadro fica PARADO. Tocar num pino/zona só abre o painel
//    e destaca a zona no mapa (sem zoom).
//  • Tour guiado — a câmera aproxima suavemente cada etapa, em ordem.
import { STOPS, CHAPTERS } from "./content/paradas.mjs";
import { createStage } from "./ui/stage.mjs";
import { renderIndex, renderStop, renderLegend } from "./ui/panel.mjs";

const $ = (id) => document.getElementById(id);
const svg = $("world"), panel = $("panel"), body = $("panel-body"), progress = $("progress");
const mobile = matchMedia("(max-width: 820px)");

let mode = "overview"; // "overview" | "tour"
let index = -1; // etapa aberta (-1 = índice)
const tourStops = STOPS;
const exploreStops = STOPS.filter((s) => !s.tourOnly);

const stage = createStage(svg, { stops: STOPS, onPick: (id) => open(id) });
$("loading").remove();

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
