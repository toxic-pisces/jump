export class TriggeredSpikes {
    constructor(x, y, width, height, id = null, riseTime = 0.3, stayTime = 2.0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.id = id; // Unique ID to link with pressure plates

        // Original position
        this.baseY = y;
        this.hiddenY = y + height; // Position when fully retracted

        // Animation properties
        this.currentY = this.hiddenY; // Start hidden
        this.riseTime = riseTime; // Time to rise (seconds)
        this.stayTime = stayTime; // Time to stay up (seconds)
        this.fallTime = 0.3; // Time to fall back down (seconds)

        // State machine
        this.state = 'hidden'; // 'hidden', 'rising', 'active', 'falling'
        this.stateTimer = 0;

        // Rise/fall speed
        this.riseSpeed = this.height / this.riseTime;
        this.fallSpeed = this.height / this.fallTime;
    }

    trigger() {
        // Trigger the spikes to rise
        if (this.state === 'hidden') {
            this.state = 'rising';
            this.stateTimer = 0;
        } else if (this.state === 'falling') {
            // If falling, reverse and start rising again
            this.state = 'rising';
            this.stateTimer = 0;
        }
    }

    update(deltaTime) {
        this.stateTimer += deltaTime;

        switch (this.state) {
            case 'hidden':
                this.currentY = this.hiddenY;
                break;

            case 'rising':
                // Move spikes up
                this.currentY = Math.max(
                    this.currentY - this.riseSpeed * deltaTime,
                    this.baseY
                );

                // Check if fully risen
                if (this.currentY <= this.baseY) {
                    this.currentY = this.baseY;
                    this.state = 'active';
                    this.stateTimer = 0;
                }
                break;

            case 'active':
                // Stay up for a while
                this.currentY = this.baseY;
                if (this.stateTimer >= this.stayTime) {
                    this.state = 'falling';
                    this.stateTimer = 0;
                }
                break;

            case 'falling':
                // Move spikes down
                this.currentY = Math.min(
                    this.currentY + this.fallSpeed * deltaTime,
                    this.hiddenY
                );

                // Check if fully hidden
                if (this.currentY >= this.hiddenY) {
                    this.currentY = this.hiddenY;
                    this.state = 'hidden';
                    this.stateTimer = 0;
                }
                break;
        }

        // Update actual Y position for collision
        this.y = this.currentY;
    }

    isActive() {
        // Spikes are dangerous when rising or active
        return this.state === 'rising' || this.state === 'active';
    }

    getVisibleHeight() {
        // Calculate how much of the spike is visible
        return Math.max(0, this.hiddenY - this.currentY);
    }

    reset() {
        this.state = 'hidden';
        this.stateTimer = 0;
        this.currentY = this.hiddenY;
        this.y = this.hiddenY;
    }
}
