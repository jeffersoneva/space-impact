# Space Impact

Jogo arcade em pixel art inspirado no classico **Space Impact**, desenvolvido com HTML, CSS, JavaScript e jQuery.

A tela do jogo e montada como uma grade de 84 x 48 pixels. Nave, inimigos, tiros, vidas, placar, level, boss e mensagens sao desenhados dinamicamente nessa grade.

## Funcionalidades

- Nave controlada por teclado no desktop.
- Controles touch responsivos para dispositivos moveis.
- Disparo continuo no touch ao segurar o botao de tiro.
- Efeitos sonoros para tiro, perda de vida e game over.
- Sistema de vidas com 3 coracoes em pixel art.
- Placar de 5 digitos renderizado em pixels.
- Indicador de level no HUD: `LV. X`.
- Inimigos com formatos, vida, pontos, velocidades e intervalos diferentes.
- Margem de 1 pixel entre inimigos ao nascerem.
- Inimigos e boss entram pela direita, nascendo um pixel fora da area visivel.
- Inimigos atravessam a tela e sao removidos ao sair totalmente pela esquerda.
- Fundo animado com rolagem lateral.
- Ciclo infinito de dificuldade com boss.
- Boss com movimento vertical, canhao, tiros proprios e vida progressiva.
- Tela de game over com reinicio.

## Ciclo do jogo

O jogo comeca pausado. Aperte `Espaco` no desktop ou o botao `II` no mobile para iniciar.

Cada level funciona em ciclos:

1. 20 segundos com inimigos no modo facil.
2. 20 segundos com inimigos no modo medio.
3. 20 segundos com inimigos no modo dificil.
4. Novos inimigos param de nascer, os inimigos ativos continuam na tela e o boss entra pela direita.
5. Ao derrotar o boss, o `LV.` aumenta e o ciclo recomeca.

O jogo nao tem final definido. O objetivo e sobreviver, destruir inimigos, derrotar bosses e aumentar a pontuacao.

## Boss

- O primeiro boss tem 40 HP.
- A cada novo level, o boss ganha 20 HP extras.
- O boss se move para cima e para baixo.
- O boss dispara a partir de um pequeno canhao preso ao corpo.
- O primeiro boss atira a cada 2 segundos.
- Os tiros do boss comecam com metade da velocidade do tiro do jogador.
- A cada level, a cadencia e a velocidade dos tiros do boss aumentam cerca de 25%.
- O jogador pode receber 2 tiros do boss; no 3o acerto, perde 1 vida.
- Ao perder vida durante o boss, apenas o jogador respawna; o boss mantem posicao e HP.

## Controles

### Desktop

| Tecla | Acao |
| --- | --- |
| Seta para cima | Move a nave para cima |
| Seta para baixo | Move a nave para baixo |
| Seta para esquerda | Move a nave para a esquerda |
| Seta para direita | Move a nave para a direita |
| F | Atira |
| Espaco | Inicia ou pausa o jogo |
| R | Reinicia apos o game over |

### Mobile / touch

| Controle | Acao |
| --- | --- |
| Direcional esquerdo | Move a nave |
| F | Atira, com disparo continuo ao segurar |
| II | Inicia, pausa ou reinicia apos game over |

Os controles touch aparecem apenas em dispositivos com toque ou ponteiro coarse.

## Configuracoes principais

As principais configuracoes ficam em `assets/js/models.js`.

| Configuracao | Valor atual | Descricao |
| --- | --- | --- |
| `gridCols` | `84` | Largura da grade em pixels |
| `gridRows` | `48` | Altura da grade em pixels |
| `projectileSpeed` | `30` | Intervalo do tiro do jogador em ms |
| `fireCooldown` | `125` | Cadencia do tiro do jogador em ms |
| `difficultyLevelDuration` | `20000` | Tempo de cada etapa de dificuldade |
| `bossBaseHp` | `40` | Vida do primeiro boss |
| `bossHpIncrease` | `20` | Vida extra do boss por level |
| `bossBaseShotInterval` | `2000` | Cadencia inicial do boss em ms |
| `bossPowerIncrease` | `0.25` | Aumento de poder do boss por level |
| `bossMaxHitsBeforeLifeLoss` | `3` | Tiros do boss necessarios para perder vida |
| `maxScore` | `99999` | Pontuacao maxima exibida no HUD |

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- jQuery

## Como executar

Este projeto e estatico e pode ser aberto diretamente no navegador, sem servidor local.

1. Clone ou baixe este repositorio:

```bash
git clone https://github.com/jeffersoneva/space-impact.git
```

2. Abra o arquivo `index.html` no navegador.

## Estrutura do projeto

```text
space-impact/
|-- index.html
|-- assets/
|   |-- css/
|   |   `-- style.css
|   |-- img/
|   |   |-- bg.avif
|   |   `-- favicons/
|   |-- js/
|   |   |-- jquery.js
|   |   `-- models.js
|   `-- sounds/
|       |-- die.wav
|       |-- fire.wav
|       `-- game-over.wav
`-- README.md
```

## Licenca

Este projeto ainda nao possui uma licenca definida.
