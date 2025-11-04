export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.sparkleTime = 0;
        this.trailParticles = [];
        this.backgroundOffset = 0; // Für subtile Animation
    }

    drawGlueStrands(player) {
        // Draw stretchy glue strands from player to nearby edges
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;

        // Create animated glue strands
        const time = Date.now() * 0.003; // Slow animation
        const numStrands = 5;

        this.ctx.save();
        this.ctx.globalAlpha = 0.6;
        this.ctx.strokeStyle = '#5FB3D6'; // Glue color
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        for (let i = 0; i < numStrands; i++) {
            const angle = (i / numStrands) * Math.PI * 2 + time;
            const length = 15 + Math.sin(time * 2 + i) * 5;
            const startX = centerX + Math.cos(angle) * (player.width / 2);
            const startY = centerY + Math.sin(angle) * (player.height / 2);
            const endX = startX + Math.cos(angle) * length;
            const endY = startY + Math.sin(angle) * length;

            // Draw wavy line
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);

            // Add control point for curve
            const controlX = (startX + endX) / 2 + Math.sin(time * 3 + i) * 3;
            const controlY = (startY + endY) / 2 + Math.cos(time * 3 + i) * 3;
            this.ctx.quadraticCurveTo(controlX, controlY, endX, endY);

            this.ctx.stroke();

            // Draw blob at end
            this.ctx.fillStyle = '#5FB3D6';
            this.ctx.beginPath();
            this.ctx.arc(endX, endY, 2 + Math.sin(time * 2 + i) * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    clear() {
        // World-abhängiger Hintergrund
        const world = this.currentWorld || 1;
        
        if (world === 2) {
            // Blaue Welt
            const skyColors = [
                '#F0F8FF', // Alice Blue
                '#E6F2FF',
                '#DCEEFF',
                '#D2E9FF',
                '#C8E4FF',
                '#BFE0FF'
            ];
            
            const stripeHeight = this.canvas.height / skyColors.length;
            skyColors.forEach((color, i) => {
                this.ctx.fillStyle = color;
                this.ctx.fillRect(0, i * stripeHeight, this.canvas.width, stripeHeight);
            });
            
            // Blaues Grid
            this.ctx.fillStyle = 'rgba(135, 206, 250, 0.04)';
        } else {
            // Pinke Welt (World 1)
            const skyColors = [
                '#FFFBFD',
                '#FFF8FC',
                '#FFF5FB',
                '#FFF2FA',
                '#FFEFF9',
                '#FFECF8'
            ];
            
            const stripeHeight = this.canvas.height / skyColors.length;
            skyColors.forEach((color, i) => {
                this.ctx.fillStyle = color;
                this.ctx.fillRect(0, i * stripeHeight, this.canvas.width, stripeHeight);
            });
            
            this.ctx.fillStyle = 'rgba(255, 182, 193, 0.04)';
        }
        
        // Grid
        const gridSize = 40;
        const pixelSize = 2;
        for (let x = gridSize; x < this.canvas.width; x += gridSize) {
            for (let y = gridSize; y < this.canvas.height; y += gridSize) {
                this.ctx.fillRect(x - pixelSize/2, y - pixelSize/2, pixelSize, pixelSize);
            }
        }
    }

    drawPlayer(player) {
        // World-abhängige Farben
        const world = this.currentWorld || 1;
        const colors = world === 3
            ? { main: '#FFD700', light: '#FFF59D', dark: '#DAA520', border: '#DAA520' }  // Gelb/Gold
            : world === 2
            ? { main: '#4682B4', light: '#87CEEB', dark: '#1E3A8A', border: '#2C5282' }  // Blau
            : { main: '#FF8FC7', light: '#FFB3D9', dark: '#FF6BB5', border: '#FF6BB5' }; // Pink

        this.drawSlimeTrail(player);
        
        this.ctx.save();
        
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(player.rotation);
        
        let scaleY = 1.0;
        let scaleX = 1.0;
        
        if (player.isGrounded && player.landingTime > 0) {
            const squashAmount = Math.min(player.landingTime / 0.15, 1) * 0.15;
            scaleY = 0.85 - squashAmount;
            scaleX = 1.15 + squashAmount * 0.5;
        } else if (player.velocityY < -200) {
            scaleY = 1.1;
            scaleX = 0.95;
        }
        
        this.ctx.scale(scaleX, scaleY);
        
        // Schatten
        if (player.isGrounded) {
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = colors.dark;
            this.ctx.fillRect(-player.width/2 + 3, -player.height/2 + 3, player.width, player.height);
            this.ctx.globalAlpha = 1;
        }
        
        // Gradient
        const gradient = this.ctx.createLinearGradient(-player.width/2, -player.height/2, player.width/2, player.height/2);
        gradient.addColorStop(0, colors.light);
        gradient.addColorStop(1, colors.main);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
        
        // Border
        this.ctx.strokeStyle = colors.border;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(-player.width/2, -player.height/2, player.width, player.height);
        
        // Augen
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-10, -5, 6, 6);
        this.ctx.fillRect(4, -5, 6, 6);
        
        // Highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(-player.width/2 + 4, -player.height/2 + 4, player.width - 20, 6);
        
        this.ctx.restore();
        
        // Trail Partikel - world-abhängig
        if (Math.abs(player.velocityX) > 50 || Math.abs(player.velocityY) > 50) {
            this.trailParticles.push({
                x: centerX + (Math.random() - 0.5) * player.width,
                y: centerY + (Math.random() - 0.5) * player.height,
                size: Math.random() * 6 + 3,
                alpha: 0.6,
                color: Math.random() > 0.5 ? colors.light : colors.main
            });
        }
        
        if (this.trailParticles.length > 30) {
            this.trailParticles.shift();
        }
    }

    drawSlimeTrail(player) {
        // Update und zeichne Schleim-Spur
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const particle = this.trailParticles[i];
            
            particle.alpha -= 0.02;
            particle.size *= 0.98;
            
            if (particle.alpha <= 0 || particle.size < 1) {
                this.trailParticles.splice(i, 1);
                continue;
            }
            
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
        }
        
        this.ctx.globalAlpha = 1;
    }

    drawLevel(level) {
        this.currentWorld = level.world || 1;
        const world = this.currentWorld;
        
        // World-abhängige Goal-Farben
        const goalColors = world === 3
            ? { outer: 'rgba(255, 215, 0, 0.6)', inner: '#FFF59D', shadow: '#DAA520' }
            : world === 2
            ? { outer: 'rgba(70, 130, 180, 0.6)', inner: '#87CEEB', shadow: '#2C5282' }
            : { outer: 'rgba(255, 105, 180, 0.6)', inner: '#FFB3D9', shadow: '#CC6699' };
        
        // Black Holes
        if (level.blackHoles) {
            level.blackHoles.forEach(hole => {
                this.drawBlackHole(hole);
            });
        }
        
        // Goal Portal
        this.sparkleTime += 0.1;
        
        const goalCenterX = level.goal.x + level.goal.width / 2;
        const goalCenterY = level.goal.y + level.goal.height / 2;
        
        const layers = 4;
        for (let layer = 0; layer < layers; layer++) {
            const pixelCount = 8;
            const radius = 50 - layer * 10;
            const rotation = this.sparkleTime * (1 + layer * 0.3);
            
            for (let i = 0; i < pixelCount; i++) {
                const angle = rotation + (i / pixelCount) * Math.PI * 2;
                const x = goalCenterX + Math.cos(angle) * radius;
                const y = goalCenterY + Math.sin(angle) * radius;
                const size = 8 - layer * 1.5;
                
                this.ctx.fillStyle = goalColors.shadow;
                this.ctx.fillRect(x - size/2 + 2, y - size/2 + 2, size, size);
                
                const alpha = 0.5 + Math.sin(this.sparkleTime * 3 + i + layer) * 0.3;
                this.ctx.fillStyle = goalColors.outer.replace('0.6', alpha.toString());
                this.ctx.fillRect(x - size/2, y - size/2, size, size);
            }
        }
        
        // Kern
        const coreSize = 20 + Math.sin(this.sparkleTime * 4) * 6;
        const pixelSize = 4;
        const gridSize = Math.ceil(coreSize / pixelSize);
        
        for (let py = -gridSize; py <= gridSize; py++) {
            for (let px = -gridSize; px <= gridSize; px++) {
                const dist = Math.sqrt(px * px + py * py);
                if (dist <= gridSize) {
                    this.ctx.fillStyle = goalColors.shadow;
                    this.ctx.fillRect(
                        goalCenterX + px * pixelSize - pixelSize/2 + 2,
                        goalCenterY + py * pixelSize - pixelSize/2 + 2,
                        pixelSize,
                        pixelSize
                    );
                    
                    const brightness = 1 - (dist / gridSize) * 0.3;
                    this.ctx.fillStyle = goalColors.inner;
                    this.ctx.globalAlpha = brightness;
                    this.ctx.fillRect(
                        goalCenterX + px * pixelSize - pixelSize/2,
                        goalCenterY + py * pixelSize - pixelSize/2,
                        pixelSize,
                        pixelSize
                    );
                    this.ctx.globalAlpha = 1;
                }
            }
        }

        // Draw platforms mit Schatten
        for (let platform of level.platforms) {
            // Schatten
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(platform.x + 4, platform.y + 4, platform.width, platform.height);

            // Plattform
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

            // Pixel-Art Highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(platform.x + 4, platform.y + 4, platform.width - 8, 4);
        }

        // Draw glue platforms
        if (level.gluePlatforms) {
            for (let platform of level.gluePlatforms) {
                // Schatten
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.fillRect(platform.x + 4, platform.y + 4, platform.width, platform.height);

                // Glue Platform - Blau mit Glue-Effekt
                const gradient = this.ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
                gradient.addColorStop(0, '#5FB3D6');
                gradient.addColorStop(1, '#4682B4');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

                // Glue Drops/Bubbles Effect
                const bubbleCount = Math.floor(platform.width / 20);
                for (let i = 0; i < bubbleCount; i++) {
                    const bubbleX = platform.x + 10 + i * 20 + Math.sin(this.sparkleTime * 2 + i) * 3;
                    const bubbleY = platform.y + 6 + Math.sin(this.sparkleTime * 3 + i * 0.5) * 2;
                    const bubbleSize = 6 + Math.sin(this.sparkleTime * 2 + i * 1.5) * 2;

                    this.ctx.fillStyle = 'rgba(135, 206, 235, 0.6)';
                    this.ctx.fillRect(bubbleX - bubbleSize/2, bubbleY - bubbleSize/2, bubbleSize, bubbleSize);
                }

                // Border
                this.ctx.strokeStyle = '#2C5282';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            }
        }

        // Draw crumbling platforms mit Schatten
        if (level.crumblingPlatforms) {
            for (let platform of level.crumblingPlatforms) {
                if (!platform.isDestroyed) {
                    // Schatten (nur wenn nicht am bröckeln)
                    if (!platform.isCrumbling) {
                        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                        this.ctx.fillRect(platform.x + 4, platform.y + 4, platform.width, platform.height);
                    }
                    
                    this.ctx.fillStyle = '#000000';
                    
                    // Zeichne jedes Pixel einzeln
                    platform.pixels.forEach(pixel => {
                        if (pixel.alpha > 0) {
                            this.ctx.save();
                            this.ctx.globalAlpha = pixel.alpha;
                            
                            if (pixel.isFalling) {
                                // Rotation beim Fallen
                                this.ctx.translate(pixel.x + pixel.size/2, pixel.y + pixel.size/2);
                                this.ctx.rotate(pixel.rotation);
                                
                                // Mini Schatten
                                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                                this.ctx.fillRect(-pixel.size/2 + 1, -pixel.size/2 + 1, pixel.size, pixel.size);
                                
                                this.ctx.fillStyle = '#000000';
                                this.ctx.fillRect(-pixel.size/2, -pixel.size/2, pixel.size, pixel.size);
                            } else {
                                // Normal am Platz
                                this.ctx.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
                            }
                            
                            this.ctx.restore();
                        }
                    });
                    
                    // Risse zeichnen (pixel art style)
                    if (platform.touchCount > 0 && !platform.isCrumbling) {
                        this.ctx.globalAlpha = 0.6;
                        
                        if (platform.touchCount === 1) {
                            this.drawCrackPattern1(platform);
                        }
                        
                        this.ctx.globalAlpha = 1;
                    }
                }
            }
        }

        // Draw blinking platforms with fade effect
        if (level.blinkingPlatforms) {
            for (let platform of level.blinkingPlatforms) {
                this.ctx.save();
                this.ctx.globalAlpha = platform.opacity;
                
                // Shadow (only when visible enough)
                if (platform.opacity > 0.3) {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    this.ctx.fillRect(platform.x + 4, platform.y + 4, platform.width, platform.height);
                }
                
                // Platform
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                
                // Warning flash effect - yellow glow
                if (platform.isWarning) {
                    this.ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
                    this.ctx.fillRect(platform.x - 2, platform.y - 2, platform.width + 4, platform.height + 4);
                }
                
                // Highlight
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.fillRect(platform.x + 2, platform.y + 2, platform.width - 4, 2);
                
                this.ctx.restore();
            }
        }

        // Draw spikes - grober/pixeliger
        for (let spike of level.spikes) {
            // Schatten
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.moveTo(spike.x + 3, spike.y + spike.height + 3);
            this.ctx.lineTo(spike.x + spike.width / 2 + 3, spike.y + 3);
            this.ctx.lineTo(spike.x + spike.width + 3, spike.y + spike.height + 3);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Spike - pixel-art style (grober)
            this.ctx.fillStyle = '#000000';
            
            // Basis
            this.ctx.fillRect(spike.x, spike.y + spike.height - 10, spike.width, 10);
            
            // Mittlerer Teil - gestaffelt
            const steps = 3;
            const stepHeight = (spike.height - 10) / steps;
            for (let i = 0; i < steps; i++) {
                const stepWidth = spike.width - (i * 8);
                const stepX = spike.x + (i * 4);
                const stepY = spike.y + spike.height - 10 - (i + 1) * stepHeight;
                this.ctx.fillRect(stepX, stepY, stepWidth, stepHeight);
            }
            
            // Spitze
            const tipWidth = 8;
            this.ctx.fillRect(
                spike.x + spike.width / 2 - tipWidth / 2,
                spike.y,
                tipWidth,
                stepHeight
            );
        }
        
        // Draw moving spikes - grober
        if (level.movingSpikes) {
            for (let spike of level.movingSpikes) {
                const centerX = spike.x + spike.width / 2;
                const centerY = spike.y + spike.width / 2;
                const radius = spike.width / 2;
                
                // Schatten
                this.ctx.save();
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(centerX + 4, centerY + 4, radius * 0.7, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
                
                // Main ball - pixeliger
                this.ctx.fillStyle = '#DC143C';
                
                // Kern als Pixel-Rechtecke
                const pixelSize = 6;
                const gridSize = Math.floor(radius * 1.4 / pixelSize);
                for (let py = -gridSize; py <= gridSize; py++) {
                    for (let px = -gridSize; px <= gridSize; px++) {
                        const dist = Math.sqrt(px * px + py * py);
                        if (dist <= gridSize * 0.7) {
                            this.ctx.fillRect(
                                centerX + px * pixelSize - pixelSize/2,
                                centerY + py * pixelSize - pixelSize/2,
                                pixelSize,
                                pixelSize
                            );
                        }
                    }
                }
                
                // Grobe Spikes
                const spikeCount = 8;
                this.ctx.fillStyle = '#8B0000';
                for (let i = 0; i < spikeCount; i++) {
                    const angle = (i / spikeCount) * Math.PI * 2;
                    const innerX = centerX + Math.cos(angle) * radius * 0.7;
                    const innerY = centerY + Math.sin(angle) * radius * 0.7;
                    const outerX = centerX + Math.cos(angle) * radius;
                    const outerY = centerY + Math.sin(angle) * radius;
                    
                    // Spike als Rechteck statt Dreieck
                    const spikeWidth = 8;
                    this.ctx.save();
                    this.ctx.translate(centerX, centerY);
                    this.ctx.rotate(angle);
                    this.ctx.fillRect(
                        radius * 0.5 - spikeWidth/2,
                        -spikeWidth/2,
                        radius * 0.5,
                        spikeWidth
                    );
                    this.ctx.restore();
                }
            }
        }

        // Draw turrets
        if (level.turrets) {
            for (let turret of level.turrets) {
                const centerX = turret.x + turret.width / 2;
                const centerY = turret.y + turret.height / 2;

                // Schatten
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.fillRect(turret.x + 4, turret.y + 4, turret.width, turret.height);

                // Base
                this.ctx.fillStyle = '#2C5282';
                this.ctx.fillRect(turret.x, turret.y, turret.width, turret.height);

                // Charging effect
                if (turret.isCharging) {
                    const chargeSize = 30 * turret.chargeProgress;
                    const chargeAlpha = 0.3 + turret.chargeProgress * 0.5;

                    this.ctx.fillStyle = `rgba(255, 100, 100, ${chargeAlpha})`;
                    this.ctx.fillRect(centerX - chargeSize/2, centerY - chargeSize/2, chargeSize, chargeSize);
                }

                // Barrel direction indicator
                this.ctx.fillStyle = '#FF6B6B';
                let barrelX = centerX;
                let barrelY = centerY;
                let barrelW = 8;
                let barrelH = 20;

                this.ctx.save();
                this.ctx.translate(centerX, centerY);

                switch(turret.shootDirection) {
                    case 'left':
                        this.ctx.rotate(Math.PI);
                        break;
                    case 'right':
                        // No rotation needed
                        break;
                    case 'up':
                        this.ctx.rotate(-Math.PI / 2);
                        break;
                    case 'down':
                        this.ctx.rotate(Math.PI / 2);
                        break;
                }

                this.ctx.fillRect(10, -barrelW/2, barrelH, barrelW);
                this.ctx.restore();

                // Eye/Core
                const eyeSize = 8 + (turret.isCharging ? turret.chargeProgress * 4 : 0);
                this.ctx.fillStyle = turret.isCharging ? '#FF3333' : '#4682B4';
                this.ctx.fillRect(centerX - eyeSize/2, centerY - eyeSize/2, eyeSize, eyeSize);

                // Border
                this.ctx.strokeStyle = '#1E3A8A';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(turret.x, turret.y, turret.width, turret.height);
            }
        }
    }

    drawBlackHole(hole) {
        const centerX = hole.x + hole.width / 2;
        const centerY = hole.y + hole.height / 2;
        
        this.sparkleTime = this.sparkleTime || 0;
        
        // Pull-Radius Visualisierung - VIEL GRÖßER
        for (let ring = 0; ring < 6; ring++) { // Mehr Ringe (war 4)
            const radius = hole.pullRadius - ring * 40 - (this.sparkleTime * 30 % 40);
            const alpha = 0.15 - ring * 0.02;
            
            this.ctx.strokeStyle = `rgba(60, 60, 60, ${alpha})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Rotierende Pixel-Spirale
        const layers = 8; // Mehr Layers (war 6)
        for (let layer = 0; layer < layers; layer++) {
            const pixelCount = 20 - layer * 2;
            const radius = 70 - layer * 8; // Größer (war 50)
            const rotation = -this.sparkleTime * (3 + layer * 0.7);
            
            for (let i = 0; i < pixelCount; i++) {
                const angle = rotation + (i / pixelCount) * Math.PI * 2;
                const spiralTightness = layer * 0.5;
                const x = centerX + Math.cos(angle + spiralTightness) * radius;
                const y = centerY + Math.sin(angle + spiralTightness) * radius;
                const size = 7 - layer * 0.7; // Größer
                
                const alpha = 0.8 - layer * 0.08;
                const brightness = 90 - layer * 8;
                this.ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`;
                this.ctx.fillRect(x - size/2, y - size/2, size, size);
                
                if (layer < 4) {
                    this.ctx.fillStyle = `rgba(130, 130, 130, ${alpha * 0.5})`;
                    this.ctx.fillRect(x - size/3, y - size/3, size/1.5, size/1.5);
                }
            }
        }
        
        // Schwarzer Kern
        const corePulse = Math.sin(this.sparkleTime * 4) * 0.3 + 1;
        const coreSize = 25 * corePulse; // Größer (war 22)
        const pixelSize = 3.5;
        const gridSize = Math.ceil(coreSize / pixelSize);
        
        for (let py = -gridSize; py <= gridSize; py++) {
            for (let px = -gridSize; px <= gridSize; px++) {
                const dist = Math.sqrt(px * px + py * py);
                if (dist <= gridSize) {
                    const distFactor = 1 - (dist / gridSize);
                    const brightness = Math.floor(5 + distFactor * 15);
                    
                    this.ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
                    this.ctx.fillRect(
                        centerX + px * pixelSize - pixelSize/2,
                        centerY + py * pixelSize - pixelSize/2,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }
        
        // Event Horizon Ring
        const horizonPulse = Math.sin(this.sparkleTime * 3) * 0.15 + 1;
        this.ctx.strokeStyle = `rgba(110, 110, 110, ${0.6 * horizonPulse})`;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 32, 0, Math.PI * 2); // Größer (war 28)
        this.ctx.stroke();
    }

    drawCrackPattern1(platform) {
        const ctx = this.ctx;
        const x = platform.x;
        const y = platform.y;
        const w = platform.width;
        const h = platform.height;
        
        // Pixel art cracks - using rectangles instead of lines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        
        // Vertical crack in the middle
        const crackWidth = 2;
        const centerX = x + w / 2;
        
        // Draw stepped vertical crack
        for (let i = 0; i < h; i += 8) {
            const offset = (Math.floor(i / 8) % 2) * 4 - 2; // Zigzag pattern
            ctx.fillRect(centerX + offset, y + i, crackWidth, 8);
        }
        
        // Small horizontal cracks branching out
        ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.2, crackWidth);
        ctx.fillRect(x + w * 0.5, y + h * 0.6, w * 0.3, crackWidth);
    }

    drawCrackPattern2(platform) {
        const ctx = this.ctx;
        const x = platform.x;
        const y = platform.y;
        const w = platform.width;
        const h = platform.height;
        
        // Zentrale Bruchlinie
        ctx.beginPath();
        ctx.moveTo(x + w * 0.5, y);
        ctx.lineTo(x + w * 0.5, y + h);
        ctx.stroke();
        
        // Diagonale Risse - viele
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w * 0.5, y + h * 0.5);
        ctx.lineTo(x + w, y + h);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + w, y);
        ctx.lineTo(x + w * 0.5, y + h * 0.5);
        ctx.lineTo(x, y + h);
        ctx.stroke();
        
        // Kreuzende Risse
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, y);
        ctx.lineTo(x + w * 0.3, y + h);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + w * 0.7, y);
        ctx.lineTo(x + w * 0.7, y + h);
        ctx.stroke();
        
        // Horizontale Brüche
        ctx.beginPath();
        ctx.moveTo(x, y + h * 0.5);
        ctx.lineTo(x + w, y + h * 0.5);
        ctx.stroke();
        
        // Zusätzliche kleine Risse
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, y + h * 0.3);
        ctx.lineTo(x + w * 0.4, y + h * 0.6);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + w * 0.8, y + h * 0.3);
        ctx.lineTo(x + w * 0.6, y + h * 0.6);
        ctx.stroke();
    }

    drawSpikeBall(x, y, size) {
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const radius = size / 2;
        const spikeCount = 12;
        
        // Main ball
        this.ctx.fillStyle = '#DC143C';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Spikes around ball
        for (let i = 0; i < spikeCount; i++) {
            const angle = (i / spikeCount) * Math.PI * 2;
            const innerX = centerX + Math.cos(angle) * radius * 0.7;
            const innerY = centerY + Math.sin(angle) * radius * 0.7;
            const outerX = centerX + Math.cos(angle) * radius;
            const outerY = centerY + Math.sin(angle) * radius;
            
            const angle1 = angle - 0.15;
            const angle2 = angle + 0.15;
            const base1X = centerX + Math.cos(angle1) * radius * 0.7;
            const base1Y = centerY + Math.sin(angle1) * radius * 0.7;
            const base2X = centerX + Math.cos(angle2) * radius * 0.7;
            const base2Y = centerY + Math.sin(angle2) * radius * 0.7;
            
            this.ctx.fillStyle = '#8B0000';
            this.ctx.beginPath();
            this.ctx.moveTo(base1X, base1Y);
            this.ctx.lineTo(outerX, outerY);
            this.ctx.lineTo(base2X, base2Y);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    drawParticles(particleSystem) {
        particleSystem.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;

            const size = particle.size || 4;
            this.ctx.fillRect(particle.x - size/2, particle.y - size/2, size, size);
        });

        this.ctx.globalAlpha = 1;
    }

    drawProjectiles(projectiles) {
        projectiles.forEach(projectile => {
            const centerX = projectile.x + projectile.width / 2;
            const centerY = projectile.y + projectile.height / 2;

            // Schatten
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(projectile.x + 2, projectile.y + 2, projectile.width, projectile.height);

            // Projectile - Pixel-Art style
            this.ctx.fillStyle = '#FF4444';
            this.ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);

            // Inner glow
            const glowSize = projectile.width * 0.6;
            this.ctx.fillStyle = '#FF8888';
            this.ctx.fillRect(
                centerX - glowSize/2,
                centerY - glowSize/2,
                glowSize,
                glowSize
            );

            // Border
            this.ctx.strokeStyle = '#CC0000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(projectile.x, projectile.y, projectile.width, projectile.height);

            // Trail effect
            if (Math.abs(projectile.velocityX) > 100 || Math.abs(projectile.velocityY) > 100) {
                const trailLength = 3;
                const trailSpacing = 8;

                for (let i = 1; i <= trailLength; i++) {
                    const trailX = centerX - (projectile.velocityX / 300) * trailSpacing * i;
                    const trailY = centerY - (projectile.velocityY / 300) * trailSpacing * i;
                    const trailSize = projectile.width * (1 - i * 0.2);
                    const trailAlpha = 0.4 - i * 0.1;

                    this.ctx.globalAlpha = trailAlpha;
                    this.ctx.fillStyle = '#FF6666';
                    this.ctx.fillRect(trailX - trailSize/2, trailY - trailSize/2, trailSize, trailSize);
                }
                this.ctx.globalAlpha = 1;
            }
        });
    }
}
