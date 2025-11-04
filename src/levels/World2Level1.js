import { Platform } from '../entities/Platform.js';

export class World2Level1 {
    constructor() {
        this.name = "World 2-1";
        this.world = 2;
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 1000, y: 450, width: 80, height: 100 }; // CHECK: Ist das zu nah?
        
        this.threeStarTime = 6;
        this.twoStarTime = 10;
        
        this.platforms = [
            // Start
            new Platform(0, 650, 250, 50),
            
            // Weg zum Ziel
            new Platform(300, 600, 120, 20),
            new Platform(500, 550, 120, 20),
            new Platform(700, 500, 120, 20),
            new Platform(900, 500, 200, 20)
        ];
        
        this.spikes = [];
        
        // Schwarze Löcher - MASSIVER Radius
        this.blackHoles = [
            { 
                x: 400, 
                y: 400, 
                width: 60, 
                height: 60,
                pullRadius: 400,      // RIESIG (war 250)
                pullStrength: 800,    // SEHR stark (war 400)
                killRadius: 40
            }
        ];
        
        this.movingSpikes = [];
        this.crumblingPlatforms = [];
    }
}
