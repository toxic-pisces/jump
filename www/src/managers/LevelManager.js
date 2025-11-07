/**
 * LevelManager
 * Manages level loading, progression, and world themes
 */

import { Level1 } from '../levels/Level1.js';
import { Level2 } from '../levels/Level2.js';
import { Level3 } from '../levels/Level3.js';
import { Level4 } from '../levels/Level4.js';
import { Level5 } from '../levels/Level5.js';
import { Level6 } from '../levels/Level6.js';
import { Level7 } from '../levels/Level7.js';
import { Level8 } from '../levels/Level8.js';
import { Level9 } from '../levels/Level9.js';
import { World2Level1 } from '../levels/World2Level1.js';
import { World2Level2 } from '../levels/World2Level2.js';
import { World2Level3 } from '../levels/World2Level3.js';
import { World2Level4 } from '../levels/World2Level4.js';
import { World2Level5 } from '../levels/World2Level5.js';
import { World2Level6 } from '../levels/World2Level6.js';
import { World2Level7 } from '../levels/World2Level7.js';
import { World2Level8 } from '../levels/World2Level8.js';
import { World2Level9 } from '../levels/World2Level9.js';
import { World3Level1 } from '../levels/World3Level1.js';
import { World3Level2 } from '../levels/World3Level2.js';
import { World3Level3 } from '../levels/World3Level3.js';
import { World3Level4 } from '../levels/World3Level4.js';
import { World3Level5 } from '../levels/World3Level5.js';
import { World3Level6 } from '../levels/World3Level6.js';
import { World3Level7 } from '../levels/World3Level7.js';
import { World3Level8 } from '../levels/World3Level8.js';
import { World3Level9 } from '../levels/World3Level9.js';
import { LEVEL } from '../config/Constants.js';

export class LevelManager {
    constructor() {
        this.currentLevel = null;
        this.currentLevelNumber = 1;
        this.currentWorld = 1;

        // Level class mappings
        this.world1Levels = [null, Level1, Level2, Level3, Level4, Level5, Level6, Level7, Level8, Level9];
        this.world2Levels = [null, World2Level1, World2Level2, World2Level3, World2Level4, World2Level5, World2Level6, World2Level7, World2Level8, World2Level9];
        this.world3Levels = [null, World3Level1, World3Level2, World3Level3, World3Level4, World3Level5, World3Level6, World3Level7, World3Level8, World3Level9];
    }

    /**
     * Load a World 1 level
     * @param {number} levelNumber - Level number (1-9)
     * @returns {Object} Level data
     */
    loadWorld1Level(levelNumber) {
        if (levelNumber < 1 || levelNumber > LEVEL.WORLD_1_LEVELS) {
            throw new Error(`Invalid World 1 level number: ${levelNumber}`);
        }

        this.currentWorld = 1;
        this.currentLevelNumber = levelNumber;
        this.currentLevel = new this.world1Levels[levelNumber]();
        this.setWorldTheme(1);

        return {
            level: this.currentLevel,
            displayName: `LEVEL ${levelNumber}`,
            world: 1,
            levelNumber: levelNumber
        };
    }

    /**
     * Load a World 2 level
     * @param {number} levelNumber - Level number (1-9)
     * @returns {Object} Level data
     */
    loadWorld2Level(levelNumber) {
        if (levelNumber < 1 || levelNumber > LEVEL.WORLD_2_LEVELS) {
            throw new Error(`Invalid World 2 level number: ${levelNumber}`);
        }

        this.currentWorld = 2;
        this.currentLevelNumber = levelNumber + 100;
        this.currentLevel = new this.world2Levels[levelNumber]();
        this.setWorldTheme(2);

        return {
            level: this.currentLevel,
            displayName: `LEVEL ${levelNumber}`,
            world: 2,
            levelNumber: levelNumber
        };
    }

    /**
     * Load a World 3 level
     * @param {number} levelNumber - Level number (1-3)
     * @returns {Object} Level data
     */
    loadWorld3Level(levelNumber) {
        if (levelNumber < 1 || levelNumber > LEVEL.WORLD_3_LEVELS) {
            throw new Error(`Invalid World 3 level number: ${levelNumber}`);
        }

        this.currentWorld = 3;
        this.currentLevelNumber = levelNumber + 200;
        this.currentLevel = new this.world3Levels[levelNumber]();
        this.setWorldTheme(3);

        return {
            level: this.currentLevel,
            displayName: `LEVEL ${levelNumber}`,
            world: 3,
            levelNumber: levelNumber
        };
    }

    /**
     * Load a custom level
     * @param {Object} levelData - Custom level data
     * @returns {Object} Level data
     */
    loadCustomLevel(levelData) {
        this.currentWorld = 1; // Custom levels use World 1 theme
        this.currentLevelNumber = 0;
        this.currentLevel = levelData;
        this.setWorldTheme(1);

        return {
            level: this.currentLevel,
            displayName: levelData.name || 'CUSTOM LEVEL',
            world: 1,
            levelNumber: 0,
            isCustom: true
        };
    }

    /**
     * Load the next level in sequence
     * @returns {Object|null} Next level data, or null if no next level
     */
    loadNextLevel() {
        if (this.currentWorld === 3) {
            // World 3
            const currentLevelInWorld = this.currentLevelNumber - 200;
            if (currentLevelInWorld < LEVEL.WORLD_3_LEVELS) {
                return this.loadWorld3Level(currentLevelInWorld + 1);
            }
            return null; // No more levels
        } else if (this.currentWorld === 2) {
            // World 2
            const currentLevelInWorld = this.currentLevelNumber - 100;
            if (currentLevelInWorld < LEVEL.WORLD_2_LEVELS) {
                return this.loadWorld2Level(currentLevelInWorld + 1);
            }
            return null; // No more levels
        } else if (this.currentWorld === 1) {
            // World 1
            if (this.currentLevelNumber < LEVEL.WORLD_1_LEVELS) {
                return this.loadWorld1Level(this.currentLevelNumber + 1);
            }
            return null; // No more levels
        }

        return null;
    }

    /**
     * Check if there is a next level available
     * @returns {boolean}
     */
    hasNextLevel() {
        if (this.currentWorld === 3) {
            const currentLevelInWorld = this.currentLevelNumber - 200;
            return currentLevelInWorld < LEVEL.WORLD_3_LEVELS;
        } else if (this.currentWorld === 2) {
            const currentLevelInWorld = this.currentLevelNumber - 100;
            return currentLevelInWorld < LEVEL.WORLD_2_LEVELS;
        } else if (this.currentWorld === 1) {
            return this.currentLevelNumber < LEVEL.WORLD_1_LEVELS;
        }
        return false;
    }

    /**
     * Set the world theme (updates body class)
     * @param {number} worldNumber - World number (1, 2, or 3)
     */
    setWorldTheme(worldNumber) {
        document.body.className = `world-${worldNumber}`;
    }

    /**
     * Get current level
     * @returns {Object}
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * Get current level number
     * @returns {number}
     */
    getCurrentLevelNumber() {
        return this.currentLevelNumber;
    }

    /**
     * Get current world
     * @returns {number}
     */
    getCurrentWorld() {
        return this.currentWorld;
    }

    /**
     * Get level info for display
     * @returns {Object}
     */
    getLevelInfo() {
        return {
            world: this.currentWorld,
            levelNumber: this.currentLevelNumber,
            level: this.currentLevel
        };
    }
}
