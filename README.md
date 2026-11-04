# Ecossistema do Biogás · CP2b

Um diorama isométrico animado que mostra o ecossistema do biogás, do resíduo à energia, aos coprodutos e ao valor ambiental. Também mostra como o **CP2b**, na universidade, conecta essa ciência a empresas, à indústria e a quem formula políticas públicas.

Público: público geral, empresas, indústria e decisores públicos. Idioma: português. A experiência foi pensada para desktop e também funciona no celular.

## Como funciona

- **Visão geral (padrão).** O mapa fica **parado**. Tocar num número (ou numa zona) abre a etapa no painel lateral e destaca a zona no mapa, sem zoom.
- **Tour guiado.** São 24 etapas em ordem. Só neste modo a câmera aproxima suavemente cada etapa.
- **Uma etapa = uma mensagem + uma figura.** O título é a mensagem; a figura a prova; o texto de apoio tem 1 ou 2 frases. Detalhes ficam em “Saiba mais” e as referências em “Fontes”.
- **Fluxos.** A mesma cor representa o mesmo fluxo em todo lugar (mapa, figuras e legenda). Toque na legenda para ocultar um fluxo.
- **Passe o mouse** sobre qualquer peça: ela ganha contorno e as tubulações ligadas a ela acendem. Assim fica claro o que está conectado a quê.
- **Siga o carbono.** Uma partícula percorre o ciclo curto do carbono: do ar à cana, de caminhão à usina, pelo biodigestor e pela purificação, pela rede até o fogão, e de volta ao ar. Cada trecho tem legenda e destaca a zona por onde passa.
- **Contador ao vivo.** Mostra quanto metano os resíduos de SP poderiam gerar desde que a página foi aberta (mediana CP2b, ≈ 189 m³/s), comparado à capacidade de biometano instalada hoje (ANP, ≈ 4,6 m³/s).
- **Relógio do diorama.** Um dia passa em 60 s e um mês por dia. À noite, janelas e postes acendem e as cozinhas acendem conforme a demanda de gás. O gasômetro enche e esvazia com o consumo, e a safra da cana (abr–nov) liga e desliga a colheita.
- **Território paulista.** O mapa tem rio com mata ciliar, Mata Atlântica com nascente, floresta plantada de eucalipto com serraria, uma represa com veleiros e açudes. A cidade tem parque com lago e calçadas arborizadas.
- **Gás canalizado.** O gás chega pelo gasoduto de transporte ao city gate e segue para a rede da distribuidora. Onde não há duto, o biometano vai comprimido em cilindros (gasoduto virtual).
- **Resíduos urbanos ao lado da cidade.** A coleta leva o lixo à triagem: recicláveis voltam à indústria, orgânicos vão para o biodigestor e rejeitos vão para o aterro, que tem captação de gás. A ETE trata o esgoto e digere o lodo.
- **Cena viva.** A colhedora e o trator trabalham no canavial, as vacas pastam, os misturadores giram e o gasômetro "respira". Há também pontes raspadoras girando na ETE, bolhas no tanque de aeração, pássaros, nuvens, fumaça, a chama do flare e ondas de chegada na recepção e na sua casa.
- **Link direto para uma etapa:** `…/#cstr`, `…/#cgob`, `…/#cp2b` etc.

## Rodar localmente

Não há build nem dependências.

```bash
python3 -m http.server 8000
```

Depois abra <http://localhost:8000>.

## Estrutura

```
index.html
styles/            base (layout, marca) · scene (diorama) · panel · figures
src/
  main.mjs         liga tudo: modos, navegação, URL
  data/
    numeros.mjs    TODOS os números exibidos, com a fonte de cada um
    fontes.mjs     referências (links) citadas nas etapas
  content/
    paradas.mjs    as etapas: mensagem, figura, texto, destaque no mapa
  scene/           o diorama
    kit.mjs        peças isométricas (caixas, tanques, cúpulas, prédios, casas…)
    materials.mjs  materiais/cores da cena
    layout.mjs     planta geral: lotes e ruas
    zones/         fontes.mjs · usina.mjs · cidade.mjs (cidade, city gate, universidade)
                   residuos.mjs (triagem, aterro, ETE) · natureza.mjs (rio, florestas, represa)
    flows.mjs      tubulações, linhas de energia e pontes de conhecimento
    vehicles.mjs   caminhões, ônibus e carros
    world.mjs      compõe a cena
  ui/
    stage.mjs      câmera, animação, destaque, pinos, hover
    life.mjs       vida ambiente (misturadores, ETE, pássaros, ondas)
    journey.mjs    "Siga o carbono": a jornada animada
    ambient.mjs    relógio: dia/noite, demanda de gás, safra
    panel.mjs      índice e páginas das etapas
    figures.mjs    figuras do painel (geradas a partir dos dados)
    palette.mjs    codificação de cores única
    icons.mjs      ícones de traço
  vendor/iso-kit.mjs  kit isométrico do projeto Anatomy (MIT)
docs/ARQUITETURA.md   como editar e os princípios das figuras
```

## Publicação

O workflow `.github/workflows/pages.yml` publica a cada push na `main`. Para ativar, vá em **Settings → Pages → Source: GitHub Actions**.

## Dados

Os números citados são medianas do CP2b e dados oficiais (ANP, MME, CNPE, EPE). Veja [`DATA.md`](DATA.md).

O mergulho no biodigestor está no [Simulador CSTR](https://aikiesan.github.io/simulador_CSTR/).
