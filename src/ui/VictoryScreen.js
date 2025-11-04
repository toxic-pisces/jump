export class VictoryScreen {
    constructor() {
        this.element = document.getElementById('victory-screen');
        this.finalTimeElement = document.getElementById('final-time');
        this.starCanvases = document.querySelectorAll('.pixel-star');
        this.continueText = document.querySelector('.continue-text');
        this.menuText = document.querySelector('.menu-text');
        this.particleInterval = null;
        this.activeStars = 0;
    }

    show(time, stars, hasNextLevel = true, world = 1) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 100);
        
        this.finalTimeElement.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
        
        // Text anpassen je nachdem ob es ein nächstes Level gibt
        if (hasNextLevel) {
            this.continueText.textContent = 'PRESS SPACE FOR NEXT LEVEL';
        } else {
            this.continueText.textContent = 'ALL LEVELS COMPLETE!';
        }
        this.menuText.textContent = 'PRESS ESC FOR MENU';
        
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
}
