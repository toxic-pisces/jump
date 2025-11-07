import { Platform } from '../entities/Platform.js';
import { CrumblingPlatform } from '../entities/CrumblingPlatform.js';

export class Level7 {
    constructor() {
        this.name = "Level 7 - Speed Test";
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 550, y: 100, width: 80, height: 100 };
        
        this.threeStarTime = 15;
        this.twoStarTime = 22;
        
        this.platforms = [
            new Platform(0, 650, 200, 50)
            // Ziel-Plattform entfernt
        ];
        
        this.crumblingPlatforms = [
            new CrumblingPlatform(250, 600, 100, 20),
            new CrumblingPlatform(400, 530, 100, 20),
            new CrumblingPlatform(550, 460, 100, 20),
            new CrumblingPlatform(700, 390, 100, 20),
            new CrumblingPlatform(850, 320, 100, 20),
            new CrumblingPlatform(700, 250, 100, 20),
            new CrumblingPlatform(550, 200, 100, 20)
        ];
        
        this.spikes = [
            { x: 220, y: 620, width: 30, height: 30 },
            { x: 370, y: 550, width: 30, height: 30 },
            { x: 670, y: 410, width: 30, height: 30 }
        ];
        
        this.movingSpikes = [
            {
                x: 600,
                y: 350,
                width: 40,
                height: 40,
                startX: 500,
                endX: 800,
                speed: 200,
                direction: 1
            }
        ];
    }
}
