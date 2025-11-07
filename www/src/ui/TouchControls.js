/**
 * TouchControls
 * Invisible touch zones for mobile - left half for movement, right half for jump
 * Can be swapped: left for jump, right for movement
 */

export class TouchControls {
    constructor(inputManager, stateManager) {
        this.inputManager = inputManager;
        this.stateManager = stateManager;
        this.active = false;

        // Control swap setting (load from localStorage)
        this.swapped = localStorage.getItem('controlsSwapped') === 'true';

        // Track active touches
        this.touches = {
            movement: null,  // Touch ID for movement side
            jump: null       // Touch ID for jump side
        };

        // Movement state - instant response, tracks finger position
        this.movement = {
            active: false,
            startX: 0,    // Where finger initially touched
            currentX: 0,  // Current finger position
            threshold: 5  // Very small threshold to avoid jitter (5px)
        };

        this.setupListeners();
        this.detectMobile();
    }

    setSwapped(swapped) {
        this.swapped = swapped;
        localStorage.setItem('controlsSwapped', swapped.toString());
    }

    detectMobile() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isCapacitor = window.Capacitor !== undefined;

        if (isMobile || hasTouch || isCapacitor) {
            this.active = true;
        }
    }

    setupListeners() {
        // Listen to all touches on the window
        window.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        window.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        window.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });
    }

    handleTouchStart(e) {
        if (!this.active) return;

        // Only process touches when game is in PLAYING state
        // This prevents touches from being captured during victory/menu screens
        if (this.stateManager && this.stateManager.currentState !== 'playing') {
            return;
        }

        for (let touch of e.changedTouches) {
            const x = touch.clientX;
            const screenWidth = window.innerWidth;
            const screenMidpoint = screenWidth / 2;

            const isLeftSide = x < screenMidpoint;
            const isMovementSide = this.swapped ? !isLeftSide : isLeftSide;

            if (isMovementSide) {
                // Movement control side
                if (this.touches.movement === null) {
                    this.touches.movement = touch.identifier;
                    this.movement.active = true;
                    this.movement.startX = x;     // Remember where finger started
                    this.movement.currentX = x;   // Current position
                }
            } else {
                // Jump side
                if (this.touches.jump === null) {
                    this.touches.jump = touch.identifier;
                }
            }
        }

        this.updateInput();
    }

    handleTouchMove(e) {
        if (!this.active) return;

        // Only prevent default (block scrolling) when game is in PLAYING state
        // This allows scrolling in menus
        if (this.stateManager && this.stateManager.currentState === 'playing') {
            e.preventDefault();
        }

        for (let touch of e.changedTouches) {
            if (touch.identifier === this.touches.movement) {
                // Update position instantly for immediate response
                this.movement.currentX = touch.clientX;
            }
        }

        this.updateInput();
    }

    handleTouchEnd(e) {
        if (!this.active) return;

        for (let touch of e.changedTouches) {
            if (touch.identifier === this.touches.movement) {
                this.touches.movement = null;
                this.movement.active = false;
                this.movement.currentX = 0;
            } else if (touch.identifier === this.touches.jump) {
                this.touches.jump = null;
            }
        }

        this.updateInput();
    }

    updateInput() {
        let left = false;
        let right = false;
        let jump = false;

        // Movement: Compare current finger position to where it started
        // Instant response with minimal threshold to avoid jitter
        if (this.movement.active) {
            const delta = this.movement.currentX - this.movement.startX;

            if (delta < -this.movement.threshold) {
                // Finger moved left from start position
                left = true;
            } else if (delta > this.movement.threshold) {
                // Finger moved right from start position
                right = true;
            }
            // If within threshold, no movement (prevents jitter when finger is still)
        }

        // Jump: touch is active on jump side
        if (this.touches.jump !== null) {
            jump = true;
        }

        this.inputManager.setTouchControls(left, right, jump);
    }

    reset() {
        // Clear all active touches
        this.touches.movement = null;
        this.touches.jump = null;
        this.movement.active = false;
        this.movement.startX = 0;
        this.movement.currentX = 0;

        // Reset input state
        this.inputManager.setTouchControls(false, false, false);
    }

    destroy() {
        window.removeEventListener('touchstart', this.handleTouchStart);
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
        window.removeEventListener('touchcancel', this.handleTouchEnd);
    }
}
