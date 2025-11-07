import { Platform } from '../entities/Platform.js';

export class Level2 {
    constructor() {
        this.name = "Level 2 - First Jump";
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 950, y: 400, width: 80, height: 100 };
        
        this.threeStarTime = 6;
        this.twoStarTime = 10;
        
        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(280, 600, 100, 20),
            new Platform(450, 550, 100, 20),
            new Platform(350, 450, 100, 20),
            new Platform(550, 400, 100, 20),
            new Platform(750, 450, 100, 20)
        ];
        
        this.spikes = [
            { x: 220, y: 620, width: 30, height: 30 },
            { x: 400, y: 570, width: 30, height: 30 }
        ];
        
        this.movingSpikes = [];
    }
}
