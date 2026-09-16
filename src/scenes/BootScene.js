import Phaser from 'phaser';
import { SCENES } from '../config/constants.js';
import { COLORS } from '../config/gameConfig.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.DARK_BG || 0x0a0a1a);
        
        const { width, height } = this.cameras.main;
        const text = this.add.text(width / 2, height / 2, 'CYE MATH RUNNER', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.time.delayedCall(500, () => {
            this.scene.start('PreloadScene');
        });
    }
}
