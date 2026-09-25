import Phaser from 'phaser';
import { formatMatrixNotation } from '../utils/MathFormatter.js';
import audioManager from '../utils/AudioManager.js';

const LANE_POSITIONS = [380, 640, 900];
const GROUND_Y = 620;
const GATE_START_Y = 250; // Visible top position under question card

/**
 * MathGate — 3 doors spanning the 3 lanes with a prominent top HUD question banner.
 * Auto-pauses for 4 seconds so student can read and calculate, then descends slowly.
 */
export default class MathGate {
  constructor(scene) {
    this.scene = scene;
    this.doors = [];
    this.labels = [];
    this.questionBanner = null;
    this.questionText = null;
    this.questionCategory = null;
    this.active = false;
    this.checked = false;
    this.isCalculationPaused = false;
    this.pauseTimer = null;
    this.countdownEvent = null;
    this.correctLane = -1;
    this.currentQuestion = null;
    this.speed = 0;
    this.gateY = -200;

    this.createDoors();
  }

  createDoors() {
    // 1. Prominent Fixed Top HUD Question Card
    this.questionBanner = this.scene.add.container(640, 102).setDepth(30).setVisible(false).setScrollFactor(0);
    
    // Cyber container background with neon glow border
    const bg = this.scene.add.rectangle(0, 0, 920, 118, 0x050c1e, 0.94);
    bg.setStrokeStyle(2, 0x00f3ff, 0.9);

    // Decorative inner tech accents
    const innerBar = this.scene.add.rectangle(0, -56, 916, 4, 0x00f3ff, 0.7);
    const badgeBg = this.scene.add.rectangle(0, -36, 460, 22, 0x0a1c3d, 0.85);
    badgeBg.setStrokeStyle(1, 0x00ff88, 0.8);

    this.questionCategory = this.scene.add.text(0, -36, '⚡ MATHEMATICS CHALLENGE • SOLVE & CHOOSE LANE', {
      fontSize: '12px', fontFamily: "'Orbitron', sans-serif", color: '#00ff88', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.questionText = this.scene.add.text(0, 14, '', {
      fontSize: '18px',
      fontFamily: "'Fira Code', Consolas, monospace",
      color: '#ffea6c',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 4,
      stroke: '#000000',
      strokeThickness: 2,
      wordWrap: { width: 880 }
    }).setOrigin(0.5);

    this.questionBanner.add([bg, innerBar, badgeBg, this.questionCategory, this.questionText]);

    // 2. Three Door Sprites with Answer Labels
    for (let i = 0; i < 3; i++) {
      const door = this.scene.physics.add.sprite(LANE_POSITIONS[i], -300, 'gate-door');
      door.body.setAllowGravity(false);
      door.body.setImmovable(true);
      door.disableBody(true, true);
      door.setDepth(5);
      this.doors.push(door);

      const label = this.scene.add.text(LANE_POSITIONS[i], -300, '', {
        fontSize: '22px',
        fontFamily: "'Fira Code', 'Rajdhani', monospace",
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 3,
        stroke: '#000000',
        strokeThickness: 4,
        wordWrap: { width: 170 }
      }).setOrigin(0.5).setVisible(false).setDepth(6);
      this.labels.push(label);
    }
  }

  activate(questionData) {
    this.currentQuestion = questionData;
    this.active = true;
    this.checked = false;
    this.isCalculationPaused = true;

    // Clear any pending timers
    if (this.pauseTimer) {
      this.pauseTimer.remove();
      this.pauseTimer = null;
    }
    if (this.countdownEvent) {
      this.countdownEvent.remove();
      this.countdownEvent = null;
    }

    // Select 3 options: correct + 2 wrong
    const correctStr = questionData.options[questionData.answer];
    const wrongOptions = questionData.options.filter((_, i) => i !== questionData.answer);

    // Shuffle wrong options and pick 2
    for (let i = wrongOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wrongOptions[i], wrongOptions[j]] = [wrongOptions[j], wrongOptions[i]];
    }
    const selectedOptions = [correctStr, wrongOptions[0], wrongOptions[1]];

    // Shuffle the 3 selected options to randomize lane
    for (let i = selectedOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedOptions[i], selectedOptions[j]] = [selectedOptions[j], selectedOptions[i]];
    }

    this.correctLane = selectedOptions.indexOf(correctStr);

    // Display question in fixed top banner
    const topic = questionData.topic ? ` • ${questionData.topic.toUpperCase()}` : '';
    this.questionText.setText(formatMatrixNotation(questionData.question));
    this.questionBanner.setVisible(true);

    // Position doors at GATE_START_Y (visible under banner, initially paused)
    this.gateY = GATE_START_Y;
    for (let i = 0; i < 3; i++) {
      this.doors[i].enableBody(true, LANE_POSITIONS[i], this.gateY, true, true);
      this.doors[i].body.setAllowGravity(false);
      this.doors[i].body.setImmovable(true);
      this.doors[i].setTexture('gate-door');
      this.doors[i].setVelocity(0, 0); // Stationary during auto pause!
      this.doors[i].setAlpha(0);

      this.labels[i].setText(formatMatrixNotation(selectedOptions[i]));
      this.labels[i].setPosition(LANE_POSITIONS[i], this.gateY);
      this.labels[i].setVisible(true);
      this.labels[i].setAlpha(0);
    }

    // Quick smooth fade in
    this.scene.tweens.add({
      targets: [...this.doors, ...this.labels],
      alpha: 1,
      duration: 250,
      ease: 'Sine.easeOut'
    });

    // Auto-pause calculation countdown (4 seconds)
    const pauseDurationSeconds = 4;
    let secondsLeft = pauseDurationSeconds;
    this.questionCategory.setText(`⏸️ CALCULATION TIME (${secondsLeft}s)${topic} • READ & SOLVE`);
    this.questionCategory.setColor('#ffea00');

    this.countdownEvent = this.scene.time.addEvent({
      delay: 1000,
      repeat: pauseDurationSeconds - 1,
      callback: () => {
        secondsLeft--;
        if (secondsLeft > 0 && this.active && this.isCalculationPaused) {
          this.questionCategory.setText(`⏸️ CALCULATION TIME (${secondsLeft}s)${topic} • READ & SOLVE`);
        }
      }
    });

    // Calculate slow, steady descent speed
    const travelDistance = GROUND_Y - GATE_START_Y; // 620 - 250 = 370 px
    const calculationTimeSeconds = Math.max(13, (questionData.timeLimit || 15) - pauseDurationSeconds);
    this.speed = travelDistance / calculationTimeSeconds; // approx 26-28 px/s (calm and slow)

    // After pause duration: begin slow descent
    this.pauseTimer = this.scene.time.delayedCall(pauseDurationSeconds * 1000, () => {
      if (!this.active) return;
      this.isCalculationPaused = false;
      this.questionCategory.setText(`⚡ CHOOSE YOUR LANE!${topic} • DOORS DESCENDING`);
      this.questionCategory.setColor('#00ff88');
      audioManager.playClick();

      // Start doors descending slowly
      for (let i = 0; i < 3; i++) {
        if (this.doors[i] && this.doors[i].body) {
          this.doors[i].setVelocity(0, this.speed);
        }
      }

      // Notify scene to scroll background at calm pace
      this.scene.events.emit('mathgate-start-descending');
    });
  }

  deactivate() {
    this.active = false;
    this.checked = false;
    this.isCalculationPaused = false;
    if (this.pauseTimer) {
      this.pauseTimer.remove();
      this.pauseTimer = null;
    }
    if (this.countdownEvent) {
      this.countdownEvent.remove();
      this.countdownEvent = null;
    }
    this.questionBanner.setVisible(false);
    for (let i = 0; i < 3; i++) {
      this.doors[i].disableBody(true, true);
      this.doors[i].setVelocity(0, 0);
      this.labels[i].setVisible(false);
    }
  }

  checkAnswer(playerLane) {
    return {
      correct: playerLane === this.correctLane,
      correctAnswer: this.labels[this.correctLane]?.text || ''
    };
  }

  update() {
    if (!this.active) return;

    this.gateY = this.doors[0].y;

    // Keep labels locked to door positions
    for (let i = 0; i < 3; i++) {
      this.labels[i].setPosition(this.doors[i].x, this.doors[i].y);
    }

    // If scrolled past bottom, deactivate
    if (this.gateY > 800) {
      this.deactivate();
    }
  }

  showResult(correct) {
    for (let i = 0; i < 3; i++) {
      if (i === this.correctLane) {
        this.doors[i].setTexture('gate-correct');
      } else {
        this.doors[i].setTexture('gate-wrong');
      }
    }
    this.scene.time.delayedCall(700, () => {
      for (let i = 0; i < 3; i++) {
        this.doors[i].setTexture('gate-door');
      }
    });
  }

  isAtPlayerLevel() {
    return this.active && !this.isCalculationPaused && !this.checked && this.gateY >= GROUND_Y - 70 && this.gateY <= GROUND_Y + 20;
  }
}
