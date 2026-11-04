// Vida ambiente do diorama: misturadores girando nos biodigestores, pontes
// raspadoras dos decantadores da ETE, bolhas no tanque de aeração, pássaros,
// pulsos de chegada na recepção e brilho no fogão da "sua casa".
import { DIGESTERS } from "../scene/zones/usina.mjs";

const ring = (iso, cx, cy, r, z, n = 48) => "M" + Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; const [x, y] = iso([cx + r * Math.cos(a), cy + r * Math.sin(a), z]); return `${x.toFixed(1)},${y.toFixed(1)}`; }).join("L");

export function addLife(stage) {
  const { svg, iso } = stage;
  const layer = svg.querySelector("#L-life");
  let html = "";

  // 1) misturador: anel tracejado girando sobre a cúpula dos CSTR
  DIGESTERS.slice(0, 2).forEach(([cx, cy], i) => {
    html += `<path class="mix" d="${ring(iso, cx, cy, 15, 44.2)}" style="animation-delay:-${i * 0.7}s"/>`;
    html += `<path class="mix mix2" d="${ring(iso, cx, cy, 8, 44.8)}" style="animation-delay:-${i * 0.4}s"/>`;
  });

  // 2) bolhas no tanque de aeração da ETE
  for (let i = 0; i < 14; i++) {
    const x = 152 + ((i * 37) % 80), y = 819 + ((i * 17) % 30);
    const [sx, sy] = iso([x, y, 6.8]);
    html += `<circle class="aer" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="1" style="animation-delay:-${(i * 0.37) % 2.4}s"/>`;
  }

  // 3) pássaros cruzando o céu
  const flock = [[0, 0], [14, 6], [-12, 8], [26, 12], [6, 16]];
  html += `<g class="birds">${flock.map(([x, y], i) => `<path class="bird" style="animation-delay:-${i * 0.13}s" d="M${x - 4},${y - 1} q2,-2.6 4,0 q2,-2.6 4,0"/>`).join("")}</g>`;
  html += `<g class="birds b2">${flock.slice(0, 3).map(([x, y], i) => `<path class="bird" style="animation-delay:-${i * 0.2}s" d="M${x - 4},${y - 1} q2,-2.6 4,0 q2,-2.6 4,0"/>`).join("")}</g>`;

  // 4) ondas de "chegada" na recepção e no fogão da casa
  const ripple = (p, cls) => { const [x, y] = iso(p); return `<ellipse class="ripple ${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="10" ry="5"/>`; };
  html += ripple([357, 452, 6], "r-rec") + ripple([357, 452, 6], "r-rec d") + ripple([743, 862, 2], "r-casa") + ripple([743, 862, 2], "r-casa d");

  // 5) pontes raspadoras (giram devagar) — atualizadas por quadro
  html += `<path class="arm" id="arm-0"/><path class="arm" id="arm-1"/>`;
  layer.innerHTML = html;

  const arms = [[180, 722], [180, 772]].map(([cx, cy], i) => ({ cx, cy, el: layer.querySelector(`#arm-${i}`) }));
  stage.onFrame((t) => {
    arms.forEach(({ cx, cy, el }, i) => {
      const a = t * 0.25 + i * 1.7;
      const p0 = iso([cx, cy, 8.2]), p1 = iso([cx + 18 * Math.cos(a), cy + 18 * Math.sin(a), 8.2]);
      el.setAttribute("d", `M${p0[0].toFixed(1)},${p0[1].toFixed(1)}L${p1[0].toFixed(1)},${p1[1].toFixed(1)}`);
    });
  });
}
