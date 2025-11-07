/**
 * SoundManager
 * Handles all game audio with smart controls to prevent sound spam
 */

export class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5; // Master volume (0-1)
        this.musicVolume = 0.4; // Music volume (0-1)
        
        // Load sounds
        this.sounds = {
            jump: new Audio('src/Bfxr/Jump.wav'),
            goal: new Audio('src/Bfxr/goal.wav'),
            hit: new Audio('src/Bfxr/Hit1.wav'),
            shoot: new Audio('src/Bfxr/Shoot.wav')
        };

        // Load music (separate from sound effects)
        this.music = {
            world1: new Audio('src/Bfxr/Melodie1.m4a'),
            world2: new Audio('src/Bfxr/Melodie1.m4a'), // Will be replaced later
            world3: new Audio('src/Bfxr/Melodie1.m4a')  // Will be replaced later
        };

        // Set music properties for smooth looping
        Object.keys(this.music).forEach(key => {
            this.music[key].loop = true;
            this.music[key].volume = this.musicVolume;
            this.music[key].addEventListener('error', (e) => {
                console.error(`Failed to load music: ${key}`, e);
            });
            this.music[key].addEventListener('canplaythrough', () => {
                console.log(`Music loaded: ${key}`);
            });
        });

        this.currentMusic = null; // Track currently playing music

        // Set volumes for individual sounds
        this.sounds.jump.volume = 0.3;
        this.sounds.goal.volume = 0.6;
        this.sounds.hit.volume = 0.5;
        this.sounds.shoot.volume = 0.2; // Quieter for turrets since they spam

        // Add error handlers for debugging
        Object.keys(this.sounds).forEach(key => {
            this.sounds[key].addEventListener('error', (e) => {
                console.error(`Failed to load sound: ${key}`, e);
            });
            this.sounds[key].addEventListener('canplaythrough', () => {
                console.log(`Sound loaded: ${key}`);
            });
        });

        // Cooldowns to prevent sound spam
        this.cooldowns = {
            shoot: 0,
            jump: 0
        };

        // Cooldown durations (in milliseconds)
        this.cooldownDurations = {
            shoot: 100, // Only allow one turret sound per 100ms
            jump: 50    // Prevent double-jump sound spam
        };

        this.lastPlayTime = {};
    }

    /**
     * Play a sound effect
     * @param {string} soundName - Name of the sound to play
     * @param {number} volumeMultiplier - Optional volume multiplier (0-1)
     */
    play(soundName, volumeMultiplier = 1.0) {
        if (!this.enabled || !this.sounds[soundName]) {
            if (!this.sounds[soundName]) {
                console.warn(`Sound not found: ${soundName}`);
            }
            return;
        }

        const now = Date.now();

        // Check cooldown for sounds that can spam
        if (this.cooldowns[soundName] !== undefined) {
            const timeSinceLastPlay = now - (this.lastPlayTime[soundName] || 0);
            if (timeSinceLastPlay < this.cooldownDurations[soundName]) {
                return; // Still in cooldown, don't play
            }
            this.lastPlayTime[soundName] = now;
        }

        const sound = this.sounds[soundName];
        const baseVolume = {
            jump: 0.3,
            goal: 0.6,
            hit: 0.5,
            shoot: 0.2
        }[soundName] || 0.5;

        // Clone the audio for sounds that might overlap (like shoot)
        // This allows multiple instances to play at once
        if (soundName === 'shoot' || soundName === 'jump') {
            const clone = sound.cloneNode();
            clone.volume = baseVolume * this.volume * volumeMultiplier;
            clone.play().catch(e => {
                console.warn(`Sound play failed (${soundName}):`, e.message);
            });
        } else {
            // For goal and hit, restart if already playing
            sound.currentTime = 0;
            sound.volume = baseVolume * this.volume * volumeMultiplier;
            sound.play().catch(e => {
                console.warn(`Sound play failed (${soundName}):`, e.message);
            });
        }
    }

    /**
     * Play jump sound
     */
    playJump() {
        this.play('jump');
    }

    /**
     * Play goal/win sound
     */
    playGoal() {
        this.play('goal');
    }

    /**
     * Play hit/death sound
     */
    playHit() {
        this.play('hit');
    }

    /**
     * Play turret shoot sound
     * @param {number} distance - Optional distance from player (for volume attenuation)
     */
    playShoot(distance = null) {
        let volumeMultiplier = 1.0;
        
        // Optional: Reduce volume based on distance
        if (distance !== null && distance > 0) {
            // Volume decreases with distance (louder when close, quieter when far)
            // Max distance for sound: 800 pixels
            const maxDistance = 800;
            volumeMultiplier = Math.max(0.1, 1 - (distance / maxDistance));
        }
        
        this.play('shoot', volumeMultiplier);
    }

    /**
     * Toggle sound on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Set master volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Mute all sounds
     */
    mute() {
        this.enabled = false;
    }

    /**
     * Unmute all sounds
     */
    unmute() {
        this.enabled = true;
    }

    /**
     * Play background music for a specific world
     * @param {number} world - World number (1, 2, or 3)
     */
    playMusic(world) {
        const musicKey = `world${world}`;
        
        if (!this.music[musicKey]) {
            console.warn(`Music not found for world ${world}`);
            return;
        }

        // If same music is already playing, don't restart
        if (this.currentMusic === this.music[musicKey]) {
            return;
        }

        // Stop current music if any
        this.stopMusic();

        // Play new music
        this.currentMusic = this.music[musicKey];
        this.currentMusic.currentTime = 0; // Start from beginning
        this.currentMusic.volume = this.musicVolume;
        this.currentMusic.play().catch(e => {
            console.warn(`Music play failed (world${world}):`, e.message);
        });
    }

    /**
     * Stop currently playing music
     */
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
        }
    }

    /**
     * Restart current music from the beginning (useful when player dies)
     */
    restartMusic() {
        if (this.currentMusic) {
            this.currentMusic.currentTime = 0;
            this.currentMusic.play().catch(e => {
                console.warn('Music restart failed:', e.message);
            });
        }
    }

    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        Object.values(this.music).forEach(music => {
            music.volume = this.musicVolume;
        });
    }
}
