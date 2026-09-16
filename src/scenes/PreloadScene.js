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

        const { width, height } = this.cameras.main;

        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x0a142e, 0.9);
        progressBox.lineStyle(2, 0x00ffff, 1);
        progressBox.strokeRect(width / 2 - 160, height / 2 - 25, 320, 50);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const progressBar = this.add.graphics();

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'INITIALIZING CYE MATHVERSE...', {
            fontSize: '18px', fontFamily: 'Arial', color: '#00ffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00ffcc, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    create() {
        // Generate all high-definition procedural vector sprites and backgrounds
        AssetGenerator.generateAll(this);

        this.scene.start('MainMenuScene');
    }
}
