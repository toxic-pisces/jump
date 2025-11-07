import { Platform } from './Platform.js';

export class GluePlatform extends Platform {
    constructor(x, y, width, height, glueFactor = 0.4) {
        super(x, y, width, height);
        this.isGluePlatform = true;
        this.glueFactor = glueFactor; // 0.4 = 60% Geschwindigkeitsreduktion
        this.glueColor = '#87CEEB'; // Helles Blau für World 2
    }
}
