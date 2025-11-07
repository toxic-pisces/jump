import { Platform } from '../entities/Platform.js';
import { CrumblingPlatform } from '../entities/CrumblingPlatform.js';
import { BlinkingPlatform } from '../entities/BlinkingPlatform.js';
import { MovingPlatform } from '../entities/MovingPlatform.js';

export class World3Level6 {
    constructor() {
        this.name = "World 3-6";
        this.world = 3;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 50, y: 50, width: 80, height: 100 };

        this.threeStarTime = 9;
        this.twoStarTime = 15;

        this.platforms = [
            new Platform(0, 650, 200, 50),
        ];

        this.gluePlatforms = [
        ];

        this.crumblingPlatforms = [
            new CrumblingPlatform(680, 260, 60, 20),
        ];

        this.blinkingPlatforms = [
            new BlinkingPlatform(160, 40, 20, 180, 2, true),
            new BlinkingPlatform(0, 200, 160, 20, 2, true),
            new BlinkingPlatform(480, 120, 20, 80, 2, true),
            new BlinkingPlatform(660, 120, 20, 80, 2, true),
            new BlinkingPlatform(260, 120, 20, 80, 2, true),
        ];

        this.movingPlatforms = [
            new MovingPlatform(250, 600, 100, 20, 'horizontal', 200, 120),
            new MovingPlatform(560, 320, 100, 20, 'vertical', 300, 100),
            new MovingPlatform(320, 200, 120, 20, 'horizontal', 200, 100),
            new MovingPlatform(800, 560, 100, 20, 'horizontal', 200, 100),
            new MovingPlatform(780, 360, 120, 20, 'horizontal', 200, 100),
            new MovingPlatform(820, 120, 100, 20, 'horizontal', 200, 100),
        ];

        this.pressurePlatforms = [
        ];

        this.triggeredSpikes = [
        ];

        this.spikes = [
            { x: 470, y: 600, width: 50, height: 20 },
            { x: 250, y: 280, width: 180, height: 20 },
            { x: 500, y: 460, width: 240, height: 20 },
            { x: 480, y: 280, width: 260, height: 20 },
            { x: 500, y: 620, width: 220, height: 20 },
            { x: 260, y: 540, width: 40, height: 40 },
            { x: 980, y: 500, width: 40, height: 40 },
            { x: 940, y: 280, width: 60, height: 40 },
            { x: 600, y: 60, width: 40, height: 40 },
            { x: 20, y: 480, width: 140, height: 40 },
        ];

        this.blackHoles = [
        ];

        this.turrets = [
        ];

        this.movingSpikes = [
        ];
    }
}
