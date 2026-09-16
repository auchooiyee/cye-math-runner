import Phaser from 'phaser';

const LANE_POSITIONS = [380, 640, 900];
const GROUND_Y = 620;

export default class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'coin');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
  }

  activate(laneX, startY, speed) {
    this.enableBody(true, laneX, startY, true, true);
    this.body.setAllowGravity(false);
    this.setVelocity(0, speed);
  }

  deactivate() {
    this.disableBody(true, true);
    this.setVelocity(0, 0);
  }
}
