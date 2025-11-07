export class MovingPlatform {
    constructor(x, y, width, height, direction = 'horizontal', distance = 200, speed = 100) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Movement properties
        this.direction = direction; // 'horizontal' or 'vertical'
        this.distance = distance; // How far the platform moves
        this.speed = speed; // Speed in pixels per second

        // Store initial position
        this.startX = x;
        this.startY = y;

        // Calculate end position based on direction
        if (direction === 'horizontal') {
            this.endX = x + distance;
            this.endY = y;
        } else if (direction === 'vertical') {
            this.endX = x;
            this.endY = y + distance;
        }

        // Current movement direction (1 = forward, -1 = backward)
        this.moveDirection = 1;
    }

    update(deltaTime) {
        if (this.direction === 'horizontal') {
            // Move horizontally
            this.x += this.speed * this.moveDirection * deltaTime;

            // Check bounds and reverse direction
            if (this.x <= this.startX) {
                this.x = this.startX;
                this.moveDirection = 1;
            } else if (this.x >= this.endX) {
                this.x = this.endX;
                this.moveDirection = -1;
            }
        } else if (this.direction === 'vertical') {
            // Move vertically
            this.y += this.speed * this.moveDirection * deltaTime;

            // Check bounds and reverse direction
            if (this.y <= this.startY) {
                this.y = this.startY;
                this.moveDirection = 1;
            } else if (this.y >= this.endY) {
                this.y = this.endY;
                this.moveDirection = -1;
            }
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.moveDirection = 1;
    }

    // Get the velocity of the platform (for player physics)
    getVelocityX(deltaTime) {
        if (this.direction === 'horizontal') {
            return this.speed * this.moveDirection;
        }
        return 0;
    }

    getVelocityY(deltaTime) {
        if (this.direction === 'vertical') {
            return this.speed * this.moveDirection;
        }
        return 0;
    }
}
