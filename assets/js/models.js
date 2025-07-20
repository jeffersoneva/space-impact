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
    const returnmsg = $("#msg-game")             // Elemento que exibirá mensagens ao jogador
    let bgPosition = 0;                          // Posição inicial da imagem de fundo
    let stoped = true;                           // Jogo começa pausado
    let canFire = true;                          // Intervalo de disparos
    let lifes = 3;                               // Quantidades iniciais de vidas

    // ================================================================================================
    // ANIMAÇÃO BACKGROUND
    // ================================================================================================

    function animateBackground(){
        if (!stoped){
            bgPosition -= 0.3; // velocidade lenta
            $('.bg-game').css('background-position', `${bgPosition}px 0`);
        }
        requestAnimationFrame(animateBackground);
    }

    // ================================================================================================
    // TEXTO INICIAL DA MENSAGEM
    // ================================================================================================

    returnmsg.text("Precione ESPAÇO para iniciar/pausar.")

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
    const hearts = [
        { x: 2, y: 2 },
        { x: 8, y: 2 },
        { x: 14, y: 2 }
    ];

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

    // DECREMENTA VIDAS
    function loseLife(){
        hearts.pop();
        renderHearts();
        if (hearts.length === 0){
            stoped = true;
            returnmsg.text('GAME OVER');
        }
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
            interval: 2000,     // Intervalo entre uma nave e outra
            hp: 1,              // Quantidade de tiros suportados
            speed: 4            // Velocidade de movimento
        },
        {
            pixels: [
                [0, 0], [1, -1], [1, 0], [1, 1], [2, -2], [2, -1], [2, 0], [2, 1], [2, 2], [3, -3],
                [3, -1], [3, 1], [3, 3], [4, -2], [4, 0], [4, 2]
            ],
            start: 15000,       // Tempo para aparecer na tela
            interval: 6000,     // Intervalo entre uma nave e outra
            hp: 2,              // Quantidade de tiros suportados
            speed: 3            // Velocidade de movimento
        },
        {
            pixels: [
                [0, -3], [0, -1], [0, 0], [0, 1], [0, 3], [1, -2], [1, 2], [2, -3], [2, -1], [2, 1],
                [2, 3], [3, -3], [3, -2], [3, 0], [3, 2], [3, 3], [4, -2], [4, -1], [4, 0], [4, 1],
                [4, 2], [5, -3], [5, -1], [5, 0], [5, 1], [5, 3]
            ],
            start: 30000,       // Tempo para aparecer na tela
            interval: 20000,    // Intervalo entre uma nave e outra
            hp: 5,              // Quantidade de tiros suportados
            speed: 2            // Velocidade de movimento
        }
    ];

    // Array para inimigos
    const enemies = [];

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

    // Desenha o inimigo na tela
    function renderEnemies(){
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
                        loseLife();
                        
                        // Remove todos os inimigos da tela
                        for (const rem of enemies){
                            for (const [dx, dy] of rem.type.pixels){
                                const rx = rem.x - dx;
                                const ry = rem.y + dy;
                                if (rx >= 0 && rx <= maxX && ry >= 0 && ry <= maxY){
                                    $(`#p-${rx}-${ry}`).css('background-color', 'var(--transparent)');
                                }
                            }
                        }
                        enemies.length = 0; // limpa array

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
        if (stoped) return; // bloqueia tiro se pausado

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
        if (moveInterval || stoped) return;

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
    animateBackground();

    setInterval(() => {
        if (!stoped){
            updateEnemies();
            renderEnemies();
        }
    }, 200);

    for (const type of enemyTypes){
        setTimeout(() => {
            setInterval(() => {
                if (!stoped) spawnEnemy(type);
            }, type.interval);
        }, type.start);
    }
});
