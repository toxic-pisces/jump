export class PressurePlatform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Pressure plate properties
        this.isPressed = false;
        this.pressDepth = 0; // How far down the plate is pressed (0-5 pixels)
        this.maxPressDepth = 5;
        this.pressSpeed = 20; // Speed of pressing animation

        // Integrated spikes that come out of the platform
        this.spikeHeight = 40; // Max height of spikes
        this.currentSpikeHeight = 0; // Current spike height (0 = hidden)
        this.spikeRiseSpeed = 100; // Pixels per second - back to fast
        this.spikeFallSpeed = 80;
        this.spikeDelayTime = 1.0; // Delay before spikes start rising (1 second)
        this.spikeStayTime = 2.0; // How long spikes stay up
        this.spikeTimer = 0;
        this.spikeState = 'hidden'; // 'hidden', 'waiting', 'rising', 'active', 'falling'

        // Cooldown to prevent rapid toggling
        this.cooldown = 0;
        this.cooldownTime = 0.2; // seconds

        // Track if player was on platform last frame
        this.wasPlayerOn = false;
    }

    update(deltaTime) {
        // Update cooldown
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }

        // Animate press depth
        // Keep plate pressed while spikes are active (waiting, rising, or active states)
        const shouldStayPressed = this.spikeState === 'waiting' || 
                                   this.spikeState === 'rising' || 
                                   this.spikeState === 'active';
        
        if ((this.isPressed || shouldStayPressed) && this.pressDepth < this.maxPressDepth) {
            this.pressDepth = Math.min(this.pressDepth + this.pressSpeed * deltaTime, this.maxPressDepth);
        } else if (!this.isPressed && !shouldStayPressed && this.pressDepth > 0) {
            this.pressDepth = Math.max(this.pressDepth - this.pressSpeed * deltaTime, 0);
        }

        // Update spike animation
        switch (this.spikeState) {
            case 'waiting':
                // Wait for delay before spikes start rising
                this.spikeTimer += deltaTime;
                if (this.spikeTimer >= this.spikeDelayTime) {
                    this.spikeState = 'rising';
                    this.spikeTimer = 0;
                }
                break;

            case 'rising':
                this.currentSpikeHeight = Math.min(
                    this.currentSpikeHeight + this.spikeRiseSpeed * deltaTime,
                    this.spikeHeight
                );
                if (this.currentSpikeHeight >= this.spikeHeight) {
                    this.spikeState = 'active';
                    this.spikeTimer = 0;
                }
                break;

            case 'active':
                this.spikeTimer += deltaTime;
                if (this.spikeTimer >= this.spikeStayTime) {
                    this.spikeState = 'falling';
                }
                break;

            case 'falling':
                this.currentSpikeHeight = Math.max(
                    this.currentSpikeHeight - this.spikeFallSpeed * deltaTime,
                    0
                );
                if (this.currentSpikeHeight <= 0) {
                    this.spikeState = 'hidden';
                    this.currentSpikeHeight = 0;
                }
                break;
        }
    }

    onPlayerLand() {
        // Called when player lands on the platform
        if (this.cooldown <= 0 && !this.wasPlayerOn) {
            this.isPressed = true;
            this.cooldown = this.cooldownTime;

            // Trigger spikes with delay
            if (this.spikeState === 'hidden') {
                this.spikeState = 'waiting'; // Start waiting period
                this.spikeTimer = 0;
            }

            return true;
        }
        return false;
    }

    onPlayerLeave() {
        // Called when player leaves the platform
        this.wasPlayerOn = false;
    }

    areSpikesDangerous() {
        // Spikes are dangerous when rising or active
        return this.spikeState === 'rising' || this.spikeState === 'active';
    }

    reset() {
        this.isPressed = false;
        this.pressDepth = 0;
        this.cooldown = 0;
        this.wasPlayerOn = false;
        this.currentSpikeHeight = 0;
        this.spikeState = 'hidden';
        this.spikeTimer = 0;
    }
}
