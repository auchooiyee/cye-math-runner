import Phaser from 'phaser';
import { formatMatrixNotation } from '../utils/MathFormatter.js';

const LANE_POSITIONS = [380, 640, 900];
const GROUND_Y = 620;

/**
 * MathGate — 3 doors spanning the 3 lanes with a prominent top HUD question banner.
 * Moves at a calm, readable pace giving 12-15 seconds of calculation time.
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

    // Calculate calm, paced speed: gives 12 to 15 seconds to solve!
    const travelDistance = GROUND_Y - (-100); // 720 px
    const calculationTimeSeconds = Math.max(12, questionData.timeLimit || 15);
    this.speed = travelDistance / calculationTimeSeconds; // approx 48-60 px/s

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
    this.questionCategory.setText(`⚡ MATHEMATICS CHALLENGE${topic} • CHOOSE LANE`);
    this.questionText.setText(formatMatrixNotation(questionData.question));
    this.questionBanner.setVisible(true);

    // Position doors at top to glide down
    this.gateY = -100;
    for (let i = 0; i < 3; i++) {
      this.doors[i].enableBody(true, LANE_POSITIONS[i], this.gateY, true, true);
      this.doors[i].body.setAllowGravity(false);
      this.doors[i].body.setImmovable(true);
      this.doors[i].setTexture('gate-door');
      this.doors[i].setVelocity(0, this.speed);

      this.labels[i].setText(formatMatrixNotation(selectedOptions[i]));
      this.labels[i].setPosition(LANE_POSITIONS[i], this.gateY);
      this.labels[i].setVisible(true);
    }
  }

  deactivate() {
    this.active = false;
    this.checked = false;
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
    return this.active && !this.checked && this.gateY >= GROUND_Y - 70 && this.gateY <= GROUND_Y + 20;
  }
}
