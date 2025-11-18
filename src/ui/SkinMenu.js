/**
 * SkinMenu
 * Manages the skin selection screen for the player cube
 */

export class SkinMenu {
    constructor() {
        this.container = document.getElementById('skin-menu');
        this.backButton = document.getElementById('skin-menu-back-button');
        this.skinCards = document.querySelectorAll('.skin-card');
        
        this.onBack = null;
        this.currentWorld = 1;
        
        // Skin definitions
        this.skins = {
            default: {
                name: 'DEFAULT',
                colors: {
                    1: { main: '#FF8FC7', light: '#FFB3D9', dark: '#FF6BB5', border: '#FF6BB5' }, // Pink
                    2: { main: '#4682B4', light: '#87CEEB', dark: '#1E3A8A', border: '#2C5282' }, // Blue
                    3: { main: '#FFD700', light: '#FFF59D', dark: '#DAA520', border: '#DAA520' }  // Gold
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
                    1: { main: '#FFFFFF', light: '#FFFFFF', dark: '#CCCCCC', border: '#AAAAAA' },
                    2: { main: '#FFFFFF', light: '#FFFFFF', dark: '#CCCCCC', border: '#AAAAAA' },
                    3: { main: '#FFFFFF', light: '#FFFFFF', dark: '#CCCCCC', border: '#AAAAAA' }
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
            glue: {
                name: 'GLUE',
                special: 'glue',
                colors: {
                    1: { main: '#2193B0', light: '#6DD5ED', dark: '#1A7A8F', border: '#156075' },
                    2: { main: '#2193B0', light: '#6DD5ED', dark: '#1A7A8F', border: '#156075' },
                    3: { main: '#2193B0', light: '#6DD5ED', dark: '#1A7A8F', border: '#156075' }
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
            spike: {
                name: 'SPIKE',
                special: 'spike',
                colors: {
                    1: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C' },
                    2: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C' },
                    3: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C' }
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
            lightning: {
                name: 'LIGHTNING',
                special: 'lightning',
                colors: {
                    1: { main: '#00D4FF', light: '#66E5FF', dark: '#0088CC', border: '#00BFFF' },
                    2: { main: '#00D4FF', light: '#66E5FF', dark: '#0088CC', border: '#00BFFF' },
                    3: { main: '#00D4FF', light: '#66E5FF', dark: '#0088CC', border: '#00BFFF' }
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
            turret: {
                name: 'TURRET',
                special: 'turret',
                colors: {
                    1: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C' },
                    2: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C' },
                    3: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C' }
                }
            }
        };
        
        this.setupEventListeners();
        this.loadSelectedSkin();
        this.renderPreviews();
    }

    setupEventListeners() {
        // Back button
        this.backButton.addEventListener('click', () => {
            this.hide();
            if (this.onBack) {
                this.onBack();
            }
        });

        // Skin card clicks
        this.skinCards.forEach(card => {
            card.addEventListener('click', () => {
                const skinId = card.dataset.skin;
                this.selectSkin(skinId);
            });
        });
    }

    selectSkin(skinId) {
        // Save selection
        localStorage.setItem('selectedSkin', skinId);
        
        // Update UI
        this.updateSelection();
    }

    updateSelection() {
        const selectedSkin = localStorage.getItem('selectedSkin') || 'default';
        
        this.skinCards.forEach(card => {
            const isSelected = card.dataset.skin === selectedSkin;
            card.classList.toggle('selected', isSelected);
        });
    }

    loadSelectedSkin() {
        this.updateSelection();
    }

    renderPreviews() {
        this.skinCards.forEach(card => {
            const canvas = card.querySelector('.skin-preview');
            const ctx = canvas.getContext('2d');
            const skinId = card.dataset.skin;
            const skin = this.skins[skinId];
            
            if (!skin) return;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Get colors for current world
            const colors = skin.colors[this.currentWorld];
            
            // Draw cube preview
            const size = 40;
            const x = (canvas.width - size) / 2;
            const y = (canvas.height - size) / 2;
            
            // Special rendering for different skins
            if (skin.special === 'rainbow') {
                // Rainbow gradient
                const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
                gradient.addColorStop(0, '#FF0000');
                gradient.addColorStop(0.17, '#FF7F00');
                gradient.addColorStop(0.33, '#FFFF00');
                gradient.addColorStop(0.5, '#00FF00');
                gradient.addColorStop(0.67, '#0000FF');
                gradient.addColorStop(0.83, '#4B0082');
                gradient.addColorStop(1, '#9400D3');
                ctx.fillStyle = gradient;
            } else if (skin.special === 'lightning') {
                // Electric blue gradient
                const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
                gradient.addColorStop(0, '#FFFFFF');
                gradient.addColorStop(0.5, colors.light);
                gradient.addColorStop(1, colors.main);
                ctx.fillStyle = gradient;
            } else if (skin.special === 'neongreen') {
                // Neon green glow
                const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
                gradient.addColorStop(0, colors.light);
                gradient.addColorStop(0.5, colors.main);
                gradient.addColorStop(1, colors.dark);
                ctx.fillStyle = gradient;
            } else if (skin.special === 'spike') {
                // Dark metallic look
                const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
                gradient.addColorStop(0, colors.light);
                gradient.addColorStop(0.5, colors.main);
                gradient.addColorStop(1, colors.dark);
                ctx.fillStyle = gradient;
            } else {
                // Standard gradient
                const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
                gradient.addColorStop(0, colors.light);
                gradient.addColorStop(1, colors.main);
                ctx.fillStyle = gradient;
            }
            
            ctx.fillRect(x, y, size, size);
            
            // Special pixel rendering for spike skin BEFORE border
            if (skin.special === 'spike') {
                // Draw metallic gradient body with exact colors from real spikes
                const pixelSize = 4;
                const gridWidth = size / pixelSize;
                const gridHeight = size / pixelSize;
                
                for (let gy = 0; gy < gridHeight; gy++) {
                    for (let gx = 0; gx < gridWidth; gx++) {
                        const px = x + gx * pixelSize;
                        const py = y + gy * pixelSize;
                        
                        const verticalPos = gy / gridHeight;
                        const horizontalPos = gx / gridWidth;
                        
                        let color;
                        
                        // Dark gunmetal body with metallic sheen
                        if (verticalPos < 0.3) {
                            if (horizontalPos > 0.3 && horizontalPos < 0.7) {
                                color = '#6A7B8C'; // Light steel
                            } else {
                                color = '#4A5B6C'; // Medium steel
                            }
                        } else if (verticalPos < 0.7) {
                            color = gx % 2 === gy % 2 ? '#3A4B5C' : '#2A3B4C';
                        } else {
                            color = '#1A2B3C';
                        }
                        
                        if (gx === 0 || gy === 0) {
                            color = '#7A8B9C';
                        }
                        if (gx === gridWidth - 1 || gy === gridHeight - 1) {
                            color = '#0A1B2C';
                        }
                        
                        ctx.fillStyle = color;
                        ctx.fillRect(px, py, pixelSize, pixelSize);
                    }
                }
            }
            
            // Border (with spikes integrated for spike skin)
            if (skin.special === 'spike') {
                // Draw spike border - pixel spikes integrated
                const pixelSize = 4;
                ctx.fillStyle = colors.border;
                
                // Top spikes (2 spikes)
                const topSpikes = [x + 8, x + size - 16];
                topSpikes.forEach(sx => {
                    ctx.fillRect(sx + pixelSize, y - pixelSize, pixelSize, pixelSize); // tip
                    ctx.fillRect(sx, y, pixelSize * 3, pixelSize); // base
                });
                
                // Bottom spikes
                const bottomSpikes = [x + 8, x + size - 16];
                bottomSpikes.forEach(sx => {
                    ctx.fillRect(sx + pixelSize, y + size, pixelSize, pixelSize); // tip
                    ctx.fillRect(sx, y + size - pixelSize, pixelSize * 3, pixelSize); // base
                });
                
                // Left spikes
                const leftSpikes = [y + 8, y + size - 16];
                leftSpikes.forEach(sy => {
                    ctx.fillRect(x - pixelSize, sy + pixelSize, pixelSize, pixelSize); // tip
                    ctx.fillRect(x, sy, pixelSize, pixelSize * 3); // base
                });
                
                // Right spikes
                const rightSpikes = [y + 8, y + size - 16];
                rightSpikes.forEach(sy => {
                    ctx.fillRect(x + size, sy + pixelSize, pixelSize, pixelSize); // tip
                    ctx.fillRect(x + size - pixelSize, sy, pixelSize, pixelSize * 3); // base
                });
            } else {
                // Normal border
                ctx.strokeStyle = colors.border;
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, size, size);
            }
            
            // Special features
            if (skin.special === 'angry') {
                // Draw angry face
                ctx.fillStyle = '#000000';
                // Eyes
                ctx.fillRect(x + 10, y + 12, 6, 6);
                ctx.fillRect(x + 24, y + 12, 6, 6);
                // Eyebrows (angry)
                ctx.fillRect(x + 8, y + 10, 8, 3);
                ctx.fillRect(x + 24, y + 10, 8, 3);
                // Frown mouth
                ctx.fillRect(x + 12, y + 28, 16, 3);
                ctx.fillRect(x + 10, y + 26, 4, 3);
                ctx.fillRect(x + 26, y + 26, 4, 3);
            } else if (skin.special === 'lightning') {
                // Add glow effect
                ctx.shadowColor = colors.light;
                ctx.shadowBlur = 10;
                ctx.strokeStyle = colors.light;
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
                ctx.shadowBlur = 0;
            } else if (skin.special === 'neongreen') {
                // Neon glow effect
                ctx.shadowColor = colors.main;
                ctx.shadowBlur = 15;
                ctx.strokeStyle = colors.light;
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
                ctx.shadowBlur = 0;
            } else if (skin.special === 'glue') {
                // Draw slime drips like glue platforms
                ctx.fillStyle = colors.dark;
                const dripSize = 4;
                // Top drips
                ctx.fillRect(x + 8, y, dripSize, dripSize);
                ctx.fillRect(x + 16, y, dripSize, dripSize);
                ctx.fillRect(x + 28, y, dripSize, dripSize);
                // Side drips
                ctx.fillRect(x, y + 12, dripSize, dripSize);
                ctx.fillRect(x + size - dripSize, y + 12, dripSize, dripSize);
                ctx.fillRect(x, y + 24, dripSize, dripSize);
                ctx.fillRect(x + size - dripSize, y + 24, dripSize, dripSize);
            } else if (skin.special === 'spike') {
                // Spike skin rendering is handled in border section above
            } else {
                // Highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(x + 4, y + 4, size - 8, 6);
            }
        });
    }

    show(onBackCallback, world = 1) {
        this.container.classList.remove('hidden');
        this.onBack = onBackCallback;
        this.currentWorld = world;
        this.loadSelectedSkin();
        this.renderPreviews();
    }

    hide() {
        this.container.classList.add('hidden');
    }

    // Get the color scheme for the current skin and world
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
            neongreen: {
                1: { main: '#00FF00', light: '#7FFF00', dark: '#00CC00', border: '#00DD00', special: 'neongreen' },
                2: { main: '#00FF00', light: '#7FFF00', dark: '#00CC00', border: '#00DD00', special: 'neongreen' },
                3: { main: '#00FF00', light: '#7FFF00', dark: '#00CC00', border: '#00DD00', special: 'neongreen' }
            },
            glue: {
                1: { main: '#2193B0', light: '#6DD5ED', dark: '#1A7A8F', border: '#156075', special: 'glue' },
                2: { main: '#2193B0', light: '#6DD5ED', dark: '#1A7A8F', border: '#156075', special: 'glue' },
                3: { main: '#2193B0', light: '#6DD5ED', dark: '#1A7A8F', border: '#156075', special: 'glue' }
            },
            black: {
                1: { main: '#2C2C2C', light: '#4A4A4A', dark: '#1A1A1A', border: '#000000' },
                2: { main: '#2C2C2C', light: '#4A4A4A', dark: '#1A1A1A', border: '#000000' },
                3: { main: '#2C2C2C', light: '#4A4A4A', dark: '#1A1A1A', border: '#000000' }
            },
            spike: {
                1: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C', special: 'spike' },
                2: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C', special: 'spike' },
                3: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C', special: 'spike' }
            },
            rainbow: {
                1: { main: '#FF0080', light: '#FF69B4', dark: '#CC0066', border: '#FF1493', special: 'rainbow' },
                2: { main: '#FF0080', light: '#FF69B4', dark: '#CC0066', border: '#FF1493', special: 'rainbow' },
                3: { main: '#FF0080', light: '#FF69B4', dark: '#CC0066', border: '#FF1493', special: 'rainbow' }
            },
            lightning: {
                1: { main: '#00D4FF', light: '#66E5FF', dark: '#0088CC', border: '#00BFFF', special: 'lightning' },
                2: { main: '#00D4FF', light: '#66E5FF', dark: '#0088CC', border: '#00BFFF', special: 'lightning' },
                3: { main: '#00D4FF', light: '#66E5FF', dark: '#0088CC', border: '#00BFFF', special: 'lightning' }
            },
            angry: {
                1: { main: '#FF4500', light: '#FF6347', dark: '#CC3700', border: '#FF4500', special: 'angry' },
                2: { main: '#FF4500', light: '#FF6347', dark: '#CC3700', border: '#FF4500', special: 'angry' },
                3: { main: '#FF4500', light: '#FF6347', dark: '#CC3700', border: '#FF4500', special: 'angry' }
            }
        };
        
        return skins[skinId] ? skins[skinId][world] : skins.default[world];
    }
}
