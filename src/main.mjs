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
// ---------- modo tela (papel de parede / proteção de tela / vídeo)
//   ?tela            só o diorama, em tela cheia, sem painéis nem contador
//   &passeio         a câmera passeia devagar pelas etapas
//   &dia=300         duração de um dia, em segundos (padrão 60)
//   &hora=19         hora inicial (padrão 10)
const params = new URLSearchParams(location.search);
const TELA = params.has("tela");
if (TELA) document.body.classList.add("tela");
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
  const potStr = nf.format(s * POT_S);
  $("hud-pot").textContent = potStr;
  $("hud-pot-mini").textContent = potStr;
  $("hud-real").textContent = nf.format(s * REAL_S);
  const m3 = s * POT_S, eq = EQS[Math.floor(s / 5) % EQS.length];
  $("hud-eq").innerHTML = `≈ <b>${nf.format(eq.f(m3))}</b> ${eq.t}`;
});
$("hud-bar-real").style.width = `${(REAL_S / POT_S) * 100}%`;

const toggleHud = () => {
  const exp = $("hud-body").hidden;
  $("hud-body").hidden = !exp;
  $("hud-compact-row").hidden = exp;
  $("hud-toggle").textContent = exp ? "▴" : "▾";
  $("hud-toggle").setAttribute("aria-expanded", String(exp));
};
$("hud-toggle").onclick = toggleHud;
$("hud-compact-row").onclick = toggleHud;

// ---------- relógio: dia/noite, demanda de gás e safra da cana
const ambient = createAmbient(stage, {
  night: stage.night,
  daySeconds: Number(params.get("dia")) || undefined,
  startHour: params.has("hora") ? Number(params.get("hora")) : 10,
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

// ---------- painel lateral colapsável (mais espaço para o mapa)
function setPanelHidden(hide, relayout = true) {
  const changed = document.body.classList.contains("panel-hidden") !== hide;
  document.body.classList.toggle("panel-hidden", hide);
  $("btn-panel-toggle").textContent = hide ? "⇤" : "⇥";
  $("btn-panel-toggle").setAttribute("aria-expanded", String(!hide));
  $("btn-panel-toggle").title = hide ? "Mostrar painel lateral (P)" : "Ocultar painel lateral (P)";
  if (changed && relayout) setTimeout(() => stage.relayout(), 220);
}
$("btn-panel-toggle").onclick = () => setPanelHidden(!document.body.classList.contains("panel-hidden"));

// ---------- "Siga o carbono"
const journey = createJourney(stage, {
  onStep(state) {
    $("caption").hidden = !state;
    if (!state) return;
    const { leg, index: i, total: n, color, paused, followCam } = state;
    $("cap-badge").textContent = leg.mol;
    $("cap-badge").style.background = color;
    $("cap-zone").textContent = leg.zone;
    $("cap-step").innerHTML = Array.from({ length: n }, (_, k) => `<button type="button" class="cap-dot ${k < i ? "done" : k === i ? "on" : ""}" data-leg="${k}" title="Etapa ${k + 1}" aria-label="Etapa ${k + 1}"></button>`).join("");
    $("cap-pause").textContent = paused ? "▶" : "❚❚";
    $("cap-pause").setAttribute("aria-label", paused ? "Retomar" : "Pausar");
    $("cap-cam").classList.toggle("on", followCam);
    $("cap-cam").setAttribute("aria-pressed", String(followCam));
    if ($("cap-text").textContent !== leg.text) {
      $("cap-text").textContent = leg.text;
      $("cap-text").classList.remove("in");
      void $("cap-text").offsetWidth;
      $("cap-text").classList.add("in");
    }
  },
  onState(on) {
    $("journey-btn").textContent = on ? "■ Parar jornada" : "▶ Siga o carbono";
    $("btn-journey").classList.toggle("on", on);
    $("btn-journey").setAttribute("aria-pressed", String(on));
    document.body.classList.toggle("journey", on);
    if (on) {
      $("btn-overview").classList.remove("on");
      $("btn-tour").classList.remove("on");
      setPanelHidden(true, true);
    } else {
      $("btn-overview").classList.toggle("on", mode === "overview");
      $("btn-tour").classList.toggle("on", mode === "tour");
      stage.setFollow(mode === "tour");
      setPanelHidden(false, false);
      setTimeout(() => { stage.relayout(); stage.frame(mode === "tour" && index >= 0 ? list()[index] : null, 750); }, 220);
    }
  },
});
const toggleJourney = () => {
  if (journey.running) journey.stop();
  else { stage.highlight(null); journey.start(); }
};
$("journey-btn").onclick = toggleJourney;
$("btn-journey").onclick = toggleJourney;
$("cap-prev").onclick = () => journey.prev();
$("cap-next").onclick = () => journey.next();
$("cap-pause").onclick = () => journey.togglePause();
$("cap-cam").onclick = () => journey.toggleFollow();
$("cap-close").onclick = () => journey.stop();
$("cap-step").addEventListener("click", (e) => {
  const b = e.target.closest("[data-leg]");
  if (b) journey.goTo(Number(b.dataset.leg));
});

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

// ---------- avanço automático das etapas (Tour guiado e exploração)
const AUTO_STEP_S = 5.0; // segundos por etapa
let autoPlay = false, autoElapsed = 0, lastAutoT = 0;
function setAutoPlay(on) {
  autoPlay = on;
  autoElapsed = 0;
  $("tour-auto").classList.toggle("on", on);
  $("tour-auto").setAttribute("aria-pressed", String(on));
  $("tour-auto-ico").textContent = on ? "❚❚" : "▶";
  $("auto-bar").style.width = "0%";
}
$("tour-auto").onclick = () => setAutoPlay(!autoPlay);
stage.onFrame((t) => {
  const dt = lastAutoT ? Math.min(0.1, t - lastAutoT) : 0;
  lastAutoT = t;
  if (!autoPlay || index < 0 || journey.running) return;
  autoElapsed += dt;
  const pct = Math.min(100, (autoElapsed / AUTO_STEP_S) * 100);
  $("auto-bar").style.width = `${pct.toFixed(1)}%`;
  if (autoElapsed >= AUTO_STEP_S) {
    autoElapsed = 0;
    const L = list();
    const firstZone = mode === "tour" ? Math.max(0, L.findIndex((s) => !s.tourOnly)) : 0;
    if (index < L.length - 1) show(index + 1);
    else show(firstZone); // reinicia o ciclo direto na primeira zona
  }
});

function showIndex() {
  index = -1;
  setAutoPlay(false);
  body.innerHTML = renderIndex(STOPS, CHAPTERS);
  body.scrollTop = 0;
  $("panel-nav").hidden = true;
  stage.highlight(null);
  history.replaceState(null, "", location.pathname);
}

function show(i) {
  const L = list();
  index = Math.max(0, Math.min(L.length - 1, i));
  autoElapsed = 0;
  $("auto-bar").style.width = "0%";
  const stop = L[index];
  body.innerHTML = renderStop(stop, { index, total: L.length, inTour: mode === "tour" });
  body.scrollTop = 0;
  $("panel-nav").hidden = false;
  $("prev").disabled = index === 0 && !autoPlay;
  $("next").disabled = index === L.length - 1 && !autoPlay;
  progress.style.setProperty("--p", `${((index + 1) / L.length) * 100}%`);
  progress.setAttribute("aria-label", `Etapa ${index + 1} de ${L.length}`);
  stage.highlight(stop.tags || stop.streams !== "all" ? stop : null);
  stage.frame(stop);
  panel.classList.remove("min");
  history.replaceState(null, "", `#${stop.id}`);
}

function open(id) {
  if (journey.running) journey.stop();
  if (document.body.classList.contains("panel-hidden")) setPanelHidden(false, true);
  const L = list();
  const i = L.findIndex((s) => s.id === id);
  if (i >= 0) show(i);
  else if (mode === "tour") { setMode("overview"); open(id); }
}

function setMode(m, { auto = m === "tour" } = {}) {
  if (journey.running) journey.stop();
  if (document.body.classList.contains("panel-hidden")) setPanelHidden(false, true);
  const prevId = index >= 0 ? list()[index]?.id : null;
  mode = m;
  document.body.dataset.mode = m;
  stage.setFollow(m === "tour");
  $("btn-overview").classList.toggle("on", m === "overview");
  $("btn-tour").classList.toggle("on", m === "tour");
  $("btn-overview").setAttribute("aria-pressed", String(m === "overview"));
  $("btn-tour").setAttribute("aria-pressed", String(m === "tour"));
  $("back-overview").hidden = m !== "tour";
  setAutoPlay(auto);
  if (m === "tour") {
    const L = list();
    const resumeIdx = prevId ? L.findIndex((s) => s.id === prevId) : -1;
    const firstZone = Math.max(0, L.findIndex((s) => !s.tourOnly));
    show(resumeIdx >= 0 ? resumeIdx : firstZone);
  } else { stage.frame(null, 750); showIndex(); }
}

// ---------- controles de zoom e navegação livre no mapa
$("zm-in").onclick = () => stage.zoomBy(1.45, undefined, undefined, true);
$("zm-out").onclick = () => stage.zoomBy(1 / 1.45, undefined, undefined, true);
$("zm-reset").onclick = () => {
  if (mode === "tour" && index >= 0) stage.frame(list()[index], 550);
  else stage.resetView(550);
};
stage.onViewChange(({ userZoomed }) => {
  $("zm-reset").hidden = !userZoomed;
});

$("btn-overview").onclick = () => setMode("overview");
$("back-overview").onclick = () => setMode("overview");
$("btn-tour").onclick = () => setMode("tour");
$("prev").onclick = () => { const L = list(); show((index - 1 + L.length) % L.length); };
$("next").onclick = () => { const L = list(); show((index + 1) % L.length); };
$("sheet-handle").onclick = () => panel.classList.toggle("min");

body.addEventListener("click", (e) => {
  if (e.target.closest("summary")) setAutoPlay(false); // pausa auto-play se o usuário abrir "Saiba mais" ou "Fontes"
  if (e.target.closest("[data-home]")) showIndex();
  if (e.target.closest("[data-tour]")) setMode("tour");
  if (e.target.closest("[data-journey]")) toggleJourney();
  const go = e.target.closest("[data-go]");
  if (go) { open(go.dataset.go); return; }
  const tagEl = e.target.closest("[data-tag]");
  if (tagEl) {
    const targetStop = stage.byTag[tagEl.dataset.tag];
    if (targetStop) open(targetStop);
  }
});
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea, summary")) return;
  if (journey.running) {
    if (e.key === "ArrowRight") { e.preventDefault(); journey.next(); return; }
    if (e.key === "ArrowLeft") { e.preventDefault(); journey.prev(); return; }
    if (e.key === " ") { e.preventDefault(); journey.togglePause(); return; }
    if (e.key === "Escape") { e.preventDefault(); journey.stop(); return; }
  }
  if (e.key === " " && index >= 0) { e.preventDefault(); setAutoPlay(!autoPlay); return; }
  if (e.key === "ArrowRight" && index >= 0) { const L = list(); show((index + 1) % L.length); }
  if (e.key === "ArrowLeft" && index >= 0) { const L = list(); show((index - 1 + L.length) % L.length); }
  if (e.key === "Escape") setMode("overview");
  if (e.key === "p" || e.key === "P") setPanelHidden(!document.body.classList.contains("panel-hidden"));
  if (e.key === "+" || e.key === "=") stage.zoomBy(1.4, undefined, undefined, true);
  if (e.key === "-" || e.key === "_") stage.zoomBy(1 / 1.4, undefined, undefined, true);
  if (e.key === "0") stage.resetView(550);
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

// ---------- medidor de desempenho: abra a página com ?fps na URL
if (new URLSearchParams(location.search).has("fps")) {
  const el = document.createElement("div");
  el.className = "fps-meter";
  document.body.appendChild(el);
  let frames = 0, t0 = performance.now(), js0 = 0, n0 = 0;
  (function loop(now) {
    frames++;
    if (now - t0 >= 1000) {
      const p = window.__perf || { ms: 0, n: 1 };
      const js = (p.ms - js0) / Math.max(1, p.n - n0);
      el.textContent = `${Math.round((frames * 1000) / (now - t0))} fps · JS ${js.toFixed(1)} ms/quadro`;
      frames = 0; t0 = now; js0 = p.ms; n0 = p.n;
    }
    requestAnimationFrame(loop);
  })(performance.now());
}

// ---------- modo tela: passeio lento da câmera e cursor escondido
if (TELA) {
  if (params.has("passeio")) {
    const spots = STOPS.filter((s) => Array.isArray(s.focus));
    let k = 0;
    const step = () => {
      k++;
      const overview = k % 4 === 0;
      stage.setFollow(!overview);
      stage.frame(overview ? null : spots[(k * 7) % spots.length], 4500);
    };
    setInterval(step, 14000);
  }
  let idle;
  const wake = () => { document.body.classList.remove("idle"); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add("idle"), 2000); };
  addEventListener("pointermove", wake); wake();
}
