import Phaser from 'phaser';
import BossBar from '../ui/BossBar.js';
import audioManager from '../utils/AudioManager.js';
import { formatMatrixEquation, formatMatrixNotation } from '../utils/MathFormatter.js';
import MathGateUI from '../ui/MathGateUI.js';
import PortraitBossOverlay from '../ui/PortraitBossOverlay.js';
import { getChapterRewardState, getSetting, saveSetting } from '../utils/Storage.js';

const BOSS_THEMES = {
    1: { accent: 0x00ff88, motifs: ['∝', 'k', 'x/y'], attack: 'INVERSE STRIKE', arena: 'ENERGY RATIO CORE' },
    2: { accent: 0x00ffff, motifs: ['[ ]', 'det', 'A⁻¹'], attack: 'MATRIX LOCK', arena: 'MATRIX CONTROL GRID' },
    3: { accent: 0xff8800, motifs: ['✓', 'RM', '%'], attack: 'DEDUCTIBLE BLAST', arena: 'PROTECTION VAULT' },
    4: { accent: 0xffd700, motifs: ['TAX', 'RM', '−'], attack: 'REBATE REVERSAL', arena: 'REVENUE CITADEL' },
    5: { accent: 0xff00ff, motifs: ['△', '↻', 'k'], attack: 'ROTATION SHIFT', arena: 'GEOMETRY VOID' },
    6: { accent: 0x0088ff, motifs: ['sin', 'cos', 'θ'], attack: 'WAVE SURGE', arena: 'TRIGONOMETRY TUNNEL' },
    7: { accent: 0x88ff00, motifs: ['σ', 'x̄', 'IQR'], attack: 'DEVIATION SPIKE', arena: 'DATA DISTORTION FIELD' },
    8: { accent: 0xff0044, motifs: ['f(x)', '→', 'Σ'], attack: 'MODEL COLLAPSE', arena: 'PREDICTION NEXUS' }
};

export default class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
    }

    init(data) {
        this.bossData = data.bossData;
        this.questionSystem = data.questionSystem;
        this.difficultySystem = data.difficultySystem;
        this.comboSystem = data.comboSystem;
        this.scoreSystem = data.scoreSystem;
        
        this.questionsRemaining = this.bossData.questionsToDefeat || 3;
        this.phase = 1;
        this.theme = BOSS_THEMES[this.bossData.zone] || BOSS_THEMES[1];
        this.rewardState = getChapterRewardState(this.bossData.zone);
        this.orbitSpeed = 0.001;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.answerFeedback = new MathGateUI(this);
        
        this.createArena(width, height);
        
        this.add.text(width/2, 48, this.bossData.name.toUpperCase(), {
            fontSize: '40px', fontFamily: "'Orbitron', sans-serif", color: this.bossData.color, fontStyle: 'bold',
            stroke: '#ffffff', strokeThickness: 1
        }).setOrigin(0.5);

        if (this.rewardState.bossSkinUnlocked) {
            this.add.text(width / 2, 112, '★ MASTERED SKIN ACTIVE ★', {
                fontSize: '13px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        this.add.text(width / 2, 78, `${this.theme.arena} • ${this.bossData.description.toUpperCase()}`, {
            fontSize: '13px', fontFamily: "'Rajdhani', sans-serif", color: '#bcd8ff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.bossBar = new BossBar(this, width/2 - 200, 95, 400, 24);
        this.bossBar.setHp(this.questionsRemaining, this.bossData.questionsToDefeat || 3);

        const auraColor = this.rewardState.bossSkinUnlocked ? 0xffcc00 : this.theme.accent;
        this.bossAura = this.add.circle(width / 2, 220, 92, auraColor, 0.1)
            .setStrokeStyle(this.rewardState.bossSkinUnlocked ? 5 : 3, auraColor, 0.5);
        this.bossSprite = this.add.image(width/2, 220, 'boss-sprite').setScale(1.4).setTint(auraColor);
        this.createOrbitSymbols(width / 2, 220);
        
        // Question Container / Card
        this.qCard = this.add.rectangle(width/2, 375, 880, 100, 0x08122c, 0.9);
        this.qCard.setStrokeStyle(2, this.theme.accent, 0.9);

        this.questionText = this.add.text(width/2, 375, '', {
            fontSize: '20px',
            fontFamily: "'Fira Code', Consolas, monospace",
            color: '#ffea6c',
            fontStyle: 'bold',
            align: 'center',
            lineSpacing: 4,
            wordWrap: { width: 840 }
        }).setOrigin(0.5);

        this.answerButtons = [];
        const btnPositions = [
            { x: width/2 - 200, y: 490 },
            { x: width/2 + 200, y: 490 },
            { x: width/2 - 200, y: 575 },
            { x: width/2 + 200, y: 575 }
        ];

        btnPositions.forEach((pos, idx) => {
            const btn = this.add.container(pos.x, pos.y);
            const bg = this.add.image(0, 0, 'button').setInteractive({ useHandCursor: true });
            const txt = this.add.text(0, 0, '', {
                fontSize: '20px',
                fontFamily: "'Fira Code', 'Rajdhani', monospace",
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5);
            btn.add([bg, txt]);

            bg.on('pointerover', () => {
                bg.setTexture('button-hover');
                this.tweens.add({ targets: btn, scaleX: 1.04, scaleY: 1.04, duration: 100 });
            });
            bg.on('pointerout', () => {
                bg.setTexture('button');
                this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 });
            });
            
            bg.on('pointerdown', () => {
                audioManager.playClick();
                this.handleAnswer(idx);
            });
            this.answerButtons.push({ btn, bg, txt });
        });

        this.createMatrixRepairPad(width);
        this.mobileOverlay = new PortraitBossOverlay({
            scene: this,
            name: this.bossData.name,
            description: this.theme.arena,
            totalHp: this.bossData.questionsToDefeat || 3,
            onAnswer: answer => this.handleAnswer(answer)
        });
        this.events.once('shutdown', () => this.mobileOverlay.destroy());
        this.presentQuestion();
        if (!getSetting('bossTutorialSeen', false)) this.showBossTutorial(width, height);
    }

    showBossTutorial(width, height) {
        const overlay = this.add.container(0, 0).setDepth(200);
        const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x02040d, 0.94).setInteractive();
        const panel = this.add.rectangle(width / 2, height / 2, 850, 430, 0x08122c, 1)
            .setStrokeStyle(3, this.theme.accent, 0.95);
        const title = this.add.text(width / 2, 175, 'BOSS BRIEFING', {
            fontSize: '32px', fontFamily: "'Orbitron', sans-serif", color: this.bossData.color, fontStyle: 'bold'
        }).setOrigin(0.5);
        const body = this.add.text(width / 2, 270,
            '• BOSS HP: each correct answer removes one segment.\n' +
            '• ATTACKS: a wrong answer triggers the boss attack and costs a shield.\n' +
            '• PHASES: the boss speeds up as its HP gets low.\n\n' +
            'Choose the best answer, watch the phase change, and finish the fight.', {
            fontSize: '19px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff',
            lineSpacing: 9, align: 'left', wordWrap: { width: 700 }
        }).setOrigin(0.5);
        const start = this.add.rectangle(width / 2, 430, 260, 52, this.theme.accent, 0.18)
            .setStrokeStyle(2, this.theme.accent, 1).setInteractive({ useHandCursor: true });
        const startText = this.add.text(width / 2, 430, 'START FIGHT ▶', {
            fontSize: '17px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        start.on('pointerdown', () => {
            dismissTutorial();
        });
        overlay.add([dim, panel, title, body, start, startText]);
        const dismissTutorial = () => {
            audioManager.playClick();
            saveSetting('bossTutorialSeen', true);
            overlay.destroy(true);
            this.mobileOverlay.hideBriefing();
        };
        this.mobileOverlay.showBriefing(dismissTutorial);
    }

    createArena(width, height) {
        this.add.rectangle(width / 2, height / 2, width, height, 0x030614, 0.94);
        this.add.rectangle(width / 2, height / 2, width, height, this.theme.accent, 0.035);
        const grid = this.add.graphics();
        grid.lineStyle(1, this.theme.accent, 0.12);
        for (let x = 0; x <= width; x += 80) grid.lineBetween(x, 0, x, height);
        for (let y = 0; y <= height; y += 60) grid.lineBetween(0, y, width, y);
        this.tweens.add({ targets: grid, alpha: 0.35, duration: 900, yoyo: true, repeat: -1 });
    }

    createOrbitSymbols(centerX, centerY) {
        this.orbitSymbols = this.theme.motifs.map((motif, index) => {
            return this.add.text(centerX, centerY, motif, {
                fontSize: '20px', fontFamily: "'Fira Code', monospace", color: this.bossData.color,
                fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
            }).setOrigin(0.5).setAlpha(0.85).setData('angleOffset', index * (Math.PI * 2 / 3));
        });
    }

    createMatrixRepairPad(width) {
        this.repairPanel = this.add.container(0, 0).setVisible(false);
        this.repairInput = '';
        this.repairInputText = this.add.text(width / 2, 445, 'MISSING ENTRY: _', {
            fontSize: '20px', fontFamily: "'Fira Code', monospace", color: '#00ffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.repairPanel.add(this.repairInputText);
        this.repairKeys = [];

        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '−', '⌫'];
        keys.forEach((key, index) => {
            const column = index % 4;
            const row = Math.floor(index / 4);
            const button = this.add.container(width / 2 + (column - 1.5) * 115, 490 + row * 55);
            const background = this.add.rectangle(0, 0, 94, 44, 0x102958, 1)
                .setStrokeStyle(2, this.theme.accent, 0.9)
                .setInteractive({ useHandCursor: true });
            const label = this.add.text(0, 0, key, {
                fontSize: '22px', fontFamily: "'Fira Code', monospace", color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
            background.on('pointerdown', () => this.handleRepairKey(key));
            button.add([background, label]);
            this.repairPanel.add(button);
            this.repairKeys.push(background);
        });

        this.repairSubmit = this.add.container(width / 2, 660);
        this.repairSubmitBg = this.add.rectangle(0, 0, 260, 44, 0x074544, 1)
            .setStrokeStyle(2, this.theme.accent, 1)
            .setInteractive({ useHandCursor: true });
        const submitLabel = this.add.text(0, 0, 'REPAIR MATRIX ▶', {
            fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.repairSubmitBg.on('pointerdown', () => {
            if (/^-?\d+$/.test(this.repairInput)) this.handleAnswer(this.repairInput);
        });
        this.repairSubmit.add([this.repairSubmitBg, submitLabel]);
        this.repairPanel.add(this.repairSubmit);
    }

    handleRepairKey(key) {
        if (this.answerLocked || this.currentQuestion?.type !== 'matrixRepair') return;
        if (key === '⌫') this.repairInput = this.repairInput.slice(0, -1);
        else if (key === '−') {
            if (!this.repairInput) this.repairInput = '-';
        } else if (this.repairInput.replace('-', '').length < 3) {
            this.repairInput += key;
        }
        this.repairInputText.setText(`MISSING ENTRY: ${this.repairInput || '_'}`);
    }

    update(time) {
        if (!this.orbitSymbols) return;
        const radiusX = 125 + this.phase * 8;
        const radiusY = 55 + this.phase * 3;
        this.orbitSymbols.forEach(symbol => {
            const angle = time * this.orbitSpeed + symbol.getData('angleOffset');
            symbol.setPosition(640 + Math.cos(angle) * radiusX, 220 + Math.sin(angle) * radiusY);
            symbol.setScale(0.9 + Math.sin(angle * 2) * 0.12);
        });
        this.bossAura.setScale(1 + Math.sin(time * 0.004) * 0.08);
    }

    presentQuestion() {
        this.currentQuestion = this.questionSystem.getBossQuestion(this.bossData.zone) || {
            id: 'fallback-boss-question',
            chapter: this.bossData.zone,
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            answer: 1,
            explanation: '2 + 2 = 4.'
        };

        const isRepair = this.currentQuestion.type === 'matrixRepair';
        this.answerLocked = false;
        this.qCard.setPosition(this.cameras.main.width / 2, isRepair ? 360 : 375);
        this.qCard.setDisplaySize(880, isRepair ? 130 : 100);
        this.questionText.setY(isRepair ? 360 : 375);
        this.questionText.setFontSize(isRepair ? 17 : 20);
        this.questionText.setText(isRepair ? formatMatrixEquation(this.currentQuestion.question) : formatMatrixNotation(this.currentQuestion.question));
        this.repairInput = '';
        this.repairInputText.setText('MISSING ENTRY: _').setColor('#00ffff');
        this.repairPanel.setVisible(isRepair);
        this.mobileOverlay.setQuestion(this.currentQuestion);
        this.repairKeys.forEach(key => isRepair ? key.setInteractive({ useHandCursor: true }) : key.disableInteractive());
        if (isRepair) this.repairSubmitBg.setInteractive({ useHandCursor: true });
        else this.repairSubmitBg.disableInteractive();
        
        this.answerButtons.forEach((ab, i) => {
            ab.btn.setVisible(!isRepair);
            ab.txt.setText(isRepair ? '' : formatMatrixNotation(this.currentQuestion.options[i]));
            ab.bg.setTint(0xffffff);
            if (isRepair) ab.bg.disableInteractive();
            else ab.bg.setInteractive({ useHandCursor: true });
        });
    }

    handleAnswer(selectedIndex) {
        if (this.answerLocked) return;
        this.answerLocked = true;
        const isRepair = this.currentQuestion.type === 'matrixRepair';
        this.answerButtons.forEach(ab => ab.bg.disableInteractive());
        this.repairKeys.forEach(key => key.disableInteractive());
        this.repairSubmitBg.disableInteractive();
        const answerResult = this.currentQuestion.id === 'fallback-boss-question'
            ? {
                correct: selectedIndex === this.currentQuestion.answer,
                selectedAnswer: this.currentQuestion.options[selectedIndex],
                correctAnswer: this.currentQuestion.options[this.currentQuestion.answer],
                hint: 'Identify the chapter rule first, then work through the values step by step.',
                explanation: this.currentQuestion.explanation
            }
            : this.questionSystem.validateAnswer(this.currentQuestion.id, selectedIndex);
        const isCorrect = answerResult.correct;
        this.difficultySystem.recordAnswer(isCorrect);
        this.mobileOverlay.lock(isCorrect);
        
        if (isCorrect) {
            if (isRepair) this.repairInputText.setColor('#00ff88');
            else this.answerButtons[selectedIndex].bg.setTint(0x00ff00);
            this.cameras.main.flash(200, 0, 255, 0);
            this.cameras.main.shake(150, 0.012);
            audioManager.playBossHit();
            this.playCorrectAttack(isRepair ? this.repairSubmit : this.answerButtons[selectedIndex].btn);
            
            this.questionsRemaining--;
            this.bossBar.setHp(this.questionsRemaining, this.bossData.questionsToDefeat || 3);
            this.mobileOverlay.setHp(this.questionsRemaining);
            this.updateBossPhase();
            
            this.tweens.add({
                targets: this.bossSprite,
                alpha: 0.5, yoyo: true, duration: 100, repeat: 3
            });

            if (this.questionsRemaining <= 0) {
                audioManager.playBossDefeat();
                this.mobileOverlay.showVictory();
                this.time.delayedCall(1000, () => {
                    this.add.text(this.cameras.main.width/2, this.cameras.main.height/2, 'BOSS DEFEATED!', {
                        fontSize: '56px', fontFamily: "'Orbitron', sans-serif", color: '#00ff88', fontStyle: 'bold',
                        stroke: '#003311', strokeThickness: 6
                    }).setOrigin(0.5);
                    this.time.delayedCall(2000, () => this.closeBoss(true));
                });
                return;
            }
        } else {
            if (isRepair) this.repairInputText.setColor('#ff6688');
            else {
                this.answerButtons[selectedIndex].bg.setTint(0xff0000);
                this.answerButtons[this.currentQuestion.answer].bg.setTint(0x00ff00);
            }
            
            this.cameras.main.flash(200, 255, 0, 0);
            this.cameras.main.shake(250, 0.02);
            audioManager.playWrong();
            this.playBossAttack();

            this.tweens.add({
                targets: this.bossSprite,
                scaleX: 2.0, scaleY: 2.0, yoyo: true, duration: 100
            });

            const portraitFeedback = this.mobileOverlay.isActive();
            let feedbackHandled = false;
            const continueAfterFeedback = () => {
                if (feedbackHandled) return;
                feedbackHandled = true;
                this.answerFeedback.hideFeedback();
                this.mobileOverlay.hideBriefing();
                const gameScene = this.scene.get('GameScene');
                gameScene.player.takeDamage();
                if (gameScene.player.isDead) {
                    this.closeBoss(false);
                } else {
                    this.presentQuestion();
                }
            };
            this.mobileOverlay.showWrongFeedback(answerResult, continueAfterFeedback, portraitFeedback);
            if (!portraitFeedback) this.answerFeedback.showWrongAnswer(answerResult, continueAfterFeedback);
            return;
        }

        this.time.delayedCall(1500, () => {
            this.presentQuestion();
        });
    }

    playCorrectAttack(source) {
        const projectile = this.add.circle(source.x, source.y, 10, this.theme.accent, 1)
            .setStrokeStyle(3, 0xffffff, 1).setDepth(50);
        this.tweens.add({
            targets: projectile,
            x: this.bossSprite.x,
            y: this.bossSprite.y,
            scale: 1.8,
            duration: 420,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                projectile.destroy();
                const ring = this.add.circle(this.bossSprite.x, this.bossSprite.y, 20, this.theme.accent, 0)
                    .setStrokeStyle(5, this.theme.accent, 1).setDepth(49);
                this.tweens.add({
                    targets: ring, radius: 100, alpha: 0, duration: 450,
                    onComplete: () => ring.destroy()
                });
            }
        });
    }

    playBossAttack() {
        const attackText = this.add.text(640, 315, this.theme.attack, {
            fontSize: '27px', fontFamily: "'Orbitron', sans-serif", color: this.bossData.color,
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5).setDepth(60).setScale(0.5).setAlpha(0);
        this.tweens.add({
            targets: attackText, alpha: 1, scaleX: 1.1, scaleY: 1.1, duration: 220,
            hold: 500, yoyo: true, onComplete: () => attackText.destroy()
        });
    }

    updateBossPhase() {
        const ratio = this.questionsRemaining / (this.bossData.questionsToDefeat || 3);
        const nextPhase = ratio <= 0.33 ? 3 : ratio <= 0.66 ? 2 : 1;
        if (nextPhase <= this.phase || this.questionsRemaining <= 0) return;
        this.phase = nextPhase;
        this.orbitSpeed += 0.00035;
        const phaseText = this.add.text(640, 275, `PHASE ${this.phase} • SYSTEM OVERDRIVE`, {
            fontSize: '21px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold',
            stroke: this.bossData.color, strokeThickness: 3
        }).setOrigin(0.5).setDepth(55).setAlpha(0);
        this.tweens.add({
            targets: phaseText, alpha: 1, duration: 200, hold: 700, yoyo: true,
            onComplete: () => phaseText.destroy()
        });
        this.cameras.main.shake(220, 0.008 * this.phase);
    }

    closeBoss(defeated) {
        const gameScene = this.scene.get('GameScene');
        if (defeated) {
            gameScene.events.emit('boss-defeated', this.bossData.reward);
        } else {
            gameScene.events.emit('boss-failed');
        }
        this.scene.stop('BossScene');
    }

    playBeep(beepConfig) {
        const ctx = this.registry.get('audioContext');
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = beepConfig.frequency;
        gain.gain.value = 0.3;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + beepConfig.duration);
        osc.stop(ctx.currentTime + beepConfig.duration);
    }
}
