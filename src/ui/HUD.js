import audioManager from '../utils/AudioManager.js';

export default class HUD {
    constructor(scene) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        // Left HUD Card (Distance & Shields)
        this.leftCard = scene.add.graphics().setScrollFactor(0);
        this.leftCard.fillStyle(0x060c22, 0.75);
        this.leftCard.fillRoundedRect(16, 14, 210, 72, 8);
        this.leftCard.lineStyle(2, 0x00f3ff, 0.8);
        this.leftCard.strokeRoundedRect(16, 14, 210, 72, 8);

        this.distanceText = scene.add.text(28, 22, 'DIST: 0m', {
            fontSize: '18px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
        }).setScrollFactor(0);

        this.shieldsText = scene.add.text(28, 50, 'SHIELDS: 0', {
            fontSize: '16px', fontFamily: "'Rajdhani', sans-serif", color: '#00f3ff', fontStyle: 'bold'
        }).setScrollFactor(0);

        // Right HUD Card (Score & Coins)
        this.rightCard = scene.add.graphics().setScrollFactor(0);
        this.rightCard.fillStyle(0x060c22, 0.75);
        this.rightCard.fillRoundedRect(width - 236, 14, 220, 72, 8);
        this.rightCard.lineStyle(2, 0xff00a0, 0.8);
        this.rightCard.strokeRoundedRect(width - 236, 14, 220, 72, 8);

        this.scoreText = scene.add.text(width - 28, 22, 'SCORE: 0', {
            fontSize: '18px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(1, 0).setScrollFactor(0);

        this.coinsText = scene.add.text(width - 28, 50, 'COINS: 0', {
            fontSize: '16px', fontFamily: "'Rajdhani', sans-serif", color: '#00ff88', fontStyle: 'bold'
        }).setOrigin(1, 0).setScrollFactor(0);

        // Audio toggle button (cyber pill)
        this.audioBtn = scene.add.text(width - 28, 96, audioManager.isMuted ? '🔇 MUTE' : '🔊 SFX', {
            fontSize: '14px',
            fontFamily: "'Rajdhani', sans-serif",
            fontStyle: 'bold',
            color: '#00ffff',
            backgroundColor: '#0c1838',
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0).setScrollFactor(0).setInteractive({ useHandCursor: true });

        this.audioBtn.on('pointerdown', () => {
            const muted = audioManager.toggleMute();
            this.audioBtn.setText(muted ? '🔇 MUTE' : '🔊 SFX');
            audioManager.playClick();
        });

        this.comboText = scene.add.text(width / 2, 40, '', {
            fontSize: '32px', fontFamily: "'Orbitron', sans-serif", color: '#ffaa00', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);

        this.zoneText = scene.add.text(24, height - 24, 'ZONE 01', {
            fontSize: '18px', fontFamily: "'Orbitron', sans-serif", color: '#00ff88', fontStyle: 'bold',
            stroke: '#050c1e', strokeThickness: 3
        }).setOrigin(0, 1).setScrollFactor(0);

        // Sprint mode specific UI elements
        this.isSprintMode = false;
        this.sprintTimerText = scene.add.text(width / 2, 18, '', {
            fontSize: '26px', fontFamily: "'Orbitron', sans-serif", color: '#00ffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5, 0).setScrollFactor(0).setVisible(false);

        this.sprintProgressText = scene.add.text(width / 2, 54, '', {
            fontSize: '18px', fontFamily: "'Rajdhani', sans-serif", color: '#ffd700', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5, 0).setScrollFactor(0).setVisible(false);

        this.lastWarningPulse = 0;
    }

    setSprintMode(durationSeconds, targetQuestions) {
        this.isSprintMode = true;
        this.sprintTimerText.setVisible(true);
        this.sprintProgressText.setVisible(true);
        this.updateSprintTimer(durationSeconds);
        this.updateSprintProgress(0, targetQuestions);
        // Adjust combo text position slightly lower so they don't overlap
        this.comboText.setY(85);
    }

    updateSprintTimer(secondsRemaining) {
        if (!this.isSprintMode) return;
        const mins = Math.floor(Math.max(0, secondsRemaining) / 60);
        const secs = Math.floor(Math.max(0, secondsRemaining) % 60);
        const formatted = `⏱️ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        this.sprintTimerText.setText(formatted);

        if (secondsRemaining <= 30) {
            this.sprintTimerText.setColor('#ff0044');
            // Periodic pulse when low on time
            const now = Date.now();
            if (now - this.lastWarningPulse > 1000) {
                this.lastWarningPulse = now;
                this.scene.tweens.add({
                    targets: this.sprintTimerText,
                    scaleX: 1.25,
                    scaleY: 1.25,
                    duration: 200,
                    yoyo: true
                });
            }
        } else if (secondsRemaining <= 60) {
            this.sprintTimerText.setColor('#ffcc00');
        } else {
            this.sprintTimerText.setColor('#00ffff');
        }
    }

    updateSprintProgress(completed, target) {
        if (!this.isSprintMode) return;
        this.sprintProgressText.setText(`SPM EXAM: ${completed}/${target} Qs`);
    }

    updateDistance(metres) {
        this.distanceText.setText(`DIST: ${Math.floor(metres)}m`);
    }

    updateScore(score) {
        this.scoreText.setText(`SCORE: ${score}`);
    }

    updateCombo(combo, multiplier) {
        if (combo > 1) {
            this.comboText.setText(`COMBO x${combo}`);
            this.scene.tweens.add({
                targets: this.comboText,
                scaleX: 1.4, scaleY: 1.4,
                duration: 120, yoyo: true
            });
        } else {
            this.comboText.setText('');
        }
    }

    updateShields(shields) {
        this.shieldsText.setText(`SHIELDS: ${shields}`);
    }

    updateCoins(coins) {
        this.coinsText.setText(`COINS: ${coins}`);
    }

    updateZone(zone, lang) {
        const title = lang === 'bm' ? zone.nameBm : zone.nameEn;
        this.zoneText.setText(`ZONE 0${zone.id} | ${title.toUpperCase()}`);
        this.zoneText.setColor(zone.labelColor);
        this.showZoneBanner(zone, lang);
    }

    showZoneBanner(zone, lang) {
        const title = lang === 'bm' ? zone.nameBm : zone.nameEn;
        const bannerText = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 - 100, `ZONE 0${zone.id} — ${title.toUpperCase()}`, {
            fontSize: '40px', fontFamily: "'Orbitron', sans-serif", color: zone.labelColor, fontStyle: 'bold', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);

        this.scene.tweens.add({
            targets: bannerText,
            alpha: 1,
            duration: 300,
            hold: 1500,
            yoyo: true,
            onComplete: () => bannerText.destroy()
        });
    }

    showFever() {
        const text = this.scene.add.text(this.scene.cameras.main.width / 2, 110, '⚡ MATH FEVER! ⚡', {
            fontSize: '48px', fontFamily: "'Orbitron', sans-serif", color: '#ff0055', fontStyle: 'bold',
            stroke: '#ffffff', strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0);
        
        this.scene.tweens.add({
            targets: text,
            scaleX: 1.2, scaleY: 1.2,
            duration: 200, yoyo: true, repeat: 3,
            onComplete: () => text.destroy()
        });
    }

    showCorrect(points) {
        const text = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, `+${points}`, {
            fontSize: '36px', fontFamily: "'Orbitron', sans-serif", color: '#00ff88', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);

        this.scene.tweens.add({
            targets: text,
            y: '-=50', alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });
    }

    showWrong() {
        const text = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, 'WRONG!', {
            fontSize: '36px', fontFamily: "'Orbitron', sans-serif", color: '#ff0044', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);

        this.scene.tweens.add({
            targets: text,
            y: '-=50', alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });
    }

    showPowerUp(type) {}
    hidePowerUp(type) {}
    setLanguage(lang) {}

    destroy() {
        if (this.leftCard) this.leftCard.destroy();
        if (this.rightCard) this.rightCard.destroy();
        this.distanceText.destroy();
        this.shieldsText.destroy();
        this.scoreText.destroy();
        this.coinsText.destroy();
        this.comboText.destroy();
        this.zoneText.destroy();
        this.sprintTimerText.destroy();
        this.sprintProgressText.destroy();
    }
}
