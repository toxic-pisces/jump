import { PLAYER } from '../config/Constants.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = PLAYER.WIDTH;
        this.height = PLAYER.HEIGHT;

        this.velocityX = 0;
        this.velocityY = 0;
        this.lastVelocityY = 0; // For squash effect

        this.speed = PLAYER.SPEED;
        this.jumpForce = PLAYER.JUMP_FORCE;
        this.maxJumps = PLAYER.MAX_JUMPS;
        this.jumpCount = 0;
        
        this.isGrounded = false;
        this.rotation = 0;

        this.lastJumpPress = false;
        this.wasGrounded = false;

        // Für Bounce-Effekt
        this.landingTime = 0;

        // Glue platform tracking
        this.isStuckToGlue = false;
        this.lastJumpedFromGlue = false; // Track if last jump was from glue platform
    }

    update(deltaTime, input) {
        this.wasGrounded = this.isGrounded;

        // Speichere Y-Velocity für Squash-Effekt
        this.lastVelocityY = this.velocityY;

        // Horizontal movement (unless stuck to glue from side)
        if (!this.isStuckToGlue || this.isGrounded) {
            if (input.left) {
                this.velocityX = -this.speed;
            } else if (input.right) {
                this.velocityX = this.speed;
            } else {
                this.velocityX = 0;
            }
        } else {
            // Stuck to glue from side/bottom - no horizontal movement
            this.velocityX = 0;
        }

        // Jump - check if we can jump based on glue platform rules
        const canDoubleJump = !this.lastJumpedFromGlue; // No double jump if last jump was from glue
        const maxAllowedJumps = canDoubleJump ? this.maxJumps : 1;
        
        if (input.jump && !this.lastJumpPress && this.jumpCount < maxAllowedJumps) {
            this.velocityY = this.jumpForce;
            this.jumpCount++;

            // Release from glue when jumping
            if (this.isStuckToGlue) {
                this.isStuckToGlue = false;
            }
        }
        this.lastJumpPress = input.jump;

        // Rotation - only while airborne
        if (!this.isGrounded) {
            const direction = this.velocityX >= 0 ? 1 : -1;
            this.rotation += direction * PLAYER.ROTATION_SPEED * deltaTime;
        } else {
            // On ground: snap to nearest 90° edge
            const snapAngle = Math.PI / 2;
            const targetRotation = Math.round(this.rotation / snapAngle) * snapAngle;
            const diff = targetRotation - this.rotation;

            if (Math.abs(diff) > PLAYER.ROTATION_SNAP_THRESHOLD) {
                this.rotation += diff * PLAYER.ROTATION_SNAP_SPEED * deltaTime;
            } else {
                this.rotation = targetRotation;
            }

            // Landing effect timer - only on first impact
            if (!this.wasGrounded && this.isGrounded) {
                this.landingTime = PLAYER.LANDING_DURATION;
            }
        }
        
        // Landing-Effekt abklingen lassen
        if (this.landingTime > 0) {
            this.landingTime = Math.max(0, this.landingTime - deltaTime);
        }

        // Apply velocity
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

    resetToStanding() {
        const snapAngle = Math.PI / 2;
        this.rotation = Math.round(this.rotation / snapAngle) * snapAngle;
        this.velocityX = 0;
        this.velocityY = 0;
        this.lastVelocityY = 0;
        this.jumpCount = 0;
        this.isGrounded = false;
        this.wasGrounded = false;
        this.lastJumpPress = false;
        this.landingTime = 0;
        this.isStuckToGlue = false;
        this.lastJumpedFromGlue = false;
    }
}
