import Phaser from 'phaser';

const LANE_POSITIONS = [380, 640, 900];
const GROUND_Y = 620;

export default class Obstacle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    const textureKey = type === 'high' ? 'obstacle-high' : 'obstacle-low';
    super(scene, x, y, textureKey);
    this.obstacleType = type || 'low';

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
  }

  activate(laneIndex, type, speed) {
    this.obstacleType = type;
    const textureKey = type === 'high' ? 'obstacle-high' : 'obstacle-low';
    this.setTexture(textureKey);

    const laneX = LANE_POSITIONS[laneIndex];
    // 'low' obstacles sit on the ground — player must jump
    // 'high' obstacles float at head height — player must slide
    const yPos = type === 'high' ? GROUND_Y - 55 : GROUND_Y - 20;

    this.enableBody(true, laneX, -50, true, true);
    this.setPosition(laneX, -50);
    this.body.setSize(50, 40);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setVelocity(0, speed);
    this.lane = laneIndex;
    this.targetY = yPos;
  }

  deactivate() {
    this.disableBody(true, true);
    this.setVelocity(0, 0);
  }
}
