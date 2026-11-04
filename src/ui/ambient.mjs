// Relógio do diorama: ciclo dia/noite, demanda de gás, gasômetro que
// "respira" com o consumo, cozinhas acendendo e a safra da cana ao longo do ano.
//
// 1 dia = 60 s; a cada dia avança 1 mês (1 ano ≈ 12 min).
// Safra da cana no Centro-Sul: aproximadamente de abril a novembro.
const DAY_S = 60;
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const SAFRA = (m) => m >= 3 && m <= 10;
const PICO = (m) => m >= 5 && m <= 9;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// noite: 1 entre 20h e 5h, transições suaves no amanhecer e no entardecer
export const nightOf = (h) => 1 - smooth(5, 7, h) + smooth(17.5, 19.5, h);
// demanda de gás (0–1): base + picos do café da manhã e do jantar
export const demandOf = (h) => 0.25 + 0.35 * Math.exp(-((h - 7) ** 2) / 2) + 0.75 * Math.exp(-((h - 19.5) ** 2) / 3) + 0.3 * Math.exp(-((h - 12) ** 2) / 1.5);

const mixHex = (a, b, t) => { const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`; };

export function createAmbient(stage, { night, onTick }) {
  const { svg, iso } = stage;
  const map = svg.closest(".map");
  // camadas: véu noturno (só tinge o céu e a cena levemente) + luzes acima dele
  const tint = svg.querySelector("#night-tint");
  const lights = svg.querySelector("#L-lights");
  const lamps = night.lamps.map(([x, y]) => `<circle class="lamp-glow" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7"/>`).join("");
  // cozinhas: uma pequena chama azul na janela de cada casa
  const kitchens = night.houses.map(([x, y, w, d, h], i) => {
    const [sx, sy] = iso([x + w, y + d * 0.35, 3.2]);
    return `<g class="kitchen" data-i="${i}"><circle class="kglow" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="4"/><path class="flame blue" d="M${sx.toFixed(1)},${(sy + 1).toFixed(1)} c-1.2,-1.6 -.8,-3.6 0,-5 c.8,1.6 1.2,3.4 0,5Z"/></g>`;
  }).join("");
  lights.innerHTML = `<path class="win-night" d="${night.windows}"/>${lamps}${kitchens}`;
  const kEls = [...lights.querySelectorAll(".kitchen")];
  const order = kEls.map((_, i) => i).sort((a, b) => ((a * 7) % 11) - ((b * 7) % 11));

  const gh = svg.querySelector(".gasholder");
  if (gh) { gh.classList.remove("breathing"); gh.style.transition = "transform 1.2s ease-in-out"; }

  let running = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  let base = 10 * (DAY_S / 24) + 5 * DAY_S; // começa às 10h de junho
  let last = 0, clock = 0, lastMonth = -1;

  function render(t) {
    const total = base + clock;
    const h = ((total / DAY_S) * 24) % 24;
    const m = Math.floor(total / DAY_S) % 12;
    const n = nightOf(h), dem = demandOf(h);
    svg.style.setProperty("--night", n.toFixed(3));
    tint.style.opacity = (n * 0.34).toFixed(3);
    lights.style.opacity = n.toFixed(3);
    map.style.setProperty("--sky1", mixHex("#F2F7F4", "#1F3B52", n));
    map.style.setProperty("--sky2", mixHex("#DDEAE4", "#0E2233", n));
    // gasômetro: enche quando o consumo é baixo, esvazia no pico do jantar
    if (gh) {
      const level = 0.55 + 0.35 * Math.cos((2 * Math.PI * (h - 8)) / 24);
      const [x, y] = iso([548, 232, 2]);
      gh.style.transformOrigin = `${x}px ${y}px`;
      gh.style.transform = `scale(${(0.97 + 0.05 * level).toFixed(3)}, ${(0.78 + 0.3 * level).toFixed(3)})`;
    }
    // cozinhas acesas proporcionais à demanda (mais à noite)
    const lit = Math.round(kEls.length * Math.max(0, (dem - 0.3) / 0.9));
    order.forEach((idx, k) => kEls[idx].classList.toggle("on", k < lit));
    stage.setSpeed("biometano", 0.6 + dem * 0.9);
    stage.setSpeed("eletricidade", 0.7 + n * 0.6);
    // safra / entressafra
    if (m !== lastMonth) {
      lastMonth = m;
      document.body.classList.toggle("entressafra", !SAFRA(m));
      // a cana cresce na entressafra (dez → mar) e está alta na safra
      const grow = SAFRA(m) ? 1 : [0.3, 0.45, 0.6, 0.8][(m + 1) % 12] ?? 0.4;
      svg.style.setProperty("--cane", grow);
    }
    onTick({ h, m, month: MONTHS[m], safra: SAFRA(m), pico: PICO(m), night: n, demand: dem, gasLevel: 0.55 + 0.35 * Math.cos((2 * Math.PI * (h - 8)) / 24), running });
  }

  stage.onFrame((t) => {
    const dt = last ? Math.min(0.1, t - last) : 0; last = t;
    if (running) clock += dt;
    if (!render.acc || t - render.acc > 0.25) { render.acc = t; render(t); }
  });

  return {
    toggle() { running = !running; return running; },
    get running() { return running; },
  };
}
