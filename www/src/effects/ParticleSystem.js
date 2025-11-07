export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 200;
    }

    emit(x, y, color) {
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
        }
        
        this.particles.push({
            x: x,
            y: y,
            velocityX: (Math.random() - 0.5) * 400,
            velocityY: (Math.random() - 0.5) * 400 - 200,
            life: 1.0,
            color: color,
            gravity: 800,
            size: 4
        });
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Schwarzes Loch Anziehung
            if (particle.blackHole) {
                const dx = particle.blackHole.x - particle.x;
                const dy = particle.blackHole.y - particle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 5) {
                    const force = particle.blackHole.strength / Math.max(dist, 1);
                    particle.velocityX += (dx / dist) * force * deltaTime;
                    particle.velocityY += (dy / dist) * force * deltaTime;
                } else {
                    // Partikel wurde vom Loch verschluckt
                    this.particles.splice(i, 1);
                    continue;
                }
            }
            // Normale Gravität
            else if (particle.gravity) {
                particle.velocityY += particle.gravity * deltaTime;
            }
            
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            particle.life -= deltaTime * 2;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
}
