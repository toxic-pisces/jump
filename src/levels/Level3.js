import { Platform } from '../entities/Platform.js';

export class Level3 {
    constructor() {
        this.name = "Level 3 - Danger Zone";
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 600, y: 150, width: 80, height: 100 }; // Mittig oben
        
        this.threeStarTime = 8;
        this.twoStarTime = 12;
        
        this.platforms = [
            // Start
            new Platform(0, 650, 200, 50),
            
            // Zickzack nach oben
            new Platform(250, 600, 120, 20),
            new Platform(450, 550, 120, 20),
            new Platform(300, 450, 120, 20),
            new Platform(500, 350, 120, 20),
            new Platform(350, 250, 120, 20),
            
            
        ];
        
        this.spikes = [
            { x: 220, y: 620, width: 30, height: 30 },
            { x: 380, y: 570, width: 30, height: 30 },
            { x: 270, y: 470, width: 30, height: 30 },
            { x: 470, y: 370, width: 30, height: 30 },
            { x: 320, y: 270, width: 30, height: 30 }
        ];
        
        this.movingSpikes = [];
    }
}
