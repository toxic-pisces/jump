export class Physics {
    constructor() {
        this.gravity = 1500;
    }

    applyGravity(entity, deltaTime) {
        // Don't apply gravity if stuck to glue platform from side/bottom
        if (entity.isStuckToGlue && !entity.isGrounded) {
            return;
        }
        entity.velocityY += this.gravity * deltaTime;
    }

    checkCollisions(player, platforms) {
        player.isGrounded = false;

        for (let platform of platforms) {
            if (this.checkAABB(player, platform)) {
                const overlapLeft = (player.x + player.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - player.x;
                const overlapTop = (player.y + player.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - player.y;

                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapTop && player.velocityY >= 0) { // >= statt >
                    // Landing on top - EXAKT positionieren
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.isGrounded = true;
                    player.jumpCount = 0;
                    
                    // Reset glue flag when landing on normal platform
                    player.lastJumpedFromGlue = false;
                } else if (minOverlap === overlapBottom && player.velocityY < 0) {
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;
                } else if (minOverlap === overlapLeft) {
                    player.x = platform.x - player.width;
                    player.velocityX = 0;
                } else if (minOverlap === overlapRight) {
                    player.x = platform.x + platform.width;
                    player.velocityX = 0;
                }
            }
        }
    }

    checkCrumblingCollisions(player, platforms) {
        for (let platform of platforms) {
            if (platform.isDestroyed) continue;

            if (this.checkAABB(player, platform)) {
                const overlapLeft = (player.x + player.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - player.x;
                const overlapTop = (player.y + player.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - player.y;

                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapTop && player.velocityY >= 0) { // >= statt >
                    // EXAKT positionieren
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.isGrounded = true;
                    player.jumpCount = 0;

                    // Reset glue flag when landing on crumbling platform (normal behavior)
                    player.lastJumpedFromGlue = false;

                    platform.onPlayerTouch();
                } else if (minOverlap === overlapBottom && player.velocityY < 0) {
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;
                } else if (minOverlap === overlapLeft) {
                    player.x = platform.x - player.width;
                    player.velocityX = 0;
                } else if (minOverlap === overlapRight) {
                    player.x = platform.x + platform.width;
                    player.velocityX = 0;
                }
            }
        }
    }

    checkGluePlatformCollisions(player, platforms) {
        let isStuckToGlue = false;
        let isOnTopOfGlue = false;

        for (let platform of platforms) {
            if (this.checkAABB(player, platform)) {
                const overlapLeft = (player.x + player.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - player.x;
                const overlapTop = (player.y + player.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - player.y;

                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapTop && player.velocityY >= 0) {
                    // Landing on top
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.isGrounded = true;
                    player.jumpCount = 0;
                    isStuckToGlue = true;
                    isOnTopOfGlue = true;
                    
                    // Mark that player is on a glue platform
                    player.lastJumpedFromGlue = true;
                } else if (minOverlap === overlapBottom && player.velocityY < 0) {
                    // Hitting from bottom - STICK to it!
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;
                    player.isStuckToGlue = true;
                    isStuckToGlue = true;
                } else if (minOverlap === overlapLeft && player.velocityX > 0) {
                    // Hitting from left side - STICK to it!
                    player.x = platform.x - player.width;
                    player.velocityX = 0;
                    player.isStuckToGlue = true;
                    isStuckToGlue = true;
                } else if (minOverlap === overlapRight && player.velocityX < 0) {
                    // Hitting from right side - STICK to it!
                    player.x = platform.x + platform.width;
                    player.velocityX = 0;
                    player.isStuckToGlue = true;
                    isStuckToGlue = true;
                }
            }
        }

        return isStuckToGlue;
    }

    checkBlinkingCollisions(player, platforms) {
        for (let platform of platforms) {
            // Only collide if platform is visible
            if (!platform.canCollide()) continue;

            if (this.checkAABB(player, platform)) {
                const overlapLeft = (player.x + player.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - player.x;
                const overlapTop = (player.y + player.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - player.y;

                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapTop && player.velocityY >= 0) {
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.isGrounded = true;
                    player.jumpCount = 0;

                    // Reset glue flag when landing on blinking platform
                    player.lastJumpedFromGlue = false;
                } else if (minOverlap === overlapBottom && player.velocityY < 0) {
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;
                } else if (minOverlap === overlapLeft) {
                    player.x = platform.x - player.width;
                    player.velocityX = 0;
                } else if (minOverlap === overlapRight) {
                    player.x = platform.x + platform.width;
                    player.velocityX = 0;
                }
            }
        }
    }

    checkAABB(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
}
