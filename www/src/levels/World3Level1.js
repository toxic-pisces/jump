import { Platform } from '../entities/Platform.js';
import { BlinkingPlatform } from '../entities/BlinkingPlatform.js';

export class World3Level1 {
    constructor() {
        this.name = "World 3-1";
        this.world = 3;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 700, y: 200, width: 80, height: 100 };

        this.threeStarTime = 8;
        this.twoStarTime = 12;

        this.platforms = [
            new Platform(0, 650, 200, 50),
        ];

        this.gluePlatforms = [
        ];

        this.crumblingPlatforms = [
        ];

        this.blinkingPlatforms = [
            new BlinkingPlatform(250, 550, 100, 20, 2, true),
            new BlinkingPlatform(400, 450, 100, 20, 2, false),
            new BlinkingPlatform(550, 350, 100, 20, 2, true),
        ];

        this.movingPlatforms = [
        ];

        this.spikes = [
        ];

        this.blackHoles = [
        ];

        this.turrets = [
        ];

        this.movingSpikes = [
        ];
    }
}
