import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';
import { Player } from '../entities/Player.js';
import { CANVAS, PLAYER, LEVEL, GAME_STATES } from '../config/Constants.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { VictoryScreen } from '../ui/VictoryScreen.js';
import { LevelSelect } from '../ui/LevelSelect.js';
import { ChallengesMenu } from '../ui/ChallengesMenu.js';
import { SettingsMenu } from '../ui/SettingsMenu.js';
import { LevelEditor } from '../editor/LevelEditor.js';
import { SpeedrunManager } from '../speedrun/SpeedrunManager.js';
import { InputManager } from '../managers/InputManager.js';
import { StateManager } from '../managers/StateManager.js';
import { LevelManager } from '../managers/LevelManager.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.width = CANVAS.WIDTH;
        this.canvas.height = CANVAS.HEIGHT;

        // Core systems
        this.renderer = new Renderer(canvas);
        this.physics = new Physics();
        this.particleSystem = new ParticleSystem();

        // Managers
        this.inputManager = new InputManager();
        this.stateManager = new StateManager();
        this.levelManager = new LevelManager();

        // UI components
        this.victoryScreen = new VictoryScreen();
        this.levelSelect = new LevelSelect();
        this.challengesMenu = new ChallengesMenu();
        this.settingsMenu = new SettingsMenu();
        this.levelEditor = new LevelEditor(canvas, this);

        // Set Game reference for UI components
        this.levelSelect.setGame(this);
        this.challengesMenu.setGame(this);

        // Home button
        this.homeButton = document.getElementById('home-button');
        this.setupHomeButton();
        this.drawHomeIcon();

        // Player
        this.player = new Player(PLAYER.DEFAULT_SPAWN_X, PLAYER.DEFAULT_SPAWN_Y);

        // Level tracking (legacy - will be migrated to use levelManager)
        this.currentLevel = null;
        this.currentLevelNumber = 1;
        this.totalLevels = LEVEL.WORLD_1_LEVELS;
        this.currentWorld = 1;

        // Black hole effect
        this.suckProgress = 0;

        // Timer
        this.levelTime = 0;
        this.timerStarted = false;
        this.timerElement = document.getElementById('timer');
        this.levelInfoElement = document.getElementById('level-info');

        // Speedrun
        this.speedrunManager = new SpeedrunManager(this);
        this.isSpeedrunMode = false;
        this.speedrunTime = 0;

        // Goal collision prevention
        this.goalTriggered = false;
        this.goalCooldown = LEVEL.GOAL_COOLDOWN;

        // Projectiles
        this.projectiles = [];

        // Setup
        this.setupInputHandlers();
        this.showLevelSelect();
    }

    setupHomeButton() {
        this.homeButton.addEventListener('click', () => {
            if (this.stateManager.isPlaying()) {
                if (this.isSpeedrunMode) {
                    if (confirm('Abort speedrun and return to menu?')) {
                        this.exitSpeedrun();
                    }
                } else {
                    this.stateManager.setState(GAME_STATES.MENU);
                    this.showLevelSelect();
                }
            }
        });
    }

    drawHomeIcon() {
        const canvas = this.homeButton.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Pixel art home icon
        const pixels = [
            [0,0,0,0,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,1,1,0],
            [0,1,1,0,0,0,0,1,1,0],
            [0,1,1,0,0,0,0,1,1,0],
            [0,1,1,0,0,0,0,1,1,0],
            [0,1,1,1,1,1,1,1,1,0]
        ];

        const pixelSize = 3; // Smaller to match level/timer text height
        const offsetX = 5; // Center it in the 40x40 canvas
        const offsetY = 5;

        pixels.forEach((row, y) => {
            row.forEach((pixel, x) => {
                if (pixel === 1) {
                    // Draw pixel with primary color
                    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary-color') || '#FF69B4';
                    ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);

                    // Add highlight
                    if (y < 5) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize - 1, pixelSize - 1);
                    }
                }
            });
        });
    }

    setupInputHandlers() {
        // Handle key down events
        this.inputManager.onKeyDown((e) => {
            if (e.code === 'Space' && !this.stateManager.isEditor()) {
                e.preventDefault();
            }

            // Space to continue after victory (normal mode only, not speedrun)
            if (this.stateManager.isWon() && e.code === 'Space' && !this.isSpeedrunMode) {
                this.victoryScreen.hide();
                this.loadNextLevel();
            }

            // Escape key handling
            if (e.code === 'Escape') {
                this.handleEscapeKey();
            }

            // E to open editor
            if (e.code === 'KeyE' && this.stateManager.isMenu()) {
                this.levelSelect.hide();
                this.levelEditor.open();
            }

            // S to open settings (when in menu)
            if (e.code === 'KeyS' && this.stateManager.isMenu()) {
                this.showSettings();
            }
        });
    }

    handleEscapeKey() {
        if (this.stateManager.isPlaying()) {
            if (this.isSpeedrunMode) {
                if (confirm('Abort speedrun?')) {
                    this.exitSpeedrun();
                }
            } else if (this.levelEditor.isTesting) {
                this.returnToEditor();
            } else {
                this.stateManager.setState(GAME_STATES.MENU);
                this.showLevelSelect();
            }
        } else if (this.stateManager.isWon()) {
            if (this.levelEditor.isTesting) {
                this.returnToEditor();
            } else {
                this.victoryScreen.hide();
                this.showLevelSelect();
            }
        } else if (this.stateManager.isDead()) {
            if (this.levelEditor.isTesting) {
                this.returnToEditor();
            }
        } else if (this.stateManager.isEditor()) {
            this.levelEditor.close();
        }
    }

    loadWorld2Level(levelNumber) {
        const levelInfo = this.levelManager.loadWorld2Level(levelNumber);
        this.currentLevel = levelInfo.level;
        this.currentLevelNumber = this.levelManager.getCurrentLevelNumber();
        this.currentWorld = 2;
        this.levelInfoElement.textContent = levelInfo.displayName;
        this.reset();
    }

    loadWorld3Level(levelNumber) {
        const levelInfo = this.levelManager.loadWorld3Level(levelNumber);
        this.currentLevel = levelInfo.level;
        this.currentLevelNumber = this.levelManager.getCurrentLevelNumber();
        this.currentWorld = 3;
        this.levelInfoElement.textContent = levelInfo.displayName;
        this.reset();
    }

    loadLevel(levelNumber) {
        const levelInfo = this.levelManager.loadWorld1Level(levelNumber);
        this.currentLevel = levelInfo.level;
        this.currentLevelNumber = levelInfo.levelNumber;
        this.currentWorld = 1;

        if (!this.isSpeedrunMode) {
            this.levelInfoElement.textContent = levelInfo.displayName;
        }

        this.reset();
    }

    loadCustomLevel(levelData) {
        const levelInfo = this.levelManager.loadCustomLevel(levelData);
        this.currentLevel = levelInfo.level;
        this.currentLevelNumber = 0;
        this.currentWorld = 1;
        this.levelInfoElement.textContent = levelInfo.displayName;
        this.reset();
    }

    showLevelSelect() {
        this.stateManager.setState(GAME_STATES.MENU);

        // Set theme based on current world
        this.levelManager.setWorldTheme(this.currentWorld);

        this.levelSelect.show((levelNumber, customLevel, worldData) => {
            if (worldData) {
                if (worldData.world === 2) {
                    this.loadWorld2Level(worldData.level);
                } else if (worldData.world === 3) {
                    this.loadWorld3Level(worldData.level);
                }
            } else if (customLevel) {
                this.loadCustomLevel(customLevel);
            } else if (levelNumber) {
                this.loadLevel(levelNumber);
            }
        });
    }

    loadNextLevel() {
        if (this.levelManager.hasNextLevel()) {
            const nextLevelInfo = this.levelManager.loadNextLevel();
            this.currentLevel = nextLevelInfo.level;
            this.currentLevelNumber = this.levelManager.getCurrentLevelNumber();
            this.currentWorld = nextLevelInfo.world;
            this.levelInfoElement.textContent = nextLevelInfo.displayName;
            this.reset();
        } else {
            // No more levels, return to menu
            this.showLevelSelect();
        }
    }

    // Legacy method kept for compatibility
    _loadNextLevelOld() {
        if (this.currentWorld === 3) {
            // World 3
            if (this.currentLevelNumber < 203) {
                const nextLevel = (this.currentLevelNumber - 200) + 1;
                this.loadWorld3Level(nextLevel);
            } else {
                this.showLevelSelect();
            }
        } else if (this.currentWorld === 2) {
            // World 2
            if (this.currentLevelNumber < 109) {
                const nextLevel = (this.currentLevelNumber - 100) + 1;
                this.loadWorld2Level(nextLevel);
            } else {
                this.showLevelSelect();
            }
        } else {
            // World 1
            if (this.currentLevelNumber < this.totalLevels && this.currentLevelNumber > 0) {
                this.loadLevel(this.currentLevelNumber + 1);
            } else {
                this.showLevelSelect();
            }
        }
    }

    startSpeedrun(world = 1) {
        this.isSpeedrunMode = true;
        this.speedrunTime = 0;
        this.timerStarted = false;
        this.speedrunWorld = world;
        
        if (world === 1) {
            this.loadLevel(1);
            this.levelInfoElement.textContent = 'SPEEDRUN W1 - LEVEL 1/9';
        } else if (world === 2) {
            this.loadWorld2Level(1);
            this.levelInfoElement.textContent = 'SPEEDRUN W2 - LEVEL 1/9';
        }
    }

    startIronman() {
        this.isIronmanMode = true;
        this.isSpeedrunMode = true; // Uses speedrun timer
        this.speedrunTime = 0;
        this.timerStarted = false;
        this.ironmanCurrentWorld = 1;
        this.ironmanTotalLevels = 18; // 9 levels per world
        
        this.loadLevel(1);
        this.levelInfoElement.textContent = 'IRONMAN - W1 L1 (1/18)';
    }

    loadNextSpeedrunLevel() {
        if (this.isIronmanMode) {
            // Ironman mode: progress through both worlds
            // Calculate actual level number within the world (1-9)
            const levelInWorld = this.ironmanCurrentWorld === 2 
                ? this.currentLevelNumber - 100 
                : this.currentLevelNumber;
            
            const totalCompleted = ((this.ironmanCurrentWorld - 1) * 9) + levelInWorld;
            
            if (totalCompleted < 18) {
                if (this.ironmanCurrentWorld === 1 && levelInWorld < 9) {
                    // Continue in World 1
                    this.loadLevel(this.currentLevelNumber + 1);
                    this.levelInfoElement.textContent = `IRONMAN - W1 L${this.currentLevelNumber} (${totalCompleted + 1}/18)`;
                } else if (this.ironmanCurrentWorld === 1 && levelInWorld === 9) {
                    // Move to World 2
                    this.ironmanCurrentWorld = 2;
                    this.loadWorld2Level(1);
                    this.levelInfoElement.textContent = `IRONMAN - W2 L1 (10/18)`;
                } else if (this.ironmanCurrentWorld === 2 && levelInWorld < 9) {
                    // Continue in World 2
                    const nextLevel = levelInWorld + 1;
                    this.loadWorld2Level(nextLevel);
                    this.levelInfoElement.textContent = `IRONMAN - W2 L${nextLevel} (${totalCompleted + 1}/18)`;
                }
            } else {
                // Ironman complete!
                this.finishIronman();
            }
        } else if (this.speedrunWorld === 2) {
            // World 2 Speedrun
            const currentW2Level = this.currentLevelNumber - 100;
            if (currentW2Level < 9) {
                const nextLevel = currentW2Level + 1;
                this.loadWorld2Level(nextLevel);
                this.levelInfoElement.textContent = `SPEEDRUN W2 - LEVEL ${nextLevel}/9`;
            } else {
                this.finishSpeedrun();
            }
        } else {
            // World 1 Speedrun
            if (this.currentLevelNumber < 9) {
                this.loadLevel(this.currentLevelNumber + 1);
                this.levelInfoElement.textContent = `SPEEDRUN W1 - LEVEL ${this.currentLevelNumber}/9`;
            } else {
                this.finishSpeedrun();
            }
        }
    }

    finishSpeedrun() {
        const leaderboardType = this.isIronmanMode ? 'ironman' : 
                               this.speedrunWorld === 2 ? 'world2' : 'world1';
        
        this.isSpeedrunMode = false;
        this.isIronmanMode = false;
        this.stateManager.setState('speedrun-finished');
        this.speedrunManager.showNameInput(this.speedrunTime, leaderboardType);
    }

    finishIronman() {
        this.finishSpeedrun();
    }

    exitSpeedrun() {
        this.isSpeedrunMode = false;
        this.isIronmanMode = false;
        this.speedrunTime = 0;
        this.timerStarted = false;
        this.stateManager.setState(GAME_STATES.MENU);
        this.showLevelSelect();
    }

    showChallengesMenu() {
        this.stateManager.setState(GAME_STATES.MENU);
        this.levelSelect.hide();
        this.challengesMenu.show();
    }

    showSettings() {
        this.levelSelect.hide();
        this.challengesMenu.hide();
        this.settingsMenu.show(() => {
            this.showLevelSelect();
        });
    }

    returnToEditor() {
        // Return to editor after testing
        this.levelEditor.isTesting = false;
        this.levelEditor.open();
    }

    update(deltaTime) {
        // Skip update for menu, editor, or finished states
        if (this.stateManager.isMenu() || this.stateManager.isEditor() || this.stateManager.getState() === 'speedrun-finished') {
            return;
        }

        if (this.stateManager.isDead()) {
            this.particleSystem.update(deltaTime);
            return;
        }

        if (this.stateManager.isSucking()) {
            this.updateSuckEffect(deltaTime);
            return;
        }

        if (this.stateManager.isWon()) {
            return;
        }

        // Update crumbling platforms
        if (this.currentLevel.crumblingPlatforms) {
            this.currentLevel.crumblingPlatforms.forEach(platform => {
                platform.update(deltaTime);
            });
        }

        // Update blinking platforms
        if (this.currentLevel.blinkingPlatforms) {
            this.currentLevel.blinkingPlatforms.forEach(platform => {
                platform.update(deltaTime);
            });
        }

        // Update moving spikes
        if (this.currentLevel.movingSpikes) {
            this.currentLevel.movingSpikes.forEach(spike => {
                spike.x += spike.speed * spike.direction * deltaTime;

                if (spike.x <= spike.startX) {
                    spike.x = spike.startX;
                    spike.direction = 1;
                } else if (spike.x >= spike.endX) {
                    spike.x = spike.endX;
                    spike.direction = -1;
                }
            });
        }

        // Update turrets und projectiles
        if (this.currentLevel.turrets) {
            this.currentLevel.turrets.forEach(turret => {
                const projectile = turret.update(deltaTime);
                if (projectile) {
                    this.projectiles.push(projectile);
                }
            });
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.x += projectile.velocityX * deltaTime;
            projectile.y += projectile.velocityY * deltaTime;
            projectile.lifetime -= deltaTime;

            // Entferne Projektile die außerhalb des Bildschirms sind oder abgelaufen
            if (projectile.lifetime <= 0 ||
                projectile.x < -50 || projectile.x > this.canvas.width + 50 ||
                projectile.y < -50 || projectile.y > this.canvas.height + 50) {
                this.projectiles.splice(i, 1);
            }
        }

        // Input handling - with input lock check
        const rawInput = this.inputManager.getPlayerInput();
        const input = {
            left: !this.inputLocked && rawInput.left,
            right: !this.inputLocked && rawInput.right,
            jump: !this.inputLocked && rawInput.jump
        };

        // Timer
        if (!this.timerStarted && (input.left || input.right || input.jump)) {
            this.timerStarted = true;
        }

        if (this.timerStarted) {
            if (this.isSpeedrunMode) {
                this.speedrunTime += deltaTime;
                this.updateSpeedrunTimer();
            } else {
                this.levelTime += deltaTime;
                this.updateTimer();
            }
        }

        // === PHYSICS UPDATE ORDER (KRITISCH!) ===

        // 1. ERST Schwarze Löcher Gravitation anwenden (beeinflusst Velocity)
        if (this.currentLevel.blackHoles) {
            this.applyBlackHoleGravity(deltaTime);
        }

        // 2. DANN normale Gravitation (wird später für glue platforms gecancelt)
        // NOTE: applyGravity checks isStuckToGlue from PREVIOUS frame
        this.physics.applyGravity(this.player, deltaTime);

        // 3. Reset glue state (will be set again in collision check if still touching)
        this.player.isStuckToGlue = false;

        // 4. DANN Player Update (bewegt sich basierend auf Velocity)
        this.player.update(deltaTime, input);

        // 5. DANN Kollisionen (korrigiert Position)
        this.physics.checkCollisions(this.player, this.currentLevel.platforms);

        if (this.currentLevel.crumblingPlatforms) {
            this.physics.checkCrumblingCollisions(this.player, this.currentLevel.crumblingPlatforms);
        }

        // Glue platforms - special collision that sticks from any side
        if (this.currentLevel.gluePlatforms) {
            this.physics.checkGluePlatformCollisions(this.player, this.currentLevel.gluePlatforms);
            
            // Create slime particles if player is stuck to glue platform
            if (this.player.isStuckToGlue) {
                this.createGlueSlimeParticles();
            }
        }

        // Blinking platforms - only collide when visible
        if (this.currentLevel.blinkingPlatforms) {
            this.physics.checkBlinkingCollisions(this.player, this.currentLevel.blinkingPlatforms);
        }

        // 6. DANN Check für Tod/Win
        if (this.checkSpikesCollision()) {
            this.handlePlayerDeath();
            return;
        }

        // Check projectile collisions
        if (this.checkProjectileCollision()) {
            this.handlePlayerDeath();
            return;
        }

        // Goal Check - NUR wenn Cooldown abgelaufen
        const timeSinceLevelStart = this.isSpeedrunMode ? this.speedrunTime : this.levelTime;
        
        if (!this.goalTriggered 
            && timeSinceLevelStart >= this.goalCooldown 
            && this.checkGoalCollision()) {
            this.goalTriggered = true;
            this.handlePlayerWin();
            return;
        }

        if (this.player.y > this.canvas.height + 100) {
            this.handlePlayerFall();
            return;
        }

        // 7. ZULETZT Black Hole Death Check (nach allem anderen)
        if (this.currentLevel.blackHoles) {
            if (this.checkBlackHoleDeath()) {
                return;
            }
        }

        this.particleSystem.update(deltaTime);
    }

    applyBlackHoleGravity(deltaTime) {
        this.currentLevel.blackHoles.forEach(hole => {
            const holeCenterX = hole.x + hole.width / 2;
            const holeCenterY = hole.y + hole.height / 2;
            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            
            const dx = holeCenterX - playerCenterX;
            const dy = holeCenterY - playerCenterY;
            const distanceSquared = dx * dx + dy * dy;
            const distance = Math.sqrt(distanceSquared);
            
            if (distance < hole.pullRadius && distance > 0.1) {
                const dirX = dx / distance;
                const dirY = dy / distance;
                
                // NEUE FORMEL: Viel stärker über große Distanz
                // Verwendet Linear + Quadratic Mix für sanften aber starken Pull
                const distanceRatio = distance / hole.pullRadius;
                const linearComponent = (1 - distanceRatio) * 0.7;
                const quadraticComponent = (1 - distanceRatio * distanceRatio) * 0.3;
                const forceMagnitude = hole.pullStrength * (linearComponent + quadraticComponent) * 1.5;
                
                // Extreme Danger Zone
                const dangerZone = hole.killRadius * 5; // Noch größer
                let forceMultiplier = 1.0;
                
                if (distance < dangerZone) {
                    const dangerRatio = 1 - (distance / dangerZone);
                    forceMultiplier = 1 + (dangerRatio * dangerRatio * 12); // EXTREM (war 8)
                }
                
                const finalForce = forceMagnitude * forceMultiplier;
                
                this.player.velocityX += dirX * finalForce * deltaTime;
                this.player.velocityY += dirY * finalForce * deltaTime;
                
                // Noch höherer Velocity Cap
                const maxVelocity = 1200;
                const currentSpeed = Math.sqrt(
                    this.player.velocityX * this.player.velocityX + 
                    this.player.velocityY * this.player.velocityY
                );
                
                if (currentSpeed > maxVelocity) {
                    const scale = maxVelocity / currentSpeed;
                    this.player.velocityX *= scale;
                    this.player.velocityY *= scale;
                }
                
                // Noch weniger Luftwiderstand
                if (distance < dangerZone) {
                    const dragFactor = 0.98; // Minimal (war 0.97)
                    this.player.velocityX *= Math.pow(dragFactor, deltaTime * 60);
                    this.player.velocityY *= Math.pow(dragFactor, deltaTime * 60);
                }
                
                this.createBlackHoleEffects(
                    holeCenterX, 
                    holeCenterY, 
                    playerCenterX, 
                    playerCenterY, 
                    distance, 
                    hole
                );
            }
        });
    }

    checkBlackHoleDeath() {
        for (let hole of this.currentLevel.blackHoles) {
            const holeCenterX = hole.x + hole.width / 2;
            const holeCenterY = hole.y + hole.height / 2;
            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            
            const dx = holeCenterX - playerCenterX;
            const dy = holeCenterY - playerCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Event Horizon - Point of No Return
            if (distance < hole.killRadius) {
                this.handleBlackHoleDeath(holeCenterX, holeCenterY);
                return true;
            }
        }
        return false;
    }

    createBlackHoleEffects(holeCenterX, holeCenterY, playerCenterX, playerCenterY, distance, hole) {
        // Intensität basierend auf Distanz
        const intensity = 1 - (distance / hole.pullRadius);
        
        // Spiral-Partikel (häufiger je näher)
        if (Math.random() < intensity * 0.8) {
            const ringRadius = distance * (0.6 + Math.random() * 0.3);
            const angle = Math.random() * Math.PI * 2;
            
            const particleX = holeCenterX + Math.cos(angle) * ringRadius;
            const particleY = holeCenterY + Math.sin(angle) * ringRadius;
            
            // Vektor zum Zentrum
            const toHoleX = holeCenterX - particleX;
            const toHoleY = holeCenterY - particleY;
            const toHoleDist = Math.sqrt(toHoleX * toHoleX + toHoleY * toHoleY);
            
            // Spiral: Radial + Tangential
            const radialSpeed = 120 * intensity;
            const tangentialSpeed = 80 * intensity;
            const tangentAngle = angle + Math.PI / 2;
            
            this.particleSystem.particles.push({
                x: particleX,
                y: particleY,
                velocityX: (toHoleX / toHoleDist) * radialSpeed + Math.cos(tangentAngle) * tangentialSpeed,
                velocityY: (toHoleY / toHoleDist) * radialSpeed + Math.sin(tangentAngle) * tangentialSpeed,
                life: 0.6,
                color: intensity > 0.7 ? '#2a2a2a' : '#555555',
                gravity: 0,
                size: 2 + intensity * 3
            });
        }
        
        // Player Distortion (sehr nah)
        if (distance < hole.killRadius * 2.5 && Math.random() < 0.4) {
            this.particleSystem.particles.push({
                x: playerCenterX + (Math.random() - 0.5) * 40,
                y: playerCenterY + (Math.random() - 0.5) * 40,
                velocityX: (holeCenterX - playerCenterX) * 0.3,
                velocityY: (holeCenterY - playerCenterY) * 0.3,
                life: 0.5,
                color: '#666666',
                gravity: 0,
                size: 2
            });
        }
        
        // Danger Warning (extrem nah)
        if (distance < hole.killRadius * 1.3 && Math.random() < 0.2) {
            this.particleSystem.particles.push({
                x: playerCenterX,
                y: playerCenterY,
                velocityX: (Math.random() - 0.5) * 100,
                velocityY: (Math.random() - 0.5) * 100,
                life: 0.3,
                color: '#ff3333',
                gravity: 0,
                size: 5
            });
        }
    }

    createGlueSlimeParticles() {
        // Create particles more frequently for trail effect
        if (Math.random() > 0.3) return;

        // Find which glue platform we're touching
        for (let platform of this.currentLevel.gluePlatforms) {
            if (this.physics.checkAABB(this.player, platform)) {
                const overlapLeft = (this.player.x + this.player.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - this.player.x;
                const overlapTop = (this.player.y + this.player.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - this.player.y;
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                let particleX, particleY;

                // Only create particles when on TOP of platform (like walking trail)
                if (minOverlap === overlapTop && this.player.velocityY >= -10) {
                    // Create particles at the contact point (bottom of player on platform surface)
                    particleX = this.player.x + this.player.width / 2 + (Math.random() - 0.5) * this.player.width * 0.8;
                    particleY = platform.y; // On the platform surface
                    
                    // Slime colors - bright blue
                    const slimeColors = ['#7DD3FC', '#38BDF8', '#0EA5E9', '#60A5FA'];
                    
                    // Create 1-2 particles that stay on the ground
                    const numParticles = Math.random() < 0.5 ? 1 : 2;
                    for (let i = 0; i < numParticles; i++) {
                        this.particleSystem.particles.push({
                            x: particleX + (Math.random() - 0.5) * 15,
                            y: particleY + (Math.random() - 0.5) * 3,
                            velocityX: (Math.random() - 0.5) * 20, // Small horizontal spread
                            velocityY: 0, // No vertical movement - stays on ground
                            life: 1.5 + Math.random() * 1.0,
                            color: slimeColors[Math.floor(Math.random() * slimeColors.length)],
                            gravity: 0, // No gravity - particles stay where they are
                            size: 2 + Math.random() * 3
                        });
                    }
                }

                break;
            }
        }
    }

    handleBlackHoleDeath(holeX, holeY) {
        this.stateManager.setState(GAME_STATES.DEAD);
        
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        
        // Explosion von Partikeln die ins Loch gesaugt werden
        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 2 + Math.random() * 0.3;
            const speed = 80 + Math.random() * 120;
            
            this.particleSystem.particles.push({
                x: playerCenterX + (Math.random() - 0.5) * 20,
                y: playerCenterY + (Math.random() - 0.5) * 20,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 1.2,
                color: ['#ff4444', '#333333', '#666666', '#888888'][i % 4],
                gravity: 0,
                size: 2 + Math.random() * 4,
                blackHole: { x: holeX, y: holeY, strength: 500 }
            });
        }
        
        setTimeout(() => this.reset(), 1200);
    }

    updateTimer() {
        const minutes = Math.floor(this.levelTime / 60);
        const seconds = Math.floor(this.levelTime % 60);
        this.timerElement.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateSpeedrunTimer() {
        const minutes = Math.floor(this.speedrunTime / 60);
        const seconds = Math.floor(this.speedrunTime % 60);
        const milliseconds = Math.floor((this.speedrunTime % 1) * 100);
        this.timerElement.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
    }

    updateSuckEffect(deltaTime) {
        this.suckProgress += deltaTime * 2;
        
        const goalCenterX = this.currentLevel.goal.x + this.currentLevel.goal.width / 2;
        const goalCenterY = this.currentLevel.goal.y + this.currentLevel.goal.height / 2;
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        
        const dx = goalCenterX - playerCenterX;
        const dy = goalCenterY - playerCenterY;
        
        this.player.x += dx * deltaTime * 5;
        this.player.y += dy * deltaTime * 5;
        
        this.player.rotation += deltaTime * 10;
        
        const shrinkFactor = 1 - this.suckProgress;
        this.player.width = 40 * Math.max(0, shrinkFactor);
        this.player.height = 40 * Math.max(0, shrinkFactor);
        
        // World-abhängige Partikel
        if (Math.random() > 0.7) {
            const color = this.currentWorld === 2 ? '#87CEEB' : '#FFB3D9';
            this.particleSystem.emit(
                playerCenterX,
                playerCenterY,
                color
            );
        }
        
        this.particleSystem.update(deltaTime);
        
        // After 0.5 seconds: Level won
        if (this.suckProgress >= 0.5) {
            this.stateManager.setState(GAME_STATES.WON);
            this.showVictoryScreen();
        }
    }

    showVictoryScreen() {
        if (this.isSpeedrunMode) {
            // In speedrun mode: Show only short transition
            this.stateManager.setState(GAME_STATES.WON);
            
            setTimeout(() => {
                // Check if speedrun is complete
                let isComplete = false;
                if (this.isIronmanMode) {
                    // Calculate actual level number within the world (1-9)
                    const levelInWorld = this.ironmanCurrentWorld === 2 
                        ? this.currentLevelNumber - 100 
                        : this.currentLevelNumber;
                    const totalCompleted = ((this.ironmanCurrentWorld - 1) * 9) + levelInWorld;
                    isComplete = totalCompleted >= 18;
                } else if (this.speedrunWorld === 2) {
                    const currentW2Level = this.currentLevelNumber - 100;
                    isComplete = currentW2Level >= 9;
                } else {
                    // World 1
                    isComplete = this.currentLevelNumber >= 9;
                }

                if (isComplete) {
                    this.finishSpeedrun();
                } else {
                    this.loadNextSpeedrunLevel();
                }
            }, 500);
        } else {
            // Normaler Modus
            const stars = this.calculateStars();
            
            // Prüfe ob es ein nächstes Level gibt
            let hasNextLevel = false;
            if (this.currentWorld === 2) {
                hasNextLevel = this.currentLevelNumber < 109;
            } else {
                hasNextLevel = this.currentLevelNumber < this.totalLevels && this.currentLevelNumber > 0;
            }
            
            this.victoryScreen.show(this.levelTime, stars, hasNextLevel, this.currentWorld);
            
            // Sterne speichern für beide Welten
            if (this.currentWorld === 1 && this.currentLevelNumber > 0 && this.currentLevelNumber <= 9) {
                const levelId = `level${this.currentLevelNumber}`;
                console.log(`Saving stars for ${levelId}: ${stars}`);
                this.levelSelect.updateLevelStars(levelId, stars);
            } else if (this.currentWorld === 2 && this.currentLevelNumber >= 101 && this.currentLevelNumber <= 109) {
                const levelNumber = this.currentLevelNumber - 100;
                const levelId = `world2-level${levelNumber}`;
                console.log(`Saving stars for ${levelId}: ${stars}`);
                this.levelSelect.updateLevelStars(levelId, stars);
            }
        }
    }

    calculateStars() {
        if (this.levelTime <= this.currentLevel.threeStarTime) return 3;
        if (this.levelTime <= this.currentLevel.twoStarTime) return 2;
        return 1;
    }

    checkSpikesCollision() {
        // Statische Spikes
        for (let spike of this.currentLevel.spikes) {
            if (this.physics.checkAABB(this.player, spike)) {
                return true;
            }
        }
        
        // Bewegliche Spikes
        if (this.currentLevel.movingSpikes) {
            for (let spike of this.currentLevel.movingSpikes) {
                if (this.physics.checkAABB(this.player, spike)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    checkGoalCollision() {
        return this.physics.checkAABB(this.player, this.currentLevel.goal);
    }

    checkProjectileCollision() {
        for (let projectile of this.projectiles) {
            if (this.physics.checkAABB(this.player, projectile)) {
                return true;
            }
        }
        return false;
    }

    handlePlayerDeath() {
        // Ironman mode: death means complete restart
        if (this.isIronmanMode) {
            this.stateManager.setState(GAME_STATES.DEAD);
            this.createDeathParticles();
            setTimeout(() => {
                // Auto-restart Ironman mode without confirmation
                this.startIronman();
            }, 800);
        } else {
            this.stateManager.setState(GAME_STATES.DEAD);
            this.createDeathParticles();
            setTimeout(() => this.reset(), 800);
        }
    }

    createDeathParticles() {
        // World-dependent colors
        const colors = this.currentWorld === 2
            ? ['#87CEEB', '#4682B4', '#2C5282', '#ffffff']  // Blue
            : ['#FFB3D9', '#FF8FC7', '#FF6BB5', '#ffffff']; // Pink

        for (let i = 0; i < 20; i++) {
            this.particleSystem.emit(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                colors[Math.floor(Math.random() * colors.length)]
            );
        }
    }

    handlePlayerWin() {
        this.stateManager.setState(GAME_STATES.SUCKING);
        this.suckProgress = 0;
    }

    handlePlayerFall() {
        // Create particles at bottom of screen where player disappeared
        const fallX = this.player.x + this.player.width / 2;
        const fallY = this.canvas.height;

        this.stateManager.setState(GAME_STATES.DEAD);
        this.createFallParticles(fallX, fallY);
        
        // Check if Ironman mode - restart from beginning
        if (this.isIronmanMode) {
            setTimeout(() => this.startIronman(), 800);
        } else {
            setTimeout(() => this.reset(), 800);
        }
    }

    createFallParticles(x, y) {
        // World-abhängige Farben
        const colors = this.currentWorld === 2
            ? ['#87CEEB', '#4682B4', '#2C5282', '#ffffff']
            : ['#FFB3D9', '#FF8FC7', '#FF6BB5', '#ffffff'];
        
        for (let i = 0; i < 25; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
            const speed = 200 + Math.random() * 300;
            
            this.particleSystem.particles.push({
                x: x + (Math.random() - 0.5) * 40,
                y: y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 1.0,
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: 800
            });
        }
    }

    reset() {
        this.player = new Player(100, 500);
        this.player.resetToStanding();
        
        if (this.currentLevel && this.currentLevel.start) {
            this.player.x = this.currentLevel.start.x;
            this.player.y = this.currentLevel.start.y;
        }
        
        this.stateManager.setState(GAME_STATES.PLAYING);
        this.particleSystem.particles = [];
        this.goalTriggered = false; // Reset goal flag
        this.projectiles = []; // Reset projectiles

        if (!this.isSpeedrunMode) {
            this.levelTime = 0;
            this.timerStarted = false;
        } else {
            // In speedrun mode: reset timer if dying in first level
            const isFirstLevel = this.speedrunWorld === 2 ? this.currentLevelNumber === 101 : this.currentLevelNumber === 1;
            if (isFirstLevel) {
                this.speedrunTime = 0;
                this.timerStarted = false;
            }
        }

        this.suckProgress = 0;
        
        if (this.currentLevel?.crumblingPlatforms) {
            this.currentLevel.crumblingPlatforms.forEach(p => p.reset());
        }
        
        if (this.currentLevel?.blinkingPlatforms) {
            this.currentLevel.blinkingPlatforms.forEach(p => p.reset());
        }
        
        if (this.currentLevel?.movingSpikes) {
            this.currentLevel.movingSpikes.forEach(spike => {
                spike.x = spike.startX;
                spike.direction = 1;
            });
        }
    }

    render() {
        this.renderer.clear();

        if (this.stateManager.isEditor()) {
            this.levelEditor.render();
            return;
        }

        if (this.currentLevel && !this.stateManager.isMenu()) {
            this.renderer.drawLevel(this.currentLevel);

            // Draw projectiles
            this.renderer.drawProjectiles(this.projectiles);

            if (!this.stateManager.isDead() && this.player.width > 0) {
                this.renderer.drawPlayer(this.player);
            }

            this.renderer.drawParticles(this.particleSystem);
        }
    }

    start() {
        let lastTime = 0;
        const gameLoop = (timestamp) => {
            const deltaTime = (timestamp - lastTime) / 1000;
            lastTime = timestamp;

            this.update(Math.min(deltaTime, 0.1));
            this.render();

            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    }
}
