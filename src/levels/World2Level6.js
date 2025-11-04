import { Platform } from '../entities/Platform.js';
import { Turret } from '../entities/Turret.js';

export class World2Level6 {
    constructor() {
        this.name = "World 2-6 - Crossfire";
        this.world = 2;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 550, y: 80, width: 80, height: 100 };

        this.threeStarTime = 16;
        this.twoStarTime = 24;

        this.platforms = [
            new Platform(0, 650, 200, 50),
            new Platform(280, 600, 120, 20),
            new Platform(480, 520, 120, 20),
            new Platform(280, 440, 120, 20),
            new Platform(480, 360, 120, 20),
            new Platform(280, 280, 120, 20),
            new Platform(480, 200, 120, 20),
        ];

        this.gluePlatforms = [
        ];

        this.crumblingPlatforms = [
        ];

        this.spikes = [
            { x: 250, y: 620, width: 30, height: 30 },
            { x: 450, y: 540, width: 30, height: 30 },
            { x: 250, y: 460, width: 30, height: 30 },
            { x: 450, y: 380, width: 30, height: 30 },
        ];

        this.blackHoles = [
        ];

        this.turrets = [
            new Turret(180, 560, 'right', 1.1),
            new Turret(180, 400, 'right', 1.0),
            new Turret(180, 240, 'right', 1.1),
            new Turret(620, 480, 'left', 1.2),
            new Turret(620, 320, 'left', 1.0),
            new Turret(620, 160, 'left', 1.2),
            new Turret(380, 350, 'down', 1.4),
            new Turret(380, 230, 'up', 1.4),
        ];

        this.movingSpikes = [
        ];
    }
}
