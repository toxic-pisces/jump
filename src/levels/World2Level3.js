import { Platform } from '../entities/Platform.js';

export class World2Level3 {
    constructor() {
        this.name = "World 2-3";
        this.world = 2;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 600, y: 150, width: 80, height: 100 };

        this.threeStarTime = 10;
        this.twoStarTime = 15;

        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(250, 600, 120, 20),
            new Platform(450, 550, 120, 20),
            new Platform(300, 450, 120, 20),
            new Platform(500, 350, 120, 20),
            new Platform(350, 250, 120, 20),
        ];

        this.gluePlatforms = [
        ];

        this.crumblingPlatforms = [
        ];

        this.spikes = [
            { x: 220, y: 620, width: 30, height: 30 },
            { x: 420, y: 570, width: 30, height: 30 },
        ];

        this.blackHoles = [
            {
                x: 380,
                y: 500,
                width: 60,
                height: 60,
                pullRadius: 400,
                pullStrength: 850,
                killRadius: 40
            },
            {
                x: 450,
                y: 300,
                width: 60,
                height: 60,
                pullRadius: 400,
                pullStrength: 850,
                killRadius: 40
            },
        ];

        this.turrets = [
        ];

        this.movingSpikes = [
        ];
    }
}
