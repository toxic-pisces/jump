import { Platform } from '../entities/Platform.js';
import { PressurePlatform } from '../entities/PressurePlatform.js';

export class World3Level9 {
    constructor() {
        this.name = "World 3 - Level 9";
        this.world = 3;
        this.start = { x: 0, y: 560, width: 80, height: 100 };
        this.goal = { x: 1140, y: 560, width: 80, height: 100 };

        this.threeStarTime = 7;
        this.twoStarTime = 14;

        this.platforms = [
            new Platform(0, 660, 40, 40),
        ];

        this.gluePlatforms = [
        ];

        this.crumblingPlatforms = [
        ];

        this.blinkingPlatforms = [
        ];

        this.movingPlatforms = [
        ];

        this.pressurePlatforms = [
            new PressurePlatform(40, 660, 1160, 40),
        ];

        this.triggeredSpikes = [
        ];

        this.spikes = [
            { x: 440, y: 120, width: 120, height: 20 },
            { x: 440, y: 140, width: 20, height: 120 },
            { x: 460, y: 240, width: 100, height: 20 },
            { x: 540, y: 200, width: 20, height: 40 },
            { x: 480, y: 200, width: 60, height: 20 },
            { x: 620, y: 120, width: 120, height: 20 },
            { x: 620, y: 140, width: 20, height: 120 },
            { x: 640, y: 240, width: 100, height: 20 },
            { x: 720, y: 200, width: 20, height: 40 },
            { x: 680, y: 200, width: 40, height: 20 },
        ];

        this.blackHoles = [
            {
                x: 120,
                y: 80,
                width: 60,
                height: 60,
                pullRadius: 350,
                pullStrength: 800,
                killRadius: 40
            },
            {
                x: 1020,
                y: 80,
                width: 60,
                height: 60,
                pullRadius: 350,
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
