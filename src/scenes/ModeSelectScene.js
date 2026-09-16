import Phaser from 'phaser';
import audioManager from '../utils/AudioManager.js';

export default class ModeSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ModeSelectScene' });
        this.subOptionElements = [];
    }

    create() {
        const { width, height } = this.cameras.main;

        // Rich Cyberpunk City Backdrop
        this.add.image(width / 2, height / 2, 'bg-layer-1').setDisplaySize(width, height).setAlpha(0.65);
        this.add.rectangle(width / 2, height / 2, width, height, 0x040818, 0.55);

        this.subOptionElements = [];

        this.add.text(width / 2, 75, 'SELECT GAME MODE', {
            fontSize: '44px',
            fontFamily: '"Orbitron", "Segoe UI", sans-serif',
            color: '#ffd700',
            fontStyle: '900',
            stroke: '#00f0ff',
            strokeThickness: 2.5,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff007f', blur: 12, stroke: true, fill: true }
        }).setOrigin(0.5);

        this.add.text(width / 2, 120, 'Choose your Mathematics challenge to enter SPM City', {
            fontSize: '18px',
            fontFamily: '"Rajdhani", sans-serif',
            fontStyle: 'bold',
            color: '#88ccff'
        }).setOrigin(0.5);

        // Mode container
        this.modeSelectionContainer = this.add.container(0, 0);

        // Endless Run Button
        const endlessBtn = this.createButton(width / 2, 210, '⚡ ENDLESS RUN', () => {
            this.showEndlessOptions(width, height);
        });
        const endlessDesc = this.add.text(width / 2, 252, '● 8 Zone Progression • Boss Showdowns • Survive as long as possible', {
            fontSize: '15px',
            fontFamily: '"Rajdhani", sans-serif',
            fontStyle: 'bold',
            color: '#00ff88'
        }).setOrigin(0.5);
        this.modeSelectionContainer.add([endlessBtn, endlessDesc]);

        // SPM Sprint Button
        const spmBtn = this.createButton(width / 2, 340, '⏱️ SPM SPRINT', () => {
            this.showSprintOptions(width, height);
        });
        const spmDesc = this.add.text(width / 2, 382, '● Official Timed Exam Simulation • Mixed Form 5 Chapters • Grades A+ to G', {
            fontSize: '15px',
            fontFamily: '"Rajdhani", sans-serif',
            fontStyle: 'bold',
            color: '#00ffff'
        }).setOrigin(0.5);
        this.modeSelectionContainer.add([spmBtn, spmDesc]);

        // Back button
        this.backBtn = this.createButton(width / 2, height - 65, 'BACK TO MENU', () => {
            if (this.subOptionElements.length > 0) {
                this.clearSubOptions();
                this.modeSelectionContainer.setVisible(true);
            } else {
                this.scene.start('MainMenuScene');
            }
        });
    }

    clearSubOptions() {
        this.subOptionElements.forEach(el => {
            if (el && el.destroy) el.destroy();
        });
        this.subOptionElements = [];
    }

    showEndlessOptions(width, height) {
        this.modeSelectionContainer.setVisible(false);
        this.clearSubOptions();

        const title = this.add.text(width / 2, 190, 'ENDLESS RUN — SELECT DIFFICULTY', {
            fontSize: '26px',
            fontFamily: '"Orbitron", "Rajdhani", sans-serif',
            color: '#00ff88',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.subOptionElements.push(title);

        const diffs = [
            { label: 'EASY', desc: 'Form 5 Core Basics (Difficulty 1-2)', min: 1, max: 2, y: 265, color: '#00ff88' },
            { label: 'NORMAL', desc: 'Standard SPM KSSM (Difficulty 2-4)', min: 2, max: 4, y: 360, color: '#ffd700' },
            { label: 'HARD', desc: 'Advanced KBAT High Order (Difficulty 4-6)', min: 4, max: 6, y: 455, color: '#ff0055' }
        ];

        diffs.forEach(d => {
            const btn = this.createButton(width / 2, d.y, d.label, () => {
                this.scene.start('GameScene', { 
                    mode: 'endless', 
                    difficulty: { label: d.label, min: d.min, max: d.max } 
                });
            });
            const sub = this.add.text(width / 2, d.y + 36, d.desc, {
                fontSize: '15px',
                fontFamily: '"Rajdhani", sans-serif',
                fontStyle: 'bold',
                color: d.color
            }).setOrigin(0.5);

            this.subOptionElements.push(btn, sub);
        });
    }

    showSprintOptions(width, height) {
        this.modeSelectionContainer.setVisible(false);
        this.clearSubOptions();

        const title = this.add.text(width / 2, 180, '⏱️ SPM SPRINT — SELECT PRESET', {
            fontSize: '26px',
            fontFamily: '"Orbitron", "Rajdhani", sans-serif',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.subOptionElements.push(title);

        const sprintPresets = [
            { 
                title: 'QUICK SPRINT — 5 MINS', 
                subtitle: '15 Questions Target • Mixed Chapters 1-8 • Standard SPM',
                duration: 300, 
                targetQuestions: 15, 
                difficulty: { label: 'Standard', min: 2, max: 4 },
                y: 255 
            },
            { 
                title: 'SPM PAPER 1 — 10 MINS', 
                subtitle: '30 Questions Target • Complete Exam Simulation • Standard SPM',
                duration: 600, 
                targetQuestions: 30, 
                difficulty: { label: 'SPM Exam', min: 2, max: 5 },
                y: 355 
            },
            { 
                title: 'KBAT SPRINT — 5 MINS (HARD)', 
                subtitle: '15 Questions Target • High Order Thinking Skills (Levels 4-6)',
                duration: 300, 
                targetQuestions: 15, 
                difficulty: { label: 'KBAT Hard', min: 4, max: 6 },
                y: 455 
            }
        ];

        sprintPresets.forEach(preset => {
            const btn = this.createButton(width / 2, preset.y, preset.title, () => {
                this.scene.start('GameScene', { 
                    mode: 'sprint', 
                    sprintDuration: preset.duration,
                    targetQuestions: preset.targetQuestions,
                    difficulty: preset.difficulty 
                });
            });
            const sub = this.add.text(width / 2, preset.y + 36, preset.subtitle, {
                fontSize: '15px',
                fontFamily: '"Rajdhani", sans-serif',
                fontStyle: 'bold',
                color: '#ffd700'
            }).setOrigin(0.5);

            this.subOptionElements.push(btn, sub);
        });
    }

    createButton(x, y, textStr, onClick) {
        const btn = this.add.container(x, y);
        const bg = this.add.image(0, 0, 'button').setInteractive({ useHandCursor: true });
        const txt = this.add.text(0, 0, textStr, {
            fontSize: '20px',
            fontFamily: '"Orbitron", "Rajdhani", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([bg, txt]);

        bg.on('pointerover', () => {
            bg.setTexture('button-hover');
            this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 100 });
            txt.setColor('#00f0ff');
        });

        bg.on('pointerout', () => {
            bg.setTexture('button');
            this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 });
            txt.setColor('#ffffff');
        });

        bg.on('pointerdown', () => {
            audioManager.playClick();
            this.tweens.add({ targets: btn, scaleX: 0.95, scaleY: 0.95, duration: 50, yoyo: true });
            onClick();
        });

        return btn;
    }
}
