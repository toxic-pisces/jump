/**
 * UnlockScreen
 * Shows animated unlock notifications with interactive blocky gift box
 * Professional animation with spinning light beams and smooth block destruction
 */

export class UnlockScreen {
    constructor() {
        this.element = null;
        this.punchesNeeded = 5;
        this.currentPunches = 0;
        this.opened = false;
        this.onComplete = null;
        this.unlockData = null;
        this.animationFrame = null;
        this.fallingBlocks = [];
        this.animationTime = 0;
        this.giftBlocks = []; // Track which blocks are still part of the gift
        this.minimumDisplayTime = 1000; // Minimum 1 second display
        this.openedTime = 0;
        this.canDismiss = false;
        this.createUI();
    }

    createUI() {
        this.element = document.createElement('div');
        this.element.id = 'unlock-screen';
        this.element.className = 'unlock-screen hidden';
        this.element.innerHTML = `
            <div class="unlock-content">
                <div class="unlock-header">SOMETHING SPECIAL!</div>
                <canvas id="gift-canvas" width="160" height="160"></canvas>
                <div class="unlock-instruction">TAP TO UNWRAP</div>
                <div class="unlock-title"></div>
            </div>
        `;

        document.body.appendChild(this.element);

        // Get references
        this.giftCanvas = document.getElementById('gift-canvas');
        this.giftCtx = this.giftCanvas.getContext('2d');
        this.instructionElement = this.element.querySelector('.unlock-instruction');
        this.titleElement = this.element.querySelector('.unlock-title');
        this.headerElement = this.element.querySelector('.unlock-header');

        // Setup click/touch handler
        this.giftCanvas.style.cursor = 'pointer';
        this.giftCanvas.addEventListener('click', () => this.handlePunch());
        this.giftCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePunch();
        });
    }

    show(type, world, onComplete, skinData = null) {
        // Reset state
        this.currentPunches = 0;
        this.opened = false;
        this.openedTime = 0;
        this.canDismiss = false;
        this.onComplete = onComplete;
        this.unlockData = { type, world, skinData };
        this.fallingBlocks = [];
        this.animationTime = 0;

        // Initialize gift blocks (6x6 grid)
        this.giftBlocks = [];
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                this.giftBlocks.push({
                    gridX: x,
                    gridY: y,
                    active: true
                });
            }
        }

        // Set header
        this.headerElement.textContent = 'SOMETHING SPECIAL!';
        this.titleElement.textContent = '';
        this.instructionElement.textContent = 'TAP TO UNWRAP';

        // Show with animation
        this.element.classList.remove('hidden');
        this.element.classList.add('show');

        // Start continuous animation
        this.startAnimation();
    }

    handlePunch() {
        // If opened and can dismiss, close the screen
        if (this.opened) {
            if (this.canDismiss) {
                this.hide(this.onComplete);
            }
            return;
        }

        this.currentPunches++;

        // Shake animation
        const intensity = 5 + this.currentPunches * 3;
        const randomAngle = (Math.random() - 0.5) * intensity;
        const randomScale = 0.95 + Math.random() * 0.1;
        this.giftCanvas.style.transform = `rotate(${randomAngle}deg) scale(${randomScale})`;
        this.giftCanvas.style.transition = 'transform 0.05s ease-out';

        setTimeout(() => {
            this.giftCanvas.style.transform = 'rotate(0deg) scale(1)';
            this.giftCanvas.style.transition = 'transform 0.2s ease-out';
        }, 100);

        // Don't show remaining taps

        // Break off blocks from the gift
        this.breakBlocks();

        // Open when enough punches
        if (this.currentPunches >= this.punchesNeeded) {
            setTimeout(() => this.openGift(), 300);
        }
    }

    breakBlocks() {
        const { type, world } = this.unlockData;
        let boxColor;

        if (type === 'skin') {
            boxColor = '#FF69B4';
        } else if (type === 'world') {
            boxColor = world === 2 ? '#87CEEB' : world === 3 ? '#FFD700' : '#FF69B4';
        } else {
            boxColor = '#FFD700';
        }

        // Calculate how many blocks to break based on punch progress
        const totalBlocks = 36;
        const blocksToBreak = Math.ceil((this.currentPunches / this.punchesNeeded) * totalBlocks);

        // Find active blocks and break them from outside to inside
        const activeBlocks = this.giftBlocks.filter(b => b.active);
        const blocksToRemove = Math.min(7, activeBlocks.length); // Break 7 blocks per punch

        // Sort by distance from center (break from outside in)
        activeBlocks.sort((a, b) => {
            const distA = Math.abs(a.gridX - 2.5) + Math.abs(a.gridY - 2.5);
            const distB = Math.abs(b.gridX - 2.5) + Math.abs(b.gridY - 2.5);
            return distB - distA;
        });

        // Break the outer blocks
        for (let i = 0; i < blocksToRemove && i < activeBlocks.length; i++) {
            const block = activeBlocks[i];
            block.active = false;

            // Calculate actual position
            const boxSize = 60;
            const centerX = 80;
            const centerY = 85;
            const pixelSize = 10;
            const px = centerX - boxSize/2 + block.gridX * pixelSize;
            const py = centerY - boxSize/2 + block.gridY * pixelSize;

            // Create falling block with physics
            const angle = Math.atan2(py - centerY, px - centerX);
            const speed = 3 + Math.random() * 2;

            this.fallingBlocks.push({
                x: px,
                y: py,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2, // Initial upward velocity
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                color: boxColor,
                life: 1.0,
                size: pixelSize
            });
        }
    }


    openGift() {
        this.opened = true;
        this.openedTime = Date.now();
        this.instructionElement.textContent = 'TAP TO CONTINUE';

        const { type, world, skinData } = this.unlockData;

        // Clear remaining gift blocks
        this.giftBlocks.forEach(block => block.active = false);

        // For skins, show animated skin after a delay
        if (type === 'skin') {
            this.headerElement.textContent = 'SKIN UNLOCKED!';
            this.titleElement.textContent = skinData?.name || 'NEW SKIN';
            this.titleElement.style.animation = 'unlockAppear 0.5s ease-out';
            setTimeout(() => {
                this.animateSkinUnlock(skinData);
            }, 500);
        } else {
            // For worlds and speedruns, just show text
            let header = '';
            if (type === 'world') {
                header = `WORLD ${world} UNLOCKED!`;
            } else if (type === 'speedrun') {
                header = `SPEEDRUN MODE UNLOCKED!`;
            } else if (type === 'ironman') {
                header = 'IRONMAN MODE UNLOCKED!';
            }

            setTimeout(() => {
                this.headerElement.textContent = header;
                this.titleElement.style.animation = 'unlockAppear 0.5s ease-out';
            }, 400);
        }

        // Enable dismissal after 1 second
        setTimeout(() => {
            this.canDismiss = true;
        }, this.minimumDisplayTime);
    }


    startAnimation() {
        const animate = () => {
            if (!this.element.classList.contains('show')) {
                return; // Stop if hidden
            }

            this.animationTime += 0.016; // ~60fps

            // Update falling blocks
            this.fallingBlocks = this.fallingBlocks.filter(block => {
                block.vy += 0.4; // Gravity
                block.x += block.vx;
                block.y += block.vy;
                block.rotation += block.rotationSpeed;
                block.life -= 0.015;
                return block.life > 0 && block.y < 180;
            });

            // Draw everything
            this.draw();

            // Continue animation
            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    }

    draw() {
        const ctx = this.giftCtx;
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, 160, 160);

        // Draw the remaining gift blocks
        this.drawGiftBox(ctx);

        // Draw falling blocks on top
        this.drawFallingBlocks(ctx);
    }

    drawGiftBox(ctx) {
        if (this.giftBlocks.filter(b => b.active).length === 0) {
            return; // No blocks left
        }

        // Determine gift colors
        const { type, world } = this.unlockData;
        let boxColor, bowColor;

        if (type === 'skin') {
            boxColor = '#FF69B4';
            bowColor = '#FF1493';
        } else if (type === 'world') {
            if (world === 2) {
                boxColor = '#87CEEB';
                bowColor = '#1E90FF';
            } else if (world === 3) {
                boxColor = '#FFD700';
                bowColor = '#FFA500';
            } else {
                boxColor = '#FF69B4';
                bowColor = '#FF1493';
            }
        } else {
            boxColor = '#FFD700';
            bowColor = '#FFA500';
        }

        const boxSize = 60;
        const centerX = 80;
        const centerY = 85;
        const pixelSize = 10;

        // Draw active blocks
        this.giftBlocks.forEach(block => {
            if (!block.active) return;

            const px = centerX - boxSize/2 + block.gridX * pixelSize;
            const py = centerY - boxSize/2 + block.gridY * pixelSize;

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(px + 2, py + 2, pixelSize, pixelSize);

            // Box block
            ctx.fillStyle = boxColor;
            ctx.fillRect(px, py, pixelSize, pixelSize);

            // Highlight
            if ((block.gridX + block.gridY) % 2 === 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.fillRect(px + 2, py + 2, pixelSize - 4, pixelSize - 4);
            }

            // Border
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, pixelSize, pixelSize);
        });

        // Draw bow on top (if enough blocks remain)
        if (this.currentPunches < 3) {
            const bowY = centerY - boxSize/2 - 12;

            // Left bow piece
            ctx.fillStyle = bowColor;
            ctx.fillRect(centerX - 15, bowY, 10, 10);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(centerX - 13, bowY + 2, 6, 4);

            // Right bow piece
            ctx.fillStyle = bowColor;
            ctx.fillRect(centerX + 5, bowY, 10, 10);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(centerX + 7, bowY + 2, 6, 4);

            // Center knot
            ctx.fillStyle = bowColor;
            ctx.fillRect(centerX - 3, bowY + 2, 6, 6);
        }
    }

    drawFallingBlocks(ctx) {
        this.fallingBlocks.forEach(block => {
            ctx.save();
            ctx.globalAlpha = block.life;
            ctx.translate(block.x + block.size/2, block.y + block.size/2);
            ctx.rotate(block.rotation);

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(-block.size/2 + 2, -block.size/2 + 2, block.size, block.size);

            // Block
            ctx.fillStyle = block.color;
            ctx.fillRect(-block.size/2, -block.size/2, block.size, block.size);

            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(-block.size/2 + 2, -block.size/2 + 2, block.size - 4, block.size - 4);

            ctx.restore();
        });
    }


    animateSkinUnlock(skinData) {
        const ctx = this.giftCtx;
        ctx.imageSmoothingEnabled = false;

        let time = 0;
        const animate = () => {
            time += 0.05;

            ctx.clearRect(0, 0, 160, 160);

            const centerX = 80;
            const centerY = 80;
            const size = 60;

            // Bouncing animation
            const bounce = Math.abs(Math.sin(time * 2)) * 10;
            const offsetY = centerY - bounce;

            // Get colors
            const colors = skinData.colors && skinData.colors[1]
                ? skinData.colors[1]
                : { main: '#FF8FC7', light: '#FFB3D9', dark: '#FF6BB5', border: '#FF6BB5' };

            ctx.save();
            ctx.translate(centerX, offsetY);

            // Rotation
            const rotation = Math.sin(time) * 0.1;
            ctx.rotate(rotation);

            // Draw gradient based on skin type
            let gradient;
            if (skinData.special === 'lightning') {
                gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
                gradient.addColorStop(0, '#FFFFFF');
                gradient.addColorStop(0.5, colors.light);
                gradient.addColorStop(1, colors.main);
            } else if (skinData.special === 'neongreen') {
                gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
                gradient.addColorStop(0, colors.light);
                gradient.addColorStop(0.5, colors.main);
                gradient.addColorStop(1, colors.dark);
            } else if (skinData.special === 'rainbow') {
                gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
                const rainbowOffset = (time * 0.5) % 1;
                gradient.addColorStop((0 + rainbowOffset) % 1, '#FF0000');
                gradient.addColorStop((0.17 + rainbowOffset) % 1, '#FF7F00');
                gradient.addColorStop((0.33 + rainbowOffset) % 1, '#FFFF00');
                gradient.addColorStop((0.5 + rainbowOffset) % 1, '#00FF00');
                gradient.addColorStop((0.67 + rainbowOffset) % 1, '#0000FF');
                gradient.addColorStop((0.83 + rainbowOffset) % 1, '#4B0082');
                gradient.addColorStop((1 + rainbowOffset) % 1, '#9400D3');
            } else {
                gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
                gradient.addColorStop(0, colors.light);
                gradient.addColorStop(1, colors.main);
            }

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(-size/2 + 3, -size/2 + 3, size, size);

            // Cube
            ctx.fillStyle = gradient;
            ctx.fillRect(-size/2, -size/2, size, size);

            // Border
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 3;
            ctx.strokeRect(-size/2, -size/2, size, size);

            // Highlight
            if (skinData.special !== 'spike') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(-size/2 + 6, -size/2 + 6, size * 0.5, size * 0.15);
            }

            // Eyes - blinking
            if (skinData.special !== 'spike') {
                const eyeSize = size * 0.12;
                const eyeSpacing = size * 0.25;
                const blinkCycle = Math.sin(time * 3);
                const isBlinking = blinkCycle > 0.95;

                ctx.fillStyle = '#000000';

                if (skinData.special === 'angry') {
                    if (isBlinking) {
                        ctx.fillRect(-eyeSpacing, -size * 0.15, eyeSize * 1.2, eyeSize * 0.3);
                        ctx.fillRect(eyeSpacing - eyeSize * 1.2, -size * 0.15, eyeSize * 1.2, eyeSize * 0.3);
                    } else {
                        ctx.fillRect(-eyeSpacing, -size * 0.15, eyeSize, eyeSize);
                        ctx.fillRect(eyeSpacing - eyeSize, -size * 0.15, eyeSize, eyeSize);
                    }
                    ctx.fillRect(-eyeSpacing - eyeSize * 0.5, -size * 0.22, eyeSize * 1.5, eyeSize * 0.4);
                    ctx.fillRect(eyeSpacing - eyeSize * 1.5, -size * 0.22, eyeSize * 1.5, eyeSize * 0.4);
                } else {
                    if (isBlinking) {
                        ctx.fillRect(-eyeSpacing, -size * 0.12, eyeSize * 1.2, eyeSize * 0.3);
                        ctx.fillRect(eyeSpacing - eyeSize * 1.2, -size * 0.12, eyeSize * 1.2, eyeSize * 0.3);
                    } else {
                        ctx.fillRect(-eyeSpacing, -size * 0.12, eyeSize, eyeSize);
                        ctx.fillRect(eyeSpacing - eyeSize, -size * 0.12, eyeSize, eyeSize);
                    }
                }
            }

            ctx.restore();

            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    }

    hide(callback) {
        this.element.classList.remove('show');
        this.element.classList.add('hiding');

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        setTimeout(() => {
            this.element.classList.add('hidden');
            this.element.classList.remove('hiding');
            if (callback) callback();
        }, 500);
    }
}
