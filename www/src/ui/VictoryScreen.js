export class VictoryScreen {
    constructor() {
        this.element = document.getElementById('victory-screen');
        this.finalTimeElement = document.getElementById('final-time');
        this.starCanvases = document.querySelectorAll('.pixel-star');
        this.continueText = document.querySelector('.continue-text');
        this.menuText = document.querySelector('.menu-text');
        this.nextButton = document.getElementById('victory-next-button');
        this.collectibleCanvas = document.getElementById('collectible-icon');
        this.particleInterval = null;
        this.activeStars = 0;
        this.collectedCollectible = false;
        this.setupTouchSupport();
        this.setupButtonHandler();
    }

    setupButtonHandler() {
        // Button click handler for mobile
        this.nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Simulate space key press for continue
            const spaceEvent = new KeyboardEvent('keydown', { code: 'Space' });
            window.dispatchEvent(spaceEvent);
        });
    }

    setupTouchSupport() {
        // Detect mobile to show/hide appropriate UI elements
        const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.Capacitor !== undefined;

        if (isMobile) {
            // Hide keyboard hints on mobile
            this.continueText.style.display = 'none';
            this.menuText.style.display = 'none';
        } else {
            // Hide button on desktop
            this.nextButton.style.display = 'none';
        }
    }

    show(time, stars, hasNextLevel = true, world = 1, collectedCollectible = false) {
        this.collectedCollectible = collectedCollectible;
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 100);

        this.finalTimeElement.textContent =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;

        // Text anpassen je nachdem ob es ein nächstes Level gibt
        const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.Capacitor !== undefined;

        if (hasNextLevel) {
            this.continueText.textContent = isMobile ? 'TAP FOR NEXT LEVEL' : 'PRESS SPACE FOR NEXT LEVEL';
            this.nextButton.textContent = 'NEXT LEVEL';
            this.nextButton.classList.remove('hidden');
        } else {
            this.continueText.textContent = 'ALL LEVELS COMPLETE!';
            this.nextButton.textContent = 'BACK TO MENU';
        }
        this.menuText.textContent = isMobile ? 'TAP HOME BUTTON FOR MENU' : 'PRESS ESC FOR MENU';
        
        this.element.classList.add('show');
        this.activeStars = stars;
        this.currentWorld = world;
        
        // Update world styling
        if (world === 3) {
            this.element.classList.add('world-3');
            this.element.classList.remove('world-1', 'world-2');
        } else if (world === 2) {
            this.element.classList.add('world-2');
            this.element.classList.remove('world-1', 'world-3');
        } else {
            this.element.classList.add('world-1');
            this.element.classList.remove('world-2', 'world-3');
        }
        
        // Alle Sterne zurücksetzen
        this.starCanvases.forEach(canvas => {
            canvas.classList.remove('appear', 'floating');
            canvas.style.opacity = '0';
        });
        
        // Sterne nacheinander mit Animation zeichnen
        this.starCanvases.forEach((canvas, index) => {
            setTimeout(() => {
                const isFilled = index < stars;
                this.drawPixelStar(canvas, isFilled);
                canvas.classList.add('appear');
                
                // Nach Erscheinen: Floating Animation und Opacity fixieren
                setTimeout(() => {
                    canvas.classList.add('floating');
                    canvas.style.opacity = '1';
                }, 600);
            }, 400 + index * 300);
        });

        // Reset and draw collectible (always show, filled or empty)
        this.collectibleCanvas.classList.remove('appear', 'floating');
        this.collectibleCanvas.style.opacity = '0';

        // Draw and animate collectible (after all stars)
        setTimeout(() => {
            this.drawCollectible(world, this.collectedCollectible);
            this.collectibleCanvas.classList.add('appear');

            setTimeout(() => {
                this.collectibleCanvas.classList.add('floating');
                this.collectibleCanvas.style.opacity = '1';
            }, 600);
        }, 400 + 3 * 300); // After the 3 stars

        this.startParticleAnimation();
    }

    hide() {
        this.element.classList.remove('show');
        this.stopParticleAnimation();

        // Sterne zurücksetzen
        this.starCanvases.forEach(canvas => {
            canvas.classList.remove('appear', 'floating');
            canvas.style.opacity = '0';
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, 80, 80);
        });

        // Reset collectible
        this.collectibleCanvas.classList.remove('appear', 'floating');
        this.collectibleCanvas.style.opacity = '0';
        const collectCtx = this.collectibleCanvas.getContext('2d');
        collectCtx.clearRect(0, 0, 100, 100);
    }

    drawPixelStar(canvas, filled) {
        const ctx = canvas.getContext('2d');
        const size = 100;
        ctx.imageSmoothingEnabled = false;
        
        ctx.clearRect(0, 0, size, size);
        
        // Perfektes Pixel-Herz (17x15) - Clean & Symmetrisch
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
        
        const pixelSize = 5.5;  // Kleiner für besseren Fit
        const offsetX = 6;      // Mehr links
        const offsetY = 10;     // Zentriert vertikal
        
        if (filled) {
            // Farben je nach Welt
            const colors = this.currentWorld === 3 
                ? {
                    shadow: '#B8860B',      // Dark Goldenrod (Schatten)
                    main: '#FFD700',        // Gold (Hauptfarbe)
                    highlight: '#FFF59D',   // Light Yellow (Highlight)
                    gloss: '#FFFFE0'        // Light Yellow (Glanz)
                  }
                : this.currentWorld === 2 
                ? {
                    shadow: '#1E3A5F',      // Dunkles Blau (Schatten)
                    main: '#4682B4',        // Steel Blue (Hauptfarbe)
                    highlight: '#87CEEB',   // Sky Blue (Highlight)
                    gloss: '#B0E0E6'        // Powder Blue (Glanz)
                  }
                : {
                    shadow: '#B8336B',      // Dunkles Pink (Schatten)
                    main: '#FF1493',        // Deep Pink (Hauptfarbe)
                    highlight: '#FF69B4',   // Hot Pink (Highlight)
                    gloss: '#FFB3D9'        // Light Pink (Glanz)
                  };
            
            heartPattern.forEach((row, y) => {
                row.forEach((pixel, x) => {
                    if (pixel === 1) {
                        // 1. Schatten zuerst (dunkel, offset nach rechts-unten)
                        ctx.fillStyle = colors.shadow;
                        ctx.fillRect(offsetX + x * pixelSize + 2, offsetY + y * pixelSize + 2, pixelSize, pixelSize);
                        
                        // 2. Hauptfarbe
                        ctx.fillStyle = colors.main;
                        ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);
                        
                        // 3. Highlight nur oben links
                        if (y < 3 && x < 14) {
                            ctx.fillStyle = colors.highlight;
                            ctx.fillRect(offsetX + x * pixelSize + 1, offsetY + y * pixelSize + 1, pixelSize - 2, pixelSize - 2);
                        }
                        // 4. Extra Glanz-Punkt (nur ganz oben)
                        else if (y < 5 && x > 5 && x < 11) {
                            ctx.fillStyle = colors.gloss;
                            ctx.fillRect(offsetX + x * pixelSize + 1.5, offsetY + y * pixelSize + 1.5, pixelSize - 3, pixelSize - 3);
                        }
                    }
                });
            });
        } else {
            // Graues Herz - Outline Style
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
                            ctx.fillRect(offsetX + x * pixelSize + 2, offsetY + y * pixelSize + 2, pixelSize, pixelSize);
                            
                            ctx.fillStyle = '#333333';
                            ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);
                            
                            ctx.fillStyle = '#666666';
                            ctx.fillRect(offsetX + x * pixelSize + 1, offsetY + y * pixelSize + 1, pixelSize - 2, pixelSize - 2);
                        }
                    }
                });
            });
        }
    }

    addSparkles(ctx, size, offsetX, offsetY) {
        const sparkleCount = 8;
        ctx.fillStyle = '#ffffff';
        
        for (let i = 0; i < sparkleCount; i++) {
            const x = offsetX + 10 + Math.random() * 60;
            const y = offsetY + 10 + Math.random() * 60;
            const sparkleSize = Math.random() > 0.5 ? 3 : 2;
            
            ctx.fillRect(x - sparkleSize, y, sparkleSize * 2 + 1, 1);
            ctx.fillRect(x, y - sparkleSize, 1, sparkleSize * 2 + 1);
        }
    }

    startParticleAnimation() {
        this.stopParticleAnimation();
        
        this.particleInterval = setInterval(() => {
            this.starCanvases.forEach((starCanvas, index) => {
                if (index < this.activeStars && starCanvas.classList.contains('floating') && Math.random() > 0.85) {
                    const ctx = starCanvas.getContext('2d');
                    const offsetX = 10;
                    const offsetY = 10;
                    const x = offsetX + 20 + Math.random() * 40;
                    const y = offsetY + 20 + Math.random() * 40;
                    
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(x - 2, y, 5, 1);
                    ctx.fillRect(x, y - 2, 1, 5);
                    
                    setTimeout(() => {
                        this.drawPixelStar(starCanvas, true);
                    }, 200);
                }
            });
        }, 100);
    }

    stopParticleAnimation() {
        if (this.particleInterval) {
            clearInterval(this.particleInterval);
            this.particleInterval = null;
        }
    }

    drawCollectible(world, filled) {
        const ctx = this.collectibleCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, 100, 100);

        // Get world color
        let color;
        if (world === 3) {
            color = '#FFD700'; // Gold
        } else if (world === 2) {
            color = '#87CEEB'; // Sky blue
        } else {
            color = '#FF69B4'; // Hot pink
        }

        // Draw simple blocky circle (octagon)
        const centerX = 50;
        const centerY = 50;
        const radius = 28;
        const sides = 8;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (Math.PI * 2 / sides) * i;
            const x = centerX + Math.cos(angle) * radius + 3;
            const y = centerY + Math.sin(angle) * radius + 3;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        if (filled) {
            // Filled collectible (collected)
            // Main shape
            ctx.fillStyle = color;
            ctx.beginPath();
            for (let i = 0; i <= sides; i++) {
                const angle = (Math.PI * 2 / sides) * i;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            for (let i = 0; i <= sides; i++) {
                const angle = (Math.PI * 2 / sides) * i;
                const x = centerX - 6 + Math.cos(angle) * 12;
                const y = centerY - 6 + Math.sin(angle) * 12;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            // Center sparkle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(centerX - 4, centerY - 4, 8, 8);
        } else {
            // Empty collectible (not collected) - just outline
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            for (let i = 0; i <= sides; i++) {
                const angle = (Math.PI * 2 / sides) * i;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();

            // Inner outline for depth
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            for (let i = 0; i <= sides; i++) {
                const angle = (Math.PI * 2 / sides) * i;
                const x = centerX + Math.cos(angle) * (radius - 8);
                const y = centerY + Math.sin(angle) * (radius - 8);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }
}
