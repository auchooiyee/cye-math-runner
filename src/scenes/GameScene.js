import Phaser from 'phaser';
import LaneSystem from '../systems/LaneSystem.js';
import RunnerSystem from '../systems/RunnerSystem.js';
import SpawnSystem from '../systems/SpawnSystem.js';
import QuestionSystem from '../systems/QuestionSystem.js';
import DifficultySystem from '../systems/DifficultySystem.js';
import ComboSystem from '../systems/ComboSystem.js';
import ScoreSystem from '../systems/ScoreSystem.js';
import PowerUpSystem from '../systems/PowerUpSystem.js';
import Player from '../entities/Player.js';
import InputManager from '../utils/InputManager.js';
import HUD from '../ui/HUD.js';
import MathGateUI from '../ui/MathGateUI.js';
import ZoneSystem from '../systems/ZoneSystem.js';
import audioManager from '../utils/AudioManager.js';
import { EVENTS } from '../config/constants.js';

const GROUND_Y = 620;
const LANE_POSITIONS = [380, 640, 900];

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.mode = data.mode || 'endless';
    this.difficulty = data.difficulty || { min: 1, max: 2, label: 'EASY' };
    this.sprintDuration = data.sprintDuration || 300;
    this.sprintTimeRemaining = this.sprintDuration;
    this.targetQuestions = data.targetQuestions || 15;
    this.sprintQuestionsCompleted = 0;
    this.isRunning = false;
    this.isPaused = false;
  }

  create() {
    this.cameras.main.setBackgroundColor('#0a0a1a');

    // ── Systems ──
    this.laneSystem = new LaneSystem(this);
    this.runnerSystem = new RunnerSystem(this);
    this.spawnSystem = new SpawnSystem(this);
    this.questionSystem = new QuestionSystem();
    this.difficultySystem = new DifficultySystem(this);
    this.comboSystem = new ComboSystem(this);
    this.scoreSystem = new ScoreSystem(this);
    this.powerUpSystem = new PowerUpSystem(this);
    this.zoneSystem = new ZoneSystem(this);

    // Sprint mode settings
    if (this.mode === 'sprint') {
      this.spawnSystem.setGateDistance(400); // gates spawn every 400m for high question density
    }

    // Listen for zone changes
    this.events.on('zone-changed', (zone) => {
      this.onZoneChanged(zone);
    });

    // Create ground, backgrounds
    this.runnerSystem.create();

    // Load questions from cache (loaded in PreloadScene)
    const questionsData = this.cache.json.get('questions');
    if (questionsData) {
      this.questionSystem.loadQuestions(questionsData);
    }
    this.difficultySystem.setRange(this.difficulty.min, this.difficulty.max);

    // ── Player ──
    this.player = new Player(this, LANE_POSITIONS[1], GROUND_Y - 30);
    this.player.currentLane = 1;

    // ── Spawned objects ──
    const pools = this.spawnSystem.create();
    this.obstacleGroup = pools.obstacleGroup;
    this.coinGroup = pools.coinGroup;
    this.powerUpGroup = pools.powerUpGroup;
    this.mathGate = pools.mathGate;

    // ── Physics collisions ──
    // Player stands on ground
    this.physics.add.collider(this.player, this.runnerSystem.groundPhysics);

    // Player vs obstacles — overlap detection
    this.physics.add.overlap(this.player, this.obstacleGroup, this.hitObstacle, null, this);

    // Player vs coins
    this.physics.add.overlap(this.player, this.coinGroup, this.collectCoin, null, this);

    // Player vs power-ups
    this.physics.add.overlap(this.player, this.powerUpGroup, this.collectPowerUp, null, this);

    // ── UI ──
    this.hud = new HUD(this);
    this.mathGateUI = new MathGateUI(this);

    if (this.mode === 'sprint') {
      this.hud.setSprintMode(this.sprintDuration, this.targetQuestions);
    }

    // ── Particle Emitters for Polish ──
    this.coinEmitter = this.add.particles(0, 0, 'coin', {
      speed: { min: 80, max: 220 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      lifespan: 300,
      gravityY: 300,
      emitting: false
    }).setDepth(15);

    this.sparkEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 90, max: 260 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      lifespan: 450,
      gravityY: 150,
      emitting: false
    }).setDepth(15);

    // ── Input ──
    this.inputManager = new InputManager(this);
    this.inputManager.setCallbacks({
      onLeft: () => { if (!this.isPaused) this.player.moveLeft(); },
      onRight: () => { if (!this.isPaused) this.player.moveRight(); },
      onJump: () => { if (!this.isPaused) this.player.jump(); },
      onSlide: () => { if (!this.isPaused) this.player.slide(); },
      onPause: () => this.togglePause()
    });

    // ── Pause overlay ──
    this.createPauseOverlay();

    // ── Event listeners ──
    this.events.on(EVENTS.SHIELD_CHANGED, (shields) => {
      this.hud.updateShields(shields);
    });

    this.events.on(EVENTS.MATH_FEVER, () => {
      this.hud.showFever();
      audioManager.playMathFever();
      audioManager.setBGMTempoMultiplier(1.25);
      this.runnerSystem.setSpeedMultiplier(1.3);
      this.time.delayedCall(10000, () => {
        audioManager.setBGMTempoMultiplier(1.0);
        this.runnerSystem.resetSpeedMultiplier();
      });
    });

    this.events.on(EVENTS.POWERUP_ACTIVATED, (data) => {
      if (data.type === 'shield') {
        this.player.addShield();
      }
      this.hud.showPowerUp(data.type);
    });

    this.events.on(EVENTS.POWERUP_EXPIRED, (data) => {
      this.hud.hidePowerUp(data.type);
    });

    // Boss events (from BossScene)
    this.events.on('boss-defeated', (reward) => {
      this.scoreSystem.addBossDefeat(reward || 500);
      this.resumeFromBoss();
    });
    this.events.on('boss-failed', () => {
      this.resumeFromBoss();
    });

    // Start background synthwave music
    audioManager.startBGM(125, 'Am');

    // ── Start ──
    this.isRunning = true;
    this.isPaused = false;

    // Initial HUD
    this.hud.updateShields(this.player.shields);
    this.hud.updateDistance(0);
    this.hud.updateScore(0);
    this.hud.updateCoins(0);
    
    // Initial Zone
    const lang = localStorage.getItem('CYE_MATH_RUNNER_LANGUAGE') || 'en';
    const initialZone = this.zoneSystem.getCurrentZone();
    this.hud.zoneText.setText(`ZONE 0${initialZone.id} | ${(lang === 'bm' ? initialZone.nameBm : initialZone.nameEn).toUpperCase()}`);
    this.hud.zoneText.setColor(initialZone.labelColor);
    
    // Initial color
    this.cameras.main.setBackgroundColor(initialZone.bgColor);
    if (this.runnerSystem.neonLine) {
      this.runnerSystem.neonLine.setTint(initialZone.accentHex);
    }
  }

  update(time, delta) {
    if (!this.isRunning || this.isPaused) return;

    // Input
    this.inputManager.update();

    // Runner system (parallax, speed, distance)
    this.runnerSystem.update(time, delta);

    const speed = this.runnerSystem.getSpeed();
    const distance = this.runnerSystem.getDistanceMetres();
    
    this.zoneSystem.update(distance);

    // Spawn system
    this.spawnSystem.update(time, delta, speed, distance);

    // Score distance
    this.scoreSystem.updateDistance(distance);

    // Update HUD
    this.hud.updateDistance(distance);
    this.hud.updateScore(this.scoreSystem.getDisplayScore());
    this.hud.updateCoins(this.scoreSystem.totalCoins);

    // ── Sprint Mode Countdown Timer ──
    if (this.mode === 'sprint') {
      this.sprintTimeRemaining -= (delta / 1000);
      this.hud.updateSprintTimer(this.sprintTimeRemaining);

      if (this.sprintTimeRemaining <= 0) {
        this.sprintTimeRemaining = 0;
        this.handleSprintFinish("TIME'S UP!");
        return;
      }
    }

    // ── Math Gate check ──
    if (this.mathGate && this.mathGate.isAtPlayerLevel()) {
      this.mathGate.checked = true;
      const result = this.mathGate.checkAnswer(this.player.currentLane);

      if (result.correct) {
        audioManager.playCorrect();
        this.sparkEmitter.setParticleTint(0x00ff88);
        this.sparkEmitter.explode(18, this.player.x, this.player.y);
        this.comboSystem.increment();
        const points = this.mathGate.currentQuestion.points || 100;
        const earned = this.scoreSystem.addCorrectAnswer(points, this.comboSystem.getMultiplier());
        this.difficultySystem.recordAnswer(true);
        this.hud.showCorrect(earned);
        this.mathGate.showResult(true);
      } else {
        audioManager.playWrong();
        this.cameras.main.shake(200, 0.015);
        this.sparkEmitter.setParticleTint(0xff0044);
        this.sparkEmitter.explode(12, this.player.x, this.player.y);
        this.comboSystem.reset();
        this.scoreSystem.addWrongAnswer(-50);
        this.difficultySystem.recordAnswer(false);
        this.player.takeDamage();
        this.hud.showWrong();
        this.mathGate.showResult(false);
      }

      this.hud.updateCombo(this.comboSystem.getCurrentCombo(), this.comboSystem.getMultiplier());
      const explanation = this.mathGate.currentQuestion.explanation || '';
      if (explanation) {
        this.mathGateUI.showExplanation(explanation, 2500);
      }

      // Track progress in Sprint mode
      if (this.mode === 'sprint') {
        this.sprintQuestionsCompleted++;
        this.hud.updateSprintProgress(this.sprintQuestionsCompleted, this.targetQuestions);
        if (this.sprintQuestionsCompleted >= this.targetQuestions) {
          this.time.delayedCall(1200, () => {
            this.handleSprintFinish("EXAM COMPLETED!");
          });
        }
      }

      // Deactivate gate after brief delay and restore speed
      this.time.delayedCall(700, () => {
        this.mathGate.deactivate();
        this.runnerSystem.resetSpeedMultiplier();
      });
    }

    // ── Spawn new gate? ──
    if (this.spawnSystem.shouldSpawnGate(distance) && !this.mathGate.active) {
      const range = this.difficultySystem.getDifficultyRange();
      // In Sprint mode, questions test all Form 5 topics (chapter = null)
      const chapter = (this.mode === 'sprint') ? null : this.zoneSystem.getCurrentChapter();
      const question = this.questionSystem.getRandomQuestion(chapter, range.min, range.max);
      if (question) {
        this.runnerSystem.setSpeedMultiplier(0.4); // Calm calculation focus mode
        this.spawnSystem.spawnMathGate(question, speed);
      }
    }

    // ── Boss trigger? ──
    if (this.spawnSystem.shouldTriggerBoss(distance)) {
      this.spawnSystem.markBossTriggered();
      this.triggerBoss();
    }

    // ── Coin magnet effect ──
    if (this.powerUpSystem.isActive('coin_magnet')) {
      this.coinGroup.getChildren().forEach(coin => {
        if (coin.active) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, coin.x, coin.y);
          if (dist < 250) {
            this.physics.moveToObject(coin, this.player, 500);
          }
        }
      });
    }

    // ── Game over check ──
    if (this.player.isDead) {
      this.handleGameOver();
    }
  }

  // ── Collision handlers ──

  onZoneChanged(zone) {
    this.cameras.main.setBackgroundColor(zone.bgColor);
    if (this.runnerSystem.neonLine) {
      this.runnerSystem.neonLine.setTint(zone.accentHex);
    }
    audioManager.setZoneKey(zone.id);
    const lang = localStorage.getItem('CYE_MATH_RUNNER_LANGUAGE') || 'en';
    this.hud.updateZone(zone, lang);
    const r = (zone.accentHex >> 16) & 0xff;
    const g = (zone.accentHex >> 8) & 0xff;
    const b = zone.accentHex & 0xff;
    this.cameras.main.flash(400, r, g, b, true);
  }

  hitObstacle(player, obstacle) {
    if (!obstacle.active) return;

    if (obstacle.obstacleType === 'high' && player.isSliding) {
      obstacle.deactivate();
      return;
    }
    if (obstacle.obstacleType === 'low' && !player.body.blocked.down) {
      return;
    }
    if (!player.isInvincible) {
      this.cameras.main.shake(160, 0.012);
      player.takeDamage();
      obstacle.deactivate();
    }
  }

  collectCoin(player, coin) {
    if (!coin.active) return;
    audioManager.playCoin();
    this.coinEmitter.explode(5, coin.x, coin.y);
    coin.deactivate();
    this.scoreSystem.addCoin();
  }

  collectPowerUp(player, powerup) {
    if (!powerup.active) return;
    const type = powerup.powerType;
    powerup.deactivate();
    this.powerUpSystem.activate(type);
  }

  // ── Pause ──

  createPauseOverlay() {
    const w = 1280;
    const h = 720;
    this.pauseOverlay = this.add.container(0, 0).setDepth(100).setVisible(false).setScrollFactor(0);

    const bgDim = this.add.rectangle(w / 2, h / 2, w, h, 0x030614, 0.85);

    // Cyber Modal Card
    const modalBg = this.add.rectangle(w / 2, h / 2, 480, 360, 0x08122c, 0.95);
    modalBg.setStrokeStyle(3, 0x00f3ff, 0.9);

    const title = this.add.text(w / 2, h / 2 - 110, 'SYSTEM PAUSED', {
      fontSize: '34px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold',
      stroke: '#00f3ff', strokeThickness: 1
    }).setOrigin(0.5);

    const sub = this.add.text(w / 2, h / 2 - 70, 'CALCULATOR STANDBY', {
      fontSize: '14px', fontFamily: "'Rajdhani', sans-serif", color: '#00ff88', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Resume button
    const resumeBtn = this.add.container(w / 2, h / 2 + 10);
    const resumeBg = this.add.image(0, 0, 'button').setInteractive({ useHandCursor: true });
    const resumeTxt = this.add.text(0, 0, '▶ RESUME RUN', {
      fontSize: '20px', fontFamily: "'Orbitron', sans-serif", color: '#00ffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    resumeBtn.add([resumeBg, resumeTxt]);

    resumeBg.on('pointerover', () => {
      resumeBg.setTexture('button-hover');
      this.tweens.add({ targets: resumeBtn, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    resumeBg.on('pointerout', () => {
      resumeBg.setTexture('button');
      this.tweens.add({ targets: resumeBtn, scaleX: 1, scaleY: 1, duration: 100 });
    });
    resumeBg.on('pointerdown', () => {
      audioManager.playClick();
      this.togglePause();
    });

    // Quit button
    const quitBtn = this.add.container(w / 2, h / 2 + 85);
    const quitBg = this.add.image(0, 0, 'button').setInteractive({ useHandCursor: true });
    const quitTxt = this.add.text(0, 0, '✕ ABORT RUN', {
      fontSize: '20px', fontFamily: "'Orbitron', sans-serif", color: '#ff0055', fontStyle: 'bold'
    }).setOrigin(0.5);
    quitBtn.add([quitBg, quitTxt]);

    quitBg.on('pointerover', () => {
      quitBg.setTexture('button-hover');
      this.tweens.add({ targets: quitBtn, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    quitBg.on('pointerout', () => {
      quitBg.setTexture('button');
      this.tweens.add({ targets: quitBtn, scaleX: 1, scaleY: 1, duration: 100 });
    });
    quitBg.on('pointerdown', () => {
      audioManager.playClick();
      this.handleGameOver();
    });

    this.pauseOverlay.add([bgDim, modalBg, title, sub, resumeBtn, quitBtn]);
  }

  togglePause() {
    if (!this.isRunning) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
      this.runnerSystem.pause();
      this.pauseOverlay.setVisible(true);
      audioManager.stopBGM();
    } else {
      this.physics.resume();
      this.runnerSystem.resume();
      this.pauseOverlay.setVisible(false);
      audioManager.startBGM(125);
    }
  }

  // ── Boss ──

  triggerBoss() {
    this.runnerSystem.pause();
    this.physics.pause();
    this.isPaused = true;

    const bosses = this.cache.json.get('bosses') || [];
    const bossData = this.zoneSystem.getBossForCurrentZone(bosses);

    this.scene.launch('BossScene', {
      bossData,
      questionSystem: this.questionSystem,
      difficultySystem: this.difficultySystem,
      comboSystem: this.comboSystem,
      scoreSystem: this.scoreSystem
    });
  }

  resumeFromBoss() {
    this.runnerSystem.resume();
    this.physics.resume();
    this.isPaused = false;
  }

  // ── Game Finish & Results ──

  handleSprintFinish(reasonText) {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.physics.pause();
    this.runnerSystem.pause();
    this.inputManager.disable();
    audioManager.stopBGM();

    const banner = this.add.text(640, 360, reasonText, {
      fontSize: '64px', fontFamily: "'Orbitron', sans-serif", color: '#ffd700', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

    audioManager.playCorrect();

    this.time.delayedCall(1600, () => {
      banner.destroy();
      this.showResultsScreen(false, reasonText);
    });
  }

  handleGameOver() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.physics.pause();
    this.runnerSystem.pause();
    this.inputManager.disable();
    audioManager.stopBGM();
    audioManager.playGameOver();

    const gameOverText = this.add.text(640, 360, 'GAME OVER', {
      fontSize: '68px', fontFamily: "'Orbitron', sans-serif", color: '#ff0044', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

    this.time.delayedCall(1500, () => {
      gameOverText.destroy();
      this.showResultsScreen(true, 'SHIELDS DEPLETED');
    });
  }

  showResultsScreen(isGameOver, reason = '') {
    const totalStats = this.questionSystem.getTotalStats();
    let finalScore = this.scoreSystem.getFinalScore();
    let timeBonus = 0;
    let spmGrade = null;
    let timeElapsed = 0;

    if (this.mode === 'sprint') {
      const sprintCalculation = this.scoreSystem.getSprintFinalScore(this.sprintTimeRemaining, totalStats.accuracy);
      finalScore = sprintCalculation.finalScore;
      timeBonus = sprintCalculation.timeBonus;
      spmGrade = this.scoreSystem.getSprintGrade(totalStats.accuracy);
      timeElapsed = Math.floor(this.sprintDuration - Math.max(0, this.sprintTimeRemaining));
    }

    const stats = {
      mode: this.mode,
      isSprint: this.mode === 'sprint',
      finishReason: reason,
      isGameOver: isGameOver,
      distance: this.runnerSystem.getDistanceMetres(),
      questionsAttempted: totalStats.totalAsked,
      questionsCorrect: totalStats.totalCorrect,
      accuracy: totalStats.accuracy,
      bestCombo: this.comboSystem.getBestCombo(),
      totalCoins: this.scoreSystem.totalCoins,
      bossesDefeated: this.scoreSystem.bossesDefeated,
      finalScore: finalScore,
      timeBonus: timeBonus,
      timeElapsed: timeElapsed,
      targetQuestions: this.targetQuestions,
      spmGrade: spmGrade,
      chapterStats: this.questionSystem.getChapterStats(),
      scoreBreakdown: this.scoreSystem.getStats()
    };

    this.scene.start('ResultsScene', stats);
  }

  // ── Audio ──

  playBeep(frequency, duration) {
    try {
      const ctx = this.registry.get('audioContext');
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback
    }
  }
}
