import Phaser from 'phaser';
import { getTopScores, fetchGlobalScores } from '../utils/Storage.js';
import audioManager from '../utils/AudioManager.js';

export default class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
        this.currentTab = 'global'; // 'global' or 'local'
        this.scoresContainer = null;
        this.statusText = null;
    }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a2e');
        const { width, height } = this.cameras.main;

        this.add.text(width / 2, 45, 'GLOBAL LEADERBOARD', {
            fontSize: '34px', fontFamily: "'Orbitron', sans-serif", color: '#00ffff', fontStyle: 'bold',
            stroke: '#003344', strokeThickness: 4
        }).setOrigin(0.5);

        // Tab buttons container
        this.createTabButtons(width);

        // Container for score rows
        this.scoresContainer = this.add.container(0, 0);

        // Loading / Status text
        this.statusText = this.add.text(width / 2, 280, '', {
            fontSize: '20px', fontFamily: "'Rajdhani', sans-serif", color: '#88aacc', align: 'center', fontStyle: '600'
        }).setOrigin(0.5);

        // Back button
        const btn = this.add.container(width / 2, height - 55);
        const bg = this.add.image(0, 0, 'button').setInteractive({ useHandCursor: true });
        const txt = this.add.text(0, 0, 'BACK TO MENU', { fontSize: '18px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
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
            this.scene.start('MainMenuScene');
        });

        // Load initial tab view
        this.loadCurrentTab();
    }

    createTabButtons(width) {
        // Global Tab
        this.globalTabBtn = this.add.text(width / 2 - 130, 95, '🌐 GLOBAL RANKS', {
            fontSize: '15px', fontFamily: "'Orbitron', sans-serif", color: '#00ffff', backgroundColor: '#102554', padding: { x: 18, y: 8 }, fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Local Tab
        this.localTabBtn = this.add.text(width / 2 + 130, 95, '📱 LOCAL DEVICE', {
            fontSize: '15px', fontFamily: "'Orbitron', sans-serif", color: '#88aacc', backgroundColor: '#0a142e', padding: { x: 18, y: 8 }, fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.globalTabBtn.on('pointerdown', () => {
            if (this.currentTab === 'global') return;
            audioManager.playClick();
            this.currentTab = 'global';
            this.updateTabStyles();
            this.loadCurrentTab();
        });

        this.localTabBtn.on('pointerdown', () => {
            if (this.currentTab === 'local') return;
            audioManager.playClick();
            this.currentTab = 'local';
            this.updateTabStyles();
            this.loadCurrentTab();
        });
    }

    updateTabStyles() {
        if (this.currentTab === 'global') {
            this.globalTabBtn.setColor('#00ffff');
            this.globalTabBtn.setBackgroundColor('#102554');
            this.localTabBtn.setColor('#88aacc');
            this.localTabBtn.setBackgroundColor('#0a142e');
        } else {
            this.localTabBtn.setColor('#00ffff');
            this.localTabBtn.setBackgroundColor('#102554');
            this.globalTabBtn.setColor('#88aacc');
            this.globalTabBtn.setBackgroundColor('#0a142e');
        }
    }

    async loadCurrentTab() {
        this.scoresContainer.removeAll(true);

        if (this.currentTab === 'global') {
            this.statusText.setText('CONNECTING TO CYE GLOBAL NETWORK...');
            const globalScores = await fetchGlobalScores(10);
            this.statusText.setText('');

            if (globalScores && globalScores.length > 0) {
                this.renderScoresTable(globalScores);
            } else {
                // Offline fallback
                const local = getTopScores(10) || [];
                if (local.length > 0) {
                    this.statusText.setText('🌐 (Offline Mode — Displaying Local Scores)');
                    this.renderScoresTable(local);
                } else {
                    this.statusText.setText('No global records yet.\nBe the first to upload an SPM run!');
                }
            }
        } else {
            this.statusText.setText('');
            const local = getTopScores(10) || [];
            if (local.length > 0) {
                this.renderScoresTable(local);
            } else {
                this.statusText.setText('No local scores saved on this device yet.');
            }
        }
    }

    renderScoresTable(scores) {
        const startY = 145;
        const gap = 36;

        // Table Header
        const hRank = this.add.text(140, startY, 'RANK', { fontSize: '14px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold' });
        const hName = this.add.text(260, startY, 'NAME', { fontSize: '14px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold' });
        const hMode = this.add.text(460, startY, 'MODE / GRADE', { fontSize: '14px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold' });
        const hScore = this.add.text(680, startY, 'SCORE', { fontSize: '14px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold' });
        const hDist = this.add.text(860, startY, 'DIST', { fontSize: '14px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold' });
        const hAcc = this.add.text(1020, startY, 'ACCURACY', { fontSize: '14px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold' });

        this.scoresContainer.add([hRank, hName, hMode, hScore, hDist, hAcc]);

        scores.forEach((s, idx) => {
            const y = startY + gap * (idx + 1);
            const rankColor = idx === 0 ? '#ffd700' : (idx === 1 ? '#e0e0e0' : (idx === 2 ? '#cd7f32' : '#ffffff'));

            const tRank = this.add.text(140, y, `#${idx + 1}`, { fontSize: '18px', fontFamily: "'Orbitron', sans-serif", color: rankColor, fontStyle: 'bold' });
            const tName = this.add.text(260, y, s.name || 'Runner', { fontSize: '19px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });

            const modeTag = s.mode === 'sprint' ? (s.grade ? `⚡ SPRINT [${s.grade}]` : '⚡ SPRINT') : '🏃 ENDLESS';
            const modeColor = s.mode === 'sprint' ? '#00ffff' : '#00ff88';
            const tMode = this.add.text(460, y, modeTag, { fontSize: '16px', fontFamily: "'Rajdhani', sans-serif", color: modeColor, fontStyle: 'bold' });

            const tScore = this.add.text(680, y, `${s.score}`, { fontSize: '18px', fontFamily: "'Fira Code', monospace", color: '#ffd700', fontStyle: 'bold' });
            const tDist = this.add.text(860, y, `${s.distance || 0}m`, { fontSize: '18px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });
            const tAcc = this.add.text(1020, y, `${(s.accuracy || 0).toFixed(1)}%`, { fontSize: '18px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });

            this.scoresContainer.add([tRank, tName, tMode, tScore, tDist, tAcc]);
        });
    }
}
