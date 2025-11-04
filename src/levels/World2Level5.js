import { Platform } from '../entities/Platform.js';
import { Turret } from '../entities/Turret.js';

export class World2Level5 {
    constructor() {
        this.name = "World 2-5 - Gravity Gauntlet";
        this.world = 2;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 950, y: 150, width: 80, height: 100 };

        this.threeStarTime = 14;
        this.twoStarTime = 20;

        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(250, 600, 100, 20),
            new Platform(450, 520, 100, 20),
            new Platform(650, 440, 100, 20),
            new Platform(850, 360, 100, 20),
        ];

        this.gluePlatforms = [
        ];

        this.crumblingPlatforms = [
        ];

        this.spikes = [
            { x: 220, y: 620, width: 30, height: 30 },
            { x: 420, y: 540, width: 30, height: 30 },
            { x: 820, y: 380, width: 30, height: 30 },
        ];

        this.blackHoles = [
            {
                x: 550,
                y: 350,
                width: 60,
                height: 60,
                pullRadius: 350,
                pullStrength: 800,
                killRadius: 40
            },
        ];

        this.turrets = [
            new Turret(350, 580, 'right', 1.2),
            new Turret(750, 500, 'left', 1.2),
            new Turret(550, 280, 'down', 1.3),
        ];

        this.movingSpikes = [
        ];
    }
}
