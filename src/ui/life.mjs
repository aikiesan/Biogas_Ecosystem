// Vida ambiente do diorama: misturadores girando nos biodigestores, pontes
// raspadoras dos decantadores da ETE, bolhas no tanque de aeração, pássaros,
// pulsos de chegada na recepção e brilho no fogão da "sua casa".
import { DIGESTERS } from "../scene/zones/usina.mjs";
import { CLARIFIERS } from "../scene/zones/residuos.mjs";

const ring = (iso, cx, cy, r, z, n = 48) => "M" + Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; const [x, y] = iso([cx + r * Math.cos(a), cy + r * Math.sin(a), z]); return `${x.toFixed(1)},${y.toFixed(1)}`; }).join("L");

export function addLife(stage) {
  const { iso } = stage;
  const layer = document.getElementById("L-life");
  let html = "";

  // 1) misturador: anel tracejado girando sobre a cúpula dos CSTR
  DIGESTERS.slice(0, 2).forEach(([cx, cy], i) => {
    html += `<path class="mix" d="${ring(iso, cx, cy, 15, 44.2)}" style="animation-delay:-${i * 0.7}s"/>`;
    html += `<path class="mix mix2" d="${ring(iso, cx, cy, 8, 44.8)}" style="animation-delay:-${i * 0.4}s"/>`;
  });

  // 2) bolhas no tanque de aeração da ETE
  for (let i = 0; i < 14; i++) {
    const x = 558 + ((i * 37) % 80), y = 775 + ((i * 17) % 28);
    const [sx, sy] = iso([x, y, 6.8]);
    html += `<circle class="aer" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="1" style="animation-delay:-${(i * 0.37) % 2.4}s"/>`;
  }

  // 3) pássaros cruzando o céu
  const flock = [[0, 0], [14, 6], [-12, 8], [26, 12], [6, 16]];
  let fg = "";
  const birdSvg = (list) => `<svg viewBox="-20 -10 60 40" width="60" height="40">${list.map(([x, y], i) => `<path class="bird" style="animation-delay:-${i * 0.13}s" d="M${x - 4},${y - 1} q2,-2.6 4,0 q2,-2.6 4,0"/>`).join("")}</svg>`;
  fg += `<div class="hbirds">${birdSvg(flock)}</div><div class="hbirds b2">${birdSvg(flock.slice(0, 3))}</div>`;

  // 4) ondas de "chegada" na recepção e no fogão da casa
  const ripple = (p, cls) => { const [x, y] = iso(p); return `<ellipse class="ripple ${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="10" ry="5"/>`; };
  html += ripple([357, 452, 6], "r-rec") + ripple([357, 452, 6], "r-rec d") + ripple([743, 862, 2], "r-casa") + ripple([743, 862, 2], "r-casa d");

  // 5) pontes raspadoras (giram devagar) — atualizadas por quadro
  html += `<path class="arm" id="arm-0"/><path class="arm" id="arm-1"/>`;

  // 6) corte do biodigestor: aparece ao passar o mouse ou na etapa do CSTR
  const P2 = (p) => p.map((v) => v.toFixed(1)).join(",");
  const cuts = DIGESTERS.slice(0, 2).map(([cx, cy], i) => {
    const R = 36, a0 = Math.atan2(1, 1), span = 0.95;
    const arc = (z, r = R + 0.3, rev = false) => { const pts = []; for (let k = 0; k <= 24; k++) { const a = a0 - span + (2 * span * k) / 24; pts.push(iso([cx + r * Math.cos(a), cy + r * Math.sin(a), z])); } return rev ? pts.reverse() : pts; };
    const win = "M" + arc(3).concat(arc(27, R + 0.3, true)).map(P2).join("L") + "Z";
    const liq = "M" + arc(3).concat(arc(19, R + 0.3, true)).map(P2).join("L") + "Z";
    const surf = "M" + arc(19).map(P2).join("L");
    let bub = "";
    for (let k = 0; k < 10; k++) { const a = a0 - span * 0.8 + (1.6 * span * ((k * 37) % 10)) / 10; const [bx, by] = iso([cx + (R - 6) * Math.cos(a), cy + (R - 6) * Math.sin(a), 4]); bub += `<circle class="cbub" cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${(0.8 + (k % 3) * 0.4).toFixed(1)}" style="animation-delay:-${((k * 0.41) % 2.6).toFixed(2)}s"/>`; }
    const [sx0, sy0] = iso([cx, cy, 30]), [sx1, sy1] = iso([cx, cy, 8]);
    return `<g class="cutaway"><clipPath id="cut-${i}"><path d="${win}"/></clipPath>
      <g clip-path="url(#cut-${i})"><path class="cut-bg" d="${win}"/><path class="cut-liq" d="${liq}"/><path class="cut-surf" d="${surf}"/>
      <line class="cut-shaft" x1="${sx0.toFixed(1)}" y1="${sy0.toFixed(1)}" x2="${sx1.toFixed(1)}" y2="${sy1.toFixed(1)}"/><path class="cut-blade" id="blade-${i}"/>${bub}</g>
      <path class="cut-frame" d="${win}"/></g>`;
  }).join("");
  html += cuts;

  // 7) fertirrigação: canhão de digestato molhando o canavial (gotas desenhadas no canvas)
  const gun = [196, 118, 6];
  { const [gx, gy] = iso(gun); html += `<g class="sprinkler"><circle class="reel" cx="${gx.toFixed(1)}" cy="${(gy + 2).toFixed(1)}" r="3.4"/></g>`; }

  // 8) manômetros na purificação e nível do tanque de CO₂
  [[520, 412, 9], [528, 412, 9]].forEach(([x, y, z], i) => { const [gx, gy] = iso([x, y, z]); html += `<circle class="gauge-face" cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="2.6"/><line class="gauge-needle" x1="${gx.toFixed(1)}" y1="${gy.toFixed(1)}" x2="${gx.toFixed(1)}" y2="${(gy - 2.2).toFixed(1)}" style="transform-origin:${gx.toFixed(1)}px ${gy.toFixed(1)}px;animation-delay:-${i * 1.3}s"/>`; });
  { const [lx, ly] = iso([593, 512.6, 6]); html += `<rect class="lvl-bg" x="${(lx - 1.5).toFixed(1)}" y="${(ly - 26).toFixed(1)}" width="3" height="26" rx="1"/><rect class="lvl" x="${(lx - 1.5).toFixed(1)}" y="${(ly - 26).toFixed(1)}" width="3" height="26" rx="1" style="transform-origin:${lx.toFixed(1)}px ${ly.toFixed(1)}px"/>`; }

  // 9) certificados nascendo: cada lote de biometano vira um certificado
  { const [cx, cy] = iso([622, 441, 22]); const hex = Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 6 + (k * Math.PI) / 3; return `${(Math.cos(a) * 7).toFixed(1)},${(Math.sin(a) * 7).toFixed(1)}`; }).join(" ");
    ["CBIO", "CGOB", "CBIO", "CGOB"].forEach((t, k) => { html += `<g class="coin ${t.toLowerCase()}" style="animation-delay:${k * 3}s" transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)})"><g class="coin-in"><polygon points="${hex}"/><text>${t}</text></g></g>`; }); }

  // 10) abastecimento no posto (onda na bomba)
  html += ripple([814, 236, 2], "r-posto") + ripple([814, 236, 2], "r-posto d");

  // 11) avião com rastro e nuvem de chuva passando sobre o campo
  fg += `<div class="hplane"><svg viewBox="-160 -10 170 20" width="170" height="20"><path class="trail" d="M-150,0 L-8,0"/><path class="plane-body" d="M0,0 l-9,-1.2 l-2,-4 l-2,0 l1,4 l-5,.4 l-1.6,-2 l-1.4,0 l.8,2.6 l-.8,2.6 l1.4,0 l1.6,-2 l5,.4 l-1,4 l2,0 l2,-4 l9,-1.2z"/></svg></div>`;
  { const [rx, ry] = iso([110, 100, 80]); let rain = ""; for (let k = 0; k < 10; k++) rain += `<line class="drop" x1="${(rx - 36 + (k * 13) % 72).toFixed(1)}" y1="${(ry + 8 + (k * 7) % 14).toFixed(1)}" x2="${(rx - 39 + (k * 13) % 72).toFixed(1)}" y2="${(ry + 20 + (k * 7) % 14).toFixed(1)}" style="animation-delay:-${(k * 0.14).toFixed(2)}s"/>`;
    fg += `<div class="hrain" style="left:${(rx - 60).toFixed(0)}px;top:${(ry - 30).toFixed(0)}px"><svg viewBox="${(rx - 60).toFixed(0)} ${(ry - 30).toFixed(0)} 120 70" width="120" height="70"><g class="cloud"><ellipse cx="${rx}" cy="${ry}" rx="44" ry="13"/><ellipse cx="${rx - 18}" cy="${ry - 7}" rx="22" ry="13"/><ellipse cx="${rx + 14}" cy="${ry - 10}" rx="24" ry="15"/></g>${rain}</svg></div>`; }
  document.getElementById("ly-world-fg").innerHTML = fg;

  // 12) veleiros na represa
  html += [0, 1, 2].map((k) => `<g class="boat" id="boat-${k}"><path class="hull" d="M-5,0 L5,0 L3.5,2.2 L-3.5,2.2Z"/><path class="sail" d="M0,-0.5 L0,-11 L5.5,-1.5Z"/><path class="sail s2" d="M-0.8,-0.5 L-0.8,-8 L-4.5,-1.5Z"/></g>`).join("");

  layer.innerHTML = html;
  stage.refreshDash();
  const boats = [0, 1, 2].map((k) => ({ el: layer.querySelector(`#boat-${k}`), k, tr: "" }));
  const blades = DIGESTERS.slice(0, 2).map(([cx, cy], i) => ({ cx, cy, el: layer.querySelector(`#blade-${i}`) }));
  const arms = CLARIFIERS.map(([cx, cy], i) => ({ cx, cy, el: layer.querySelector(`#arm-${i}`), d: "" }));

  // jato do canhão de fertirrigação desenhado em lote no canvas (zero mutações de DOM)
  const DROPS = 22;
  stage.addDrawer((ctx, _ctxAir, _dt, t) => {
    if ((t % 24) >= 14 || document.body.classList.contains("entressafra")) return;
    const sweep = Math.sin(t * 0.5) * 0.6;
    ctx.fillStyle = "rgba(110, 127, 43, 0.78)";
    ctx.beginPath();
    for (let k = 0; k < DROPS; k++) {
      const u = (t * 0.9 + k / DROPS) % 1;
      const dir = Math.PI + 0.35 + sweep + ((k % 5) - 2) * 0.05;
      const reach = 70 * u;
      const [sx, sy] = iso([196 + Math.cos(dir) * reach, 118 + Math.sin(dir) * reach, 6 + 48 * u * (1 - u)]);
      ctx.moveTo(sx + 1.1, sy);
      ctx.arc(sx, sy, 1.1, 0, Math.PI * 2);
    }
    ctx.fill();
  });

  let lastL = 0;
  stage.onFrame((t) => {
    if (t - lastL < 1 / 30) return; lastL = t;
    for (const b of boats) {
      const a = t * (0.05 + b.k * 0.012) + b.k * 2.1;
      const [x, y] = iso([928 + Math.cos(a) * (95 - b.k * 22), -172 + Math.sin(a) * (52 - b.k * 12), 0.6]);
      const tr = `translate(${x.toFixed(1)} ${y.toFixed(1)})${Math.sin(a) > 0 ? " scale(-1 1)" : ""}`;
      if (tr !== b.tr) { b.el.setAttribute("transform", tr); b.tr = tr; }
    }
    // pás do agitador: só calcula/atualiza quando o corte interno do CSTR está visível
    const cutVis = stage.root.dataset.hover === "cstr" || (stage.root.dataset.sel && stage.root.dataset.sel.includes("cstr"));
    if (cutVis) {
      blades.forEach(({ cx, cy, el }, i) => {
        const a = t * 2.2 + i;
        const p0 = iso([cx - 12 * Math.cos(a), cy - 12 * Math.sin(a), 11]), p1 = iso([cx + 12 * Math.cos(a), cy + 12 * Math.sin(a), 11]);
        el.setAttribute("d", `M${p0[0].toFixed(1)},${p0[1].toFixed(1)}L${p1[0].toFixed(1)},${p1[1].toFixed(1)}`);
      });
    }
    arms.forEach((arm, i) => {
      const a = t * 0.25 + i * 1.7;
      const p0 = iso([arm.cx, arm.cy, 8.2]), p1 = iso([arm.cx + 17 * Math.cos(a), arm.cy + 17 * Math.sin(a), 8.2]);
      const d = `M${p0[0].toFixed(1)},${p0[1].toFixed(1)}L${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
      if (d !== arm.d) { arm.el.setAttribute("d", d); arm.d = d; }
    });
  });
}
