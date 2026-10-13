import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() { super({ key: 'BootScene' }); }
    create() {
        // The academy loading card is already visible in the initial HTML.
        this.scene.start('PreloadScene');
    }
}
