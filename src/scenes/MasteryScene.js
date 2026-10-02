import Phaser from 'phaser';
import { getMasteryProgress, getChapterRewardState, getWeakestTopic, getLearningSummary } from '../utils/Storage.js';
import audioManager from '../utils/AudioManager.js';
import PortraitScreen, { mobileElement, mobileButton } from '../ui/PortraitScreen.js';

const CHAPTERS = [
    ['Variation', 0x00ff88], ['Matrices', 0x00ffff], ['Insurance', 0xff6600], ['Taxation', 0xffcc00],
    ['Transformations', 0xff00ff], ['Trigonometry', 0x0088ff], ['Dispersion', 0x88ff00], ['Modelling', 0xff0044]
];

export default class MasteryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MasteryScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.add.image(width / 2, height / 2, 'bg-layer-1').setDisplaySize(width, height).setAlpha(0.48);
        this.add.rectangle(width / 2, height / 2, width, height, 0x030614, 0.8);

        this.add.text(width / 2, 48, 'MASTERY DASHBOARD', {
            fontSize: '36px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(width / 2, 88, 'Your saved progress across all Form 5 chapters', {
            fontSize: '17px', fontFamily: "'Rajdhani', sans-serif", color: '#bcd8ff', fontStyle: 'bold'
        }).setOrigin(0.5);

        const mastery = getMasteryProgress();
        const summary = this.getRewardSummary(mastery);
        this.add.text(width / 2, 120, `★ ${summary.stars}/32  •  BADGES ${summary.badges}/8  •  BOSS SKINS ${summary.skins}/8`, {
            fontSize: '14px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);
        const learning = getLearningSummary();
        const trendLabel = learning.recentTrend > 0 ? `+${learning.recentTrend} PTS TREND` : `${learning.recentTrend} PTS TREND`;
        this.add.text(width / 2, 142, `LEARNING: ${learning.questionsAttempted} QUESTIONS  •  ${learning.practiceSessions} PRACTICE SESSIONS  •  ${learning.overallAccuracy}% ACCURACY  •  ${trendLabel}`, {
            fontSize: '11px', fontFamily: "'Orbitron', sans-serif", color: learning.recentTrend >= 0 ? '#00ff88' : '#ff6688', fontStyle: 'bold'
        }).setOrigin(0.5);
        const weakestTopics = CHAPTERS.map(([name], index) => {
            const weakest = getWeakestTopic(index + 1);
            return weakest ? `${weakest.name} (${weakest.accuracy}%)` : null;
        }).filter(Boolean).slice(0, 3);
        this.add.text(width / 2, 160, `WEAKEST TOPICS: ${weakestTopics.length ? weakestTopics.join('  •  ') : 'BUILD YOUR FIRST STREAK'}`, {
            fontSize: '11px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);
        CHAPTERS.forEach(([name, color], index) => this.createChapterCard(name, color, index, mastery));

        this.createButton(width / 2, height - 52, 'BACK TO MENU', () => {
            this.scene.start('MainMenuScene');
        });

        const portrait = new PortraitScreen(this, 'MASTERY DASHBOARD', 'Your saved chapter progress');
        portrait.content.append(mobileElement('p', 'portrait-detail',
            `★ ${summary.stars}/32 • BADGES ${summary.badges}/8 • BOSS SKINS ${summary.skins}/8`));
        portrait.content.append(mobileElement('p', 'portrait-detail',
            `${learning.questionsAttempted} questions • ${learning.practiceSessions} practice sessions • ${learning.overallAccuracy}% accuracy`));
        CHAPTERS.forEach(([name], index) => {
            const chapter = index + 1;
            const data = mastery.chapters[String(chapter)] || {};
            const attempted = data.attempted || 0;
            const accuracy = attempted ? Math.round(((data.correct || 0) / attempted) * 100) : 0;
            const weakest = getWeakestTopic(chapter);
            const card = mobileElement('div', 'portrait-card');
            card.append(mobileElement('h2', '', `${chapter}. ${name}`),
                mobileElement('p', '', `Level ${data.level || 1}/5 • ${accuracy}% accuracy • ${attempted} questions`),
                mobileElement('p', '', weakest ? `WEAKEST: ${weakest.name} (${weakest.accuracy}%)` : 'Build your first practice streak'));
            card.append(mobileButton(weakest ? 'PRACTISE FOCUS TOPIC' : 'PRACTISE CHAPTER', () => {
                this.scene.start('GameScene', {
                    mode: 'practice', practiceChapter: chapter, practiceChapterName: name,
                    practiceTopic: weakest?.name || null,
                    targetQuestions: 10, difficulty: { label: 'Adaptive', min: 1, max: 5 }
                });
            }));
            portrait.content.append(card);
        });
        portrait.addBack('BACK TO MENU', () => this.scene.start('MainMenuScene'));
    }

    getRewardSummary(mastery) {
        return CHAPTERS.reduce((summary, _chapter, index) => {
            const data = mastery.chapters[String(index + 1)] || {};
            const level = data.level || 1;
            summary.stars += Math.max(0, Math.min(5, level - 1));
            if (level >= 3) summary.badges++;
            if (level >= 5) summary.skins++;
            return summary;
        }, { stars: 0, badges: 0, skins: 0 });
    }

    createChapterCard(name, color, index, mastery) {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const x = column === 0 ? 320 : 960;
        const y = 190 + row * 112;
        const data = mastery.chapters[String(index + 1)] || {};
        const attempted = data.attempted || 0;
        const correct = data.correct || 0;
        const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
        const level = data.level || 1;
        const rewards = getChapterRewardState(index + 1);
        const weakestTopic = getWeakestTopic(index + 1);

        const card = this.add.rectangle(x, y, 560, 86, 0x08122c, 0.96).setStrokeStyle(2, color, 0.8);
        this.add.text(x - 245, y - 27, `${index + 1}. ${name}`, {
            fontSize: '19px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
        });
        this.add.text(x - 245, y + 3, `LEVEL ${level}/5  •  ${accuracy}% ACCURACY  •  ${attempted} QUESTIONS`, {
            fontSize: '14px', fontFamily: "'Rajdhani', sans-serif", color: '#bcd8ff', fontStyle: 'bold'
        });
        this.add.text(x + 210, y - 20, `${'★'.repeat(rewards.stars)}${'☆'.repeat(5 - rewards.stars)}`, {
            fontSize: '15px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);
        const track = this.add.rectangle(x - 245, y + 29, 390, 10, 0x142340, 1).setOrigin(0, 0.5);
        this.add.rectangle(x - 245, y + 29, attempted ? Math.max(8, 390 * accuracy / 100) : 0, 10, color, 1).setOrigin(0, 0.5);
        const status = rewards.bossSkinUnlocked ? 'BOSS SKIN UNLOCKED' : rewards.badgeUnlocked ? 'NEXT: SKIN @ LV5' : attempted ? 'NEXT: BADGE @ LV3' : 'START PRACTISING';
        this.add.text(x + 215, y - 8, status, {
            fontSize: '10px', fontFamily: "'Orbitron', sans-serif", color: Phaser.Display.Color.IntegerToColor(color).rgba, fontStyle: 'bold'
        }).setOrigin(0.5);
        const focusButton = this.add.rectangle(x + 205, y + 21, 170, 24, color, 0.18)
            .setStrokeStyle(1, color, 0.9)
            .setInteractive({ useHandCursor: true });
        const focusLabel = this.add.text(x + 205, y + 21, weakestTopic ? 'PRACTISE FOCUS TOPIC' : 'PRACTISE CHAPTER', {
            fontSize: '10px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        focusButton.on('pointerdown', (pointer, localX, localY, event) => {
            event?.stopPropagation();
            audioManager.playClick();
            this.scene.start('GameScene', {
                mode: 'practice', practiceChapter: index + 1, practiceChapterName: name,
                practiceTopic: weakestTopic ? weakestTopic.name : null,
                targetQuestions: 10, difficulty: { label: 'Adaptive', min: 1, max: 5 }
            });
        });
        this.add.text(x - 245, y + 41, weakestTopic ? `FOCUS: ${weakestTopic.name} (${weakestTopic.accuracy}%)` : 'FOCUS: BUILD YOUR FIRST STREAK', {
            fontSize: '11px', fontFamily: "'Rajdhani', sans-serif", color: '#7898bd', fontStyle: 'bold'
        });
        card.setInteractive({ useHandCursor: true });
        card.on('pointerdown', () => {
            audioManager.playClick();
            this.scene.start('GameScene', {
                mode: 'practice',
                practiceChapter: index + 1,
                practiceChapterName: name,
                practiceTopic: null,
                targetQuestions: 10,
                difficulty: { label: 'Adaptive', min: 1, max: 5 }
            });
        });
    }

    createButton(x, y, label, onClick) {
        const button = this.add.container(x, y);
        const bg = this.add.image(0, 0, 'button').setInteractive({ useHandCursor: true });
        const text = this.add.text(0, 0, label, {
            fontSize: '18px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        bg.on('pointerdown', () => {
            audioManager.playClick();
            onClick();
        });
        button.add([bg, text]);
        return button;
    }
}
