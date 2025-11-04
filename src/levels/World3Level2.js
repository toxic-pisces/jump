import { Platform } from '../entities/Platform.js';
import { CrumblingPlatform } from '../entities/CrumblingPlatform.js';
import { BlinkingPlatform } from '../entities/BlinkingPlatform.js';
import { Turret } from '../entities/Turret.js';

export class World3Level2 {
    constructor() {
        this.name = "World 3-2";
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 700, y: 150, width: 80, height: 100 };

        this.threeStarTime = 10;
        this.twoStarTime = 15;

        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(350, 500, 100, 20),
        ];

        this.gluePlatforms = [
        ];

        this.crumblingPlatforms = [
            new CrumblingPlatform(680, 260, 120, 20),
        ];

        this.blinkingPlatforms = [
            new BlinkingPlatform(200, 550, 80, 20, 1.8, true),
            new BlinkingPlatform(500, 550, 80, 20, 1.8, false),
            new BlinkingPlatform(250, 400, 80, 20, 1.6, true),
            new BlinkingPlatform(450, 350, 80, 20, 1.6, false),
            new BlinkingPlatform(550, 250, 80, 20, 1.8, true),
        ];

        this.spikes = [
            { x: 330, y: 520, width: 30, height: 30 },
            { x: 580, y: 570, width: 30, height: 30 },
        ];

        this.blackHoles = [
        ];

        this.turrets = [
            new Turret(280, 140, 'down', 1.5),
            new Turret(480, 140, 'down', 1.5),
            new Turret(580, 20, 'down', 1.5),
        ];

        this.movingSpikes = [
        ];
    }
}
