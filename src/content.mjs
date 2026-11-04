// Textos e números da experiência (português).
// Números: medianas do banco canônico PILAR-2b (feedstocks.yaml) e do
// método CP2b v5.1 (cp2b-evidencia/docs/METODO_ARTIGO.md). Ver DATA.md.

export const SIMULADOR_CSTR = "https://aikiesan.github.io/simulador_CSTR/";

export const STREAMS = {
  substrato: { label: "Substratos", color: "#A15500" },
  biogas: { label: "Biogás", color: "#D37402" },
  biometano: { label: "Biometano", color: "#2E9E4F" },
  co2: { label: "CO₂ biogênico", color: "#5F7C88" },
  digestato: { label: "Digestato", color: "#6B4A2B" },
  eletricidade: { label: "Eletricidade", color: "#E0A800" },
  calor: { label: "Calor", color: "#D9534F" },
};

// Selos de certificado/crédito exibidos na camada "Certificados".
export const CERTS = {
  cbio: {
    tag: "CBIO",
    title: "CBIO — Crédito de Descarbonização",
    color: "#00573A",
    review: true,
    body: [
      "Criado pela Política Nacional de Biocombustíveis (RenovaBio, Lei nº 13.576/2017). Cada CBIO representa 1 tonelada de CO₂ equivalente que deixou de ir para a atmosfera ao trocar um combustível fóssil por um biocombustível.",
      "Produtores de biocombustível certificados, incluindo os de biometano, emitem CBIOs de acordo com o volume vendido e com a sua nota de eficiência ambiental. As distribuidoras de combustíveis compram esses créditos na bolsa (B3) para cumprir metas anuais.",
    ],
  },
  cgob: {
    tag: "CGOB",
    title: "CGOB — Certificado de Garantia de Origem do Biometano",
    color: "#166E97",
    review: true,
    body: [
      "Previsto na Lei do Combustível do Futuro (Lei nº 14.993/2024). O CGOB comprova que uma quantidade de biometano foi realmente produzida a partir de resíduos, garantindo a sua origem renovável.",
      "A lei cria metas para que o gás natural vendido no país fique mais limpo a cada ano. Produtores e importadores de gás podem cumprir as metas comprando biometano ou os certificados correspondentes.",
    ],
  },
  carbono: {
    tag: "CO₂e",
    title: "Créditos de carbono",
    color: "#A15500",
    review: true,
    body: [
      "Resíduos deixados a céu aberto liberam metano, um gás que aquece o planeta muitas vezes mais que o CO₂. Quando são tratados num biodigestor, esse metano é capturado e aproveitado. A emissão evitada pode virar crédito de carbono.",
      "O CO₂ separado na purificação é biogênico: as plantas o retiraram do ar enquanto cresciam. Se ele for capturado e armazenado no subsolo (BECCS), há uma remoção líquida de carbono da atmosfera.",
    ],
  },
};

// Paradas do tour. anchor = ponto do pino (mundo); focus = caixa no chão a enquadrar.
export const STOPS = [
  {
    id: "intro",
    kicker: "Bem-vindo",
    title: "Do campo até a sua casa",
    focus: [-40, -40, 1130, 950],
    streams: "all",
    body: [
      "Restos de colheita, esterco, resíduos da indústria e o lixo orgânico das cidades guardam energia. Dentro de um biodigestor, microrganismos transformam esses resíduos em <b>biogás</b>, um gás renovável.",
      "Siga o caminho dos resíduos desde a origem até o fogão da sua casa e descubra tudo o que nasce no meio do caminho.",
    ],
  },
  {
    id: "agro",
    n: 1,
    kicker: "Origem · Agricultura",
    title: "Restos da lavoura",
    anchor: [110, 100, 18],
    focus: [0, 0, 250, 215],
    streams: ["substrato"],
    body: [
      "Na colheita da cana-de-açúcar sobra a <b>palha</b>. Na usina sobram a <b>vinhaça</b> (um líquido) e a <b>torta de filtro</b>. Palha de milho, de soja e cascas de café também servem.",
      "Em São Paulo, a cana sozinha responde por cerca de <b>4 em cada 5 m³</b> do metano que poderia ser produzido a partir de resíduos.",
    ],
    facts: [
      { v: "≈ 43 m³", l: "de metano por tonelada de palha de cana" },
      { v: "≈ 85 m³", l: "de metano por tonelada de torta de filtro" },
    ],
  },
  {
    id: "pec",
    n: 2,
    kicker: "Origem · Pecuária",
    title: "Esterco vira energia",
    anchor: [76, 300, 20],
    focus: [0, 232, 250, 442],
    streams: ["substrato"],
    body: [
      "Bois, porcos e galinhas produzem muito esterco. Numa lagoa aberta ele libera <b>metano</b> direto para o ar. Levado ao biodigestor, esse mesmo metano vira combustível.",
      "Tratar o esterco também reduz o mau cheiro, as moscas e o risco de contaminar rios.",
    ],
    facts: [
      { v: "≈ 49 m³", l: "de metano por tonelada de cama de aviário" },
      { v: "≈ 10 m³", l: "de metano por tonelada de dejeto bovino líquido" },
    ],
  },
  {
    id: "ind",
    n: 3,
    kicker: "Origem · Agroindústria",
    title: "Sobras das fábricas",
    anchor: [180, 500, 26],
    focus: [0, 459, 250, 671],
    streams: ["substrato"],
    body: [
      "Usinas de açúcar e etanol, laticínios, frigoríficos e fábricas de alimentos geram resíduos ricos em matéria orgânica. Gorduras e restos de alimentos estão entre os que mais produzem biogás.",
      "A vinhaça tem pouco sólido por tonelada, mas sai das usinas em volumes enormes. Por isso pesa muito no total.",
    ],
    facts: [
      { v: "≈ 3 m³", l: "de metano por tonelada de vinhaça (muito diluída)" },
      { v: "≈ 790 m³", l: "de metano por tonelada de gordura" },
    ],
  },
  {
    id: "urb",
    n: 4,
    kicker: "Origem · Cidades",
    title: "Lixo orgânico e esgoto",
    anchor: [76, 755, 32],
    focus: [0, 688, 250, 910],
    streams: ["substrato"],
    body: [
      "Metade do lixo de uma casa é orgânico: cascas, restos de comida, podas. Num aterro ele produz metano. Coletado separado, pode ir direto para o biodigestor.",
      "Nas estações de tratamento de esgoto, o <b>lodo</b> também é digerido para gerar biogás.",
    ],
    facts: [
      { v: "≈ 94 m³", l: "de metano por tonelada de resíduo orgânico urbano" },
      { v: "≈ 32 m³", l: "de metano por tonelada de lodo de esgoto" },
    ],
  },
  {
    id: "recepcao",
    n: 5,
    kicker: "Usina · Etapa 1",
    title: "Recepção e preparo",
    anchor: [355, 420, 14],
    focus: [328, 330, 420, 500],
    streams: ["substrato"],
    body: [
      "Os caminhões descarregam os resíduos num tanque de recepção. Ali eles são misturados, triturados e, se preciso, aquecidos.",
      "Uma mistura bem equilibrada, chamada <b>codigestão</b>, deixa os microrganismos mais saudáveis e aumenta a produção de gás.",
    ],
  },
  {
    id: "cstr",
    n: 6,
    kicker: "Usina · Etapa 2",
    title: "O biodigestor (CSTR)",
    anchor: [440, 390, 52],
    focus: [380, 240, 520, 545],
    streams: ["substrato", "biogas", "calor"],
    body: [
      "É um grande tanque fechado, aquecido a cerca de <b>37 °C</b> e misturado o tempo todo. Sem oxigênio, bilhões de microrganismos quebram a matéria orgânica em etapas, até chegar ao metano.",
      "O nome CSTR vem do inglês <i>Continuous Stirred-Tank Reactor</i>, ou reator contínuo de mistura completa. Todo dia entra um pouco de resíduo e sai um pouco de material digerido.",
    ],
    link: { href: SIMULADOR_CSTR, label: "Abrir o simulador de biodigestor CSTR" },
  },
  {
    id: "biogas",
    n: 7,
    kicker: "Usina · Etapa 3",
    title: "Biogás: o que é?",
    anchor: [548, 232, 26],
    focus: [490, 180, 660, 290],
    streams: ["biogas"],
    body: [
      "O biogás é uma mistura de <b>metano (CH₄)</b>, que é a parte que queima e gera energia, e <b>gás carbônico (CO₂)</b>, com traços de outros gases.",
      "Ele fica guardado no gasômetro, uma cúpula de membrana dupla. Por segurança, o excesso é queimado no flare e nunca vai cru para a atmosfera.",
    ],
    facts: [
      { v: "55–65%", l: "de metano no biogás (medianas dos substratos)" },
      { v: "35–45%", l: "de CO₂" },
    ],
  },
  {
    id: "chp",
    n: 8,
    kicker: "Caminho A",
    title: "Eletricidade e calor",
    anchor: [543, 309, 22],
    focus: [480, 270, 1000, 420],
    streams: ["biogas", "eletricidade", "calor"],
    body: [
      "Um motor-gerador (<b>cogeração</b>) queima o biogás e produz eletricidade, que segue pelas torres até a rede, e calor.",
      "Parte desse calor volta para aquecer o próprio biodigestor. Nada se perde!",
    ],
  },
  {
    id: "upgrading",
    n: 9,
    kicker: "Caminho B",
    title: "Purificação: nasce o biometano",
    anchor: [550, 397, 38],
    focus: [500, 360, 660, 460],
    streams: ["biogas", "biometano", "co2"],
    body: [
      "Membranas especiais funcionam como uma peneira para moléculas: o CO₂ passa, o metano fica. O resultado é o <b>biometano</b>, com mais de 90% de metano.",
      "O biometano é equivalente ao gás natural fóssil. Pode usar os mesmos canos, fogões, caldeiras e motores, só que é renovável.",
    ],
    facts: [{ v: "≥ 90%", l: "de metano no biometano (padrão ANP)" }],
  },
  {
    id: "co2",
    n: 10,
    kicker: "Coproduto",
    title: "CO₂ que vale ouro",
    anchor: [600, 505, 44],
    focus: [560, 470, 900, 600],
    streams: ["co2"],
    body: [
      "O CO₂ separado é <b>biogênico</b>: veio de plantas que o retiraram do ar. Ele pode ser liquefeito e vendido para refrigerantes, estufas e frigoríficos.",
      "Ou pode ser <b>injetado no subsolo</b> e guardado para sempre. Isso tira carbono da atmosfera (BECCS, captura e armazenamento de carbono).",
    ],
  },
  {
    id: "digestato",
    n: 11,
    kicker: "Coproduto",
    title: "Digestato: adubo de volta ao campo",
    anchor: [450, 600, 18],
    focus: [340, 520, 560, 680],
    streams: ["digestato"],
    body: [
      "O que sai do biodigestor é o <b>digestato</b>, rico em nitrogênio, fósforo e potássio. Separado em parte sólida e líquida, vira <b>biofertilizante</b>.",
      "Os caminhões levam o biofertilizante de volta às lavouras e o ciclo se fecha: o nutriente que saiu do campo volta para o campo.",
    ],
  },
  {
    id: "injecao",
    n: 12,
    kicker: "Distribuição",
    title: "Na rede de gás",
    anchor: [622, 440, 20],
    focus: [590, 400, 930, 700],
    streams: ["biometano"],
    body: [
      "Antes de entrar no gasoduto, o biometano é medido e recebe um <b>odorante</b>, aquele cheiro característico que ajuda a perceber vazamentos.",
      "Pela mesma rede subterrânea do gás natural, ele chega a indústrias, prédios e casas.",
    ],
  },
  {
    id: "posto",
    n: 13,
    kicker: "Mobilidade",
    title: "Combustível para ônibus e caminhões",
    anchor: [835, 235, 30],
    focus: [700, 170, 900, 320],
    streams: ["biometano"],
    body: [
      "Comprimido no posto, o biometano abastece carros, ônibus, caminhões e tratores (<b>bio-GNV</b>). Também pode ser liquefeito (<b>bio-GNL</b>) para viagens longas.",
      "Trocar o diesel por biometano corta a maior parte das emissões de gases de efeito estufa no transporte pesado.",
    ],
  },
  {
    id: "casa",
    n: 14,
    kicker: "Chegada",
    title: "Na sua casa",
    anchor: [743, 862, 22],
    focus: [715, 640, 905, 915],
    streams: ["biometano", "eletricidade"],
    body: [
      "Ao acender o fogão, o aquecedor ou o chuveiro a gás, a chama pode vir de resíduos que antes poluíam: lixo orgânico, esterco, palha.",
      "A luz da escola e das casas também pode vir do biogás, pela rede elétrica.",
    ],
  },
  {
    id: "certificados",
    n: 15,
    kicker: "Valor ambiental",
    title: "Certificados: o carbono que vira valor",
    focus: [328, 170, 1100, 700],
    streams: "all",
    certs: true,
    body: [
      "Além de energia, o biogás gera <b>valor ambiental</b> que pode ser medido, certificado e vendido. Toque nos selos sobre o mapa:",
      "<b>CBIO</b>: créditos de descarbonização do RenovaBio. <b>CGOB</b>: garantia de origem do biometano. <b>Créditos de carbono</b>: metano evitado e CO₂ capturado.",
    ],
  },
  {
    id: "fim",
    kicker: "O potencial de São Paulo",
    title: "Um estado cheio de energia escondida",
    focus: [-40, -40, 1130, 950],
    streams: "all",
    body: [
      "Somando todos os resíduos dos 645 municípios paulistas, o CP2B estima um potencial mediano de cerca de <b>6 bilhões de m³ de metano por ano</b>. São cerca de 16 milhões de m³ por dia, dezenas de vezes a capacidade de biometano instalada hoje no estado.",
      "Biogás é energia, adubo, clima e renda no campo, tudo ao mesmo tempo. Explore o mapa livremente!",
    ],
    facts: [
      { v: "≈ 6 bi m³/ano", l: "potencial mediano de metano em SP (intervalo 90%: 5,1–6,9 bi)" },
      { v: "645", l: "municípios avaliados pelo CP2B" },
    ],
  },
];

// Selos dos certificados no mapa (mundo).
export const CERT_PINS = [
  { cert: "cgob", at: [660, 452, 62] },
  { cert: "cbio", at: [766, 254, 40] },
  { cert: "carbono", at: [440, 290, 62] },
  { cert: "carbono", at: [637, 581, 30] },
  { cert: "carbono", at: [60, 380, 24] },
];
