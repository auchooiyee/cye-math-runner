import { EVENTS } from '../config/constants.js';

export default class ComboSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentCombo = 0;
    this.bestCombo = 0;
    this.isFever = false;
    this.feverTimer = null;
    
    this.FEVER_THRESHOLD = 5;
    this.FEVER_DURATION = 10000;
    this.MULTIPLIERS = [1, 1.2, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0];
  }
  
  increment() {
    this.currentCombo++;
    if (this.currentCombo > this.bestCombo) {
      this.bestCombo = this.currentCombo;
    }
    
    const multiplier = this.getMultiplier();
    this.scene.events.emit(EVENTS.COMBO_CHANGED, { combo: this.currentCombo, multiplier });
    
    if (this.currentCombo >= this.FEVER_THRESHOLD && !this.isFever) {
      this.activateFever();
    }
  }
  
  reset() {
    if (this.currentCombo > 0) {
      this.currentCombo = 0;
      this.scene.events.emit(EVENTS.COMBO_RESET);
    }
    this.deactivateFever();
  }
  
  getMultiplier() {
    const index = Math.min(this.currentCombo, this.MULTIPLIERS.length - 1);
    return this.MULTIPLIERS[index];
  }
  
  activateFever() {
    this.isFever = true;
    this.scene.events.emit(EVENTS.MATH_FEVER);
    this.feverTimer = this.scene.time.delayedCall(this.FEVER_DURATION, () => {
      this.deactivateFever();
    });
  }
  
  deactivateFever() {
    this.isFever = false;
    if (this.feverTimer) {
      this.feverTimer.destroy();
      this.feverTimer = null;
    }
  }
  
  getBestCombo() { return this.bestCombo; }
  getCurrentCombo() { return this.currentCombo; }
  getIsFever() { return this.isFever; }
  
  destroy() { this.deactivateFever(); }
}
