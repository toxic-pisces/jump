class Player {
    constructor(x, y) {
        // ...existing code...
        this.jumpedFromGlue = false;
        this.stuckToGlue = false;
        this.glueAttachSide = null; // 'top', 'bottom', 'left', 'right'
        this.gluePlatform = null;
    }

    jump() {
        // Only allow jump if on ground and didn't jump from glue, or if stuck to glue from below/sides
        if (this.onGround && !this.jumpedFromGlue) {
            this.velocityY = this.jumpStrength;
            this.onGround = false;
            this.jumpedFromGlue = this.isOnGluePlatform;
        } else if (this.stuckToGlue && this.glueAttachSide !== 'top') {
            // Allow jumping off when stuck from below or sides
            this.detachFromGlue();
            this.velocityY = this.jumpStrength;
        }
    }

    detachFromGlue() {
        this.stuckToGlue = false;
        this.glueAttachSide = null;
        this.gluePlatform = null;
    }

    update() {
        // ...existing code for movement...

        // Apply gravity only if not stuck to glue
        if (!this.stuckToGlue) {
            this.velocityY += this.gravity;
        } else {
            // When stuck to glue, handle movement based on attach side
            if (this.glueAttachSide === 'bottom') {
                this.velocityY = 0; // Stick to bottom
                // Allow horizontal movement
                this.x += this.velocityX;
            } else if (this.glueAttachSide === 'left' || this.glueAttachSide === 'right') {
                this.velocityY = 0;
                // Allow vertical movement along the side
                if (keys['w'] || keys['ArrowUp']) {
                    this.y -= 3;
                }
                if (keys['s'] || keys['ArrowDown']) {
                    this.y += 3;
                }
            }
        }

        // ...existing code...

        // Reset jumpedFromGlue when landing on non-glue platform
        if (this.onGround && !this.isOnGluePlatform) {
            this.jumpedFromGlue = false;
        }

        // Check if player moved away from glue platform
        if (this.stuckToGlue && this.gluePlatform) {
            if (!this.isNearGluePlatform(this.gluePlatform)) {
                this.detachFromGlue();
            }
        }
    }

    isNearGluePlatform(platform) {
        const buffer = 5;
        return !(this.x + this.width < platform.x - buffer ||
                 this.x > platform.x + platform.width + buffer ||
                 this.y + this.height < platform.y - buffer ||
                 this.y > platform.y + platform.height + buffer);
    }

    checkCollision(platforms) {
        this.onGround = false;
        this.isOnGluePlatform = false;

        platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {

                // Determine collision side
                const overlapLeft = (this.x + this.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - this.x;
                const overlapTop = (this.y + this.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - this.y;

                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (platform.type === 'glue') {
                    // Top collision (landing on platform)
                    if (minOverlap === overlapTop && this.velocityY > 0) {
                        this.y = platform.y - this.height;
                        this.velocityY = 0;
                        this.onGround = true;
                        this.isOnGluePlatform = true;
                        this.stuckToGlue = false; // Not stuck when on top
                        this.glueAttachSide = 'top';
                        this.gluePlatform = platform;
                    }
                    // Bottom collision (jumping into platform from below)
                    else if (minOverlap === overlapBottom && this.velocityY < 0) {
                        this.y = platform.y + platform.height;
                        this.velocityY = 0;
                        this.stuckToGlue = true;
                        this.glueAttachSide = 'bottom';
                        this.gluePlatform = platform;
                    }
                    // Left collision
                    else if (minOverlap === overlapLeft) {
                        this.x = platform.x - this.width;
                        this.velocityX = 0;
                        this.stuckToGlue = true;
                        this.glueAttachSide = 'left';
                        this.gluePlatform = platform;
                    }
                    // Right collision
                    else if (minOverlap === overlapRight) {
                        this.x = platform.x + platform.width;
                        this.velocityX = 0;
                        this.stuckToGlue = true;
                        this.glueAttachSide = 'right';
                        this.gluePlatform = platform;
                    }
                } else {
                    // Normal platform collision logic
                    if (minOverlap === overlapTop && this.velocityY > 0) {
                        this.y = platform.y - this.height;
                        this.velocityY = 0;
                        this.onGround = true;
                    } else if (minOverlap === overlapBottom && this.velocityY < 0) {
                        this.y = platform.y + platform.height;
                        this.velocityY = 0;
                    } else if (minOverlap === overlapLeft) {
                        this.x = platform.x - this.width;
                        this.velocityX = 0;
                    } else if (minOverlap === overlapRight) {
                        this.x = platform.x + platform.width;
                        this.velocityX = 0;
                    }
                }
            }
        });

        // If not stuck and not on ground, allow double jump reset
        if (!this.onGround && !this.stuckToGlue) {
            // Player is in air
        }
    }
}