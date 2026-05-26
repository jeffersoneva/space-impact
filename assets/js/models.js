$(document).ready(function (){

    const gridCols = 84;
    const gridRows = 48;

    function createPixelGrid(){
        const game = document.querySelector('.game');
        if (!game) return;

        const fragment = document.createDocumentFragment();
        game.textContent = '';

        for (let y = 0; y < gridRows; y++){
            for (let x = 0; x < gridCols; x++){
                const pixel = document.createElement('div');
                pixel.className = 'pixel';
                pixel.id = `p-${x}-${y}`;
                fragment.appendChild(pixel);
            }
        }

        game.appendChild(fragment);
    }

    createPixelGrid();

    // ================================================================================================
    // CONFIGURAÇÕES GERAIS
    // ================================================================================================

    const maxX = 83;                             // Limite máximo de movimento horizontal
    const maxY = 46;                             // Limite máximo de movimento vertical
    const projectileSpeed = 30;                  // Velocidade do projétil da minha arma
    const fireCooldown = 125;                    // Cadencia de tiros em millesegundos
    const minSpawnY = 12;                        // limite vertical inferior mínimo para inimigos
    const maxSpawnY = 40;                        // limite vertical inferior máximo para inimigos
    const gameUpdateInterval = 200;              // Intervalo principal de atualizacao do jogo
    const difficultyLevelDuration = 20000;       // Tempo para avancar um nivel de dificuldade
    const bossBaseHp = 40;                       // Vida inicial do boss
    const bossHpIncrease = 20;                   // Vida extra do boss a cada level
    const bossBaseShotInterval = 2000;           // Cadencia inicial dos tiros do boss
    const bossBaseProjectileSpeed = projectileSpeed * 2; // Metade da velocidade do tiro do jogador
    const bossPowerIncrease = 0.25;              // Aumento de cadencia e velocidade por level
    const bossMaxHitsBeforeLifeLoss = 3;         // Acertos do boss necessarios para perder uma vida
    const fireSoundPath = './assets/sounds/fire.wav';
    const dieSoundPath = './assets/sounds/die.wav';
    const gameOverSoundPath = './assets/sounds/game-over.wav';
    let bgPosition = 0;                          // Posição inicial da imagem de fundo
    let stoped = true;                           // Jogo começa pausado
    let gameOver = false;                        // Bloqueia novas acoes apos o fim do jogo
    let canFire = true;                          // Intervalo de disparos
    let score = 0;                               // Pontuacao do jogador
    let gameElapsedTime = 0;                     // Tempo jogado sem contar pausa
    let playerLevel = 1;                         // Level atual do jogador

    // ================================================================================================
    // ANIMAÇÃO BACKGROUND
    // ================================================================================================

    function playSound(soundPath){
        const audio = new Audio(soundPath);
        const playPromise = audio.play();

        if (playPromise && typeof playPromise.catch === "function"){
            playPromise.catch(() => {});
        }
    }

    function animateBackground(){
        if (!stoped){
            bgPosition -= 0.3; // velocidade lenta
            $('.game').css('background-position', `${bgPosition}px 0`);
        }
        requestAnimationFrame(animateBackground);
    }

    // ================================================================================================
    // POSIÇÕES INICIAIS
    // ================================================================================================

    // VIDA
    const heartShape = [
        [0, 0], [1, 0], [3, 0], [4, 0],
        [0, 1], [1, 1], [2, 1], [3, 1], [4, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
        [1, 3], [2, 3], [3, 3],
        [2, 4]
    ];

    // 3 VIDAS INICIAIS
    const initialHearts = [
        { x: 2, y: 2 },
        { x: 8, y: 2 },
        { x: 14, y: 2 }
    ];
    const hearts = initialHearts.map((heart) => ({ ...heart }));

    // DIGITOS DO PLACAR
    const scoreStartX = 63;
    const scoreStartY = 2;
    const scoreDigitSpacing = 1;
    const scoreDigitWidth = 3;
    const maxScore = 99999;
    const scoreDigits = {
        0: ["111", "101", "101", "101", "111"],
        1: ["010", "110", "010", "010", "111"],
        2: ["111", "001", "111", "100", "111"],
        3: ["111", "001", "111", "001", "111"],
        4: ["101", "101", "111", "001", "001"],
        5: ["111", "100", "111", "001", "111"],
        6: ["111", "100", "111", "101", "111"],
        7: ["111", "001", "001", "001", "001"],
        8: ["111", "101", "111", "101", "111"],
        9: ["111", "101", "111", "001", "111"]
    };
    const levelStartX = 26;
    const levelStartY = 2;
    const levelLetterSpacing = 1;
    const levelFont = {
        ...scoreDigits,
        " ": ["0", "0", "0", "0", "0"],
        ".": ["0", "0", "0", "0", "1"],
        L: ["100", "100", "100", "100", "111"],
        V: ["101", "101", "101", "101", "010"]
    };

    // TEXTO DE GAME OVER
    const gameOverText = "GAME OVER";
    const restartLines = ["APERTE R PARA", "REINICIAR"];
    const gameOverLetterSpacing = 1;
    const restartLetterSpacing = 1;
    const restartTitleGap = 4;
    const restartLineGap = 1;
    const gameOverOffsetY = 4;
    const gameOverFont = {
        " ": ["000", "000", "000", "000", "000", "000", "000"],
        A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
        E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
        G: ["11111", "10000", "10000", "10111", "10001", "10001", "11111"],
        M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
        O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
        R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
        V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"]
    };
    const restartFont = {
        " ": ["00", "00", "00", "00", "00"],
        A: ["010", "101", "111", "101", "101"],
        C: ["111", "100", "100", "100", "111"],
        E: ["111", "100", "110", "100", "111"],
        I: ["111", "010", "010", "010", "111"],
        M: ["101", "111", "111", "101", "101"],
        N: ["10001", "11001", "10101", "10011", "10001"],
        O: ["111", "101", "101", "101", "111"],
        P: ["111", "101", "111", "100", "100"],
        R: ["110", "101", "110", "101", "101"],
        T: ["111", "010", "010", "010", "010"]
    };

    // NAVE DO JOGADOR
    const shipPixels = [
        [2, 0], [3, 0], [3, 1], [4, 1], [4, 2], [3, 3], [5, 3],
        [4, 4], [4, 5], [3, 5], [3, 6], [2, 6],
        [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
        [7, 1], [7, 2], [7, 3], [7, 4], [7, 5],
        [8, 1], [8, 3], [8, 5],
        [9, 2], [9, 4],
        [10, 3]
    ];

    // COORDENADAS INICIAIS E PASSADAS DA NAVE DO JOGADOR
    let offsetX = 0;
    let offsetY = 22;
    let lastOffsetX = offsetX;
    let lastOffsetY = offsetY;

    
    // ================================================================================================
    // VIDA
    // ================================================================================================
   
    // RENDERIZA AS VIDAS
    function renderHearts(){
        $('.heart').css('background-color', 'var(--transparent)');
        $('.heart').removeClass('heart');
        for (const heart of hearts){
            for (const [x, y] of heartShape){
                const px = heart.x + x;
                const py = heart.y + y;
                if (px >= 0 && px <= maxX && py >= 0 && py <= maxY){
                    $(`#p-${px}-${py}`).css('background-color', 'var(--primary)').addClass('heart');
                }
            }
        }
    }

    function resetHearts(){
        hearts.length = 0;
        for (const heart of initialHearts){
            hearts.push({ ...heart });
        }
    }

    // DECREMENTA VIDAS
    function loseLife(){
        if (gameOver || hearts.length === 0){
            return true;
        }

        hearts.pop();
        const hasNoLifeLeft = hearts.length === 0;

        if (!hasNoLifeLeft){
            playSound(dieSoundPath);
        }

        renderHearts();

        if (hasNoLifeLeft){
            endGame();
            return true;
        }

        return false;
    }

    // ================================================================================================
    // PONTUACAO
    // ================================================================================================

    function renderScore(){
        $('.score-pixel').css('background-color', 'var(--transparent)');
        $('.score-pixel').removeClass('score-pixel');

        const scoreText = String(Math.min(score, maxScore)).padStart(5, '0');

        for (let digitIndex = 0; digitIndex < scoreText.length; digitIndex++){
            const digit = scoreText[digitIndex];
            const shape = scoreDigits[digit];
            const offset = digitIndex * (scoreDigitWidth + scoreDigitSpacing);

            for (let y = 0; y < shape.length; y++){
                for (let x = 0; x < shape[y].length; x++){
                    if (shape[y][x] === "1"){
                        const px = scoreStartX + offset + x;
                        const py = scoreStartY + y;
                        if (px >= 0 && px <= maxX && py >= 0 && py <= maxY){
                            $(`#p-${px}-${py}`).css('background-color', 'var(--primary)').addClass('score-pixel');
                        }
                    }
                }
            }
        }
    }

    function renderLevel(){
        $('.level-pixel').css('background-color', 'var(--transparent)');
        $('.level-pixel').removeClass('level-pixel');
        renderPixelText(`LV. ${playerLevel}`, levelFont, levelStartX, levelStartY, levelLetterSpacing, 'level-pixel');
    }

    function addScore(points){
        score += points;
        renderScore();
    }

    // ================================================================================================
    // FIM DE JOGO
    // ================================================================================================

    function clearShip(){
        const offsets = [
            { x: lastOffsetX, y: lastOffsetY },
            { x: offsetX, y: offsetY }
        ];

        for (const offset of offsets){
            for (const [x, y] of shipPixels){
                const px = x + offset.x;
                const py = y + offset.y;
                if (px >= 0 && px <= maxX && py >= 0 && py <= maxY){
                    $(`#p-${px}-${py}`).css('background-color', 'var(--transparent)');
                }
            }
        }
    }

    function clearEnemies(){
        for (const enemy of enemies){
            for (const [dx, dy] of enemy.type.pixels){
                const x = enemy.x - dx;
                const y = enemy.y + dy;
                if (x >= 0 && x <= maxX && y >= 0 && y <= maxY){
                    $(`#p-${x}-${y}`).css('background-color', 'var(--transparent)');
                }
            }
        }
        enemies.length = 0;
    }

    function clearProjectilePixel(projectile){
        if (!projectile.drawnXs || projectile.drawnXs.length === 0) return;

        for (const x of projectile.drawnXs){
            if (x >= 0 && x <= maxX && projectile.y >= 0 && projectile.y <= maxY){
                $(`#p-${x}-${projectile.y}`).css('background-color', 'var(--transparent)').removeClass('projectile-pixel');
            }
        }

        projectile.drawnXs = [];
    }

    function removeProjectile(projectile){
        clearInterval(projectile.interval);
        clearProjectilePixel(projectile);

        const projectileIndex = projectiles.indexOf(projectile);
        if (projectileIndex >= 0){
            projectiles.splice(projectileIndex, 1);
        }
    }

    function clearProjectiles(){
        $('.projectile-pixel').css('background-color', 'var(--transparent)');
        $('.projectile-pixel').removeClass('projectile-pixel');

        for (const projectile of projectiles){
            clearInterval(projectile.interval);
            projectile.drawnXs = [];
        }

        projectiles.length = 0;
    }

    function getPixelTextWidth(text, font, letterSpacing){
        let width = 0;

        for (let i = 0; i < text.length; i++){
            width += font[text[i]][0].length;
            if (i < text.length - 1){
                width += letterSpacing;
            }
        }

        return width;
    }

    function renderPixelText(text, font, startX, startY, letterSpacing, className){
        let cursorX = startX;

        for (const char of text){
            const shape = font[char];

            for (let y = 0; y < shape.length; y++){
                for (let x = 0; x < shape[y].length; x++){
                    if (shape[y][x] === "1"){
                        const px = cursorX + x;
                        const py = startY + y;
                        if (px >= 0 && px <= maxX && py >= 0 && py <= maxY){
                            $(`#p-${px}-${py}`).css('background-color', 'var(--primary)').addClass(className);
                        }
                    }
                }
            }

            cursorX += shape[0].length + letterSpacing;
        }
    }

    function clearGameOver(){
        $('.game-over-pixel').css('background-color', 'var(--transparent)');
        $('.game-over-pixel').removeClass('game-over-pixel');
    }

    function renderGameOver(){
        clearGameOver();

        const titleWidth = getPixelTextWidth(gameOverText, gameOverFont, gameOverLetterSpacing);
        const titleHeight = gameOverFont.G.length;
        const restartLineHeight = restartFont.A.length;
        const restartBlockHeight = (restartLines.length * restartLineHeight) + ((restartLines.length - 1) * restartLineGap);
        const totalHeight = titleHeight + restartTitleGap + restartBlockHeight;
        const titleStartX = Math.floor(((maxX + 1) - titleWidth) / 2);
        const titleStartY = Math.floor(((maxY + 1) - totalHeight) / 2) + gameOverOffsetY;
        let restartStartY = titleStartY + titleHeight + restartTitleGap;

        renderPixelText(gameOverText, gameOverFont, titleStartX, titleStartY, gameOverLetterSpacing, 'game-over-pixel');

        for (const line of restartLines){
            const restartWidth = getPixelTextWidth(line, restartFont, restartLetterSpacing);
            const restartStartX = Math.floor(((maxX + 1) - restartWidth) / 2);

            renderPixelText(line, restartFont, restartStartX, restartStartY, restartLetterSpacing, 'game-over-pixel');
            restartStartY += restartLineHeight + restartLineGap;
        }
    }

    function endGame(){
        gameOver = true;
        stoped = true;
        stopMoving();
        stopTouchFire();
        clearProjectiles();
        clearEnemies();
        clearBoss();
        clearShip();
        playSound(gameOverSoundPath);
        renderGameOver();
    }

    function restartGame(){
        stopMoving();
        stopTouchFire();
        clearProjectiles();
        clearEnemies();
        clearBoss();
        clearShip();
        clearGameOver();

        gameOver = false;
        stoped = true;
        canFire = true;
        score = 0;
        gameElapsedTime = 0;
        playerLevel = 1;
        currentEnemyLevel = 0;
        enemyTypes = enemyTypeLevels[currentEnemyLevel];
        bgPosition = 0;
        offsetX = 0;
        offsetY = 22;
        lastOffsetX = offsetX;
        lastOffsetY = offsetY;

        $('.game').css('background-position', '0 0');
        resetHearts();
        renderShip();
        renderHearts();
        renderScore();
        renderLevel();
        scheduleEnemySpawns();
    }

    // ============================================
    // NAVE DO JOGADOR
    // ============================================


    // RENDERIZA A NAVE DO USUÁRIO
    function renderShip(){

        for (const [x, y] of shipPixels){
            const lastPx = x + lastOffsetX;
            const lastPy = y + lastOffsetY;
            if (lastPx >= 0 && lastPx <= maxX && lastPy >= 0 && lastPy <= maxY){
                $(`#p-${lastPx}-${lastPy}`).css('background-color', 'var(--transparent)');
            }
        }

        for (const [x, y] of shipPixels){
            const px = x + offsetX;
            const py = y + offsetY;
            if (px >= 0 && px <= maxX && py >= 0 && py <= maxY){
                $(`#p-${px}-${py}`).css('background-color', 'var(--primary)');
            }
        }

        lastOffsetX = offsetX;
        lastOffsetY = offsetY;
    }

    // ============================================
    // INIMIGOS
    // ============================================

    // POSIÇÃO E FORMATO
    const enemyTypeShapes = [
        {
            pixels: [
                [0, 0], [1, -1], [1, 0], [1, 1], [2, -1], [2, 1], [3, -1], [3, 1],
                [4, -2], [4, -1], [4, 1], [4, 2], [5, -2], [5, -1], [5, 1], [5, 2], [6, -1], [6, 1], [7, 0]
            ],
            start: 0,           // Tempo para aparecer na tela
            hp: 1,              // Quantidade de tiros suportados
            points: 1           // Pontos ao destruir
        },
        {
            pixels: [
                [0, 0], [1, -1], [1, 0], [1, 1], [2, -2], [2, -1], [2, 0], [2, 1], [2, 2], [3, -3],
                [3, -1], [3, 1], [3, 3], [4, -2], [4, 0], [4, 2]
            ],
            start: 10000,       // Tempo para aparecer na tela
            hp: 2,              // Quantidade de tiros suportados
            points: 2           // Pontos ao destruir
        },
        {
            pixels: [
                [0, -3], [0, -1], [0, 0], [0, 1], [0, 3], [1, -2], [1, 2], [2, -3], [2, -1], [2, 1],
                [2, 3], [3, -3], [3, -2], [3, 0], [3, 2], [3, 3], [4, -2], [4, -1], [4, 0], [4, 1],
                [4, 2], [5, -3], [5, -1], [5, 0], [5, 1], [5, 3]
            ],
            start: 20000,       // Tempo para aparecer na tela
            hp: 5,              // Quantidade de tiros suportados
            points: 5           // Pontos ao destruir
        }
    ];

    const enemyDifficultySettings = [
        [
            { interval: 2500, speed: 2 },
            { interval: 5000, speed: 3 },
            { interval: 10000, speed: 4 }
        ],
        [
            { interval: 1800, speed: 1 },
            { interval: 3500, speed: 2 },
            { interval: 7500, speed: 3 }
        ],
        [
            { interval: 1200, speed: 1 },
            { interval: 2500, speed: 1 },
            { interval: 5000, speed: 2 }
        ]
    ];

    const enemyTypeLevels = enemyDifficultySettings.map((settings) => (
        enemyTypeShapes.map((type, index) => ({
            ...type,
            interval: settings[index].interval,
            speed: settings[index].speed
        }))
    ));

    const enemyCycleDuration = difficultyLevelDuration * enemyTypeLevels.length;
    let currentEnemyLevel = 0;
    let enemyTypes = enemyTypeLevels[currentEnemyLevel];

    // Array para inimigos
    const enemies = [];
    const enemySpawnMargin = 1;
    let nextEnemySpawnTimes = [];

    // Verifica se é possivel gerar um novo inimigo sem sobreopor em outro já existente
    function canSpawnAt(type, x, y){
        for (const enemy of enemies){
            for (const [dx1, dy1] of enemy.type.pixels){
                const ex1 = enemy.x - dx1;
                const ey1 = enemy.y + dy1;
                for (const [dx2, dy2] of type.pixels){
                    const ex2 = x - dx2;
                    const ey2 = y + dy2;
                    const isTooClose = Math.abs(ex1 - ex2) <= enemySpawnMargin && Math.abs(ey1 - ey2) <= enemySpawnMargin;
                    if (isTooClose){
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Cria um novo inimigo do tipo informado, tentando evitar a sobreoposição
    function spawnEnemy(type, typeIndex){
        if (gameOver) return;

        const rightmostOffset = Math.max(...type.pixels.map(([dx]) => dx));
        const baseX = maxX + 1 + rightmostOffset;
        for (let attempts = 0; attempts < 5; attempts++){
            const baseY = Math.floor(Math.random() * (maxSpawnY - minSpawnY + 1)) + minSpawnY;
            if (canSpawnAt(type, baseX, baseY)){
                const enemy = {
                    type,
                    typeIndex,
                    x: baseX,
                    y: baseY,
                    hp: type.hp,
                    counter: 0
                };
                enemies.push(enemy);
                break;
            }
        }
    }

    function scheduleEnemySpawns(){
        nextEnemySpawnTimes = enemyTypes.map((type) => type.start + type.interval);
    }

    function updateEnemySpawns(){
        for (let i = 0; i < enemyTypes.length; i++){
            const type = enemyTypes[i];
            if (gameElapsedTime < type.start){
                continue;
            }

            if (nextEnemySpawnTimes[i] === undefined){
                nextEnemySpawnTimes[i] = Math.max(gameElapsedTime, type.start) + type.interval;
            }

            while (gameElapsedTime >= nextEnemySpawnTimes[i]){
                spawnEnemy(type, i);
                nextEnemySpawnTimes[i] += type.interval;
            }
        }
    }

    function setEnemyLevel(levelIndex){
        currentEnemyLevel = levelIndex;
        enemyTypes = enemyTypeLevels[currentEnemyLevel];
        nextEnemySpawnTimes = enemyTypes.map((type) => Math.max(gameElapsedTime, type.start) + type.interval);

        for (const enemy of enemies){
            if (enemy.typeIndex !== undefined){
                enemy.type = enemyTypes[enemy.typeIndex];
            }
        }
    }

    function updateEnemyDifficulty(){
        const nextEnemyLevel = Math.min(Math.floor(gameElapsedTime / difficultyLevelDuration), enemyTypeLevels.length - 1);
        if (nextEnemyLevel !== currentEnemyLevel){
            setEnemyLevel(nextEnemyLevel);
        }
    }

    // Desenha o inimigo na tela
    function renderEnemies(){
        if (gameOver) return;

        for (const enemy of enemies){
            for (const [dx, dy] of enemy.type.pixels){
                const x = enemy.x - dx;
                const y = enemy.y + dy;
                if (x >= 0 && x <= maxX && y >= 0 && y <= maxY){
                    $(`#p-${x}-${y}`).css('background-color', 'var(--primary)');
                }
            }
        }
    }

    function enemyPassedLeftSide(enemy){
        return enemy.type.pixels.every(([dx]) => enemy.x - dx < 0);
    }

    function resetPlayerPosition(){
        offsetX = 0;
        offsetY = 22;
        renderShip();
    }

    // Atualiza inimigos
    function updateEnemies(){
        if (gameOver) return;

        //Apaga inimigos da posição antiga e move-o para a esquerda de acordo com a velocidade
        for (const enemy of enemies){ 
            for (const [dx, dy] of enemy.type.pixels){
                const x = enemy.x - dx;
                const y = enemy.y + dy;
                if (x >= 0 && x <= maxX && y >= 0 && y <= maxY){
                    $(`#p-${x}-${y}`).css('background-color', 'var(--transparent)');
                }
            }

            enemy.counter++;                                 
            if (enemy.counter >= enemy.type.speed){
                enemy.x--;
                enemy.counter = 0;
            }
        }

        for (let i = enemies.length - 1; i >= 0; i--){
            if (enemyPassedLeftSide(enemies[i])){
                enemies.splice(i, 1);
            }
        }

        // Verifica colisão com a nave do jogador
        for (let i = enemies.length - 1; i >= 0; i--){
            const enemy = enemies[i];
            for (const [dx, dy] of enemy.type.pixels){
                const x = enemy.x - dx;
                const y = enemy.y + dy;
                for (const [sx, sy] of shipPixels){
                    if (x === sx + offsetX && y === sy + offsetY){
                        
                        // Perde uma vida
                        const hasGameOver = loseLife();
                        clearProjectiles();
                        clearEnemies();

                        if (hasGameOver){
                            return;
                        }

                        // Resetar posição da nave
                        resetPlayerPosition();
                        scheduleEnemySpawns();

                        return; // Sai da verificação após colisão
                    }
                }
            }
        }
    }

    // ============================================
    // BOSS
    // ============================================

    const bossShape = [
        "000001111100000",
        "000111111111000",
        "001111111111100",
        "011111111111110",
        "111101111011111",
        "111000111000111",
        "111101111011111",
        "111111111111111",
        "111111111111111",
        "111110000111111",
        "111111001111111",
        "011111111111110",
        "001111111111100",
        "000111111111000",
        "000001111100000"
    ];
    const bossPixels = [];
    for (let y = 0; y < bossShape.length; y++){
        for (let x = 0; x < bossShape[y].length; x++){
            if (bossShape[y][x] === "1"){
                bossPixels.push([x, y]);
            }
        }
    }
    const bossWidth = bossShape[0].length;
    const bossHeight = bossShape.length;
    const bossTargetX = maxX - bossWidth - 4;
    const bossMinY = 10;
    const bossMaxY = maxY - bossHeight;
    const bossMoveSpeed = 1;
    const minBossShotInterval = 350;
    const minBossProjectileSpeed = 12;
    const bossCannonPixels = [
        [-3, 7],
        [-2, 7],
        [-1, 7]
    ];
    const bossCannonTip = bossCannonPixels[0];
    const bossLeftmostOffsetX = Math.min(...bossPixels.concat(bossCannonPixels).map(([x]) => x));
    const bossSpawnX = maxX + 1 - bossLeftmostOffsetX;

    let boss = null;
    let bossHitsTaken = 0;
    let bossShotTimer = null;
    const bossProjectiles = [];

    function createBoss(){
        return {
            x: bossSpawnX,
            y: Math.floor((bossMinY + bossMaxY) / 2),
            hp: bossBaseHp + ((playerLevel - 1) * bossHpIncrease),
            directionY: 1,
            entering: true
        };
    }

    function getBossPowerMultiplier(){
        return 1 + ((playerLevel - 1) * bossPowerIncrease);
    }

    function getBossShotInterval(){
        return Math.max(minBossShotInterval, Math.round(bossBaseShotInterval / getBossPowerMultiplier()));
    }

    function getBossProjectileSpeed(){
        return Math.max(minBossProjectileSpeed, Math.round(bossBaseProjectileSpeed / getBossPowerMultiplier()));
    }

    function clearBossShotTimer(){
        clearInterval(bossShotTimer);
        bossShotTimer = null;
    }

    function clearBossProjectilePixel(projectile){
        if (!projectile.drawnXs || projectile.drawnXs.length === 0) return;

        for (const x of projectile.drawnXs){
            if (x >= 0 && x <= maxX && projectile.y >= 0 && projectile.y <= maxY){
                $(`#p-${x}-${projectile.y}`).css('background-color', 'var(--transparent)').removeClass('boss-projectile');
            }
        }

        projectile.drawnXs = [];
    }

    function removeBossProjectile(projectile){
        clearInterval(projectile.interval);
        clearBossProjectilePixel(projectile);

        const projectileIndex = bossProjectiles.indexOf(projectile);
        if (projectileIndex >= 0){
            bossProjectiles.splice(projectileIndex, 1);
        }
    }

    function clearBossProjectiles(){
        $('.boss-projectile').css('background-color', 'var(--transparent)');
        $('.boss-projectile').removeClass('boss-projectile');
        while (bossProjectiles.length > 0){
            const projectile = bossProjectiles[0];
            clearInterval(projectile.interval);
            projectile.drawnXs = [];
            bossProjectiles.shift();
        }
    }

    function clearBoss(){
        clearBossShotTimer();
        clearBossProjectiles();
        $('.boss-pixel').css('background-color', 'var(--transparent)');
        $('.boss-pixel').removeClass('boss-pixel');
        boss = null;
    }

    function getBossPixelPositions(){
        if (!boss) return [];

        return bossPixels.concat(bossCannonPixels).map(([x, y]) => ({
            x: boss.x + x,
            y: boss.y + y
        }));
    }

    function renderBoss(){
        if (!boss || gameOver) return;

        for (const pixel of getBossPixelPositions()){
            if (pixel.x >= 0 && pixel.x <= maxX && pixel.y >= 0 && pixel.y <= maxY){
                $(`#p-${pixel.x}-${pixel.y}`).css('background-color', 'var(--primary)').addClass('boss-pixel');
            }
        }
    }

    function updateBoss(){
        if (!boss || gameOver) return;

        $('.boss-pixel').css('background-color', 'var(--transparent)');
        $('.boss-pixel').removeClass('boss-pixel');

        if (boss.entering){
            boss.x--;

            if (boss.x <= bossTargetX){
                boss.x = bossTargetX;
                boss.entering = false;
                startBossShooting();
            }

            return;
        }

        boss.y += boss.directionY * bossMoveSpeed;

        if (boss.y <= bossMinY){
            boss.y = bossMinY;
            boss.directionY = 1;
        } else if (boss.y >= bossMaxY){
            boss.y = bossMaxY;
            boss.directionY = -1;
        }
    }

    function projectileHitsPlayer(projectile){
        return shipPixels.some(([x, y]) => (
            projectile.x === x + offsetX && projectile.y === y + offsetY
        ));
    }

    function restartCurrentBossAttempt(){
        clearProjectiles();
        clearBossProjectiles();
        bossHitsTaken = 0;
        resetPlayerPosition();
    }

    function handleBossProjectileHit(projectile){
        bossHitsTaken++;
        removeBossProjectile(projectile);

        if (bossHitsTaken < bossMaxHitsBeforeLifeLoss){
            return;
        }

        const hasGameOver = loseLife();
        if (hasGameOver){
            return;
        }

        restartCurrentBossAttempt();
    }

    function fireBossProjectile(){
        if (!boss || boss.entering || stoped || gameOver) return;

        const projectile = {
            x: boss.x + bossCannonTip[0] - 1,
            y: boss.y + bossCannonTip[1],
            drawnXs: [],
            interval: null
        };

        projectile.interval = setInterval(() => {
            if (gameOver || !boss){
                removeBossProjectile(projectile);
                return;
            }

            if (stoped){
                return;
            }

            clearBossProjectilePixel(projectile);
            projectile.x--;

            if (projectileHitsPlayer(projectile)){
                handleBossProjectileHit(projectile);
                return;
            }

            if (projectile.x < 0){
                removeBossProjectile(projectile);
                return;
            }

            for (const x of [projectile.x, projectile.x + 1]){
                if (x >= 0 && x <= maxX && projectile.y >= 0 && projectile.y <= maxY){
                    $(`#p-${x}-${projectile.y}`).css('background-color', 'var(--primary)').addClass('boss-projectile');
                    projectile.drawnXs.push(x);
                }
            }
        }, getBossProjectileSpeed());

        bossProjectiles.push(projectile);
    }

    function startBossShooting(){
        clearBossShotTimer();
        bossShotTimer = setInterval(() => {
            fireBossProjectile();
        }, getBossShotInterval());
    }

    function startBossPhase(){
        nextEnemySpawnTimes = [];
        bossHitsTaken = 0;
        boss = createBoss();
        renderBoss();
    }

    function restartEnemyCycle(){
        gameElapsedTime = 0;
        setEnemyLevel(0);
        scheduleEnemySpawns();
    }

    function defeatBoss(){
        clearBoss();
        playerLevel++;
        renderLevel();
        restartEnemyCycle();
    }

    function projectileHitsBoss(projectile){
        return boss && getBossPixelPositions().some((pixel) => (
            projectile.x === pixel.x && projectile.y === pixel.y
        ));
    }

    // ============================================
    // PROJÉTEIS
    // ============================================

    const projectiles = [];

    function fireProjectile(){
        if (stoped || gameOver) return; // bloqueia tiro se pausado ou encerrado

        const originX = offsetX + 12;
        const originY = offsetY + 3;

        playSound(fireSoundPath);

        const projectile = {
            x: originX,
            y: originY,
            drawnXs: [],
            interval: null
        };

        projectile.interval = setInterval(() => {
            if (gameOver){
                removeProjectile(projectile);
                return;
            }

            if (stoped){
                return;
            }

            clearProjectilePixel(projectile);
            projectile.x++;

            if (projectileHitsBoss(projectile)){
                boss.hp--;

                if (boss.hp <= 0){
                    defeatBoss();
                }

                removeProjectile(projectile);
                return;
            }

            for (let i = enemies.length - 1; i >= 0; i--){
                const enemy = enemies[i];
                for (const [dx, dy] of enemy.type.pixels){
                    const ex = enemy.x - dx;
                    const ey = enemy.y + dy;
                    if (projectile.x === ex && projectile.y === ey){
                        enemy.hp--;
                        if (enemy.hp <= 0){
                            for (const [cx, cy] of enemy.type.pixels){
                                const px = enemy.x - cx;
                                const py = enemy.y + cy;
                                $(`#p-${px}-${py}`).css('background-color', 'var(--transparent)');
                            }
                            addScore(enemy.type.points);
                            enemies.splice(i, 1);
                        }
                        removeProjectile(projectile);
                        return;
                    }
                }
            }

            if (projectile.x > maxX){
                removeProjectile(projectile);
                return;
            }

            for (const x of [projectile.x, projectile.x - 1]){
                if (x >= 0 && x <= maxX && projectile.y >= 0 && projectile.y <= maxY){
                    $(`#p-${x}-${projectile.y}`).css('background-color', 'var(--primary)').addClass('projectile-pixel');
                    projectile.drawnXs.push(x);
                }
            }
        }, projectileSpeed);

        projectiles.push(projectile);
    }

    // ============================================
    // MOVIMENTO
    // ============================================

    let moveInterval = null;
    let currentDirection = null;

    function startMoving(direction){
        if (moveInterval || stoped || gameOver) return;

        currentDirection = direction;
        moveInterval = setInterval(() => {
            if (direction === "ArrowUp" && offsetY > 10) offsetY--;
            else if (direction === "ArrowDown" && offsetY + 6 < maxY) offsetY++;
            else if (direction === "ArrowLeft" && offsetX > 0) offsetX--;
            else if (direction === "ArrowRight" && offsetX + 12 < maxX) offsetX++;

            renderShip();
        }, 30);
    }

    function stopMoving(){
        clearInterval(moveInterval);
        moveInterval = null;
        currentDirection = null;
    }

    // ============================================
    // EVENTOS DE TECLADO
    // ============================================

    const directions = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    let touchFireInterval = null;

    function togglePause(){
        if (gameOver){
            restartGame();
            return;
        }

        stoped = !stoped;
        if (stoped){
            stopMoving();
            console.log("Jogo pausado");
        } else {
            console.log("Jogo iniciado");
        }
    }

    function triggerFire(){
        if (canFire && !stoped && !gameOver){
            fireProjectile();
            canFire = false;
            setTimeout(() => canFire = true, fireCooldown);
        }
    }

    function pressDirection(direction){
        if (!directions.includes(direction) || stoped || gameOver) return;

        if (currentDirection !== direction){
            stopMoving();
            startMoving(direction);
        }
    }

    function releaseDirection(direction){
        if (direction === currentDirection){
            stopMoving();
        }
    }

    function startTouchFire(){
        clearInterval(touchFireInterval);
        triggerFire();
        touchFireInterval = setInterval(triggerFire, fireCooldown);
    }

    function stopTouchFire(){
        clearInterval(touchFireInterval);
        touchFireInterval = null;
    }

    $(document).on("keydown", function (e){
        if (gameOver){
            if (e.key.toLowerCase() === "r"){
                e.preventDefault();
                restartGame();
                return;
            }

            if (directions.includes(e.key) || e.key === " "){
                e.preventDefault();
            }
            return;
        }

        if (directions.includes(e.key)){
            e.preventDefault();
            pressDirection(e.key);
        }

        if (e.key.toLowerCase() === "f"){
            triggerFire();
        }

        if (e.key === " "){
            e.preventDefault();
            togglePause();
        }
    });

    $(document).on("keyup", function (e){
        releaseDirection(e.key);
    });

    $('.touch-button').on('contextmenu', function (e){
        e.preventDefault();
    });

    $('.touch-button').on('pointerdown', function (e){
        e.preventDefault();

        this.setPointerCapture?.(e.originalEvent.pointerId);
        $(this).addClass('is-pressed');

        const direction = $(this).data('touch-direction');
        const action = $(this).data('touch-action');

        if (direction){
            pressDirection(direction);
        } else if (action === "fire"){
            startTouchFire();
        } else if (action === "pause"){
            togglePause();
        }
    });

    $('.touch-button').on('pointerup pointercancel pointerleave', function (e){
        e.preventDefault();
        $(this).removeClass('is-pressed');

        const direction = $(this).data('touch-direction');
        const action = $(this).data('touch-action');

        if (direction){
            releaseDirection(direction);
        } else if (action === "fire"){
            stopTouchFire();
        }
    });

    // ============================================
    // INICIALIZAÇÃO
    // ============================================

    renderShip();
    renderHearts();
    renderScore();
    renderLevel();
    animateBackground();

    setInterval(() => {
        if (!stoped && !gameOver){
            if (!boss){
                gameElapsedTime += gameUpdateInterval;

                if (gameElapsedTime >= enemyCycleDuration){
                    startBossPhase();
                } else {
                    updateEnemyDifficulty();
                    updateEnemySpawns();
                }
            }

            if (boss){
                updateBoss();
            }

            updateEnemies();
            renderEnemies();

            if (boss){
                renderBoss();
            }
        }
    }, gameUpdateInterval);

    scheduleEnemySpawns();
});
