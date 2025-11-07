/**
 * SettingsMenu
 * Manages the settings screen with controls display and volume adjustments
 */

export class SettingsMenu {
    constructor() {
        this.container = document.getElementById('settings-menu');
        this.backButton = document.getElementById('settings-back-button');
        this.musicVolumeSlider = document.getElementById('music-volume');
        this.musicVolumeValue = document.getElementById('music-volume-value');
        this.sfxVolumeSlider = document.getElementById('sfx-volume');
        this.sfxVolumeValue = document.getElementById('sfx-volume-value');
        this.swapControlsButton = document.getElementById('swap-controls-button');
        this.swapControlsStatus = document.getElementById('swap-controls-status');

        this.onBack = null;
        this.touchControls = null; // Will be set by Game.js
        this.soundManager = null; // Will be set by Game.js

        this.setupEventListeners();
        this.loadSettings();
    }

    setTouchControls(touchControls) {
        this.touchControls = touchControls;
    }

    setSoundManager(soundManager) {
        this.soundManager = soundManager;
        // Apply saved settings to sound manager
        const settings = this.getSettings();
        if (this.soundManager) {
            this.soundManager.setMusicVolume(settings.musicVolume / 100);
            this.soundManager.setVolume(settings.sfxVolume / 100);
        }
    }

    setupEventListeners() {
        // Back button
        this.backButton.addEventListener('click', () => {
            this.hide();
            if (this.onBack) {
                this.onBack();
            }
        });

        // Swap controls button
        if (this.swapControlsButton) {
            this.swapControlsButton.addEventListener('click', () => {
                if (this.touchControls) {
                    const newSwapped = !this.touchControls.swapped;
                    this.touchControls.setSwapped(newSwapped);
                    this.updateSwapButtonText(newSwapped);
                    console.log('Controls swapped:', newSwapped);
                } else {
                    console.log('TouchControls not available');
                }
            });
        }

        // Music volume
        this.musicVolumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            this.musicVolumeValue.textContent = `${value}%`;
            this.saveSetting('musicVolume', value);
            // Apply to sound manager
            if (this.soundManager) {
                this.soundManager.setMusicVolume(value / 100);
            }
        });

        // SFX volume
        this.sfxVolumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            this.sfxVolumeValue.textContent = `${value}%`;
            this.saveSetting('sfxVolume', value);
            // Apply to sound manager
            if (this.soundManager) {
                this.soundManager.setVolume(value / 100);
            }
        });
    }

    updateSwapButtonText(swapped) {
        if (swapped) {
            this.swapControlsStatus.textContent = 'LEFT: JUMP / RIGHT: MOVE';
        } else {
            this.swapControlsStatus.textContent = 'LEFT: MOVE / RIGHT: JUMP';
        }
    }

    show(onBackCallback) {
        this.container.classList.remove('hidden');
        this.onBack = onBackCallback;
        this.loadSettings();

        // Update swap button text based on current state
        if (this.touchControls) {
            this.updateSwapButtonText(this.touchControls.swapped);
        }
    }

    hide() {
        this.container.classList.add('hidden');
    }

    saveSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    }

    getSettings() {
        const defaultSettings = {
            musicVolume: 70,
            sfxVolume: 80
        };

        try {
            const saved = localStorage.getItem('gameSettings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (e) {
            console.error('Error loading settings:', e);
            return defaultSettings;
        }
    }

    loadSettings() {
        const settings = this.getSettings();

        this.musicVolumeSlider.value = settings.musicVolume;
        this.musicVolumeValue.textContent = `${settings.musicVolume}%`;

        this.sfxVolumeSlider.value = settings.sfxVolume;
        this.sfxVolumeValue.textContent = `${settings.sfxVolume}%`;
    }

    getMusicVolume() {
        return parseInt(this.musicVolumeSlider.value) / 100;
    }

    getSfxVolume() {
        return parseInt(this.sfxVolumeSlider.value) / 100;
    }
}
