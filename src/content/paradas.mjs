// Paradas da história. Princípio: UMA FIGURA, UMA MENSAGEM.
// - message: a frase que a figura prova (título do painel)
// - figure:  especificação da figura (renderizada em src/ui/figures.mjs)
// - text:    no máximo 2 frases curtas de apoio
// - more:    detalhes opcionais (recolhidos em "Saiba mais")
// - tags:    zonas destacadas no diorama · streams: fluxos em evidência
// - anchor:  posição do pino (mundo) · focus: enquadramento do tour
import { DIGESTATO, CASA_M3_MES, ONIBUS, PCI, EVITADO_DIESEL } from "../data/numeros.mjs";
import { METANO_POR_TONELADA as T, POTENCIAL_SP as SP, POTENCIAL_SP_DIA, CAPACIDADE_SP_DIA, BIOGAS, BIOMETANO_CH4_MIN, BIOMETANO_SPEC, CHP, CSTR, INTENSIDADE, REDUCAO_DIESEL, RSU_ORGANICO_BR, CBIO, CGOB } from "../data/numeros.mjs";
const mid = ([a, b]) => (a + b) / 2;
import { FONTES } from "../data/fontes.mjs";

const fmt = (n, d = 1) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

export const CHAPTERS = [
  { id: "origem", label: "Origem" },
  { id: "usina", label: "Usina" },
  { id: "destino", label: "Destino" },
  { id: "valor", label: "Valor ambiental" },
  { id: "ciencia", label: "Ciência" },
];

export const STOPS = [
  {
    id: "intro", chapter: null, tourOnly: true,
    kicker: "Ecossistema do biogás",
    message: "Resíduo é energia fora do lugar.",
    figure: { type: "chain", steps: [{ icon: "waste", label: "Resíduos", tag: "urb" }, { icon: "tank", label: "Biodigestor", tag: "cstr" }, { icon: "flame", label: "Biogás", tag: "biogas" }, { icon: "house", label: "Energia, gás e adubo", tag: "casa" }] },
    text: ["Siga o caminho dos resíduos do campo e da cidade até a energia que chega às casas, às indústrias e de volta ao campo."],
    focus: "all", streams: "all",
  },

  // ---------------- ORIGEM
  {
    id: "agro", chapter: "origem", kicker: "Agricultura",
    message: "A cana responde por 4 de cada 5 m³ do potencial paulista.",
    figure: { type: "share", unit: "% do potencial de metano de SP (mediana)", parts: [
      { label: "Palha", v: SP.cana.palha, tone: "agricola" }, { label: "Torta", v: SP.cana.torta, tone: "agricola", shade: 1 },
      { label: "Vinhaça", v: SP.cana.vinhaca, tone: "agricola", shade: 2 }, { label: "Bagaço", v: SP.cana.bagaco, tone: "agricola", shade: 3 },
      { label: "Outros", v: 100 - 81.8, tone: "neutral" }] },
    text: ["Palha, torta de filtro, vinhaça e bagaço sobram da produção de açúcar e etanol, em volumes enormes."],
    more: ["A colheita no Centro-Sul vai de abril/maio a novembro, com pico de junho a outubro. Na entressafra (dezembro a março), vinhaça e palha quase param, salvo estoques. No mapa, o relógio mostra a safra passando."],
    tags: ["agro", "ind"], streams: ["substrato"], anchor: [110, 100, 18], focus: [0, 0, 250, 215], sources: ["cp2bEvidencia", "conab"],
  },
  {
    id: "pec", chapter: "origem", kicker: "Pecuária",
    message: "Esterco a céu aberto emite metano; no biodigestor, vira energia.",
    figure: { type: "beforeAfter",
      before: { title: "Lagoa aberta", steps: [{ icon: "cow", tag: "pec" }, { icon: "pond", tag: "pec" }, { icon: "cloud", label: "CH₄ no ar", tone: "bad" }] },
      after: { title: "Biodigestor", steps: [{ icon: "cow", tag: "pec" }, { icon: "tank", tag: "cstr" }, { icon: "flame", label: "energia", tone: "good", tag: "chp" }] } },
    text: ["O metano aquece o planeta muitas vezes mais que o CO₂. Capturá-lo é ganho duplo: clima e energia."],
    tags: ["pec"], streams: ["substrato"], anchor: [76, 300, 20], focus: [0, 232, 250, 442],
  },
  {
    id: "ind", chapter: "origem", kicker: "Agroindústria",
    message: "Por tonelada, gorduras e restos de alimentos rendem mais metano.",
    figure: { type: "bars", unit: "m³ de metano por tonelada de resíduo (mediana)", rows: T, highlight: ["industria", "agricola"], cap: 100 },
    text: ["Mas volume importa: a vinhaça rende pouco por tonelada, porém sai das usinas aos milhões de m³."],
    tags: ["ind"], streams: ["substrato"], anchor: [180, 500, 26], focus: [0, 459, 250, 671], sources: ["pilar"],
  },
  {
    id: "florestas", chapter: "origem", kicker: "Florestas e água",
    message: "A floresta plantada fornece biomassa; a nativa protege a água.",
    figure: { type: "twoCols", cols: [
      { title: "Floresta plantada", icon: "leaf", note: "Eucalipto: galhos, cascas e serragem viram energia na caldeira da serraria.", tag: "silvicultura" },
      { title: "Floresta nativa", icon: "drop", note: "Mata Atlântica e mata ciliar protegem nascentes, rios e represas.", tag: "nativa" }] },
    text: ["São Paulo tem muita água: rios, represas e nascentes. Proteger as matas ciliares garante água para cidades, lavouras e indústrias."],
    more: ["Resíduos florestais também entram no potencial de biogás estimado pelo CP2b (cerca de 240 milhões de m³ de CH₄ por ano no cenário real), embora a madeira se degrade devagar sem pré-tratamento. Por isso, o uso mais comum é queimá-la ou gaseificá-la.", "As faixas de mata nas margens dos rios são Áreas de Preservação Permanente (APP)."],
    sources: ["pilarResultados"],
    tags: ["silvicultura", "nativa", "agua"], streams: [], anchor: [440, -180, 34], focus: [-40, -300, 1130, 0],
  },
  {
    id: "urb", chapter: "origem", kicker: "Resíduos urbanos",
    message: "A coleta separa recicláveis, orgânicos e rejeitos.",
    figure: { type: "fork", input: { icon: "waste", label: "Lixo da cidade" }, outs: [
      { icon: "factory", label: "Recicláveis", note: "papel, plástico, metal e vidro voltam à indústria", tag: "urb" },
      { icon: "tank", label: "Orgânicos", note: "vão para o biodigestor e viram biogás", tag: "cstr" },
      { icon: "landfill", label: "Rejeitos", note: "aterro sanitário com captação do gás", tag: "aterro" }] },
    text: [`No Brasil, ${String(RSU_ORGANICO_BR).replace(".", ",")}% do lixo coletado é matéria orgânica (Planares). Separá-la na fonte evita metano no aterro e entrega um resíduo limpo ao biodigestor.`],
    more: ["Em São Paulo, o Plano Estadual de Resíduos (2020) registra a faixa histórica de 50–60% de orgânicos, mas não como média estadual atual única: estudos recentes em Campinas, Piracicaba e Baixada Santista encontraram menos de 50%. O valor real varia por município.", "No aterro, poços captam o gás do lixo enterrado; ele pode ser queimado ou aproveitado como biogás."],
    sources: ["planares", "planoSP", "abrema"],
    tags: ["urb", "aterro"], streams: ["substrato", "biogas"], anchor: [495, 790, 30], focus: [290, 700, 720, 930],
  },

  // ---------------- USINA
  {
    id: "ete", chapter: "origem", kicker: "Esgoto (ETE)",
    message: "O lodo do esgoto também vira biogás.",
    figure: { type: "chain", steps: [{ icon: "city", label: "Rede de esgoto", tag: "cidade" }, { icon: "drop", label: "Tratamento (ETE)", tag: "ete" }, { icon: "tank", label: "Digestor de lodo", tag: "ete" }, { icon: "flame", label: "Biogás", tag: "biogas" }] },
    text: ["Na estação de tratamento, a matéria orgânica do esgoto vira lodo. Digerido sem oxigênio, ele gera biogás e fica mais estável para o destino final."],
    more: [`Lodo primário de esgoto: cerca de ${T.find((r) => r.id === "lodo").m3} m³ de metano por tonelada (mediana, PILAR-2b).`, "O digestor em forma de ovo é comum em ETEs: a forma favorece a mistura e evita depósitos."],
    sources: ["pilar"],
    tags: ["ete"], streams: ["esgoto", "biogas"], anchor: [670, 800, 46], focus: [540, 740, 940, 930],
  },
  {
    id: "recepcao", chapter: "usina", kicker: "Recepção",
    message: "Misturar resíduos equilibra a dieta dos microrganismos.",
    figure: { type: "merge", inputs: [{ icon: "leaf", label: "palha", note: "rica em carbono", tag: "agro" }, { icon: "cow", label: "esterco", note: "rico em nitrogênio", tag: "pec" }], output: { icon: "tank", label: "codigestão", note: "mais gás, processo estável", tag: "cstr" } },
    text: ["Os caminhões passam pela balança, descarregam e a mistura é triturada e homogeneizada antes de entrar no biodigestor."],
    tags: ["recepcao"], streams: ["substrato"], anchor: [357, 452, 20], focus: [300, 330, 420, 500],
  },
  {
    id: "cstr", chapter: "usina", kicker: "Biodigestor CSTR",
    message: "Sem oxigênio, microrganismos transformam matéria orgânica em metano.",
    figure: { type: "stages", steps: ["Hidrólise", "Acidogênese", "Acetogênese", "Metanogênese"], chips: [`≈ ${CSTR.meso} °C`, "sem O₂", `${CSTR.trhMin}–${CSTR.trhMax} dias`] },
    text: ["CSTR é um tanque de mistura completa e fluxo contínuo: entra resíduo e sai digestato todos os dias. Cada porção fica, em média, de 15 a 30 dias lá dentro."],
    more: [`Mesofílico: ${CSTR.mesoMin}–${CSTR.mesoMax} °C, o mais comum. Termofílico: ${CSTR.termoMin}–${CSTR.termoMax} °C, com degradação mais rápida e melhor higienização, mas exige mais aquecimento e controle.`, "O tempo de retenção hidráulica (TRH) depende da carga orgânica, do substrato e dos sólidos; lodos sem aquecimento podem exigir cerca de 40 dias."],
    sources: ["giz", "zhang", "van", "simulador"],
    tags: ["cstr"], streams: ["substrato", "biogas", "calor"], anchor: [440, 390, 52], focus: [380, 240, 520, 545],
    link: { href: FONTES.simulador.u, label: "Abrir o Simulador CSTR do CP2b" },
  },
  {
    id: "biogas", chapter: "usina", kicker: "Biogás",
    message: `Biogás ≈ ${BIOGAS.ch4Tipico}% metano + ${100 - BIOGAS.ch4Tipico}% CO₂.`,
    figure: { type: "composition", rows: [{ label: "Biogás", parts: [{ k: "ch4", v: BIOGAS.ch4Tipico }, { k: "co2", v: 100 - BIOGAS.ch4Tipico }] }], note: `Faixa nas medianas dos substratos: ${BIOGAS.ch4Min}–${BIOGAS.ch4Max}% de CH₄.` },
    text: ["O gasômetro guarda o biogás. Por segurança, o excedente é queimado no flare, nunca liberado cru."],
    tags: ["biogas"], streams: ["biogas"], anchor: [548, 232, 26], focus: [490, 180, 660, 290], sources: ["pilar"],
  },
  {
    id: "chp", chapter: "usina", kicker: "Caminho A · Cogeração",
    message: "Um motor converte biogás em eletricidade e calor útil.",
    figure: { type: "sankey", input: "Energia do biogás", outs: [
      { k: "eletricidade", label: "Eletricidade", v: mid(CHP.eletrica), txt: `${CHP.eletrica[0]}–${CHP.eletrica[1]}%` },
      { k: "calor", label: "Calor útil", v: mid(CHP.termica), txt: `${CHP.termica[0]}–${CHP.termica[1]}%` },
      { k: "perdas", label: "Perdas", v: mid(CHP.perdas), txt: `${CHP.perdas[0]}–${CHP.perdas[1]}%` }],
      note: `Motores de 0,5–2 MW. Eficiência total: ${CHP.total[0]}–${CHP.total[1]}%.` },
    text: ["A eletricidade segue pelas torres até a rede; parte do calor volta para aquecer o biodigestor."],
    more: ["Só conta como útil o calor que tem uso: sem demanda térmica contínua, parte do calor recuperável é rejeitada.", `O Simulador CSTR do CP2b usa ${CHP.simuladorEletrica}% de eficiência elétrica, no limite conservador da faixa.`],
    sources: ["epaChp", "epaCatalog", "simulador"],
    tags: ["chp", "subestacao"], streams: ["biogas", "eletricidade", "calor"], anchor: [543, 309, 22], focus: [480, 190, 1000, 420],
  },
  {
    id: "upgrading", chapter: "usina", kicker: "Caminho B · Purificação",
    message: `Retirar o CO₂ transforma biogás em biometano (≥ ${BIOMETANO_CH4_MIN}% CH₄).`,
    figure: { type: "composition", rows: [
      { label: "Biogás", parts: [{ k: "ch4", v: BIOGAS.ch4Tipico }, { k: "co2", v: 100 - BIOGAS.ch4Tipico }] },
      { label: "Biometano", parts: [{ k: "ch4", v: 92, label: `CH₄ ≥ ${BIOMETANO_CH4_MIN}%` }, { k: "neutral", v: 8, label: "" }] }], arrow: "membranas", note: `Resolução ANP nº 1.006/2026: CH₄ ≥ ${BIOMETANO_SPEC.ch4Min}%, CO₂ ≤ ${BIOMETANO_SPEC.co2Max}%, H₂S ≤ ${BIOMETANO_SPEC.h2sMax} mg/m³.` },
    text: ["O biometano é intercambiável com o gás natural fóssil: mesmos dutos, fogões, caldeiras e motores."],
    more: [`Energia: cada m³ de biometano tem cerca de ${PCI.mj[0]}–${PCI.mj[1]} MJ (≈ ${fmt(PCI.kwh[0])}–${fmt(PCI.kwh[1])} kWh) no poder calorífico inferior.`],
    sources: ["anp1006", "anp1006Noticia", "anp1006Texto", "anpPci"],
    tags: ["upgrading"], streams: ["biogas", "biometano", "co2"], anchor: [550, 397, 38], focus: [500, 360, 660, 460],
  },
  {
    id: "co2", chapter: "usina", kicker: "Coproduto · CO₂",
    message: "O CO₂ separado pode ser vendido ou guardado no subsolo.",
    figure: { type: "fork", input: { icon: "co2", label: "CO₂ biogênico", tag: "co2" }, outs: [{ icon: "factory", label: "Uso", note: "bebidas, alimentos, estufas", tag: "industria" }, { icon: "well", label: "Armazenamento", note: "remoção de carbono (BECCS)", tag: "co2" }] },
    text: ["Esse CO₂ veio de plantas que o retiraram do ar. Guardá-lo de forma permanente tira carbono da atmosfera."],
    tags: ["co2", "industria"], streams: ["co2"], anchor: [600, 505, 44], focus: [560, 0, 1000, 600],
  },
  {
    id: "digestato", chapter: "usina", kicker: "Coproduto · Digestato",
    message: "O digestato devolve nutrientes ao campo.",
    figure: { type: "cycle", steps: [{ icon: "leaf", label: "Lavoura", tag: "agro" }, { icon: "truck", label: "Resíduo", tag: "recepcao" }, { icon: "tank", label: "Biodigestor", tag: "cstr" }, { icon: "sprout", label: "Biofertilizante", tag: "digestato" }], chips: ["N", "P", "K"], kpis: [{ v: `${fmt(DIGESTATO.liquidoMistura.n)}`, l: "kg de N por m³" }, { v: `${fmt(DIGESTATO.liquidoMistura.p2o5)}`, l: "kg de P₂O₅ por m³" }, { v: `${fmt(DIGESTATO.liquidoMistura.k2o)}`, l: "kg de K₂O por m³" }], kpiNote: "Digestato líquido de usina com mistura agropecuária (Embrapa). Ordem de grandeza: cada lote precisa de análise." },
    more: [`Dejetos suínos (líquido): N ${fmt(DIGESTATO.liquidoSuino.n)} · P₂O₅ ${fmt(DIGESTATO.liquidoSuino.p2o5)} · K₂O ${fmt(DIGESTATO.liquidoSuino.k2o)} kg/m³. Composto sólido: N ${DIGESTATO.compostoSolido.n} · P₂O₅ ${DIGESTATO.compostoSolido.p2o5} · K₂O ${DIGESTATO.compostoSolido.k2o} kg/t.`, "A separação sólido-líquido concentra fósforo e matéria orgânica no sólido; o líquido guarda a maior parte do nitrogênio amoniacal e do potássio."],
    sources: ["embrapaDigestato", "abiogasDigestato"],
    text: ["Separado em fração sólida e líquida, o digestato substitui parte do adubo mineral e fecha o ciclo."],
    tags: ["digestato", "agro"], streams: ["digestato"], anchor: [450, 600, 18], focus: [230, 0, 560, 700],
  },

  // ---------------- DESTINO
  {
    id: "injecao", chapter: "destino", kicker: "Rede de gás",
    message: "O biometano entra na mesma rede do gás natural.",
    figure: { type: "chain", steps: [{ icon: "gauge", label: "Medição", tag: "injecao" }, { icon: "drop", label: "Odorização", tag: "injecao" }, { icon: "pipe", label: "Gasoduto", tag: "cidade" }, { icon: "city", label: "Indústrias e casas", tag: "industria" }] },
    text: ["O odorante dá o cheiro característico que ajuda a perceber vazamentos."],
    tags: ["injecao", "cidade", "casa", "governo", "industria"], streams: ["biometano"], anchor: [622, 441, 20], focus: [590, 380, 1100, 930],
  },
  {
    id: "citygate", chapter: "destino", kicker: "City gate e distribuidora",
    message: "A distribuidora recebe o gás no city gate e o leva a cada consumidor.",
    figure: { type: "chain", steps: [{ icon: "pipe", label: "Gasoduto de transporte", tag: "citygate" }, { icon: "gauge", label: "City gate", tag: "citygate" }, { icon: "check", label: "Distribuidora", tag: "distribuidora" }, { icon: "city", label: "Consumidores", tag: "cidade" }] },
    text: ["No city gate, o gás é filtrado, aquecido, tem a pressão reduzida, é medido e odorizado. Daí em diante, a concessionária (em boa parte de SP, a Comgás) opera, mantém e monitora a rede 24 horas, sob regulação da ARSESP."],
    more: ["O biometano injetado pela usina entra nessa mesma rede de distribuição e se mistura ao gás natural.", "Equipes de manutenção percorrem a rede; o centro de operação acompanha pressão e vazão em tempo real."],
    tags: ["citygate", "distribuidora"], streams: ["gasnatural", "biometano"], anchor: [1060, 238, 26], focus: [860, 170, 1130, 680],
  },
  {
    id: "gnc", chapter: "destino", kicker: "Gasoduto virtual",
    message: "Onde não há duto, o biometano viaja comprimido em cilindros.",
    figure: { type: "chain", steps: [{ icon: "gauge", label: "Compressão", tag: "gnc" }, { icon: "tank", label: "Cilindros (GNC)", tag: "gnc" }, { icon: "truck", label: "Carreta", tag: "gnc" }, { icon: "cow", label: "Fazendas e indústrias", tag: "pec" }] },
    text: ["Feixes de cilindros de alta pressão vão de carreta até quem não está ligado à rede: fazendas, indústrias e frotas."],
    more: ["Atenção: o botijão de cozinha comum é GLP (gás liquefeito de petróleo), outro combustível. O biometano é guardado comprimido (GNC) ou liquefeito (GNL)."],
    tags: ["gnc", "pec"], streams: ["biometano"], anchor: [552, 483, 26], focus: [230, 230, 700, 560],
  },
  {
    id: "posto", chapter: "destino", kicker: "Mobilidade",
    message: "Trocar diesel por biometano corta cerca de ${REDUCAO_DIESEL}% das emissões por MJ.",
    figure: { type: "compare", unit: "gCO₂e por MJ de combustível, ciclo poço à roda (EPE)", ratioLabel: `−${REDUCAO_DIESEL}%`, rows: [
      { label: "Diesel B", v: INTENSIDADE.dieselB, tone: "neutral", prefix: "< " },
      { label: "Biometano (plantas certificadas no RenovaBio)", v: INTENSIDADE.biometano, tone: "biometano" }] },
    text: ["Comprimido (bio-GNV) abastece ônibus e caminhões; liquefeito (bio-GNL) serve a longas distâncias."],
    more: ["A comparação é por unidade de energia do combustível. Não é uma projeção de frota: em cenários de longo prazo da EPE, o efeito agregado depende de quanto da frota de fato usa gás.", "O resultado varia com a matéria-prima, as emissões fugitivas de metano, as distâncias de transporte e o consumo de energia na purificação.", `Um ônibus urbano a gás consome ${fmt(ONIBUS.m3km[0])}–${fmt(ONIBUS.m3km[1])} m³/km; rodando ${ONIBUS.kmDia[0]}–${ONIBUS.kmDia[1]} km por dia, são cerca de ${ONIBUS.m3Dia[0]}–${ONIBUS.m3Dia[1]} m³/dia.`, `Na troca do diesel, cada m³ de biometano evita cerca de ${fmt(EVITADO_DIESEL.t[0] * 1000)}–${fmt(EVITADO_DIESEL.t[1] * 1000)} kg de CO₂e no ciclo de vida.`],
    sources: ["epeIntensidade", "epeMotorizacoes", "comfrota", "gasbus"],
    tags: ["posto"], streams: ["biometano"], anchor: [835, 235, 30], focus: [690, 170, 900, 330],
  },
  {
    id: "casa", chapter: "destino", kicker: "Chegada",
    message: "A chama do seu fogão pode vir de resíduos.",
    figure: { type: "chain", steps: [{ icon: "waste", label: "Resto de comida", tag: "urb" }, { icon: "tank", label: "Biodigestor", tag: "cstr" }, { icon: "pipe", label: "Rede", tag: "injecao" }, { icon: "flame", label: "Seu fogão", tag: "casa" }] },
    text: [`Uma casa paulista com medidor individual usa, em média, cerca de ${fmt(CASA_M3_MES)} m³ de gás por mês (ARSESP).`, "Gás para cozinhar e aquecer água pela rede; luz pela rede elétrica."],
    sources: ["arsesp"],
    tags: ["casa"], streams: ["biometano", "eletricidade"], anchor: [743, 862, 22], focus: [712, 640, 905, 930],
  },

  // ---------------- VALOR AMBIENTAL
  {
    id: "cbio", chapter: "valor", kicker: "RenovaBio · CBIO", badge: { tag: "CBIO", at: [790, 250, 48] },
    message: "1 CBIO = 1 tonelada de CO₂e evitada pelo uso de biocombustível.",
    figure: { type: "flowCert", color: "cbio",
      steps: [{ icon: "factory", label: "Produtor certificado", note: "nota RenovaCalc × volume vendido" }, { icon: "doc", label: "Emite CBIO" }, { icon: "chart", label: "Negocia na B3" }, { icon: "fuel", label: "Distribuidoras", note: "aposentam para cumprir metas" }],
      kpis: [{ v: `${fmt(CBIO.metas[1].mi, 2)} mi`, l: "meta nacional de CBIOs em 2026", sub: `${fmt(CBIO.metas[0].mi, 2)} mi em 2025` }, { v: `≈ ${fmt(CBIO.porMil_m3)}`, l: "CBIOs por 1.000 m³ de biometano", sub: "referência EPE; depende da nota" }, { v: `R$ ${fmt(CBIO.preco[1].rs, 2)}`, l: "preço médio em 2025", sub: `R$ ${fmt(CBIO.preco[0].rs, 2)} em 2024` }] },
    text: ["A participação do produtor é voluntária; para as distribuidoras de combustíveis, a compra é obrigatória."],
    more: [
      "Cálculo simplificado: CBIO = nota (gCO₂e/MJ) × energia comercializada (MJ) ÷ 1.000.000. A nota vem da RenovaCalc e a planta é auditada por firma inspetora.",
      `No biometano, notas de plantas certificadas ficaram entre ${fmt(CBIO.notaFaixa[0], 2)} e ${fmt(CBIO.notaFaixa[1], 2)} gCO₂e/MJ (EPE). Só conta o volume elegível efetivamente comercializado.`,
    ],
    tags: ["upgrading", "injecao", "posto"], streams: ["biometano"], focus: [480, 170, 900, 480],
    sources: ["lei13576", "mmeRenovabio", "cnpe14", "mmeBalanco", "anpRenovabio2026", "b3", "epe"],
  },
  {
    id: "cgob", chapter: "valor", kicker: "Combustível do Futuro · CGOB", badge: { tag: "CGOB", at: [700, 500, 30] },
    message: "O CGOB garante a origem do biometano e serve à meta do gás natural.",
    figure: { type: "flowCert", color: "cgob",
      steps: [{ icon: "tank", label: "Produção certificada", note: "unidade e volumes" }, { icon: "check", label: "Certificador", note: "credenciado pela ANP" }, { icon: "doc", label: "Registro", note: "escrituração do CGOB" }, { icon: "pipe", label: "Gás natural", note: "produtores e importadores aposentam" }],
      kpis: [{ v: `${fmt(CGOB.metaEfetiva2026)}%`, l: "meta efetiva em 2026", sub: `≈ ${fmt(CGOB.volumeMeta2026_mi_m3, 1)} mi m³ de biometano`, gauge: { v: CGOB.metaEfetiva2026, legal: CGOB.metaLegal2026, max: CGOB.teto } }, { v: `${CGOB.m3PorCertificado} m³`, l: "por CGOB", sub: "referência da proposta regulatória" }, { v: `${CGOB.teto}%`, l: "teto legal da meta", sub: "metas futuras definidas pelo CNPE" }] },
    text: ["Criado pela Lei nº 14.993/2024 (arts. 17 a 22): informa a origem do insumo e o local de produção de cada lote de biometano."],
    more: [
      "A lei previa 1% em 2026; a Resolução CNPE nº 4/2026 fixou a meta efetiva inicial em 0,5%. Pequenos agentes ficam fora da obrigação.",
      "A meta pode ser cumprida comprando ou usando biometano, ou registrando e aposentando CGOBs (Resoluções ANP nº 995 e 996/2026). Biometano queimado em flare ou ventilado não gera CGOB.",
      "CBIO e CGOB são instrumentos diferentes. A lei proíbe a dupla contagem: a mesma redução de emissão não pode ser alegada duas vezes.",
    ],
    tags: ["injecao", "upgrading"], streams: ["biometano"], focus: [480, 170, 900, 480],
    sources: ["lei14993", "dec12614", "cnpe4", "anp995", "anp996", "anpCgob"],
  },
  {
    id: "carbono", chapter: "valor", kicker: "Créditos de carbono", badge: { tag: "CO₂e", at: [440, 290, 66] },
    message: "Metano evitado e CO₂ removido podem virar créditos, com verificação.",
    figure: { type: "twoCols", cols: [
      { title: "Redução", icon: "cloud", note: "metano de aterro, dejetos e efluentes capturado e usado", tone: "co2", tag: "pec" },
      { title: "Remoção", icon: "well", note: "CO₂ biogênico capturado e armazenado de forma permanente (BECCS)", tone: "co2", tag: "co2" }],
      steps: ["Linha de base", "Monitoramento", "Verificação independente", "Crédito"], markets: ["Mercado voluntário · Gold Standard, Verra", "SBCE · Lei nº 15.042/2024"] },
    text: ["Nem todo projeto é elegível automaticamente: é preciso uma metodologia aceita e verificação."],
    more: [
      "Créditos voluntários são diferentes de CBIOs e CGOBs. Se o mesmo benefício climático for reivindicado em mais de um sistema, há sobreposição.",
      "No SBCE, o BECCS pode contar como remoção quando o CO₂ é capturado, medido, transportado e armazenado de forma permanente, conforme a regulamentação e a metodologia.",
    ],
    tags: ["cstr", "co2", "pec", "aterro"], streams: ["co2", "biogas"], focus: [0, 170, 700, 930],
    sources: ["goldStandard", "verra", "lei15042"],
  },

  // ---------------- CIÊNCIA
  {
    id: "cp2b", chapter: "ciencia", kicker: "CP2b · Centro de pesquisa",
    message: "O CP2b conecta ciência a quem decide.",
    figure: { type: "hub", center: "CP2b", nodes: [{ icon: "factory", label: "Empresas e indústria", tag: "industria" }, { icon: "gov", label: "Governo e políticas públicas", tag: "governo" }, { icon: "tank", label: "Operação de usinas", tag: "cstr" }], outputs: ["Dados e mapas (PILAR-2b)", "Modelos e simuladores", "Formação de pessoas"] },
    text: ["Na universidade, o CP2b estuda biogás e bioprodutos e transforma evidência em apoio a investimentos e políticas."],
    tags: ["cp2b", "governo", "industria"], streams: ["conhecimento"], anchor: [172, 727, 44], focus: [-40, 380, 1000, 930],
    link: { href: FONTES.pilar.u, label: "Conhecer a plataforma PILAR-2b" },
  },

  {
    id: "fim", chapter: null, tourOnly: true, kicker: "O potencial de São Paulo",
    message: `SP poderia produzir cerca de ${Math.round(POTENCIAL_SP_DIA / CAPACIDADE_SP_DIA)} vezes mais biometano do que tem hoje.`,
    figure: { type: "compare", unit: "milhões de m³ de metano por dia", rows: [
      { label: "Potencial (mediana CP2b)", v: POTENCIAL_SP_DIA, lo: SP.p5BiAno * 1000 / 365, hi: SP.p95BiAno * 1000 / 365, tone: "biometano" },
      { label: "Capacidade instalada (ANP, 2024)", v: CAPACIDADE_SP_DIA, tone: "neutral" }] },
    text: [`Somando os resíduos dos ${SP.municipios} municípios: ≈ ${fmt(SP.medianaBiAno, 1)} bilhões de m³ de metano por ano (intervalo de 90%: ${fmt(SP.p5BiAno, 1)}–${fmt(SP.p95BiAno, 1)}).`],
    focus: "all", streams: "all", sources: ["cp2bEvidencia"],
  },
];

// Numeração automática na ordem das etapas (as de tour apenas não recebem número).
let _n = 0;
for (const st of STOPS) if (!st.tourOnly) st.n = ++_n;
