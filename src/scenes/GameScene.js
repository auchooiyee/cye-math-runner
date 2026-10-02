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
import PortraitRunnerUI from '../ui/PortraitRunnerUI.js';
import ZoneSystem from '../systems/ZoneSystem.js';
import audioManager from '../utils/AudioManager.js';
import { EVENTS } from '../config/constants.js';
import { getMasteryProgress } from '../utils/Storage.js';

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
    this.practiceChapter = data.practiceChapter || 1;
    this.practiceChapterName = data.practiceChapterName || 'Variation';
    this.practiceTopic = data.practiceTopic || null;
    this.isBossTraining = data.mode === 'bossTraining';
    this.masteryBefore = getMasteryProgress().chapters;
    const beforeTopic = this.masteryBefore?.[String(this.practiceChapter)]?.topics?.[this.practiceTopic] || {};
    this.topicAccuracyBefore = beforeTopic.attempted ? Math.round(((beforeTopic.correct || 0) / beforeTopic.attempted) * 100) : 0;
    this.dailyChallenge = data.dailyChallenge || false;
    this.dailyChallengeKey = data.dailyChallengeKey || null;
    this.sprintQuestionsCompleted = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.manualPause = false;
  }

  create() {
    this.cameras.main.setBackgroundColor('#0a0a1a');
    document.body.classList.add('portrait-running');
    this.scale.getParentBounds();
    this.scale.refresh();
    this.events.once('shutdown', () => {
      this.portraitUI?.destroy();
      document.body.classList.remove('portrait-running');
      this.scale.getParentBounds();
      this.scale.refresh();
    });

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
    } else if (this.mode === 'practice') {
      this.spawnSystem.setGateDistance(300);
      this.spawnSystem.setObstacleSpawning(false);
      this.zoneSystem.lockToChapter(this.practiceChapter);
    } else if (this.mode === 'bossTraining') {
      this.spawnSystem.setObstacleSpawning(false);
      this.zoneSystem.lockToChapter(this.practiceChapter);
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
    } else if (this.mode === 'practice') {
      this.hud.setPracticeMode(this.practiceChapterName, this.targetQuestions, this.practiceTopic);
    } else if (this.mode === 'bossTraining') {
      this.hud.setBossTrainingMode(this.practiceChapterName, this.targetQuestions);
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
    this.portraitUI = new PortraitRunnerUI({
      onLeft: () => this.inputManager.callbacks.onLeft?.(),
      onRight: () => this.inputManager.callbacks.onRight?.(),
      onJump: () => this.inputManager.callbacks.onJump?.(),
      onSlide: () => this.inputManager.callbacks.onSlide?.(),
      onPause: () => this.togglePause(),
      onLane: lane => { if (!this.isPaused) this.player.moveToLane(lane); },
      onQuit: () => this.handleGameOver('RUN ABORTED')
    });
    this.events.on('mathgate-activated', ({ question, options }) => {
      this.portraitUI.showGate(question, options, this.player.currentLane);
    });
    this.events.on('mathgate-deactivated', () => this.portraitUI.hideGate());

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
      if (this.isBossTraining) {
        this.isRunning = false;
        this.inputManager.disable();
        audioManager.stopBGM();
        this.scene.stop('BossScene');
        this.showResultsScreen(false, 'BOSS TRAINING COMPLETE');
        return;
      }
      this.resumeFromBoss();
    });
    this.events.on('boss-failed', () => {
      if (this.isBossTraining) {
        this.isRunning = false;
        this.inputManager.disable();
        audioManager.stopBGM();
        this.scene.stop('BossScene');
        this.showResultsScreen(true, 'BOSS TRAINING FAILED');
        return;
      }
      this.resumeFromBoss();
    });

    // Math Gate descent event (resumes calm background scroll after auto pause)
    this.events.on('mathgate-start-descending', () => {
      if (this.isRunning && !this.isPaused) {
        this.runnerSystem.setSpeedMultiplier(0.35);
      }
    });

    // Start background synthwave music
    audioManager.startBGM(125, 'Am');

    // ── Start ──
    this.isRunning = true;
    this.isPaused = false;
    this.lastPortraitHudUpdate = -Infinity;
    if (this.isBossTraining) this.time.delayedCall(500, () => this.triggerBoss());

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
    this.runnerSystem.setZoneTheme(initialZone, false);
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
    if (time - this.lastPortraitHudUpdate >= 200) {
      this.lastPortraitHudUpdate = time;
      const zone = this.zoneSystem.getCurrentZone();
      const progress = this.hud.sprintProgressText.visible
        ? this.hud.sprintProgressText.text
        : `ZONE 0${zone.id} • ${zone.nameEn.toUpperCase()}`;
      this.portraitUI.updateHud({
        distance, shields: this.player.shields, score: this.scoreSystem.getDisplayScore(), progress
      });
      if (this.mathGate.active) this.portraitUI.updateGate(this.mathGate.isCalculationPaused, this.player.currentLane);
    }

    // ── Sprint Mode Countdown Timer ──
    if (this.mode === 'sprint') {
      // Pause sprint timer while calculation auto-pause is active
      if (!this.mathGate || !this.mathGate.isCalculationPaused) {
        this.sprintTimeRemaining -= (delta / 1000);
        this.hud.updateSprintTimer(this.sprintTimeRemaining);

        if (this.sprintTimeRemaining <= 0) {
          this.sprintTimeRemaining = 0;
          this.handleSprintFinish("TIME'S UP!");
          return;
        }
      }
    }

    // ── Math Gate check ──
    if (this.mathGate && this.mathGate.isAtPlayerLevel()) {
      this.mathGate.checked = true;
      const result = this.mathGate.checkAnswer(this.player.currentLane);
      const answerResult = this.questionSystem.validateAnswer(
        this.mathGate.currentQuestion.id,
        result.selectedAnswerIndex
      );

      if (answerResult.correct) {
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
        this.hud.showWrong();
        this.mathGate.showResult(false);
      }

      this.hud.updateCombo(this.comboSystem.getCurrentCombo(), this.comboSystem.getMultiplier());
      this.recordQuestionProgress();

      if (answerResult.correct) {
        this.time.delayedCall(700, () => this.finishGateFeedback());
      } else {
        this.pauseForAnswerFeedback();
        const portraitFeedback = this.portraitUI.isActive();
        let feedbackHandled = false;
        const continueAfterFeedback = () => {
          if (feedbackHandled) return;
          feedbackHandled = true;
          this.mathGateUI.hideFeedback();
          this.portraitUI.hideModal();
          if (this.mode !== 'practice') {
            this.player.takeDamage();
          }
          this.finishGateFeedback();
        };
        this.portraitUI.showWrongFeedback(answerResult, continueAfterFeedback, portraitFeedback);
        if (!portraitFeedback) this.mathGateUI.showWrongAnswer(answerResult, continueAfterFeedback);
      }
    }

    // ── Spawn new gate? ──
    if (this.spawnSystem.shouldSpawnGate(distance) && !this.mathGate.active) {
      const range = this.difficultySystem.getDifficultyRange();
      // In Sprint mode, questions test all Form 5 topics (chapter = null)
      const chapter = this.mode === 'sprint'
        ? null
        : (this.mode === 'practice' ? this.practiceChapter : this.zoneSystem.getCurrentChapter());
      const question = this.questionSystem.getRandomQuestion(chapter, range.min, range.max, this.practiceTopic);
      if (question) {
        this.runnerSystem.setSpeedMultiplier(0); // Auto pause runner when question appears
        this.spawnSystem.spawnMathGate(question, speed);
      }
    }

    // ── Boss trigger? ──
    if (this.mode !== 'practice' && this.spawnSystem.shouldTriggerBoss(distance)) {
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

  recordQuestionProgress() {
    if (this.mode !== 'sprint' && this.mode !== 'practice') return;
    this.sprintQuestionsCompleted++;
    this.hud.updateSprintProgress(this.sprintQuestionsCompleted, this.targetQuestions);
  }

  pauseForAnswerFeedback() {
    this.isPaused = true;
    this.physics.pause();
    this.runnerSystem.pause();
    this.inputManager.disable();
  }

  finishGateFeedback() {
    this.portraitUI.hideModal();
    this.portraitUI.hideGate();
    this.mathGate.deactivate();
    this.spawnSystem.resumeAfterGate();
    this.runnerSystem.resetSpeedMultiplier();

    if ((this.mode === 'sprint' || this.mode === 'practice') && this.sprintQuestionsCompleted >= this.targetQuestions) {
      this.isPaused = false;
      this.handleSprintFinish(this.mode === 'practice' ? 'PRACTICE COMPLETE!' : 'EXAM COMPLETED!');
      return;
    }

    if (this.player.isDead) {
      this.isPaused = false;
      this.handleGameOver();
      return;
    }

    if (this.isPaused) {
      this.physics.resume();
      this.runnerSystem.resume();
      this.inputManager.enable();
      this.isPaused = false;
    }
  }

  // ── Collision handlers ──

  onZoneChanged(zone) {
    this.cameras.main.setBackgroundColor(zone.bgColor);
    this.runnerSystem.setZoneTheme(zone, true);
    audioManager.setZoneKey(zone.id);
    const lang = localStorage.getItem('CYE_MATH_RUNNER_LANGUAGE') || 'en';
    this.hud.updateZone(zone, lang);
    const r = (zone.accentHex >> 16) & 0xff;
    const g = (zone.accentHex >> 8) & 0xff;
    const b = zone.accentHex & 0xff;
    this.cameras.main.flash(400, r, g, b, true);
    this.showZoneTransition(zone, lang);
  }

  showZoneTransition(zone, lang) {
    const title = lang === 'bm' ? zone.nameBm : zone.nameEn;
    const banner = this.add.container(640, 350).setDepth(180).setScrollFactor(0).setAlpha(0).setScale(0.82);
    const glow = this.add.rectangle(0, 0, 720, 150, 0x030614, 0.92)
      .setStrokeStyle(3, zone.accentHex, 1);
    const chapter = this.add.text(0, -34, `ENTERING CHAPTER ${zone.chapter}`, {
      fontSize: '17px', fontFamily: "'Orbitron', sans-serif", color: zone.labelColor, fontStyle: 'bold'
    }).setOrigin(0.5);
    const name = this.add.text(0, 18, title.toUpperCase(), {
      fontSize: '39px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold',
      stroke: zone.labelColor, strokeThickness: 2
    }).setOrigin(0.5);
    const motif = this.add.text(0, 58, zone.motifs.join('  •  '), {
      fontSize: '16px', fontFamily: "'Fira Code', monospace", color: zone.labelColor
    }).setOrigin(0.5);
    banner.add([glow, chapter, name, motif]);
    this.tweens.add({
      targets: banner, alpha: 1, scaleX: 1, scaleY: 1, duration: 350, ease: 'Back.easeOut',
      hold: 1400, yoyo: true,
      onComplete: () => banner.destroy(true)
    });
  }

  hitObstacle(player, obstacle) {
    if (!obstacle.active) return;

    if (obstacle.obstacleType === 'high' && player.isSliding) {
      obstacle.deactivate();
      return;
    }
    const isClearlyAirborne = player.isJumping || player.y < player.GROUND_Y - 52;
    if (obstacle.obstacleType === 'low' && isClearlyAirborne) {
      obstacle.deactivate();
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
    if (!this.isRunning || (this.isPaused && !this.manualPause)) return;
    this.manualPause = !this.manualPause;
    this.isPaused = this.manualPause;
    if (this.manualPause) {
      this.physics.pause();
      this.runnerSystem.pause();
      this.pauseOverlay.setVisible(true);
      this.portraitUI.showPause(this.portraitUI.isActive());
      audioManager.stopBGM();
    } else {
      this.physics.resume();
      this.runnerSystem.resume();
      this.pauseOverlay.setVisible(false);
      this.portraitUI.hideModal();
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

  handleGameOver(reason = 'SHIELDS DEPLETED') {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.physics.pause();
    this.runnerSystem.pause();
    this.inputManager.disable();
    audioManager.stopBGM();
    audioManager.playGameOver();

    const gameOverText = this.add.text(640, 360, reason === 'RUN ABORTED' ? 'RUN ENDED' : 'GAME OVER', {
      fontSize: '68px', fontFamily: "'Orbitron', sans-serif", color: '#ff0044', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

    this.time.delayedCall(1500, () => {
      gameOverText.destroy();
      this.showResultsScreen(true, reason);
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
      isPractice: this.mode === 'practice' || this.isBossTraining,
      isBossTraining: this.isBossTraining,
      practiceChapter: this.practiceChapter,
      practiceChapterName: this.practiceChapterName,
      practiceTopic: this.practiceTopic,
      topicAccuracyBefore: this.topicAccuracyBefore,
      topicStats: this.practiceTopic ? this.questionSystem.getTopicStats(this.practiceChapter, this.practiceTopic) : null,
      dailyChallenge: this.dailyChallenge,
      dailyChallengeKey: this.dailyChallengeKey,
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
      mastery: this.questionSystem.getMasteryProgress(),
      masteryBefore: this.masteryBefore,
      mistakes: this.questionSystem.getMistakes(),
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
