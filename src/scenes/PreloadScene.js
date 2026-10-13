import Phaser from 'phaser';
import AssetGenerator from '../utils/AssetGenerator.js';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this.load.json('questions', 'data/questions.json');
        this.load.json('zones', 'data/zones.json');
        this.load.json('bosses', 'data/bosses.json');
        for (const key of ['campus', 'skybridge', 'garden', 'city', 'runner', 'runner-slide']) {
            this.load.image(`academy-${key}`, `assets/academy/${key}.webp`);
            if (!key.startsWith('runner')) this.load.image(`academy-${key}-clean`, `assets/academy/${key}-clean.webp`);
        }

        for (const key of ['runner-cycle-v2', 'runner-slide-v2', 'track-v2']) {
            this.load.image(`academy-${key}`, `assets/academy/${key}.webp`);
        }

        const progress = document.getElementById('academy-load-progress');
        const status = document.getElementById('academy-load-status');
        this.load.on('progress', value => {
            if (progress) progress.value = value;
            if (status) status.textContent = `Preparing your run · ${Math.round(value * 100)}%`;
        });
    }

    create() {
        // Generate all high-definition procedural vector sprites and backgrounds
        AssetGenerator.generateAll(this);

        document.getElementById('academy-loading')?.remove();
        this.scene.start('MainMenuScene');
    }
}
