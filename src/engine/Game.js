import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';
import { Player } from '../entities/Player.js';
import { CANVAS, PLAYER, LEVEL, GAME_STATES } from '../config/Constants.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { VictoryScreen } from '../ui/VictoryScreen.js';
import { LevelSelect } from '../ui/LevelSelect.js';
import { ChallengesMenu } from '../ui/ChallengesMenu.js';
import { SettingsMenu } from '../ui/SettingsMenu.js';
import { SkinMenu } from '../ui/SkinMenu.js';
import { SkinMenu3D } from '../ui/SkinMenu3D.js';
import { TouchControls } from '../ui/TouchControls.js';
import { SideDecorations } from '../ui/SideDecorations.js';
import { LevelEditor } from '../editor/LevelEditor.js';
import { SpeedrunManager } from '../speedrun/SpeedrunManager.js';
import { InputManager } from '../managers/InputManager.js';
import { StateManager } from '../managers/StateManager.js';
import { LevelManager } from '../managers/LevelManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { ProgressionManager } from '../managers/ProgressionManager.js';
import { UnlockScreen } from '../ui/UnlockScreen.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.width = CANVAS.WIDTH;
        this.canvas.height = CANVAS.HEIGHT;
        this.ctx = canvas.getContext('2d');

        // Core systems
        this.renderer = new Renderer(canvas);
        this.physics = new Physics();
        this.particleSystem = new ParticleSystem();

        // Managers
        this.inputManager = new InputManager();
        this.stateManager = new StateManager();
        this.levelManager = new LevelManager();
        this.soundManager = new SoundManager();
        this.progressionManager = new ProgressionManager();

        // UI components
        this.victoryScreen = new VictoryScreen();
        this.levelSelect = new LevelSelect();
        this.challengesMenu = new ChallengesMenu();
        this.settingsMenu = new SettingsMenu();
        this.skinMenu = new SkinMenu();
        this.skinMenu3D = new SkinMenu3D(this.progressionManager);
        this.unlockScreen = new UnlockScreen();
        this.levelEditor = new LevelEditor(canvas, this);
        this.touchControls = new TouchControls(this.inputManager, this.stateManager);
        this.sideDecorations = new SideDecorations();

        // Set Game reference for UI components
        this.levelSelect.setGame(this);
        this.challengesMenu.setGame(this);
        this.settingsMenu.setTouchControls(this.touchControls);
        this.settingsMenu.setSoundManager(this.soundManager);
        
        // Make SkinMenu available globally for Renderer (use 3D version)
        window.SkinMenu = SkinMenu3D;

        // Home button and HUD
        this.hud = document.getElementById('hud');
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
        this.playerProjectiles = []; // Projectiles shot by turret skin

        // Turret skin timer
        this.turretShootTimer = 0;
        this.turretShootInterval = 2.0; // Shoot every 2 seconds

        // Setup
        this.setupInputHandlers();
        this.showLevelSelect();
    }

    setupHomeButton() {
        this.homeButton.addEventListener('click', () => {
            if (this.isSpeedrunMode || this.isIronmanMode) {
                // Exit speedrun/ironman mode and return to challenges menu
                this.exitSpeedrun();
            } else if (this.stateManager.isPlaying()) {
                // Regular gameplay - return to level select
                this.stateManager.setState(GAME_STATES.MENU);
                this.showLevelSelect();
            }
        });
    }

    drawHomeIcon() {
        const canvas = this.homeButton.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Clear canvas before redrawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

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
                // Show unlock screens if any, then load next level
                if (this.pendingUnlocks && this.pendingUnlocks.length > 0) {
                    this.showUnlockScreens(this.pendingUnlocks, () => {
                        this.pendingUnlocks = null;
                        this.loadNextLevel();
                    });
                } else {
                    this.loadNextLevel();
                }
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

            // K to open skins (when in menu)
            if (e.code === 'KeyK' && this.stateManager.isMenu()) {
                this.showSkins();
            }

            // L to unlock all (admin)
            if (e.code === 'KeyL' && this.stateManager.isMenu()) {
                this.progressionManager.unlockAll();
                this.levelSelect.refresh();
                this.challengesMenu.refresh();
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
                // Show unlock screens if any, then show level select
                if (this.pendingUnlocks && this.pendingUnlocks.length > 0) {
                    this.showUnlockScreens(this.pendingUnlocks, () => {
                        this.pendingUnlocks = null;
                        this.showLevelSelect();
                    });
                } else {
                    this.showLevelSelect();
                }
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
        this.drawHomeIcon(); // Update home button color for world theme
        this.soundManager.playMusic(2); // Play world 2 music
        if (this.sideDecorations) this.sideDecorations.setWorld(2);
        this.reset();
    }

    loadWorld3Level(levelNumber) {
        const levelInfo = this.levelManager.loadWorld3Level(levelNumber);
        this.currentLevel = levelInfo.level;
        this.currentLevelNumber = this.levelManager.getCurrentLevelNumber();
        this.currentWorld = 3;
        this.levelInfoElement.textContent = levelInfo.displayName;
        this.drawHomeIcon(); // Update home button color for world theme
        this.soundManager.playMusic(3); // Play world 3 music
        if (this.sideDecorations) this.sideDecorations.setWorld(3);
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

        if (this.sideDecorations) this.sideDecorations.setWorld(1);

        this.drawHomeIcon(); // Update home button color for world theme
        this.soundManager.playMusic(1); // Play world 1 music
        this.reset();
    }

    loadCustomLevel(levelData) {
        const levelInfo = this.levelManager.loadCustomLevel(levelData);
        this.currentLevel = levelInfo.level;
        this.currentLevelNumber = 0;
        this.currentWorld = 1;
        this.levelInfoElement.textContent = levelInfo.displayName;
        this.drawHomeIcon(); // Update home button color for world theme
        this.reset();
    }

    showLevelSelect() {
        this.stateManager.setState(GAME_STATES.MENU);
        this.soundManager.stopMusic(); // Stop music when returning to menu

        // Hide HUD and canvas background when in menu
        if (this.hud) this.hud.classList.remove('show');
        this.canvas.classList.remove('playing');

        // Set theme based on current world
        this.levelManager.setWorldTheme(this.currentWorld);
        this.drawHomeIcon(); // Update home button color for world theme

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
            this.drawHomeIcon(); // Update home button color for world theme
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
            this.levelInfoElement.textContent = 'LEVEL 1/9';
        } else if (world === 2) {
            this.loadWorld2Level(1);
            this.levelInfoElement.textContent = 'LEVEL 1/9';
        } else if (world === 3) {
            this.loadWorld3Level(1);
            this.levelInfoElement.textContent = 'LEVEL 1/9';
        }
    }

    startIronman() {
        // Reset all ironman state FIRST before loading level
        this.isIronmanMode = true;
        this.isSpeedrunMode = true; // Uses speedrun timer
        this.speedrunTime = 0;
        this.timerStarted = false;
        this.ironmanCurrentWorld = 1;
        this.ironmanTotalLevels = 27; // 9 levels per world × 3 worlds
        
        this.loadLevel(1);
        this.levelInfoElement.textContent = 'W1 L1 (1/27)';
    }

    loadNextSpeedrunLevel() {
        if (this.isIronmanMode) {
            // Ironman mode: progress through all 3 worlds
            // Calculate actual level number within the world (1-9)
            let levelInWorld;
            if (this.ironmanCurrentWorld === 3) {
                levelInWorld = this.currentLevelNumber - 200;
            } else if (this.ironmanCurrentWorld === 2) {
                levelInWorld = this.currentLevelNumber - 100;
            } else {
                levelInWorld = this.currentLevelNumber;
            }
            
            const totalCompleted = ((this.ironmanCurrentWorld - 1) * 9) + levelInWorld;
            
            if (totalCompleted < 27) {
                if (this.ironmanCurrentWorld === 1 && levelInWorld < 9) {
                    // Continue in World 1
                    this.loadLevel(this.currentLevelNumber + 1);
                    this.levelInfoElement.textContent = `W1 L${this.currentLevelNumber} (${totalCompleted + 1}/27)`;
                } else if (this.ironmanCurrentWorld === 1 && levelInWorld === 9) {
                    // Move to World 2
                    this.ironmanCurrentWorld = 2;
                    this.loadWorld2Level(1);
                    this.levelInfoElement.textContent = `W2 L1 (10/27)`;
                } else if (this.ironmanCurrentWorld === 2 && levelInWorld < 9) {
                    // Continue in World 2
                    const nextLevel = levelInWorld + 1;
                    this.loadWorld2Level(nextLevel);
                    this.levelInfoElement.textContent = `W2 L${nextLevel} (${totalCompleted + 1}/27)`;
                } else if (this.ironmanCurrentWorld === 2 && levelInWorld === 9) {
                    // Move to World 3
                    this.ironmanCurrentWorld = 3;
                    this.loadWorld3Level(1);
                    this.levelInfoElement.textContent = `W3 L1 (19/27)`;
                } else if (this.ironmanCurrentWorld === 3 && levelInWorld < 9) {
                    // Continue in World 3
                    const nextLevel = levelInWorld + 1;
                    this.loadWorld3Level(nextLevel);
                    this.levelInfoElement.textContent = `W3 L${nextLevel} (${totalCompleted + 1}/27)`;
                }
            } else {
                // Ironman complete!
                this.finishIronman();
            }
        } else if (this.speedrunWorld === 3) {
            // World 3 Speedrun
            const currentW3Level = this.currentLevelNumber - 200;
            if (currentW3Level < 9) {
                const nextLevel = currentW3Level + 1;
                this.loadWorld3Level(nextLevel);
                this.levelInfoElement.textContent = `LEVEL ${nextLevel}/9`;
            } else {
                this.finishSpeedrun();
            }
        } else if (this.speedrunWorld === 2) {
            // World 2 Speedrun
            const currentW2Level = this.currentLevelNumber - 100;
            if (currentW2Level < 9) {
                const nextLevel = currentW2Level + 1;
                this.loadWorld2Level(nextLevel);
                this.levelInfoElement.textContent = `LEVEL ${nextLevel}/9`;
            } else {
                this.finishSpeedrun();
            }
        } else {
            // World 1 Speedrun
            if (this.currentLevelNumber < 9) {
                this.loadLevel(this.currentLevelNumber + 1);
                this.levelInfoElement.textContent = `LEVEL ${this.currentLevelNumber}/9`;
            } else {
                this.finishSpeedrun();
            }
        }
    }

    finishSpeedrun() {
        const leaderboardType = this.isIronmanMode ? 'ironman' : 
                               this.speedrunWorld === 3 ? 'world3' :
                               this.speedrunWorld === 2 ? 'world2' : 'world1';
        
        this.isSpeedrunMode = false;
        this.isIronmanMode = false;
        this.stateManager.setState(GAME_STATES.SPEEDRUN_FINISHED);
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
        this.showChallengesMenu();
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

    showSkins() {
        this.levelSelect.hide();
        this.challengesMenu.hide();
        this.skinMenu3D.show(() => {
            this.showLevelSelect();
        }, this.currentWorld);
    }

    returnToEditor() {
        // Return to editor after testing
        this.levelEditor.isTesting = false;
        this.levelEditor.open();
    }

    update(deltaTime) {
        // Update side decorations animation
        if (this.sideDecorations) {
            this.sideDecorations.update(deltaTime);
        }

        // Skip update for menu, editor, or finished states
        if (this.stateManager.isMenu() || this.stateManager.isEditor() || this.stateManager.getState() === GAME_STATES.SPEEDRUN_FINISHED) {
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

        // Update moving platforms
        if (this.currentLevel.movingPlatforms) {
            this.currentLevel.movingPlatforms.forEach(platform => {
                platform.update(deltaTime);
            });
        }

        // Update pressure platforms
        if (this.currentLevel.pressurePlatforms) {
            this.currentLevel.pressurePlatforms.forEach(platform => {
                platform.update(deltaTime);
            });
        }

        // Update triggered spikes
        if (this.currentLevel.triggeredSpikes) {
            this.currentLevel.triggeredSpikes.forEach(spike => {
                spike.update(deltaTime);
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

                    // Play shoot sound with distance-based volume
                    const turretCenterX = turret.x + turret.width / 2;
                    const turretCenterY = turret.y + turret.height / 2;
                    const playerCenterX = this.player.x + this.player.width / 2;
                    const playerCenterY = this.player.y + this.player.height / 2;
                    const dx = turretCenterX - playerCenterX;
                    const dy = turretCenterY - playerCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    this.soundManager.playShoot(distance);
                }
            });
        }

        // Turret skin shooting mechanic
        const selectedSkin = localStorage.getItem('selectedSkin') || 'default';
        if (selectedSkin === 'turret') {
            this.turretShootTimer += deltaTime;

            const chargeDuration = 0.5; // 0.5 seconds charge animation like real turrets
            const timeUntilFire = this.turretShootInterval - this.turretShootTimer;

            // Charging state (like real turrets)
            if (timeUntilFire <= chargeDuration && timeUntilFire > 0) {
                this.player.turretIsCharging = true;
                this.player.turretChargingIndicator = 1 - (timeUntilFire / chargeDuration);
            } else {
                this.player.turretIsCharging = false;
                this.player.turretChargingIndicator = 0;
            }

            if (this.turretShootTimer >= this.turretShootInterval) {
                // Shoot projectile
                const playerCenterX = this.player.x + this.player.width / 2;
                const playerCenterY = this.player.y + this.player.height / 2;

                // Calculate direction based on player rotation
                // Player rotation is in radians
                const rotation = this.player.rotation || 0;
                const speed = 400;

                // Calculate velocity based on rotation angle
                const velocityX = Math.cos(rotation) * speed;
                const velocityY = Math.sin(rotation) * speed;

                // Calculate spawn position at the edge of the player in the direction of rotation
                const spawnDistance = this.player.width / 2 + 8;
                const spawnX = playerCenterX + Math.cos(rotation) * spawnDistance;
                const spawnY = playerCenterY + Math.sin(rotation) * spawnDistance;

                // Create player projectile in rotation direction
                this.playerProjectiles.push({
                    x: spawnX - 6, // Center the projectile
                    y: spawnY - 6,
                    width: 12,
                    height: 12,
                    velocityX: velocityX,
                    velocityY: velocityY,
                    lifetime: 5.0,
                    rotation: rotation, // Store rotation for rendering
                    isPlayerProjectile: true
                });

                this.turretShootTimer = 0;
                this.player.turretIsCharging = false;
                this.player.turretChargingIndicator = 0;

                // Play shoot sound
                this.soundManager.playShoot(0);
            }
        } else {
            this.turretShootTimer = 0;
            this.player.turretIsCharging = false;
            this.player.turretChargingIndicator = 0;
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.x += projectile.velocityX * deltaTime;
            projectile.y += projectile.velocityY * deltaTime;
            projectile.lifetime -= deltaTime;

            // Check collision with platforms
            let hitPlatform = false;
            
            // Check regular platforms
            if (this.currentLevel.platforms) {
                for (let platform of this.currentLevel.platforms) {
                    if (this.physics.checkAABB(projectile, platform)) {
                        hitPlatform = true;
                        break;
                    }
                }
            }

            // Check glue platforms
            if (!hitPlatform && this.currentLevel.gluePlatforms) {
                for (let platform of this.currentLevel.gluePlatforms) {
                    if (this.physics.checkAABB(projectile, platform)) {
                        hitPlatform = true;
                        break;
                    }
                }
            }

            // Check crumbling platforms
            if (!hitPlatform && this.currentLevel.crumblingPlatforms) {
                for (let platform of this.currentLevel.crumblingPlatforms) {
                    if (this.physics.checkAABB(projectile, platform)) {
                        hitPlatform = true;
                        break;
                    }
                }
            }

            // Check blinking platforms (only if visible)
            if (!hitPlatform && this.currentLevel.blinkingPlatforms) {
                for (let platform of this.currentLevel.blinkingPlatforms) {
                    if (platform.isVisible && this.physics.checkAABB(projectile, platform)) {
                        hitPlatform = true;
                        break;
                    }
                }
            }

            // If projectile hit a platform, create particles and remove it
            if (hitPlatform) {
                // Create impact particles
                const colors = ['#FF4444', '#FF8888', '#CC0000'];
                for (let j = 0; j < 8; j++) {
                    const angle = (Math.PI * 2 * j) / 8;
                    const speed = 50 + Math.random() * 100;
                    this.particleSystem.particles.push({
                        x: projectile.x + projectile.width / 2,
                        y: projectile.y + projectile.height / 2,
                        velocityX: Math.cos(angle) * speed,
                        velocityY: Math.sin(angle) * speed,
                        life: 0.3 + Math.random() * 0.2,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        gravity: 300,
                        size: 2 + Math.random() * 2
                    });
                }
                this.projectiles.splice(i, 1);
                continue;
            }

            // Check black hole attraction
            if (this.currentLevel.blackHoles) {
                for (let hole of this.currentLevel.blackHoles) {
                    const holeCenterX = hole.x + hole.width / 2;
                    const holeCenterY = hole.y + hole.height / 2;
                    const projCenterX = projectile.x + projectile.width / 2;
                    const projCenterY = projectile.y + projectile.height / 2;
                    
                    const dx = holeCenterX - projCenterX;
                    const dy = holeCenterY - projCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // If within pull radius, apply gravity
                    if (distance < hole.pullRadius && distance > 0.1) {
                        const dirX = dx / distance;
                        const dirY = dy / distance;
                        const pullForce = hole.pullStrength * 0.8; // Slightly weaker than player pull
                        
                        projectile.velocityX += dirX * pullForce * deltaTime;
                        projectile.velocityY += dirY * pullForce * deltaTime;
                    }
                    
                    // If within kill radius, destroy projectile
                    if (distance < hole.killRadius) {
                        // Create particles being sucked in
                        for (let j = 0; j < 5; j++) {
                            this.particleSystem.particles.push({
                                x: projectile.x + projectile.width / 2,
                                y: projectile.y + projectile.height / 2,
                                velocityX: dx * 2,
                                velocityY: dy * 2,
                                life: 0.5,
                                color: '#666666',
                                gravity: 0,
                                size: 2,
                                blackHole: { x: holeCenterX, y: holeCenterY, strength: 300 }
                            });
                        }
                        this.projectiles.splice(i, 1);
                        break;
                    }
                }
            }

            // Entferne Projektile die außerhalb des Bildschirms sind oder abgelaufen
            if (projectile.lifetime <= 0 ||
                projectile.x < -50 || projectile.x > this.canvas.width + 50 ||
                projectile.y < -50 || projectile.y > this.canvas.height + 50) {
                this.projectiles.splice(i, 1);
            }
        }

        // Update player projectiles (from turret skin) - same logic but don't hurt player
        for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.playerProjectiles[i];
            projectile.x += projectile.velocityX * deltaTime;
            projectile.y += projectile.velocityY * deltaTime;
            projectile.lifetime -= deltaTime;

            // Check collision with platforms (destroys on any contact)
            let hitSomething = false;

            // Collect all platforms for collision check
            const allPlatforms = [
                ...(this.currentLevel.platforms || []),
                ...(this.currentLevel.gluePlatforms || []),
                ...(this.currentLevel.crumblingPlatforms || []),
                ...(this.currentLevel.blinkingPlatforms || []).filter(p => p.isVisible),
                ...(this.currentLevel.pressurePlatforms || []),
                ...(this.currentLevel.movingPlatforms || []),
                ...(this.currentLevel.turrets || [])
            ];

            for (let platform of allPlatforms) {
                if (this.physics.checkAABB(projectile, platform)) {
                    hitSomething = true;
                    break;
                }
            }

            // If hit something, create impact particles and remove
            if (hitSomething) {
                const colors = ['#6DD5ED', '#87CEEB', '#4682B4']; // Blue projectile colors
                for (let j = 0; j < 8; j++) {
                    const angle = (Math.PI * 2 * j) / 8;
                    const speed = 50 + Math.random() * 100;
                    this.particleSystem.particles.push({
                        x: projectile.x + projectile.width / 2,
                        y: projectile.y + projectile.height / 2,
                        velocityX: Math.cos(angle) * speed,
                        velocityY: Math.sin(angle) * speed,
                        life: 0.3 + Math.random() * 0.2,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        gravity: 300,
                        size: 2 + Math.random() * 2
                    });
                }
                this.playerProjectiles.splice(i, 1);
                continue;
            }

            // Remove if lifetime expired or off-screen
            if (projectile.lifetime <= 0 ||
                projectile.x < -50 || projectile.x > this.canvas.width + 50 ||
                projectile.y < -50 || projectile.y > this.canvas.height + 50) {
                this.playerProjectiles.splice(i, 1);
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

        // 3. Store previous glue state before resetting
        this.player.wasStuckToGlue = this.player.isStuckToGlue;
        this.player.isStuckToGlue = false;

        // 4. DANN Player Update (bewegt sich basierend auf Velocity)
        const jumpCountBefore = this.player.jumpCount;
        this.player.update(deltaTime, input);
        
        // Play jump sound if player jumped
        if (this.player.jumpCount > jumpCountBefore) {
            this.soundManager.playJump();
        }

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

        // Moving platforms - collide and transfer velocity
        if (this.currentLevel.movingPlatforms) {
            this.physics.checkMovingPlatformCollisions(this.player, this.currentLevel.movingPlatforms, deltaTime);
        }

        // Pressure platforms - collide and check for activation
        if (this.currentLevel.pressurePlatforms) {
            this.physics.checkPressurePlatformCollisions(this.player, this.currentLevel.pressurePlatforms);

            // Check for pressure activation after collision resolution
            this.currentLevel.pressurePlatforms.forEach(platform => {
                // Check if player is on top of platform
                const isOnTop = this.player.isGrounded &&
                               this.player.x < platform.x + platform.width &&
                               this.player.x + this.player.width > platform.x &&
                               Math.abs((this.player.y + this.player.height) - platform.y) < 2;

                if (isOnTop) {
                    platform.onPlayerLand(true);
                    platform.wasPlayerOn = true;
                } else {
                    // Player left the platform
                    if (platform.wasPlayerOn) {
                        platform.onPlayerLeave();
                        platform.isPressed = false;
                    }
                }

                // Check collision with integrated spikes
                if (platform.areSpikesDangerous()) {
                    // Create a hitbox for the spikes above the platform
                    const spikeHitbox = {
                        x: platform.x,
                        y: platform.y - platform.currentSpikeHeight,
                        width: platform.width,
                        height: platform.currentSpikeHeight
                    };

                    // Check if player overlaps with the spike area
                    if (this.physics.checkAABB(this.player, spikeHitbox)) {
                        this.handlePlayerDeath();
                        return;
                    }
                }
            });
        }

        // Turrets - solid blocks that player can't jump through
        if (this.currentLevel.turrets) {
            this.physics.checkTurretCollisions(this.player, this.currentLevel.turrets);
        }

        // Enforce world boundaries (prevent escaping left, right, top)
        this.physics.enforceWorldBoundaries(this.player);

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

        // Collectible Check
        if (this.currentLevel.collectible) {
            this.currentLevel.collectible.update(deltaTime);

            if (!this.collectibleThisRun && this.currentLevel.collectible.checkCollision(this.player)) {
                this.currentLevel.collectible.collect();
                this.collectibleThisRun = true;
                // Play a satisfying sound (reuse goal sound for now)
                this.soundManager.playGoal();
            }
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
        this.soundManager.playHit();
        this.soundManager.restartMusic(); // Restart music from beginning
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
        
        // Check if Ironman mode - restart from beginning
        if (this.isIronmanMode) {
            setTimeout(() => this.startIronman(), 1200);
        } else {
            setTimeout(() => this.reset(), 1200);
        }
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
                    isComplete = totalCompleted >= 27;
                } else if (this.speedrunWorld === 3) {
                    const currentW3Level = this.currentLevelNumber - 200;
                    isComplete = currentW3Level >= 9;
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
            
            this.victoryScreen.show(this.levelTime, stars, hasNextLevel, this.currentWorld, this.collectibleThisRun);

            // Reset touch controls to prevent stuck inputs
            if (this.touchControls) {
                this.touchControls.reset();
            }

            // Save collectible if collected this run
            if (this.collectibleThisRun) {
                if (this.currentWorld === 1 && this.currentLevelNumber > 0 && this.currentLevelNumber <= 9) {
                    this.progressionManager.collectCollectible(1, this.currentLevelNumber);
                } else if (this.currentWorld === 2 && this.currentLevelNumber >= 101 && this.currentLevelNumber <= 109) {
                    this.progressionManager.collectCollectible(2, this.currentLevelNumber - 100);
                } else if (this.currentWorld === 3 && this.currentLevelNumber >= 201 && this.currentLevelNumber <= 209) {
                    this.progressionManager.collectCollectible(3, this.currentLevelNumber - 200);
                }
            }

            // Sterne speichern für beide Welten und track unlocks
            let unlocked = [];
            if (this.currentWorld === 1 && this.currentLevelNumber > 0 && this.currentLevelNumber <= 9) {
                const levelId = `level${this.currentLevelNumber}`;
                console.log(`Saving stars for ${levelId}: ${stars}`);
                this.levelSelect.updateLevelStars(levelId, stars);
                // Save to progression manager and get unlocked content
                unlocked = this.progressionManager.completeLevel(1, this.currentLevelNumber, stars);
            } else if (this.currentWorld === 2 && this.currentLevelNumber >= 101 && this.currentLevelNumber <= 109) {
                const levelNumber = this.currentLevelNumber - 100;
                const levelId = `world2-level${levelNumber}`;
                console.log(`Saving stars for ${levelId}: ${stars}`);
                this.levelSelect.updateLevelStars(levelId, stars);
                // Save to progression manager and get unlocked content
                unlocked = this.progressionManager.completeLevel(2, levelNumber, stars);
            } else if (this.currentWorld === 3 && this.currentLevelNumber >= 201 && this.currentLevelNumber <= 209) {
                const levelNumber = this.currentLevelNumber - 200;
                const levelId = `world3-level${levelNumber}`;
                console.log(`Saving stars for ${levelId}: ${stars}`);
                this.levelSelect.updateLevelStars(levelId, stars);
                // Save to progression manager and get unlocked content
                unlocked = this.progressionManager.completeLevel(3, levelNumber, stars);
            }
            
            // Refresh level select to show newly unlocked levels
            this.levelSelect.refresh();
            
            // Store unlocked content to show AFTER victory screen
            this.pendingUnlocks = unlocked.length > 0 ? unlocked : null;
        }
    }

    calculateStars() {
        if (this.levelTime <= this.currentLevel.threeStarTime) return 3;
        if (this.levelTime <= this.currentLevel.twoStarTime) return 2;
        return 1;
    }

    showUnlockScreens(unlocked, onComplete) {
        if (!unlocked || unlocked.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        
        // Chain unlock screens - show speedrun first, then world, then ironman
        let index = 0;
        const showNext = () => {
            if (index >= unlocked.length) {
                if (onComplete) onComplete();
                return;
            }
            
            const item = unlocked[index];
            index++;
            
            // For skins, pass the skinData; for other types, pass null
            const skinData = item.type === 'skin' ? item.skinData : null;
            
            this.unlockScreen.show(item.type, item.world, () => {
                // After animation completes, show next unlock
                showNext();
            }, skinData);
        };
        
        showNext();
    }

    checkSpikesCollision() {
        // Statische Spikes - pixel-perfect collision
        for (let spike of this.currentLevel.spikes) {
            // Use pixel-perfect collision if available
            if (spike.collisionPixels && spike.collisionPixels.length > 0) {
                for (let pixel of spike.collisionPixels) {
                    if (this.physics.checkAABB(this.player, pixel)) {
                        return true;
                    }
                }
            } else {
                // Fallback to bounding box
                if (this.physics.checkAABB(this.player, spike)) {
                    return true;
                }
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

        // Triggered Spikes (only when active)
        if (this.currentLevel.triggeredSpikes) {
            for (let spike of this.currentLevel.triggeredSpikes) {
                if (spike.isActive() && this.physics.checkAABB(this.player, spike)) {
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
        this.soundManager.playHit();
        this.soundManager.restartMusic(); // Restart music from beginning
        
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
        this.soundManager.playGoal();
    }

    handlePlayerFall() {
        // Create particles at bottom of screen where player disappeared
        const fallX = this.player.x + this.player.width / 2;
        const fallY = this.canvas.height;

        this.soundManager.playHit();
        this.soundManager.restartMusic(); // Restart music from beginning
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

        // Show HUD and canvas background when playing
        if (this.hud) this.hud.classList.add('show');
        this.canvas.classList.add('playing');

        this.particleSystem.particles = [];
        this.goalTriggered = false; // Reset goal flag
        this.projectiles = []; // Reset projectiles
        this.playerProjectiles = []; // Reset player projectiles
        this.turretShootTimer = 0; // Reset turret shoot timer
        this.collectibleThisRun = false; // Reset collectible flag for this run

        // Clear all input states to prevent stuck keys/touches
        this.inputManager.clearKeys();

        // Reset touch controls to prevent stuck inputs
        if (this.touchControls) {
            this.touchControls.reset();
        }

        if (!this.isSpeedrunMode) {
            this.levelTime = 0;
            this.timerStarted = false;
        } else {
            // In speedrun mode: reset timer if dying in first level
            // For Ironman: only reset if in World 1 Level 1
            // For regular speedrun: reset if in that world's first level
            let isFirstLevel;
            if (this.isIronmanMode) {
                isFirstLevel = this.currentLevelNumber === 1 && this.ironmanCurrentWorld === 1;
            } else {
                isFirstLevel = this.speedrunWorld === 2 ? this.currentLevelNumber === 101 : this.currentLevelNumber === 1;
            }
            
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

        if (this.currentLevel?.movingPlatforms) {
            this.currentLevel.movingPlatforms.forEach(platform => {
                platform.reset();
            });
        }

        if (this.currentLevel?.pressurePlatforms) {
            this.currentLevel.pressurePlatforms.forEach(platform => {
                platform.reset();
            });
        }

        if (this.currentLevel?.triggeredSpikes) {
            this.currentLevel.triggeredSpikes.forEach(spike => {
                spike.reset();
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

            // Draw collectible
            if (this.currentLevel.collectible) {
                this.currentLevel.collectible.draw(this.ctx);
            }

            // Draw projectiles
            this.renderer.drawProjectiles(this.projectiles);

            // Draw player projectiles (from turret skin) - blue instead of red
            this.renderer.drawPlayerProjectiles(this.playerProjectiles);

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
