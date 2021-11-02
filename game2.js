// INITIALISATION DU CANVAS ET DÉFINITION DU CONTEXT
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.style.border = "1px solid #6198d8";
ctx.lineheight = 1;

// CONSTANTE NÉCESSAIRES
const PADDLE_WIDTH = 200;
const PADDLE_MARGIN_BOTTOM = 20;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 10;
const SCORE_UNIT = 9;
const MAX_LEVEL = 6;
const MAX_LIFE = 3;

// VARIABLES NECESSAIRES
let touch_q = false;
let touch_s = false;
let gameOver = false; /* Variable qui indique que le jeu est en marche*/
let isPaused = false;
let life = 3;
let score = 0;
let level = 1;
let score_count = 0;
let level_count = 0;

// IMPORTATION DES ÉLÉMENTS DU DOM
const game_over = document.getElementById('game-over');
const youWon = document.getElementById('you-won');
const youLose = document.getElementById('you-lose');
const sound = document.getElementById('sound');
const citations = document.getElementById('citation');

// IMPORTATION DE L'ÉLÉMENT HTML DU JOUEUR
var nickname = document.getElementById('nickname');
var score_max = document.getElementById('score_max');
var level_max = document.getElementById('level_max');

// PROPRIÉTÉS DE LA RAQUETTE
const paddle = {
    x: (canvas.width / 2) - (PADDLE_WIDTH / 2),
    y: canvas.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    w: PADDLE_WIDTH,
    h: PADDLE_MARGIN_BOTTOM,
    dx: 8
};

//  PROPRIÉTÉ DE LA BALLE
const ball = {
    x: canvas.width / 2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    velocity: 7,
    dx: 3 * (Math.random() * 2 - 1),
    dy: -1
};

// PROPRIÉTÉS DES BRIQUES
const brickProp = {
    row: 3,
    column: 13,
    w: 55,
    h: 35,
    padding: 1,
    offsetX: 0,
    offsetY: 40,
    fillColor: '#fff',
    visible: true,

}

// CRÉATION DE TOUTES LES BRIQUES
let bricks = [];

function createBricks() {
    for (let r = 0; r < brickProp.row; r++) {
        bricks[r] = [];
        for (let c = 0; c < brickProp.column; c++) {
            bricks[r][c] = {
                x: c * (brickProp.w + brickProp.padding) + brickProp.offsetX,
                y: r * (brickProp.h + brickProp.padding) + brickProp.offsetY,
                status: true,
                ...brickProp
            }
        }
    }
}
createBricks();

// DESSINER LES BRIQUES
function drawBricks() {
    bricks.forEach(column => {
        column.forEach(bricks => {
            if (bricks.status) {
                ctx.beginPath();
                ctx.rect(bricks.x, bricks.y, bricks.w, bricks.h);
                ctx.fillStyle = bricks.fillColor;
                ctx.fill();
                ctx.closePath();
            }
        })
    })
}

// DESSINER LA RAQUETTE
function drawPaddle() {
    ctx.beginPath();
    ctx.fillStyle = '#B5B4B4';
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.strokeStyle = '#B5B4B4';
    ctx.strokeRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.closePath();
};

//  DESSINER LA BALLE
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.strokeStyle = 'yellow'
    ctx.stroke();
    ctx.closePath();
};

// COLLISION BALLE - BRIQUE
function bbCollision() {
    bricks.forEach(column => {
        column.forEach(bricks => {
            if (bricks.status) {
                if (ball.x + ball.radius > bricks.x &&
                    ball.x - ball.radius < bricks.x + bricks.w &&
                    ball.y + ball.radius > bricks.y &&
                    ball.y - ball.radius < bricks.y + bricks.h) {

                    BRICK_HIT.play();
                    ball.dy *= -1;
                    bricks.status = false;
                    score += SCORE_UNIT;
                }
            }
        })
    })
}

// INTÉRACTION BALLE - MUR
function bwCollision() {
    // Collision sur les axes X
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        WALL_HIT.play();
        ball.dx *= -1;
    }
    // Collision sur l'axe supérieur
    if (ball.y - ball.radius < 0) {
        WALL_HIT.play();
        ball.dy *= -1;
    }
    // Collision entrainant une perte de vie
    if (ball.y + ball.radius > canvas.height) {
        LIFE_LOST.play();
        life--;
        resetBall();
        resetPaddle();
    }
};

// INTÉRACTION BALLE - RAQUETTE
function bpCollision() {
    if (ball.x + ball.radius > paddle.x &&
        ball.x - ball.radius < paddle.x + paddle.w &&
        ball.y + ball.radius > paddle.y) {
        PADDLE_HIT.play();

        let collidePoint = ball.x - (paddle.x + paddle.w / 2);
        collidePoint = collidePoint / (paddle.w / 2);

        let angle = collidePoint * Math.PI / 3;

        ball.dx = ball.velocity * Math.sin(angle);
        ball.dy = -ball.velocity * Math.cos(angle);
    }
};

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
};

// MISE EN PLACE DES TOUCHES DE CONTROLES DE LA RAQUETTE
document.addEventListener('keydown', function(f) {
    if (f.key === 'q') {
        touch_q = true;
    } else if (f.key === 's') {
        touch_s = true;
    }
});

document.addEventListener('keyup', function(f) {
    if (f.key === 'q') {
        touch_q = false;
    } else if (f.key === 's') {
        touch_s = false;
    }
});

// ON CRÉE LA FONCTION POUR FAIRE SE DÉPLACER LA RAQUETTE
function movePaddle() {
    if (touch_q && paddle.x > -5) {
        paddle.x -= paddle.dx;
    } else if (touch_s && paddle.x + paddle.w < canvas.width + 5) {
        paddle.x += paddle.dx;
    }
}

function resetPaddle() {
    paddle.x = (canvas.width / 2) - (PADDLE_WIDTH / 2);
    paddle.y = canvas.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT;
}

// ON CRÉE LA FONCTION POUR QUE LA BALLE SE DÉPLACE
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
}
// AFFICHER LES STATISTIQUES DU JEU
function showStats(img, iposX, iposY, text = '', tPosX = null, tPosY = null) {
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText(text, tPosX, tPosY)
    ctx.drawImage(img, iposX, iposY, width = 20, height = 20);
}

// ON CRÉE LA FONCTION QUI PERMET D'ARRETER LA PARTIE QUAND LA VIE DU JOUEUR EST À 0
function gameover() {
    if (life <= 0) {
        showEndInfo('lose');
        stopAll();
    }
}

// ON CRÉE LA FONCTION POUR PASSER AU NIVEAU SUIVANT
function nextLevel() {
    let isLevelUp = true;

    for (let r = 0; r < brickProp.row; r++) {
        for (let c = 0; c < brickProp.column; c++) {
            isLevelUp = isLevelUp && !bricks[r][c].status;

        }
    }
    if (isLevelUp) {
        WIN.play();
        if (level >= MAX_LEVEL) {
            showEndInfo();
            gameOver = true;
            return;
        }
        brickProp.row += 1;
        createBricks();
        ball.velocity += 1;
        resetBall();
        resetPaddle();
        // level++;
        // addLife();
        updateScore();
        updateLevel();
    }
};
// MISE À JOUR DE VIE
// function addLife() {
//     if (MAX_LIFE > life) {
//         life++;
//     }
// }

// MISE À JOUR DU SCORE MAX
function updateScore() {
    if (score > score_count) {
        score_count = score;
        score_max.textContent = score_count;
    }
}

// MISE À JOUR DU NIVEAU MAX
function updateLevel() {
    if (level > level_count) {
        level_count = level;
        level_max.textContent = level_count;
    }
}

// AFFICHAGE DES INFOS DE FIN DE PARTIE
function showEndInfo(type = 'win') {
    game_over.style.visibility = 'visible';
    game_over.style.opacity = '1';

    // Si le joueur gagne
    if (type === 'win') {
        youWon.style.visibility = 'visible';
        youLose.style.visibility = 'hidden';
        youLose.style.opacity = '0';
        citation.style.visibility = 'hidden';

        // Si le joueur perd
    } else {
        youWon.style.visibility = 'hidden';
        youWon.style.opacity = '0';
        youLose.style.visibility = 'visible';
        updateScore();
        updateLevel();
    }
}

// RELATIF À TOUS CE QUI CONCERNE L'AFFICHAGE
function draw() {
    drawPaddle();
    drawBall();
    drawBricks();
    showStats(SCORE_IMG, canvas.width - 100, 5, score, canvas.width - 65, 22);
    showStats(LIFE_IMG, 35, 5, life, 70, 22);
}

// AFFICHER LA CITATION ALEATOIRE

var citationAleatoires = [
    "<p> <q> <i>Le sentiment d'échec n'existe que dans notre façon de concevoir la réussite.</i> </q> <br> - John Joos</p>",
    "<p> <q> <i>Ne jamais abandonner c'est gagner.</i></q> <br> -Internaute</p>",
    "<p> <q><i>N'abandonne jamais puisque la lutte est nécessaire pour nos rêves.</i></q> <br> - Nithael</p>",
    "<p> <q><i>On abandonne jamais si proche du but</i></q> <br> - Nidhal</p>",
    "<p> <q><i>La plus belle réussite c'est de ne pas lâcher prise.</i></q> <br> - William Dubois</p>",
    "<p> <q><i>Dans la vie, toutes les réussites sont des échecs qui ont raté.</i></q> <br> - Romain Gary </p>",
    "<p> <q><i>Il n'y a pas de réussite facile ni d'échecs définitifs.</i></q> <br> - Marcel Proust</p>",
    "<p> <q><i>Le plus important n'est pas le but lui-même, c'est de se battre pour l'atteindre.</i></q> <br> - Jan Carlzon</p>",
    "<p> <q><i>Le commencement est beaucoup plus que la moitié de l'objectif.</i></q> <br> - Aristote</p>",
    "<p> <q><i>Je suis folle de ce jeu.</i></q> <br> - Madame de Sévigné</p>",
    "<p> <q><i>Gagner demande du talent, répéter demande du caractère.</i></q> <br> - John Wooden</p>",
    "<p> <q><i>Quand tout est mis en oeuvre, alors l'échec n'est plus.</i></q> <br> - Alain Chauvineau</p>",
    "<p> <q><i>Il y a une seule manière d'échouer, c'est d'abandonner avant d'avoir réussi.</i></q> <br> - Simon Vivian Makondo</p>",
    "<p> <q><i>L'échec existe si et seulement si on le considère comme tel !</i></q> <br> - Johann Dizant </p>",
    "<p> <q><i>L'échec est le seuil de la porte qui mène au succès.</i></q> <br> - Christian KAZADI</p>",
    "<p> <q><i>Mieux vaut essayer pour échouer, que d'avoir honte et de ne jamais essayer.</i></q> <br> - Kouassi Sinan KOMENAN,</p>",
];
citations.innerHTML = citationAleatoires[Math.floor((citationAleatoires.length) * Math.random())];

// RELATIF À TOUS CE QUI CONCERNE L'INTERACTION & LES ANIMATIONS
function update() {
    movePaddle();
    moveBall();
    bwCollision();
    bpCollision();
    bbCollision();
    gameover();
    nextLevel();
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Si le jeu n'est pas en pause, lancer le jeu
    if (!isPaused) {
        draw();
        update();
    }
    // Si le joueur perd afficher GameOver
    if (!gameOver) {
        requestAnimationFrame(loop);
    };
};

loop();
//  GESTION DES ÉVENEMENTS AUDIO
sound.addEventListener('click', audioManager);

function audioManager() {
    // Changer l'image
    let imgSrc = sound.getAttribute('src');
    let SOUND_IMG = imgSrc === 'images/sound_on.png' ? 'images/mute.png' : 'images/sound_on.png';
    sound.setAttribute('src', SOUND_IMG);

    // Modification des sons en fonction des etats
    WALL_HIT.muted = !WALL_HIT.muted;
    PADDLE_HIT.muted = !PADDLE_HIT.muted;
    BRICK_HIT.muted = !BRICK_HIT.muted;
    WIN.muted = !WIN.muted;
    LIFE_LOST.muted = !LIFE_LOST.muted;
};

/////////////////////////////////////
//////////////////////////////////////
/////////////////////////////////////
// INITIALISATION DU CANVAS ET DÉFINITION DU CONTEXT
const canvas2 = document.getElementById('canvas_player2');
const ctx2 = canvas2.getContext('2d');

canvas2.style.border = "1px solid #6198d8";
ctx2.lineheight = 1;

// CONSTANTE NÉCESSAIRES
const PADDLE_WIDTH_PLAYER2 = 200;
const PADDLE_MARGIN_BOTTOM_PLAYER2 = 20;
const PADDLE_HEIGHT_PLAYER2 = 10;
const BALL_RADIUS_PLAYER2 = 10;
const SCORE_UNIT_PLAYER2 = 9;
const MAX_LEVEL_PLAYER2 = 6;
const MAX_LIFE_PLAYER2= 3;

// VARIABLES NECESSAIRES
let leftArrow = false;
let rightArrow = false;
let gameOver_player2 = false; /* Variable qui indique que le jeu est en marche*/
let isPaused_player2 = false;
let life_player2 = 3;
let score_player2 = 0;
let level_player2 = 1;
let score_count_player2 = 0;
let level_count_player2 = 0;

// IMPORTATION DES ÉLÉMENTS DU DOM
const game_over_player2 = document.getElementById('game-over_player2');
const youWon_player2 = document.getElementById('you-won_player2');
const youLose_player2 = document.getElementById('you-lose_player2');
const citations_player2 = document.getElementById('citation_player2');

// IMPORTATION DE L'ÉLÉMENT HTML DU JOUEUR
var nickname_player2 = document.getElementById('nickname_player2');
var score_max_player2 = document.getElementById('score_max_player2');
var level_max_player2 = document.getElementById('level_max_player2');

// PROPRIÉTÉS DE LA RAQUETTE
const paddle2 = {
    x: (canvas2.width / 2) - (PADDLE_WIDTH_PLAYER2 / 2),
    y: canvas2.height - PADDLE_MARGIN_BOTTOM_PLAYER2 - PADDLE_HEIGHT_PLAYER2,
    w: PADDLE_WIDTH_PLAYER2,
    h: PADDLE_MARGIN_BOTTOM_PLAYER2,
    dx: 8
};
//  PROPRIÉTÉ DE LA BALLE
const ball2 = {
    x: canvas2.width / 2,
    y: paddle.y - BALL_RADIUS_PLAYER2,
    radius: BALL_RADIUS_PLAYER2,
    velocity: 7,
    dx: 3 * (Math.random() * 2 - 1),
    dy: -1
};
// PROPRIÉTÉS DES BRIQUES
const brickProp2 = {
    row: 3,
    column: 13,
    w: 45,
    h: 35,
    padding: 1,
    offsetX: 0,
    offsetY: 40,
    fillColor: '#fff',
    visible: true,
}
// CRÉATION DE TOUTES LES BRIQUES
let bricks2 = [];
function createBricks2() {
    for (let r = 0; r < brickProp2.row; r++) {
        bricks2[r] = [];
        for (let c = 0; c < brickProp2.column; c++) {
            bricks2[r][c] = {
                x: c * (brickProp2.w + brickProp2.padding) + brickProp2.offsetX,
                y: r * (brickProp2.h + brickProp2.padding) + brickProp2.offsetY,
                status: true,
                ...brickProp2
            }
        }
    }
}
createBricks2();
// DESSINER LES BRIQUES
function drawBricks2() {
    bricks2.forEach(column => {
        column.forEach(bricks2 => {
            if (bricks2.status) {
                ctx2.beginPath();
                ctx2.rect(bricks2.x, bricks2.y, bricks2.w, bricks2.h);
                ctx2.fillStyle = bricks2.fillColor;
                ctx2.fill();
                ctx2.closePath();
            }
        })
    })
}
// DESSINER LA RAQUETTE
function drawPaddle2() {
    ctx2.beginPath();
    ctx2.fillStyle = '#B5B4B4';
    ctx2.fillRect(paddle2.x, paddle2.y, paddle2.w, paddle2.h);
    ctx2.strokeStyle = '#B5B4B4';
    ctx2.strokeRect(paddle2.x, paddle2.y, paddle2.w, paddle2.h);
    ctx2.closePath();
};
//  DESSINER LA BALLE
function drawBall2() {
    ctx2.beginPath();
    ctx2.arc(ball2.x, ball2.y, ball2.radius, 0, Math.PI * 2);
    ctx2.fillStyle = 'yellow';
    ctx2.fill();
    ctx2.strokeStyle = 'yellow'
    ctx2.stroke();
    ctx2.closePath();
};
// COLLISION BALLE - BRIQUE
function bbCollision2() {
    bricks2.forEach(column => {
        column.forEach(bricks2 => {
            if (bricks2.status) {
                if (ball2.x + ball2.radius > bricks2.x &&
                    ball2.x - ball2.radius < bricks2.x + bricks2.w &&
                    ball2.y + ball2.radius > bricks2.y &&
                    ball2.y - ball2.radius < bricks2.y + bricks2.h) {
                    BRICK_HIT2.play();
                    ball2.dy *= -1;
                    bricks2.status = false;
                    score_player2 += SCORE_UNIT_PLAYER2;
                }
            }
        })
    })
}
// INTÉRACTION BALLE - MUR
function bwCollision2() {
    // Collision sur les axes X
    if (ball2.x + ball2.radius > canvas2.width || ball2.x - ball2.radius < 0) {
        WALL_HIT.play();
        ball2.dx *= -1;
    }
    // Collision sur l'axe supérieur
    if (ball2.y - ball2.radius < 0) {
        WALL_HIT.play();
        ball2.dy *= -1;
    }
    // Collision entrainant une perte de vie
    if (ball2.y + ball2.radius > canvas2.height) {
        LIFE_LOST.play();
        life_player2--;
        resetBall2();
        resetPaddle2();
    }
};
// INTÉRACTION BALLE - RAQUETTE
function bpCollision2() {
    if (ball2.x + ball2.radius > paddle2.x &&
        ball2.x - ball2.radius < paddle2.x + paddle2.w &&
        ball2.y + ball2.radius > paddle2.y) {
        PADDLE_HIT2.play();
        let collidePoint = ball2.x - (paddle2.x + paddle2.w / 2);
        collidePoint = collidePoint / (paddle2.w / 2);
        let angle = collidePoint * Math.PI / 3;
        ball2.dx = ball2.velocity * Math.sin(angle);
        ball2.dy = -ball2.velocity * Math.cos(angle);
    }
};
function resetBall2() {
    ball2.x = canvas2.width / 2;
    ball2.y = paddle2.y - BALL_RADIUS_PLAYER2;
    ball2.dx = 3 * (Math.random() * 2 - 1);
    ball2.dy = -3;
};
// MISE EN PLACE DES TOUCHES DE CONTROLES DE LA RAQUETTE
document.addEventListener('keydown', function(e) {
    if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftArrow = true;
    } else if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightArrow = true;
    }
});
document.addEventListener('keyup', function(e) {
    if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftArrow = false;
    } else if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightArrow = false;
    }
});
// ON CRÉE LA FONCTION POUR FAIRE SE DÉPLACER LA RAQUETTE
function movePaddle2() {
    if (leftArrow && paddle2.x > -5) {
        paddle2.x -= paddle2.dx;
    } else if (rightArrow && paddle2.x + paddle2.w < canvas2.width + 5) {
        paddle2.x += paddle2.dx;
    }
}
function resetPaddle2() {
    paddle2.x = (canvas2.width / 2) - (PADDLE_WIDTH_PLAYER2 / 2);
    paddle2.y = canvas2.height - PADDLE_MARGIN_BOTTOM_PLAYER2 - PADDLE_HEIGHT_PLAYER2;
}
// ON CRÉE LA FONCTION POUR QUE LA BALLE SE DÉPLACE
function moveBall2() {
    ball2.x += ball2.dx;
    ball2.y += ball2.dy;
}
// AFFICHER LES STATISTIQUES DU JEU
function showStats2(img, iposX, iposY, text = '', tPosX = null, tPosY = null) {
    ctx2.fillStyle = '#fff';
    ctx2.font = '20px sans-serif';
    ctx2.fillText(text, tPosX, tPosY)
    ctx2.drawImage(img, iposX, iposY, width = 20, height = 20);
}
// ON CRÉE LA FONCTION QUI PERMET D'ARRETER LA PARTIE QUAND LA VIE DU JOUEUR EST À 0
function gameover_player2() {
    if (life_player2 <= 0) {
        showEndInfo2('lose');
        stopAll();
    }
}
// ON CRÉE LA FONCTION POUR PASSER AU NIVEAU SUIVANT
function nextLevel2() {
    let isLevelUp = true;
    for (let r = 0; r < brickProp2.row; r++) {
        for (let c = 0; c < brickProp2.column; c++) {
            isLevelUp = isLevelUp && !bricks2[r][c].status;
        }
    }
    if (isLevelUp) {
        WIN2.play();
        if (level_player2 >= MAX_LEVEL_PLAYER2) {
            showEndInfo2();
            gameOver_player2 = true;
            return;
        }
        brickProp2.row += 1;
        createBricks2();
        ball2.velocity += 1;
        resetBall();
        resetPaddle2();
        level_player2++;
        addLife2();
        updateScore2();
        updateLevel2();
    }
};
// MISE À JOUR DE VIE
function addLife2() {
    if (MAX_LIFE_PLAYER2 > life_player2) {
        life_player2++;
    }
}
// MISE À JOUR DU SCORE MAX
function updateScore2() {
    if (score_player2 > score_count_player2) {
        score_count_player2 = score_player2;
        score_max_player2.textContent = score_count_player2;
    }
}
// MISE À JOUR DU NIVEAU MAX
function updateLevel2() {
    if (level_player2 > level_count_player2) {
        level_count_player2 = level_player2;
        level_max_player2.textContent = level_count_player2;
    }
}
// AFFICHAGE DES INFOS DE FIN DE PARTIE
function showEndInfo2(type = 'win') {
    game_over_player2.style.visibility = 'visible';
    game_over_player2.style.opacity = '1';
    // Si le joueur gagne
    if (type === 'win') {
        youWon_player2.style.visibility = 'visible';
        youLose_player2.style.visibility = 'hidden';
        youLose_player2.style.opacity = '0';
        citation_player2.style.visibility = 'hidden';
        // Si le joueur perd
    } else {
        youWon_player2.style.visibility = 'hidden';
        youWon_player2.style.opacity = '0';
        youLose_player2.style.visibility = 'visible';
        updateScore2();
        updateLevel2();
    }
}
// RELATIF À TOUS CE QUI CONCERNE L'AFFICHAGE
function draw2() {
    drawPaddle2();
    drawBall2();
    drawBricks2();
    showStats2(SCORE_IMG, canvas2.width - 100, 5, score_player2, canvas2.width - 65, 22);
    showStats2(LIFE_IMG, 35, 5, life_player2, 70, 22);
}
// AFFICHER LA CITATION ALEATOIRE
var citationAleatoires_player2 = [
    "<p> <q> <i>Le sentiment d'échec n'existe que dans notre façon de concevoir la réussite.</i> </q> <br> - John Joos</p>",
    "<p> <q> <i>Ne jamais abandonner c'est gagner.</i></q> <br> -Internaute</p>",
    "<p> <q><i>N'abandonne jamais puisque la lutte est nécessaire pour nos rêves.</i></q> <br> - Nithael</p>",
    "<p> <q><i>On abandonne jamais si proche du but</i></q> <br> - Nidhal</p>",
    "<p> <q><i>La plus belle réussite c'est de ne pas lâcher prise.</i></q> <br> - William Dubois</p>",
    "<p> <q><i>Dans la vie, toutes les réussites sont des échecs qui ont raté.</i></q> <br> - Romain Gary </p>",
    "<p> <q><i>Il n'y a pas de réussite facile ni d'échecs définitifs.</i></q> <br> - Marcel Proust</p>",
    "<p> <q><i>Le plus important n'est pas le but lui-même, c'est de se battre pour l'atteindre.</i></q> <br> - Jan Carlzon</p>",
    "<p> <q><i>Le commencement est beaucoup plus que la moitié de l'objectif.</i></q> <br> - Aristote</p>",
    "<p> <q><i>Je suis folle de ce jeu.</i></q> <br> - Madame de Sévigné</p>",
    "<p> <q><i>Gagner demande du talent, répéter demande du caractère.</i></q> <br> - John Wooden</p>",
    "<p> <q><i>Quand tout est mis en oeuvre, alors l'échec n'est plus.</i></q> <br> - Alain Chauvineau</p>",
    "<p> <q><i>Il y a une seule manière d'échouer, c'est d'abandonner avant d'avoir réussi.</i></q> <br> - Simon Vivian Makondo</p>",
    "<p> <q><i>L'échec existe si et seulement si on le considère comme tel !</i></q> <br> - Johann Dizant </p>",
    "<p> <q><i>L'échec est le seuil de la porte qui mène au succès.</i></q> <br> - Christian KAZADI</p>",
    "<p> <q><i>Mieux vaut essayer pour échouer, que d'avoir honte et de ne jamais essayer.</i></q> <br> - Kouassi Sinan KOMENAN,</p>",
];
citations_player2.innerHTML = citationAleatoires_player2[Math.floor((citationAleatoires_player2.length) * Math.random())];
// RELATIF À TOUS CE QUI CONCERNE L'INTERACTION & LES ANIMATIONS
function update2() {
    movePaddle2();
    moveBall2();
    bwCollision2();
    bpCollision2();
    bbCollision2();
    gameover_player2();
    nextLevel2();
}
function loop2() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    // Si le jeu n'est pas en pause, lancer le jeu
    if (!isPaused_player2) {
        draw2();
        update2();
    }
    // Si le joueur perd afficher GameOver
    if (!gameOver_player2) {
        requestAnimationFrame(loop2);
    };
};
loop2();
//  GESTION DES ÉVENEMENTS AUDIO
sound.addEventListener('click', audioManager2);
function audioManager2() {
    // Changer l'image
    let imgSrc = sound.getAttribute('src');
    let SOUND_IMG = imgSrc === 'images/sound_on.png' ? 'images/mute.png' : 'images/sound_on.png';
    sound.setAttribute('src', SOUND_IMG);
    // Modification des sons en fonction des etats
    WALL_HIT.muted = !WALL_HIT.muted;
    PADDLE_HIT2.muted = !PADDLE_HIT.muted;
    BRICK_HIT2.muted = !BRICK_HIT.muted;
    WIN2.muted = !WIN2.muted;
    LIFE_LOST.muted = !LIFE_LOST.muted;
};

// CHRONOMETRE 

var comptage;
$(document).ready(function chrono(){
    var centiemeSeconde=0;
    var seconde=0;
    var minute=0;
    var heure=0;
    var compteur=0;
    
    function chrono(){
        if(seconde == 30){
            gameEnd();
            clearInterval(comptage);
            $(this).attr('disabled','disabled');
            $('#initialiser').removeAttr('disabled');
            $('#commencer').removeAttr('disabled').text('Rejouer');
            isPaused=true;
            gameOver = true;
        }

        else if(centiemeSeconde<99){
            centiemeSeconde++;
        }else{
            centiemeSeconde=0;
            if(seconde<59){
                seconde++;
            }else{
                seconde=0;
                if(minute<59){
                    minute++;
                }else{
                    minute=0;
                    heure++;
                }
            }
        }
        $('#chrono').text(minute+':'+seconde+':'+centiemeSeconde);}
        $('#arreter').attr('disabled', 'disabled');
        $('#initialiser').attr('disabled', 'disabled');
        $(document).ready(function() {
            comptage=setInterval(chrono,10);
            
        });
        
        // Action du bouton commencer
        $('#commencer').click(function(){
            comptage=setInterval(chrono,10);
            $(this).attr('disabled','disabled');
            $('#arreter').removeAttr('disabled','disabled');
            $('#initialiser').attr('disabled','disabled');
            location.reload()
            
})
        
        // Action bouton arreter
        $('#arreter').click(function(){
            clearInterval(comptage);
            $(this).attr('disabled','disabled');
            $('#initialiser').removeAttr('disabled');
            $('#commencer').removeAttr('disabled').text('Continuer');
        });
        //Action bouton initialiser
        $('#initialiser').click(function(){
            heure=0;
            minute=0;
            seconde=0;
            $('#chrono').text('00');
            $(this).attr('disabled','disabled');
            $('#arreter').attr('disabled','disabled');
            $('#commencer').removeAttr('disabled').text('Continuer');
        });

    });

    //FONCTION POUR QUE LE JEU S'ARRETE
    function stopAll() {
        if (life<1) {
            isPaused_player2=true;
            isPaused=true;
            showEndInfo2();
            // gameOver = true;
            
        } else if (life_player2<1) {
            isPaused_player2=true;
            isPaused=true;
            showEndInfo();
            // gameOver_player2 = true;
          
        }
    }

    function gameEnd() {
        if (score> score_player2) {
            isPaused_player2=true;
            isPaused=true;
            showEndInfo();
        } else if (score<score_player2) {
            isPaused_player2=true;
            isPaused=true;
            showEndInfo2();
        }
        // if (second=30) {
        //     isPaused_player2=true;
        //     isPaused=true; 
        //     showEndInfo2();
        //     showEndInfo();
        // }
    }

// Condition sur le comptage des points quand le chrono s'arrête et que les deux joueurs n'ont pas finit de jouer
// function comparaison(score,score_player2){
//     let player =document.getElementById('compa');
//     if (score>score_player2) {
//         player_g.innerHTML="<div>Le joueur 1 a gagné</div>";
//     } else if (score<score_player2) {
//         player_g.innerHTML="<div>Le joueur 2 a gagné</div>";
//     }else  if (score==score_player2) {
//         player_g.innerHTML="<div>Vous êtes égaux !</div>";
//     }

//     return player.innerHTML=player_g;
// }

// CONDITION QUAND UN JOUEUR TERMINE AVANT LE CHRONO (il faut arrêter le)
