#!/usr/bin/env node
// Grava o diorama como vídeo em loop (MP4), quadro a quadro, com relógio virtual:
// o vídeo sai suave mesmo que o computador seja lento para renderizar.
//
// Requisitos: Node 18+, Playwright (`npm i -D playwright && npx playwright install chromium`) e ffmpeg.
// Uso:
//   node tools/gravar-video.cjs                       # 60 s (um dia inteiro), 1920×1080, 30 fps
//   node tools/gravar-video.cjs --segundos 120 --largura 3840 --altura 2160 --fps 30 --saida biogas-4k.mp4
//   node tools/gravar-video.cjs --params "dia=120&hora=6"   # dia mais lento, começando às 6h
//
// O fim do vídeo é fundido (1 s) com o começo: o loop não tem emenda visível.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const SEG = Number(arg("segundos", 60)), FPS = Number(arg("fps", 30));
const W = Number(arg("largura", 1920)), H = Number(arg("altura", 1080));
const OUT = path.resolve(arg("saida", "biogas-loop.mp4"));
const EXTRA = arg("params", "");
const FADE = 1; // segundos de fusão no loop
const ROOT = path.resolve(__dirname, "..");
const FRAMES = path.join(require("os").tmpdir(), `biogas-frames-${process.pid}`);

const TYPES = { ".html": "text/html", ".mjs": "text/javascript", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/\/$/, "/index.html"));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  fs.mkdirSync(FRAMES, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.clock.install({ time: 0 });
  await page.goto(`http://localhost:${port}/?tela&${EXTRA}`);
  await page.clock.runFor(500);
  const total = Math.round((SEG + FADE) * FPS);
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    await page.clock.runFor(1000 / FPS);
    const vt = 500 + ((i + 1) * 1000) / FPS;
    // animações CSS (nuvens, fumaça, chamas) sincronizadas com o relógio virtual
    await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), vt);
    await page.screenshot({ path: path.join(FRAMES, `f${String(i).padStart(5, "0")}.jpg`), type: "jpeg", quality: 92 });
    if (i % FPS === 0) process.stdout.write(`\r${Math.round((i / total) * 100)}% · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  await browser.close(); server.close();
  console.log("\nCodificando…");
  // loop sem emenda: o trecho [1 s, fim] termina fundido com [0, 1 s]
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(FRAMES, "f%05d.jpg"),
    "-filter_complex", `[0]split[a][b];[a]trim=start=${FADE},setpts=PTS-STARTPTS[main];[b]trim=0:${FADE},setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=${FADE}:offset=${SEG - FADE},format=yuv420p[v]`,
    "-map", "[v]", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-movflags", "+faststart", OUT], { stdio: "inherit" });
  fs.rmSync(FRAMES, { recursive: true, force: true });
  console.log(`Pronto: ${OUT}`);
})().catch((e) => { console.error(e); process.exit(1); });
