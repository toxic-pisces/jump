/**
 * Collectible
 * Special item that can be collected in each level for extra challenge
 * Must reach goal after collecting to permanently claim it
 */

export class Collectible {
    constructor(x, y, world = 1) {
        this.x = x;
        this.y = y;
        this.size = 32; // Diameter (increased from 24)
        this.world = world;
        this.collected = false;
        this.animationTime = 0;

        // Particle effect
        this.particles = [];
        this.maxParticles = 8;
    }

    update(deltaTime) {
        if (!this.collected) {
            this.animationTime += deltaTime;

            // Add floating particles around the collectible
            if (Math.random() < 0.1 && this.particles.length < this.maxParticles) {
                const angle = Math.random() * Math.PI * 2;
                const distance = this.size / 2 + 5;

                this.particles.push({
                    x: this.x + Math.cos(angle) * distance,
                    y: this.y + Math.sin(angle) * distance,
                    vx: Math.cos(angle) * 0.5,
                    vy: Math.sin(angle) * 0.5 - 0.5,
                    life: 1.0,
                    size: 3
                });
            }
        }

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy -= 0.02; // Slight upward drift
            p.life -= deltaTime * 2;
            return p.life > 0;
        });
    }

    checkCollision(player) {
        if (this.collected) return false;

        // Circle collision with player
        const dx = player.x + player.width / 2 - this.x;
        const dy = player.y + player.height / 2 - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < (this.size / 2 + Math.min(player.width, player.height) / 2);
    }

    collect() {
        this.collected = true;

        // Create collection burst effect
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 / 20) * i;
            const speed = 2 + Math.random() * 2;

            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                size: 4
            });
        }
    }

    draw(ctx) {
        if (this.collected) {
            // Only draw particles after collection
            this.drawParticles(ctx);
            return;
        }

        // Draw particles
        this.drawParticles(ctx);

        // Get world color
        const color = this.getWorldColor();

        // Floating animation
        const floatOffset = Math.sin(this.animationTime * 3) * 3;
        const y = this.y + floatOffset;

        // Pulsing scale
        const pulse = 1 + Math.sin(this.animationTime * 4) * 0.1;
        const size = this.size * pulse;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y + 4, size / 2 + 2, 0, Math.PI * 2);
        ctx.fill();

        // Outer glow
        ctx.fillStyle = color.glow;
        ctx.beginPath();
        ctx.arc(this.x, y, size / 2 + 4, 0, Math.PI * 2);
        ctx.fill();

        // Main circle (blocky by drawing as octagon)
        ctx.fillStyle = color.main;
        this.drawBlockyCircle(ctx, this.x, y, size / 2, 8);

        // Inner highlight circle
        ctx.fillStyle = color.light;
        this.drawBlockyCircle(ctx, this.x - 3, y - 3, size / 3, 6);

        // Center sparkle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const sparkleSize = 4 + Math.sin(this.animationTime * 6) * 2;
        ctx.fillRect(this.x - sparkleSize / 2, y - sparkleSize / 2, sparkleSize, sparkleSize);
    }

    drawBlockyCircle(ctx, x, y, radius, sides) {
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (Math.PI * 2 / sides) * i;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    drawParticles(ctx) {
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            const color = this.getWorldColor();
            ctx.fillStyle = color.main;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        });
        ctx.globalAlpha = 1;
    }

    getWorldColor() {
        switch (this.world) {
            case 2:
                return {
                    main: '#87CEEB',
                    light: '#B0E0E6',
                    glow: 'rgba(135, 206, 235, 0.3)'
                };
            case 3:
                return {
                    main: '#FFD700',
                    light: '#FFF59D',
                    glow: 'rgba(255, 215, 0, 0.3)'
                };
            default:
                return {
                    main: '#FF69B4',
                    light: '#FFB3D9',
                    glow: 'rgba(255, 105, 180, 0.3)'
                };
        }
    }
}
