import { Level1 } from '../levels/Level1.js';
import { Level2 } from '../levels/Level2.js';
import { Level3 } from '../levels/Level3.js';
import { Level4 } from '../levels/Level4.js';
import { Level5 } from '../levels/Level5.js';
import { Level6 } from '../levels/Level6.js';
import { Level7 } from '../levels/Level7.js';
import { Level8 } from '../levels/Level8.js';
import { Level9 } from '../levels/Level9.js';
import { World2Level1 } from '../levels/World2Level1.js';
import { World2Level2 } from '../levels/World2Level2.js';
import { World2Level3 } from '../levels/World2Level3.js';
import { World2Level4 } from '../levels/World2Level4.js';
import { World2Level5 } from '../levels/World2Level5.js';
import { World2Level6 } from '../levels/World2Level6.js';
import { World2Level7 } from '../levels/World2Level7.js';
import { World2Level8 } from '../levels/World2Level8.js';
import { World2Level9 } from '../levels/World2Level9.js';
import { World3Level1 } from '../levels/World3Level1.js';
import { World3Level2 } from '../levels/World3Level2.js';
import { World3Level3 } from '../levels/World3Level3.js';
import { World3Level4 } from '../levels/World3Level4.js';
import { World3Level5 } from '../levels/World3Level5.js';
import { World3Level6 } from '../levels/World3Level6.js';
import { World3Level7 } from '../levels/World3Level7.js';
import { World3Level8 } from '../levels/World3Level8.js';
import { World3Level9 } from '../levels/World3Level9.js';

export class LevelSelect {
    constructor() {
        this.element = document.getElementById('level-select');
        this.levelButtons = [];
        this.selectedCallback = null;
        this.game = null;
        this.currentWorld = 1; // Aktuelle Welt
        this.totalWorlds = 3; // Anzahl Welten

        this.saveData = this.loadSaveData();
        this.levelClasses = [null, Level1, Level2, Level3, Level4, Level5, Level6, Level7, Level8, Level9];
        this.world2LevelClasses = [null, World2Level1, World2Level2, World2Level3, World2Level4, World2Level5, World2Level6, World2Level7, World2Level8, World2Level9];
        this.world3LevelClasses = [null, World3Level1, World3Level2, World3Level3, World3Level4, World3Level5, World3Level6, World3Level7, World3Level8, World3Level9];
    }

    setGame(game) {
        this.game = game;
    }

    loadSaveData() {
        const saved = localStorage.getItem('cubeJumpProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            level1: 0, level2: 0, level3: 0, level4: 0, level5: 0,
            level6: 0, level7: 0, level8: 0, level9: 0
        };
    }

    show(callback) {
        this.selectedCallback = callback;
        this.element.classList.add('show');
        
        // Setze World-Klasse für Theme
        const worldClass = this.currentWorld === 3 ? 'world-3' : 
                          this.currentWorld === 2 ? 'world-2' : 'world-1';
        document.body.className = worldClass;
        
        this.renderLevels();
        this.createWorldNavigation();
    }

    hide() {
        this.element.classList.remove('show');
    }

    updateLevelStars(levelId, stars) {
        // Prüfe aktuellen Wert
        const currentStars = this.saveData[levelId] || 0;
        
        if (stars > currentStars) {
            this.saveData[levelId] = stars;
            localStorage.setItem('cubeJumpProgress', JSON.stringify(this.saveData));
            console.log(`Updated ${levelId}: ${currentStars} → ${stars}`); // Debug
        }
    }

    createCornerButtons() {
        // Remove old buttons if they exist
        const oldButtons = this.element.querySelector('.corner-buttons');
        if (oldButtons) oldButtons.remove();

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'corner-buttons';

        // Left side container for challenges and skins buttons
        const leftButtons = document.createElement('div');
        leftButtons.className = 'corner-buttons-left';

        // Challenges button
        const challengesBtn = document.createElement('button');
        challengesBtn.className = 'corner-icon-button challenges-button';
        challengesBtn.title = 'Challenges';
        challengesBtn.onclick = () => this.game.showChallengesMenu();
        const challengesCanvas = document.createElement('canvas');
        challengesCanvas.width = 40;
        challengesCanvas.height = 40;
        this.drawTrophy(challengesCanvas);
        challengesBtn.appendChild(challengesCanvas);

        // Skins button
        const skinsBtn = document.createElement('button');
        skinsBtn.className = 'corner-icon-button skins-button';
        skinsBtn.title = 'Skins';
        skinsBtn.onclick = () => this.game.showSkins();
        const skinsCanvas = document.createElement('canvas');
        skinsCanvas.width = 40;
        skinsCanvas.height = 40;
        this.drawCube(skinsCanvas);
        skinsBtn.appendChild(skinsCanvas);

        leftButtons.appendChild(challengesBtn);
        leftButtons.appendChild(skinsBtn);

        // Settings button (top right)
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'corner-icon-button settings-button';
        settingsBtn.title = 'Settings';
        settingsBtn.onclick = () => this.game.showSettings();
        const settingsCanvas = document.createElement('canvas');
        settingsCanvas.width = 40;
        settingsCanvas.height = 40;
        this.drawGear(settingsCanvas);
        settingsBtn.appendChild(settingsCanvas);

        buttonsContainer.appendChild(leftButtons);
        buttonsContainer.appendChild(settingsBtn);

        this.element.querySelector('.level-select-content').appendChild(buttonsContainer);
    }

    createWorldNavigation() {
        // Remove old navigation if exists
        const oldNav = this.element.querySelector('.world-navigation');
        if (oldNav) oldNav.remove();
        
        const navContainer = document.createElement('div');
        navContainer.className = 'world-navigation';
        
        // Left Arrow (nur wenn nicht World 1) - always create placeholder for consistent layout
        const leftArrow = this.createPixelArrow('left');
        if (this.currentWorld > 1) {
            leftArrow.onclick = () => this.changeWorld(this.currentWorld - 1);
        } else {
            leftArrow.style.opacity = '0';
            leftArrow.style.pointerEvents = 'none';
        }
        navContainer.appendChild(leftArrow);
        
        // World Title
        const worldTitle = document.createElement('div');
        worldTitle.className = 'world-title';
        worldTitle.textContent = `WORLD ${this.currentWorld}`;
        worldTitle.style.color = this.currentWorld === 3 ? '#FFD700' :
                                 this.currentWorld === 2 ? '#4682B4' : '#FF69B4';
        navContainer.appendChild(worldTitle);
        
        // Right Arrow (nur wenn nicht letzte Welt) - always create placeholder for consistent layout
        const rightArrow = this.createPixelArrow('right');
        const nextWorld = this.currentWorld + 1;
        const isNextWorldUnlocked = this.game?.progressionManager?.isWorldUnlocked(nextWorld) ?? true;
        
        if (this.currentWorld < this.totalWorlds) {
            if (isNextWorldUnlocked) {
                rightArrow.onclick = () => this.changeWorld(nextWorld);
            } else {
                // Show locked arrow
                rightArrow.style.opacity = '0.3';
                rightArrow.style.pointerEvents = 'none';
                rightArrow.style.filter = 'grayscale(100%)';
                
                // Add pixel lock overlay
                const lockCanvas = document.createElement('canvas');
                lockCanvas.width = 24;
                lockCanvas.height = 24;
                lockCanvas.style.position = 'absolute';
                lockCanvas.style.pointerEvents = 'none';
                lockCanvas.style.left = '50%';
                lockCanvas.style.top = '50%';
                lockCanvas.style.transform = 'translate(-50%, -50%)';
                this.drawPixelLock(lockCanvas);
                const lockWrapper = document.createElement('div');
                lockWrapper.style.position = 'relative';
                lockWrapper.style.display = 'inline-block';
                lockWrapper.appendChild(rightArrow);
                lockWrapper.appendChild(lockCanvas);
                navContainer.appendChild(lockWrapper);
                return; // Don't append rightArrow again
            }
        } else {
            rightArrow.style.opacity = '0';
            rightArrow.style.pointerEvents = 'none';
        }
        navContainer.appendChild(rightArrow);
        
        this.element.querySelector('.level-select-content').appendChild(navContainer);
    }

    createPixelArrow(direction) {
        const arrow = document.createElement('canvas');
        arrow.className = 'world-arrow';
        arrow.width = 60;
        arrow.height = 60;
        
        const ctx = arrow.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Pixel-Art Pfeil Pattern (15x15)
        const arrowPattern = [
            [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0],
            [0,0,0,0,0,0,1,1,1,1,1,1,0,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,0,0,0,0,0,1,1,1,1,1,1,0,0,0],
            [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0],
            [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0]
        ];
        
        const pixelSize = 4;
        const offsetX = direction === 'left' ? 0 : 0;
        const offsetY = 0;
        
        arrowPattern.forEach((row, y) => {
            row.forEach((pixel, x) => {
                if (pixel === 1) {
                    const drawX = direction === 'left' ? (14 - x) : x;
                    
                    // Schatten
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.fillRect(offsetX + drawX * pixelSize + 2, offsetY + y * pixelSize + 2, pixelSize, pixelSize);
                    
                    // Pfeil - Farbe je nach Welt
                    const color = this.currentWorld === 3 ? '#FFD700' :
                                 this.currentWorld === 2 ? '#4682B4' : '#FF69B4';
                    ctx.fillStyle = color;
                    ctx.fillRect(offsetX + drawX * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);
                    
                    // Highlight
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(offsetX + drawX * pixelSize + 1, offsetY + y * pixelSize + 1, pixelSize - 2, pixelSize - 2);
                }
            });
        });
        
        return arrow;
    }

    changeWorld(newWorld) {
        // Check if world is unlocked
        const isUnlocked = this.game?.progressionManager?.isWorldUnlocked(newWorld) ?? true;
        
        if (!isUnlocked) {
            // Don't allow switching to locked world
            return;
        }
        
        this.currentWorld = newWorld;
        
        // Update Body-Klasse für globales Theme
        const worldClass = newWorld === 3 ? 'world-3' : 
                          newWorld === 2 ? 'world-2' : 'world-1';
        document.body.className = worldClass;
        
        this.renderLevels();
        this.createWorldNavigation();
    }

    refresh() {
        // Refresh the level select to show updated progression
        this.renderLevels();
        this.createWorldNavigation();
    }

    renderLevels() {
        const container = this.element.querySelector('.levels-grid');
        container.innerHTML = '';

        // Small icon buttons for challenges, skins, and settings (all worlds)
        this.createCornerButtons();

        // Level depending on world
        if (this.currentWorld === 1) {
            // World 1 Levels
            const levels = [
                { id: 'level1', name: 'Level 1', number: 1 },
                { id: 'level2', name: 'Level 2', number: 2 },
                { id: 'level3', name: 'Level 3', number: 3 },
                { id: 'level4', name: 'Level 4', number: 4 },
                { id: 'level5', name: 'Level 5', number: 5 },
                { id: 'level6', name: 'Level 6', number: 6 },
                { id: 'level7', name: 'Level 7', number: 7 },
                { id: 'level8', name: 'Level 8', number: 8 },
                { id: 'level9', name: 'Level 9', number: 9 }
            ];

            levels.forEach(level => {
                const levelCard = this.createLevelCard(level, 1);
                container.appendChild(levelCard);
            });
        } else if (this.currentWorld === 2) {
            // World 2 Levels
            const levels = [
                { id: 'world2-level1', name: '2-1', number: 1 },
                { id: 'world2-level2', name: '2-2', number: 2 },
                { id: 'world2-level3', name: '2-3', number: 3 },
                { id: 'world2-level4', name: '2-4', number: 4 },
                { id: 'world2-level5', name: '2-5', number: 5 },
                { id: 'world2-level6', name: '2-6', number: 6 },
                { id: 'world2-level7', name: '2-7', number: 7 },
                { id: 'world2-level8', name: '2-8', number: 8 },
                { id: 'world2-level9', name: '2-9', number: 9 }
            ];

            levels.forEach(level => {
                const levelCard = this.createLevelCard(level, 2);
                container.appendChild(levelCard);
            });
        } else if (this.currentWorld === 3) {
            // World 3 Levels
            const levels = [
                { id: 'world3-level1', name: '3-1', number: 1 },
                { id: 'world3-level2', name: '3-2', number: 2 },
                { id: 'world3-level3', name: '3-3', number: 3 },
                { id: 'world3-level4', name: '3-4', number: 4 },
                { id: 'world3-level5', name: '3-5', number: 5 },
                { id: 'world3-level6', name: '3-6', number: 6 },
                { id: 'world3-level7', name: '3-7', number: 7 },
                { id: 'world3-level8', name: '3-8', number: 8 },
                { id: 'world3-level9', name: '3-9', number: 9 }
            ];

            levels.forEach(level => {
                const levelCard = this.createLevelCard(level, 3);
                container.appendChild(levelCard);
            });
        }
        
        // Custom Levels nur in World 1
        if (this.currentWorld === 1) {
            try {
                const customLevels = JSON.parse(localStorage.getItem('customLevels') || '[]');
                customLevels.forEach((customLevel, index) => {
                    const levelCard = this.createCustomLevelCard(customLevel, index);
                    container.appendChild(levelCard);
                });
            } catch (error) {
                console.error('Error loading custom levels:', error);
            }
        }
    }

    createLevelCard(level, world) {
        const card = document.createElement('div');
        card.className = 'level-card';
        card.style.position = 'relative';

        // Check if level is unlocked
        const isUnlocked = this.game?.progressionManager?.isLevelUnlocked(world, level.number) ?? true;
        
        if (!isUnlocked) {
            card.classList.add('locked');
        }

        card.onclick = () => {
            if (!isUnlocked) {
                // Don't allow clicking locked levels
                return;
            }
            
            this.hide();
            if (this.selectedCallback) {
                if (world === 3) {
                    // Lade World 3 Level
                    this.selectedCallback(null, null, { world: 3, level: level.number });
                } else if (world === 2) {
                    // Lade World 2 Level
                    this.selectedCallback(null, null, { world: 2, level: level.number });
                } else {
                    this.selectedCallback(level.number);
                }
            }
        };

        const preview = document.createElement('canvas');
        preview.className = 'level-preview';
        preview.width = 300;
        preview.height = 175;
        this.drawLevelPreview(preview, level.number, world);

        // Draw collectible stamp if collected
        if (isUnlocked && this.game?.progressionManager?.hasCollectible(world, level.number)) {
            this.drawCollectibleStamp(preview, world);
        }

        // Darken preview if locked
        if (!isUnlocked) {
            preview.style.filter = 'brightness(0.3)';
        }

        const info = document.createElement('div');
        info.className = 'level-info';

        const title = document.createElement('div');
        title.className = 'level-title';
        title.textContent = level.name;
        title.style.color = world === 3 ? '#FFD700' : world === 2 ? '#4682B4' : '#000000';

        const starsContainer = document.createElement('div');
        starsContainer.className = 'level-stars';
        
        if (isUnlocked) {
            const earnedStars = this.saveData[level.id] || 0;
            
            // Zeige HERZEN statt Sterne
            for (let i = 0; i < 3; i++) {
                const heart = document.createElement('canvas');
                heart.width = 24;
                heart.height = 24;
                this.drawSmallHeart(heart, i < earnedStars);
                starsContainer.appendChild(heart);
            }
        } else {
            // Show pixelated lock icon
            const lockCanvas = document.createElement('canvas');
            lockCanvas.width = 32;
            lockCanvas.height = 32;
            this.drawPixelLock(lockCanvas);
            starsContainer.appendChild(lockCanvas);
        }

        info.appendChild(title);
        info.appendChild(starsContainer);
        
        card.appendChild(preview);
        card.appendChild(info);

        return card;
    }

    drawLevelPreview(canvas, levelNumber, world = 1) {
        const ctx = canvas.getContext('2d');
        const scale = 0.25;
        
        // World-spezifischer Hintergrund
        if (world === 3) {
            const skyColors = ['#FFFEF0', '#FFFDE6', '#FFFCDC', '#FFFBD2', '#FFFAC8', '#FFF9BE'];
            const stripeHeight = 175 / skyColors.length;
            skyColors.forEach((color, i) => {
                ctx.fillStyle = color;
                ctx.fillRect(0, i * stripeHeight, 300, stripeHeight);
            });
        } else if (world === 2) {
            const skyColors = ['#F0F8FF', '#E6F2FF', '#DCEEFF', '#D2E9FF', '#C8E4FF', '#BFE0FF'];
            const stripeHeight = 175 / skyColors.length;
            skyColors.forEach((color, i) => {
                ctx.fillStyle = color;
                ctx.fillRect(0, i * stripeHeight, 300, stripeHeight);
            });
        } else {
            const skyColors = ['#FFFBFD', '#FFF8FC', '#FFF5FB', '#FFF2FA', '#FFEFF9', '#FFECF8'];
            const stripeHeight = 175 / skyColors.length;
            skyColors.forEach((color, i) => {
                ctx.fillStyle = color;
                ctx.fillRect(0, i * stripeHeight, 300, stripeHeight);
            });
        }
        
        // Lade Level-Daten
        const LevelClass = world === 3 ? this.world3LevelClasses[levelNumber] :
                          world === 2 ? this.world2LevelClasses[levelNumber] : 
                          this.levelClasses[levelNumber];
        if (!LevelClass) return;
        
        const level = new LevelClass();
        this.renderLevelToCanvas(ctx, level, scale);
    }

    renderLevelToCanvas(ctx, level, scale) {
        // Gradient Background (wie im Spiel)
        const skyColors = [
            '#FFFBFD',
            '#FFF8FC',
            '#FFF5FB',
            '#FFF2FA',
            '#FFEFF9',
            '#FFECF8'
        ];
        
        const stripeHeight = (175 / scale) / skyColors.length;
        skyColors.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.fillRect(0, i * stripeHeight * scale, 300, stripeHeight * scale);
        });
        
        // Pixel Grid
        const gridSize = 40;
        const pixelSize = 2;
        ctx.fillStyle = 'rgba(255, 182, 193, 0.04)';
        
        for (let x = gridSize; x < 300 / scale; x += gridSize) {
            for (let y = gridSize; y < 175 / scale; y += gridSize) {
                ctx.fillRect(x * scale - pixelSize/2, y * scale - pixelSize/2, pixelSize, pixelSize);
            }
        }
        
        // Draw platforms mit Schatten
        ctx.fillStyle = '#000000';
        if (level.platforms && Array.isArray(level.platforms)) {
            level.platforms.forEach(p => {
                // Schatten
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(p.x * scale + 2, p.y * scale + 2, p.width * scale, p.height * scale);
                
                // Platform
                ctx.fillStyle = '#000000';
                ctx.fillRect(p.x * scale, p.y * scale, p.width * scale, p.height * scale);
                
                // Highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(p.x * scale + 2, p.y * scale + 2, p.width * scale - 4, 2);
            });
        }

        // Draw spikes - pixelig
        if (level.spikes && Array.isArray(level.spikes)) {
            level.spikes.forEach(s => {
                const x = s.x * scale;
                const y = s.y * scale;
                const width = s.width * scale;
                const height = s.height * scale;
                
                // Schatten
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.moveTo(x + 2, y + height + 2);
                ctx.lineTo(x + width / 2 + 2, y + 2);
                ctx.lineTo(x + width + 2, y + height + 2);
                ctx.closePath();
                ctx.fill();
                
                // Spike - pixel-art style
                ctx.fillStyle = '#000000';
                const steps = 2;
                const stepHeight = height / steps;
                for (let i = 0; i < steps; i++) {
                    const stepWidth = width - (i * 4 * scale);
                    const stepX = x + (i * 2 * scale);
                    const stepY = y + height - (i + 1) * stepHeight;
                    ctx.fillRect(stepX, stepY, stepWidth, stepHeight);
                }
            });
        }
        
        // Draw moving spikes - pixelig
        if (level.movingSpikes && Array.isArray(level.movingSpikes)) {
            level.movingSpikes.forEach(s => {
                const centerX = (s.x + s.width / 2) * scale;
                const centerY = (s.y + s.width / 2) * scale;
                const radius = (s.width / 2) * scale;
                
                // Schatten
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(centerX + 2, centerY + 2, radius * 0.7, 0, Math.PI * 2);
                ctx.fill();
                
                // Ball - pixel-grid
                ctx.fillStyle = '#DC143C';
                const pixelSize = 3 * scale;
                const gridSize = Math.floor(radius * 1.4 / pixelSize);
                for (let py = -gridSize; py <= gridSize; py++) {
                    for (let px = -gridSize; px <= gridSize; px++) {
                        const dist = Math.sqrt(px * px + py * py);
                        if (dist <= gridSize * 0.7) {
                            ctx.fillRect(
                                centerX + px * pixelSize - pixelSize/2,
                                centerY + py * pixelSize - pixelSize/2,
                                pixelSize,
                                pixelSize
                            );
                        }
                    }
                }
            });
        }

        // Draw goal - Pixel Portal
        if (level.goal) {
            const goalX = (level.goal.x + level.goal.width / 2) * scale;
            const goalY = (level.goal.y + level.goal.height / 2) * scale;
            
            // Rotierende Pixel-Quadrate
            const layers = 2;
            for (let layer = 0; layer < layers; layer++) {
                const pixelCount = 6;
                const radius = (25 - layer * 8) * scale;
                
                for (let i = 0; i < pixelCount; i++) {
                    const angle = (i / pixelCount) * Math.PI * 2;
                    const x = goalX + Math.cos(angle) * radius;
                    const y = goalY + Math.sin(angle) * radius;
                    const size = (4 - layer) * scale;
                    
                    ctx.fillStyle = 'rgba(255, 105, 180, 0.6)';
                    ctx.fillRect(x - size/2, y - size/2, size, size);
                }
            }
            
            // Kern
            const coreSize = 8 * scale;
            ctx.fillStyle = '#FFB3D9';
            ctx.fillRect(goalX - coreSize/2, goalY - coreSize/2, coreSize, coreSize);
        }

        // Draw crumbling platforms
        if (level.crumblingPlatforms && Array.isArray(level.crumblingPlatforms)) {
            level.crumblingPlatforms.forEach(p => {
                // Schatten
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(p.x * scale + 2, p.y * scale + 2, p.width * scale, p.height * scale);
                
                // Platform
                ctx.fillStyle = '#000000';
                ctx.fillRect(p.x * scale, p.y * scale, p.width * scale, p.height * scale);
                
                // Risse
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1 * scale;
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.moveTo((p.x + p.width * 0.5) * scale, p.y * scale);
                ctx.lineTo((p.x + p.width * 0.5) * scale, (p.y + p.height) * scale);
                ctx.stroke();
                ctx.globalAlpha = 1;
            });
        }

        // Draw glue platforms
        if (level.gluePlatforms && Array.isArray(level.gluePlatforms)) {
            level.gluePlatforms.forEach(p => {
                // Schatten
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(p.x * scale + 2, p.y * scale + 2, p.width * scale, p.height * scale);
                
                // Platform mit Slime-Farbe (blue like in game)
                ctx.fillStyle = '#00CED1'; // Dark turquoise
                ctx.fillRect(p.x * scale, p.y * scale, p.width * scale, p.height * scale);
                
                // Glänzender Highlight
                ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
                ctx.fillRect(p.x * scale + 2, p.y * scale + 2, p.width * scale - 4, p.height * scale * 0.3);
            });
        }

        // Draw turrets
        if (level.turrets && Array.isArray(level.turrets)) {
            level.turrets.forEach(t => {
                const x = t.x * scale;
                const y = t.y * scale;
                const size = 20 * scale;
                
                // Schatten
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(x + 2, y + 2, size, size);
                
                // Basis (dunkelrot)
                ctx.fillStyle = '#8B0000';
                ctx.fillRect(x, y, size, size);
                
                // Barrel (rot)
                const barrelWidth = size * 0.6;
                const barrelHeight = size * 0.3;
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + size, y + size * 0.35, barrelWidth, barrelHeight);
                
                // Highlight
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.fillRect(x + 2, y + 2, size - 4, size * 0.3);
            });
        }

        // Draw black holes
        if (level.blackHoles && Array.isArray(level.blackHoles)) {
            level.blackHoles.forEach(bh => {
                // Safety check for valid values
                if (!bh.x && bh.x !== 0 || !bh.y && bh.y !== 0) return;
                
                const centerX = bh.x * scale;
                const centerY = bh.y * scale;
                const size = 8 * scale; // Small black dot
                
                // Simple black circle
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
                ctx.fill();
                
                // Purple outline
                ctx.strokeStyle = '#8A2BE2';
                ctx.lineWidth = 2 * scale;
                ctx.beginPath();
                ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
                ctx.stroke();
            });
        }

        // Draw blinking platforms
        if (level.blinkingPlatforms && Array.isArray(level.blinkingPlatforms)) {
            level.blinkingPlatforms.forEach(p => {
                const x = p.x * scale;
                const y = p.y * scale;
                const width = p.width * scale;
                const height = p.height * scale;
                
                // Schatten
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(x + 2, y + 2, width, height);
                
                // Hauptplattform (gelb)
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x, y, width, height);
                
                // Dunkler Rand
                ctx.fillStyle = '#DAA520';
                ctx.fillRect(x, y, width, 2);
                ctx.fillRect(x, y + height - 2, width, 2);
                ctx.fillRect(x, y, 2, height);
                ctx.fillRect(x + width - 2, y, 2, height);
                
                // Highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fillRect(x + 3, y + 3, width - 6, height * 0.3);
            });
        }
    }

    drawSmallStar(canvas, filled) {
        const ctx = canvas.getContext('2d');
        const size = 24;
        ctx.imageSmoothingEnabled = false;
        
        ctx.clearRect(0, 0, size, size);
        
        const starPattern = [
            [0,0,0,0,0,1,1,0,0,0,0,0],
            [0,0,0,0,1,1,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,1,1,1,1,0,0],
            [0,0,1,1,1,0,0,1,1,1,0,0],
            [0,1,1,1,0,0,0,0,1,1,1,0],
            [1,1,1,0,0,0,0,0,0,1,1,1],
            [1,1,0,0,0,0,0,0,0,0,1,1]
        ];
        
        const pixelSize = 2;
        
        if (filled) {
            starPattern.forEach((row, y) => {
                row.forEach((pixel, x) => {
                    if (pixel === 1) {
                        ctx.fillStyle = '#CC8800';
                        ctx.fillRect(x * pixelSize + 1, y * pixelSize + 1, pixelSize, pixelSize);
                        
                        ctx.fillStyle = '#FFD700';
                        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                        
                        if (y < 6) {
                            ctx.fillStyle = '#FFFF00';
                            ctx.fillRect(x * pixelSize + 0.5, y * pixelSize + 0.5, pixelSize - 1, pixelSize - 1);
                        }
                    }
                });
            });
        } else {
            starPattern.forEach((row, y) => {
                row.forEach((pixel, x) => {
                    if (pixel === 1) {
                        const isEdge = 
                            y === 0 || y === 11 ||
                            x === 0 || x === 11 ||
                            (row[x - 1] === 0 || row[x + 1] === 0 ||
                            (starPattern[y - 1] && starPattern[y - 1][x] === 0) ||
                            (starPattern[y + 1] && starPattern[y + 1][x] === 0));
                        
                        if (isEdge) {
                            ctx.fillStyle = '#1a1a1a';
                            ctx.fillRect(x * pixelSize + 1, y * pixelSize + 1, pixelSize, pixelSize);
                            
                            ctx.fillStyle = '#444444';
                            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                        }
                    }
                });
            });
        }
    }

    drawCollectibleStamp(canvas, world) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Draw in top-right corner
        const size = 30;
        const x = canvas.width - size - 8;
        const y = 8;

        // Get world color
        let color;
        if (world === 3) {
            color = '#FFD700'; // Gold
        } else if (world === 2) {
            color = '#87CEEB'; // Sky blue
        } else {
            color = '#FF69B4'; // Hot pink
        }

        // Draw simple blocky circle (octagon) - filled
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const radius = 12;
        const sides = 8;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (Math.PI * 2 / sides) * i;
            const px = centerX + Math.cos(angle) * radius + 2;
            const py = centerY + Math.sin(angle) * radius + 2;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Main shape
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (Math.PI * 2 / sides) * i;
            const px = centerX + Math.cos(angle) * radius;
            const py = centerY + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (Math.PI * 2 / sides) * i;
            const px = centerX - 3 + Math.cos(angle) * 6;
            const py = centerY - 3 + Math.sin(angle) * 6;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Center sparkle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(centerX - 2, centerY - 2, 4, 4);
    }

    drawSmallHeart(canvas, filled) {
        const ctx = canvas.getContext('2d');
        const size = 24;
        ctx.imageSmoothingEnabled = false;

        ctx.clearRect(0, 0, size, size);
        
        // World-abhängige Farben
        const isWorld2 = this.currentWorld === 2;
        const colors = isWorld2
            ? { shadow: '#2C5282', main: '#4682B4', highlight: '#87CEEB' }
            : { shadow: '#CC6699', main: '#FF1493', highlight: '#FF69B4' };
        
        const heartPattern = [
            [0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0]
        ];
        
        const pixelSize = 2.5;
        const offsetX = 2;
        const offsetY = 4;
        
        if (filled) {
            heartPattern.forEach((row, y) => {
                row.forEach((pixel, x) => {
                    if (pixel === 1) {
                        ctx.fillStyle = colors.shadow;
                        ctx.fillRect(offsetX + x * pixelSize + 1, offsetY + y * pixelSize + 1, pixelSize, pixelSize);
                        
                        ctx.fillStyle = colors.main;
                        ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);
                        
                        if (y < 3) {
                            ctx.fillStyle = colors.highlight;
                            ctx.fillRect(offsetX + x * pixelSize + 0.5, offsetY + y * pixelSize + 0.5, pixelSize - 1, pixelSize - 1);
                        }
                    }
                });
            });
        } else {
            // Grau bleibt gleich für leere Herzen
            heartPattern.forEach((row, y) => {
                row.forEach((pixel, x) => {
                    if (pixel === 1) {
                        const isEdge = 
                            (row[x - 1] === 0 || row[x - 1] === undefined) ||
                            (row[x + 1] === 0 || row[x + 1] === undefined) ||
                            (heartPattern[y - 1] && heartPattern[y - 1][x] === 0) ||
                            (heartPattern[y + 1] && heartPattern[y + 1][x] === 0);
                        
                        if (isEdge) {
                            ctx.fillStyle = '#0a0a0a';
                            ctx.fillRect(offsetX + x * pixelSize + 1, offsetY + y * pixelSize + 1, pixelSize, pixelSize);
                            
                            ctx.fillStyle = '#444444';
                            ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);
                        }
                    }
                });
            });
        }
    }

    drawPixelLock(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Pixel art lock pattern (16x16)
        const lockPattern = [
            [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0],
            [0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0],
            [0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0],
            [0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0],
            [0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0],
            [0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0],
            [0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0],
            [0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0],
            [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];
        
        const pixelSize = 2;
        
        lockPattern.forEach((row, y) => {
            row.forEach((pixel, x) => {
                if (pixel === 1) {
                    // Shadow
                    ctx.fillStyle = '#444444';
                    ctx.fillRect(x * pixelSize + 1, y * pixelSize + 1, pixelSize, pixelSize);
                    
                    // Main lock body
                    ctx.fillStyle = '#888888';
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                    
                    // Highlight
                    ctx.fillStyle = '#AAAAAA';
                    ctx.fillRect(x * pixelSize + 0.5, y * pixelSize + 0.5, pixelSize - 1, pixelSize - 1);
                }
            });
        });
    }

    createCustomLevelCard(customLevel, index) {
        const card = document.createElement('div');
        card.className = 'level-card custom-level';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-level-btn';
        deleteBtn.innerHTML = '✕';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.deleteCustomLevel(customLevel.name);
        };
        
        card.onclick = () => {
            this.hide();
            if (this.selectedCallback) {
                this.selectedCallback(null, customLevel);
            }
        };

        const preview = document.createElement('canvas');
        preview.className = 'level-preview';
        preview.width = 300;
        preview.height = 175;
        this.drawCustomLevelPreview(preview, customLevel);

        const info = document.createElement('div');
        info.className = 'level-info';

        const title = document.createElement('div');
        title.className = 'level-title';
        title.textContent = customLevel.name;
        title.style.color = '#FFB3D9';

        const starsContainer = document.createElement('div');
        starsContainer.className = 'level-stars';
        starsContainer.innerHTML = '<span style="font-size: 10px; color: #999;">CUSTOM</span>';

        info.appendChild(title);
        info.appendChild(starsContainer);
        
        card.appendChild(deleteBtn);
        card.appendChild(preview);
        card.appendChild(info);

        return card;
    }

    deleteCustomLevel(levelName) {
        if (!confirm(`Delete level "${levelName}"?`)) {
            return;
        }
        
        const customLevels = JSON.parse(localStorage.getItem('customLevels') || '[]');
        const filteredLevels = customLevels.filter(l => l.name !== levelName);
        
        localStorage.setItem('customLevels', JSON.stringify(filteredLevels));
        this.renderLevels();
    }

    drawCustomLevelPreview(canvas, customLevel) {
        const ctx = canvas.getContext('2d');
        const scale = 0.25;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.renderLevelToCanvas(ctx, customLevel, scale);
    }

    createChallengesCard() {
        const card = document.createElement('div');
        card.className = 'level-card speedrun-card';
        card.onclick = () => {
            this.game.showChallengesMenu();
        };

        const preview = document.createElement('div');
        preview.className = 'speedrun-preview';
        
        // Create canvas for trophy icon
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 60;
        canvas.className = 'speedrun-icon';
        this.drawTrophy(canvas);
        
        const text = document.createElement('div');
        text.className = 'speedrun-text';
        text.textContent = 'CHALLENGES';
        
        const desc = document.createElement('div');
        desc.className = 'speedrun-desc';
        desc.textContent = 'Speedruns & Ironman';
        
        preview.appendChild(canvas);
        preview.appendChild(text);
        preview.appendChild(desc);
        card.appendChild(preview);
        
        return card;
    }

    createSettingsCard() {
        const card = document.createElement('div');
        card.className = 'level-card speedrun-card';
        card.onclick = () => {
            this.game.showSettings();
        };

        const preview = document.createElement('div');
        preview.className = 'speedrun-preview';

        // Create canvas for settings gear icon
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 60;
        canvas.className = 'speedrun-icon';
        this.drawGear(canvas);

        const text = document.createElement('div');
        text.className = 'speedrun-text';
        text.textContent = 'SETTINGS';

        const desc = document.createElement('div');
        desc.className = 'speedrun-desc';
        desc.textContent = 'Controls & Audio';

        preview.appendChild(canvas);
        preview.appendChild(text);
        preview.appendChild(desc);
        card.appendChild(preview);

        return card;
    }

    drawGear(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Pixel art gear - Gray/Silver
        const pixels = [
            [0,0,0,0,0,1,1,0,0,0,0,0],
            [0,0,0,1,1,1,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,1,0,0,0,0,1,1,1,0],
            [0,1,1,0,0,0,0,0,0,1,1,0],
            [1,1,1,0,0,1,1,0,0,1,1,1],
            [1,1,1,0,0,1,1,0,0,1,1,1],
            [0,1,1,0,0,0,0,0,0,1,1,0],
            [0,1,1,1,0,0,0,0,1,1,1,0],
            [0,0,1,1,1,1,1,1,1,1,0,0],
            [0,0,0,1,1,1,1,1,1,0,0,0],
            [0,0,0,0,0,1,1,0,0,0,0,0]
        ];

        const pixelSize = 3; // Reduced from 5 to 3
        const offsetX = 4; // Center in 40x40 canvas
        const offsetY = 2;

        pixels.forEach((row, y) => {
            row.forEach((pixel, x) => {
                if (pixel === 1) {
                    // Silver/gray gradient
                    const shade = y < 6 ? '#C0C0C0' : '#808080';
                    ctx.fillStyle = shade;
                    ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);

                    // Highlight on top
                    if (y < 3 || (y >= 5 && y <= 6 && x >= 5 && x <= 6)) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                        ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize - 1, pixelSize - 1);
                    }
                }
            });
        });
    }

    drawCube(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Simple pixel art cube with eyes
        const size = 3;
        const offsetX = 8;
        const offsetY = 5;

        // Main cube body (8x8 square)
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(offsetX, offsetY, 8 * size, 8 * size);

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(offsetX + size, offsetY + size, 6 * size, 2 * size);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(offsetX, offsetY + 6 * size, 8 * size, 2 * size);

        // Left eye (black)
        ctx.fillStyle = '#000000';
        ctx.fillRect(offsetX + size * 2, offsetY + size * 3, size * 2, size * 2);

        // Right eye (black)
        ctx.fillRect(offsetX + size * 5, offsetY + size * 3, size * 2, size * 2);
    }

    drawTrophy(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Pixel art trophy - Gold
        const pixels = [
            [0,0,1,0,0,0,0,0,0,1,0,0],
            [0,1,1,1,0,0,0,0,1,1,1,0],
            [0,1,0,1,1,0,0,1,1,0,1,0],
            [0,0,1,1,1,1,1,1,1,1,0,0],
            [0,0,0,1,1,1,1,1,1,0,0,0],
            [0,0,0,1,1,1,1,1,1,0,0,0],
            [0,0,0,1,1,1,1,1,1,0,0,0],
            [0,0,0,0,0,1,1,0,0,0,0,0],
            [0,0,0,0,0,1,1,0,0,0,0,0],
            [0,0,0,1,1,1,1,1,1,0,0,0],
            [0,0,0,1,1,1,1,1,1,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0]
        ];

        const pixelSize = 3; // Reduced from 5 to 3
        const offsetX = 2; // Center in 40x40 canvas
        const offsetY = 2;
        pixels.forEach((row, y) => {
            row.forEach((pixel, x) => {
                if (pixel === 1) {
                    // Gold gradient
                    const shade = y < 7 ? '#FFD700' : '#DAA520';
                    ctx.fillStyle = shade;
                    ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);

                    // Highlight on top
                    if (y < 5) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, 2);
                    }
                }
            });
        });
    }

    createSpeedrunCard() {
        const card = document.createElement('div');
        card.className = 'level-card speedrun-card';
        card.onclick = () => {
            this.hide();
            if (this.game) {
                this.game.startSpeedrun();
            }
        };

        const preview = document.createElement('div');
        preview.className = 'speedrun-preview';
        preview.innerHTML = `
            <div class="speedrun-icon">⚡</div>
            <div class="speedrun-text">SPEEDRUN MODE</div>
            <div class="speedrun-desc">All 9 levels - One timer</div>
        `;

        const leaderboardBtn = document.createElement('button');
        leaderboardBtn.className = 'speedrun-leaderboard-btn';
        leaderboardBtn.textContent = 'LEADERBOARD';
        leaderboardBtn.onclick = (e) => {
            e.stopPropagation();
            this.hide();
            if (this.game) {
                this.game.speedrunManager.showLeaderboard();
            }
        };

        card.appendChild(preview);
        card.appendChild(leaderboardBtn);

        return card;
    }
}