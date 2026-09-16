import Phaser from 'phaser';
import { getLanguage, saveLanguage, getPlayerName, savePlayerName } from '../utils/Storage.js';
import audioManager from '../utils/AudioManager.js';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Rich Cyberpunk City Backdrop
        this.add.image(width / 2, height / 2, 'bg-layer-1').setDisplaySize(width, height).setAlpha(0.65);
        this.add.rectangle(width / 2, height / 2, width, height, 0x030614, 0.45);

        // Floating ambient cyber particles
        const particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            quantity: 2,
            lifespan: 5000,
            alpha: { start: 0.6, end: 0 },
            scale: { start: 0.8, end: 0.1 },
            speedY: { min: -15, max: 15 },
            speedX: { min: -15, max: 15 },
        });

        const currentLanguage = getLanguage() || 'en';

        // Main Title with Glowing Neon Aesthetic
        const titleText = this.add.text(width / 2, 95, 'CYE MATH RUNNER', {
            fontSize: '52px',
            fontFamily: '"Orbitron", "Segoe UI", sans-serif',
            color: '#ffd700',
            fontStyle: '900',
            stroke: '#00f0ff',
            strokeThickness: 3,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff007f', blur: 15, stroke: true, fill: true }
        }).setOrigin(0.5);

        this.add.text(width / 2, 148, 'SPM FINAL RUN', {
            fontSize: '24px',
            fontFamily: '"Rajdhani", "Orbitron", sans-serif',
            color: '#00f0ff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 178, 'RUN  •  SOLVE  •  SURVIVE', {
            fontSize: '16px',
            fontFamily: '"Rajdhani", "Segoe UI", sans-serif',
            color: '#ffffff',
            fontStyle: '600'
        }).setOrigin(0.5);

        // Cute speech bubble badge (clearly above character, zero overlap)
        const badge = this.add.text(width / 2, 210, '✨ (◕‿◕✿) READY TO RUN!', {
            fontSize: '14px',
            fontFamily: '"Rajdhani", "Segoe UI", sans-serif',
            color: '#00ffcc',
            fontStyle: 'bold',
            backgroundColor: '#060d24',
            padding: { x: 12, y: 5 }
        }).setOrigin(0.5);

        // Cute Anime Character Holographic Pedestal (compact, cleanly spaced)
        const pedestalOuter = this.add.ellipse(width / 2, 320, 56, 16, 0x00f0ff, 0.28);
        const pedestalInner = this.add.ellipse(width / 2, 320, 36, 10, 0xff007f, 0.38);
        const playerPreview = this.add.image(width / 2, 272, 'player').setScale(1.35);

        this.tweens.add({
            targets: playerPreview,
            y: 265,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: [pedestalOuter, pedestalInner],
            scaleX: 0.88,
            alpha: 0.22,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Buttons
        this.createButton(width / 2, 400, 'PLAY GAME', () => {
            this.scene.start('ModeSelectScene');
        });

        this.createButton(width / 2, 480, 'LEADERBOARD', () => {
            this.scene.start('LeaderboardScene');
        });

        // Audio toggle button
        const audioBtn = this.add.text(width - 150, 45, audioManager.isMuted ? '🔇 MUTE' : '🔊 AUDIO', {
            fontSize: '16px',
            fontFamily: '"Rajdhani", sans-serif',
            fontStyle: 'bold',
            color: '#00f0ff',
            backgroundColor: '#060d24',
            padding: { x: 12, y: 6 }
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

        audioBtn.on('pointerdown', () => {
            const muted = audioManager.toggleMute();
            audioBtn.setText(muted ? '🔇 MUTE' : '🔊 AUDIO');
            audioManager.playClick();
        });

        // Language toggle
        const langText = this.add.text(width - 45, 45, 'EN / BM', {
            fontSize: '16px',
            fontFamily: '"Rajdhani", sans-serif',
            fontStyle: 'bold',
            color: '#ffffff',
            backgroundColor: '#060d24',
            padding: { x: 12, y: 6 }
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
        
        langText.on('pointerdown', () => {
            const newLang = getLanguage() === 'en' ? 'bm' : 'en';
            saveLanguage(newLang);
            this.scene.restart();
        });

        // Pilot Name badge
        const playerName = getPlayerName() || 'PILOT';
        const nameCard = this.add.text(width / 2, 575, `🎮 PILOT: ${playerName.toUpperCase()}`, {
            fontSize: '18px',
            fontFamily: '"Rajdhani", "Orbitron", sans-serif',
            fontStyle: 'bold',
            color: '#00f0ff',
            backgroundColor: '#08122a',
            padding: { x: 16, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        nameCard.on('pointerdown', () => {
            const newName = prompt('Enter player name:', playerName);
            if (newName) {
                savePlayerName(newName);
                nameCard.setText(`🎮 PILOT: ${newName.toUpperCase()}`);
            }
        });

        // Version
        this.add.text(12, height - 15, 'v0.6 — SPM Arcade Edition • Form 5 MathVerse', {
            fontSize: '13px',
            fontFamily: '"Rajdhani", sans-serif',
            color: '#6688aa'
        }).setOrigin(0, 1);
    }

    createButton(x, y, textStr, onClick) {
        const btn = this.add.container(x, y);
        const bg = this.add.image(0, 0, 'button').setInteractive({ useHandCursor: true });
        const txt = this.add.text(0, 0, textStr, {
            fontSize: '22px',
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
