# Papel de parede, proteção de tela e vídeo em loop

## 1. Modo tela (sem painéis e sem contador)

Abra o site com `?tela` no fim do endereço:

```
https://aikiesan.github.io/Biogas_Ecosystem/?tela
```

| Parâmetro | O que faz | Exemplo |
|---|---|---|
| `tela` | Mostra só o diorama, em tela cheia, sem cabeçalho, painel, contador nem pinos | `?tela` |
| `passeio` | A câmera passeia devagar pelas etapas a cada 14 s e volta à visão geral | `?tela&passeio` |
| `dia` | Duração de um dia, em segundos (o padrão é 60) | `?tela&dia=600` |
| `hora` | Hora inicial | `?tela&hora=19` |

**Recomendado para papel de parede:** `?tela&dia=600`. Assim um dia dura 10 minutos e a transição é bem lenta.

O cursor some depois de 2 s parado.

## 2. Usar como papel de parede animado

| Sistema | Aplicativo (gratuito) | Como fazer |
|---|---|---|
| Windows | **Lively Wallpaper** (Microsoft Store) | *Add Wallpaper* → cole a URL com `?tela&dia=600`. Também aceita o vídeo MP4. |
| macOS | **Plash** (App Store) | *Add Website* → cole a URL. |
| Linux (GNOME/KDE) | **Hidamari** (vídeo) ou extensões de papel de parede web | Use o vídeo MP4 em loop. |

Esses aplicativos costumam pausar a animação quando há uma janela em tela cheia, o que poupa bateria.

## 3. Usar como proteção de tela

| Sistema | Aplicativo | Como fazer |
|---|---|---|
| Windows | **Lively Wallpaper** → *Screensaver* | Use a mesma URL ou o vídeo. |
| macOS | **WebViewScreenSaver** (GitHub) | Cole a URL com `?tela&passeio`. |
| TVs, totens e recepções | Qualquer player | Use o vídeo MP4 em loop. |

## 4. Vídeo em loop (MP4)

Use o vídeo onde não dá para abrir um site: TVs, apresentações, redes sociais, eventos, e-mail e computadores com restrições de TI.

```bash
npm i -D playwright && npx playwright install chromium   # uma vez
node tools/gravar-video.cjs                                 # 60 s, 1920×1080, 30 fps
node tools/gravar-video.cjs --largura 3840 --altura 2160    # 4K
node tools/gravar-video.cjs --segundos 120 --params "dia=120&hora=6"
node tools/gravar-video.cjs --params "passeio"              # com passeio da câmera
```

O gravador avança um relógio virtual quadro a quadro, então o vídeo sai suave mesmo em computadores lentos. O último segundo é fundido com o primeiro, para que o loop não tenha emenda visível. É preciso ter o `ffmpeg` instalado.
