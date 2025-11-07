import { Platform } from '../entities/Platform.js';

export class World2Level1 {
    constructor() {
        this.name = "World 2-1";
        this.world = 2;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 1000, y: 450, width: 80, height: 100 };

        this.threeStarTime = 6;
        this.twoStarTime = 10;

        this.platforms = [
            new Platform(0, 650, 250, 50),
            new Platform(300, 600, 120, 20),
            new Platform(500, 550, 120, 20),
            new Platform(700, 500, 120, 20),
        ];

        this.gluePlatforms = [
        ];

        this.crumblingPlatforms = [
        ];

        this.blinkingPlatforms = [
        ];

        this.spikes = [
        ];

        this.blackHoles = [
            {
                x: 400,
                y: 400,
                width: 60,
                height: 60,
                pullRadius: 400,
                pullStrength: 800,
                killRadius: 40
            },
        ];

        this.turrets = [
        ];

        this.movingSpikes = [
        ];
    }
}
