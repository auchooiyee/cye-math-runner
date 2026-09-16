import Phaser from 'phaser';
import { isTouchDevice } from './DeviceUtils.js';

export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.cursors = null;
    this.spaceKey = null;
    this.pauseKey = null;
    this.enabled = true;
    this.callbacks = {
      onLeft: null,
      onRight: null,
      onJump: null,
      onSlide: null,
      onPause: null
    };
    
    this.swipeStartX = 0;
    this.swipeStartY = 0;
    this.swipeStartTime = 0;
    
    this.setup();
  }

  setup() {
    // Keyboard
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pauseKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    
    // Touch swipe detection
    if (isTouchDevice()) {
      this.setupSwipe();
    }
  }

  setupSwipe() {
    this.scene.input.on('pointerdown', (pointer) => {
      this.swipeStartX = pointer.x;
      this.swipeStartY = pointer.y;
      this.swipeStartTime = this.scene.time.now;
    });

    this.scene.input.on('pointerup', (pointer) => {
      if (!this.enabled) return;

      const swipeEndTime = this.scene.time.now;
      const swipeDuration = swipeEndTime - this.swipeStartTime;
      
      const swipeDistanceX = pointer.x - this.swipeStartX;
      const swipeDistanceY = pointer.y - this.swipeStartY;
      
      const absDistanceX = Math.abs(swipeDistanceX);
      const absDistanceY = Math.abs(swipeDistanceY);
      
      // Swipe thresholds: min 40px distance, max 400ms duration
      const minDistance = 40;
      const maxDuration = 400;

      if (swipeDuration <= maxDuration) {
        if (absDistanceX > absDistanceY && absDistanceX >= minDistance) {
          // Horizontal swipe
          if (swipeDistanceX < 0) {
            this.callbacks.onLeft?.();
          } else {
            this.callbacks.onRight?.();
          }
        } else if (absDistanceY > absDistanceX && absDistanceY >= minDistance) {
          // Vertical swipe
          if (swipeDistanceY < 0) {
            this.callbacks.onJump?.();
          } else {
            this.callbacks.onSlide?.();
          }
        }
      }
    });
  }

  update() {
    if (!this.enabled) return;
    
    // Check keyboard JustDown for each action
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.callbacks.onLeft?.();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.callbacks.onRight?.();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.callbacks.onJump?.();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.callbacks.onSlide?.();
    }
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.callbacks.onPause?.();
    }
  }

  setCallbacks(callbacks) {
    Object.assign(this.callbacks, callbacks);
  }

  enable() { this.enabled = true; }
  disable() { this.enabled = false; }
  
  destroy() {
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointerup');
  }
}
