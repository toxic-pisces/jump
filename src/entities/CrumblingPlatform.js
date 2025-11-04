export class CrumblingPlatform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.touchCount = 0;
        this.maxTouches = 2;
        this.isCrumbling = false;
        this.crumbleProgress = 0;
        this.isDestroyed = false;
        
        // Erstelle Grid aus Quadraten von Anfang an
        this.pixelSize = 8;
        this.pixels = [];
        this.createPixelGrid();
    }

    createPixelGrid() {
        const cols = Math.ceil(this.width / this.pixelSize);
        const rows = Math.ceil(this.height / this.pixelSize);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.pixels.push({
                    x: this.x + col * this.pixelSize,
                    y: this.y + row * this.pixelSize,
                    originalY: this.y + row * this.pixelSize,
                    size: this.pixelSize,
                    velocityY: 0,
                    velocityX: 0,
                    rotation: 0,
                    rotationSpeed: 0,
                    isFalling: false,
                    alpha: 1,
                    fallDelay: 0
                });
            }
        }
    }

    onPlayerTouch() {
        if (this.isDestroyed) return;
        
        this.touchCount++;
        if (this.touchCount >= this.maxTouches) {
            this.startCrumbling();
        }
    }

    startCrumbling() {
        this.isCrumbling = true;
        
        // Setze zufällige Delays für gestaffeltes Fallen
        this.pixels.forEach(pixel => {
            pixel.fallDelay = Math.random() * 0.5;
            pixel.velocityX = (Math.random() - 0.5) * 100;
            pixel.rotationSpeed = (Math.random() - 0.5) * 8;
        });
    }

    update(deltaTime) {
        if (this.isCrumbling) {
            this.crumbleProgress += deltaTime;
            
            let allFallen = true;
            
            this.pixels.forEach(pixel => {
                if (!pixel.isFalling) {
                    if (pixel.fallDelay > 0) {
                        pixel.fallDelay -= deltaTime;
                        allFallen = false;
                    } else {
                        pixel.isFalling = true;
                    }
                }
                
                if (pixel.isFalling && pixel.alpha > 0) {
                    // Gravitation
                    pixel.velocityY += 1200 * deltaTime;
                    pixel.y += pixel.velocityY * deltaTime;
                    pixel.x += pixel.velocityX * deltaTime;
                    pixel.rotation += pixel.rotationSpeed * deltaTime;
                    
                    // Verblassen nach kurzem Fall
                    const fallDistance = pixel.y - pixel.originalY;
                    if (fallDistance > 50) {
                        pixel.alpha -= deltaTime * 3;
                        if (pixel.alpha < 0) pixel.alpha = 0;
                    }
                    
                    if (pixel.alpha > 0) {
                        allFallen = false;
                    }
                }
            });
            
            if (allFallen && this.crumbleProgress > 1) {
                this.isDestroyed = true;
            }
        }
    }

    reset() {
        this.touchCount = 0;
        this.isCrumbling = false;
        this.crumbleProgress = 0;
        this.isDestroyed = false;
        this.pixels = [];
        this.createPixelGrid();
    }
}
