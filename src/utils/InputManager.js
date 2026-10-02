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
    this.touchControls = [];
    this.handleSwipeStart = null;
    this.handleSwipeEnd = null;
    
    this.setup();
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  setup() {
    // Keyboard
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pauseKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    
    // Touch swipe detection
    if (isTouchDevice()) {
      this.setupSwipe();
      this.createTouchControls();
    }
  }

  setupSwipe() {
    this.handleSwipeStart = (pointer) => {
      this.swipeStartX = pointer.x;
      this.swipeStartY = pointer.y;
      this.swipeStartTime = this.scene.time.now;
    };

    this.handleSwipeEnd = (pointer) => {
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
    };

    this.scene.input.on('pointerdown', this.handleSwipeStart);
    this.scene.input.on('pointerup', this.handleSwipeEnd);
  }

  createTouchControls() {
    const { width, height } = this.scene.cameras.main;
    const controls = [
      { x: 72, y: height - 72, symbol: '◀', label: 'LEFT', action: 'onLeft' },
      { x: 168, y: height - 72, symbol: '▶', label: 'RIGHT', action: 'onRight' },
      { x: width - 168, y: height - 72, symbol: '▲', label: 'JUMP', action: 'onJump' },
      { x: width - 72, y: height - 72, symbol: '▼', label: 'SLIDE', action: 'onSlide' }
    ];

    controls.forEach(control => {
      const container = this.scene.add.container(control.x, control.y)
        .setDepth(45)
        .setScrollFactor(0)
        .setAlpha(0.68);
      const background = this.scene.add.circle(0, 0, 39, 0x06152f, 0.9)
        .setStrokeStyle(3, 0x00f3ff, 0.9)
        .setInteractive({ useHandCursor: true });
      const symbol = this.scene.add.text(0, -7, control.symbol, {
        fontSize: '28px', fontFamily: "'Arial', sans-serif", color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);
      const label = this.scene.add.text(0, 22, control.label, {
        fontSize: '9px', fontFamily: "'Orbitron', sans-serif", color: '#00ffff', fontStyle: 'bold'
      }).setOrigin(0.5);

      const press = () => {
        if (!this.enabled) return;
        container.setAlpha(1).setScale(0.92);
        this.callbacks[control.action]?.();
      };
      const release = () => container.setAlpha(this.enabled ? 0.68 : 0.25).setScale(1);

      background.on('pointerdown', press);
      background.on('pointerup', release);
      background.on('pointerout', release);
      container.add([background, symbol, label]);
      this.touchControls.push({ container, background });
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

  enable() {
    this.enabled = true;
    this.touchControls.forEach(({ container, background }) => {
      container.setAlpha(0.68);
      background.setInteractive({ useHandCursor: true });
    });
  }

  disable() {
    this.enabled = false;
    this.touchControls.forEach(({ container, background }) => {
      container.setAlpha(0.25).setScale(1);
      background.disableInteractive();
    });
  }
  
  destroy() {
    if (this.handleSwipeStart) this.scene.input.off('pointerdown', this.handleSwipeStart);
    if (this.handleSwipeEnd) this.scene.input.off('pointerup', this.handleSwipeEnd);
    this.touchControls.forEach(({ container }) => container.destroy(true));
    this.touchControls = [];
  }
}
