import { EVENTS } from '../config/constants.js';

export default class PowerUpSystem {
  constructor(scene) {
    this.scene = scene;
    this.activeEffects = {};
    this.hasHint = false;
    
    this.POWERUP_DURATIONS = {
      coin_magnet: 10000
    };
  }
  
  activate(type) {
    switch(type) {
      case 'shield':
        this.scene.events.emit(EVENTS.POWERUP_ACTIVATED, { type: 'shield' });
        break;
      case 'hint':
        this.hasHint = true;
        this.scene.events.emit(EVENTS.POWERUP_ACTIVATED, { type: 'hint' });
        break;
      case 'magnet':
      case 'coin_magnet':
        type = 'coin_magnet';
        if (this.activeEffects.coin_magnet && this.activeEffects.coin_magnet.timer) {
          this.activeEffects.coin_magnet.timer.destroy();
        }
        
        this.activeEffects.coin_magnet = {
          active: true,
          timer: this.scene.time.delayedCall(this.POWERUP_DURATIONS.coin_magnet, () => {
            this.deactivate('coin_magnet');
          })
        };
        this.scene.events.emit(EVENTS.POWERUP_ACTIVATED, { type: 'coin_magnet' });
        break;
    }
  }
  
  deactivate(type) {
    if (this.activeEffects[type]) {
      this.activeEffects[type].active = false;
      if (this.activeEffects[type].timer) {
        this.activeEffects[type].timer.destroy();
      }
      delete this.activeEffects[type];
      this.scene.events.emit(EVENTS.POWERUP_EXPIRED, { type });
    }
  }
  
  isActive(type) {
    return this.activeEffects[type]?.active || false;
  }
  
  consumeHint() {
    if (this.hasHint) {
      this.hasHint = false;
      return true;
    }
    return false;
  }
  
  reset() {
    Object.keys(this.activeEffects).forEach(type => this.deactivate(type));
    this.hasHint = false;
  }
  
  destroy() { 
    this.reset(); 
  }
}
