/**
 * SideDecorations
 * Draws animated pixel-art decorations on the sides of the gameplay area
 */

export class SideDecorations {
    constructor() {
        this.leftCanvas = document.getElementById('left-decoration');
        this.rightCanvas = document.getElementById('right-decoration');

        if (!this.leftCanvas || !this.rightCanvas) {
            console.warn('Side decoration canvases not found');
            return;
        }

        this.leftCtx = this.leftCanvas.getContext('2d');
        this.rightCtx = this.rightCanvas.getContext('2d');

        this.currentWorld = 1;
        this.animationTime = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.leftCanvas || !this.rightCanvas) return;

        // Set canvas size to full container
        this.leftCanvas.width = window.innerWidth;
        this.leftCanvas.height = window.innerHeight;
        this.rightCanvas.width = window.innerWidth;
        this.rightCanvas.height = window.innerHeight;

        this.draw();
    }

    setWorld(world) {
        this.currentWorld = world;
        this.draw();
    }

    update(deltaTime) {
        this.animationTime += deltaTime;
        this.draw();
    }

    draw() {
        if (!this.leftCtx || !this.rightCtx) return;

        // Clear canvases
        this.leftCtx.clearRect(0, 0, this.leftCanvas.width, this.leftCanvas.height);
        this.rightCtx.clearRect(0, 0, this.rightCanvas.width, this.rightCanvas.height);

        // Get world colors
        const colors = this.getWorldColors();

        // Draw pixel patterns
        this.drawPixelPattern(this.leftCtx, colors, 'left');
        this.drawPixelPattern(this.rightCtx, colors, 'right');
    }

    getWorldColors() {
        switch (this.currentWorld) {
            case 2:
                return {
                    primary: '#4682B4',
                    secondary: '#87CEEB',
                    accent: '#1E90FF',
                    dark: '#2C5282'
                };
            case 3:
                return {
                    primary: '#FFD700',
                    secondary: '#FFF59D',
                    accent: '#FFA500',
                    dark: '#DAA520'
                };
            default:
                return {
                    primary: '#FF69B4',
                    secondary: '#FFB3D9',
                    accent: '#FF1493',
                    dark: '#CC6699'
                };
        }
    }

    drawPixelPattern(ctx, colors, side) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const pixelSize = 20;

        // Create a blocky pixel pattern that fills the sides
        // Only draw on the actual side areas (not center where game canvas is)
        const gameAspectRatio = 1200 / 700;
        const containerAspectRatio = width / height;

        let gameWidth, gameHeight;
        if (containerAspectRatio > gameAspectRatio) {
            // Letterboxing on sides (what we want to fill)
            gameHeight = height;
            gameWidth = height * gameAspectRatio;
        } else {
            // Pillarboxing on top/bottom (no decoration needed)
            return;
        }

        const sideWidth = (width - gameWidth) / 2;

        // Animate offset
        const animOffset = Math.sin(this.animationTime * 0.5) * pixelSize;

        // Draw floating pixel blocks
        for (let y = -pixelSize; y < height + pixelSize; y += pixelSize * 3) {
            for (let x = 0; x < sideWidth + pixelSize; x += pixelSize * 2) {
                const xPos = side === 'left' ? x : width - sideWidth + x;
                const yPos = y + animOffset + (x / pixelSize) * 5;

                // Stagger pattern
                if ((Math.floor(x / pixelSize) + Math.floor(yPos / pixelSize)) % 2 === 0) {
                    // Shadow
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                    ctx.fillRect(xPos + 2, yPos + 2, pixelSize, pixelSize);

                    // Block
                    ctx.fillStyle = colors.secondary;
                    ctx.fillRect(xPos, yPos, pixelSize, pixelSize);

                    // Highlight
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(xPos + 2, yPos + 2, pixelSize - 4, pixelSize - 4);
                }
            }
        }

        // Draw some accent blocks
        const accentCount = 8;
        for (let i = 0; i < accentCount; i++) {
            const xBase = (i % 2) * pixelSize * 2;
            const yBase = (i / accentCount) * height + (this.animationTime * 30 + i * 50) % height;
            const xPos = side === 'left' ? xBase : width - sideWidth + xBase;

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(xPos + 3, yBase + 3, pixelSize * 1.5, pixelSize * 1.5);

            // Accent block
            ctx.fillStyle = colors.accent;
            ctx.fillRect(xPos, yBase, pixelSize * 1.5, pixelSize * 1.5);

            // Shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(xPos + 3, yBase + 3, pixelSize * 1.5 - 6, 4);
        }

        // Draw grid pattern overlay
        ctx.strokeStyle = colors.dark;
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 1;

        for (let y = 0; y < height; y += pixelSize) {
            const xStart = side === 'left' ? 0 : width - sideWidth;
            const xEnd = side === 'left' ? sideWidth : width;
            ctx.beginPath();
            ctx.moveTo(xStart, y);
            ctx.lineTo(xEnd, y);
            ctx.stroke();
        }

        for (let x = 0; x < sideWidth; x += pixelSize) {
            const xPos = side === 'left' ? x : width - sideWidth + x;
            ctx.beginPath();
            ctx.moveTo(xPos, 0);
            ctx.lineTo(xPos, height);
            ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
    }
}
