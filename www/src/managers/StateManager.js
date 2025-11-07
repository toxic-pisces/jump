/**
 * StateManager
 * Manages game state transitions and state-related logic
 */

import { GAME_STATES } from '../config/Constants.js';

export class StateManager {
    constructor() {
        this.currentState = GAME_STATES.MENU;
        this.previousState = null;
        this.stateCallbacks = {};

        // Initialize callbacks for each state
        Object.values(GAME_STATES).forEach(state => {
            this.stateCallbacks[state] = {
                onEnter: [],
                onExit: []
            };
        });
    }

    /**
     * Get the current game state
     * @returns {string}
     */
    getState() {
        return this.currentState;
    }

    /**
     * Check if currently in a specific state
     * @param {string} state - State to check
     * @returns {boolean}
     */
    is(state) {
        return this.currentState === state;
    }

    /**
     * Set a new game state
     * @param {string} newState - New state to transition to
     */
    setState(newState) {
        if (this.currentState === newState) return;

        // Call onExit callbacks for current state
        this.stateCallbacks[this.currentState].onExit.forEach(callback => callback());

        this.previousState = this.currentState;
        this.currentState = newState;

        // Call onEnter callbacks for new state
        this.stateCallbacks[newState].onEnter.forEach(callback => callback());
    }

    /**
     * Register a callback for when entering a state
     * @param {string} state - State to listen for
     * @param {Function} callback - Function to call on state enter
     */
    onEnter(state, callback) {
        if (this.stateCallbacks[state]) {
            this.stateCallbacks[state].onEnter.push(callback);
        }
    }

    /**
     * Register a callback for when exiting a state
     * @param {string} state - State to listen for
     * @param {Function} callback - Function to call on state exit
     */
    onExit(state, callback) {
        if (this.stateCallbacks[state]) {
            this.stateCallbacks[state].onExit.push(callback);
        }
    }

    /**
     * Get the previous state
     * @returns {string|null}
     */
    getPreviousState() {
        return this.previousState;
    }

    /**
     * Return to the previous state
     */
    returnToPrevious() {
        if (this.previousState) {
            this.setState(this.previousState);
        }
    }

    /**
     * Check if game is currently playable (playing state)
     * @returns {boolean}
     */
    isPlaying() {
        return this.currentState === GAME_STATES.PLAYING;
    }

    /**
     * Check if game is in menu
     * @returns {boolean}
     */
    isMenu() {
        return this.currentState === GAME_STATES.MENU;
    }

    /**
     * Check if player is dead
     * @returns {boolean}
     */
    isDead() {
        return this.currentState === GAME_STATES.DEAD;
    }

    /**
     * Check if level is won
     * @returns {boolean}
     */
    isWon() {
        return this.currentState === GAME_STATES.WON;
    }

    /**
     * Check if in editor mode
     * @returns {boolean}
     */
    isEditor() {
        return this.currentState === GAME_STATES.EDITOR;
    }

    /**
     * Check if being sucked into black hole
     * @returns {boolean}
     */
    isSucking() {
        return this.currentState === GAME_STATES.SUCKING;
    }
}
