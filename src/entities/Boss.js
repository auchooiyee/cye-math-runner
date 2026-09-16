import Phaser from 'phaser';
import { EVENTS } from '../config/constants.js';

export default class Boss {
  constructor(scene, bossData) {
    this.scene = scene;
    this.name = bossData.name || 'Boss';
    this.maxHp = bossData.hp || 100;
    this.hp = this.maxHp;
    this.questionsToDefeat = bossData.questionsToDefeat || 3;
    this.reward = bossData.reward || 1000;
    this.color = bossData.color || '#ff0000';
    this.sprite = null;
    this.isDefeated = false;
    this.questionsAnswered = 0;
  }
  
  spawn() {
    this.sprite = this.scene.add.sprite(640, -100, 'boss-sprite');
    this.scene.tweens.add({
      targets: this.sprite,
      y: 200,
      duration: 1000,
      ease: 'Bounce.easeOut'
    });
  }
  
  takeDamage() {
    this.questionsAnswered++;
    const damage = this.maxHp / this.questionsToDefeat;
    this.hp -= damage;
    
    // Screen shake
    this.scene.cameras.main.shake(200, 0.01);
    
    this.scene.events.emit(EVENTS.BOSS_HP_CHANGED, { hp: this.hp, maxHp: this.maxHp });
    
    if (this.hp <= 0) {
      this.defeated();
    }
  }
  
  attack() {
    if (this.sprite) {
      this.scene.tweens.add({
        targets: this.sprite,
        x: '+=20',
        yoyo: true,
        repeat: 5,
        duration: 50
      });
    }
    // Player takes damage (assumes scene handles calling player.takeDamage)
  }
  
  defeated() {
    this.isDefeated = true;
    this.scene.events.emit(EVENTS.BOSS_DEFEATED, { reward: this.reward });
    
    if (this.sprite) {
      this.scene.tweens.add({
        targets: this.sprite,
        y: -200,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          this.sprite.destroy();
          this.sprite = null;
        }
      });
      
      // Particles
      const particles = this.scene.add.particles(0, 0, 'particle', {
        x: this.sprite.x,
        y: this.sprite.y,
        speed: 200,
        lifespan: 1000,
        quantity: 30,
        gravityY: 200
      });
      particles.explode();
    }
  }
  
  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}
