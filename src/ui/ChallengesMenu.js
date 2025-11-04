export class ChallengesMenu {
    constructor() {
        this.element = null;
        this.game = null;
        this.createUI();
    }

    setGame(game) {
        this.game = game;
    }

    createUI() {
        this.element = document.createElement('div');
        this.element.id = 'challenges-menu';
        this.element.className = 'challenges-menu';
        this.element.innerHTML = `
            <div class="challenges-content">
                <div class="challenges-title">CHALLENGES</div>
                <div class="challenges-subtitle">Test your skills!</div>
                
                <div class="challenges-grid">
                    <!-- World 1 Speedrun -->
                    <div class="challenge-card" data-challenge="speedrun-w1">
                        <canvas class="challenge-icon" width="48" height="48" data-icon="lightning"></canvas>
                        <div class="challenge-name">WORLD 1 SPEEDRUN</div>
                        <div class="challenge-desc">Complete all 9 levels<br>One continuous timer</div>
                        <button class="challenge-btn">START</button>
                        <button class="challenge-leaderboard-btn">LEADERBOARD</button>
                    </div>

                    <!-- World 2 Speedrun -->
                    <div class="challenge-card" data-challenge="speedrun-w2">
                        <canvas class="challenge-icon" width="48" height="48" data-icon="lightning"></canvas>
                        <div class="challenge-name">WORLD 2 SPEEDRUN</div>
                        <div class="challenge-desc">Complete all 9 levels<br>One continuous timer</div>
                        <button class="challenge-btn">START</button>
                        <button class="challenge-leaderboard-btn">LEADERBOARD</button>
                    </div>

                    <!-- Ironman Mode -->
                    <div class="challenge-card challenge-hard" data-challenge="ironman">
                        <canvas class="challenge-icon" width="48" height="48" data-icon="skull"></canvas>
                        <div class="challenge-name">IRONMAN MODE</div>
                        <div class="challenge-desc">All 18 levels - No deaths<br>One life for everything!</div>
                        <button class="challenge-btn">START</button>
                        <button class="challenge-leaderboard-btn">LEADERBOARD</button>
                    </div>
                </div>

                <button class="back-btn">← BACK TO MENU</button>
            </div>
        `;

        document.body.appendChild(this.element);
        this.setupEventListeners();
        this.drawPixelIcons();
    }

    drawPixelIcons() {
        // Draw all pixel art icons
        const icons = this.element.querySelectorAll('.challenge-icon');
        icons.forEach(canvas => {
            const iconType = canvas.dataset.icon;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            
            if (iconType === 'lightning') {
                this.drawLightning(ctx);
            } else if (iconType === 'skull') {
                this.drawSkull(ctx);
            }
        });
    }

    drawLightning(ctx) {
        // Pixel art lightning bolt - Yellow/Gold
        const pixels = [
            [0,0,0,0,0,1,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,0,0,0,0,0],
            [0,0,1,1,1,1,1,0,0,0,0,0],
            [0,0,1,1,1,1,0,0,0,0,0,0],
            [0,1,1,1,1,1,0,0,0,0,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,0],
            [0,0,0,0,0,1,1,1,1,1,0,0],
            [0,0,0,0,0,1,1,1,1,0,0,0],
            [0,0,0,0,1,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,0,0,0],
            [0,0,0,1,1,1,0,0,0,0,0,0],
            [0,0,1,1,1,0,0,0,0,0,0,0]
        ];
        
        const pixelSize = 4;
        pixels.forEach((row, y) => {
            row.forEach((pixel, x) => {
                if (pixel === 1) {
                    // Gradient from bright yellow to gold
                    ctx.fillStyle = y < 6 ? '#FFD700' : '#FFA500';
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                    
                    // Highlight
                    if (x > 0 && y > 0 && pixel === 1) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, 1);
                    }
                }
            });
        });
    }

    drawSkull(ctx) {
        // Pixel art skull - White/Gray
        const pixels = [
            [0,0,0,1,1,1,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,2,2,1,1,1,1,2,2,1,0],
            [0,1,2,2,1,1,1,1,2,2,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,1,0,0,1,1,0,0,1,1,0],
            [0,1,1,0,0,1,1,0,0,1,1,0]
        ];
        
        const pixelSize = 4;
        pixels.forEach((row, y) => {
            row.forEach((pixel, x) => {
                if (pixel === 1) {
                    // Skull bone color
                    ctx.fillStyle = '#F0F0F0';
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                } else if (pixel === 2) {
                    // Eye sockets - dark
                    ctx.fillStyle = '#333333';
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }  
            });
        });
        
        // Add shading
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        pixels.forEach((row, y) => {
            row.forEach((pixel, x) => {
                if (pixel === 1 && y > 5) {
                    ctx.fillRect(x * pixelSize, y * pixelSize + 2, pixelSize, 2);
                }
            });
        });
    }

    setupEventListeners() {
        // Back button
        const backBtn = this.element.querySelector('.back-btn');
        backBtn.addEventListener('click', () => {
            this.hide();
            this.game.showLevelSelect();
        });

        // Challenge buttons
        const challengeCards = this.element.querySelectorAll('.challenge-card');
        challengeCards.forEach(card => {
            const challengeType = card.dataset.challenge;
            const startBtn = card.querySelector('.challenge-btn');
            const leaderboardBtn = card.querySelector('.challenge-leaderboard-btn');

            startBtn.addEventListener('click', (e) => {
                console.log('START button clicked for:', challengeType);
                e.stopPropagation();
                e.preventDefault();
                this.startChallenge(challengeType);
            }, { capture: true });

            leaderboardBtn.addEventListener('click', (e) => {
                console.log('LEADERBOARD button clicked for:', challengeType);
                e.stopPropagation();
                e.preventDefault();
                this.showLeaderboard(challengeType);
            }, { capture: true });
        });
    }

    startChallenge(challengeType) {
        this.hide();

        switch(challengeType) {
            case 'speedrun-w1':
                this.game.startSpeedrun(1); // World 1
                break;
            case 'speedrun-w2':
                this.game.startSpeedrun(2); // World 2
                break;
            case 'ironman':
                this.game.startIronman();
                break;
        }
    }

    showLeaderboard(challengeType) {
        console.log('showLeaderboard called with:', challengeType);
        
        // Map challenge types to leaderboard keys
        const leaderboardMap = {
            'speedrun-w1': 'world1',
            'speedrun-w2': 'world2',
            'ironman': 'ironman'
        };

        const leaderboardType = leaderboardMap[challengeType];
        console.log('Mapped to leaderboard type:', leaderboardType);
        
        if (this.game && this.game.speedrunManager) {
            console.log('Calling speedrunManager.showLeaderboard...');
            this.game.speedrunManager.showLeaderboard(leaderboardType);
        } else {
            console.error('Game or speedrunManager not available', this.game);
        }
    }

    show() {
        this.element.classList.add('show');
        
        // Set theme based on current world or default to world 1
        const worldClass = this.game?.currentWorld === 2 ? 'world-2' : 'world-1';
        document.body.className = worldClass;
    }

    hide() {
        this.element.classList.remove('show');
    }
}
