import Phaser from 'phaser';
import { getMasteryProgress, getLearningSummary, getLearningAnalytics, getWeakestTopic } from '../utils/Storage.js';
import audioManager from '../utils/AudioManager.js';
import PortraitScreen, { mobileElement } from '../ui/PortraitScreen.js';

const CHAPTERS = ['Variation', 'Matrices', 'Insurance', 'Taxation', 'Transformations', 'Trigonometry', 'Dispersion', 'Modelling'];

export default class ProgressReportScene extends Phaser.Scene {
    constructor() { super({ key: 'ProgressReportScene' }); }

    create() {
        const { width, height } = this.cameras.main;
        this.add.image(width / 2, height / 2, 'bg-layer-1').setDisplaySize(width, height).setAlpha(0.35);
        this.add.rectangle(width / 2, height / 2, width, height, 0x030614, 0.86);
        this.add.text(width / 2, 42, 'LEARNING PROGRESS REPORT', {
            fontSize: '32px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(width / 2, 78, 'A simple view for students, parents, and teachers', {
            fontSize: '16px', fontFamily: "'Rajdhani', sans-serif", color: '#bcd8ff', fontStyle: 'bold'
        }).setOrigin(0.5);

        const mastery = getMasteryProgress();
        const summary = getLearningSummary();
        const analytics = getLearningAnalytics();
        const totals = analytics.totals;
        this.add.text(width / 2, 112, `QUESTIONS: ${summary.questionsAttempted}  •  ACCURACY: ${summary.overallAccuracy}%  •  PRACTICE SESSIONS: ${summary.practiceSessions}  •  BOSSES DEFEATED: ${totals.bossesDefeated || 0}`, {
            fontSize: '13px', fontFamily: "'Orbitron', sans-serif", color: '#00ff88', fontStyle: 'bold'
        }).setOrigin(0.5);
        const trend = summary.recentTrend >= 0 ? `+${summary.recentTrend}` : `${summary.recentTrend}`;
        this.add.text(width / 2, 138, `RECENT ACCURACY TREND: ${trend} PTS`, {
            fontSize: '14px', fontFamily: "'Orbitron', sans-serif", color: summary.recentTrend >= 0 ? '#00ff88' : '#ff6688', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(180, 185, 'CHAPTER TOPIC ACCURACY', {
            fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: '#00ffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(825, 185, 'WEAKEST TOPIC', {
            fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);

        CHAPTERS.forEach((name, index) => {
            const chapter = mastery.chapters[String(index + 1)] || {};
            const attempted = chapter.attempted || 0;
            const accuracy = attempted ? Math.round(((chapter.correct || 0) / attempted) * 100) : 0;
            const weakest = getWeakestTopic(index + 1);
            const y = 220 + index * 46;
            const color = accuracy >= 80 ? 0x00ff88 : accuracy >= 55 ? 0xffcc00 : 0xff6688;
            this.add.text(42, y, `${index + 1}. ${name}`, { fontSize: '16px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: 'bold' });
            this.add.rectangle(205, y + 8, 300, 12, 0x142340, 1).setOrigin(0, 0.5);
            this.add.rectangle(205, y + 8, attempted ? Math.max(8, 300 * accuracy / 100) : 0, 12, color, 1).setOrigin(0, 0.5);
            this.add.text(520, y, `${accuracy}%  (${attempted})`, { fontSize: '15px', fontFamily: "'Rajdhani', sans-serif", color: '#bcd8ff', fontStyle: 'bold' });
            this.add.text(680, y, weakest ? `${weakest.name} • ${weakest.accuracy}%` : 'No topic data yet', { fontSize: '15px', fontFamily: "'Rajdhani', sans-serif", color: weakest ? '#ffcc00' : '#7898bd', fontStyle: 'bold' });
        });

        const back = this.add.rectangle(width / 2, height - 42, 230, 46, 0x102958, 1).setStrokeStyle(2, 0x00f3ff, 0.9).setInteractive({ useHandCursor: true });
        this.add.text(width / 2, height - 42, 'BACK TO MENU', { fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        back.on('pointerdown', () => { audioManager.playClick(); this.scene.start('MainMenuScene'); });

        const portrait = new PortraitScreen(this, 'LEARNING PROGRESS', 'Your chapter and topic accuracy');
        const grid = mobileElement('div', 'portrait-grid');
        [
            ['QUESTIONS', summary.questionsAttempted],
            ['ACCURACY', `${summary.overallAccuracy}%`],
            ['PRACTICE', summary.practiceSessions],
            ['BOSSES', totals.bossesDefeated || 0]
        ].forEach(([label, value]) => {
            const cell = mobileElement('div', 'portrait-stat');
            cell.append(mobileElement('span', '', label), mobileElement('strong', '', String(value)));
            grid.append(cell);
        });
        portrait.content.append(grid, mobileElement('p', 'portrait-detail', `RECENT ACCURACY TREND: ${trend} PTS`));
        CHAPTERS.forEach((name, index) => {
            const chapter = mastery.chapters[String(index + 1)] || {};
            const attempted = chapter.attempted || 0;
            const accuracy = attempted ? Math.round(((chapter.correct || 0) / attempted) * 100) : 0;
            const weakest = getWeakestTopic(index + 1);
            const card = mobileElement('div', 'portrait-card');
            card.append(mobileElement('h2', '', `${index + 1}. ${name}`),
                mobileElement('p', '', `${accuracy}% accuracy • ${attempted} questions`),
                mobileElement('p', '', weakest ? `Weakest topic: ${weakest.name} (${weakest.accuracy}%)` : 'No topic data yet'));
            portrait.content.append(card);
        });
        portrait.addBack('BACK TO MENU', () => this.scene.start('MainMenuScene'));
    }
}
