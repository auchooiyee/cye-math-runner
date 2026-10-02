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

    this.warning = this.createWarning(scene);
    this.warningTween = null;
  }

  createWarning(scene) {
    const container = scene.add.container(this.x, 184).setDepth(18).setVisible(false);
    const glow = scene.add.rectangle(0, 0, 156, 48, 0x12091e, 0.94)
      .setStrokeStyle(2, 0xffcc00, 1);
    const icon = scene.add.text(-58, 0, '⚠', {
      fontSize: '24px', fontFamily: "'Arial', sans-serif", color: '#ffcc00', fontStyle: 'bold'
    }).setOrigin(0.5);
    const label = scene.add.text(18, 0, 'JUMP', {
      fontSize: '17px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add([glow, icon, label]);
    container.warningLabel = label;
    return container;
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
    this.body.setSize(44, 32);
    this.setVelocity(0, speed);
    this.lane = laneIndex;
    this.targetY = yPos;

    this.warning.setPosition(laneX, 184).setVisible(true).setAlpha(1);
    this.warning.warningLabel.setText(type === 'high' ? 'SLIDE' : 'JUMP');
    this.warningTween?.stop();
    this.warningTween = this.scene.tweens.add({
      targets: this.warning,
      alpha: 0.45,
      duration: 320,
      yoyo: true,
      repeat: -1
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.warning.visible && this.y >= 225) {
      this.hideWarning();
    }
  }

  hideWarning() {
    this.warningTween?.stop();
    this.warningTween = null;
    this.warning.setVisible(false).setAlpha(1);
  }

  deactivate() {
    this.hideWarning();
    this.disableBody(true, true);
    this.setVelocity(0, 0);
  }
}
