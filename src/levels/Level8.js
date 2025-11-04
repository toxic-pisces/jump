import { Platform } from '../entities/Platform.js';
import { CrumblingPlatform } from '../entities/CrumblingPlatform.js';

export class Level8 {
    constructor() {
        this.name = "Level 8 - Gauntlet";
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 600, y: 150, width: 80, height: 100 };
        
        this.threeStarTime = 16;
        this.twoStarTime = 24;
        
        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(1000, 550, 200, 50)
            // Ziel-Plattform entfernt
        ];
        
        this.crumblingPlatforms = [
            new CrumblingPlatform(280, 600, 90, 20),
            new CrumblingPlatform(430, 550, 90, 20),
            new CrumblingPlatform(580, 500, 90, 20),
            new CrumblingPlatform(730, 450, 90, 20),
            new CrumblingPlatform(880, 400, 90, 20),
            new CrumblingPlatform(730, 330, 90, 20),
            new CrumblingPlatform(580, 270, 90, 20)
        ];
        
        this.spikes = [
            { x: 220, y: 620, width: 30, height: 30 },
            { x: 400, y: 570, width: 30, height: 30 },
            { x: 700, y: 470, width: 30, height: 30 },
            { x: 550, y: 290, width: 30, height: 30 }
        ];
        
        this.movingSpikes = [
            {
                x: 350,
                y: 500,
                width: 40,
                height: 40,
                startX: 280,
                endX: 580,
                speed: 180,
                direction: 1
            },
            {
                x: 650,
                y: 350,
                width: 40,
                height: 40,
                startX: 430,
                endX: 730,
                speed: 200,
                direction: -1
            }
        ];
    }
}
