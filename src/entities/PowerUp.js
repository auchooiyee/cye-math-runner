import Phaser from 'phaser';

const LANE_POSITIONS = [380, 640, 900];
const GROUND_Y = 620;

export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    const textureMap = {
      shield: 'powerup-shield',
      hint: 'powerup-hint',
      coin_magnet: 'powerup-magnet',
      magnet: 'powerup-magnet'
    };
    super(scene, x, y, textureMap[type] || 'powerup-shield');
    this.powerType = type || 'shield';

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
  }

  activate(laneIndex, type, speed) {
    const textureMap = {
      shield: 'powerup-shield',
      hint: 'powerup-hint',
      coin_magnet: 'powerup-magnet',
      magnet: 'powerup-magnet'
    };
    this.powerType = type;
    this.setTexture(textureMap[type] || 'powerup-shield');

    const laneX = LANE_POSITIONS[laneIndex];
    this.enableBody(true, laneX, -50, true, true);
    this.body.setAllowGravity(false);
    this.setVelocity(0, speed);
  }

  deactivate() {
    this.disableBody(true, true);
    this.setVelocity(0, 0);
  }
}
