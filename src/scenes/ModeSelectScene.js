import Phaser from 'phaser';
import audioManager from '../utils/AudioManager.js';
import { getDailyChallenge } from '../utils/Storage.js';
import PortraitScreen from '../ui/PortraitScreen.js';

const CHAPTER_NAMES = ['Variation', 'Matrices', 'Insurance', 'Taxation', 'Transformations', 'Trigonometry', 'Dispersion', 'Modelling'];

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

        // Chapter Practice Button
        const practiceBtn = this.createButton(width / 2, 430, '📘 CHAPTER PRACTICE', () => {
            this.showPracticeOptions(width, height);
        });
        const practiceDesc = this.add.text(width / 2, 472, '● Choose one chapter • No obstacles • Adaptive mastery session', {
            fontSize: '15px', fontFamily: '"Rajdhani", sans-serif', fontStyle: 'bold', color: '#ffcc00'
        }).setOrigin(0.5);
        this.modeSelectionContainer.add([practiceBtn, practiceDesc]);

        const daily = getDailyChallenge();
        const dailyBtn = this.createButton(width / 2, 535, daily.completed ? '✅ DAILY COMPLETE' : '🔥 DAILY CHALLENGE', () => {
            if (daily.completed) return;
            const chapterNames = ['Variation', 'Matrices', 'Insurance', 'Taxation', 'Transformations', 'Trigonometry', 'Dispersion', 'Modelling'];
            this.scene.start('GameScene', {
                mode: 'practice',
                practiceChapter: daily.chapter,
                practiceChapterName: chapterNames[daily.chapter - 1],
                targetQuestions: 12,
                difficulty: daily.difficulty,
                dailyChallenge: true,
                dailyChallengeKey: daily.dateKey
            });
        });
        const streakLabel = daily.streak > 0 ? ` • ${daily.streak}-DAY STREAK` : '';
        const dailyDesc = this.add.text(width / 2, 570, `Chapter ${daily.chapter} • ${daily.difficulty.label} • 12 questions${streakLabel}`, {
            fontSize: '14px', fontFamily: '"Rajdhani", sans-serif', fontStyle: 'bold', color: daily.completed ? '#88ccff' : '#ff6688'
        }).setOrigin(0.5);
        this.modeSelectionContainer.add([dailyBtn, dailyDesc]);

        const bossBtn = this.createButton(width / 2, 635, '👑 BOSS TRAINING', () => {
            this.showBossTrainingOptions(width, height);
        });
        this.modeSelectionContainer.add(bossBtn);

        // Back button
        this.backBtn = this.createButton(width / 2, height - 30, 'BACK TO MENU', () => {
            if (this.subOptionElements.length > 0) {
                this.clearSubOptions();
                this.modeSelectionContainer.setVisible(true);
            } else {
                this.scene.start('MainMenuScene');
            }
        }).setDepth(50);

        this.portrait = new PortraitScreen(this, 'SELECT GAME MODE', 'Choose your Mathematics challenge');
        this.showPortraitMain(daily);
    }

    showPortraitMain(daily = getDailyChallenge()) {
        const ui = this.portrait;
        ui.setHeader('SELECT GAME MODE', 'Choose your Mathematics challenge');
        ui.clear();
        ui.addChoice('⚡ ENDLESS RUN', 'Eight zones, obstacles, and boss showdowns', () => this.showPortraitEndless());
        ui.addChoice('⏱️ SPM SPRINT', 'Timed Form 5 exam practice', () => this.showPortraitSprint());
        ui.addChoice('📘 CHAPTER PRACTICE', 'Adaptive questions without obstacles', () => this.showPortraitChapters(false));
        ui.addChoice(daily.completed ? '✅ DAILY COMPLETE' : '🔥 DAILY CHALLENGE',
            `Chapter ${daily.chapter} • ${daily.difficulty.label} • 12 questions`, () => {
                this.scene.start('GameScene', {
                    mode: 'practice',
                    practiceChapter: daily.chapter,
                    practiceChapterName: CHAPTER_NAMES[daily.chapter - 1],
                    targetQuestions: 12,
                    difficulty: daily.difficulty,
                    dailyChallenge: true,
                    dailyChallengeKey: daily.dateKey
                });
            }, daily.completed);
        ui.addChoice('👑 BOSS TRAINING', 'Fight a chapter guardian immediately', () => this.showPortraitChapters(true));
        ui.addBack('BACK TO MENU', () => this.scene.start('MainMenuScene'));
    }

    showPortraitSubmenu(title, subtitle, choices) {
        const ui = this.portrait;
        ui.setHeader(title, subtitle);
        ui.clear();
        choices.forEach(({ label, detail, action }) => ui.addChoice(label, detail, action));
        ui.addBack('◀ GAME MODES', () => this.showPortraitMain());
    }

    showPortraitEndless() {
        const difficulties = [
            { label: 'EASY', detail: 'Form 5 core basics', min: 1, max: 2 },
            { label: 'NORMAL', detail: 'Standard SPM mathematics', min: 2, max: 4 },
            { label: 'HARD', detail: 'Advanced KBAT questions', min: 4, max: 6 }
        ];
        this.showPortraitSubmenu('ENDLESS RUN', 'Choose a difficulty', difficulties.map(d => ({
            label: d.label, detail: d.detail,
            action: () => this.scene.start('GameScene', { mode: 'endless', difficulty: { label: d.label, min: d.min, max: d.max } })
        })));
    }

    showPortraitSprint() {
        const presets = [
            { label: 'QUICK SPRINT — 5 MINS', detail: '15 questions • Standard SPM', duration: 300, target: 15, difficulty: { label: 'Standard', min: 2, max: 4 } },
            { label: 'SPM PAPER 1 — 10 MINS', detail: '30 questions • Exam simulation', duration: 600, target: 30, difficulty: { label: 'SPM Exam', min: 2, max: 5 } },
            { label: 'KBAT SPRINT — 5 MINS', detail: '15 high-order questions', duration: 300, target: 15, difficulty: { label: 'KBAT Hard', min: 4, max: 6 } }
        ];
        this.showPortraitSubmenu('SPM SPRINT', 'Choose an exam preset', presets.map(p => ({
            label: p.label, detail: p.detail,
            action: () => this.scene.start('GameScene', { mode: 'sprint', sprintDuration: p.duration, targetQuestions: p.target, difficulty: p.difficulty })
        })));
    }

    showPortraitChapters(bossTraining) {
        this.showPortraitSubmenu(bossTraining ? 'BOSS TRAINING' : 'CHAPTER PRACTICE',
            bossTraining ? 'Choose a guardian' : 'Choose a chapter', CHAPTER_NAMES.map((name, index) => ({
                label: `${index + 1}. ${name}`,
                action: () => this.scene.start('GameScene', {
                    mode: bossTraining ? 'bossTraining' : 'practice',
                    practiceChapter: index + 1,
                    practiceChapterName: name,
                    targetQuestions: bossTraining ? 3 : 10,
                    difficulty: bossTraining ? { label: 'Boss Training', min: 3, max: 6 } : { label: 'Adaptive', min: 1, max: 5 }
                })
            })));
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

    showPracticeOptions(width, height) {
        this.modeSelectionContainer.setVisible(false);
        this.clearSubOptions();

        const title = this.add.text(width / 2, 155, 'CHAPTER PRACTICE — SELECT TOPIC', {
            fontSize: '26px', fontFamily: '"Orbitron", sans-serif', color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);
        const subtitle = this.add.text(width / 2, 188, '10 adaptive questions • relaxed run • progress saved to mastery', {
            fontSize: '16px', fontFamily: '"Rajdhani", sans-serif', color: '#bcd8ff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.subOptionElements.push(title, subtitle);

        const chapters = [
            'Variation', 'Matrices', 'Insurance', 'Taxation',
            'Transformations', 'Trigonometry', 'Dispersion', 'Modelling'
        ];
        chapters.forEach((name, index) => {
            const column = index % 2;
            const row = Math.floor(index / 2);
            const btn = this.createButton(column === 0 ? 430 : 850, 245 + row * 92, `${index + 1}. ${name}`, () => {
                this.scene.start('GameScene', {
                    mode: 'practice',
                    practiceChapter: index + 1,
                    practiceChapterName: name,
                    targetQuestions: 10,
                    difficulty: { label: 'Adaptive', min: 1, max: 5 }
                });
            });
            this.subOptionElements.push(btn);
        });
    }

    showBossTrainingOptions(width, height) {
        this.modeSelectionContainer.setVisible(false);
        this.clearSubOptions();

        const title = this.add.text(width / 2, 150, 'BOSS TRAINING — SELECT CHAPTER', {
            fontSize: '26px', fontFamily: '"Orbitron", sans-serif', color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);
        const subtitle = this.add.text(width / 2, 184, 'Fight one guardian immediately • 3 questions • safe practice arena', {
            fontSize: '16px', fontFamily: '"Rajdhani", sans-serif', color: '#bcd8ff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.subOptionElements.push(title, subtitle);

        const chapters = ['Variation', 'Matrices', 'Insurance', 'Taxation', 'Transformations', 'Trigonometry', 'Dispersion', 'Modelling'];
        chapters.forEach((name, index) => {
            const column = index % 2;
            const row = Math.floor(index / 2);
            const btn = this.createButton(column === 0 ? 430 : 850, 240 + row * 85, `${index + 1}. ${name}`, () => {
                this.scene.start('GameScene', {
                    mode: 'bossTraining',
                    practiceChapter: index + 1,
                    practiceChapterName: name,
                    targetQuestions: 3,
                    difficulty: { label: 'Boss Training', min: 3, max: 6 }
                });
            });
            this.subOptionElements.push(btn);
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
