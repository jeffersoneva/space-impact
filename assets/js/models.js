$(document).ready(function (){

    // ================================================================================================
    // CONFIGURAÇÕES GERAIS
    // ================================================================================================

    const maxX = 83;                             // Limite máximo de movimento horizontal
    const maxY = 46;                             // Limite máximo de movimento vertical
    const projectileSpeed = 30;                  // Velocidade do projétil da minha arma
    const fireCooldown = 125;                    // Cadencia de tiros em millesegundos
    const minSpawnY = 12;                        // limite vertical inferior mínimo para inimigos
    const maxSpawnY = 40;                        // limite vertical inferior máximo para inimigos
    let bgPosition = 0;                          // Posição inicial da imagem de fundo
    let stoped = true;                           // Jogo começa pausado
    let gameOver = false;                        // Bloqueia novas acoes apos o fim do jogo
    let canFire = true;                          // Intervalo de disparos
    let lifes = 3;                               // Quantidades iniciais de vidas
    let score = 0;                               // Pontuacao do jogador

    // ================================================================================================
    // ANIMAÇÃO BACKGROUND
    // ================================================================================================

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
    const scoreStartX = 66;
    const scoreStartY = 2;
    const scoreDigitSpacing = 1;
    const scoreDigitWidth = 3;
    const maxScore = 9999;
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

    // TEXTO DE GAME OVER
    const gameOverText = "GAME OVER";
    const restartLines = ["APERTE R PARA", "REINICIAR"];
    const gameOverLetterSpacing = 1;
    const restartLetterSpacing = 1;
    const restartTitleGap = 4;
    const restartLineGap = 1;
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
        renderHearts();

        if (hearts.length === 0){
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

        const scoreText = String(Math.min(score, maxScore)).padStart(4, '0');

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

    function clearProjectiles(){
        for (const projectile of projectiles){
            clearInterval(projectile.interval);
            for (const x of [projectile.x - 1, projectile.x]){
                if (x >= 0 && x <= maxX && projectile.y >= 0 && projectile.y <= maxY){
                    $(`#p-${x}-${projectile.y}`).css('background-color', 'var(--transparent)');
                }
            }
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
        const titleStartY = Math.floor(((maxY + 1) - totalHeight) / 2);
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
        clearEnemySpawnTimers();
        clearProjectiles();
        clearEnemies();
        clearShip();
        renderGameOver();
    }

    function restartGame(){
        stopMoving();
        clearProjectiles();
        clearEnemies();
        clearShip();
        clearGameOver();

        gameOver = false;
        stoped = false;
        canFire = true;
        lifes = 3;
        score = 0;
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
    const enemyTypes = [
        {
            pixels: [
                [0, 0], [1, -1], [1, 0], [1, 1], [2, -1], [2, 1], [3, -1], [3, 1],
                [4, -2], [4, -1], [4, 1], [4, 2], [5, -2], [5, -1], [5, 1], [5, 2], [6, -1], [6, 1], [7, 0]
            ],
            start: 2,           // Tempo para aparecer na tela
            interval: 1000,     // Intervalo entre uma nave e outra
            hp: 1,              // Quantidade de tiros suportados
            points: 1,          // Pontos ao destruir
            speed: 4            // Velocidade de movimento
        },
        {
            pixels: [
                [0, 0], [1, -1], [1, 0], [1, 1], [2, -2], [2, -1], [2, 0], [2, 1], [2, 2], [3, -3],
                [3, -1], [3, 1], [3, 3], [4, -2], [4, 0], [4, 2]
            ],
            start: 15000,       // Tempo para aparecer na tela
            interval: 3000,     // Intervalo entre uma nave e outra
            hp: 2,              // Quantidade de tiros suportados
            points: 2,          // Pontos ao destruir
            speed: 3            // Velocidade de movimento
        },
        {
            pixels: [
                [0, -3], [0, -1], [0, 0], [0, 1], [0, 3], [1, -2], [1, 2], [2, -3], [2, -1], [2, 1],
                [2, 3], [3, -3], [3, -2], [3, 0], [3, 2], [3, 3], [4, -2], [4, -1], [4, 0], [4, 1],
                [4, 2], [5, -3], [5, -1], [5, 0], [5, 1], [5, 3]
            ],
            start: 30000,       // Tempo para aparecer na tela
            interval: 10000,    // Intervalo entre uma nave e outra
            hp: 5,              // Quantidade de tiros suportados
            points: 5,          // Pontos ao destruir
            speed: 2            // Velocidade de movimento
        }
    ];

    // Array para inimigos
    const enemies = [];
    const enemySpawnTimers = [];

    // Verifica se é possivel gerar um novo inimigo sem sobreopor em outro já existente
    function canSpawnAt(type, x, y){
        for (const enemy of enemies){
            for (const [dx1, dy1] of enemy.type.pixels){
                const ex1 = enemy.x - dx1;
                const ey1 = enemy.y + dy1;
                for (const [dx2, dy2] of type.pixels){
                    const ex2 = x - dx2;
                    const ey2 = y + dy2;
                    if (ex1 === ex2 && ey1 === ey2){
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Cria um novo inimigo do tipo informado, tentando evitar a sobreoposição
    function spawnEnemy(type){
        if (gameOver) return;

        const baseX = maxX;
        for (let attempts = 0; attempts < 5; attempts++){
            const baseY = Math.floor(Math.random() * (maxSpawnY - minSpawnY + 1)) + minSpawnY;
            if (canSpawnAt(type, baseX, baseY)){
                const enemy = {
                    type,
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

    function clearEnemySpawnTimers(){
        for (const timer of enemySpawnTimers){
            clearTimeout(timer);
            clearInterval(timer);
        }
        enemySpawnTimers.length = 0;
    }

    function scheduleEnemySpawns(){
        clearEnemySpawnTimers();

        for (const type of enemyTypes){
            const startTimer = setTimeout(() => {
                const intervalTimer = setInterval(() => {
                    if (!stoped && !gameOver) spawnEnemy(type);
                }, type.interval);
                enemySpawnTimers.push(intervalTimer);
            }, type.start);

            enemySpawnTimers.push(startTimer);
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
                        clearEnemies();

                        if (hasGameOver){
                            return;
                        }

                        // Resetar posição da nave
                        offsetX = 0;
                        offsetY = 22;
                        renderShip();

                        return; // Sai da verificação após colisão
                    }
                }
            }
        }
    }

    // ============================================
    // PROJÉTEIS
    // ============================================

    const projectiles = [];

    function fireProjectile(){
        if (stoped || gameOver) return; // bloqueia tiro se pausado ou encerrado

        const originX = offsetX + 12;
        const originY = offsetY + 3;

        const audio = new Audio('./assets/sounds/fire.wav');
        audio.play();

        const projectile = {
            x: originX,
            y: originY,
            interval: null
        };

        projectile.interval = setInterval(() => {
            if (gameOver){
                clearInterval(projectile.interval);
                return;
            }

            $(`#p-${projectile.x}-${projectile.y}`).css('background-color', 'var(--transparent)');
            projectile.x++;

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
                        clearInterval(projectile.interval);
                        return;
                    }
                }
            }

            if (projectile.x > maxX){
                clearInterval(projectile.interval);
                return;
            }

            $(`#p-${projectile.x}-${projectile.y}`).css('background-color', 'var(--primary)');
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

    $(document).on("keydown", function (e){
        const directions = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

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
            if (currentDirection !== e.key && !stoped){
                stopMoving();
                startMoving(e.key);
            }
        }

        if (e.key.toLowerCase() === "f"){
            if (canFire && !stoped){
                fireProjectile();
                canFire = false;
                setTimeout(() => canFire = true, fireCooldown);
            }
        }

        if (e.key === " "){
            e.preventDefault();
            stoped = !stoped;
            if (stoped){
                stopMoving();
                console.log("Jogo pausado");
            } else {
                console.log("Jogo iniciado");
            }
        }
    });

    $(document).on("keyup", function (e){
        if (e.key === currentDirection){
            stopMoving();
        }
    });

    // ============================================
    // INICIALIZAÇÃO
    // ============================================

    renderShip();
    renderHearts();
    renderScore();
    animateBackground();

    setInterval(() => {
        if (!stoped && !gameOver){
            updateEnemies();
            renderEnemies();
        }
    }, 200);

    scheduleEnemySpawns();
});
