import { Platform } from '../entities/Platform.js';

export class Level5 {
    constructor() {
        this.name = "Level 5 - Precision";
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 100, y: 150, width: 80, height: 100 };
        
        this.threeStarTime = 12;
        this.twoStarTime = 18;
        
        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(250, 600, 80, 20),
            new Platform(400, 550, 80, 20),
            new Platform(550, 480, 80, 20),
            new Platform(400, 400, 80, 20),
            new Platform(250, 320, 80, 20),
            new Platform(400, 240, 80, 20)
        ];
        
        this.spikes = [
            { x: 220, y: 620, width: 30, height: 30 },
            { x: 370, y: 570, width: 30, height: 30 },
            { x: 520, y: 500, width: 30, height: 30 },
            { x: 370, y: 420, width: 30, height: 30 },
            { x: 220, y: 340, width: 30, height: 30 }
        ];
        
        this.movingSpikes = [
            {
                x: 300,
                y: 450,
                width: 40,
                height: 40,
                startX: 250,
                endX: 550,
                speed: 180,
                direction: 1
            }
        ];
    }
}
