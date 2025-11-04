import { Platform } from '../entities/Platform.js';
import { Turret } from '../entities/Turret.js';

export class World2Level4 {
    constructor() {
        this.name = "World 2-4 - Turret Introduction";
        this.world = 2;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 1050, y: 200, width: 80, height: 100 };

        this.threeStarTime = 12;
        this.twoStarTime = 18;

        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(300, 600, 120, 20),
            new Platform(500, 500, 120, 20),
            new Platform(700, 400, 120, 20),
            new Platform(900, 300, 120, 20),
        ];

        this.gluePlatforms = [
        ];

        this.crumblingPlatforms = [
        ];

        this.spikes = [
            { x: 270, y: 620, width: 30, height: 30 },
            { x: 670, y: 420, width: 30, height: 30 },
        ];

        this.blackHoles = [
        ];

        this.turrets = [
            new Turret(400, 560, 'left', 1),
            new Turret(600, 460, 'right', 1),
            new Turret(800, 360, 'down', 1),
        ];

        this.movingSpikes = [
        ];
    }
}
