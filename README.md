# Space Impact

Jogo arcade em pixel art inspirado no clássico **Space Impact**, desenvolvido com HTML, CSS, JavaScript e jQuery.

A tela do jogo é montada como uma grade de pixels, onde a nave, os inimigos, os tiros, as vidas, o placar e a mensagem de game over são desenhados dinamicamente.

## Funcionalidades

- Nave controlada pelo teclado.
- Disparo de projéteis com efeito sonoro.
- Sistema de vidas com corações em pixel art.
- Placar renderizado diretamente na grade do jogo.
- Inimigos com formatos, velocidades, vida e pontuação diferentes.
- Fundo animado com rolagem lateral.
- Tela de game over com opção de reiniciar.
- Layout responsivo para telas menores.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- jQuery

## Como executar

Este projeto é estático e pode ser aberto diretamente no navegador, sem servidor local.

### Abrindo direto

1. Clone ou baixe este repositório:

```bash
git clone https://github.com/jeffersoneva/space-impact.git
```

2. Abra o arquivo `index.html` no navegador.

## Controles

| Tecla | Ação |
| --- | --- |
| Seta para cima | Move a nave para cima |
| Seta para baixo | Move a nave para baixo |
| Seta para esquerda | Move a nave para a esquerda |
| Seta para direita | Move a nave para a direita |
| F | Atira |
| Espaço | Inicia ou pausa o jogo |
| R | Reinicia após o game over |

## Estrutura do projeto

```text
space-impact/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── img/
│   │   ├── bg.avif
│   │   └── favicons/
│   ├── js/
│   │   ├── jquery.js
│   │   └── models.js
│   └── sounds/
│       └── fire.wav
└── README.md
```

## Objetivo do jogo

Controle a nave, desvie dos inimigos e destrua o máximo possível para aumentar sua pontuação. O jogador começa com 3 vidas. Ao perder todas, a partida termina e pode ser reiniciada com a tecla `R`.

## Licença

Este projeto ainda não possui uma licença definida.
