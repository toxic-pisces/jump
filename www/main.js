const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.key === ' ') {
        player.jump();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

const player = new Player(100, 100, 30, 30);

const platforms = [
    new Platform(0, 550, 800, 50, 'normal'),
    new Platform(200, 450, 150, 20, 'normal'),
    new Platform(400, 350, 150, 20, 'glue'),
    new Platform(100, 250, 150, 20, 'glue'),
    new Platform(500, 200, 150, 20, 'normal'),
];

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    player.update();
    player.checkCollision(platforms);
    player.draw(ctx);
    
    platforms.forEach(platform => platform.draw(ctx));
    
    requestAnimationFrame(gameLoop);
}

gameLoop();
