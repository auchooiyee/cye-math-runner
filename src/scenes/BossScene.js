import Phaser from 'phaser';
import BossBar from '../ui/BossBar.js';
import audioManager from '../utils/AudioManager.js';
import { formatMatrixNotation } from '../utils/MathFormatter.js';

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
    }

    create() {
        const { width, height } = this.cameras.main;
        
        this.add.rectangle(width/2, height/2, width, height, 0x030614, 0.90);
        
        this.add.text(width/2, 48, this.bossData.name.toUpperCase(), {
            fontSize: '40px', fontFamily: "'Orbitron', sans-serif", color: '#ff0055', fontStyle: 'bold',
            stroke: '#ffffff', strokeThickness: 1
        }).setOrigin(0.5);

        this.bossBar = new BossBar(this, width/2 - 200, 95, 400, 24);
        this.bossBar.setHp(this.questionsRemaining, this.bossData.questionsToDefeat || 3);

        this.bossSprite = this.add.image(width/2, 220, 'boss-sprite').setScale(1.4);
        
        // Question Container / Card
        const qCard = this.add.rectangle(width/2, 375, 880, 100, 0x08122c, 0.9);
        qCard.setStrokeStyle(2, 0x00f3ff, 0.8);

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

        this.presentQuestion();
    }

    presentQuestion() {
        this.currentQuestion = this.questionSystem.getBossQuestion(null) || {
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctIndex: 1
        };

        this.questionText.setText(formatMatrixNotation(this.currentQuestion.question));
        
        this.answerButtons.forEach((ab, i) => {
            ab.txt.setText(formatMatrixNotation(this.currentQuestion.options[i]));
            ab.bg.setTint(0xffffff);
            ab.bg.setInteractive();
        });
    }

    handleAnswer(selectedIndex) {
        this.answerButtons.forEach(ab => ab.bg.disableInteractive());
        
        const isCorrect = (selectedIndex === this.currentQuestion.answer);
        
        if (isCorrect) {
            this.answerButtons[selectedIndex].bg.setTint(0x00ff00);
            this.cameras.main.flash(200, 0, 255, 0);
            this.cameras.main.shake(150, 0.012);
            audioManager.playBossHit();
            
            this.questionsRemaining--;
            this.bossBar.setHp(this.questionsRemaining, this.bossData.questionsToDefeat || 3);
            
            this.tweens.add({
                targets: this.bossSprite,
                alpha: 0.5, yoyo: true, duration: 100, repeat: 3
            });

            if (this.questionsRemaining <= 0) {
                audioManager.playBossDefeat();
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
            this.answerButtons[selectedIndex].bg.setTint(0xff0000);
            this.answerButtons[this.currentQuestion.answer].bg.setTint(0x00ff00);
            
            this.cameras.main.flash(200, 255, 0, 0);
            this.cameras.main.shake(250, 0.02);
            audioManager.playWrong();
            
            this.scene.get('GameScene').player.takeDamage();
            
            this.tweens.add({
                targets: this.bossSprite,
                scaleX: 2.0, scaleY: 2.0, yoyo: true, duration: 100
            });
        }
        
        this.time.delayedCall(1500, () => {
            if (this.scene.get('GameScene').player.isDead) {
                this.closeBoss(false);
            } else {
                this.presentQuestion();
            }
        });
    }

    closeBoss(defeated) {
        const gameScene = this.scene.get('GameScene');
        if (defeated) {
            gameScene.events.emit('boss-defeated');
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
