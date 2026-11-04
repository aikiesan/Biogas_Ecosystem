# Fontes dos números

O foco da experiência é explicar, não calcular. Os poucos números exibidos são **medianas** das bases do CP2B.

## Metano por tonelada de resíduo fresco

Calculado como BMP × ST × SV/ST, usando as medianas de `Pilar-2b/cp2b-workspace/NewLook/data/canonical_parameters/feedstocks.yaml`.

| Resíduo | BMP (m³ CH₄/t SV) | ST (%) | SV/ST (%) | m³ CH₄ / t fresca | CH₄ no biogás |
|---|---|---|---|---|---|
| Palha de cana | 175 | 30 | 82 | ≈ 43 | 55% |
| Torta de filtro | 280 | 38 | 80 | ≈ 85 | 60% |
| Vinhaça | 160 | 3 | 60 | ≈ 3 | 65% |
| Cama de aviário | 280 | 25 | 69,8 | ≈ 49 | 62,5% |
| Dejeto bovino (líquido) | 155 | 8 | 78 | ≈ 10 | 57% |
| FORSU (orgânico urbano) | 360 | 30,6 | 85 | ≈ 94 | 52% |
| Lodo primário de esgoto | 310 | 15 | 68 | ≈ 32 | 68% |
| Gordura | 850 | 95 | 98 | ≈ 790 | 72% |

## Potencial do estado de São Paulo

- **≈ 6 bilhões de Nm³ de CH₄ por ano.** É a mediana N4 do CP2b v5.1, com intervalo de 90% entre 5,13 e 6,90 bilhões e 20 mil sorteios Monte Carlo. Fonte: `cp2b-evidencia/docs/METODO_ARTIGO.md`.
- **Cana ≈ 4/5 do potencial.** A soma de palha, torta, vinhaça e bagaço dá 81,8% da N4. Fonte: o mesmo arquivo.
- **645 municípios.**
- **Capacidade instalada de biometano em SP:** ≈ 0,4 milhão de Nm³ por dia (ANP 2024). Fonte: `RESULTADOS_SP_PARA_PAPER_2026-07-30.md`.

## Certificados

Os textos sobre **CBIO**, **CGOB** e **créditos de carbono** (`src/content.mjs`, objeto `CERTS`) são **preliminares** e aparecem marcados como “em revisão” até a validação pela equipe.
