// Verifica a consistência interna de src/data/numeros.mjs.
// Uso: node tools/verificar-dados.mjs   (sai com código 1 se algo falhar)
import * as N from "../src/data/numeros.mjs";

let falhas = 0;
const ok = (cond, msg) => { console.log(`${cond ? "✓" : "✗"} ${msg}`); if (!cond) falhas++; };
const perto = (a, b, tol) => Math.abs(a - b) <= tol;
const dentro = (v, [lo, hi]) => v >= lo && v <= hi;

// 1. Metano por tonelada = BMP × ST × SV/ST (valores publicados em DATA.md)
const DATA_MD = { gordura: 790, forsu: 94, torta: 85, aviario: 49, palha: 43, lodo: 32, bovino: 10, suino: 6, vinhaca: 3 };
for (const r of N.METANO_POR_TONELADA) ok(perto(r.m3, DATA_MD[r.id], 1.5), `${r.nome}: ${r.m3} m³ CH₄/t (DATA.md ≈ ${DATA_MD[r.id]})`);
for (const s of N.SUBSTRATOS) ok(dentro(s.ch4, [N.BIOGAS.ch4Min, N.BIOGAS.ch4Max]), `${s.nome}: CH₄ ${s.ch4}% dentro da faixa do biogás`);

// 2. Potencial e capacidade de SP
ok(N.POTENCIAL_SP.p5BiAno < N.POTENCIAL_SP.medianaBiAno && N.POTENCIAL_SP.medianaBiAno < N.POTENCIAL_SP.p95BiAno, "P5 < mediana < P95");
ok(perto(N.CANA_PARTICIPACAO, 81.8, 0.05), `Cana = ${N.CANA_PARTICIPACAO.toFixed(1)}% da N4 (≈ 4/5)`);
ok(perto(N.POTENCIAL_SP_SEG, 189, 1), `Potencial ≈ ${N.POTENCIAL_SP_SEG.toFixed(1)} m³/s (README: ≈ 189)`);
ok(perto(N.CAPACIDADE_SP_SEG, 4.6, 0.05), `Capacidade ≈ ${N.CAPACIDADE_SP_SEG.toFixed(2)} m³/s (README: ≈ 4,6)`);

// 3. Biometano, cogeração e reator
ok(N.BIOMETANO_CH4_MIN === N.BIOMETANO_SPEC.ch4Min, "CH₄ mínimo único (ANP 1.006/2026)");
ok(N.BIOMETANO_SPEC.ch4Min + N.BIOMETANO_SPEC.co2Max <= 100, "Especificação ANP fecha em ≤ 100% mol");
const mid = ([a, b]) => (a + b) / 2;
ok(dentro(mid(N.CHP.eletrica) + mid(N.CHP.termica), N.CHP.total) && perto(mid(N.CHP.eletrica) + mid(N.CHP.termica) + mid(N.CHP.perdas), 100, 3), "CHP: pontos médios fecham o balanço (≈ 100%)");
ok(dentro(N.CHP.simuladorEletrica, N.CHP.eletrica), "Simulador usa eficiência elétrica dentro da faixa");
ok(dentro(N.CSTR.meso, [N.CSTR.mesoMin, N.CSTR.mesoMax]) && N.CSTR.mesoMax < N.CSTR.termoMin, "CSTR: faixas meso/termo coerentes");

// 4. Intensidade de carbono e equivalências (cruzamento de fontes)
ok(N.REDUCAO_DIESEL === 88, `Redução vs. diesel = ${N.REDUCAO_DIESEL}%`);
const evitadoCalc = ((N.INTENSIDADE.dieselB - N.INTENSIDADE.biometano) * N.PCI.ref) / 1e6; // t/Nm³
ok(dentro(evitadoCalc, N.EVITADO_DIESEL.t), `Evitado calculado (Δ intensidade × PCI) = ${(evitadoCalc * 1000).toFixed(2)} kg/Nm³ ∈ faixa EPE`);
const cbioCalc = [N.CBIO.notaFaixa[0] * N.PCI.mj[0], N.CBIO.notaFaixa[1] * N.PCI.mj[1]].map((v) => v / 1000); // CBIO por 1.000 m³
ok(dentro(N.CBIO.porMil_m3, cbioCalc), `CBIO/1.000 m³ = ${N.CBIO.porMil_m3} ∈ nota × PCI = ${cbioCalc.map((v) => v.toFixed(2)).join("–")}`);
ok(N.PCI.kwh.every((v, i) => perto(v, N.PCI.mj[i] / 3.6, 0.05)), "PCI: kWh = MJ / 3,6");

// 5. Ônibus: faixa diária = produto das faixas
ok(N.ONIBUS.m3Dia[0] === N.ONIBUS.m3km[0] * N.ONIBUS.kmDia[0] && N.ONIBUS.m3Dia[1] === N.ONIBUS.m3km[1] * N.ONIBUS.kmDia[1], `Ônibus: ${N.ONIBUS.m3Dia.join("–")} m³/dia = m³/km × km/dia`);
ok(dentro(N.ONIBUS_M3_DIA_REF, N.ONIBUS.m3Dia), `Ônibus de referência (${N.ONIBUS_M3_DIA_REF} m³/dia) dentro da faixa`);

// 6. Certificados e safra
ok(perto(N.CGOB.volumeMeta2026_mi_m3 / N.CGOB.m3PorCertificado, 1.81728, 1e-6), "CGOB: meta 2026 ≈ 1,82 mi de certificados");
ok(N.SAFRA.pico.every((m) => N.SAFRA.meses.includes(m)), "Safra: pico contido nos meses de colheita");
ok(N.RSU_ORGANICO_BR + N.RSU_RECICLAVEL_BR <= 100, "RSU: orgânico + reciclável ≤ 100%");

// 7. Textos das etapas: nenhum marcador ${…} sem interpolar (aspas em vez de crase)
const { STOPS } = await import("../src/content/paradas.mjs");
const crus = STOPS.filter((s) => /\$\{/.test(JSON.stringify(s)));
ok(!crus.length, `Etapas sem marcadores \${…} crus${crus.length ? `: ${crus.map((s) => s.id).join(", ")}` : ""}`);

console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : "\nTodos os números são consistentes.");
process.exit(falhas ? 1 : 0);
