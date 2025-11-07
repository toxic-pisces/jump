import { Platform } from '../entities/Platform.js';
import { Collectible } from '../entities/Collectible.js';

export class Level1 {
    constructor() {
        this.name = "Level 1 - Tutorial";
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 1000, y: 500, width: 80, height: 100 };

        this.threeStarTime = 5;
        this.twoStarTime = 8;

        this.platforms = [
            // Start Platform - mit Gras
            new Platform(0, 650, 250, 50),

            // Einfache Treppen zum Ziel - alle mit Gras
            new Platform(300, 600, 120, 20),
            new Platform(450, 550, 120, 20),
            new Platform(600, 500, 120, 20),
            new Platform(750, 450, 120, 20),
        ];

        this.spikes = [];
        this.movingSpikes = [];
        this.crumblingPlatforms = [];

        // Collectible - placed above the path for extra challenge
        this.collectible = new Collectible(360, 480, 1);
    }
}
