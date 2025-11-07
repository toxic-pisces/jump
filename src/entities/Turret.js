export class Turret {
    constructor(x, y, shootDirection, fireRate = 2.0) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.shootDirection = shootDirection; // 'left', 'right', 'up', 'down'
        this.fireRate = fireRate; // Zeit zwischen Schüssen in Sekunden
        this.timeSinceLastShot = 0;
        this.isCharging = false;
        this.chargeProgress = 0;
        this.chargeDuration = 0.5; // 0.5 Sekunden Aufladung vor Schuss
    }

    update(deltaTime) {
        this.timeSinceLastShot += deltaTime;

        // Charging-Animation vor dem Schuss
        if (this.timeSinceLastShot >= this.fireRate - this.chargeDuration &&
            this.timeSinceLastShot < this.fireRate) {
            this.isCharging = true;
            this.chargeProgress = (this.timeSinceLastShot - (this.fireRate - this.chargeDuration)) / this.chargeDuration;
        } else {
            this.isCharging = false;
            this.chargeProgress = 0;
        }

        // Schuss abfeuern
        if (this.timeSinceLastShot >= this.fireRate) {
            this.timeSinceLastShot = 0;
            return this.createProjectile();
        }

        return null;
    }

    reset() {
        this.timeSinceLastShot = 0;
        this.isCharging = false;
        this.chargeProgress = 0;
    }

    createProjectile() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const speed = 300;

        let velocityX = 0;
        let velocityY = 0;
        let startX = centerX;
        let startY = centerY;

        switch(this.shootDirection) {
            case 'left':
                velocityX = -speed;
                startX = this.x;
                break;
            case 'right':
                velocityX = speed;
                startX = this.x + this.width;
                break;
            case 'up':
                velocityY = -speed;
                startY = this.y;
                break;
            case 'down':
                velocityY = speed;
                startY = this.y + this.height;
                break;
        }

        return {
            x: startX,
            y: startY,
            width: 16,
            height: 16,
            velocityX: velocityX,
            velocityY: velocityY,
            lifetime: 5.0 // Projektil verschwindet nach 5 Sekunden
        };
    }
}
