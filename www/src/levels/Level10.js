import { Platform } from '../entities/Platform.js';
import { CrumblingPlatform } from '../entities/CrumblingPlatform.js';

export class Level10 {
    constructor() {
        this.name = "Level 10 - FINAL";
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 1050, y: 50, width: 80, height: 100 };
        
        this.threeStarTime = 20;
        this.twoStarTime = 30;
        
        this.platforms = [
            new Platform(0, 650, 150, 50)
            // KEINE Plattform unter Ziel
        ];
        
        this.crumblingPlatforms = [
            new CrumblingPlatform(200, 600, 70, 20),
            new CrumblingPlatform(320, 550, 70, 20),
            new CrumblingPlatform(440, 500, 70, 20),
            new CrumblingPlatform(560, 450, 70, 20),
            new CrumblingPlatform(440, 400, 70, 20),
            new CrumblingPlatform(560, 350, 70, 20),
            new CrumblingPlatform(680, 300, 70, 20),
            new CrumblingPlatform(800, 250, 70, 20),
            new CrumblingPlatform(920, 200, 70, 20),
            new CrumblingPlatform(800, 150, 70, 20),
            new CrumblingPlatform(920, 150, 70, 20)
        ];
        
        this.spikes = [
            { x: 220, y: 570, width: 30, height: 30 },
            { x: 340, y: 520, width: 30, height: 30 },
            { x: 460, y: 470, width: 30, height: 30 },
            { x: 580, y: 420, width: 30, height: 30 },
            { x: 700, y: 270, width: 30, height: 30 },
            { x: 820, y: 220, width: 30, height: 30 }
        ];
        
        this.movingSpikes = [
            {
                x: 300,
                y: 500,
                width: 40,
                height: 40,
                startX: 200,
                endX: 440,
                speed: 200,
                direction: 1
            },
            {
                x: 500,
                y: 350,
                width: 40,
                height: 40,
                startX: 440,
                endX: 680,
                speed: 220,
                direction: -1
            },
            {
                x: 750,
                y: 200,
                width: 40,
                height: 40,
                startX: 680,
                endX: 920,
                speed: 180,
                direction: 1
            }
        ];
    }
}
