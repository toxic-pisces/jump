/**
 * InputManager
 * Handles all keyboard input and key state tracking
 */

export class InputManager {
    constructor() {
        this.keys = {};
        this.callbacks = {
            keydown: [],
            keyup: []
        };

        // Touch controls state
        this.touchControls = {
            left: false,
            right: false,
            jump: false
        };

        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Notify all registered keydown callbacks
            this.callbacks.keydown.forEach(callback => callback(e, this.keys));
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;

            // Notify all registered keyup callbacks
            this.callbacks.keyup.forEach(callback => callback(e, this.keys));
        });
    }

    /**
     * Register a callback for keydown events
     * @param {Function} callback - Function to call on keydown (receives event and keys object)
     */
    onKeyDown(callback) {
        this.callbacks.keydown.push(callback);
    }

    /**
     * Register a callback for keyup events
     * @param {Function} callback - Function to call on keyup (receives event and keys object)
     */
    onKeyUp(callback) {
        this.callbacks.keyup.push(callback);
    }

    /**
     * Check if a key is currently pressed
     * @param {string} keyCode - The key code to check (e.g., 'Space', 'KeyA')
     * @returns {boolean}
     */
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }

    /**
     * Check if any of the given keys are pressed
     * @param {string[]} keyCodes - Array of key codes to check
     * @returns {boolean}
     */
    isAnyKeyPressed(keyCodes) {
        return keyCodes.some(keyCode => this.isKeyPressed(keyCode));
    }

    /**
     * Get input state for player movement
     * @returns {Object} Input state with left, right, jump booleans
     */
    getPlayerInput() {
        return {
            left: this.isKeyPressed('ArrowLeft') || this.isKeyPressed('KeyA') || this.touchControls.left,
            right: this.isKeyPressed('ArrowRight') || this.isKeyPressed('KeyD') || this.touchControls.right,
            jump: this.isKeyPressed('Space') || this.touchControls.jump
        };
    }

    /**
     * Set touch control state (called by TouchControls UI)
     */
    setTouchControls(left, right, jump) {
        this.touchControls.left = left;
        this.touchControls.right = right;
        this.touchControls.jump = jump;
    }

    /**
     * Clear all key states
     */
    clearKeys() {
        this.keys = {};
    }

    /**
     * Remove all callbacks and cleanup
     */
    destroy() {
        this.callbacks.keydown = [];
        this.callbacks.keyup = [];
    }
}
