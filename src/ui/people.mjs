// Pessoas: pedestres que saem de casa de manhã, entram na escola, no governo
// e nos prédios, e voltam no fim da tarde; ciclistas nas ruas; passeios no
// parque; estudantes na universidade e operadores na usina.
// Desenhadas no canvas (sem tocar no SVG), então custam quase nada por quadro.
import { DOORS } from "../scene/zones/cidade.mjs";

const rnd = (i) => { const x = Math.sin(i * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
const SHIRTS = ["#FFFFFF", "#1E3E4C", "#7D8C93", "#C9B79C", "#9AAAB2", "#3B4D55", "#E8E1D3"];
const SKIN = ["#8D5524", "#C68642", "#E0AC69", "#F1C27D", "#5C3A1E", "#A46A3D"];
const key = (p) => `${Math.round(p[0])},${Math.round(p[1])}`;

// ---------- rede de calçadas (eixos alinhados), com nós extras inseridos sob demanda
function buildNetwork(houses) {
  const lines = [
    [[716, 649], [901, 649], [919, 649], [1096, 649]],
    [[716, 631], [901, 631], [919, 631], [1096, 631]],
    [[901, 331], [901, 349], [901, 438], [901, 612], [901, 631], [901, 649], [901, 694], [901, 756], [901, 818], [901, 880], [901, 926]],
    [[919, 331], [919, 349], [919, 511], [919, 529], [919, 631], [919, 649], [919, 926]],
    [[716, 331], [901, 331]], [[919, 331], [1096, 331]], [[716, 349], [901, 349]], [[919, 349], [1096, 349]],
    [[901, 331], [919, 331]], [[901, 349], [919, 349]],
    [[919, 511], [1096, 511]], [[919, 529], [1096, 529]],
    [[740, 438], [901, 438]], [[740, 612], [901, 612]],
    [[726, 694], [901, 694]], [[726, 756], [901, 756]], [[726, 818], [901, 818]], [[726, 880], [901, 880]],
  ];
  // insere um ponto numa linha alinhada ao eixo (mantendo a ordem)
  const insert = (pt) => {
    for (const ln of lines) for (let i = 0; i < ln.length - 1; i++) {
      const [a, b] = [ln[i], ln[i + 1]];
      const onX = a[1] === b[1] && pt[1] === a[1] && pt[0] > Math.min(a[0], b[0]) && pt[0] < Math.max(a[0], b[0]);
      const onY = a[0] === b[0] && pt[0] === a[0] && pt[1] > Math.min(a[1], b[1]) && pt[1] < Math.max(a[1], b[1]);
      if (onX || onY) { ln.splice(i + 1, 0, pt); return true; }
      if (key(a) === key(pt) || key(b) === key(pt)) return true;
    }
    return false;
  };
  // portas: caminho de acesso da porta até um nó da rede
  const doors = [];
  for (const [x, y, w, d] of houses) {
    const lane = [694, 756, 818, 880].find((ly) => ly > y + d) ?? 880;
    const ax = Math.round(x + w + 3);
    insert([ax, lane]);
    doors.push({ kind: "casa", path: [[x + w + 0.6, y + d * 0.62], [ax, y + d * 0.62], [ax, lane]] });
  }
  for (const [x, y] of DOORS.towers) {
    const ay = Math.round(y + 5);
    if (x < 919) continue;
    insert([919, ay]);
    doors.push({ kind: "predio", path: [[x, y], [x, ay], [919, ay]] });
  }
  const one = (kind, [x, y], node) => { insert(node); doors.push({ kind, path: [[x, y], node] }); };
  one("escola", DOORS.school, [796, 438]);
  one("governo", DOORS.governo, [804, 612]);
  one("distribuidora", DOORS.distribuidora, [947, 571]);
  insert([919, 571]); doors[doors.length - 1].path.push([919, 571]);
  one("posto", DOORS.posto, [761, 331]);

  // grafo
  const adj = new Map();
  const link = (a, b) => {
    const ka = key(a), kb = key(b), dd = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (!adj.has(ka)) adj.set(ka, { p: a, e: [] });
    if (!adj.has(kb)) adj.set(kb, { p: b, e: [] });
    adj.get(ka).e.push([kb, dd]); adj.get(kb).e.push([ka, dd]);
  };
  for (const ln of lines) for (let i = 0; i < ln.length - 1; i++) link(ln[i], ln[i + 1]);
  // caminho mínimo (Dijkstra simples; a rede é pequena)
  const route = (from, to) => {
    const ks = key(from), kt = key(to);
    if (!adj.has(ks) || !adj.has(kt)) return null;
    const dist = new Map([[ks, 0]]), prev = new Map(), open = new Set([ks]);
    while (open.size) {
      let u = null, best = Infinity;
      for (const k of open) if (dist.get(k) < best) { best = dist.get(k); u = k; }
      open.delete(u);
      if (u === kt) break;
      for (const [v, w] of adj.get(u).e) { const nd = best + w; if (nd < (dist.get(v) ?? Infinity)) { dist.set(v, nd); prev.set(v, u); open.add(v); } }
    }
    if (!dist.has(kt)) return null;
    const out = []; let k = kt;
    while (k) { out.unshift(adj.get(k).p); k = prev.get(k); }
    return out;
  };
  return { doors, route };
}

// polilinha → tabela para percorrer por distância
function track(pts) {
  const segs = []; let total = 0;
  for (let i = 0; i < pts.length - 1; i++) { const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); if (len > 0.01) { segs.push({ a: pts[i], b: pts[i + 1], len, start: total }); total += len; } }
  return { segs, total };
}
function at(tr, d) {
  const s = tr.segs.find((g) => d <= g.start + g.len) || tr.segs[tr.segs.length - 1];
  const u = s.len ? Math.max(0, Math.min(1, (d - s.start) / s.len)) : 1;
  return [s.a[0] + (s.b[0] - s.a[0]) * u, s.a[1] + (s.b[1] - s.a[1]) * u, s];
}

export function addPeople(stage, { houses }) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const { iso } = stage;
  const net = buildNetwork(houses);
  const homes = net.doors.filter((d) => d.kind === "casa" || d.kind === "predio");
  const works = net.doors.filter((d) => d.kind !== "casa");
  const trip = (A, B) => {
    const mid = net.route(A.path[A.path.length - 1], B.path[B.path.length - 1]);
    return mid ? track([...A.path, ...mid.slice(1, -1), ...B.path.slice().reverse()]) : null;
  };

  // ---------- moradores que vão e voltam (horário próprio de cada um)
  const commuters = [];
  for (let i = 0; i < 44; i++) {
    const home = homes[Math.floor(rnd(i) * homes.length)];
    let work = works[Math.floor(rnd(i + 50) * works.length)];
    if (work === home) work = works[(works.indexOf(work) + 1) % works.length];
    const go = trip(home, work), back = trip(work, home);
    if (!go || !back) continue;
    commuters.push({ go, back, leave: 6.2 + rnd(i + 9) * 2.6, ret: 16.2 + rnd(i + 21) * 3.2, shirt: SHIRTS[i % SHIRTS.length], skin: SKIN[(i * 5) % SKIN.length], speed: 13 + rnd(i + 3) * 6, kid: home.kind === "casa" && work.kind === "escola", leg: null, d: 0, lastH: null });
  }
  // ---------- passeios e circuitos (ativos durante o dia)
  const loops = [
    { pts: [[972, 526], [1034, 526], [1034, 584], [972, 584], [972, 526]], n: 5, speed: 7, from: 7, to: 19 }, // parque
    { pts: [[14, 823], [240, 823], [240, 825], [14, 825], [14, 823]], n: 5, speed: 9, from: 7.5, to: 18 }, // universidade
    { pts: [[107, 700], [107, 906], [109, 906], [109, 700], [107, 700]], n: 3, speed: 9, from: 7.5, to: 18 },
    { pts: [[480, 430], [600, 430], [600, 432], [480, 432], [480, 430]], n: 2, speed: 6, from: 6, to: 22 }, // operadores na usina
    { pts: [[740, 600], [880, 600], [880, 604], [740, 604], [740, 600]], n: 3, speed: 6, from: 8, to: 17 }, // praça do governo
  ];
  const walkers = [];
  loops.forEach((l, li) => { const tr = track(l.pts); for (let k = 0; k < l.n; k++) walkers.push({ tr, d: (k / l.n) * tr.total, speed: l.speed * (0.8 + rnd(li * 10 + k) * 0.4), from: l.from, to: l.to, shirt: SHIRTS[(li + k * 3) % SHIRTS.length], skin: SKIN[(li * 3 + k) % SKIN.length] }); });
  // ---------- ciclistas nas ruas
  const cycleLoops = [
    [[914, 343], [1094, 343], [1094, 637], [914, 637], [914, 343]],
    [[701, 930], [701, -110], [709, -110], [709, 930], [701, 930]],
    [[266, 70], [266, 846], [274, 846], [274, 70], [266, 70]],
    [[280, 745], [696, 745], [696, 739], [280, 739], [280, 745]],
    [[914, 651], [914, 930], [906, 930], [906, 651], [914, 651]],
  ];
  const cyclists = [];
  cycleLoops.forEach((pts, ci) => { const tr = track(pts); const n = ci === 1 ? 3 : 2; for (let k = 0; k < n; k++) cyclists.push({ tr, d: (k / n) * tr.total + ci * 37, speed: 26 + rnd(ci * 7 + k) * 10, shirt: SHIRTS[(ci + k) % SHIRTS.length], skin: SKIN[(ci + k * 2) % SKIN.length] }); });

  let hour = 10;
  stage.onClock?.((h) => { hour = h; });

  // ---------- desenho
  const person = (ctx, x, y, shirt, skin, t, alpha = 1, kid = false) => {
    const [sx, sy] = iso([x, y, 1.8]);
    const s = kid ? 0.75 : 1, sw = Math.sin(t * 9 + x) * 0.6;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "#2b3a40"; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(sx - 0.4 + sw * 0.5, sy); ctx.lineTo(sx, sy - 2.2 * s); ctx.lineTo(sx + 0.4 - sw * 0.5, sy); ctx.stroke();
    ctx.fillStyle = shirt; ctx.fillRect(sx - 0.85 * s, sy - 4.6 * s, 1.7 * s, 2.6 * s);
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(sx, sy - 5.5 * s, 0.85 * s, 0, Math.PI * 2); ctx.fill();
  };
  const cyclist = (ctx, x, y, seg, shirt, skin) => {
    const [sx, sy] = iso([x, y, 1.8]);
    const a = iso([seg.a[0], seg.a[1], 1.8]), b = iso([seg.b[0], seg.b[1], 1.8]);
    let dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    ctx.globalAlpha = 1; ctx.strokeStyle = "#2b3a40"; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(sx - dx * 1.7, sy - dy * 1.7 - 1.1, 1.1, 0, Math.PI * 2); ctx.moveTo(sx + dx * 1.7 + 1.1, sy + dy * 1.7 - 1.1); ctx.arc(sx + dx * 1.7, sy + dy * 1.7 - 1.1, 1.1, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx - dx * 1.7, sy - dy * 1.7 - 1.1); ctx.lineTo(sx, sy - 2.4); ctx.lineTo(sx + dx * 1.7, sy + dy * 1.7 - 1.1); ctx.stroke();
    ctx.fillStyle = shirt; ctx.fillRect(sx - 0.8 + dx * 0.4, sy - 5.2, 1.6, 2.6);
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(sx + dx * 0.7, sy - 6, 0.85, 0, Math.PI * 2); ctx.fill();
  };
  const between = (h, a, b) => h >= a && h < b;

  stage.addDrawer((ctx, _ctxAir, dt, t) => {
    // moradores: a viagem começa quando o relógio cruza o horário de saída/volta
    for (const c of commuters) {
      if (c.lastH !== null) {
        if (c.lastH < c.leave && hour >= c.leave) { c.leg = c.go; c.d = 0; }
        if (c.lastH < c.ret && hour >= c.ret) { c.leg = c.back; c.d = 0; }
        if (hour < c.lastH && c.leg) c.leg = null; // virou o dia
      }
      c.lastH = hour;
      if (!c.leg) continue;
      c.d += dt * c.speed;
      if (c.d >= c.leg.total) { c.leg = null; continue; } // entrou no prédio
      const [x, y] = at(c.leg, c.d);
      const fade = Math.min(1, c.d / 4, (c.leg.total - c.d) / 4);
      person(ctx, x, y, c.shirt, c.skin, t, fade, c.kid);
    }
    for (const w of walkers) {
      if (!between(hour, w.from, w.to)) continue;
      w.d = (w.d + dt * w.speed) % w.tr.total;
      const [x, y] = at(w.tr, w.d);
      const edge = Math.min(1, (hour - w.from) * 2, (w.to - hour) * 2);
      person(ctx, x, y, w.shirt, w.skin, t, edge);
    }
    if (between(hour, 5.8, 21)) for (const c of cyclists) {
      c.d = (c.d + dt * c.speed) % c.tr.total;
      const [x, y, seg] = at(c.tr, c.d);
      cyclist(ctx, x, y, seg, c.shirt, c.skin);
    }
    ctx.globalAlpha = 1;
  });
}
