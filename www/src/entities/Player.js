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
        this.wasStuckToGlue = false;
        this.lastJumpedFromGlue = false; // Track if last jump was from glue platform
        
        // Corner balancing
        this.isBalancingOnCorner = false;
        this.cornerSide = null;
        this.cornerBalanceTime = 0;
        
        // Slimy wiggle physics
        this.wiggleX = 0;
        this.wiggleY = 0;
        this.wiggleVelocityX = 0;
        this.wiggleVelocityY = 0;
        this.targetWiggleX = 0;
        this.targetWiggleY = 0;
    }

    update(deltaTime, input) {
        this.wasGrounded = this.isGrounded;

        // Speichere Y-Velocity für Squash-Effekt
        this.lastVelocityY = this.velocityY;

        // Horizontal movement (always allowed, even on glue - for sliding up)
        if (input.left) {
            this.velocityX = -this.speed;
        } else if (input.right) {
            this.velocityX = this.speed;
        } else {
            this.velocityX = 0;
        }

        // Jump - check if we can jump based on glue platform rules
        const canDoubleJump = !this.lastJumpedFromGlue; // No double jump if last jump was from glue
        const maxAllowedJumps = canDoubleJump ? this.maxJumps : 1;
        
        if (input.jump && !this.lastJumpPress && this.jumpCount < maxAllowedJumps) {
            this.velocityY = this.jumpForce;
            this.jumpCount++;

            // Release from glue when jumping
            if (this.wasStuckToGlue) {
                this.wasStuckToGlue = false;
            }
        }
        this.lastJumpPress = input.jump;

        // Rotation - DISABLE rotation when stuck to glue (even though still moving)
        if (!this.isGrounded && !this.wasStuckToGlue) {
            const direction = this.velocityX >= 0 ? 1 : -1;
            this.rotation += direction * PLAYER.ROTATION_SPEED * deltaTime;
        } else {
            // If stuck to glue, immediately snap to perfectly upright (0 degrees)
            if (this.wasStuckToGlue) {
                // Normalize rotation to 0-2π range, then snap to 0
                const fullRotation = Math.PI * 2;
                const normalized = ((this.rotation % fullRotation) + fullRotation) % fullRotation;
                
                // Find which quadrant we're in and snap to the nearest upright position
                // 0°, 90°, 180°, 270° - but we want 0° (upright)
                const snapAngle = Math.PI / 2;
                const quadrant = Math.round(normalized / snapAngle);
                
                // Always force to 0° (upright) regardless of quadrant
                this.rotation = Math.floor(this.rotation / fullRotation) * fullRotation;
            } else {
                // On ground (not glue): snap to nearest 90° edge
                const snapAngle = Math.PI / 2;
                const targetRotation = Math.round(this.rotation / snapAngle) * snapAngle;
                const diff = targetRotation - this.rotation;

                if (Math.abs(diff) > PLAYER.ROTATION_SNAP_THRESHOLD) {
                    this.rotation += diff * PLAYER.ROTATION_SNAP_SPEED * deltaTime;
                } else {
                    this.rotation = targetRotation;
                }
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
        
        // Corner balancing - if balancing on corner without input, fall off after a moment
        if (this.isBalancingOnCorner) {
            this.cornerBalanceTime += deltaTime;
            
            // After 0.3 seconds on corner without moving, start falling off
            if (this.cornerBalanceTime > 0.3 && !input.left && !input.right) {
                // Apply small horizontal velocity to fall off the corner
                const fallDirection = this.cornerSide === 'left' ? -1 : 1;
                this.velocityX = fallDirection * this.speed * 0.3;
            }
        } else {
            this.cornerBalanceTime = 0;
        }
        
        // SLIMY WIGGLE PHYSICS - jelly-like wobble
        const wiggleStiffness = 15; // Spring stiffness
        const wiggleDamping = 0.85; // Damping (lower = more bouncy)
        
        // Create wiggle targets based on movement
        if (Math.abs(this.velocityX) > 10) {
            this.targetWiggleX = -Math.sign(this.velocityX) * Math.min(Math.abs(this.velocityX) * 0.02, 3);
        } else {
            this.targetWiggleX = 0;
        }
        
        if (Math.abs(this.velocityY) > 50) {
            this.targetWiggleY = -Math.sign(this.velocityY) * Math.min(Math.abs(this.velocityY) * 0.015, 4);
        } else {
            this.targetWiggleY = 0;
        }
        
        // Spring physics for wiggle
        const wiggleForceX = (this.targetWiggleX - this.wiggleX) * wiggleStiffness;
        const wiggleForceY = (this.targetWiggleY - this.wiggleY) * wiggleStiffness;
        
        this.wiggleVelocityX += wiggleForceX * deltaTime;
        this.wiggleVelocityY += wiggleForceY * deltaTime;
        
        this.wiggleVelocityX *= wiggleDamping;
        this.wiggleVelocityY *= wiggleDamping;
        
        this.wiggleX += this.wiggleVelocityX * deltaTime;
        this.wiggleY += this.wiggleVelocityY * deltaTime;

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
        this.wasStuckToGlue = false;
        this.lastJumpedFromGlue = false;
        this.isBalancingOnCorner = false;
        this.cornerSide = null;
        this.cornerBalanceTime = 0;
    }
}
