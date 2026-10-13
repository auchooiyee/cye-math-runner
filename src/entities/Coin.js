import { placeOnTrack } from '../systems/TrackObject.js';
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

  activate(laneIndex, extraDistance, speed) {
    placeOnTrack(this, laneIndex, speed, extraDistance);
  }

  deactivate() {
    this.disableBody(true, true);
    this.setVelocity(0, 0);
  }
}
