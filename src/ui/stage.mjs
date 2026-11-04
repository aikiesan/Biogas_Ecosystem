// Palco: monta o diorama no SVG, enquadra a câmera (estática na visão geral,
// com voo suave apenas no tour), anima fluxos/veículos e destaca zonas.
import { buildWorld, focusRect, iso } from "../scene/world.mjs";
import { materialCss } from "../scene/materials.mjs";
import { HOME } from "../scene/zones/cidade.mjs";
import { DIGESTERS } from "../scene/zones/usina.mjs";
import { STREAMS, CERT } from "./palette.mjs";
import { PLOTS } from "../scene/layout.mjs";

const NS = "http://www.w3.org/2000/svg";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createStage(svg, { stops, onPick }) {
  const W = buildWorld();
  const style = document.createElement("style");
  style.textContent = materialCss() + Object.entries(STREAMS).map(([k, s]) => `.s-${k}{--c:${s.color}}`).join("");
  document.head.appendChild(style);

  // ---------- pinos numerados e selos de certificado
  const pin = (s) => {
    const [x, y] = iso(s.anchor);
    return `<g class="pin" data-stop="${s.id}" tabindex="0" role="button" aria-label="${s.n}. ${s.kicker}">
      <g class="scaled" data-x="${x}" data-y="${y}"><path class="ps" d="M0,0 L0,-9"/><circle class="ring" cx="0" cy="-20" r="11"/><circle class="pc" cx="0" cy="-20" r="11"/><text class="pt" x="0" y="-20">${s.n}</text>
      <text class="pin-label" x="16" y="-20">${s.kicker}</text></g></g>`;
  };
  const badge = (s) => {
    const [x, y] = iso(s.badge.at);
    const hex = Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 6 + (k * Math.PI) / 3; return `${(Math.cos(a) * 15).toFixed(1)},${(Math.sin(a) * 15).toFixed(1)}`; }).join(" ");
    return `<g class="pin cert" data-stop="${s.id}" tabindex="0" role="button" aria-label="${s.n}. ${s.kicker}">
      <g class="scaled" data-x="${x}" data-y="${y}"><polygon class="ring" points="${hex}"/><polygon class="hx" points="${hex}" fill="${CERT[s.id]}"/><text class="ht">${s.badge.tag}</text>
      <text class="pin-label" x="20" y="0">${s.kicker}</text></g></g>`;
  };
  const pins = stops.filter((s) => s.anchor).map(pin).join("") + stops.filter((s) => s.badge).map(badge).join("");

  // ---------- efeitos
  const fx = [];
  const flame = (p, s = 1, cls = "flame") => { const [x, y] = iso(p); return `<path class="${cls}" d="M${x},${y} c${-3 * s},${-4 * s} ${-2 * s},${-9 * s} 0,${-13 * s} c${2 * s},${4 * s} ${3 * s},${9 * s} 0,${13 * s}Z"/>`; };
  fx.push(flame([636, 200, 46], 1.2), `<g data-fx="casa">${flame([HOME.x + 6, HOME.y + 20, 4], 0.5, "flame blue")}</g>`);
  const smoke = (p, delays = [0, 1.7, 3.4]) => { const [x, y] = iso(p); return delays.map((d) => `<circle class="smoke" cx="${x}" cy="${y}" r="3" style="animation-delay:${d}s"/>`).join(""); };
  fx.push(smoke([34, 488, 88]), smoke([54, 488, 78], [0.8, 2.5, 4.2]), smoke([560, 309, 33], [0.4, 2.1, 3.8]), smoke([1050, 40, 50], [1.2, 2.9, 4.6]));
  // metano escapando: esterqueira aberta e aterro (o problema que o biodigestor resolve)
  const ch4 = (p, delays) => { const [x, y] = iso(p); return delays.map((d) => `<g class="ch4" style="animation-delay:${d}s"><circle cx="${x}" cy="${y}" r="5.5"/><text x="${x}" y="${y + 0.5}">CH₄</text></g>`).join(""); };
  fx.push(`<g data-fx="pec">${ch4([52, 380, 8], [0, 2.2])}${ch4([72, 392, 8], [1.1, 3.3])}</g>`, `<g data-fx="urb">${ch4([362, 816, 34], [0.5, 2.7])}${ch4([390, 840, 34], [1.6, 3.8])}</g>`);
  DIGESTERS.slice(0, 2).forEach(([cx, cy], k) => { for (let i = 0; i < 4; i++) { const [x, y] = iso([cx - 14 + i * 9, cy + 10 - i * 4, 46]); fx.push(`<circle class="bubble" cx="${x}" cy="${y}" r="1.4" style="animation-delay:${(i * 0.8 + k * 0.5).toFixed(1)}s"/>`); } });
  // raios de eletricidade na subestação
  { const [x, y] = iso([960, 210, 26]); fx.push(`<path class="spark" d="M${x},${y} l3,-6 l-2,0 l3,-6"/>`); }

  svg.insertAdjacentHTML("beforeend", `
    <defs>${W.defs}
      <filter id="halo" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
        <feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="d1"/>
        <feFlood flood-color="#00573A"/><feComposite in2="d1" operator="in" result="o1"/>
        <feMorphology in="SourceAlpha" operator="dilate" radius="4.5" result="d2"/>
        <feGaussianBlur in="d2" stdDeviation="2.2" result="b2"/>
        <feFlood flood-color="#B6E03B"/><feComposite in2="b2" operator="in" result="o2"/>
        <feMerge><feMergeNode in="o2"/><feMergeNode in="o1"/></feMerge>
      </filter></defs>
    <g id="L-sky">${W.layers.sky}</g>
    <g id="L-ground">${W.layers.ground}</g>
    <g id="L-pipes">${W.layers.pipes}<g class="particles" id="particles"></g></g>
    <g id="L-vehicles">${W.layers.vehicles}</g>
    <g id="L-halo"><g id="halo-plots"></g><g id="halo-objs" filter="url(#halo)"></g><g id="halo-hover" filter="url(#halo)"></g></g>
    <g id="L-objects">${W.layers.objects}</g>
    <g id="L-vehicles-top">${W.layers.vehiclesTop}</g>
    <g id="L-life"></g>
    <g id="L-overhead">${W.layers.overhead}<g class="particles" id="particles-air"></g></g>
    <g id="L-fx">${fx.join("")}</g>
    <rect id="night-tint" x="-4000" y="-4000" width="9000" height="9000"/>
    <g id="L-lights"></g>
    <g id="L-pins">${pins}</g>
    <g id="L-journey"></g>`);

  // gasômetro "respira"
  const gh = svg.querySelector(".gasholder");
  if (gh) { const [x, y] = iso([548, 232, 2]); gh.style.transformOrigin = `${x}px ${y}px`; gh.classList.add("breathing"); }

  // ---------- câmera
  const B = W.bounds;
  let vb = { ...B }, tween = null, follow = false, viewPad = { top: 0, bottom: 0 }, pinScale = 1;
  const scaled = [...svg.querySelectorAll(".scaled")];
  const size = () => { const r = svg.getBoundingClientRect(); return { w: r.width || 1, h: r.height || 1 }; };
  function apply() {
    const { w } = size();
    svg.setAttribute("viewBox", `${vb.x.toFixed(2)} ${vb.y.toFixed(2)} ${vb.w.toFixed(2)} ${vb.h.toFixed(2)}`);
    const k = Math.min(3.5, Math.max(0.55, vb.w / w));
    pinScale = k;
    for (const g of scaled) g.setAttribute("transform", `translate(${g.dataset.x} ${g.dataset.y}) scale(${k.toFixed(3)})`);
  }
  function fit(rect, pad = 1) {
    const { w, h } = size();
    const ah = h - viewPad.top - viewPad.bottom;
    const k = Math.max((rect.w * pad) / w, (rect.h * pad) / ah);
    const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
    return { x: cx - (w / 2) * k, y: cy - (viewPad.top + ah / 2) * k, w: w * k, h: h * k };
  }
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function flyTo(target, ms = 1200) {
    if (reduceMotion || ms <= 1) { vb = target; tween = null; apply(); return; }
    const from = { ...vb }, t0 = performance.now();
    tween = (now) => {
      const t = Math.min(1, (now - t0) / ms), e = ease(t);
      vb = { x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e };
      apply();
      if (t >= 1) tween = null;
    };
  }
  const overviewRect = () => fit(B, 1.0);
  let current = null;
  function frame(stop, ms = 1200) {
    if (!follow || !stop || stop.focus === "all") return flyTo(overviewRect(), ms);
    const [x0, y0, x1, y1] = stop.focus;
    flyTo(fit(focusRect([x0, y0, x1, y1], 50), 1.1), ms);
  }

  // ---------- destaque
  const tagged = [...svg.querySelectorAll("[data-tag]")];
  const flows = [...svg.querySelectorAll(".flow")];
  function highlight(stop) {
    current = stop;
    const on = stop && stop.tags;
    svg.dataset.sel = on ? stop.tags.join(" ") : "";
    svg.classList.toggle("focus", !!on);
    // destaque SEM esmaecer: contorno verde + brilho lima atrás dos objetos
    // da etapa e borda animada no lote da zona. O resto do mapa fica intacto.
    const hl = on ? tagged.filter((el) => stop.tags.includes(el.dataset.tag) && !el.classList.contains("plotg")) : [];
    document.getElementById("halo-objs").innerHTML = hl.map((el) => `<use href="#${el.id}"/>`).join("");
    document.getElementById("halo-plots").innerHTML = on ? PLOTS.filter((p) => stop.tags.includes(p.id)).map((p) => {
      const d = "M" + [[p.x, p.y], [p.x + p.w, p.y], [p.x + p.w, p.y + p.d], [p.x, p.y + p.d]].map(([x, y]) => iso([x, y, 1.7]).map((v) => v.toFixed(1)).join(",")).join("L") + "Z";
      return `<path class="plot-hl" d="${d}"/><path class="plot-ants" d="${d}"/>`;
    }).join("") : "";
    const streams = stop && stop.streams && stop.streams !== "all" ? stop.streams : null;
    for (const g of flows) g.classList.toggle("em", !!streams && streams.includes(g.dataset.stream));
    for (const p of particles) p.el.classList.toggle("em", !!streams && streams.includes(p.stream));
    for (const p of svg.querySelectorAll(".pin")) p.classList.toggle("on", !!stop && p.dataset.stop === stop.id);
  }
  const hidden = new Set();
  function toggleStream(k) {
    hidden.has(k) ? hidden.delete(k) : hidden.add(k);
    for (const g of flows) g.classList.toggle("off", hidden.has(g.dataset.stream));
    for (const p of particles) p.el.classList.toggle("off", hidden.has(p.stream));
    return !hidden.has(k);
  }

  // ---------- partículas e veículos
  const particles = [];
  for (const f of W.flows) {
    const path = document.getElementById(f.id);
    if (!path) continue;
    const L = path.getTotalLength();
    const air = f.stream === "eletricidade" && f.id.startsWith("w-") || f.stream === "conhecimento";
    const n = Math.max(1, Math.round(L / (air ? 60 : 36)));
    for (let i = 0; i < n; i++) {
      const el = document.createElementNS(NS, "circle");
      el.setAttribute("r", air ? "1.8" : "2.3");
      el.setAttribute("class", `particle s-${f.stream}`);
      (air ? document.getElementById("particles-air") : document.getElementById("particles")).appendChild(el);
      particles.push({ el, path, L, off: (i / n) * L, d: (i / n) * L, stream: f.stream, speed: f.stream === "eletricidade" ? 70 : f.stream === "conhecimento" ? 45 : 24 });
    }
  }
  const vehicles = W.vehicles.map((v, i) => {
    const el = document.getElementById(v.id);
    const segs = []; let total = 0;
    for (let k = 0; k < v.pts.length - 1; k++) {
      const a = v.screen[k], b = v.screen[k + 1];
      const dx = v.pts[k + 1][0] - v.pts[k][0], dy = v.pts[k + 1][1] - v.pts[k][1];
      const head = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "px" : "nx") : dy > 0 ? "py" : "ny";
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      segs.push({ a, b, len, head, start: total }); total += len;
    }
    const variants = Object.fromEntries(["px", "nx", "py", "ny"].map((h) => [h, el.querySelector(`.veh-${h}`)]));
    const loop = v.pts[0][0] === v.pts[v.pts.length - 1][0] && v.pts[0][1] === v.pts[v.pts.length - 1][1];
    return { el, segs, total, variants, loop, cur: null, off: i * 173, speed: v.speed ?? (v.kind === "car" ? 46 : 32) };
  });
  function place(v, d) {
    const s = v.segs.find((sg) => d <= sg.start + sg.len) || v.segs[v.segs.length - 1];
    const u = s.len ? (d - s.start) / s.len : 0;
    if (v.cur !== s.head) { if (v.cur) v.variants[v.cur].style.display = "none"; v.variants[s.head].style.display = ""; v.cur = s.head; }
    v.el.setAttribute("transform", `translate(${(s.a[0] + (s.b[0] - s.a[0]) * u).toFixed(1)} ${(s.a[1] + (s.b[1] - s.a[1]) * u).toFixed(1)})`);
  }
  const frameFns = [];
  const speedMul = {};
  let lastT = 0;
  function tick(now) {
    if (tween) tween(now);
    for (const fn of frameFns) fn(now / 1000);
    const dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 0; lastT = now;
    if (!reduceMotion && !document.hidden) {
      const t = now / 1000;
      for (const p of particles) {
        if (p.el.classList.contains("off")) continue;
        p.d = (p.d + dt * p.speed * (speedMul[p.stream] ?? 1)) % p.L;
        const q = p.path.getPointAtLength(p.d);
        p.el.setAttribute("cx", q.x.toFixed(1)); p.el.setAttribute("cy", q.y.toFixed(1));
      }
      for (const v of vehicles) {
        if (v.loop) { place(v, (t * v.speed + v.off) % v.total); continue; }
        const cycle = v.total + 70;
        const d = (t * v.speed + v.off) % cycle;
        place(v, Math.min(d, v.total));
        v.el.style.opacity = d >= v.total ? "0" : Math.max(0, Math.min(1, d / 12, (v.total - d) / 12)).toFixed(2);
      }
    }
    requestAnimationFrame(tick);
  }
  if (reduceMotion) {
    for (const p of particles) { const q = p.path.getPointAtLength(p.off); p.el.setAttribute("cx", q.x); p.el.setAttribute("cy", q.y); }
    for (const v of vehicles) place(v, v.total / 2);
  }
  requestAnimationFrame(tick);

  // ---------- passar o mouse: rótulo + contorno + fluxos conectados acendem
  const flowTags = Object.fromEntries(W.flows.map((f) => [f.id, f.tags || []]));
  const flowGroupsByTag = (tag) => W.flows.filter((f) => (f.tags || []).includes(tag)).map((f) => document.getElementById(f.id));
  let hoverTag = null;
  function hover(tag, { halo = true } = {}) {
    if (tag === hoverTag) return;
    hoverTag = tag;
    svg.dataset.hover = tag || "";
    svg.querySelectorAll(".core.hot").forEach((el) => el.classList.remove("hot"));
    particles.forEach((p) => p.el.classList.remove("hot"));
    const els = tag && halo ? tagged.filter((el) => el.dataset.tag === tag && !el.classList.contains("plotg")) : [];
    document.getElementById("halo-hover").innerHTML = els.map((el) => `<use href="#${el.id}"/>`).join("");
    if (!tag) return;
    const hot = new Set(flowGroupsByTag(tag).filter(Boolean));
    hot.forEach((el) => el.classList.add("hot"));
    particles.forEach((p) => { if (hot.has(p.path)) p.el.classList.add("hot"); });
  }

  // ---------- interação com pinos
  const activate = (el) => { const fn = () => onPick(el.dataset.stop); el.addEventListener("click", fn); el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } }); };
  svg.querySelectorAll(".pin").forEach(activate);
  // clique numa zona destacável também abre a etapa correspondente
  const byTag = Object.fromEntries(stops.filter((s) => s.tags && !s.badge).map((s) => [s.tags[0], s.id]));
  svg.addEventListener("click", (e) => {
    if (e.target.closest(".pin")) return;
    const g = e.target.closest("[data-tag]");
    if (g && byTag[g.dataset.tag]) onPick(byTag[g.dataset.tag]);
  });

  return {
    svg, iso,
    night: W.night,
    onFrame(fn) { frameFns.push(fn); },
    setSpeed(stream, m) { speedMul[stream] = m; },
    scale() { return pinScale; },
    hover,
    tagAt(target) { const g = target.closest && target.closest("[data-tag]"); return g ? g.dataset.tag : null; },
    setFollow(v) { follow = v; },
    setPadding(p) { viewPad = p; },
    frame,
    highlight,
    toggleStream,
    relayout() { frame(current, 1); },
  };
}
