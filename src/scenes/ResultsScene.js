import Phaser from 'phaser';
import { saveScore, submitGlobalScore, getPlayerName } from '../utils/Storage.js';
import audioManager from '../utils/AudioManager.js';

export default class ResultsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultsScene' });
    }

    init(data) {
        this.stats = data || {};
    }

    create() {
        this.cameras.main.setBackgroundColor('#05051a');
        const { width, height } = this.cameras.main;

        const isSprint = this.stats.isSprint;
        const mainTitle = isSprint ? 'SPM SPRINT COMPLETED' : 'MATH RUN COMPLETE';
        const titleColor = isSprint ? '#00ffff' : '#ffcc00';

        this.add.text(width / 2, 45, mainTitle, {
            fontSize: '36px', fontFamily: "'Orbitron', sans-serif", color: titleColor, fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        if (this.stats.finishReason) {
            this.add.text(width / 2, 85, this.stats.finishReason, {
                fontSize: '20px', fontFamily: "'Rajdhani', sans-serif", color: '#ffaa00', fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        // Layout
        if (isSprint && this.stats.spmGrade) {
            // Sprint Mode Layout: Grade on Left, Stats on Right
            const gradeInfo = this.stats.spmGrade;

            // Grade Box Container
            const gradeContainer = this.add.container(width / 2 - 250, 235);
            const boxBg = this.add.rectangle(0, 0, 220, 200, 0x0a142e, 0.95);
            boxBg.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(gradeInfo.color).color);

            const gradeTitle = this.add.text(0, -65, 'SPM GRADE', {
                fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);

            const gradeLetter = this.add.text(0, -10, gradeInfo.grade, {
                fontSize: '84px', fontFamily: "'Orbitron', sans-serif", color: gradeInfo.color, fontStyle: 'bold'
            }).setOrigin(0.5);

            const gradeDesc = this.add.text(0, 55, gradeInfo.label.toUpperCase(), {
                fontSize: '15px', fontFamily: "'Rajdhani', sans-serif", color: gradeInfo.color, fontStyle: 'bold'
            }).setOrigin(0.5);

            gradeContainer.add([boxBg, gradeTitle, gradeLetter, gradeDesc]);

            // Stats list on Right
            const rightX = width / 2 - 80;
            const startY = 130;
            const gap = 32;

            const timeStr = `${Math.floor(this.stats.timeElapsed / 60)}m ${this.stats.timeElapsed % 60}s`;
            this.add.text(rightX, startY, `Exam Time: ${timeStr}`, { fontSize: '22px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });
            this.add.text(rightX, startY + gap, `Questions: ${this.stats.questionsCorrect} / ${this.stats.questionsAttempted} (${this.stats.targetQuestions} target)`, { fontSize: '22px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });
            this.add.text(rightX, startY + gap * 2, `Accuracy: ${(this.stats.accuracy || 0).toFixed(1)}%`, { fontSize: '22px', fontFamily: "'Rajdhani', sans-serif", color: gradeInfo.color, fontStyle: 'bold' });
            this.add.text(rightX, startY + gap * 3, `Time Bonus: +${this.stats.timeBonus || 0} pts`, { fontSize: '22px', fontFamily: "'Rajdhani', sans-serif", color: '#ffd700', fontStyle: '600' });
            this.add.text(rightX, startY + gap * 4, `Best Combo: x${this.stats.bestCombo}`, { fontSize: '22px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });
            this.add.text(rightX, startY + gap * 5, `Distance Run: ${Math.floor(this.stats.distance)} m`, { fontSize: '22px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });

            this.add.text(width / 2, startY + gap * 7.4, `FINAL SPM SCORE: ${this.stats.finalScore}`, {
                fontSize: '36px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold',
                stroke: '#000000', strokeThickness: 4
            }).setOrigin(0.5);

        } else {
            // Endless Run Standard Layout
            const leftX = width / 2 - 200;
            const startY = 140;
            const gap = 36;

            this.add.text(leftX, startY, `Distance: ${Math.floor(this.stats.distance || 0)} m`, { fontSize: '24px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });
            this.add.text(leftX, startY + gap, `Questions: ${this.stats.questionsCorrect || 0} correct / ${this.stats.questionsAttempted || 0} total`, { fontSize: '24px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });
            this.add.text(leftX, startY + gap * 2, `Accuracy: ${(this.stats.accuracy || 0).toFixed(1)}%`, { fontSize: '24px', fontFamily: "'Rajdhani', sans-serif", color: '#00ff88', fontStyle: 'bold' });
            this.add.text(leftX, startY + gap * 3, `Best Combo: x${this.stats.bestCombo || 0}`, { fontSize: '24px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });
            this.add.text(leftX, startY + gap * 4, `Coins: ${this.stats.totalCoins || 0}`, { fontSize: '24px', fontFamily: "'Rajdhani', sans-serif", color: '#ffd700', fontStyle: '600' });
            this.add.text(leftX, startY + gap * 5, `Bosses Defeated: ${this.stats.bossesDefeated || 0}`, { fontSize: '24px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });

            this.add.text(width / 2, startY + gap * 7.2, `FINAL SCORE: ${this.stats.finalScore || 0}`, {
                fontSize: '38px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold',
                stroke: '#000000', strokeThickness: 4
            }).setOrigin(0.5);
        }

        // Auto-save score locally and sync to global leaderboard
        const playerName = getPlayerName() || 'Guest';
        const scorePayload = {
            name: playerName,
            score: this.stats.finalScore || 0,
            distance: Math.floor(this.stats.distance || 0),
            accuracy: this.stats.accuracy || 0,
            mode: this.stats.mode || 'endless',
            grade: this.stats.spmGrade ? this.stats.spmGrade.grade : null,
            date: new Date().toLocaleDateString()
        };
        saveScore(scorePayload);
        submitGlobalScore(scorePayload);

        // Buttons
        this.createButton(width / 2 - 170, height - 75, 'PLAY AGAIN', () => {
            this.scene.start('ModeSelectScene');
        });

        this.createButton(width / 2 + 170, height - 75, 'MAIN MENU', () => {
            this.scene.start('MainMenuScene');
        });
    }

    createButton(x, y, textStr, onClick) {
        const btn = this.add.container(x, y);
        const bg = this.add.image(0, 0, 'button').setInteractive({ useHandCursor: true });
        const txt = this.add.text(0, 0, textStr, {
            fontSize: '18px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([bg, txt]);

        bg.on('pointerover', () => {
            bg.setTexture('button-hover');
            this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });

        bg.on('pointerout', () => {
            bg.setTexture('button');
            this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 });
        });

        bg.on('pointerdown', () => {
            audioManager.playClick();
            this.tweens.add({ targets: btn, scaleX: 0.95, scaleY: 0.95, duration: 50, yoyo: true });
            onClick();
        });

        return btn;
    }
}
