import { Platform } from '../entities/Platform.js';

export class Level4 {
    constructor() {
        this.name = "Level 4 - Moving Threat";
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 900, y: 350, width: 80, height: 100 };
        
        this.threeStarTime = 10;
        this.twoStarTime = 15;
        
        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(300, 600, 100, 20),
            new Platform(500, 550, 100, 20),
            new Platform(300, 450, 100, 20),
            new Platform(600, 400, 100, 20)
        ];
        
        this.spikes = [
            { x: 220, y: 620, width: 30, height: 30 },
            { x: 420, y: 570, width: 30, height: 30 },
            { x: 520, y: 420, width: 30, height: 30 }
        ];
        
        this.movingSpikes = [
            {
                x: 400,
                y: 500,
                width: 40,
                height: 40,
                startX: 300,
                endX: 600,
                speed: 150,
                direction: 1
            },
            {
                x: 700,
                y: 380,
                width: 40,
                height: 40,
                startX: 600,
                endX: 850,
                speed: 120,
                direction: -1
            }
        ];
    }
}
