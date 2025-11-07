import { Platform } from '../entities/Platform.js';
import { GluePlatform } from '../entities/GluePlatform.js';

export class World2Level9 {
    constructor() {
        this.name = "World 2-9 - FINAL CHAOS";
        this.world = 2;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 240, y: 600, width: 80, height: 100 };

        this.threeStarTime = 30;
        this.twoStarTime = 45;

        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(160, 540, 40, 120),
        ];

        this.gluePlatforms = [
            new GluePlatform(160, 500, 440, 40, 0.4),
            new GluePlatform(400, 640, 160, 40, 0.4),
            new GluePlatform(240, 100, 80, 400, 0.4),
            new GluePlatform(320, 100, 280, 60, 0.4),
            new GluePlatform(320, 280, 200, 60, 0.4),
            new GluePlatform(640, 260, 320, 40, 0.4),
            new GluePlatform(900, 300, 60, 40, 0.4),
            new GluePlatform(840, 340, 60, 40, 0.4),
            new GluePlatform(780, 380, 60, 40, 0.4),
            new GluePlatform(720, 420, 60, 40, 0.4),
            new GluePlatform(660, 460, 60, 40, 0.4),
            new GluePlatform(660, 500, 320, 40, 0.4),
        ];

        this.crumblingPlatforms = [
        ];

        this.spikes = [
            { x: 540, y: 440, width: 60, height: 60 },
            { x: 740, y: 220, width: 40, height: 40 },
            { x: 880, y: 460, width: 40, height: 40 },
            { x: 460, y: 620, width: 40, height: 20 },
            { x: 340, y: 440, width: 40, height: 60 },
            { x: 180, y: 440, width: 60, height: 60 },
        ];

        this.blackHoles = [
        ];

        this.turrets = [
        ];

        this.movingSpikes = [
        ];
    }
}
