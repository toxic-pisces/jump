export class BlinkingPlatform {
    constructor(x, y, width, height, interval = 2.0, startVisible = true) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.interval = interval; // Time in seconds for full cycle
        this.startVisible = startVisible;
        this.timer = 0;
        this.isVisible = startVisible;
        this.opacity = startVisible ? 1 : 0;
        this.isWarning = false;
        this.warningDuration = 0.3; // Warning flash before disappearing/appearing
    }

    update(deltaTime) {
        this.timer += deltaTime;
        
        // Calculate phase (0 to 1 through the full interval)
        const phase = (this.timer % this.interval) / this.interval;
        
        // Determine if we're in warning phase
        const halfCycle = this.interval / 2;
        const timeInHalf = this.timer % halfCycle;
        const warningTime = this.warningDuration;
        
        // Check if we should be visible
        const shouldBeVisible = Math.floor((this.timer % this.interval) / halfCycle) === 0;
        
        // Warning flash before state change
        if (timeInHalf > (halfCycle - warningTime)) {
            this.isWarning = true;
            // Flash opacity during warning
            const flashSpeed = 15;
            this.opacity = 0.3 + 0.7 * Math.abs(Math.sin(this.timer * flashSpeed));
        } else {
            this.isWarning = false;
            // Smoothly transition to target state
            if (shouldBeVisible) {
                this.opacity = Math.min(1, this.opacity + deltaTime * 4);
                this.isVisible = this.opacity > 0.5;
            } else {
                this.opacity = Math.max(0, this.opacity - deltaTime * 4);
                this.isVisible = this.opacity > 0.5;
            }
        }
    }

    reset() {
        this.timer = 0;
        this.isVisible = this.startVisible;
        this.opacity = this.startVisible ? 1 : 0;
        this.isWarning = false;
    }

    // For collision detection - only collide when visible
    canCollide() {
        return this.isVisible;
    }
}
