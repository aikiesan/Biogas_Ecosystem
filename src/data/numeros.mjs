// Fonte única de verdade para todos os números exibidos.
// Cada valor indica de onde veio (ver também DATA.md e FONTES em fontes.mjs).

// Metano por tonelada de resíduo fresco = BMP × ST × SV/ST (medianas).
// Fonte: Pilar-2b, data/canonical_parameters/feedstocks.yaml.
export const METANO_POR_TONELADA = [
  { id: "gordura", nome: "Gordura (indústria)", setor: "industria", m3: 791 },
  { id: "forsu", nome: "Orgânico urbano", setor: "urbano", m3: 94 },
  { id: "torta", nome: "Torta de filtro", setor: "agricola", m3: 85 },
  { id: "aviario", nome: "Cama de aviário", setor: "pecuaria", m3: 49 },
  { id: "palha", nome: "Palha de cana", setor: "agricola", m3: 43 },
  { id: "lodo", nome: "Lodo de esgoto", setor: "urbano", m3: 32 },
  { id: "bovino", nome: "Dejeto bovino", setor: "pecuaria", m3: 10 },
  { id: "suino", nome: "Dejeto suíno", setor: "pecuaria", m3: 6 },
  { id: "vinhaca", nome: "Vinhaça", setor: "agricola", m3: 3 },
];

// Potencial de metano de SP: mediana N4 do CP2b v5.1 (cp2b-evidencia/docs/METODO_ARTIGO.md).
export const POTENCIAL_SP = {
  medianaBiAno: 5.97, p5BiAno: 5.13, p95BiAno: 6.9, // bilhões de Nm³ CH₄/ano
  municipios: 645,
  // participação na N4 (%)
  cana: { palha: 40.7, torta: 14.2, vinhaca: 13.6, bagaco: 13.3 },
};
export const POTENCIAL_SP_DIA = POTENCIAL_SP.medianaBiAno * 1000 / 365; // milhões m³/dia ≈ 16,4
// Capacidade instalada de biometano em SP (ANP 2024), milhões de Nm³/dia.
export const CAPACIDADE_SP_DIA = 0.4;

// Composição típica (medianas dos substratos, feedstocks.yaml).
export const BIOGAS = { ch4Min: 52, ch4Max: 72, ch4Tipico: 60 };
// Especificação do biometano (ANP): metano mínimo de 90%.
export const BIOMETANO_CH4_MIN = 90;

// Cogeração: eficiência elétrica de 35% usada no Simulador CSTR do CP2b.
// Fração térmica e perdas são valores típicos de motores a gás (a confirmar).
export const CHP = { eletrica: 35, termica: 45, perdas: 20 };

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
