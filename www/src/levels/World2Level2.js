import { Platform } from '../entities/Platform.js';

export class World2Level2 {
    constructor() {
        this.name = "World 2-2";
        this.world = 2;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 950, y: 350, width: 80, height: 100 };

        this.threeStarTime = 8;
        this.twoStarTime = 12;

        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(280, 600, 100, 20),
            new Platform(450, 550, 100, 20),
            new Platform(350, 450, 100, 20),
            new Platform(600, 400, 100, 20),
        ];

        this.gluePlatforms = [
        ];

        this.crumblingPlatforms = [
        ];

        this.blinkingPlatforms = [
        ];

        this.spikes = [
            { x: 220, y: 620, width: 30, height: 30 },
        ];

        this.blackHoles = [
            {
                x: 350,
                y: 350,
                width: 60,
                height: 60,
                pullRadius: 380,
                pullStrength: 750,
                killRadius: 40
            },
            {
                x: 700,
                y: 280,
                width: 60,
                height: 60,
                pullRadius: 380,
                pullStrength: 750,
                killRadius: 40
            },
        ];

        this.turrets = [
        ];

        this.movingSpikes = [
        ];
    }
}
