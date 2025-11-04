import { Platform } from '../entities/Platform.js';
import { GluePlatform } from '../entities/GluePlatform.js';
import { BlinkingPlatform } from '../entities/BlinkingPlatform.js';
import { Turret } from '../entities/Turret.js';

export class World3Level3 {
    constructor() {
        this.name = "World 3-3";
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 700, y: 100, width: 80, height: 100 };

        this.threeStarTime = 12;
        this.twoStarTime = 18;

        this.platforms = [
            new Platform(0, 650, 150, 50),
            new Platform(540, 620, 120, 40),
        ];

        this.gluePlatforms = [
            new GluePlatform(620, 260, 40, 360, 0.4),
        ];

        this.crumblingPlatforms = [
        ];

        this.blinkingPlatforms = [
            new BlinkingPlatform(200, 580, 100, 20, 2.4, true),
            new BlinkingPlatform(350, 580, 100, 20, 2.4, false),
            new BlinkingPlatform(250, 480, 80, 20, 2, false),
            new BlinkingPlatform(400, 480, 80, 20, 2, true),
            new BlinkingPlatform(300, 380, 100, 20, 2.4, true),
            new BlinkingPlatform(450, 380, 100, 20, 2.4, false),
            new BlinkingPlatform(350, 280, 80, 20, 2, false),
            new BlinkingPlatform(500, 280, 80, 20, 2, true),
            new BlinkingPlatform(600, 200, 80, 20, 1.8, true),
        ];

        this.spikes = [
            { x: 480, y: 600, width: 30, height: 30 },
            { x: 330, y: 500, width: 30, height: 30 },
            { x: 580, y: 400, width: 30, height: 30 },
        ];

        this.blackHoles = [
            {
                x: 320,
                y: 640,
                width: 60,
                height: 60,
                pullRadius: 350,
                pullStrength: 800,
                killRadius: 40
            },
        ];

        this.turrets = [
            new Turret(1060, 160, 'left', 1.5),
            new Turret(940, 120, 'left', 1.5),
        ];

        this.movingSpikes = [
            {
                x: 240,
                y: 540,
                width: 40,
                height: 40,
                startX: 240,
                endX: 440,
                speed: 150,
                direction: 1
            },
            {
                x: 300,
                y: 440,
                width: 40,
                height: 40,
                startX: 300,
                endX: 500,
                speed: 150,
                direction: 1
            },
            {
                x: 360,
                y: 340,
                width: 40,
                height: 40,
                startX: 360,
                endX: 560,
                speed: 150,
                direction: 1
            },
            {
                x: 400,
                y: 240,
                width: 40,
                height: 40,
                startX: 400,
                endX: 600,
                speed: 150,
                direction: 1
            },
        ];
    }
}
