# Arquitetura e guia de edição

## Princípios das figuras

1. **Uma figura, uma mensagem.** O título da etapa (`message`) é a frase que a figura prova. Escreva a mensagem antes de escolher a figura.
2. **Cor só quando carrega informação.** A cena é sóbria (brancos, cinzas, verdes suaves). A cor forte fica reservada a:
   - **Fluxos:** substratos, biogás, biometano, CO₂, digestato, eletricidade, calor e conhecimento. A paleta é derivada da Okabe-Ito, amigável a daltônicos.
   - **Setores de origem:** agrícola, pecuária, urbano e indústria. A paleta é a do PILAR-2b.
   - **Gradiente com direção intuitiva:** as 4 etapas da digestão vão do marrom (matéria orgânica) ao verde (metano).
3. **Mesma codificação em tudo.** O mapa, as figuras e a legenda usam `src/ui/palette.mjs`.
4. **Hierarquia por tamanho.** Figuras simples são baixas; figuras com mais dados são maiores.
5. **Cortar o desnecessário.** Sem molduras, sem eixos redundantes e sem marcas de escala. O valor fica escrito na própria barra.

## Como editar

| Quero… | Arquivo |
|---|---|
| mudar um número | `src/data/numeros.mjs` (as figuras se atualizam sozinhas) |
| mudar textos, a ordem ou o destaque de uma etapa | `src/content/paradas.mjs` |
| adicionar uma referência | `src/data/fontes.mjs`, e depois `sources: [...]` na etapa |
| mudar cores dos fluxos | `src/ui/palette.mjs` |
| mexer num prédio ou equipamento | `src/scene/zones/*.mjs` |
| criar um novo tipo de figura | `src/ui/figures.mjs` (objeto `F`) |

### Campos de uma etapa (`paradas.mjs`)

- `message`: a mensagem (título).
- `figure`: `{ type, ... }`. Os tipos são: `chain`, `share`, `bars`, `beforeAfter`, `merge`, `stages`, `composition`, `sankey`, `fork`, `cycle`, `flowCert`, `twoCols`, `hub` e `compare`.
- `text`: 1 ou 2 frases de apoio.
- `more`: detalhes opcionais. `sources`: ids de `fontes.mjs`.
- `tags`: zonas do mapa a destacar. São os ids passados como 3º argumento de `S.add(...)` nas zonas.
- `streams`: fluxos em evidência.
- `anchor`: posição do pino. `badge`: selo hexagonal no lugar do pino.
- `focus`: área que o tour enquadra.

## Cena

As coordenadas são de mundo: `x` desce para a direita, `y` desce para a esquerda e `z` sobe. `S.add(svg, ponto, tag)` insere um objeto. A ordem de pintura é calculada pela profundidade do ponto. Por isso, use o centro da base do objeto e mantenha os objetos sem sobreposição de planta.

O destaque de uma etapa funciona assim: um véu claro cobre o mapa, e os objetos com a `tag` da etapa são redesenhados acima dele (`<use>`). O quadro não se move.
