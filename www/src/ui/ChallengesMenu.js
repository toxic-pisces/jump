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

                    <!-- World 3 Speedrun -->
                    <div class="challenge-card" data-challenge="speedrun-w3">
                        <canvas class="challenge-icon" width="48" height="48" data-icon="lightning"></canvas>
                        <div class="challenge-name">WORLD 3 SPEEDRUN</div>
                        <div class="challenge-desc">Complete all 9 levels<br>One continuous timer</div>
                        <button class="challenge-btn">START</button>
                        <button class="challenge-leaderboard-btn">LEADERBOARD</button>
                    </div>

                    <!-- Ironman Mode -->
                    <div class="challenge-card challenge-hard" data-challenge="ironman">
                        <canvas class="challenge-icon" width="48" height="48" data-icon="skull"></canvas>
                        <div class="challenge-name">IRONMAN MODE</div>
                        <div class="challenge-desc">All 27 levels - No deaths<br>One life for everything!</div>
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

            if (startBtn) {
                startBtn.addEventListener('click', (e) => {
                    console.log('START button clicked for:', challengeType);
                    e.stopPropagation();
                    e.preventDefault();
                    this.startChallenge(challengeType);
                }, { capture: true });
            }

            if (leaderboardBtn) {
                leaderboardBtn.addEventListener('click', (e) => {
                    console.log('LEADERBOARD button clicked for:', challengeType);
                    e.stopPropagation();
                    e.preventDefault();
                    this.showLeaderboard(challengeType);
                }, { capture: true });
            }
        });
    }

    startChallenge(challengeType) {
        // Check if challenge is unlocked
        if (!this.game?.progressionManager) {
            this.hide();
            return;
        }
        
        const pm = this.game.progressionManager;
        let isUnlocked = false;
        
        switch(challengeType) {
            case 'speedrun-w1':
                isUnlocked = pm.isSpeedrunUnlocked(1);
                if (isUnlocked) {
                    this.hide();
                    this.game.startSpeedrun(1);
                }
                break;
            case 'speedrun-w2':
                isUnlocked = pm.isSpeedrunUnlocked(2);
                if (isUnlocked) {
                    this.hide();
                    this.game.startSpeedrun(2);
                }
                break;
            case 'speedrun-w3':
                isUnlocked = pm.isSpeedrunUnlocked(3);
                if (isUnlocked) {
                    this.hide();
                    this.game.startSpeedrun(3);
                }
                break;
            case 'ironman':
                isUnlocked = pm.isIronmanUnlocked();
                if (isUnlocked) {
                    this.hide();
                    this.game.startIronman();
                }
                break;
        }
        
        // If not unlocked, button should be disabled (handled by updateChallengeStates)
    }

    showLeaderboard(challengeType) {
        console.log('showLeaderboard called with:', challengeType);
        
        // Map challenge types to leaderboard keys
        const leaderboardMap = {
            'speedrun-w1': 'world1',
            'speedrun-w2': 'world2',
            'speedrun-w3': 'world3',
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
        
        // Update locked state of challenges
        this.updateChallengeStates();
    }

    hide() {
        this.element.classList.remove('show');
    }
    
    refresh() {
        // Update locked states after progression changes
        this.updateChallengeStates();
    }
    
    updateChallengeStates() {
        if (!this.game?.progressionManager) return;
        
        const pm = this.game.progressionManager;
        
        // Update each challenge card
        const challenges = [
            { type: 'speedrun-w1', world: 1 },
            { type: 'speedrun-w2', world: 2 },
            { type: 'speedrun-w3', world: 3 },
            { type: 'ironman', world: null }
        ];
        
        challenges.forEach(({ type, world }) => {
            const card = this.element.querySelector(`[data-challenge="${type}"]`);
            if (!card) return;
            
            const startBtn = card.querySelector('.challenge-btn');
            const leaderboardBtn = card.querySelector('.challenge-leaderboard-btn');
            
            let isUnlocked = false;
            let requirement = null;
            
            if (world !== null) {
                // Speedrun
                isUnlocked = pm.isSpeedrunUnlocked(world);
                requirement = pm.getSpeedrunRequirement(world);
            } else {
                // Ironman
                isUnlocked = pm.isIronmanUnlocked();
                requirement = pm.getIronmanRequirement();
            }
            
            if (isUnlocked) {
                // Unlock the challenge
                card.classList.remove('locked');
                if (startBtn) {
                    startBtn.disabled = false;
                    startBtn.textContent = 'START';
                }
            } else {
                // Lock the challenge
                card.classList.add('locked');
                if (startBtn) {
                    startBtn.disabled = true;
                    startBtn.innerHTML = `🔒 ${requirement}`;
                }
            }
            
            // Always allow viewing leaderboards
            if (leaderboardBtn) {
                leaderboardBtn.disabled = false;
            }
        });
    }
}
