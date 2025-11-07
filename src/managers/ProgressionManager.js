/**
 * ProgressionManager
 * Manages game progression, unlocking levels, worlds, and challenges
 */

export class ProgressionManager {
    constructor() {
        this.STORAGE_KEY = 'jump_progression';
        this.justUnlocked = []; // Track what was just unlocked this session
        this.initializeProgression();
    }

    initializeProgression() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            this.data = JSON.parse(saved);
            
            // Ensure unlockedSkins exists for backward compatibility
            if (!this.data.unlockedSkins) {
                this.data.unlockedSkins = ['default', 'red', 'white', 'black'];
                this.save();
            }
        } else {
            // Default: Only level 1 of world 1 unlocked
            this.data = {
                unlockedLevels: {
                    1: [1], // World 1: only level 1
                    2: [],  // World 2: none
                    3: []   // World 3: none
                },
                levelStars: {
                    // Format: "world-level": stars (0-3)
                },
                collectedCollectibles: {
                    // Format: "world-level": boolean
                },
                unlockedWorlds: [1], // Only world 1 available
                unlockedSpeedruns: [], // No speedruns unlocked
                ironmanUnlocked: false,
                unlockedSkins: ['default', 'red', 'white', 'black'] // Default unlocked skins
            };
            this.save();
        }

        // Ensure collectedCollectibles exists for backward compatibility
        if (!this.data.collectedCollectibles) {
            this.data.collectedCollectibles = {};
            this.save();
        }
    }

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    }

    // Check if a skin is unlocked
    isSkinUnlocked(skinId) {
        if (!this.data.unlockedSkins) {
            this.data.unlockedSkins = ['default', 'red', 'white', 'black'];
            this.save();
        }
        return this.data.unlockedSkins.includes(skinId);
    }

    // Unlock a skin
    unlockSkin(skinId) {
        if (!this.data.unlockedSkins) {
            this.data.unlockedSkins = ['default', 'red', 'white', 'black'];
        }
        if (!this.data.unlockedSkins.includes(skinId)) {
            this.data.unlockedSkins.push(skinId);
            
            // Get skin data for unlock screen
            const skinData = this.getSkinData(skinId);
            this.justUnlocked.push({ type: 'skin', skinId, skinData });
            this.save();
            return true;
        }
        return false;
    }
    
    // Get skin data for displaying
    getSkinData(skinId) {
        const skins = {
            default: {
                name: 'DEFAULT',
                colors: {
                    1: { main: '#FF8FC7', light: '#FFB3D9', dark: '#FF6BB5', border: '#FF6BB5' }
                }
            },
            lightning: {
                name: 'LIGHTNING',
                special: 'lightning',
                colors: {
                    1: { main: '#00D4FF', light: '#66E5FF', dark: '#0088CC', border: '#00BFFF' }
                }
            },
            neongreen: {
                name: 'NEON GREEN',
                special: 'neongreen',
                colors: {
                    1: { main: '#39FF14', light: '#7FFF00', dark: '#00FF00', border: '#32CD32' }
                }
            },
            red: {
                name: 'RED',
                colors: {
                    1: { main: '#E74C3C', light: '#FF6B6B', dark: '#C0392B', border: '#A93226' }
                }
            },
            white: {
                name: 'WHITE',
                colors: {
                    1: { main: '#F8F8F8', light: '#FFFFFF', dark: '#D0D0D0', border: '#C0C0C0' }
                }
            },
            black: {
                name: 'BLACK',
                colors: {
                    1: { main: '#2C2C2C', light: '#4A4A4A', dark: '#1A1A1A', border: '#000000' }
                }
            },
            rainbow: {
                name: 'RAINBOW',
                special: 'rainbow',
                colors: {
                    1: { main: '#FF0080', light: '#FF69B4', dark: '#CC0066', border: '#FF1493' }
                }
            },
            angry: {
                name: 'ANGRY',
                special: 'angry',
                colors: {
                    1: { main: '#FF4500', light: '#FF6347', dark: '#CC3700', border: '#FF4500' }
                }
            },
            glue: {
                name: 'GLUE',
                special: 'glue',
                colors: {
                    1: { main: '#2193B0', light: '#6DD5ED', dark: '#1A7A8F', border: '#156075' }
                }
            },
            spike: {
                name: 'SPIKE',
                special: 'spike',
                colors: {
                    1: { main: '#3A4B5C', light: '#6A7B8C', dark: '#1A2B3C', border: '#0A1B2C' }
                }
            }
        };
        
        return skins[skinId] || skins.default;
    }

    // Get all unlocked skins
    getUnlockedSkins() {
        if (!this.data.unlockedSkins) {
            this.data.unlockedSkins = ['default', 'red', 'white', 'black'];
            this.save();
        }
        return this.data.unlockedSkins;
    }

    // Check if a specific level is unlocked
    isLevelUnlocked(world, level) {
        return this.data.unlockedLevels[world]?.includes(level) || false;
    }

    // Check if a world is unlocked
    isWorldUnlocked(world) {
        return this.data.unlockedWorlds.includes(world);
    }

    // Check if a speedrun is unlocked
    isSpeedrunUnlocked(world) {
        return this.data.unlockedSpeedruns.includes(world);
    }

    // Check if Ironman is unlocked
    isIronmanUnlocked() {
        return this.data.ironmanUnlocked;
    }

    // Get stars for a specific level
    getLevelStars(world, level) {
        const key = `${world}-${level}`;
        return this.data.levelStars[key] || 0;
    }

    // Check if collectible has been collected for a level
    hasCollectible(world, level) {
        const key = `${world}-${level}`;
        return this.data.collectedCollectibles[key] || false;
    }

    // Mark collectible as collected for a level
    collectCollectible(world, level) {
        const key = `${world}-${level}`;
        if (!this.data.collectedCollectibles[key]) {
            this.data.collectedCollectibles[key] = true;
            this.save();
            return true; // First time collecting
        }
        return false; // Already collected
    }

    // Complete a level and unlock next levels
    completeLevel(world, level, stars) {
        const key = `${world}-${level}`;
        const previousStars = this.data.levelStars[key] || 0;
        
        // Only update if new stars are better
        if (stars > previousStars) {
            this.data.levelStars[key] = stars;
        }

        // Unlock the next 2 levels in this world
        const maxLevels = 9; // Each world has 9 levels
        const unlockedInWorld = this.data.unlockedLevels[world];
        
        for (let i = 1; i <= 2; i++) {
            const nextLevel = level + i;
            if (nextLevel <= maxLevels && !unlockedInWorld.includes(nextLevel)) {
                unlockedInWorld.push(nextLevel);
            }
        }

        // Check if we should unlock next world or challenges
        this.checkWorldUnlock(world);
        this.checkSpeedrunUnlock(world);
        this.checkIronmanUnlock();
        this.checkSkinUnlocks();

        this.save();
        
        // Return what was just unlocked for showing unlock screens
        const unlocked = [...this.justUnlocked];
        this.justUnlocked = []; // Clear after returning
        return unlocked;
    }

    // Check if next world should be unlocked
    checkWorldUnlock(currentWorld) {
        const nextWorld = currentWorld + 1;
        if (nextWorld > 3) return; // No world after 3

        // Check if all levels in current world are completed
        const allLevelsComplete = this.areAllLevelsComplete(currentWorld);
        if (!allLevelsComplete) return;

        // Check if we have at least 22 hearts in this world
        const totalStars = this.getTotalStarsInWorld(currentWorld);
        if (totalStars >= 22) {
            if (!this.data.unlockedWorlds.includes(nextWorld)) {
                this.data.unlockedWorlds.push(nextWorld);
                // Unlock first level of next world
                this.data.unlockedLevels[nextWorld] = [1];
                // Track for unlock screen
                this.justUnlocked.push({ type: 'world', world: nextWorld });
            }
        }
    }

    // Check if speedrun should be unlocked for this world
    checkSpeedrunUnlock(world) {
        // Check if all levels in this world are completed
        const allLevelsComplete = this.areAllLevelsComplete(world);
        if (!allLevelsComplete) return;

        // Check if we have at least 25 hearts in this world
        const totalStars = this.getTotalStarsInWorld(world);
        if (totalStars >= 25) {
            if (!this.data.unlockedSpeedruns.includes(world)) {
                this.data.unlockedSpeedruns.push(world);
                // Track for unlock screen
                this.justUnlocked.push({ type: 'speedrun', world });
            }
        }
    }

    // Check if Ironman should be unlocked
    checkIronmanUnlock() {
        // All 3 worlds must be completed
        for (let world = 1; world <= 3; world++) {
            if (!this.areAllLevelsComplete(world)) return;
        }

        // Must have all 27 hearts (perfect completion)
        const totalStars = this.getTotalStars();
        if (totalStars >= 27) {
            if (!this.data.ironmanUnlocked) {
                this.data.ironmanUnlocked = true;
                // Track for unlock screen
                this.justUnlocked.push({ type: 'ironman', world: null });
            }
        }
    }

    // Check if any skins should be unlocked
    checkSkinUnlocks() {
        // Rainbow skin: Collect all 27 hearts in World 1
        const world1Stars = this.getTotalStarsInWorld(1);
        if (world1Stars >= 27) {
            this.unlockSkin('rainbow');
        }

        // Lightning skin: Complete World 2 with 22+ hearts
        const world2Stars = this.getTotalStarsInWorld(2);
        if (world2Stars >= 22 && this.areAllLevelsComplete(2)) {
            this.unlockSkin('lightning');
        }

        // Neon Green skin: Complete World 3 with 22+ hearts
        const world3Stars = this.getTotalStarsInWorld(3);
        if (world3Stars >= 22 && this.areAllLevelsComplete(3)) {
            this.unlockSkin('neongreen');
        }

        // Angry skin: Get all 81 hearts (perfect game)
        const totalStars = this.getTotalStars();
        if (totalStars >= 81) {
            this.unlockSkin('angry');
        }

        // Glue skin: Complete all speedruns
        if (this.data.unlockedSpeedruns.length >= 3) {
            this.unlockSkin('glue');
        }

        // Spike skin: Beat Ironman mode
        if (this.data.ironmanUnlocked) {
            this.unlockSkin('spike');
        }
    }

    // Check if all levels in a world are completed (have at least 1 star)
    areAllLevelsComplete(world) {
        for (let level = 1; level <= 9; level++) {
            const key = `${world}-${level}`;
            if (!this.data.levelStars[key] || this.data.levelStars[key] === 0) {
                return false;
            }
        }
        return true;
    }

    // Get total stars in a specific world
    getTotalStarsInWorld(world) {
        let total = 0;
        for (let level = 1; level <= 9; level++) {
            const key = `${world}-${level}`;
            total += this.data.levelStars[key] || 0;
        }
        return total;
    }

    // Get total stars across all worlds
    getTotalStars() {
        let total = 0;
        for (let world = 1; world <= 3; world++) {
            total += this.getTotalStarsInWorld(world);
        }
        return total;
    }

    // Get unlock requirements text for challenges
    getSpeedrunRequirement(world) {
        const allComplete = this.areAllLevelsComplete(world);
        const stars = this.getTotalStarsInWorld(world);
        
        if (!allComplete) {
            return `Complete all World ${world} levels`;
        }
        if (stars < 25) {
            return `Collect ${25 - stars} more hearts in World ${world}`;
        }
        return null; // Unlocked
    }

    getIronmanRequirement() {
        const allComplete = this.areAllLevelsComplete(1) && 
                           this.areAllLevelsComplete(2) && 
                           this.areAllLevelsComplete(3);
        const stars = this.getTotalStars();
        
        if (!allComplete) {
            return 'Complete all levels in all worlds';
        }
        if (stars < 27) {
            return `Collect ${27 - stars} more hearts`;
        }
        return null; // Unlocked
    }

    // Admin function: Unlock everything
    unlockAll() {
        this.data = {
            unlockedLevels: {
                1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                2: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                3: [1, 2, 3, 4, 5, 6, 7, 8, 9]
            },
            levelStars: {},
            unlockedWorlds: [1, 2, 3],
            unlockedSpeedruns: [1, 2, 3],
            ironmanUnlocked: true,
            unlockedSkins: ['default', 'red', 'white', 'black', 'lightning', 'neongreen', 'rainbow', 'angry', 'glue', 'spike']
        };
        
        // Give 3 stars to all levels
        for (let world = 1; world <= 3; world++) {
            for (let level = 1; level <= 9; level++) {
                const key = `${world}-${level}`;
                this.data.levelStars[key] = 3;
            }
        }
        
        this.save();
        console.log('🔓 Admin mode: Everything unlocked!');
    }

    // Reset all progress
    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.initializeProgression();
    }
}
