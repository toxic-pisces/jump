import { Platform } from '../entities/Platform.js';
import { GluePlatform } from '../entities/GluePlatform.js';
import { BlinkingPlatform } from '../entities/BlinkingPlatform.js';
import { PressurePlatform } from '../entities/PressurePlatform.js';
import { Turret } from '../entities/Turret.js';

export class World3Level7 {
    constructor() {
        this.name = "World 3 - Level 7";
        this.world = 3;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 600, y: 120, width: 80, height: 100 };

        this.threeStarTime = 6;
        this.twoStarTime = 8;

        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(680, 0, 40, 240),
            new Platform(0, 0, 680, 100),
            new Platform(340, 100, 180, 40),
            new Platform(520, 100, 20, 40),
            new Platform(0, 80, 380, 100),
            new Platform(0, 180, 80, 340),
            new Platform(200, 680, 880, 20),
            new Platform(380, 640, 480, 40),
            new Platform(540, 600, 320, 40),
            new Platform(1040, 0, 160, 680),
            new Platform(1080, 680, 120, 20),
        ];

        this.gluePlatforms = [
            new GluePlatform(800, 240, 60, 360, 0.4),
        ];

        this.crumblingPlatforms = [
        ];

        this.blinkingPlatforms = [
            new BlinkingPlatform(860, 240, 180, 20, 2, true),
            new BlinkingPlatform(860, 380, 180, 20, 2, true),
            new BlinkingPlatform(860, 540, 180, 20, 2, true),
        ];

        this.movingPlatforms = [
        ];

        this.pressurePlatforms = [
            new PressurePlatform(380, 600, 160, 40),
            new PressurePlatform(540, 560, 140, 40),
            new PressurePlatform(200, 640, 180, 40),
            new PressurePlatform(380, 440, 160, 40),
            new PressurePlatform(540, 400, 140, 40),
            new PressurePlatform(200, 480, 180, 40),
            new PressurePlatform(540, 240, 140, 40),
            new PressurePlatform(380, 280, 160, 40),
            new PressurePlatform(200, 320, 180, 40),
            new PressurePlatform(80, 480, 120, 40),
        ];

        this.triggeredSpikes = [
        ];

        this.spikes = [
            { x: 680, y: 560, width: 120, height: 40 },
            { x: 860, y: 640, width: 180, height: 40 },
            { x: 920, y: 0, width: 40, height: 60 },
            { x: 1000, y: 0, width: 40, height: 60 },
            { x: 920, y: 160, width: 40, height: 80 },
            { x: 920, y: 340, width: 40, height: 40 },
            { x: 920, y: 500, width: 40, height: 40 },
            { x: 680, y: 240, width: 60, height: 40 },
            { x: 720, y: 0, width: 20, height: 240 },
            { x: 740, y: 0, width: 140, height: 60 },
        ];

        this.blackHoles = [
        ];

        this.turrets = [
            new Turret(880, 20, 'down', 1.5),
            new Turret(960, 20, 'down', 2.5),
        ];

        this.movingSpikes = [
        ];
    }
}
