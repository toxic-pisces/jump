/**
 * SkinMenu3D
 * Beautiful carousel skin selection menu with unlock system
 */

export class SkinMenu3D {
    constructor(progressionManager) {
        this.progressionManager = progressionManager;
        
        // Ensure progressionManager is valid
        if (!this.progressionManager) {
            console.error('SkinMenu3D: progressionManager is required!');
        }
        
        this.container = document.getElementById('skin-menu-3d');
        this.canvas = document.getElementById('skin-cube-canvas');
        this.canvasWrapper = document.getElementById('skin-canvas-wrapper');
        this.ctx = this.canvas.getContext('2d');
        this.skinNameEl = document.getElementById('current-skin-name');
        this.unlockHintEl = document.getElementById('skin-unlock-hint');
        this.backButton = document.getElementById('skin-menu-3d-back-button');
        this.prevButton = document.getElementById('skin-prev-button');
        this.nextButton = document.getElementById('skin-next-button');
        this.selectButton = document.getElementById('skin-select-button');

        this.onBack = null;
        this.currentWorld = 1;
        this.currentSkinIndex = 0;
        this.eyesClosed = false;
        this.blinkTimer = 0;

        // Available skins with unlock requirements
        this.availableSkins = ['default', 'red', 'white', 'black', 'lightning', 'neongreen', 'rainbow', 'angry', 'glue', 'spike'];

        // Skin unlock requirements text
        this.skinRequirements = {
            default: null,
            red: null,
            white: null,
            black: null,
            rainbow: 'Collect all 27 hearts in World 1',
            lightning: 'Complete World 2 with 22+ hearts',
            neongreen: 'Complete World 3 with 22+ hearts',
            angry: 'Collect all 81 hearts (Perfect game!)',
            glue: 'Complete all 3 Speedrun modes',
            spike: 'Beat Ironman mode'
        };

        // Skin definitions
        this.skins = {
            default: {
                name: 'DEFAULT',
                colors: {
                    1: { main: '#FF8FC7', light: '#FFB3D9', dark: '#FF6BB5', border: '#FF6BB5' },
                    2: { main: '#4682B4', light: '#87CEEB', dark: '#1E3A8A', border: '#2C5282' },
                    3: { main: '#FFD700', light: '#FFF59D', dark: '#DAA520', border: '#DAA520' }
                }
            },
            lightning: {
                name: 'LIGHTNING',
                special: 'lightning',
                colors: {
                    1: { main: '#00D4FF', light: '#66E5FF', dark: '#0088CC', border: '#00BFFF' },
                    2: { main: '#00D4FF', light: '#66E5FF', dark: '#0088CC', border: '#00BFFF' },
                    3: { main: '#00D4FF', light: '#66E5FF', dark: '#0088CC', border: '#00BFFF' }
                }
            },
            neongreen: {
                name: 'NEON GREEN',
                special: 'neongreen',
                colors: {
                    1: { main: '#39FF14', light: '#7FFF00', dark: '#00FF00', border: '#32CD32' },
                    2: { main: '#39FF14', light: '#7FFF00', dark: '#00FF00', border: '#32CD32' },
                    3: { main: '#39FF14', light: '#7FFF00', dark: '#00FF00', border: '#32CD32' }
                }
            },
            red: {
                name: 'RED',
                colors: {
                    1: { main: '#E74C3C', light: '#FF6B6B', dark: '#C0392B', border: '#A93226' },
                    2: { main: '#E74C3C', light: '#FF6B6B', dark: '#C0392B', border: '#A93226' },
                    3: { main: '#E74C3C', light: '#FF6B6B', dark: '#C0392B', border: '#A93226' }
                }
            },
            white: {
                name: 'WHITE',
                colors: {
                    1: { main: '#F8F8F8', light: '#FFFFFF', dark: '#D0D0D0', border: '#C0C0C0' },
                    2: { main: '#F8F8F8', light: '#FFFFFF', dark: '#D0D0D0', border: '#C0C0C0' },
                    3: { main: '#F8F8F8', light: '#FFFFFF', dark: '#D0D0D0', border: '#C0C0C0' }
                }
            },
            black: {
                name: 'BLACK',
                colors: {
                    1: { main: '#2C2C2C', light: '#4A4A4A', dark: '#1A1A1A', border: '#000000' },
                    2: { main: '#2C2C2C', light: '#4A4A4A', dark: '#1A1A1A', border: '#000000' },
                    3: { main: '#2C2C2C', light: '#4A4A4A', dark: '#1A1A1A', border: '#000000' }
                }
            },
            rainbow: {
                name: 'RAINBOW',
                special: 'rainbow',
                colors: {
                    1: { main: '#FF0080', light: '#FF69B4', dark: '#CC0066', border: '#FF1493' },
                    2: { main: '#FF0080', light: '#FF69B4', dark: '#CC0066', border: '#FF1493' },
                    3: { main: '#FF0080', light: '#FF69B4', dark: '#CC0066', border: '#FF1493' }
                }
            },
            angry: {
                name: 'ANGRY',
                special: 'angry',
                colors: {
                    1: { main: '#FF4500', light: '#FF6347', dark: '#CC3700', border: '#FF4500' },
                    2: { main: '#FF4500', light: '#FF6347', dark: '#CC3700', border: '#FF4500' },
                    3: { main: '#FF4500', light: '#FF6347', dark: '#CC3700', border: '#FF4500' }
                }
            },
            glue: {
                name: 'GLUE',
                special: 'glue',
                colors: {
                    1: { main: '#2193B0', light: '#6DD5ED', dark: '#1A7A8F', border: '#156075' },
                    2: { main: '#2193B0', light: '#6DD5ED', dark: '#1A7A8F', border: '#156075' },
                    3: { main: '#2193B0', light: '#6DD5ED', dark: '#1A7A8F', border: '#156075' }
                }
            },
            spike: {
                name: 'SPIKE',
                special: 'spike',
                colors: {
                    1: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C' },
                    2: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C' },
                    3: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C' }
                }
            }
        };

        this.init();
    }

    // Helper method to safely check if skin is unlocked
    isSkinUnlocked(skinId) {
        if (!this.progressionManager || !this.progressionManager.isSkinUnlocked) {
            // Fallback: all skins unlocked if no progression manager
            console.warn('No progressionManager available, unlocking all skins by default');
            return true;
        }
        return this.progressionManager.isSkinUnlocked(skinId);
    }

    init() {
        this.loadSelectedSkin();
        this.setupButtons();
        this.render();
        this.startIdleAnimation();
        
        console.log('SkinMenu3D initialized with progressionManager:', this.progressionManager);
    }

    startIdleAnimation() {
        const skinId = this.availableSkins[this.currentSkinIndex];
        const isLocked = !this.isSkinUnlocked(skinId);
        
        // Don't add idle animation if skin is locked
        if (!isLocked) {
            this.canvasWrapper.classList.add('cube-idle');
        }
        
        // Random fun animations every 5-8 seconds (only for unlocked skins)
        this.idleAnimationInterval = setInterval(() => {
            const skinId = this.availableSkins[this.currentSkinIndex];
            const isLocked = !this.isSkinUnlocked(skinId);
            
            // Don't animate if locked
            if (isLocked) return;
            
            const animations = ['cube-jumping', 'cube-wiggle', 'cube-bouncing'];
            const randomAnim = animations[Math.floor(Math.random() * animations.length)];
            
            this.canvasWrapper.classList.remove('cube-idle');
            this.canvasWrapper.classList.add(randomAnim);
            
            setTimeout(() => {
                this.canvasWrapper.classList.remove(randomAnim);
                this.canvasWrapper.classList.add('cube-idle');
            }, 800);
        }, Math.random() * 3000 + 5000); // Random between 5-8 seconds
        
        // Start blinking animation loop (only for unlocked)
        this.startBlinking();
    }

    startBlinking() {
        const blink = () => {
            const skinId = this.availableSkins[this.currentSkinIndex];
            const isLocked = !this.isSkinUnlocked(skinId);
            
            // Random blink every 2-5 seconds
            const blinkDelay = Math.random() * 3000 + 2000;
            
            this.blinkTimeout = setTimeout(() => {
                // Only blink if unlocked
                if (!isLocked) {
                    this.eyesClosed = true;
                    this.render();
                    
                    setTimeout(() => {
                        this.eyesClosed = false;
                        this.render();
                    }, 150); // Blink duration
                }
                
                blink(); // Schedule next blink
            }, blinkDelay);
        };
        
        blink();
    }

    stopIdleAnimation() {
        if (this.idleAnimationInterval) {
            clearInterval(this.idleAnimationInterval);
            this.canvasWrapper.classList.remove('cube-idle', 'cube-jumping', 'cube-wiggle', 'cube-bouncing');
        }
        if (this.blinkTimeout) {
            clearTimeout(this.blinkTimeout);
        }
    }

    setupButtons() {
        // Previous button
        this.prevButton.onclick = () => {
            this.changeSkin(-1);
        };

        // Next button
        this.nextButton.onclick = () => {
            this.changeSkin(1);
        };

        // Select button
        this.selectButton.onclick = () => {
            const skinId = this.availableSkins[this.currentSkinIndex];
            
            // Check if skin is locked
            if (!this.isSkinUnlocked(skinId)) {
                // Shake animation for locked skin
                this.canvasWrapper.style.animation = 'none';
                setTimeout(() => {
                    this.canvasWrapper.style.animation = 'shake 0.5s ease';
                }, 10);
                setTimeout(() => {
                    this.canvasWrapper.style.animation = '';
                }, 500);
                return;
            }
            
            localStorage.setItem('selectedSkin', skinId);

            // Visual feedback
            this.selectButton.textContent = 'SELECTED!';
            setTimeout(() => {
                window.location.reload();
            }, 500);
        };

        // Back button
        this.backButton.onclick = () => {
            this.hide();
            if (this.onBack) {
                this.onBack();
            }
        };

        // Draw pixelated arrows
        this.drawArrows();
    }

    changeSkin(direction) {
        // Stop idle animation
        this.stopIdleAnimation();
        
        // Slide out animation
        const slideOutClass = direction > 0 ? 'slide-out-left' : 'slide-out-right';
        const slideInClass = direction > 0 ? 'slide-in-left' : 'slide-in-right';
        
        this.canvasWrapper.classList.add(slideOutClass);
        this.skinNameEl.classList.add('name-changing');
        
        setTimeout(() => {
            // Change skin index
            this.currentSkinIndex = (this.currentSkinIndex + direction + this.availableSkins.length) % this.availableSkins.length;
            
            // Update display
            const skinId = this.availableSkins[this.currentSkinIndex];
            const skin = this.skins[skinId];
            this.skinNameEl.textContent = skin.name;
            this.render();
            
            // Slide in animation
            this.canvasWrapper.classList.remove(slideOutClass);
            this.canvasWrapper.classList.add(slideInClass);
            
            setTimeout(() => {
                this.canvasWrapper.classList.remove(slideInClass);
                this.skinNameEl.classList.remove('name-changing');
                
                // Random celebration animation
                const celebAnimations = ['cube-jumping', 'cube-spinning', 'cube-bouncing'];
                const randomCeleb = celebAnimations[Math.floor(Math.random() * celebAnimations.length)];
                this.canvasWrapper.classList.add(randomCeleb);
                
                setTimeout(() => {
                    this.canvasWrapper.classList.remove(randomCeleb);
                    // Resume idle animation
                    this.startIdleAnimation();
                }, 800);
            }, 400);
        }, 300);
    }

    drawArrows() {
        // Left arrow
        const leftArrow = [
            [0,0,0,0,1,0,0,0],
            [0,0,0,1,1,0,0,0],
            [0,0,1,1,1,0,0,0],
            [0,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,1],
            [0,0,1,1,1,0,0,0],
            [0,0,0,1,1,0,0,0],
            [0,0,0,0,1,0,0,0]
        ];

        const leftCanvas = document.createElement('canvas');
        leftCanvas.width = 32;
        leftCanvas.height = 32;
        const leftCtx = leftCanvas.getContext('2d');
        leftCtx.fillStyle = '#000000';

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (leftArrow[y][x]) {
                    leftCtx.fillRect(x * 4, y * 4, 4, 4);
                }
            }
        }

        this.prevButton.style.backgroundImage = `url(${leftCanvas.toDataURL()})`;
        this.prevButton.style.backgroundSize = '50%';
        this.prevButton.style.backgroundPosition = 'center';
        this.prevButton.style.backgroundRepeat = 'no-repeat';

        // Right arrow
        const rightArrow = [
            [0,0,0,1,0,0,0,0],
            [0,0,0,1,1,0,0,0],
            [0,0,0,1,1,1,0,0],
            [1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,0],
            [0,0,0,1,1,1,0,0],
            [0,0,0,1,1,0,0,0],
            [0,0,0,1,0,0,0,0]
        ];

        const rightCanvas = document.createElement('canvas');
        rightCanvas.width = 32;
        rightCanvas.height = 32;
        const rightCtx = rightCanvas.getContext('2d');
        rightCtx.fillStyle = '#000000';

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (rightArrow[y][x]) {
                    rightCtx.fillRect(x * 4, y * 4, 4, 4);
                }
            }
        }

        this.nextButton.style.backgroundImage = `url(${rightCanvas.toDataURL()})`;
        this.nextButton.style.backgroundSize = '50%';
        this.nextButton.style.backgroundPosition = 'center';
        this.nextButton.style.backgroundRepeat = 'no-repeat';
    }

    loadSelectedSkin() {
        const selectedSkin = localStorage.getItem('selectedSkin') || 'default';
        const index = this.availableSkins.indexOf(selectedSkin);
        if (index !== -1) {
            this.currentSkinIndex = index;
        }
    }

    updateDisplay() {
        const skinId = this.availableSkins[this.currentSkinIndex];
        const skin = this.skins[skinId];
        const isLocked = !this.isSkinUnlocked(skinId);
        
        // Update skin name
        this.skinNameEl.textContent = isLocked ? '🔒 ' + skin.name : skin.name;
        
        // Update unlock hint
        if (isLocked && this.skinRequirements[skinId]) {
            this.unlockHintEl.textContent = this.skinRequirements[skinId];
        } else {
            this.unlockHintEl.textContent = '';
        }
        
        // Update select button text
        if (isLocked) {
            this.selectButton.textContent = 'LOCKED';
            this.selectButton.style.opacity = '0.5';
        } else {
            this.selectButton.textContent = 'SELECT SKIN';
            this.selectButton.style.opacity = '1';
        }
        
        this.render();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Draw ONLY center skin (large, full opacity) - no side previews
        this.drawCube(this.currentSkinIndex, centerX, centerY, 150, 1.0);
        
        // Draw lock icon if skin is locked
        const skinId = this.availableSkins[this.currentSkinIndex];
        if (!this.isSkinUnlocked(skinId)) {
            this.drawLock(centerX, centerY);
        }
    }

    drawCube(skinIndex, x, y, size, alpha) {
        const skinId = this.availableSkins[skinIndex];
        const skin = this.skins[skinId];
        const colors = skin.colors[this.currentWorld];
        const isLocked = !this.isSkinUnlocked(skinId);

        this.ctx.save();
        
        // Apply greyscale filter for locked skins
        if (isLocked) {
            this.ctx.globalAlpha = 0.3;
            this.ctx.filter = 'grayscale(100%)';
        } else {
            this.ctx.globalAlpha = alpha;
        }
        
        this.ctx.translate(x, y);

        // Draw gradient based on skin type
        let gradient;
        if (skin.special === 'lightning') {
            gradient = this.ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
            gradient.addColorStop(0, '#FFFFFF');
            gradient.addColorStop(0.5, colors.light);
            gradient.addColorStop(1, colors.main);
        } else if (skin.special === 'neongreen') {
            gradient = this.ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
            gradient.addColorStop(0, colors.light);
            gradient.addColorStop(0.5, colors.main);
            gradient.addColorStop(1, colors.dark);
        } else if (skin.special === 'rainbow') {
            gradient = this.ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
            gradient.addColorStop(0, '#FF0000');
            gradient.addColorStop(0.17, '#FF7F00');
            gradient.addColorStop(0.33, '#FFFF00');
            gradient.addColorStop(0.5, '#00FF00');
            gradient.addColorStop(0.67, '#0000FF');
            gradient.addColorStop(0.83, '#4B0082');
            gradient.addColorStop(1, '#9400D3');
        } else {
            gradient = this.ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
            gradient.addColorStop(0, colors.light);
            gradient.addColorStop(1, colors.main);
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-size/2, -size/2, size, size);

        // Border
        this.ctx.strokeStyle = colors.border;
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(-size/2, -size/2, size, size);

        // Highlight
        if (skin.special !== 'spike') {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(-size/2 + 10, -size/2 + 10, size * 0.6, size * 0.1);
        }

        // Eyes (only on center cube, not for spike)
        if (alpha > 0.6 && skin.special !== 'spike' && !isLocked) {
            const eyeSize = size * 0.08;
            const eyeSpacing = size * 0.2;
            this.ctx.fillStyle = '#000000';

            if (skin.special === 'angry') {
                // Angry eyes - different position
                if (this.eyesClosed) {
                    // Closed eyes (horizontal lines)
                    this.ctx.fillRect(-eyeSpacing, -size * 0.12, eyeSize * 1.2, eyeSize * 0.3);
                    this.ctx.fillRect(eyeSpacing - eyeSize * 1.2, -size * 0.12, eyeSize * 1.2, eyeSize * 0.3);
                } else {
                    this.ctx.fillRect(-eyeSpacing, -size * 0.12, eyeSize, eyeSize);
                    this.ctx.fillRect(eyeSpacing - eyeSize, -size * 0.12, eyeSize, eyeSize);
                }
                // Angry eyebrows
                this.ctx.fillRect(-eyeSpacing - eyeSize * 0.5, -size * 0.18, eyeSize * 1.5, eyeSize * 0.4);
                this.ctx.fillRect(eyeSpacing - eyeSize * 1.5, -size * 0.18, eyeSize * 1.5, eyeSize * 0.4);
                // Frown
                this.ctx.fillRect(-eyeSpacing, size * 0.05, eyeSpacing * 2, eyeSize * 0.4);
            } else {
                // Normal eyes
                if (this.eyesClosed) {
                    // Closed eyes (horizontal lines)
                    this.ctx.fillRect(-eyeSpacing, -size * 0.1, eyeSize * 1.2, eyeSize * 0.3);
                    this.ctx.fillRect(eyeSpacing - eyeSize * 1.2, -size * 0.1, eyeSize * 1.2, eyeSize * 0.3);
                } else {
                    this.ctx.fillRect(-eyeSpacing, -size * 0.1, eyeSize, eyeSize);
                    this.ctx.fillRect(eyeSpacing - eyeSize, -size * 0.1, eyeSize, eyeSize);
                }
            }
        }

        // Special effects
        if (skin.special === 'lightning' && alpha > 0.6) {
            this.ctx.shadowColor = colors.light;
            this.ctx.shadowBlur = 30;
            this.ctx.strokeStyle = colors.light;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(-size/2 + 5, -size/2 + 5, size - 10, size - 10);
        } else if (skin.special === 'neongreen' && alpha > 0.6) {
            this.ctx.shadowColor = colors.main;
            this.ctx.shadowBlur = 30;
            this.ctx.strokeStyle = colors.light;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(-size/2 + 5, -size/2 + 5, size - 10, size - 10);
        } else if (skin.special === 'glue' && alpha > 0.6) {
            // Glue drips
            const dripSize = size * 0.05;
            this.ctx.fillStyle = colors.dark;
            this.ctx.fillRect(-size * 0.3, -size/2, dripSize, dripSize);
            this.ctx.fillRect(0, -size/2, dripSize, dripSize);
            this.ctx.fillRect(size * 0.25, -size/2, dripSize, dripSize);
        }

        this.ctx.restore();
    }

    drawLock(x, y) {
        // Pixelated lock icon
        const lockPattern = [
            [0,0,0,1,1,1,1,0,0,0],
            [0,0,1,0,0,0,0,1,0,0],
            [0,0,1,0,0,0,0,1,0,0],
            [0,1,1,0,0,0,0,1,1,0],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,0,1,1,0,1,1,1],
            [1,1,1,1,0,0,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1]
        ];

        const pixelSize = 6;
        const lockWidth = lockPattern[0].length * pixelSize;
        const lockHeight = lockPattern.length * pixelSize;

        this.ctx.save();
        this.ctx.translate(x - lockWidth / 2, y - lockHeight / 2);

        // Draw lock shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        for (let row = 0; row < lockPattern.length; row++) {
            for (let col = 0; col < lockPattern[row].length; col++) {
                if (lockPattern[row][col] === 1) {
                    this.ctx.fillRect(col * pixelSize + 2, row * pixelSize + 2, pixelSize, pixelSize);
                }
            }
        }

        // Draw lock body (yellow/gold)
        this.ctx.fillStyle = '#FFD700';
        for (let row = 0; row < lockPattern.length; row++) {
            for (let col = 0; col < lockPattern[row].length; col++) {
                if (lockPattern[row][col] === 1) {
                    this.ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
                }
            }
        }

        // Draw lock highlights
        this.ctx.fillStyle = '#FFED4E';
        this.ctx.fillRect(pixelSize, 4 * pixelSize, pixelSize * 2, pixelSize);
        this.ctx.fillRect(pixelSize, 5 * pixelSize, pixelSize, pixelSize);

        // Draw lock outline
        this.ctx.strokeStyle = '#CC8400';
        this.ctx.lineWidth = 2;
        for (let row = 0; row < lockPattern.length; row++) {
            for (let col = 0; col < lockPattern[row].length; col++) {
                if (lockPattern[row][col] === 1) {
                    this.ctx.strokeRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
                }
            }
        }

        this.ctx.restore();
    }

    show(onBackCallback, world = 1) {
        this.container.classList.remove('hidden');
        this.onBack = onBackCallback;
        this.currentWorld = world;
        this.loadSelectedSkin();
        this.updateDisplay();
        this.startIdleAnimation();
    }

    hide() {
        this.container.classList.add('hidden');
        this.stopIdleAnimation();
    }

    // Static method for renderer compatibility
    static getSkinColors(world) {
        const skinId = localStorage.getItem('selectedSkin') || 'default';
        const skins = {
            default: {
                1: { main: '#FF8FC7', light: '#FFB3D9', dark: '#FF6BB5', border: '#FF6BB5' },
                2: { main: '#4682B4', light: '#87CEEB', dark: '#1E3A8A', border: '#2C5282' },
                3: { main: '#FFD700', light: '#FFF59D', dark: '#DAA520', border: '#DAA520' }
            },
            red: {
                1: { main: '#E74C3C', light: '#FF6B6B', dark: '#C0392B', border: '#A93226' },
                2: { main: '#E74C3C', light: '#FF6B6B', dark: '#C0392B', border: '#A93226' },
                3: { main: '#E74C3C', light: '#FF6B6B', dark: '#C0392B', border: '#A93226' }
            },
            white: {
                1: { main: '#F8F8F8', light: '#FFFFFF', dark: '#D0D0D0', border: '#C0C0C0' },
                2: { main: '#F8F8F8', light: '#FFFFFF', dark: '#D0D0D0', border: '#C0C0C0' },
                3: { main: '#F8F8F8', light: '#FFFFFF', dark: '#D0D0D0', border: '#C0C0C0' }
            },
            black: {
                1: { main: '#2C2C2C', light: '#4A4A4A', dark: '#1A1A1A', border: '#000000' },
                2: { main: '#2C2C2C', light: '#4A4A4A', dark: '#1A1A1A', border: '#000000' },
                3: { main: '#2C2C2C', light: '#4A4A4A', dark: '#1A1A1A', border: '#000000' }
            },
            lightning: {
                1: { main: '#00D4FF', light: '#66E5FF', dark: '#0088CC', border: '#00BFFF', special: 'lightning' },
                2: { main: '#00D4FF', light: '#66E5FF', dark: '#0088CC', border: '#00BFFF', special: 'lightning' },
                3: { main: '#00D4FF', light: '#66E5FF', dark: '#0088CC', border: '#00BFFF', special: 'lightning' }
            },
            neongreen: {
                1: { main: '#00FF00', light: '#7FFF00', dark: '#00CC00', border: '#00DD00', special: 'neongreen' },
                2: { main: '#00FF00', light: '#7FFF00', dark: '#00CC00', border: '#00DD00', special: 'neongreen' },
                3: { main: '#00FF00', light: '#7FFF00', dark: '#00CC00', border: '#00DD00', special: 'neongreen' }
            },
            rainbow: {
                1: { main: '#FF0080', light: '#FF69B4', dark: '#CC0066', border: '#FF1493', special: 'rainbow' },
                2: { main: '#FF0080', light: '#FF69B4', dark: '#CC0066', border: '#FF1493', special: 'rainbow' },
                3: { main: '#FF0080', light: '#FF69B4', dark: '#CC0066', border: '#FF1493', special: 'rainbow' }
            },
            angry: {
                1: { main: '#FF4500', light: '#FF6347', dark: '#CC3700', border: '#FF4500', special: 'angry' },
                2: { main: '#FF4500', light: '#FF6347', dark: '#CC3700', border: '#FF4500', special: 'angry' },
                3: { main: '#FF4500', light: '#FF6347', dark: '#CC3700', border: '#FF4500', special: 'angry' }
            },
            glue: {
                1: { main: '#2193B0', light: '#6DD5ED', dark: '#1A7A8F', border: '#156075', special: 'glue' },
                2: { main: '#2193B0', light: '#6DD5ED', dark: '#1A7A8F', border: '#156075', special: 'glue' },
                3: { main: '#2193B0', light: '#6DD5ED', dark: '#1A7A8F', border: '#156075', special: 'glue' }
            },
            spike: {
                1: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C', special: 'spike' },
                2: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C', special: 'spike' },
                3: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C', special: 'spike' }
            }
        };

        return skins[skinId] ? skins[skinId][world] : skins.default[world];
    }
}
