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

        this.onBack = null;

        this.setupEventListeners();
        this.loadSettings();
    }

    setupEventListeners() {
        // Back button
        this.backButton.addEventListener('click', () => {
            this.hide();
            if (this.onBack) {
                this.onBack();
            }
        });

        // Music volume
        this.musicVolumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            this.musicVolumeValue.textContent = `${value}%`;
            this.saveSetting('musicVolume', value);
        });

        // SFX volume
        this.sfxVolumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            this.sfxVolumeValue.textContent = `${value}%`;
            this.saveSetting('sfxVolume', value);
        });
    }

    show(onBackCallback) {
        this.container.classList.remove('hidden');
        this.onBack = onBackCallback;
        this.loadSettings();
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
