import { Platform } from '../entities/Platform.js';
import { MovingPlatform } from '../entities/MovingPlatform.js';
import { Turret } from '../entities/Turret.js';

export class World3Level5 {
    constructor() {
        this.name = "World 3-5";
        this.world = 3;
        this.start = { x: 40, y: 540, width: 80, height: 100 };
        this.goal = { x: 1050, y: 100, width: 80, height: 100 };

        this.threeStarTime = 5;
        this.twoStarTime = 10;

        this.platforms = [
            new Platform(0, 650, 200, 50),
        ];

        this.gluePlatforms = [
        ];

        this.crumblingPlatforms = [
        ];

        this.blinkingPlatforms = [
        ];

        this.movingPlatforms = [
            new MovingPlatform(240, 360, 100, 20, 'vertical', 250, 90),
            new MovingPlatform(450, 550, 120, 20, 'horizontal', 180, 100),
            new MovingPlatform(760, 360, 100, 20, 'vertical', 300, 110),
            new MovingPlatform(440, 240, 80, 20, 'horizontal', 200, 100),
        ];

        this.pressurePlatforms = [
        ];

        this.triggeredSpikes = [
        ];

        this.spikes = [
            { x: 450, y: 600, width: 200, height: 20 },
            { x: 380, y: 400, width: 30, height: 30 },
            { x: 540, y: 280, width: 80, height: 180 },
            { x: 960, y: 200, width: 160, height: 40 },
            { x: 240, y: 280, width: 140, height: 40 },
            { x: 160, y: 600, width: 40, height: 40 },
            { x: 220, y: 660, width: 200, height: 40 },
            { x: 680, y: 540, width: 40, height: 80 },
            { x: 20, y: 400, width: 200, height: 60 },
            { x: 900, y: 120, width: 40, height: 120 },
            { x: 300, y: 40, width: 320, height: 60 },
            { x: 100, y: 80, width: 100, height: 220 },
            { x: 460, y: 640, width: 280, height: 60 },
            { x: 780, y: 580, width: 60, height: 120 },
            { x: 940, y: 300, width: 220, height: 380 },
            { x: 0, y: 20, width: 80, height: 300 },
            { x: 120, y: 20, width: 160, height: 40 },
        ];

        this.blackHoles = [
        ];

        this.turrets = [
            new Turret(200, 200, 'right', 2.5),
        ];

        this.movingSpikes = [
        ];
    }
}
