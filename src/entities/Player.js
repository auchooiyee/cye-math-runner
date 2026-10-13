import Phaser from 'phaser';
import { EVENTS } from '../config/constants.js';
import audioManager from '../utils/AudioManager.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    this.scene = scene;
    
    // Config
    this.LANE_POSITIONS = [380, 640, 900];
    this.LANE_SWITCH_DURATION = 120;
    this.SLIDE_DURATION = 650;
    this.INITIAL_SHIELDS = 3;
    this.MAX_SHIELDS = 5;
    this.INVINCIBILITY_DURATION = 1000;
    this.JUMP_VELOCITY = -650;
    this.GROUND_Y = 620;
    
    // Properties
    this.currentLane = 1;
    this.shields = this.INITIAL_SHIELDS;
    this.isJumping = false;
    this.isSliding = false;
    this.isInvincible = false;
    this.isDead = false;
    this.laneTween = null;

    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Physics properties
    this.setCollideWorldBounds(true);
    this.body.setSize(32, 50).setOffset(8, 14);
    this.setPosition(this.LANE_POSITIONS[this.currentLane], this.GROUND_Y - 32);
    // Artwork has its own display size; the existing collision body stays 32×50.
    this.setVisible(false);
    this.runClock = 0;
    this.shadow = scene.add.ellipse(this.x, this.GROUND_Y + 1, 65, 17, 0x172940, .3).setDepth(19);
    this.art = scene.add.sprite(this.x, this.y + 32, 'runner-cycle', 0)
      .setOrigin(.5, 1).setDisplaySize(174, 174).setDepth(20);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    const targetGroundY = this.isSliding ? this.GROUND_Y - 16 : this.GROUND_Y - 32;
    if (this.y > targetGroundY && this.body.velocity.y >= 0) {
      this.y = targetGroundY;
      this.setVelocityY(0);
      this.body.blocked.down = true;
      this.isJumping = false;
    }
    if (this.body.velocity.y >= 0 && (this.body.blocked.down || this.body.touching.down)) {
      this.isJumping = false;
    }
    if (!this.art) return;
    const running = this.scene.isRunning && !this.scene.isPaused && this.scene.runnerSystem.getSpeed() > 0 && !this.isDead;
    if (running && !this.isJumping && !this.isSliding) {
      this.runClock += delta * Math.max(.75, Math.min(1.8, this.scene.runnerSystem.getSpeed() / 300));
    }
    if (this.isSliding) {
      this.art.setTexture('academy-runner-slide-v2').setDisplaySize(110, 76);
    } else {
      const frame = this.isJumping ? 3 : Math.floor(this.runClock / 85) % 8;
      this.art.setTexture('runner-cycle', frame).setDisplaySize(174, 174);
    }
    this.art.setPosition(this.x, this.y + (this.isSliding ? 16 : 32)).setAngle(this.angle).setAlpha(this.alpha);
    const lift = Math.max(0, this.GROUND_Y - 32 - this.y);
    this.shadow.setPosition(this.x, this.GROUND_Y + 1).setScale(Math.max(.5, 1 - lift / 400)).setAlpha(.3 * this.alpha);
  }

  moveLeft() {
    this.moveToLane(this.currentLane - 1);
  }

  moveRight() {
    this.moveToLane(this.currentLane + 1);
  }

  moveToLane(lane) {
    if (this.isDead || lane < 0 || lane > 2 || lane === this.currentLane) return;
    const direction = lane < this.currentLane ? -14 : 14;
    this.currentLane = lane;
    this.switchLane(direction);
  }

  switchLane(leanAngle) {
    if (this.laneTween?.isPlaying()) {
      this.laneTween.stop();
    }
    this.setAngle(leanAngle);
    this.laneTween = this.scene.tweens.add({
      targets: this,
      x: this.LANE_POSITIONS[this.currentLane],
      angle: 0,
      duration: this.LANE_SWITCH_DURATION,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.laneTween = null;
      }
    });
  }

  jump() {
    const isGrounded = this.body.blocked.down || this.body.touching.down || (this.y >= this.GROUND_Y - 36 && Math.abs(this.body.velocity.y) < 20);
    if (isGrounded && !this.isSliding && !this.isDead) {
      this.setVelocityY(this.JUMP_VELOCITY);
      this.isJumping = true;
      audioManager.playJump();
    }
  }

  slide() {
    const isGrounded = this.body.blocked.down || this.body.touching.down || (this.y >= this.GROUND_Y - 36);
    if (!this.isSliding && isGrounded && !this.isDead) {
      this.isSliding = true;
      this.setTexture('player-slide');
      this.body.setSize(48, 22).setOffset(8, 10);
      this.y = this.GROUND_Y - 16;
      audioManager.playSlide();

      this.scene.time.delayedCall(this.SLIDE_DURATION, () => {
        if (!this.isDead) {
          this.isSliding = false;
          this.setTexture('player');
          this.body.setSize(32, 50).setOffset(8, 14);
          this.setAngle(0);
          this.y = this.GROUND_Y - 32;
          this.setVelocityY(0);
          this.body.blocked.down = true;
        }
      });
    }
  }

  takeDamage() {
    if (this.isInvincible || this.isDead) return;
    
    audioManager.playDamage();
    this.shields--;
    this.scene.events.emit(EVENTS.SHIELD_CHANGED, this.shields);
    
    if (this.shields <= 0) {
      this.die();
    } else {
      this.isInvincible = true;
      this.scene.tweens.add({
        targets: this,
        alpha: 0.2,
        yoyo: true,
        repeat: 5,
        duration: this.INVINCIBILITY_DURATION / 10,
        onComplete: () => {
          this.alpha = 1;
          this.isInvincible = false;
        }
      });
    }
  }

  die() {
    this.isDead = true;
    this.scene.events.emit(EVENTS.GAME_OVER);
    this.body.setVelocity(0, 0);
  }

  collectCoin() {
    this.scene.events.emit(EVENTS.COIN_COLLECTED);
  }

  addShield() {
    if (this.shields < this.MAX_SHIELDS && !this.isDead) {
      this.shields++;
      this.scene.events.emit(EVENTS.SHIELD_CHANGED, this.shields);
    }
  }

  reset() {
    this.currentLane = 1;
    this.shields = this.INITIAL_SHIELDS;
    this.isJumping = false;
    this.isSliding = false;
    this.isInvincible = false;
    this.isDead = false;
    this.alpha = 1;
    this.setAngle(0);
    this.laneTween?.stop();
    this.laneTween = null;
    
    this.setTexture('player');
    this.body.setSize(32, 50).setOffset(8, 14);
    this.setPosition(this.LANE_POSITIONS[this.currentLane], this.GROUND_Y - 32);
    this.setVelocity(0, 0);
  }
}
