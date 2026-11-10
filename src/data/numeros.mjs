// Fonte única de verdade para todos os números exibidos.
// Cada valor indica de onde veio (ver também DATA.md e FONTES em fontes.mjs).

// Metano por tonelada de resíduo fresco = BMP × ST × SV/ST (medianas).
// Fonte: Pilar-2b, data/canonical_parameters/feedstocks.yaml.
// bmp: m³ CH₄/t SV · st: sólidos totais (% da massa fresca) · svst: SV/ST (%) · ch4: % de CH₄ no biogás.
export const SUBSTRATOS = [
  { id: "gordura", nome: "Gordura (indústria)", setor: "industria", bmp: 850, st: 95, svst: 98, ch4: 72 },
  { id: "forsu", nome: "Orgânico urbano", setor: "urbano", bmp: 360, st: 30.6, svst: 85, ch4: 52 },
  { id: "torta", nome: "Torta de filtro", setor: "agricola", bmp: 280, st: 38, svst: 80, ch4: 60 },
  { id: "aviario", nome: "Cama de aviário", setor: "pecuaria", bmp: 280, st: 25, svst: 69.8, ch4: 62.5 },
  { id: "palha", nome: "Palha de cana", setor: "agricola", bmp: 175, st: 30, svst: 82, ch4: 55 },
  { id: "lodo", nome: "Lodo de esgoto", setor: "urbano", bmp: 310, st: 15, svst: 68, ch4: 68 },
  { id: "bovino", nome: "Dejeto bovino", setor: "pecuaria", bmp: 155, st: 8, svst: 78, ch4: 57 },
  { id: "suino", nome: "Dejeto suíno", setor: "pecuaria", bmp: 245, st: 3, svst: 80, ch4: 65 },
  { id: "vinhaca", nome: "Vinhaça", setor: "agricola", bmp: 160, st: 3, svst: 60, ch4: 65 },
];
/** m³ CH₄ por tonelada fresca a partir de BMP, ST e SV/ST. */
export const metanoPorTonelada = ({ bmp, st, svst }) => bmp * (st / 100) * (svst / 100);
/** m³ de biogás por tonelada fresca (metano ÷ fração de CH₄). */
export const biogasPorTonelada = (s) => metanoPorTonelada(s) / (s.ch4 / 100);
export const METANO_POR_TONELADA = SUBSTRATOS
  .map((s) => ({ id: s.id, nome: s.nome, setor: s.setor, m3: Math.round(metanoPorTonelada(s)), biogas: Math.round(biogasPorTonelada(s)), ch4: s.ch4 }))
  .sort((a, b) => b.m3 - a.m3);

// Potencial de metano de SP: mediana N4 do CP2b v5.1 (cp2b-evidencia/docs/METODO_ARTIGO.md).
export const POTENCIAL_SP = {
  medianaBiAno: 5.97, p5BiAno: 5.13, p95BiAno: 6.9, // bilhões de Nm³ CH₄/ano
  municipios: 645,
  // participação na N4 (%)
  cana: { palha: 40.7, torta: 14.2, vinhaca: 13.6, bagaco: 13.3 },
};
export const DIAS_ANO = 365.25;
export const POTENCIAL_SP_DIA = POTENCIAL_SP.medianaBiAno * 1000 / DIAS_ANO; // milhões m³/dia ≈ 16,3
export const POTENCIAL_SP_SEG = POTENCIAL_SP.medianaBiAno * 1e9 / (DIAS_ANO * 86400); // m³/s ≈ 189
// Participação da cana na N4 (%): soma das parcelas (≈ 81,8%).
export const CANA_PARTICIPACAO = Object.values(POTENCIAL_SP.cana).reduce((a, b) => a + b, 0);
// Capacidade instalada de biometano em SP (ANP 2024), milhões de Nm³/dia.
export const CAPACIDADE_SP_DIA = 0.4;
export const CAPACIDADE_SP_SEG = CAPACIDADE_SP_DIA * 1e6 / 86400; // m³/s ≈ 4,6
// Quanto do potencial a capacidade instalada já aproveita (%), ≈ 2,4%.
export const APROVEITAMENTO_SP = (CAPACIDADE_SP_DIA / POTENCIAL_SP_DIA) * 100;

// Composição típica (medianas dos substratos, feedstocks.yaml).
export const BIOGAS = { ch4Min: 52, ch4Max: 72, ch4Tipico: 60 };
// Especificação do biometano: Resolução ANP nº 1.006/2026 (vigente desde 13/08/2026;
// revogou as Res. 886/2022 e 906/2022). Base seca, 20 °C e 1 atm.
export const BIOMETANO_SPEC = { ch4Min: 90, co2Max: 3, h2sMax: 10 }; // % mol, % mol, mg/m³
export const BIOMETANO_CH4_MIN = BIOMETANO_SPEC.ch4Min; // % mol, mínimo

// Cogeração com motores a biogás de 0,5–2 MW (EPA; dados de fabricante).
// Faixas típicas; a largura das barras usa o ponto médio normalizado.
export const CHP = {
  eletrica: [35, 43], termica: [35, 45], perdas: [12, 25], total: [70, 82],
  simuladorEletrica: 35, // valor usado no Simulador CSTR do CP2b
};

// Biodigestor CSTR (GIZ/Probiogás; revisões Zhang et al. 2024, Van et al. 2020)
export const CSTR = { mesoMin: 30, mesoMax: 38, meso: 35, termoMin: 50, termoMax: 55, trhMin: 15, trhMax: 30 };

// Intensidade de carbono "poço à roda" (EPE), gCO₂e/MJ.
export const INTENSIDADE = { dieselB: 80, biometano: 9.32 }; // diesel B: "inferior a 80"
export const REDUCAO_DIESEL = Math.round((1 - INTENSIDADE.biometano / INTENSIDADE.dieselB) * 100); // ≈ 88%

// Fração orgânica dos RSU coletados no Brasil (Planares).
export const RSU_ORGANICO_BR = 45.3; // %
export const RSU_RECICLAVEL_BR = 33.6; // %

// RenovaBio / CBIO
export const CBIO = {
  metas: [{ ano: 2025, mi: 40.39 }, { ano: 2026, mi: 48.09 }], // Resolução CNPE nº 14/2024
  preco: [{ ano: 2024, rs: 88.02 }, { ano: 2025, rs: 54.72 }], // ANP/MME
  porMil_m3: 2.7, // referência EPE: ≈ 0,0027 CBIO por m³ de biometano
  notaFaixa: [72.28, 80.77], // gCO₂e/MJ, plantas certificadas (EPE)
};

// Combustível do Futuro / CGOB
export const CGOB = {
  m3PorCertificado: 100, // proposta regulatória ANP
  metaLegal2026: 1, // % (Lei 14.993/2024)
  metaEfetiva2026: 0.5, // % (Resolução CNPE nº 4/2026)
  volumeMeta2026_mi_m3: 181.728,
  teto: 10, // %
};

// Safra de cana no Centro-Sul/SP (Conab): colheita de abr/mai a nov; pico jun–out;
// entressafra dez–mar (vinhaça e palha diretas quase nulas, salvo estoques).
export const SAFRA = { meses: [3, 4, 5, 6, 7, 8, 9, 10], pico: [5, 6, 7, 8, 9] }; // índices 0 = janeiro

// Digestato (Embrapa, efluentes de biodigestores) — ordem de grandeza, exige análise.
export const DIGESTATO = {
  liquidoMistura: { n: 2.5, p2o5: 1.1, k2o: 2.1 }, // kg/m³, usina com mistura agropecuária
  liquidoSuino: { n: 1.0, p2o5: 0.6, k2o: 1.1 }, // kg/m³
  compostoSolido: { n: 93, p2o5: 121, k2o: 47 }, // kg/t, base úmida
};

// Consumo residencial de gás canalizado (ARSESP, Comgás, medição individual, 2025/26).
export const CASA_M3_MES = 8.2;
// Ônibus urbano a gás: 0,5–0,8 m³/km; 250–350 km/dia (Prefeitura SP/Comfrota; GASBUS; EPE).
// O consumo diário é derivado: [mín × mín, máx × máx] = 125–280 m³/dia; referência = ponto médio × ponto médio.
const _mid = ([a, b]) => (a + b) / 2;
const _onibus = { m3km: [0.5, 0.8], kmDia: [250, 350] };
export const ONIBUS = { ..._onibus, m3Dia: [_onibus.m3km[0] * _onibus.kmDia[0], _onibus.m3km[1] * _onibus.kmDia[1]] };
export const ONIBUS_M3_DIA_REF = _mid(ONIBUS.m3km) * _mid(ONIBUS.kmDia); // 0,65 × 300 = 195 m³/dia
// Poder calorífico inferior de projeto do biometano (ANP): 32–36 MJ/Nm³; 1 kWh = 3,6 MJ.
const _pciMj = [32, 36];
export const PCI = { mj: _pciMj, kwh: _pciMj.map((v) => Math.round((v / 3.6) * 10) / 10), ref: _mid(_pciMj) };
// Emissão evitada ao substituir diesel (EPE, ciclo de vida): 0,0022–0,0026 tCO₂e/Nm³.
// Checagem: (80 − 9,32) gCO₂e/MJ × 34 MJ/Nm³ ≈ 0,0024 tCO₂e/Nm³ (ver tools/verificar-dados.mjs).
export const EVITADO_DIESEL = { t: [0.0022, 0.0026], ref: 0.0024 };
