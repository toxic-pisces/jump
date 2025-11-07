import { Platform } from '../entities/Platform.js';
import { GluePlatform } from '../entities/GluePlatform.js';
import { MovingPlatform } from '../entities/MovingPlatform.js';
import { Turret } from '../entities/Turret.js';

export class World3Level4 {
    constructor() {
        this.name = "World 3-4";
        this.world = 3;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 1050, y: 250, width: 80, height: 100 };

        this.threeStarTime = 4;
        this.twoStarTime = 8;

        this.platforms = [
            new Platform(0, 650, 200, 50),
        ];

        this.gluePlatforms = [
            new GluePlatform(280, 40, 40, 120, 0.4),
            new GluePlatform(500, 40, 40, 40, 0.4),
            new GluePlatform(800, 40, 40, 80, 0.4),
        ];

        this.crumblingPlatforms = [
        ];

        this.blinkingPlatforms = [
        ];

        this.movingPlatforms = [
            new MovingPlatform(250, 600, 120, 20, 'horizontal', 200, 80),
            new MovingPlatform(550, 500, 120, 20, 'horizontal', 150, 100),
        ];

        this.pressurePlatforms = [
        ];

        this.triggeredSpikes = [
        ];

        this.spikes = [
            { x: 200, y: 660, width: 220, height: 40 },
            { x: 460, y: 660, width: 200, height: 40 },
            { x: 700, y: 660, width: 260, height: 40 },
            { x: 1000, y: 660, width: 200, height: 40 },
            { x: 0, y: 0, width: 1200, height: 40 },
            { x: 1160, y: 40, width: 40, height: 620 },
            { x: 0, y: 40, width: 40, height: 600 },
        ];

        this.blackHoles = [
        ];

        this.turrets = [
            new Turret(280, 160, 'down', 2),
            new Turret(500, 80, 'down', 2),
            new Turret(800, 120, 'down', 2),
            new Turret(960, 660, 'up', 1.5),
            new Turret(660, 660, 'up', 1.5),
            new Turret(420, 660, 'up', 1.5),
        ];

        this.movingSpikes = [
        ];
    }
}
