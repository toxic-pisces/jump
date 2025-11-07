/**
 * Game Constants and Configuration
 * Centralized configuration for all magic numbers and tunable parameters
 */

// Canvas/Viewport
export const CANVAS = {
    WIDTH: 1200,
    HEIGHT: 700
};

// Player Configuration
export const PLAYER = {
    WIDTH: 40,
    HEIGHT: 40,
    SPEED: 300,
    JUMP_FORCE: -600,
    MAX_JUMPS: 2,

    // Animation
    ROTATION_SPEED: 8, // radians per second while airborne
    LANDING_DURATION: 0.15, // seconds for squash/stretch effect
    ROTATION_SNAP_SPEED: 15, // speed of snapping to 90° angles when grounded
    ROTATION_SNAP_THRESHOLD: 0.01, // minimum rotation difference before snapping

    // Starting position (default)
    DEFAULT_SPAWN_X: 100,
    DEFAULT_SPAWN_Y: 500
};

// Physics
export const PHYSICS = {
    GRAVITY: 1500, // pixels per second squared
    MAX_DELTA_TIME: 0.1, // cap delta time to prevent spiral of death
    VELOCITY_EPSILON: 0.01 // minimum velocity before considering stopped
};

// Game Loop
export const GAME_LOOP = {
    TARGET_FPS: 60,
    FIXED_TIME_STEP: 1 / 60
};

// Level Configuration
export const LEVEL = {
    TOTAL_LEVELS: 27,
    WORLD_1_LEVELS: 9,
    WORLD_2_LEVELS: 9,
    WORLD_3_LEVELS: 9,

    // Goal collision cooldown (prevents double-triggering)
    GOAL_COOLDOWN: 1.0, // seconds

    // Death boundary
    DEATH_Y: 700, // fall below this Y coordinate to die

    // Star rating time thresholds (can be customized per level)
    GOLD_TIME_MULTIPLIER: 0.7,
    SILVER_TIME_MULTIPLIER: 1.0,
    BRONZE_TIME_MULTIPLIER: Infinity
};

// Platform Configuration
export const PLATFORM = {
    DEFAULT_WIDTH: 100,
    DEFAULT_HEIGHT: 20,

    // Crumbling Platform
    CRUMBLING_MAX_TOUCHES: 2,
    CRUMBLING_WARNING_TIME: 0.5, // seconds before breaking

    // Blinking Platform
    BLINK_CYCLE_TIME: 2.0, // seconds for full on/off cycle
    BLINK_WARNING_TIME: 0.3, // seconds of warning flash

    // Glue Platform
    GLUE_PARTICLE_INTERVAL: 0.1, // seconds between slime particles
    GLUE_DISABLE_DOUBLE_JUMP: true
};

// Hazards
export const HAZARD = {
    // Spike
    SPIKE_SIZE: 30,

    // Moving Spike Ball
    SPIKE_BALL_RADIUS: 20,
    SPIKE_BALL_ROTATION_SPEED: 5, // radians per second

    // Turret
    TURRET_WIDTH: 40,
    TURRET_HEIGHT: 40,
    TURRET_CHARGE_TIME: 1.0, // seconds before firing
    TURRET_RELOAD_TIME: 2.0, // seconds between shots
    TURRET_PROJECTILE_SPEED: 400, // pixels per second
    TURRET_PROJECTILE_SIZE: 10,
    TURRET_RANGE: 500, // detection range in pixels

    // Black Hole
    BLACK_HOLE_RADIUS: 40,
    BLACK_HOLE_EVENT_HORIZON: 80, // point of no return
    BLACK_HOLE_DANGER_ZONE: 200, // extreme acceleration zone
    BLACK_HOLE_PULL_FORCE: 800, // base gravitational pull
    BLACK_HOLE_SUCK_DURATION: 1.0, // seconds for death animation
    BLACK_HOLE_PARTICLE_INTERVAL: 0.05 // seconds between spiral particles
};

// UI Configuration
export const UI = {
    // Level Select
    LEVEL_BUTTON_SIZE: 60,
    LEVEL_BUTTON_SPACING: 20,
    LEVEL_BUTTON_COLUMNS: 3,
    PREVIEW_WIDTH: 300,
    PREVIEW_HEIGHT: 175,
    ARROW_SIZE: 60,
    HEART_SIZE: 24,

    // Victory Screen
    VICTORY_ANIMATION_DURATION: 1.0, // seconds
    STAR_ANIMATION_DELAY: 0.2, // seconds between each star

    // Timer
    TIMER_PRECISION: 2 // decimal places for time display
};

// Particle System
export const PARTICLES = {
    // Death explosion
    DEATH_PARTICLE_COUNT: 30,
    DEATH_PARTICLE_SPEED_MIN: 100,
    DEATH_PARTICLE_SPEED_MAX: 300,
    DEATH_PARTICLE_LIFETIME: 1.0,

    // Victory particles
    VICTORY_PARTICLE_COUNT: 50,
    VICTORY_PARTICLE_LIFETIME: 2.0,

    // Movement trail
    TRAIL_LIFETIME: 0.5,
    TRAIL_SPAWN_INTERVAL: 0.05,

    // Black hole spiral
    SPIRAL_PARTICLE_LIFETIME: 2.0,
    SPIRAL_PARTICLE_COUNT: 3
};

// Rendering
export const RENDER = {
    // Pixel art style
    IMAGE_RENDERING: 'pixelated',
    CRISP_EDGES: true,

    // Colors by world
    WORLD_COLORS: {
        1: {
            primary: '#FF69B4',    // Hot Pink
            secondary: '#FFB3D9',  // Light Pink
            accent: '#FF1493',     // Deep Pink
            background: '#FFF0F5'  // Lavender Blush
        },
        2: {
            primary: '#4682B4',    // Steel Blue
            secondary: '#87CEEB',  // Sky Blue
            accent: '#1E90FF',     // Dodger Blue
            background: '#F0F8FF'  // Alice Blue
        },
        3: {
            primary: '#FFD700',    // Gold
            secondary: '#FFF59D',  // Light Yellow
            accent: '#FFA500',     // Orange
            background: '#FFFACD'  // Lemon Chiffon
        }
    },

    // Default colors
    PLATFORM_COLOR: '#000000',
    GOAL_COLOR: '#00FF00',
    SPIKE_COLOR: '#FF0000',
    PLAYER_COLOR: '#FF69B4',
    BACKGROUND_COLOR: '#87CEEB'
};

// Input Configuration
export const INPUT = {
    // Key bindings
    MOVE_LEFT: ['ArrowLeft', 'KeyA'],
    MOVE_RIGHT: ['ArrowRight', 'KeyD'],
    JUMP: ['Space'],
    MENU: ['Escape'],

    // Editor controls
    EDITOR_SAVE: ['KeyS'],
    EDITOR_LOAD: ['KeyL'],
    EDITOR_TEST: ['KeyT']
};

// Speedrun Configuration
export const SPEEDRUN = {
    LEADERBOARD_SIZE: 10, // top 10 displayed
    NAME_MAX_LENGTH: 20,

    MODES: {
        WORLD_1: 'world1',
        WORLD_2: 'world2',
        IRONMAN: 'ironman'
    }
};

// Storage Keys
export const STORAGE_KEYS = {
    LEVEL_STARS: 'levelStars',
    CUSTOM_LEVEL: 'customLevel',
    SETTINGS: 'gameSettings'
};

// Game States
export const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    DEAD: 'dead',
    WON: 'won',
    SUCKING: 'sucking', // being pulled into black hole
    EDITOR: 'editor',
    SPEEDRUN_FINISHED: 'speedrun-finished' // speedrun completed, awaiting name input
};

// Debug
export const DEBUG = {
    SHOW_HITBOXES: false,
    SHOW_FPS: false,
    LOG_COLLISIONS: false
};

export default {
    CANVAS,
    PLAYER,
    PHYSICS,
    GAME_LOOP,
    LEVEL,
    PLATFORM,
    HAZARD,
    UI,
    PARTICLES,
    RENDER,
    INPUT,
    SPEEDRUN,
    STORAGE_KEYS,
    GAME_STATES,
    DEBUG
};
