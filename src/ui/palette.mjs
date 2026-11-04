// Codificação de cores ÚNICA para o diorama e todas as figuras.
// Fluxos: base Okabe-Ito (amigável a daltônicos). Setores: paleta PILAR-2b.
export const STREAMS = {
  substrato: { label: "Substratos", color: "#8C6239" },
  biogas: { label: "Biogás", color: "#E69F00" },
  biometano: { label: "Biometano", color: "#009E73" },
  co2: { label: "CO₂", color: "#7F8F97" },
  digestato: { label: "Digestato", color: "#6E7F2B" },
  eletricidade: { label: "Eletricidade", color: "#E5BE00" },
  calor: { label: "Calor", color: "#D55E00" },
  esgoto: { label: "Esgoto", color: "#CC79A7" },
  gasnatural: { label: "Gás natural (rede)", color: "#54666E" },
  conhecimento: { label: "Conhecimento", color: "#0072B2" },
};
export const SECTORS = {
  agricola: { label: "Agrícola", color: "#5CA032" },
  pecuaria: { label: "Pecuária", color: "#A15500" },
  urbano: { label: "Urbano", color: "#166E97" },
  industria: { label: "Indústria", color: "#54666E" },
};
export const NEUTRAL = "#C9D2D6";
export const INK = "#1E3E4C";
export const MUTED = "#54666E";
export const CERT = { cbio: "#00573A", cgob: "#1E3E4C", carbono: "#5F7C88" };
// cores por chave usada nas figuras
export const KEY = {
  ch4: STREAMS.biometano.color, co2: STREAMS.co2.color, eletricidade: STREAMS.eletricidade.color,
  calor: STREAMS.calor.color, perdas: NEUTRAL, biometano: STREAMS.biometano.color, neutral: NEUTRAL,
  good: STREAMS.biometano.color, bad: STREAMS.calor.color,
};
export const toneColor = (t) => SECTORS[t]?.color ?? STREAMS[t]?.color ?? KEY[t] ?? NEUTRAL;
