import { Platform } from '../entities/Platform.js';
import { CrumblingPlatform } from '../entities/CrumblingPlatform.js';

export class Level6 {
    constructor() {
        this.name = "Level 6 - Crumble Run";
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 900, y: 300, width: 80, height: 100 };
        
        this.threeStarTime = 12;
        this.twoStarTime = 18;
        
        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(850, 450, 150, 20)
            // Ziel-Plattform entfernt
        ];
        
        this.crumblingPlatforms = [
            new CrumblingPlatform(280, 600, 100, 20),
            new CrumblingPlatform(450, 530, 100, 20),
            new CrumblingPlatform(620, 460, 100, 20),
            new CrumblingPlatform(470, 380, 100, 20),
            new CrumblingPlatform(640, 380, 100, 20)
        ];
        
        this.spikes = [
            { x: 220, y: 620, width: 30, height: 30 },
            { x: 590, y: 480, width: 30, height: 30 }
        ];
        
        this.movingSpikes = [];
    }
}
