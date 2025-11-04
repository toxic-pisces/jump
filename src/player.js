class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpStrength = -15;
        this.gravity = 0.8;
        this.onGround = false;
        this.color = '#4CAF50';
        
        // Glue platform states
        this.jumpedFromGlue = false;
        this.stuckToGlue = false;
        this.glueAttachSide = null;
        this.gluePlatform = null;
        this.isOnGluePlatform = false;
        this.canDoubleJump = true;
    }

    jump() {
        // Scenario 1: On ground, NOT on glue - allow normal jump
        if (this.onGround && !this.isOnGluePlatform) {
            this.velocityY = this.jumpStrength;
            this.onGround = false;
            this.canDoubleJump = true;
            this.jumpedFromGlue = false;
            return true;
        } 
        
        // Scenario 2: On ground, ON glue - allow ONLY first jump, NO double jump after
        if (this.onGround && this.isOnGluePlatform) {
            this.velocityY = this.jumpStrength;
            this.onGround = false;
            this.canDoubleJump = false; // DISABLE double jump
            this.jumpedFromGlue = true;
            return true;
        }
        
        // Scenario 3: In air, NOT from glue - allow double jump if available
        if (!this.onGround && !this.jumpedFromGlue && this.canDoubleJump) {
            this.velocityY = this.jumpStrength;
            this.canDoubleJump = false;
            return true;
        }
        
        // Scenario 4: Stuck to glue sides/bottom - allow jump to detach
        if (this.stuckToGlue && (this.glueAttachSide === 'bottom' || 
                                  this.glueAttachSide === 'left' || 
                                  this.glueAttachSide === 'right')) {
            this.velocityY = this.jumpStrength;
            this.stuckToGlue = false;
            this.glueAttachSide = null;
            this.gluePlatform = null;
            this.canDoubleJump = true;
            this.jumpedFromGlue = false;
            return true;
        }
        
        // All other cases: NO JUMP ALLOWED
        return false;
    }

    update(keys) {
        // Handle horizontal movement
        this.velocityX = 0;
        
        if (keys['a'] || keys['ArrowLeft']) {
            this.velocityX = -this.speed;
        }
        if (keys['d'] || keys['ArrowRight']) {
            this.velocityX = this.speed;
        }

        // Apply gravity ONLY if not stuck to glue
        if (!this.stuckToGlue) {
            this.velocityY += this.gravity;
        } else {
            // Handle movement while stuck to glue
            if (this.glueAttachSide === 'bottom') {
                // Stuck to bottom - no gravity, but allow horizontal movement
                this.velocityY = 0;
                this.x += this.velocityX;
            } else if (this.glueAttachSide === 'left' || this.glueAttachSide === 'right') {
                // Stuck to side - no gravity, allow vertical movement
                this.velocityY = 0;
                this.velocityX = 0;
                
                // Allow climbing up/down
                if (keys['w'] || keys['ArrowUp']) {
                    this.y -= this.speed;
                }
                if (keys['s'] || keys['ArrowDown']) {
                    this.y += this.speed;
                }
            }
        }

        // Apply velocity ONLY if not stuck (except for special stuck movements above)
        if (!this.stuckToGlue || this.glueAttachSide === 'top') {
            this.x += this.velocityX;
            this.y += this.velocityY;
        }

        // Boundary checks
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

        // Reset jump states when landing on non-glue platform
        if (this.onGround && !this.isOnGluePlatform) {
            this.jumpedFromGlue = false;
            this.canDoubleJump = true;
        }

        // Check if still near glue platform when stuck
        if (this.stuckToGlue && this.gluePlatform) {
            const buffer = 10;
            const nearPlatform = !(
                this.x + this.width < this.gluePlatform.x - buffer ||
                this.x > this.gluePlatform.x + this.gluePlatform.width + buffer ||
                this.y + this.height < this.gluePlatform.y - buffer ||
                this.y > this.gluePlatform.y + this.gluePlatform.height + buffer
            );
            
            if (!nearPlatform) {
                this.stuckToGlue = false;
                this.glueAttachSide = null;
                this.gluePlatform = null;
            }
        }
    }

    checkCollision(platforms) {
        const wasOnGlue = this.isOnGluePlatform;
        
        this.onGround = false;
        this.isOnGluePlatform = false;

        platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {

                const overlapLeft = (this.x + this.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - this.x;
                const overlapTop = (this.y + this.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - this.y;

                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (platform.type === 'glue') {
                    // Top collision (landing on top of platform)
                    if (minOverlap === overlapTop && this.velocityY >= 0) {
                        this.y = platform.y - this.height;
                        this.velocityY = 0;
                        this.onGround = true;
                        this.isOnGluePlatform = true;
                        
                        if (this.glueAttachSide !== 'top') {
                            this.stuckToGlue = false;
                            this.glueAttachSide = 'top';
                            this.gluePlatform = platform;
                        }
                    }
                    // Bottom collision (hitting from below)
                    else if (minOverlap === overlapBottom && this.velocityY <= 0) {
                        this.y = platform.y + platform.height;
                        this.velocityY = 0;
                        this.stuckToGlue = true;
                        this.glueAttachSide = 'bottom';
                        this.gluePlatform = platform;
                        this.jumpedFromGlue = false;
                        this.canDoubleJump = false;
                    }
                    // Left collision
                    else if (minOverlap === overlapLeft && this.velocityX >= 0) {
                        this.x = platform.x - this.width;
                        this.velocityX = 0;
                        this.stuckToGlue = true;
                        this.glueAttachSide = 'left';
                        this.gluePlatform = platform;
                        this.jumpedFromGlue = false;
                        this.canDoubleJump = false;
                    }
                    // Right collision
                    else if (minOverlap === overlapRight && this.velocityX <= 0) {
                        this.x = platform.x + platform.width;
                        this.velocityX = 0;
                        this.stuckToGlue = true;
                        this.glueAttachSide = 'right';
                        this.gluePlatform = platform;
                        this.jumpedFromGlue = false;
                        this.canDoubleJump = false;
                    }
                } else {
                    // NORMAL PLATFORM COLLISION
                    if (minOverlap === overlapTop && this.velocityY >= 0) {
                        this.y = platform.y - this.height;
                        this.velocityY = 0;
                        this.onGround = true;
                        this.stuckToGlue = false;
                        this.glueAttachSide = null;
                        this.gluePlatform = null;
                        this.jumpedFromGlue = false;
                    }
                    else if (minOverlap === overlapBottom && this.velocityY <= 0) {
                        this.y = platform.y + platform.height;
                        this.velocityY = 0;
                    }
                    else if (minOverlap === overlapLeft && this.velocityX >= 0) {
                        this.x = platform.x - this.width;
                        this.velocityX = 0;
                    }
                    else if (minOverlap === overlapRight && this.velocityX <= 0) {
                        this.x = platform.x + platform.width;
                        this.velocityX = 0;
                    }
                }
            }
        });

        // If we left a glue platform top, we're now in air from glue
        if (wasOnGlue && !this.onGround && !this.stuckToGlue) {
            this.jumpedFromGlue = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
