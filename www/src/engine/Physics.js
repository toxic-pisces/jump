import { PHYSICS, CANVAS } from '../config/Constants.js';

export class Physics {
    constructor() {
        this.gravity = PHYSICS.GRAVITY;
    }

    applyGravity(entity, deltaTime) {
        // Don't apply gravity if stuck to glue platform from side/bottom
        if (entity.isStuckToGlue && !entity.isGrounded) {
            return;
        }
        entity.velocityY += this.gravity * deltaTime;
    }

    enforceWorldBoundaries(player) {
        // Left boundary
        if (player.x < 0) {
            player.x = 0;
            player.velocityX = 0;
        }

        // Right boundary
        if (player.x + player.width > CANVAS.WIDTH) {
            player.x = CANVAS.WIDTH - player.width;
            player.velocityX = 0;
        }

        // Top boundary
        if (player.y < 0) {
            player.y = 0;
            player.velocityY = 0;
        }

        // Bottom has no boundary - player falls and dies
    }

    checkCollisions(player, platforms) {
        player.isGrounded = false;
        player.isBalancingOnCorner = false;
        player.cornerSide = null;

        for (let platform of platforms) {
            if (this.checkAABB(player, platform)) {
                const overlapLeft = (player.x + player.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - player.x;
                const overlapTop = (player.y + player.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - player.y;

                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapTop && player.velocityY >= 0) {
                    // Landing on top - check for corner landing
                    const playerCenterX = player.x + player.width / 2;
                    const platformCenterX = platform.x + platform.width / 2;
                    
                    // Check if player is mostly hanging off the edge
                    const hangingOffLeft = (player.x + player.width) - platform.x;
                    const hangingOffRight = (platform.x + platform.width) - player.x;
                    
                    // Corner threshold - if less than 40% of player is on platform
                    const cornerThreshold = player.width * 0.4;
                    
                    if (hangingOffLeft < cornerThreshold && hangingOffLeft > 0) {
                        // Balancing on left corner
                        player.y = platform.y - player.height;
                        player.velocityY = 0;
                        player.isGrounded = true;
                        player.isBalancingOnCorner = true;
                        player.cornerSide = 'left';
                        player.jumpCount = 0;
                        player.lastJumpedFromGlue = false;
                    } else if (hangingOffRight < cornerThreshold && hangingOffRight > 0) {
                        // Balancing on right corner
                        player.y = platform.y - player.height;
                        player.velocityY = 0;
                        player.isGrounded = true;
                        player.isBalancingOnCorner = true;
                        player.cornerSide = 'right';
                        player.jumpCount = 0;
                        player.lastJumpedFromGlue = false;
                    } else {
                        // Normal landing - fully on platform
                        player.y = platform.y - player.height;
                        player.velocityY = 0;
                        player.isGrounded = true;
                        player.jumpCount = 0;
                        player.lastJumpedFromGlue = false;
                    }
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

            // Check if there are any non-falling pixels left to collide with
            const hasRemainingPixels = platform.pixels.some(p => !p.isFalling && p.alpha > 0);
            if (!hasRemainingPixels) {
                // Platform is effectively gone even if not marked destroyed yet
                continue;
            }

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

                    // Mark that player is on this platform
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
                    player.lastVelocityX = player.velocityX; // Store for swoosh effect
                    player.x = platform.x - player.width;
                    player.velocityX = 0;
                    player.isStuckToGlue = true;
                    isStuckToGlue = true;
                } else if (minOverlap === overlapRight && player.velocityX < 0) {
                    // Hitting from right side - STICK to it!
                    player.lastVelocityX = player.velocityX; // Store for swoosh effect
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

    checkMovingPlatformCollisions(player, platforms, deltaTime) {
        for (let platform of platforms) {
            if (this.checkAABB(player, platform)) {
                const overlapLeft = (player.x + player.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - player.x;
                const overlapTop = (player.y + player.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - player.y;

                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapTop && player.velocityY >= 0) {
                    // Landing on top - move with platform
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.isGrounded = true;
                    player.jumpCount = 0;

                    // Transfer platform velocity to player
                    player.x += platform.getVelocityX(deltaTime) * deltaTime;
                    player.y += platform.getVelocityY(deltaTime) * deltaTime;

                    // Reset glue flag when landing on moving platform
                    player.lastJumpedFromGlue = false;
                } else if (minOverlap === overlapBottom && player.velocityY < 0) {
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;

                    // Push player along with platform
                    player.x += platform.getVelocityX(deltaTime) * deltaTime;
                    player.y += platform.getVelocityY(deltaTime) * deltaTime;
                } else if (minOverlap === overlapLeft) {
                    player.x = platform.x - player.width;
                    player.velocityX = 0;

                    // Push player along with platform
                    player.y += platform.getVelocityY(deltaTime) * deltaTime;
                } else if (minOverlap === overlapRight) {
                    player.x = platform.x + platform.width;
                    player.velocityX = 0;

                    // Push player along with platform
                    player.y += platform.getVelocityY(deltaTime) * deltaTime;
                }
            }
        }
    }

    checkPressurePlatformCollisions(player, platforms) {
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
