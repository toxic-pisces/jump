export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.sparkleTime = 0;
        this.trailParticles = [];
        this.backgroundOffset = 0; // Für subtile Animation
    }

    /**
     * Auto-tiling helper: Detects neighboring platforms for seamless blending
     * @param {Object} platform - The platform to check neighbors for
     * @param {Array} allPlatforms - All platforms in the level
     * @returns {Object} Object with neighbor flags and draw dimensions
     */
    getNeighborInfo(platform, allPlatforms) {
        const tolerance = 3; // Distance tolerance for considering platforms as neighbors

        // Check all 4 cardinal directions for neighbors
        const hasNeighborAbove = allPlatforms.some(p =>
            p !== platform &&
            Math.abs((p.y + p.height) - platform.y) <= tolerance &&
            platform.x < p.x + p.width &&
            platform.x + platform.width > p.x
        );

        const hasNeighborBelow = allPlatforms.some(p =>
            p !== platform &&
            Math.abs(platform.y + platform.height - p.y) <= tolerance &&
            platform.x < p.x + p.width &&
            platform.x + platform.width > p.x
        );

        const hasNeighborLeft = allPlatforms.some(p =>
            p !== platform &&
            Math.abs((p.x + p.width) - platform.x) <= tolerance &&
            platform.y < p.y + p.height &&
            platform.y + platform.height > p.y
        );

        const hasNeighborRight = allPlatforms.some(p =>
            p !== platform &&
            Math.abs(platform.x + platform.width - p.x) <= tolerance &&
            platform.y < p.y + p.height &&
            platform.y + platform.height > p.y
        );

        // Calculate extended draw dimensions to overlap with neighbors
        const drawX = hasNeighborLeft ? platform.x - tolerance : platform.x;
        const drawY = hasNeighborAbove ? platform.y - tolerance : platform.y;
        const drawWidth = platform.width + (hasNeighborLeft ? tolerance : 0) + (hasNeighborRight ? tolerance : 0);
        const drawHeight = platform.height + (hasNeighborAbove ? tolerance : 0) + (hasNeighborBelow ? tolerance : 0);

        return {
            hasNeighborAbove,
            hasNeighborBelow,
            hasNeighborLeft,
            hasNeighborRight,
            drawX,
            drawY,
            drawWidth,
            drawHeight,
            // Helper flags for common checks
            hasAnyNeighbor: hasNeighborAbove || hasNeighborBelow || hasNeighborLeft || hasNeighborRight,
            hasFreeBottomRight: !hasNeighborRight && !hasNeighborBelow
        };
    }

    /**
     * Collects all platforms of all types into one array
     * @param {Object} level - The level object containing all platform arrays
     * @returns {Array} Combined array of all platforms
     */
    getAllPlatforms(level) {
        return [
            ...(level.platforms || []),
            ...(level.movingPlatforms || []),
            ...(level.gluePlatforms || []),
            ...(level.blinkingPlatforms || []),
            ...(level.crumblingPlatforms || []),
            ...(level.pressurePlatforms || [])
        ];
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

        if (world === 3) {
            // Gelbe/Gold Welt
            const skyColors = [
                '#FFFEF7',
                '#FFFBEA',
                '#FFF8DD',
                '#FFF5D0',
                '#FFF2C3',
                '#FFEFB6'
            ];

            const stripeHeight = this.canvas.height / skyColors.length;
            skyColors.forEach((color, i) => {
                this.ctx.fillStyle = color;
                this.ctx.fillRect(0, i * stripeHeight, this.canvas.width, stripeHeight);
            });

            // Gelbes Grid
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.04)';
        } else if (world === 2) {
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
        // Import SkinMenu to get current skin colors
        const world = this.currentWorld || 1;
        
        // Get colors from selected skin
        const colors = typeof window.SkinMenu !== 'undefined' && window.SkinMenu.getSkinColors
            ? window.SkinMenu.getSkinColors(world)
            : (world === 3
                ? { main: '#FFD700', light: '#FFF59D', dark: '#DAA520', border: '#DAA520' }
                : world === 2
                ? { main: '#4682B4', light: '#87CEEB', dark: '#1E3A8A', border: '#2C5282' }
                : { main: '#FF8FC7', light: '#FFB3D9', dark: '#FF6BB5', border: '#FF6BB5' });

        this.drawSlimeTrail(player);
        
        this.ctx.save();
        
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        
        this.ctx.translate(centerX, centerY);
        
        // Just use player rotation, no extra tilt
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
        
        // Special rendering for different skins
        if (colors.special === 'rainbow') {
            // Rainbow gradient
            const gradient = this.ctx.createLinearGradient(-player.width/2, -player.height/2, player.width/2, player.height/2);
            const time = Date.now() * 0.001;
            const hueShift = (time * 50) % 360;
            gradient.addColorStop(0, `hsl(${hueShift}, 100%, 50%)`);
            gradient.addColorStop(0.5, `hsl(${(hueShift + 120) % 360}, 100%, 50%)`);
            gradient.addColorStop(1, `hsl(${(hueShift + 240) % 360}, 100%, 50%)`);
            this.ctx.fillStyle = gradient;
        } else if (colors.special === 'lightning') {
            // Lightning glow effect
            const gradient = this.ctx.createLinearGradient(-player.width/2, -player.height/2, player.width/2, player.height/2);
            gradient.addColorStop(0, '#FFFFFF');
            gradient.addColorStop(0.5, colors.light);
            gradient.addColorStop(1, colors.main);
            this.ctx.fillStyle = gradient;
            
            // Add glow
            this.ctx.shadowColor = colors.light;
            this.ctx.shadowBlur = 15;
        } else if (colors.special === 'neongreen') {
            // Neon green glow effect
            const gradient = this.ctx.createLinearGradient(-player.width/2, -player.height/2, player.width/2, player.height/2);
            gradient.addColorStop(0, colors.light);
            gradient.addColorStop(0.5, colors.main);
            gradient.addColorStop(1, colors.dark);
            this.ctx.fillStyle = gradient;
            
            // Add neon glow
            this.ctx.shadowColor = colors.main;
            this.ctx.shadowBlur = 20;
        } else if (colors.special === 'glue') {
            // Glue slime effect - like glue platforms
            const gradient = this.ctx.createLinearGradient(-player.width/2, -player.height/2, player.width/2, player.height/2);
            gradient.addColorStop(0, colors.light);
            gradient.addColorStop(0.5, colors.main);
            gradient.addColorStop(1, colors.dark);
            this.ctx.fillStyle = gradient;
        } else if (colors.special === 'spike') {
            // Gray metallic spike gradient - matching in-game spike blocks
            this.ctx.fillStyle = colors.main;
        } else {
            // Standard gradient
            const gradient = this.ctx.createLinearGradient(-player.width/2, -player.height/2, player.width/2, player.height/2);
            gradient.addColorStop(0, colors.light);
            gradient.addColorStop(1, colors.main);
            this.ctx.fillStyle = gradient;
        }
        
        this.ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Special pixel rendering for spike skin BEFORE border
        if (colors.special === 'spike') {
            // Draw metallic gradient body with exact colors from real spikes
            const pixelSize = 4;
            const gridWidth = player.width / pixelSize;
            const gridHeight = player.height / pixelSize;
            
            for (let gy = 0; gy < gridHeight; gy++) {
                for (let gx = 0; gx < gridWidth; gx++) {
                    const px = -player.width/2 + gx * pixelSize;
                    const py = -player.height/2 + gy * pixelSize;
                    
                    const verticalPos = gy / gridHeight;
                    const horizontalPos = gx / gridWidth;
                    
                    let color;
                    
                    // Dark gunmetal body with metallic sheen (exact colors from spike blocks)
                    if (verticalPos < 0.3) {
                        // Top highlight - metallic shine
                        if (horizontalPos > 0.3 && horizontalPos < 0.7) {
                            color = '#6A7B8C'; // Light steel
                        } else {
                            color = '#4A5B6C'; // Medium steel
                        }
                    } else if (verticalPos < 0.7) {
                        // Middle - darker metal
                        color = gx % 2 === gy % 2 ? '#3A4B5C' : '#2A3B4C';
                    } else {
                        // Bottom - darkest
                        color = '#1A2B3C';
                    }
                    
                    // Add metallic edge highlights
                    if (gx === 0 || gy === 0) {
                        color = '#7A8B9C'; // Bright edge
                    }
                    if (gx === gridWidth - 1 || gy === gridHeight - 1) {
                        color = '#0A1B2C'; // Dark edge
                    }
                    
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(px, py, pixelSize, pixelSize);
                }
            }
        }
        
        // Border (with spikes integrated for spike skin)
        if (colors.special === 'spike') {
            // Draw spike border - pixel spikes integrated into the border
            const pixelSize = 4;
            this.ctx.fillStyle = colors.border;
            
            // Top edge with spikes
            const topSpikeX = [-player.width/2 + pixelSize, 0 - pixelSize/2, player.width/2 - pixelSize * 2];
            topSpikeX.forEach(x => {
                // Spike tip
                this.ctx.fillRect(x + pixelSize, -player.height/2 - pixelSize, pixelSize, pixelSize);
                // Spike base (3 pixels wide)
                this.ctx.fillRect(x, -player.height/2, pixelSize, pixelSize);
                this.ctx.fillRect(x + pixelSize, -player.height/2, pixelSize, pixelSize);
                this.ctx.fillRect(x + pixelSize * 2, -player.height/2, pixelSize, pixelSize);
            });
            
            // Bottom edge with spikes
            const bottomSpikeX = [-player.width/2 + pixelSize, 0 - pixelSize/2, player.width/2 - pixelSize * 2];
            bottomSpikeX.forEach(x => {
                // Spike tip
                this.ctx.fillRect(x + pixelSize, player.height/2, pixelSize, pixelSize);
                // Spike base (3 pixels wide)
                this.ctx.fillRect(x, player.height/2 - pixelSize, pixelSize, pixelSize);
                this.ctx.fillRect(x + pixelSize, player.height/2 - pixelSize, pixelSize, pixelSize);
                this.ctx.fillRect(x + pixelSize * 2, player.height/2 - pixelSize, pixelSize, pixelSize);
            });
            
            // Left edge with spikes
            const leftSpikeY = [-player.height/2 + pixelSize, 0 - pixelSize/2, player.height/2 - pixelSize * 2];
            leftSpikeY.forEach(y => {
                // Spike tip
                this.ctx.fillRect(-player.width/2 - pixelSize, y + pixelSize, pixelSize, pixelSize);
                // Spike base (3 pixels tall)
                this.ctx.fillRect(-player.width/2, y, pixelSize, pixelSize);
                this.ctx.fillRect(-player.width/2, y + pixelSize, pixelSize, pixelSize);
                this.ctx.fillRect(-player.width/2, y + pixelSize * 2, pixelSize, pixelSize);
            });
            
            // Right edge with spikes
            const rightSpikeY = [-player.height/2 + pixelSize, 0 - pixelSize/2, player.height/2 - pixelSize * 2];
            rightSpikeY.forEach(y => {
                // Spike tip
                this.ctx.fillRect(player.width/2, y + pixelSize, pixelSize, pixelSize);
                // Spike base (3 pixels tall)
                this.ctx.fillRect(player.width/2 - pixelSize, y, pixelSize, pixelSize);
                this.ctx.fillRect(player.width/2 - pixelSize, y + pixelSize, pixelSize, pixelSize);
                this.ctx.fillRect(player.width/2 - pixelSize, y + pixelSize * 2, pixelSize, pixelSize);
            });
        } else {
            // Normal border
            this.ctx.strokeStyle = colors.border;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(-player.width/2, -player.height/2, player.width, player.height);
        }
        
        // Face rendering
        if (colors.special === 'angry') {
            // Angry face
            this.ctx.fillStyle = '#000000';
            // Eyes
            this.ctx.fillRect(-10, -5, 6, 6);
            this.ctx.fillRect(4, -5, 6, 6);
            // Angry eyebrows
            this.ctx.fillRect(-12, -8, 8, 3);
            this.ctx.fillRect(4, -8, 8, 3);
            // Frown
            this.ctx.fillRect(-8, 8, 16, 3);
            this.ctx.fillRect(-10, 6, 4, 3);
            this.ctx.fillRect(6, 6, 4, 3);
        } else if (colors.special === 'glue') {
            // Draw slime drips like glue platforms
            const time = Date.now() * 0.001;
            this.ctx.fillStyle = colors.dark;
            const dripSize = 4;
            // Animated drips on edges
            const offset1 = Math.sin(time * 2) * 2;
            const offset2 = Math.sin(time * 2 + 2) * 2;
            
            // Top drips
            this.ctx.fillRect(-player.width/2 + 8, -player.height/2 - dripSize + offset1, dripSize, dripSize);
            this.ctx.fillRect(0, -player.height/2 - dripSize + offset2, dripSize, dripSize);
            this.ctx.fillRect(player.width/2 - 12, -player.height/2 - dripSize + offset1, dripSize, dripSize);
            
            // Side drips
            this.ctx.fillRect(-player.width/2 - dripSize + offset2, -8, dripSize, dripSize);
            this.ctx.fillRect(player.width/2 + offset1, -8, dripSize, dripSize);
            this.ctx.fillRect(-player.width/2 - dripSize + offset1, 4, dripSize, dripSize);
            this.ctx.fillRect(player.width/2 + offset2, 4, dripSize, dripSize);
            
            // Normal eyes
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(-10, -5, 6, 6);
            this.ctx.fillRect(4, -5, 6, 6);
        } else if (colors.special === 'spike') {
            // No eyes for spike skin - just the metallic spike block
        } else {
            // Normal eyes
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(-10, -5, 6, 6);
            this.ctx.fillRect(4, -5, 6, 6);
        }
        
        // Highlight (not for lightning/neongreen/spike as they have special rendering)
        if (colors.special !== 'lightning' && colors.special !== 'neongreen' && colors.special !== 'spike') {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(-player.width/2 + 4, -player.height/2 + 4, player.width - 20, 6);
        }
        
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
        const allPlatforms = this.getAllPlatforms(level);

        for (let platform of level.platforms) {
            // Use auto-tiling system for seamless blending
            const neighbors = this.getNeighborInfo(platform, allPlatforms);

            // Schatten - only on free edges
            if (neighbors.hasFreeBottomRight) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                this.ctx.fillRect(platform.x + 3, platform.y + 3, platform.width, platform.height);
            }

            // Main platform - plain black, extended to seamlessly blend with neighbors
            this.ctx.fillStyle = '#1A1A1A';
            this.ctx.fillRect(neighbors.drawX, neighbors.drawY, neighbors.drawWidth, neighbors.drawHeight);
        }

        // Draw glue platforms
        if (level.gluePlatforms) {
            for (let platform of level.gluePlatforms) {
                const time = this.sparkleTime || 0;

                // Use auto-tiling system for seamless blending
                const neighbors = this.getNeighborInfo(platform, allPlatforms);

                // Schatten - only on free edges
                if (neighbors.hasFreeBottomRight) {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    this.ctx.fillRect(platform.x + 3, platform.y + 3, platform.width, platform.height);
                }

                // Main platform base - solid black for consistency, extended to seamlessly blend with neighbors
                this.ctx.fillStyle = '#1A1A1A';
                this.ctx.fillRect(neighbors.drawX, neighbors.drawY, neighbors.drawWidth, neighbors.drawHeight);

                // SLIME LAYER - covers top and sides, not bottom
                const slimeColor = '#2193B0';
                const slimeLightColor = '#6DD5ED';
                const slimeDarkColor = '#1A7A8F';
                const pixelSize = 6;

                // TOP EDGE - thin slime layer, but skip parts that touch another block
                const topSlimeHeight = 2; // Same thickness as sides (2 pixels = 12px)
                for (let p = 0; p < topSlimeHeight; p++) {
                    const y = platform.y + p * pixelSize;
                    
                    for (let col = 0; col < Math.floor(platform.width / pixelSize); col++) {
                        const x = platform.x + col * pixelSize;
                        
                        // Check if this specific pixel position touches ANY block above
                        const touchingAbove = allPlatforms.some(other => 
                            other !== platform &&
                            Math.abs((other.y + other.height) - platform.y) <= 3 &&
                            x >= other.x - 3 && x < other.x + other.width + 3
                        );
                        
                        // Only draw slime where NOT touching
                        if (!touchingAbove) {
                            let color = slimeColor;
                            if (p === 0) color = slimeLightColor; // Top edge
                            if (p === topSlimeHeight - 1) color = slimeDarkColor; // Bottom edge
                            
                            this.ctx.fillStyle = color;
                            this.ctx.fillRect(x, y, pixelSize, pixelSize);
                        }
                    }
                }

                // LEFT SIDE - only draw slime where NOT touching another block
                const leftHeight = Math.floor(platform.height / pixelSize);
                for (let i = 0; i < leftHeight; i++) {
                    const y = platform.y + i * pixelSize;
                    
                    // Check if this specific vertical position touches ANY block on the left
                    const touchingLeft = allPlatforms.some(other => 
                        other !== platform &&
                        Math.abs((other.x + other.width) - platform.x) <= 3 &&
                        y >= other.y - 3 && y < other.y + other.height + 3
                    );
                    
                    if (!touchingLeft) {
                        const depthFromTop = i / leftHeight;
                        
                        // Slight bulge in the middle
                        const bulge = Math.sin(depthFromTop * Math.PI) * 0.3;
                        const baseWidth = 2; // Always extends 2 pixels out
                        const extraPixel = (bulge > 0.2 && Math.sin(time * 0.15 + i * 0.3) > 0.3) ? 1 : 0;
                        const slimeWidth = baseWidth + extraPixel;
                        
                        for (let p = 0; p < slimeWidth; p++) {
                            const x = platform.x - p * pixelSize;
                            
                            let color = slimeColor;
                            if (p === 0) color = slimeLightColor; // Edge touching platform
                            if (p === slimeWidth - 1) color = slimeDarkColor; // Outer edge
                            
                            this.ctx.fillStyle = color;
                            this.ctx.fillRect(x, y, pixelSize, pixelSize);
                        }
                    }
                }

                // RIGHT SIDE - only draw slime where NOT touching another block
                const rightHeight = Math.floor(platform.height / pixelSize);
                for (let i = 0; i < rightHeight; i++) {
                    const y = platform.y + i * pixelSize;
                    
                    // Check if this specific vertical position touches ANY block on the right
                    const touchingRight = allPlatforms.some(other => 
                        other !== platform &&
                        Math.abs(platform.x + platform.width - other.x) <= 3 &&
                        y >= other.y - 3 && y < other.y + other.height + 3
                    );
                    
                    if (!touchingRight) {
                        const depthFromTop = i / rightHeight;
                        
                        // Slight bulge in the middle
                        const bulge = Math.sin(depthFromTop * Math.PI) * 0.3;
                        const baseWidth = 2;
                        const extraPixel = (bulge > 0.2 && Math.sin(time * 0.15 + i * 0.3 + 1) > 0.3) ? 1 : 0;
                        const slimeWidth = baseWidth + extraPixel;
                        
                        for (let p = 0; p < slimeWidth; p++) {
                            const x = platform.x + platform.width + p * pixelSize;
                            
                            let color = slimeColor;
                            if (p === 0) color = slimeLightColor;
                            if (p === slimeWidth - 1) color = slimeDarkColor;
                            
                            this.ctx.fillStyle = color;
                            this.ctx.fillRect(x, y, pixelSize, pixelSize);
                        }
                    }
                }

                // SLOW DRIPS from sides (very few, very slow) - only on free sides
                const dripPositions = [0.3, 0.7]; // Only 2 drips per side at fixed positions

                // Left drips - only if no neighbor
                if (!neighbors.hasNeighborLeft) {
                    dripPositions.forEach((pos, idx) => {
                        const dripY = platform.y + platform.height * pos;
                        const dripPhase = time * 0.2 + idx * 2; // Very slow
                        const dripLength = Math.floor(Math.sin(dripPhase) * 1 + 1.5); // 0-2 pixels
                        
                        if (dripLength > 0) {
                            for (let d = 0; d < dripLength; d++) {
                                const color = d === dripLength - 1 ? slimeLightColor : slimeColor;
                                this.ctx.fillStyle = color;
                                this.ctx.fillRect(platform.x - pixelSize - 6, dripY + d * pixelSize, pixelSize, pixelSize);
                                
                                if (d === dripLength - 1) {
                                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                                    this.ctx.fillRect(platform.x - pixelSize - 5, dripY + d * pixelSize + 1, 3, 2);
                                }
                            }
                        }
                    });
                }
                
                // Right drips - only if no neighbor
                if (!neighbors.hasNeighborRight) {
                    dripPositions.forEach((pos, idx) => {
                        const dripY = platform.y + platform.height * pos;
                        const dripPhase = time * 0.2 + idx * 2 + 1;
                        const dripLength = Math.floor(Math.sin(dripPhase) * 1 + 1.5);
                        
                        if (dripLength > 0) {
                            for (let d = 0; d < dripLength; d++) {
                                const color = d === dripLength - 1 ? slimeLightColor : slimeColor;
                                this.ctx.fillStyle = color;
                                this.ctx.fillRect(platform.x + platform.width + 6, dripY + d * pixelSize, pixelSize, pixelSize);
                                
                                if (d === dripLength - 1) {
                                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                                    this.ctx.fillRect(platform.x + platform.width + 7, dripY + d * pixelSize + 1, 3, 2);
                                }
                            }
                        }
                    });
                }

                // BOTTOM - no slime coverage, just exposed black platform
                // (platform bottom edge remains visible)

                // Platform black border
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            }
        }

        // Draw crumbling platforms - greyish-black fragile platforms
        if (level.crumblingPlatforms) {
            for (let platform of level.crumblingPlatforms) {
                if (!platform.isDestroyed) {
                    // Shadow (only when not crumbling)
                    if (!platform.isCrumbling) {
                        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                        this.ctx.fillRect(platform.x + 3, platform.y + 3, platform.width, platform.height);
                    }
                    
                    this.ctx.save();
                    
                    // Apply shake offset to all pixels
                    if (platform.isCrumbling && platform.shakeIntensity > 0) {
                        this.ctx.translate(platform.shakeOffset.x, platform.shakeOffset.y);
                    }
                    
                    // Draw each pixel individually
                    platform.pixels.forEach(pixel => {
                        if (pixel.alpha > 0) {
                            this.ctx.save();
                            this.ctx.globalAlpha = pixel.alpha;
                            
                            if (pixel.isFalling) {
                                // Rotation when falling
                                this.ctx.translate(pixel.x + pixel.size/2, pixel.y + pixel.size/2);
                                this.ctx.rotate(pixel.rotation);
                                
                                // Mini shadow
                                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                                this.ctx.fillRect(-pixel.size/2 + 1, -pixel.size/2 + 1, pixel.size, pixel.size);
                                
                                // Use stored grey shade
                                this.ctx.fillStyle = `rgb(${pixel.greyShade}, ${pixel.greyShade}, ${pixel.greyShade})`;
                                this.ctx.fillRect(-pixel.size/2, -pixel.size/2, pixel.size, pixel.size);
                            } else {
                                // Stationary pixels - use stored random grey shade
                                this.ctx.fillStyle = `rgb(${pixel.greyShade}, ${pixel.greyShade}, ${pixel.greyShade})`;
                                this.ctx.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
                                
                                // Subtle random highlights
                                if (pixel.greyShade > 42) {
                                    this.ctx.fillStyle = 'rgba(90, 90, 90, 0.4)';
                                    this.ctx.fillRect(pixel.x + 1, pixel.y + 1, 2, 2);
                                }
                            }
                            
                            this.ctx.restore();
                        }
                    });
                    
                    this.ctx.restore();
                    
                    // Warning visual when crumbling (subtle red tint on remaining pixels)
                    if (platform.isCrumbling && platform.playerWasOn) {
                        this.ctx.globalAlpha = 0.15;
                        this.ctx.fillStyle = '#8B0000';
                        platform.pixels.forEach(pixel => {
                            if (!pixel.isFalling && pixel.alpha > 0) {
                                this.ctx.fillRect(
                                    pixel.x + platform.shakeOffset.x, 
                                    pixel.y + platform.shakeOffset.y, 
                                    pixel.size, 
                                    pixel.size
                                );
                            }
                        });
                        this.ctx.globalAlpha = 1;
                    }
                }
            }
        }

        // Draw blinking platforms with fade effect
        if (level.blinkingPlatforms) {
            for (let platform of level.blinkingPlatforms) {
                // Use auto-tiling system for seamless blending
                const neighbors = this.getNeighborInfo(platform, allPlatforms);

                this.ctx.save();

                // Shadow (only when visible enough) - only on free edges
                if (platform.opacity > 0.3 && neighbors.hasFreeBottomRight) {
                    this.ctx.globalAlpha = platform.opacity * 0.25;
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                    this.ctx.fillRect(platform.x + 3, platform.y + 3, platform.width, platform.height);
                    this.ctx.globalAlpha = 1;
                }

                // Warning flash effect - PULSING GLOW around platform
                if (platform.isWarning) {
                    const pulseSize = 6;
                    const pulseAlpha = 0.4 + Math.sin(Date.now() * 0.02) * 0.3;

                    // Outer warning glow
                    this.ctx.globalAlpha = pulseAlpha * platform.opacity;
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.fillRect(
                        platform.x - pulseSize,
                        platform.y - pulseSize,
                        platform.width + pulseSize * 2,
                        platform.height + pulseSize * 2
                    );
                    this.ctx.globalAlpha = 1;
                }

                this.ctx.globalAlpha = platform.opacity;

                // Main platform - plain black, extended to seamlessly blend with neighbors
                this.ctx.fillStyle = '#1A1A1A';
                this.ctx.fillRect(neighbors.drawX, neighbors.drawY, neighbors.drawWidth, neighbors.drawHeight);

                this.ctx.restore();
            }
        }

        // Draw moving platforms
        if (level.movingPlatforms) {
            for (let platform of level.movingPlatforms) {
                // Use auto-tiling system for seamless blending
                const neighbors = this.getNeighborInfo(platform, allPlatforms);

                // Main platform - plain black, extended to seamlessly blend with neighbors
                this.ctx.fillStyle = '#1A1A1A';
                this.ctx.fillRect(neighbors.drawX, neighbors.drawY, neighbors.drawWidth, neighbors.drawHeight);

                // Single blinking yellow blocky arrow showing direction
                const time = this.sparkleTime || 0;
                const blinkOpacity = Math.sin(time * 1.5) * 0.5 + 0.5; // Slow oscillation between 0 and 1
                this.ctx.fillStyle = `rgba(255, 215, 0, ${blinkOpacity})`; // Gold/yellow with blinking

                const centerX = platform.x + platform.width / 2;
                const centerY = platform.y + platform.height / 2;

                if (platform.direction === 'horizontal') {
                    // Blocky horizontal arrow (pixel-art style)
                    const dir = platform.moveDirection > 0 ? 1 : -1;

                    // Arrow head (blocky triangle)
                    this.ctx.fillRect(centerX + 5 * dir, centerY - 2, 3, 5);   // Tip
                    this.ctx.fillRect(centerX + 2 * dir, centerY - 5, 3, 11);  // Middle section
                    // Arrow shaft (thin line)
                    this.ctx.fillRect(centerX - 4 * dir, centerY - 2, 6, 5);   // Shaft
                } else {
                    // Blocky vertical arrow (pixel-art style)
                    const dir = platform.moveDirection > 0 ? 1 : -1;

                    // Arrow head (blocky triangle)
                    this.ctx.fillRect(centerX - 2, centerY + 5 * dir, 5, 3);   // Tip
                    this.ctx.fillRect(centerX - 5, centerY + 2 * dir, 11, 3);  // Middle section
                    // Arrow shaft (thin line)
                    this.ctx.fillRect(centerX - 2, centerY - 4 * dir, 5, 6);   // Shaft
                }
            }
        }

        // Draw pressure platforms
        if (level.pressurePlatforms) {
            for (let platform of level.pressurePlatforms) {
                // Use auto-tiling system for seamless blending
                const neighbors = this.getNeighborInfo(platform, allPlatforms);

                // Shadow - only on free edges
                if (neighbors.hasFreeBottomRight) {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    this.ctx.fillRect(platform.x + 3, platform.y + 3, platform.width, platform.height);
                }

                // Base platform - plain black, extended to seamlessly blend with neighbors
                this.ctx.fillStyle = '#1A1A1A';
                this.ctx.fillRect(neighbors.drawX, neighbors.drawY, neighbors.drawWidth, neighbors.drawHeight);

                // Pressure plate - yellow, on top of platform (blocky pixel style)
                const plateHeight = 6;
                const inset = 8; // Inset from platform edges
                const plateWidth = platform.width - (inset * 2);
                const plateY = platform.y - plateHeight + platform.pressDepth;

                // Yellow pressure plate (blocky)
                const visiblePlateHeight = Math.max(0, plateHeight - platform.pressDepth);
                if (visiblePlateHeight > 0) {
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.fillRect(platform.x + inset, plateY, plateWidth, visiblePlateHeight);

                    // Blocky highlight (top edge only)
                    this.ctx.fillStyle = '#FFED4E';
                    this.ctx.fillRect(platform.x + inset, plateY, plateWidth, 2);
                }

                // Draw spikes AFTER platform - matching existing spike style
                if (platform.currentSpikeHeight > 0) {
                    const spikeWidth = 30; // Bigger spikes
                    const spikeSpacing = 40; // Fewer spikes
                    const numSpikes = Math.floor(platform.width / spikeSpacing);
                    const offsetX = (platform.width - (numSpikes * spikeSpacing)) / 2;

                    for (let i = 0; i < numSpikes; i++) {
                        const spikeX = platform.x + offsetX + i * spikeSpacing;
                        const spikeBaseY = platform.y;
                        const currentHeight = platform.currentSpikeHeight;

                        // Shadow
                        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                        this.ctx.beginPath();
                        this.ctx.moveTo(spikeX + 3, spikeBaseY + 3);
                        this.ctx.lineTo(spikeX + spikeWidth / 2 + 3, spikeBaseY - currentHeight + 3);
                        this.ctx.lineTo(spikeX + spikeWidth + 3, spikeBaseY + 3);
                        this.ctx.closePath();
                        this.ctx.fill();

                        // Spike - black pixel-art style (matching existing spikes)
                        this.ctx.fillStyle = '#000000';

                        // Basis (bottom part)
                        const baseHeight = Math.min(10, currentHeight);
                        this.ctx.fillRect(spikeX, spikeBaseY - baseHeight, spikeWidth, baseHeight);

                        // Mittlerer Teil - gestaffelt (stepped middle)
                        if (currentHeight > 10) {
                            const steps = 3;
                            const stepHeight = Math.min((currentHeight - 10) / steps, 10);
                            for (let j = 0; j < steps; j++) {
                                const stepWidth = spikeWidth - (j * 8);
                                const stepX = spikeX + (j * 4);
                                const stepY = spikeBaseY - baseHeight - (j + 1) * stepHeight;
                                if (stepY >= spikeBaseY - currentHeight && stepWidth > 0) {
                                    this.ctx.fillRect(stepX, stepY, stepWidth, stepHeight);
                                }
                            }
                        }

                        // Spitze (tip)
                        if (currentHeight > 35) {
                            const tipWidth = 8;
                            const tipHeight = 8;
                            const tipX = spikeX + (spikeWidth - tipWidth) / 2;
                            const tipY = spikeBaseY - currentHeight;
                            this.ctx.fillRect(tipX, tipY, tipWidth, tipHeight);
                        }
                    }
                }
            }
        }

        // Draw triggered spikes
        if (level.triggeredSpikes) {
            for (let spike of level.triggeredSpikes) {
                const visibleHeight = spike.getVisibleHeight();

                if (visibleHeight > 0) {
                    // Shadow
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    this.ctx.beginPath();
                    this.ctx.moveTo(spike.x + 3, spike.y + visibleHeight + 3);
                    this.ctx.lineTo(spike.x + spike.width / 2 + 3, spike.y + 3);
                    this.ctx.lineTo(spike.x + spike.width + 3, spike.y + visibleHeight + 3);
                    this.ctx.closePath();
                    this.ctx.fill();

                    // Spike color changes based on state
                    let spikeColor = '#000000';
                    if (spike.state === 'rising') {
                        spikeColor = '#8B0000'; // Dark red while rising
                    } else if (spike.state === 'active') {
                        spikeColor = '#DC143C'; // Bright red when active
                    } else if (spike.state === 'falling') {
                        spikeColor = '#8B0000'; // Dark red while falling
                    }

                    this.ctx.fillStyle = spikeColor;

                    // Base
                    const baseHeight = Math.min(10, visibleHeight);
                    this.ctx.fillRect(spike.x, spike.y + visibleHeight - baseHeight, spike.width, baseHeight);

                    // Middle part - stepped
                    if (visibleHeight > 10) {
                        const steps = 3;
                        const stepHeight = Math.min((visibleHeight - 10) / steps, spike.height / 4);
                        for (let i = 0; i < steps; i++) {
                            const stepWidth = spike.width - (i * 8);
                            const stepX = spike.x + (i * 4);
                            const stepY = spike.y + visibleHeight - baseHeight - (i + 1) * stepHeight;
                            if (stepY >= spike.y && stepWidth > 0) {
                                this.ctx.fillRect(stepX, stepY, stepWidth, stepHeight);
                            }
                        }

                        // Tip - sharper and more dangerous looking
                        const tipWidth = 8;
                        const tipY = spike.y;
                        if (visibleHeight >= spike.height * 0.8) {
                            this.ctx.fillRect(
                                spike.x + spike.width / 2 - tipWidth / 2,
                                tipY,
                                tipWidth,
                                stepHeight
                            );
                        }
                    }

                    // Warning glow when active
                    if (spike.isActive()) {
                        const pulse = 0.2 + Math.sin(Date.now() * 0.015) * 0.15;
                        this.ctx.fillStyle = `rgba(220, 20, 60, ${pulse})`;
                        this.ctx.fillRect(spike.x - 3, spike.y, spike.width + 6, visibleHeight);
                    }
                }
            }
        }

        // Draw spikes - blocky crystal style
        for (let spike of level.spikes) {
            // Initialize pixel collision array for this spike
            if (!spike.collisionPixels) {
                spike.collisionPixels = [];
            }
            spike.collisionPixels = []; // Reset each frame
            
            // Collect all platform types into one array for collision checking
            const allPlatforms = [
                ...level.platforms,
                ...(level.movingPlatforms || []),
                ...(level.gluePlatforms || []),
                ...(level.blinkingPlatforms || []).filter(p => p.visible !== false),
                ...(level.crumblingPlatforms || []),
                ...(level.pressurePlatforms || [])
            ];
            
            // Check which edges are touching something
            const touchThreshold = 5;
            
            // Check bottom edge
            const bottomTouching = spike.y + spike.height >= 695 || allPlatforms.some(p => 
                Math.abs((spike.y + spike.height) - p.y) <= touchThreshold && 
                spike.x + spike.width > p.x && 
                spike.x < p.x + p.width
            );
            
            // Check top edge
            const topTouching = spike.y <= 5 || allPlatforms.some(p => 
                Math.abs(spike.y - (p.y + p.height)) <= touchThreshold && 
                spike.x + spike.width > p.x && 
                spike.x < p.x + p.width
            );
            
            // Check left edge
            const leftTouching = spike.x <= 5 || allPlatforms.some(p => 
                Math.abs(spike.x - (p.x + p.width)) <= touchThreshold && 
                spike.y + spike.height > p.y && 
                spike.y < p.y + p.height
            );
            
            // Check right edge
            const rightTouching = spike.x + spike.width >= 1195 || allPlatforms.some(p => 
                Math.abs((spike.x + spike.width) - p.x) <= touchThreshold && 
                spike.y + spike.height > p.y && 
                spike.y < p.y + p.height
            );
            
            // Find the nearest platform below the spike for connector
            let attachedPlatform = null;
            let attachDistance = Infinity;
            
            if (bottomTouching) {
                for (let p of allPlatforms) {
                    if (spike.y < p.y && 
                        spike.x + spike.width > p.x && 
                        spike.x < p.x + p.width) {
                        const dist = p.y - (spike.y + spike.height);
                        if (dist >= 0 && dist < attachDistance && dist < 100) {
                            attachedPlatform = p;
                            attachDistance = dist;
                        }
                    }
                }
                
                // Check if on floor
                const floorY = 700;
                const floorDist = floorY - (spike.y + spike.height);
                if (floorDist >= 0 && floorDist < attachDistance && floorDist < 100) {
                    attachedPlatform = { y: floorY, x: 0, width: 1200 };
                    attachDistance = floorDist;
                }
            }
            
            // Use the full spike dimensions
            const spikeWidth = spike.width;
            const spikeHeight = spike.height;
            const pixelSize = 4; // Fixed pixel size
            
            // Helper function to draw and track collision pixels
            const drawPixel = (x, y, w, h, color, isCollision = true) => {
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x, y, w, h);
                if (isCollision) {
                    spike.collisionPixels.push({ x, y, width: w, height: h });
                }
            };
            
            // Shadow - offset for 3D effect
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            for (let sy = 0; sy < spikeHeight; sy += pixelSize) {
                for (let sx = 0; sx < spikeWidth; sx += pixelSize) {
                    this.ctx.fillRect(spike.x + sx + 4, spike.y + sy + 4, pixelSize, pixelSize);
                }
            }
            
            // Create metallic base body
            for (let sy = 0; sy < spikeHeight; sy += pixelSize) {
                for (let sx = 0; sx < spikeWidth; sx += pixelSize) {
                    const x = spike.x + sx;
                    const y = spike.y + sy;
                    
                    // Grid position
                    const gridX = sx / pixelSize;
                    const gridY = sy / pixelSize;
                    const totalGridWidth = spikeWidth / pixelSize;
                    const totalGridHeight = spikeHeight / pixelSize;
                    
                    // Create metallic gradient - darker at bottom, lighter at top
                    const verticalPos = gridY / totalGridHeight;
                    const horizontalPos = gridX / totalGridWidth;
                    
                    let color;
                    
                    // Dark gunmetal body with metallic sheen
                    if (verticalPos < 0.3) {
                        // Top highlight - metallic shine
                        if (horizontalPos > 0.3 && horizontalPos < 0.7) {
                            color = '#6A7B8C'; // Light steel
                        } else {
                            color = '#4A5B6C'; // Medium steel
                        }
                    } else if (verticalPos < 0.7) {
                        // Middle - darker metal
                        color = gridX % 2 === gridY % 2 ? '#3A4B5C' : '#2A3B4C';
                    } else {
                        // Bottom - darkest
                        color = '#1A2B3C';
                    }
                    
                    // Add metallic edge highlights
                    if (gridX === 0 || gridY === 0) {
                        color = '#7A8B9C'; // Bright edge
                    }
                    if (gridX === totalGridWidth - 1 || gridY === totalGridHeight - 1) {
                        color = '#0A1B2C'; // Dark edge
                    }
                    
                    drawPixel(x, y, pixelSize, pixelSize, color, true);
                }
            }
            
            // Add sharp metallic spikes protruding from free edges
            // Top spikes
            if (!topTouching) {
                const numSpikes = Math.floor(spikeWidth / (pixelSize * 3));
                for (let i = 0; i < numSpikes; i++) {
                    const spikeX = spike.x + pixelSize + i * pixelSize * 3;
                    
                    // Spike tip (darkest)
                    drawPixel(spikeX + pixelSize, spike.y - pixelSize * 2, pixelSize, pixelSize, '#1A2B3C', true);
                    
                    // Spike upper
                    drawPixel(spikeX, spike.y - pixelSize, pixelSize, pixelSize, '#2A3B4C', true);
                    drawPixel(spikeX + pixelSize, spike.y - pixelSize, pixelSize, pixelSize, '#3A4B5C', true);
                    drawPixel(spikeX + pixelSize * 2, spike.y - pixelSize, pixelSize, pixelSize, '#2A3B4C', true);
                    
                    // Spike base highlight
                    drawPixel(spikeX + pixelSize, spike.y, pixelSize, pixelSize, '#6A7B8C', true);
                }
            }
            
            // Bottom spikes
            if (!bottomTouching) {
                const numSpikes = Math.floor(spikeWidth / (pixelSize * 3));
                for (let i = 0; i < numSpikes; i++) {
                    const spikeX = spike.x + pixelSize * 1.5 + i * pixelSize * 3;
                    const baseY = spike.y + spikeHeight - pixelSize;
                    
                    // Spike tip (darkest)
                    drawPixel(spikeX + pixelSize, baseY + pixelSize * 2, pixelSize, pixelSize, '#1A2B3C', true);
                    
                    // Spike middle
                    drawPixel(spikeX, baseY + pixelSize, pixelSize, pixelSize, '#2A3B4C', true);
                    drawPixel(spikeX + pixelSize, baseY + pixelSize, pixelSize, pixelSize, '#3A4B5C', true);
                    drawPixel(spikeX + pixelSize * 2, baseY + pixelSize, pixelSize, pixelSize, '#2A3B4C', true);
                    
                    // Spike base shadow
                    drawPixel(spikeX + pixelSize, baseY, pixelSize, pixelSize, '#0A1B2C', true);
                }
            }
            
            // Left spikes
            if (!leftTouching) {
                const numSpikes = Math.floor(spikeHeight / (pixelSize * 3));
                for (let i = 0; i < numSpikes; i++) {
                    const spikeY = spike.y + pixelSize + i * pixelSize * 3;
                    
                    // Spike tip
                    drawPixel(spike.x - pixelSize * 2, spikeY + pixelSize, pixelSize, pixelSize, '#1A2B3C', true);
                    
                    // Spike middle
                    drawPixel(spike.x - pixelSize, spikeY, pixelSize, pixelSize, '#2A3B4C', true);
                    drawPixel(spike.x - pixelSize, spikeY + pixelSize, pixelSize, pixelSize, '#3A4B5C', true);
                    drawPixel(spike.x - pixelSize, spikeY + pixelSize * 2, pixelSize, pixelSize, '#2A3B4C', true);
                    
                    // Spike base highlight
                    drawPixel(spike.x, spikeY + pixelSize, pixelSize, pixelSize, '#6A7B8C', true);
                }
            }
            
            // Right spikes
            if (!rightTouching) {
                const numSpikes = Math.floor(spikeHeight / (pixelSize * 3));
                for (let i = 0; i < numSpikes; i++) {
                    const spikeY = spike.y + pixelSize * 1.5 + i * pixelSize * 3;
                    const baseX = spike.x + spikeWidth - pixelSize;
                    
                    // Spike tip
                    drawPixel(baseX + pixelSize * 2, spikeY + pixelSize, pixelSize, pixelSize, '#1A2B3C', true);
                    
                    // Spike middle
                    drawPixel(baseX + pixelSize, spikeY, pixelSize, pixelSize, '#2A3B4C', true);
                    drawPixel(baseX + pixelSize, spikeY + pixelSize, pixelSize, pixelSize, '#3A4B5C', true);
                    drawPixel(baseX + pixelSize, spikeY + pixelSize * 2, pixelSize, pixelSize, '#2A3B4C', true);
                    
                    // Spike base shadow
                    drawPixel(baseX, spikeY + pixelSize, pixelSize, pixelSize, '#0A1B2C', true);
                }
            }
            
            // If attached to something below, draw connector WITH collision
            if (attachedPlatform && attachDistance > 0) {
                const connectorWidth = spikeWidth * 0.5;
                const connectorX = spike.x + (spikeWidth - connectorWidth) / 2;
                const connectorHeight = attachDistance;
                
                // Dark gradient connector with collision pixels
                for (let i = 0; i < connectorHeight; i += 4) {
                    const progress = i / connectorHeight;
                    const darkness = Math.floor(60 + progress * 40);
                    const color = `rgb(${darkness}, ${Math.floor(darkness * 0.3)}, ${Math.floor(darkness * 0.5)})`;
                    drawPixel(connectorX, spike.y + spike.height + i, connectorWidth, 4, color, true);
                }
            }
        }
        
        // Draw moving spikes - polished and dangerous
        if (level.movingSpikes) {
            for (let spike of level.movingSpikes) {
                const centerX = spike.x + spike.width / 2;
                const centerY = spike.y + spike.width / 2;
                const radius = spike.width / 2;
                const time = this.sparkleTime || 0;
                
                // Shadow with motion blur
                this.ctx.save();
                this.ctx.globalAlpha = 0.25;
                this.ctx.fillStyle = '#000000';
                // Elongated shadow based on direction
                const shadowOffsetX = spike.direction > 0 ? 5 : 3;
                const shadowOffsetY = 3;
                this.ctx.beginPath();
                this.ctx.arc(centerX + shadowOffsetX, centerY + shadowOffsetY, radius * 0.8, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
                
                // Core ball - dark metallic red with gradient
                const pixelSize = 5;
                const gridSize = Math.floor(radius * 1.3 / pixelSize);
                
                for (let py = -gridSize; py <= gridSize; py++) {
                    for (let px = -gridSize; px <= gridSize; px++) {
                        const dist = Math.sqrt(px * px + py * py);
                        if (dist <= gridSize * 0.75) {
                            const x = centerX + px * pixelSize - pixelSize/2;
                            const y = centerY + py * pixelSize - pixelSize/2;
                            
                            // Gradient from center (lighter) to edge (darker)
                            const distRatio = dist / (gridSize * 0.75);
                            let color;
                            if (distRatio < 0.3) {
                                color = '#E74C3C'; // Bright red center
                            } else if (distRatio < 0.6) {
                                color = '#C0392B'; // Medium red
                            } else {
                                color = '#922B21'; // Dark red edge
                            }
                            
                            this.ctx.fillStyle = color;
                            this.ctx.fillRect(x, y, pixelSize, pixelSize);
                            
                            // Highlight pixels in center for shine
                            if (dist < gridSize * 0.2 && px > 0 && py < 0) {
                                this.ctx.fillStyle = '#FF6B6B';
                                this.ctx.fillRect(x + 1, y + 1, 3, 3);
                            }
                        }
                    }
                }
                
                // Spikes - chunky, dangerous-looking pixel spikes
                const spikeCount = 8;
                const rotation = time * 1.5; // Slow rotation
                
                for (let i = 0; i < spikeCount; i++) {
                    const angle = rotation + (i / spikeCount) * Math.PI * 2;
                    
                    this.ctx.save();
                    this.ctx.translate(centerX, centerY);
                    this.ctx.rotate(angle);
                    
                    // Stepped spike design - gets narrower toward tip
                    const spikeLength = radius * 0.9;
                    const baseWidth = 10;
                    
                    // Base of spike (widest)
                    this.ctx.fillStyle = '#7B241C';
                    this.ctx.fillRect(radius * 0.4, -baseWidth/2, spikeLength * 0.3, baseWidth);
                    
                    // Middle section (narrower)
                    this.ctx.fillStyle = '#641E16';
                    this.ctx.fillRect(radius * 0.4 + spikeLength * 0.3, -baseWidth/2 + 2, spikeLength * 0.3, baseWidth - 4);
                    
                    // Tip section (narrowest)
                    this.ctx.fillStyle = '#4A1410';
                    this.ctx.fillRect(radius * 0.4 + spikeLength * 0.6, -baseWidth/2 + 3, spikeLength * 0.3, baseWidth - 6);
                    
                    // Sharp point at the end
                    this.ctx.fillStyle = '#2C0A08';
                    this.ctx.fillRect(radius * 0.4 + spikeLength * 0.85, -2, spikeLength * 0.15, 4);
                    
                    this.ctx.restore();
                }
                
                // Danger indicator - subtle pulsing glow
                const pulseAlpha = 0.15 + Math.sin(time * 3) * 0.1;
                this.ctx.globalAlpha = pulseAlpha;
                this.ctx.fillStyle = '#FF4444';
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
                
                // Motion trail particles
                if (Math.abs(spike.direction) > 0) {
                    for (let t = 1; t <= 3; t++) {
                        const trailX = centerX - spike.direction * t * 8;
                        const trailAlpha = 0.3 - t * 0.08;
                        
                        this.ctx.globalAlpha = trailAlpha;
                        this.ctx.fillStyle = '#922B21';
                        
                        // Small pixel trail
                        for (let py = -1; py <= 1; py++) {
                            for (let px = -1; px <= 1; px++) {
                                if (Math.abs(px) + Math.abs(py) < 2) {
                                    this.ctx.fillRect(
                                        trailX + px * pixelSize,
                                        centerY + py * pixelSize,
                                        pixelSize,
                                        pixelSize
                                    );
                                }
                            }
                        }
                    }
                    this.ctx.globalAlpha = 1;
                }
            }
        }

        // Draw turrets
        if (level.turrets) {
            for (let turret of level.turrets) {
                const centerX = turret.x + turret.width / 2;
                const centerY = turret.y + turret.height / 2;

                // Schatten
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                this.ctx.fillRect(turret.x + 3, turret.y + 3, turret.width, turret.height);

                // Base platform - dark metallic
                const baseGradient = this.ctx.createLinearGradient(turret.x, turret.y, turret.x, turret.y + turret.height);
                baseGradient.addColorStop(0, '#4A4A4A');
                baseGradient.addColorStop(0.5, '#2C2C2C');
                baseGradient.addColorStop(1, '#1A1A1A');
                this.ctx.fillStyle = baseGradient;
                this.ctx.fillRect(turret.x, turret.y, turret.width, turret.height);

                // Metallic highlights
                this.ctx.fillStyle = 'rgba(120, 120, 120, 0.6)';
                this.ctx.fillRect(turret.x + 3, turret.y + 3, turret.width - 6, 3);

                // Charging danger zone visualization
                if (turret.isCharging) {
                    const pulseSize = 35 + turret.chargeProgress * 15;
                    const pulseAlpha = 0.2 + turret.chargeProgress * 0.3;
                    const pulseIntensity = 0.3 + Math.sin(Date.now() * 0.02) * 0.2;

                    // Outer danger glow
                    this.ctx.fillStyle = `rgba(255, 50, 50, ${pulseAlpha * pulseIntensity})`;
                    this.ctx.fillRect(centerX - pulseSize/2, centerY - pulseSize/2, pulseSize, pulseSize);

                    // Inner intense glow
                    const innerSize = 25 * turret.chargeProgress;
                    this.ctx.fillStyle = `rgba(255, 100, 100, ${0.4 + turret.chargeProgress * 0.4})`;
                    this.ctx.fillRect(centerX - innerSize/2, centerY - innerSize/2, innerSize, innerSize);

                    // Charging particles
                    for (let i = 0; i < 4; i++) {
                        const angle = (i / 4) * Math.PI * 2 + Date.now() * 0.01;
                        const dist = 20 + turret.chargeProgress * 10;
                        const px = centerX + Math.cos(angle) * dist;
                        const py = centerY + Math.sin(angle) * dist;
                        
                        this.ctx.fillStyle = `rgba(255, 80, 80, ${turret.chargeProgress})`;
                        this.ctx.fillRect(px - 3, py - 3, 6, 6);
                    }
                }

                // Barrel/cannon
                this.ctx.save();
                this.ctx.translate(centerX, centerY);

                let barrelRotation = 0;
                switch(turret.shootDirection) {
                    case 'left':
                        barrelRotation = Math.PI;
                        break;
                    case 'right':
                        barrelRotation = 0;
                        break;
                    case 'up':
                        barrelRotation = -Math.PI / 2;
                        break;
                    case 'down':
                        barrelRotation = Math.PI / 2;
                        break;
                }
                this.ctx.rotate(barrelRotation);

                // Barrel shadow
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.fillRect(8, -4, 18, 10);

                // Barrel body - metallic red
                const barrelGradient = this.ctx.createLinearGradient(0, -5, 0, 5);
                barrelGradient.addColorStop(0, '#E74C3C');
                barrelGradient.addColorStop(0.5, '#C0392B');
                barrelGradient.addColorStop(1, '#A93226');
                this.ctx.fillStyle = barrelGradient;
                this.ctx.fillRect(8, -5, 18, 10);

                // Barrel highlight
                this.ctx.fillStyle = 'rgba(255, 120, 120, 0.5)';
                this.ctx.fillRect(10, -4, 14, 3);

                // Barrel tip (darker)
                this.ctx.fillStyle = '#7B241C';
                this.ctx.fillRect(24, -4, 4, 8);

                // Muzzle flash when firing
                if (turret.isCharging && turret.chargeProgress > 0.9) {
                    this.ctx.fillStyle = `rgba(255, 200, 100, ${Math.random() * 0.8})`;
                    this.ctx.fillRect(26, -3, 8, 6);
                }

                this.ctx.restore();

                // Core/Eye - animated when charging
                const coreSize = 10 + (turret.isCharging ? turret.chargeProgress * 6 : 0);
                const corePulse = turret.isCharging ? 1 + Math.sin(Date.now() * 0.03) * 0.3 : 1;
                
                // Core shadow
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                this.ctx.fillRect(centerX - coreSize/2 + 1, centerY - coreSize/2 + 1, coreSize * corePulse, coreSize * corePulse);

                // Core glow
                if (turret.isCharging) {
                    this.ctx.fillStyle = '#FF6B6B';
                    this.ctx.fillRect(
                        centerX - coreSize/2 - 2, 
                        centerY - coreSize/2 - 2, 
                        (coreSize + 4) * corePulse, 
                        (coreSize + 4) * corePulse
                    );
                }

                // Core main color
                this.ctx.fillStyle = turret.isCharging ? '#FF3333' : '#E74C3C';
                this.ctx.fillRect(centerX - coreSize/2, centerY - coreSize/2, coreSize * corePulse, coreSize * corePulse);

                // Core highlight
                this.ctx.fillStyle = turret.isCharging ? '#FFAAAA' : 'rgba(255, 150, 150, 0.7)';
                this.ctx.fillRect(centerX - coreSize/2 + 2, centerY - coreSize/2 + 2, coreSize * 0.4, coreSize * 0.4);

                // Base border
                this.ctx.strokeStyle = '#1A1A1A';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(turret.x, turret.y, turret.width, turret.height);

                // Tech details on corners
                this.ctx.fillStyle = '#666666';
                this.ctx.fillRect(turret.x + 2, turret.y + 2, 4, 4);
                this.ctx.fillRect(turret.x + turret.width - 6, turret.y + 2, 4, 4);
                this.ctx.fillRect(turret.x + 2, turret.y + turret.height - 6, 4, 4);
                this.ctx.fillRect(turret.x + turret.width - 6, turret.y + turret.height - 6, 4, 4);
            }
        }
    }

    drawBlackHole(hole) {
        const centerX = hole.x + hole.width / 2;
        const centerY = hole.y + hole.height / 2;
        
        this.sparkleTime = this.sparkleTime || 0;
        
        // Shadow - offset down and right for depth
        const shadowOffset = 4;
        const shadowRadius = 45;
        const shadowPixelSize = 4;
        const shadowGridSize = Math.ceil(shadowRadius / shadowPixelSize);
        
        for (let py = -shadowGridSize; py <= shadowGridSize; py++) {
            for (let px = -shadowGridSize; px <= shadowGridSize; px++) {
                const dist = Math.sqrt(px * px + py * py);
                if (dist <= shadowGridSize) {
                    const alpha = 0.3 * (1 - dist / shadowGridSize);
                    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
                    this.ctx.fillRect(
                        centerX + px * shadowPixelSize - shadowPixelSize/2 + shadowOffset,
                        centerY + py * shadowPixelSize - shadowPixelSize/2 + shadowOffset,
                        shadowPixelSize,
                        shadowPixelSize
                    );
                }
            }
        }
        
        // Orbiting pixel blocks - multiple layers like the goal
        const layers = 5;
        for (let layer = 0; layer < layers; layer++) {
            const pixelCount = 12 - layer;
            const radius = 75 - layer * 12;
            const rotation = -this.sparkleTime * (0.4 + layer * 0.15);
            
            for (let i = 0; i < pixelCount; i++) {
                const angle = rotation + (i / pixelCount) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                const size = 6 - layer * 0.8;
                
                // Darker particles getting pulled in
                const alpha = 0.6 - layer * 0.08;
                const brightness = Math.floor(90 - layer * 12);
                
                this.ctx.fillStyle = `rgba(${brightness}, ${brightness - 10}, ${brightness + 15}, ${alpha})`;
                this.ctx.fillRect(Math.floor(x - size/2), Math.floor(y - size/2), size, size);
            }
        }
        
        // Event horizon ring - blocky circle using pixel grid
        const horizonRadius = 42;
        const horizonPulse = Math.sin(this.sparkleTime * 1.5) * 0.1 + 1;
        const pixelSize = 4;
        const gridSize = Math.ceil(horizonRadius / pixelSize);
        
        for (let py = -gridSize; py <= gridSize; py++) {
            for (let px = -gridSize; px <= gridSize; px++) {
                const dist = Math.sqrt(px * px + py * py) * pixelSize;
                // Only draw pixels in a ring (between two radii)
                if (dist >= horizonRadius - 4 && dist <= horizonRadius + 4) {
                    const alpha = 0.5 * horizonPulse;
                    this.ctx.fillStyle = `rgba(120, 100, 140, ${alpha})`;
                    this.ctx.fillRect(
                        centerX + px * pixelSize - pixelSize/2,
                        centerY + py * pixelSize - pixelSize/2,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }
        
        // Void core - blocky pixel grid like the goal
        const coreSize = 28;
        const corePixelSize = 4;
        const coreGridSize = Math.ceil(coreSize / corePixelSize);
        
        for (let py = -coreGridSize; py <= coreGridSize; py++) {
            for (let px = -coreGridSize; px <= coreGridSize; px++) {
                const dist = Math.sqrt(px * px + py * py);
                if (dist <= coreGridSize) {
                    // Pure black core, very slight purple tint at the very edge
                    let r = 0, g = 0, b = 0;
                    
                    if (dist > coreGridSize - 1) {
                        r = 15;
                        g = 10;
                        b = 20;
                    }
                    
                    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    this.ctx.fillRect(
                        centerX + px * corePixelSize - corePixelSize/2,
                        centerY + py * corePixelSize - corePixelSize/2,
                        corePixelSize,
                        corePixelSize
                    );
                }
            }
        }
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
        
        // Shadow - offset for 3D effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        const shadowPixels = [
            [0, 1], [1, 1], [2, 1],
            [-1, 0], [0, 0], [1, 0], [2, 0], [3, 0],
            [0, -1], [1, -1], [2, -1]
        ];
        shadowPixels.forEach(([px, py]) => {
            this.ctx.fillRect(centerX + px * 4 + 4, centerY + py * 4 + 4, 4, 4);
        });
        
        // Crystal core - dark red/purple base
        const corePixels = [
            [0, 0], [1, 0],
            [0, -1], [1, -1]
        ];
        
        this.ctx.fillStyle = '#6B1E3C';
        corePixels.forEach(([px, py]) => {
            this.ctx.fillRect(centerX + px * 4, centerY + py * 4, 4, 4);
        });
        
        // Highlight on core
        this.ctx.fillStyle = '#A13D63';
        this.ctx.fillRect(centerX, centerY - 4, 4, 4);
        
        // Crystal spikes - 4 main directions (up, down, left, right)
        const spikeData = [
            // Up spike
            { pixels: [[0, -2], [1, -2], [0, -3], [1, -3], [0, -4]], colors: ['#DC143C', '#DC143C', '#C41230', '#C41230', '#A01028'] },
            // Down spike
            { pixels: [[0, 1], [1, 1], [0, 2], [1, 2], [0, 3]], colors: ['#DC143C', '#DC143C', '#C41230', '#C41230', '#A01028'] },
            // Left spike
            { pixels: [[-1, 0], [-1, -1], [-2, 0], [-2, -1], [-3, 0]], colors: ['#DC143C', '#DC143C', '#C41230', '#C41230', '#A01028'] },
            // Right spike
            { pixels: [[2, 0], [2, -1], [3, 0], [3, -1], [4, 0]], colors: ['#DC143C', '#DC143C', '#C41230', '#C41230', '#A01028'] }
        ];
        
        spikeData.forEach(spike => {
            spike.pixels.forEach(([px, py], index) => {
                this.ctx.fillStyle = spike.colors[index];
                this.ctx.fillRect(centerX + px * 4, centerY + py * 4, 4, 4);
            });
        });
        
        // Diagonal accent crystals - smaller sharp points
        const accentPixels = [
            { pos: [-1, -2], color: '#E74C3C' },
            { pos: [2, -2], color: '#E74C3C' },
            { pos: [-1, 1], color: '#E74C3C' },
            { pos: [2, 1], color: '#E74C3C' }
        ];
        
        accentPixels.forEach(({ pos: [px, py], color }) => {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(centerX + px * 4, centerY + py * 4, 4, 4);
        });
        
        // Crystal shine/highlights - small bright pixels on the sharp points
        this.ctx.fillStyle = '#FF6B8A';
        this.ctx.fillRect(centerX, centerY - 16, 4, 4); // Top spike tip
        this.ctx.fillRect(centerX + 16, centerY, 4, 4); // Right spike tip
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
