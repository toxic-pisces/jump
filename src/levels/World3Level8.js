import { Platform } from '../entities/Platform.js';
import { GluePlatform } from '../entities/GluePlatform.js';
import { BlinkingPlatform } from '../entities/BlinkingPlatform.js';
import { PressurePlatform } from '../entities/PressurePlatform.js';
import { Turret } from '../entities/Turret.js';

export class World3Level8 {
    constructor() {
        this.name = "World 3 - Level 8";
        this.world = 3;
        this.start = { x: 20, y: 100, width: 80, height: 100 };
        this.goal = { x: 280, y: 380, width: 80, height: 100 };

        this.threeStarTime = 15;
        this.twoStarTime = 25;

        this.platforms = [
            new Platform(340, 0, 860, 60),
            new Platform(380, 60, 820, 40),
            new Platform(540, 100, 660, 40),
            new Platform(700, 140, 500, 40),
            new Platform(860, 180, 340, 40),
            new Platform(1000, 220, 200, 40),
            new Platform(0, 680, 1200, 20),
            new Platform(240, 600, 960, 80),
            new Platform(700, 420, 300, 40),
            new Platform(560, 380, 300, 40),
            new Platform(400, 340, 300, 40),
            new Platform(240, 300, 320, 40),
            new Platform(240, 260, 160, 40),
            new Platform(560, 520, 20, 60),
            new Platform(560, 580, 20, 20),
            new Platform(0, 0, 340, 40),
        ];

        this.gluePlatforms = [
            new GluePlatform(180, 100, 60, 580, 0.4),
        ];

        this.crumblingPlatforms = [
        ];

        this.blinkingPlatforms = [
            new BlinkingPlatform(1000, 420, 200, 20, 2, true),
            new BlinkingPlatform(1000, 360, 200, 20, 2, true),
            new BlinkingPlatform(980, 460, 20, 100, 2, true),
            new BlinkingPlatform(560, 420, 20, 100, 2, true),
            new BlinkingPlatform(180, 40, 60, 60, 2, true),
        ];

        this.movingPlatforms = [
        ];

        this.pressurePlatforms = [
            new PressurePlatform(0, 600, 180, 80),
            new PressurePlatform(240, 200, 160, 60),
            new PressurePlatform(400, 240, 160, 60),
            new PressurePlatform(560, 280, 140, 60),
            new PressurePlatform(700, 320, 160, 60),
            new PressurePlatform(860, 360, 140, 60),
            new PressurePlatform(240, 560, 320, 40),
            new PressurePlatform(580, 560, 420, 40),
        ];

        this.triggeredSpikes = [
        ];

        this.spikes = [
        ];

        this.blackHoles = [
        ];

        this.turrets = [
            new Turret(340, 60, 'down', 1.5),
            new Turret(660, 140, 'down', 1.5),
            new Turret(820, 180, 'down', 1.5),
            new Turret(960, 220, 'down', 1.5),
            new Turret(500, 100, 'down', 1.5),
        ];

        this.movingSpikes = [
        ];
    }
}
