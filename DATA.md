# Fontes dos números

O foco da experiência é explicar, não calcular. Os números do potencial e dos resíduos são **medianas** das bases do CP2b. Todos estão centralizados em `src/data/numeros.mjs`.

## Metano por tonelada de resíduo fresco

Calculado como BMP × ST × SV/ST, usando as medianas de `Pilar-2b/cp2b-workspace/NewLook/data/canonical_parameters/feedstocks.yaml`.

| Resíduo | BMP (m³ CH₄/t SV) | ST (%) | SV/ST (%) | m³ CH₄ / t fresca | CH₄ no biogás |
|---|---|---|---|---|---|
| Palha de cana | 175 | 30 | 82 | ≈ 43 | 55% |
| Torta de filtro | 280 | 38 | 80 | ≈ 85 | 60% |
| Vinhaça | 160 | 3 | 60 | ≈ 3 | 65% |
| Cama de aviário | 280 | 25 | 69,8 | ≈ 49 | 62,5% |
| Dejeto bovino (líquido) | 155 | 8 | 78 | ≈ 10 | 57% |
| Dejeto suíno (líquido) | 245 | 3 | 80 | ≈ 6 | 65% |
| FORSU (orgânico urbano) | 360 | 30,6 | 85 | ≈ 94 | 52% |
| Lodo primário de esgoto | 310 | 15 | 68 | ≈ 32 | 68% |
| Gordura | 850 | 95 | 98 | ≈ 790 | 72% |

## Potencial do estado de São Paulo

- **≈ 6 bilhões de Nm³ de CH₄ por ano.** É a mediana N4 do CP2b v5.1, com intervalo de 90% entre 5,13 e 6,90 bilhões e 20 mil sorteios Monte Carlo. Fonte: `cp2b-evidencia/docs/METODO_ARTIGO.md`.
- **Cana ≈ 4/5 do potencial.** A soma de palha, torta, vinhaça e bagaço dá 81,8% da N4. Fonte: o mesmo arquivo.
- **645 municípios.**
- **Capacidade instalada de biometano em SP:** ≈ 0,4 milhão de Nm³ por dia (ANP 2024). Fonte: `RESULTADOS_SP_PARA_PAPER_2026-07-30.md`.

## Cogeração (motores a biogás de 0,5–2 MW)

| Parcela da energia do biogás | Faixa típica |
|---|---|
| Eletricidade líquida | 35–43% |
| Calor útil recuperável | 35–45% |
| Perdas | 12–25% |
| Eficiência total (elétrica + térmica útil) | 70–82% |

- Fontes: EPA (benefícios do CHP e *Biomass CHP Catalog of Technologies*) e dados de fabricante (grupo de cerca de 760 kWe com 42,5–43,1% de eficiência elétrica).
- O Simulador CSTR usa 35% de eficiência elétrica.
- A largura das faixas na figura usa o ponto médio de cada intervalo.

## Biometano: Resolução ANP nº 1.006/2026

Em vigor desde 13/08/2026, revogou as Resoluções 886/2022 e 906/2022. Valores em base seca, a 20 °C e 1 atm:
- CH₄ ≥ 90,0% mol
- CO₂ ≤ 3,0% mol
- H₂S ≤ 10 mg/m³

## Biodigestor CSTR

- **Faixas de temperatura:**
  - mesofílico: 30–38 °C, tipicamente ≈ 35 °C;
  - termofílico: 50–55 °C.
- **Tempo de retenção hidráulica (TRH):** 15–30 dias, com frequência 20–25. Lodos sem aquecimento podem exigir cerca de 40 dias.
- **Fontes:** GIZ/Probiogás; Zhang et al. (2024); Van et al. (2020).

## Biometano versus diesel (EPE, poço à roda)

- Diesel B: < 80 gCO₂e/MJ.
- Biometano de plantas certificadas no RenovaBio: ≈ 9,32 gCO₂e/MJ.
- Redução: 1 − 9,32/80 ≈ **88%** por MJ.
- Não é uma projeção de frota: num cenário da EPE para 2050, o efeito agregado sobre a frota é de cerca de 5%.

## Fração orgânica dos resíduos sólidos urbanos

- **Brasil:** 45,3% de matéria orgânica nos RSU coletados; recicláveis secos, 33,6% (Planares).
- **São Paulo:** a faixa histórica é de 50–60%, mas estudos recentes encontraram menos de 50%. O valor varia por município.
- **Planejamento (ABREMA):** a premissa é de cerca de 50%.

## Certificados (verificados em 2026)

**CBIO**
- 1 CBIO = 1 t CO₂e.
- Meta nacional: 40,39 milhões (2025) e 48,09 milhões (2026), pela Resolução CNPE nº 14/2024.
- Preço médio: R$ 88,02 (2024) e R$ 54,72 (2025), segundo ANP e MME.
- Rendimento: ≈ 0,0027 CBIO por m³ de biometano (referência EPE). As notas das plantas certificadas ficaram entre 72,28 e 80,77 gCO₂e/MJ.

**CGOB**
- Previsto na Lei nº 14.993/2024 (arts. 17 a 22). A emissão é regulada pela Resolução ANP nº 996/2026; as metas individuais, pela Resolução ANP nº 995/2026.
- Meta legal de 1% em 2026. A meta efetiva é de 0,5% (Resolução CNPE nº 4/2026), o que equivale a ≈ 181,7 milhões de m³ de biometano. O teto é de 10%.
- 1 CGOB = 100 m³ (referência da proposta regulatória).

**Créditos de carbono**
- Mercado voluntário: Gold Standard e Verra.
- SBCE: Lei nº 15.042/2024.

Os links completos de cada fonte estão em `src/data/fontes.mjs` e no item “Fontes” de cada etapa.
