import Phaser from 'phaser';
import { getDailyChallenge } from '../utils/Storage.js';
import PortraitScreen from '../ui/PortraitScreen.js';

const CHAPTER_NAMES = ['Variation', 'Matrices', 'Insurance', 'Taxation', 'Transformations', 'Trigonometry', 'Dispersion', 'Modelling'];

export default class ModeSelectScene extends Phaser.Scene {
    constructor() { super({ key: 'ModeSelectScene' }); }
    create() {
        this.portrait = new PortraitScreen(this, 'SELECT GAME MODE', 'Choose your Mathematics challenge');
        this.showPortraitMain();
    }

    showPortraitMain(daily = getDailyChallenge()) {
        const ui = this.portrait;
        ui.setHeader('SELECT GAME MODE', 'Choose your Mathematics challenge');
        ui.clear();
        ui.addChoice('⚡ ENDLESS RUN', 'Eight academy districts and guardian challenges', () => this.showPortraitEndless());
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
        ui.addChoice('👑 BOSS TRAINING', 'Practise with a chapter guardian', () => this.showPortraitChapters(true));
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

}
