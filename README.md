# Ecossistema do Biogás · CP2B

Um diorama isométrico animado e educativo que mostra todo o caminho do biogás, **do campo até a sua casa**:

1. **Origem dos resíduos:** agricultura (palha, vinhaça, torta de filtro), pecuária (esterco), agroindústria e resíduos urbanos (lixo orgânico, lodo de esgoto).
2. **Usina:** recepção e preparo → biodigestores CSTR → gasômetro e flare.
3. **Caminho A:** cogeração de eletricidade e calor.
4. **Caminho B:** purificação por membranas → biometano.
5. **Coprodutos:** CO₂ biogênico (uso industrial ou armazenamento geológico/BECCS) e digestato (biofertilizante que volta ao campo).
6. **Distribuição:** injeção na rede de gás, posto de bio-GNV, indústria, escola e casas.
7. **Valor ambiental:** CBIO, CGOB e créditos de carbono.

Público-alvo: público geral e escolas. Idioma: português. Pensado primeiro para desktop, mas também funciona no celular.

## Como usar

- **Tour guiado:** use as setas (ou ← →) para seguir as 16 paradas.
- **Explorar:** arraste para mover, use a roda ou a pinça para dar zoom e toque nos pinos numerados.
- **Camadas:** ligue e desligue cada fluxo (substratos, biogás, biometano, CO₂, digestato, eletricidade, calor) e os selos de certificados.
- Link direto para uma parada: `…/#cstr`, `…/#certificados` etc.

## Rodar localmente

Não há etapa de build nem dependências. Basta servir a pasta:

```bash
python3 -m http.server 8000
```

Depois abra <http://localhost:8000>.

## Estrutura

| Arquivo | O que faz |
|---|---|
| `src/world.mjs` | Monta a cena: geometria, ordem de pintura, fluxos e rotas dos caminhões |
| `src/content.mjs` | Todos os textos, números e certificados. **Edite aqui** |
| `src/app.mjs` | Câmera (zoom/arrasto), tour, camadas, partículas e veículos animados |
| `styles.css` | Identidade visual CP2B e estilos do SVG |
| `src/vendor/iso-kit.mjs` | Kit isométrico do projeto [Anatomy](https://github.com/wheresryan22/anatomy) (MIT, ver `LICENSE-anatomy`) |

## Publicação

O workflow `.github/workflows/pages.yml` publica o site a cada push na `main`. Para ativar, vá em **Settings → Pages → Source: GitHub Actions**.

## Dados

Os números citados são medianas do CP2B. Veja [`DATA.md`](DATA.md).

O mergulho detalhado no biodigestor está no [Simulador CSTR](https://aikiesan.github.io/simulador_CSTR/).
