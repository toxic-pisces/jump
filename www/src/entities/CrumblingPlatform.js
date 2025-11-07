export class CrumblingPlatform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isCrumbling = false;
        this.crumbleProgress = 0;
        this.isDestroyed = false;
        this.playerIsOn = false;
        this.playerWasOn = false;
        this.crumbleTimer = 0;
        this.nextPixelFallTime = 0;
        this.shakeOffset = { x: 0, y: 0 };
        this.shakeIntensity = 0;
        this.fastCrumbleMode = false;
        
        // Pixel grid
        this.pixelSize = 6;
        this.pixels = [];
        this.createPixelGrid();
    }

    createPixelGrid() {
        const cols = Math.ceil(this.width / this.pixelSize);
        const rows = Math.ceil(this.height / this.pixelSize);
        
        // Create pixels with random visual variation
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.pixels.push({
                    x: this.x + col * this.pixelSize,
                    y: this.y + row * this.pixelSize,
                    originalX: this.x + col * this.pixelSize,
                    originalY: this.y + row * this.pixelSize,
                    row: row,
                    col: col,
                    size: this.pixelSize,
                    velocityY: 0,
                    velocityX: 0,
                    rotation: 0,
                    rotationSpeed: 0,
                    isFalling: false,
                    alpha: 1,
                    fallOrder: Math.random(), // Random fall order
                    fallDelay: 0,
                    pendingFastFall: false,
                    greyShade: 35 + Math.floor(Math.random() * 15) // Random grey 35-50
                });
            }
        }
        
        this.totalRows = rows;
        this.totalPixels = this.pixels.length;
        
        // Sort pixels by fall order (bottom-heavy bias)
        this.pixels.sort((a, b) => {
            // Pixels at bottom get lower fallOrder values (fall first)
            const aScore = a.fallOrder + (1 - a.row / rows) * 0.3;
            const bScore = b.fallOrder + (1 - b.row / rows) * 0.3;
            return aScore - bScore;
        });
    }

    onPlayerTouch() {
        if (this.isDestroyed) return;
        this.playerIsOn = true;
        
        if (!this.isCrumbling) {
            this.isCrumbling = true;
            this.shakeIntensity = 0.5; // Start gentle shaking
        }
    }

    startFastCrumble() {
        // When player jumps off, make everything fall fast with staggered timing
        let delay = 0;
        this.pixels.forEach(pixel => {
            if (!pixel.isFalling) {
                pixel.fallDelay = delay;
                delay += 0.015; // Very short stagger (0.015s between each pixel)
                pixel.velocityX = (Math.random() - 0.5) * 200;
                pixel.velocityY = Math.random() * 100 + 50;
                pixel.rotationSpeed = (Math.random() - 0.5) * 12;
                pixel.pendingFastFall = true; // Mark for fast fall
            }
        });
        this.fastCrumbleMode = true;
    }

    update(deltaTime) {
        // Check if player just left the platform
        if (this.playerWasOn && !this.playerIsOn && this.isCrumbling) {
            this.startFastCrumble();
        }
        
        this.playerWasOn = this.playerIsOn;
        this.playerIsOn = false; // Will be set again by collision if player is still on
        
        if (this.isCrumbling) {
            this.crumbleTimer += deltaTime;
            
            // Shaking effect when crumbling
            if (this.shakeIntensity > 0) {
                this.shakeOffset.x = (Math.random() - 0.5) * this.shakeIntensity * 2;
                this.shakeOffset.y = (Math.random() - 0.5) * this.shakeIntensity * 2;
                
                // Increase shake as more pixels fall
                const fallenRatio = this.pixels.filter(p => p.isFalling).length / this.totalPixels;
                this.shakeIntensity = 0.5 + fallenRatio * 1.5;
            }
            
            // While player is standing, slowly make pixels fall ONE BY ONE
            if (this.playerWasOn && !this.fastCrumbleMode) {
                this.nextPixelFallTime -= deltaTime;
                
                if (this.nextPixelFallTime <= 0) {
                    // Find next pixel to fall (using sorted order)
                    const nextPixel = this.pixels.find(p => !p.isFalling && p.fallDelay === 0);
                    if (nextPixel) {
                        nextPixel.isFalling = true;
                        nextPixel.velocityX = (Math.random() - 0.5) * 80;
                        nextPixel.velocityY = 30 + Math.random() * 20;
                        nextPixel.rotationSpeed = (Math.random() - 0.5) * 7;
                        
                        // Next pixel falls after 0.08 seconds (slower)
                        this.nextPixelFallTime = 0.08;
                    }
                }
            }
            
            // In fast crumble mode, process fall delays
            if (this.fastCrumbleMode) {
                this.pixels.forEach(pixel => {
                    if (pixel.pendingFastFall && pixel.fallDelay > 0) {
                        pixel.fallDelay -= deltaTime;
                        if (pixel.fallDelay <= 0) {
                            pixel.isFalling = true;
                            pixel.pendingFastFall = false;
                        }
                    }
                });
            }
            
            // Update all falling pixels
            let anyRemaining = false;
            let remainingCount = 0;
            
            this.pixels.forEach(pixel => {
                if (pixel.isFalling && pixel.alpha > 0) {
                    // Gravity
                    pixel.velocityY += 1500 * deltaTime;
                    pixel.y += pixel.velocityY * deltaTime;
                    pixel.x += pixel.velocityX * deltaTime;
                    pixel.rotation += pixel.rotationSpeed * deltaTime;
                    
                    // Fade out after falling a bit
                    const fallDistance = pixel.y - pixel.originalY;
                    if (fallDistance > 70) {
                        pixel.alpha -= deltaTime * 4;
                        if (pixel.alpha < 0) pixel.alpha = 0;
                    }
                } else if (!pixel.isFalling || pixel.pendingFastFall) {
                    anyRemaining = true;
                    remainingCount++;
                }
            });
            
            // Workaround: If only one pixel remains, make it fall immediately
            if (remainingCount === 1 && anyRemaining) {
                const lastPixel = this.pixels.find(p => (!p.isFalling || p.pendingFastFall) && p.alpha > 0);
                if (lastPixel) {
                    lastPixel.isFalling = true;
                    lastPixel.pendingFastFall = false;
                    lastPixel.fallDelay = 0;
                    lastPixel.velocityX = (Math.random() - 0.5) * 150;
                    lastPixel.velocityY = 50;
                    lastPixel.rotationSpeed = (Math.random() - 0.5) * 10;
                }
            }
            
            // Platform is destroyed when all pixels are gone
            if (!anyRemaining) {
                this.isDestroyed = true;
            }
        }
    }

    reset() {
        this.isCrumbling = false;
        this.crumbleProgress = 0;
        this.crumbleTimer = 0;
        this.nextPixelFallTime = 0;
        this.isDestroyed = false;
        this.playerIsOn = false;
        this.playerWasOn = false;
        this.shakeOffset = { x: 0, y: 0 };
        this.shakeIntensity = 0;
        this.fastCrumbleMode = false;
        this.pixels = [];
        this.createPixelGrid();
    }
}
