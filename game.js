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
const MAX_LEVEL = 4;
const MAX_LIFE = 6;

// VARIABLES NECESSAIRES
let leftArrow = false;
let rightArrow = false;
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
const restart = document.getElementById('restart');
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
    row: 2,
    column: 13,
    w: 55,
    h: 35,
    padding: 3,
    offsetX: 25,
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
function movePaddle() {
    if (leftArrow && paddle.x > -5) {
        paddle.x -= paddle.dx;
    } else if (rightArrow && paddle.x + paddle.w < canvas.width + 5) {
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
        gameOver = true;
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
        level++;
        addLife();
        updateScore();
        updateLevel();
    }
};
// MISE À JOUR DE VIE
function addLife() {
    if (MAX_LIFE > life) {
        life++;
    }
}

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
    showStats(LEVEL_IMG, canvas.width / 2 - 25, 5, level, canvas.width / 2, 22);
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

// RELANCER LE JEU
restart.addEventListener('click', function() {
    location.reload();
})