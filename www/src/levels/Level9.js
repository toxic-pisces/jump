import { Platform } from '../entities/Platform.js';
import { CrumblingPlatform } from '../entities/CrumblingPlatform.js';

export class Level9 {
    constructor() {
        this.name = "Level 9 - FINALE";
        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 550, y: 100, width: 80, height: 100 };
        
        this.threeStarTime = 20;
        this.twoStarTime = 30;
        
        this.platforms = [
            new Platform(0, 650, 180, 50)
            // Ziel-Plattform entfernt
        ];
        
        this.crumblingPlatforms = [
            // Linker Pfad
            new CrumblingPlatform(230, 600, 80, 20),
            new CrumblingPlatform(360, 550, 80, 20),
            new CrumblingPlatform(490, 500, 80, 20),
            
            // Mittlere Sektion
            new CrumblingPlatform(620, 450, 80, 20),
            new CrumblingPlatform(750, 400, 80, 20),
            new CrumblingPlatform(880, 350, 80, 20),
            
            // Zurück zum Ziel
            new CrumblingPlatform(750, 280, 80, 20),
            new CrumblingPlatform(620, 220, 80, 20) // Genug um Ziel zu erreichen
        ];
        
        this.spikes = [
            { x: 200, y: 620, width: 30, height: 30 },
            { x: 330, y: 570, width: 30, height: 30 },
            { x: 590, y: 470, width: 30, height: 30 },
            { x: 720, y: 420, width: 30, height: 30 },
            { x: 850, y: 370, width: 30, height: 30 },
            { x: 590, y: 240, width: 30, height: 30 }
        ];
        
        this.movingSpikes = [
            {
                x: 400,
                y: 480,
                width: 40,
                height: 40,
                startX: 230,
                endX: 620,
                speed: 220,
                direction: 1
            },
            {
                x: 700,
                y: 320,
                width: 40,
                height: 40,
                startX: 620,
                endX: 880,
                speed: 200,
                direction: -1
            },
            {
                x: 550,
                y: 200,
                width: 40,
                height: 40,
                startX: 500,
                endX: 750,
                speed: 180,
                direction: 1
            }
        ];
    }
}
