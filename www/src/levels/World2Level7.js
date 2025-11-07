import { Platform } from '../entities/Platform.js';
import { GluePlatform } from '../entities/GluePlatform.js';

export class World2Level7 {
    constructor() {
        this.name = "World 2-7 - Sticky Situation";
        this.world = 2;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 1000, y: 250, width: 80, height: 100 };

        this.threeStarTime = 15;
        this.twoStarTime = 22;

        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(500, 450, 120, 20),
            new Platform(900, 350, 120, 20),
        ];

        this.gluePlatforms = [
            new GluePlatform(250, 600, 140, 20, 0.35),
            new GluePlatform(650, 520, 140, 20, 0.4),
            new GluePlatform(750, 420, 140, 20, 0.35),
        ];

        this.crumblingPlatforms = [
        ];

        this.spikes = [
            { x: 220, y: 620, width: 30, height: 30 },
            { x: 470, y: 470, width: 30, height: 30 },
            { x: 620, y: 540, width: 30, height: 30 },
            { x: 870, y: 370, width: 30, height: 30 },
        ];

        this.blackHoles = [
            {
                x: 450,
                y: 380,
                width: 60,
                height: 60,
                pullRadius: 300,
                pullStrength: 700,
                killRadius: 40
            },
        ];

        this.turrets = [
        ];

        this.movingSpikes = [
        ];
    }
}
