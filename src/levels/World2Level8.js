import { Platform } from '../entities/Platform.js';
import { GluePlatform } from '../entities/GluePlatform.js';
import { CrumblingPlatform } from '../entities/CrumblingPlatform.js';
import { Turret } from '../entities/Turret.js';

export class World2Level8 {
    constructor() {
        this.name = "World 2-8 - Chaos Theory";
        this.world = 2;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 600, y: 100, width: 80, height: 100 };

        this.threeStarTime = 20;
        this.twoStarTime = 30;

        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(950, 520, 120, 20),
        ];

        this.gluePlatforms = [
            new GluePlatform(250, 600, 120, 20, 0.3),
            new GluePlatform(800, 450, 120, 20, 0.35),
            new GluePlatform(520, 220, 80, 20, 0.4),
        ];

        this.crumblingPlatforms = [
            new CrumblingPlatform(420, 550, 100, 20),
            new CrumblingPlatform(600, 480, 100, 20),
            new CrumblingPlatform(450, 380, 100, 20),
            new CrumblingPlatform(700, 310, 100, 20),
        ];

        this.spikes = [
            { x: 220, y: 620, width: 30, height: 30 },
            { x: 390, y: 570, width: 30, height: 30 },
            { x: 920, y: 540, width: 30, height: 30 },
            { x: 670, y: 330, width: 30, height: 30 },
        ];

        this.blackHoles = [
            {
                x: 700,
                y: 200,
                width: 60,
                height: 60,
                pullRadius: 280,
                pullStrength: 720,
                killRadius: 40
            },
            {
                x: 320,
                y: 340,
                width: 60,
                height: 60,
                pullRadius: 350,
                pullStrength: 800,
                killRadius: 40
            },
        ];

        this.turrets = [
            new Turret(350, 510, 'right', 1.1),
            new Turret(700, 440, 'left', 1.0),
            new Turret(840, 400, 'left', 1.25),
            new Turret(550, 290, 'up', 1.4),
        ];

        this.movingSpikes = [
            {
                x: 500,
                y: 480,
                width: 40,
                height: 40,
                startX: 420,
                endX: 700,
                speed: 180,
                direction: 1
            },
        ];
    }
}
