import { buildWorld, materialCss, focusRect, iso } from "./world.mjs";
import { STOPS, STREAMS, CERTS, CERT_PINS } from "./content.mjs";

const NS = "http://www.w3.org/2000/svg";
const $ = (id) => document.getElementById(id);
const svg = $("world");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileQuery = matchMedia("(max-width: 760px)");

// ------------------------------------------------------------ monta a cena
const W = buildWorld();
const style = document.createElement("style");
style.textContent = materialCss();
document.head.appendChild(style);

const certSvg = CERT_PINS.map((c, i) => {
  const cert = CERTS[c.cert];
  const [x, y] = iso(c.at);
  const [gx, gy] = iso([c.at[0], c.at[1], c.at[2] - 22]);
  const hexPts = Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 6 + (k * Math.PI) / 3; return `${(Math.cos(a) * 15).toFixed(1)},${(Math.sin(a) * 15).toFixed(1)}`; }).join(" ");
  return `<g class="cert" data-cert="${c.cert}" tabindex="0" role="button" aria-label="${cert.title}">
    <line class="stem" x1="${x}" y1="${y}" x2="${gx}" y2="${gy}"/>
    <g class="scaled" data-x="${x}" data-y="${y}"><polygon class="hx" points="${hexPts}" fill="${cert.color}"/><text class="ht">${cert.tag}</text></g></g>`;
}).join("");

const pinSvg = STOPS.filter((s) => s.anchor).map((s) => {
  const [x, y] = iso(s.anchor);
  return `<g class="pin" data-stop="${s.id}" tabindex="0" role="button" aria-label="${s.n}. ${s.title}">
    <g class="scaled" data-x="${x}" data-y="${y}">
      <path class="ps" d="M0,0 L0,-10"/>
      <circle class="ring" cx="0" cy="-22" r="12"/>
      <circle class="pc" cx="0" cy="-22" r="12"/>
      <text class="pt" x="0" y="-22">${s.n}</text>
      <text class="pin-label" x="17" y="-22" dominant-baseline="central">${s.title}</text>
    </g></g>`;
}).join("");

// efeitos: chamas, fumaça, bolhas
const fx = [];
const flameAt = (p, s = 1) => { const [x, y] = iso(p); return `<path class="flame" d="M${x},${y} c${-3 * s},${-4 * s} ${-2 * s},${-9 * s} 0,${-13 * s} c${2 * s},${4 * s} ${3 * s},${9 * s} 0,${13 * s}Z" fill="#F2B705" stroke="#D37402" stroke-width=".6"/>`; };
fx.push(flameAt([636, 200, 47], 1.2), flameAt([744, 872, 6], 0.45));
const smokeAt = (p, delays = [0, 1.6, 3.2]) => { const [x, y] = iso(p); return delays.map((d) => `<circle class="smoke" cx="${x}" cy="${y}" r="3" style="animation-delay:${d}s"/>`).join(""); };
fx.push(smokeAt([34, 490, 88]), smokeAt([54, 490, 78], [0.8, 2.4, 4]), smokeAt([560, 309, 33], [0.4, 2, 3.6]), smokeAt([1050, 40, 50], [1.2, 2.8, 4.4]));
[[440, 290], [440, 390], [440, 495]].forEach(([cx, cy], k) => {
  for (let i = 0; i < 4; i++) {
    const [x, y] = iso([cx - 14 + i * 9, cy + 10 - i * 4, 44]);
    fx.push(`<circle class="bubble" cx="${x}" cy="${y}" r="1.4" style="animation-delay:${(i * 0.8 + k * 0.5).toFixed(1)}s"/>`);
  }
});

svg.insertAdjacentHTML("beforeend", `
  <defs>${W.defs}</defs>
  <g id="L-ground">${W.layers.ground}</g>
  <g id="L-flows">${W.layers.flows}<g class="particles" id="particles"></g></g>
  <g id="L-vehicles">${W.layers.vehicles}</g>
  <g id="L-objects">${W.layers.objects}</g>
  <g id="L-wires">${W.layers.wires}</g>
  <g id="L-fx">${fx.join("")}</g>
  <g id="L-certs" class="certs">${certSvg}</g>
  <g id="L-pins">${pinSvg}</g>`);
$("loading").remove();

// gasômetro "respira"
const gh = document.querySelector("#o-gasholder .gasholder");
if (gh) {
  const [x, y] = iso([548, 232, 0]);
  gh.style.transformOrigin = `${x}px ${y}px`;
  gh.classList.add("gasholder-anim");
}

// ------------------------------------------------------------ câmera
const B = W.bounds;
let vb = { ...B };
let tween = null;
const scaled = [...svg.querySelectorAll(".scaled")];

function size() { const r = svg.getBoundingClientRect(); return { w: r.width || 1, h: r.height || 1 }; }
function apply() {
  const { w, h } = size();
  // garante proporção igual à da tela
  const aspect = w / h;
  if (Math.abs(vb.w / vb.h - aspect) > 1e-3) vb.h = vb.w / aspect;
  svg.setAttribute("viewBox", `${vb.x.toFixed(2)} ${vb.y.toFixed(2)} ${vb.w.toFixed(2)} ${vb.h.toFixed(2)}`);
  const k = vb.w / w; // unidades por pixel
  const s = Math.min(1.6, k);
  for (const g of scaled) g.setAttribute("transform", `translate(${g.dataset.x} ${g.dataset.y}) scale(${s.toFixed(3)})`);
}
function available() {
  const { w, h } = size();
  const top = mobileQuery.matches ? 112 : 70;
  const panelOpen = !document.body.classList.contains("explore") || !$("panel").classList.contains("closed");
  if (mobileQuery.matches) {
    const ph = panelOpen && !$("panel").classList.contains("min") ? $("panel").offsetHeight : 74;
    return { x: 0, y: top, w, h: Math.max(120, h - top - ph) };
  }
  const right = panelOpen ? 380 + 32 : 0;
  return { x: 0, y: top, w: w - right, h: h - top };
}
function targetFor(rect, pad = 1.08) {
  const { w, h } = size();
  const a = available();
  const k = Math.max((rect.w * pad) / a.w, (rect.h * pad) / a.h);
  const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
  return { x: cx - (a.x + a.w / 2) * k, y: cy - (a.y + a.h / 2) * k, w: w * k, h: h * k };
}
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function flyTo(target, ms = 1300) {
  if (reduceMotion) { vb = target; apply(); return; }
  const from = { ...vb };
  const t0 = performance.now();
  tween = (now) => {
    const t = Math.min(1, (now - t0) / ms);
    const e = ease(t);
    vb = { x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e };
    apply();
    if (t >= 1) tween = null;
  };
}
function focusStop(stop, ms) {
  const [x0, y0, x1, y1] = stop.focus;
  const rect = stop.focus[2] - stop.focus[0] > 1000 ? B : focusRect([x0, y0, x1, y1], 50);
  flyTo(targetFor(rect, stop.focus[2] - stop.focus[0] > 1000 ? 1.0 : 1.12), ms);
}

// arrastar / pinça / roda
const pointers = new Map();
let pinchStart = null;
const toWorld = (cx, cy) => { const r = svg.getBoundingClientRect(); return [vb.x + ((cx - r.left) / r.width) * vb.w, vb.y + ((cy - r.top) / r.height) * vb.h]; };
function zoomAt(factor, cx, cy) {
  const [wx, wy] = toWorld(cx, cy);
  const nw = Math.max(B.w * 0.07, Math.min(B.w * 1.8, vb.w * factor));
  const f = nw / vb.w;
  vb = { x: wx - (wx - vb.x) * f, y: wy - (wy - vb.y) * f, w: vb.w * f, h: vb.h * f };
  tween = null;
  apply();
}
svg.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".pin, .cert")) return;
  svg.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinchStart = { d: Math.hypot(a.x - b.x, a.y - b.y), w: vb.w }; }
  svg.classList.add("dragging");
});
svg.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  const prev = pointers.get(e.pointerId);
  const r = svg.getBoundingClientRect();
  if (pointers.size === 1) {
    vb.x -= ((e.clientX - prev.x) / r.width) * vb.w;
    vb.y -= ((e.clientY - prev.y) / r.height) * vb.h;
    tween = null; apply();
  }
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2 && pinchStart) {
    const [a, b] = [...pointers.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    const target = pinchStart.w * (pinchStart.d / d);
    zoomAt(target / vb.w, (a.x + b.x) / 2, (a.y + b.y) / 2);
  }
});
const endPointer = (e) => { pointers.delete(e.pointerId); if (pointers.size < 2) pinchStart = null; if (!pointers.size) svg.classList.remove("dragging"); };
svg.addEventListener("pointerup", endPointer);
svg.addEventListener("pointercancel", endPointer);
svg.addEventListener("wheel", (e) => { e.preventDefault(); zoomAt(Math.exp(e.deltaY * 0.0015), e.clientX, e.clientY); }, { passive: false });
const center = () => { const r = svg.getBoundingClientRect(); const a = available(); return [r.left + a.x + a.w / 2, r.top + a.y + a.h / 2]; };
$("zoom-in").onclick = () => zoomAt(0.7, ...center());
$("zoom-out").onclick = () => zoomAt(1.4, ...center());
$("zoom-reset").onclick = () => flyTo(targetFor(B, 1.0), 900);

// ------------------------------------------------------------ camadas
const hidden = new Set();
const chips = $("chips");
for (const [key, s] of Object.entries(STREAMS)) {
  const b = document.createElement("button");
  b.type = "button"; b.className = "chip"; b.setAttribute("aria-pressed", "true");
  b.innerHTML = `<i style="background:${s.color}"></i>${s.label}`;
  b.onclick = () => {
    hidden.has(key) ? hidden.delete(key) : hidden.add(key);
    b.setAttribute("aria-pressed", String(!hidden.has(key)));
    refreshFlows();
  };
  chips.appendChild(b);
}
const certToggle = $("cert-toggle");
certToggle.onchange = () => svg.classList.toggle("show-certs", certToggle.checked);

let activeStreams = "all";
function refreshFlows() {
  svg.classList.toggle("focus", activeStreams !== "all");
  for (const g of svg.querySelectorAll(".flow")) {
    const s = g.dataset.stream;
    g.classList.toggle("off", hidden.has(s));
    g.classList.toggle("dim", activeStreams !== "all" && !activeStreams.includes(s));
  }
  for (const p of particles) {
    p.el.classList.toggle("off", hidden.has(p.stream));
    p.el.classList.toggle("dim", activeStreams !== "all" && !activeStreams.includes(p.stream));
  }
}

// ------------------------------------------------------------ partículas e veículos
const particles = [];
const pLayer = $("particles");
for (const f of W.flows) {
  const path = document.getElementById(f.id);
  if (!path) continue;
  const L = path.getTotalLength();
  const n = Math.max(1, Math.round(L / 38));
  for (let i = 0; i < n; i++) {
    const el = document.createElementNS(NS, "circle");
    el.setAttribute("r", f.stream === "eletricidade" ? "1.6" : "2.3");
    el.setAttribute("class", `particle s-${f.stream}`);
    el.setAttribute("fill", STREAMS[f.stream].color);
    pLayer.appendChild(el);
    particles.push({ el, path, L, off: (i / n) * L, stream: f.stream, speed: f.stream === "eletricidade" ? 70 : 26 });
  }
}
const vehicles = W.vehicles.map((v, i) => {
  const el = document.getElementById(v.id);
  const segs = [];
  let total = 0;
  for (let k = 0; k < v.pts.length - 1; k++) {
    const a = v.screen[k], b = v.screen[k + 1];
    const dx = v.pts[k + 1][0] - v.pts[k][0], dy = v.pts[k + 1][1] - v.pts[k][1];
    const head = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "px" : "nx") : dy > 0 ? "py" : "ny";
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push({ a, b, len, head, start: total });
    total += len;
  }
  const variants = Object.fromEntries(["px", "nx", "py", "ny"].map((h) => [h, el.querySelector(`.veh-${h}`)]));
  return { el, segs, total, variants, cur: null, off: i * 137, speed: 34 };
});

function frame(now) {
  if (tween) tween(now);
  const t = now / 1000;
  for (const p of particles) {
    if (p.el.classList.contains("off")) continue;
    const d = (t * p.speed + p.off) % p.L;
    const q = p.path.getPointAtLength(d);
    p.el.setAttribute("cx", q.x.toFixed(1));
    p.el.setAttribute("cy", q.y.toFixed(1));
  }
  for (const v of vehicles) {
    const cycle = v.total + 60; // pausa no destino
    let d = (t * v.speed + v.off) % cycle;
    d = Math.min(d, v.total);
    const s = v.segs.find((sg) => d <= sg.start + sg.len) || v.segs[v.segs.length - 1];
    const u = s.len ? (d - s.start) / s.len : 0;
    const x = s.a[0] + (s.b[0] - s.a[0]) * u, y = s.a[1] + (s.b[1] - s.a[1]) * u;
    if (v.cur !== s.head) { if (v.cur) v.variants[v.cur].style.display = "none"; v.variants[s.head].style.display = ""; v.cur = s.head; }
    v.el.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    const fade = Math.min(1, d / 12, (v.total - d) / 12 + (d >= v.total ? 0 : 0));
    v.el.style.opacity = d >= v.total ? "0" : Math.max(0, fade).toFixed(2);
  }
  requestAnimationFrame(frame);
}
if (reduceMotion) {
  // estado estático: partículas espalhadas, veículos no meio do caminho
  for (const p of particles) { const q = p.path.getPointAtLength(p.off); p.el.setAttribute("cx", q.x); p.el.setAttribute("cy", q.y); }
  for (const v of vehicles) { const s = v.segs[Math.floor(v.segs.length / 2)]; v.variants[s.head].style.display = ""; v.el.setAttribute("transform", `translate(${(s.a[0] + s.b[0]) / 2} ${(s.a[1] + s.b[1]) / 2})`); }
}
requestAnimationFrame(function loop(now) { if (reduceMotion) { if (tween) tween(now); requestAnimationFrame(loop); } else frame(now); });

// ------------------------------------------------------------ painel / tour
const panel = $("panel");
const body = $("panel-body");
const dots = $("dots");
let index = 0;
const seen = new Set([0]);
STOPS.forEach((s, i) => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "dot"; b.setAttribute("role", "tab");
  b.setAttribute("aria-label", s.n ? `${s.n}. ${s.title}` : s.title);
  b.onclick = () => go(i);
  dots.appendChild(b);
});

function streamsHtml(stop) {
  if (stop.streams === "all" || !stop.streams) return "";
  return `<div class="streams">${stop.streams.map((k) => `<span class="stream-tag"><i style="background:${STREAMS[k].color}"></i>${STREAMS[k].label}</span>`).join("")}</div>`;
}
function render(stop) {
  const close = document.body.classList.contains("explore") ? `<button type="button" class="back" data-close>✕ Fechar</button>` : "";
  body.innerHTML = `${close}
    <div class="kicker">${stop.n ? `<span class="num">${stop.n}</span>` : ""}${stop.kicker}</div>
    <h2>${stop.title}</h2>
    ${stop.body.map((p) => `<p>${p}</p>`).join("")}
    ${stop.facts ? `<div class="facts">${stop.facts.map((f) => `<div class="fact"><span class="v">${f.v}</span><span class="l">${f.l}</span></div>`).join("")}</div>` : ""}
    ${streamsHtml(stop)}
    ${stop.certs ? `<div class="streams">${Object.entries(CERTS).map(([k, c]) => `<button type="button" class="chip" data-cert="${k}"><i style="background:${c.color};height:10px;width:10px;border-radius:3px"></i>${c.tag}</button>`).join("")}</div>` : ""}
    ${stop.link ? `<a class="cta" href="${stop.link.href}" target="_blank" rel="noopener">${stop.link.label}</a>` : ""}`;
  body.scrollTop = 0;
}
function renderCert(key) {
  const c = CERTS[key];
  panel.classList.remove("closed", "min");
  body.innerHTML = `<button type="button" class="back" data-back>‹ Voltar</button>
    <div class="cert-head"><svg width="40" height="40" viewBox="-20 -20 40 40" aria-hidden="true"><polygon points="${Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 6 + (k * Math.PI) / 3; return `${(Math.cos(a) * 18).toFixed(1)},${(Math.sin(a) * 18).toFixed(1)}`; }).join(" ")}" fill="${c.color}"/><text x="0" y="1" fill="#fff" font-size="9" font-weight="700" text-anchor="middle" dominant-baseline="central" font-family="Verdana">${c.tag}</text></svg>
    <div class="kicker">Certificados e créditos</div></div>
    <h2>${c.title}</h2>
    ${c.body.map((p) => `<p>${p}</p>`).join("")}
    ${c.review ? `<div class="review">Texto preliminar, em revisão pela equipe CP2B.</div>` : ""}`;
  body.scrollTop = 0;
}
body.addEventListener("click", (e) => {
  const c = e.target.closest("[data-cert]");
  if (c) { svg.classList.add("show-certs"); certToggle.checked = true; renderCert(c.dataset.cert); return; }
  if (e.target.closest("[data-back]")) render(STOPS[index]);
  if (e.target.closest("[data-close]")) closePanel();
});

function go(i, { fly = true } = {}) {
  index = Math.max(0, Math.min(STOPS.length - 1, i));
  seen.add(index);
  const stop = STOPS[index];
  panel.classList.remove("closed", "min");
  render(stop);
  [...dots.children].forEach((d, k) => { d.classList.toggle("on", k === index); d.classList.toggle("seen", seen.has(k) && k !== index); d.setAttribute("aria-selected", String(k === index)); });
  $("prev").disabled = index === 0;
  $("next").disabled = index === STOPS.length - 1;
  for (const p of svg.querySelectorAll(".pin")) p.classList.toggle("on", p.dataset.stop === stop.id);
  activeStreams = stop.streams || "all";
  refreshFlows();
  if (stop.certs) { svg.classList.add("show-certs"); certToggle.checked = true; }
  if (fly) focusStop(stop);
  history.replaceState(null, "", `#${stop.id}`);
}
function closePanel() {
  panel.classList.add("closed");
  for (const p of svg.querySelectorAll(".pin")) p.classList.remove("on");
  activeStreams = "all"; refreshFlows();
  history.replaceState(null, "", location.pathname);
}
$("prev").onclick = () => go(index - 1);
$("next").onclick = () => go(index + 1);
$("panel-toggle").onclick = () => panel.classList.toggle("min");
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) return;
  if (e.key === "ArrowRight") go(index + 1);
  if (e.key === "ArrowLeft") go(index - 1);
  if (e.key === "Escape" && document.body.classList.contains("explore")) closePanel();
});
const activate = (el, fn) => { el.addEventListener("click", fn); el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } }); };
for (const p of svg.querySelectorAll(".pin")) activate(p, () => go(STOPS.findIndex((s) => s.id === p.dataset.stop)));
for (const c of svg.querySelectorAll(".cert")) activate(c, () => renderCert(c.dataset.cert));

// modos
function setMode(mode) {
  const explore = mode === "explore";
  document.body.classList.toggle("explore", explore);
  svg.classList.toggle("explore-mode", explore);
  $("btn-tour").classList.toggle("on", !explore);
  $("btn-explore").classList.toggle("on", explore);
  if (explore) { closePanel(); flyTo(targetFor(B, 1.0), 900); }
  else go(index);
}
$("btn-tour").onclick = () => setMode("tour");
$("btn-explore").onclick = () => setMode("explore");

// início
vb = targetFor(B, 1.0);
apply();
const fromHash = STOPS.findIndex((s) => `#${s.id}` === location.hash);
go(fromHash >= 0 ? fromHash : 0, { fly: fromHash > 0 });
if (fromHash > 0) focusStop(STOPS[fromHash], 1);
addEventListener("resize", () => { const s = STOPS[index]; if (panel.classList.contains("closed")) vb = targetFor(B, 1); else { focusStop(s, 1); return; } apply(); });
