import { formatMatrixNotation } from '../utils/MathFormatter.js';
import audioManager from '../utils/AudioManager.js';

export default class MathGateUI {
    constructor(scene) {
        this.scene = scene;
        this.feedbackPanel = null;
    }

    showWrongAnswer({ selectedAnswer, correctAnswer, hint, explanation }, onContinue) {
        this.hideFeedback();

        const { width, height } = this.scene.cameras.main;
        const panel = this.scene.add.container(0, 0).setDepth(300).setScrollFactor(0);
        this.feedbackPanel = panel;

        const dim = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x02040d, 0.88)
            .setInteractive();
        const card = this.scene.add.rectangle(width / 2, height / 2, 940, 500, 0x08122c, 1)
            .setStrokeStyle(3, 0xff0044, 0.95);
        const accent = this.scene.add.rectangle(width / 2, height / 2 - 247, 934, 6, 0xff0044, 1);
        const title = this.scene.add.text(width / 2, 150, 'LET’S LEARN FROM THIS ONE', {
            fontSize: '29px', fontFamily: "'Orbitron', sans-serif", color: '#ff6688', fontStyle: 'bold'
        }).setOrigin(0.5);
        const subtitle = this.scene.add.text(width / 2, 190, 'Take a moment to compare the answers.', {
            fontSize: '19px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff'
        }).setOrigin(0.5);
        const chosen = this.scene.add.text(215, 245, `YOUR ANSWER: ${formatMatrixNotation(selectedAnswer || 'No answer')}`, {
            fontSize: '21px', fontFamily: "'Fira Code', Consolas, monospace", color: '#ff6688',
            fontStyle: 'bold', wordWrap: { width: 850 }
        });
        const correct = this.scene.add.text(215, 300, `CORRECT ANSWER: ${formatMatrixNotation(correctAnswer || '')}`, {
            fontSize: '21px', fontFamily: "'Fira Code', Consolas, monospace", color: '#00ff88',
            fontStyle: 'bold', wordWrap: { width: 850 }
        });
        const hintLabel = this.scene.add.text(215, 350, 'HINT:', {
            fontSize: '15px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold'
        });
        const hintText = this.scene.add.text(215, 378, formatMatrixNotation(hint || 'Identify the rule before calculating.'), {
            fontSize: '18px', fontFamily: "'Rajdhani', sans-serif", color: '#ffea6c',
            lineSpacing: 4, wordWrap: { width: 850 }
        });
        const why = this.scene.add.text(215, 425, 'WHY:', {
            fontSize: '15px', fontFamily: "'Orbitron', sans-serif", color: '#00ffff', fontStyle: 'bold'
        });
        const explanationText = this.scene.add.text(215, 452, formatMatrixNotation(explanation || 'Review the method and try the next question.'), {
            fontSize: '18px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff',
            lineSpacing: 5, wordWrap: { width: 850 }
        });
        const button = this.scene.add.container(width / 2, 570);
        const buttonBg = this.scene.add.rectangle(0, 0, 280, 58, 0x102958, 1)
            .setStrokeStyle(2, 0x00f3ff, 0.95)
            .setInteractive({ useHandCursor: true });
        const buttonText = this.scene.add.text(0, 0, 'CONTINUE ▶', {
            fontSize: '18px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        button.add([buttonBg, buttonText]);
        panel.add([dim, card, accent, title, subtitle, chosen, correct, hintLabel, hintText, why, explanationText, button]);

        let completed = false;
        const continueHandler = () => {
            if (completed) return;
            completed = true;
            audioManager.playClick();
            this.hideFeedback();
            onContinue?.();
        };

        this.continueHandler = continueHandler;
        buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x17407e, 1));
        buttonBg.on('pointerout', () => buttonBg.setFillStyle(0x102958, 1));
        buttonBg.on('pointerdown', continueHandler);
        this.scene.input.keyboard?.once('keydown-ENTER', continueHandler);
        this.scene.input.keyboard?.once('keydown-SPACE', continueHandler);
    }

    hideFeedback() {
        if (this.continueHandler) {
            this.scene.input.keyboard?.off('keydown-ENTER', this.continueHandler);
            this.scene.input.keyboard?.off('keydown-SPACE', this.continueHandler);
            this.continueHandler = null;
        }
        if (this.feedbackPanel) {
            this.feedbackPanel.destroy(true);
            this.feedbackPanel = null;
        }
    }

    destroy() {
        this.hideFeedback();
    }
}
