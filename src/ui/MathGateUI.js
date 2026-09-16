export default class MathGateUI {
    constructor(scene) {
        this.scene = scene;
        this.explanationText = scene.add.text(scene.cameras.main.width/2, scene.cameras.main.height - 100, '', {
            fontSize: '24px', fontFamily: 'Arial', color: '#ffffff', backgroundColor: '#000000', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);
    }
    
    showExplanation(text, duration = 2000) {
        this.explanationText.setText(text);
        this.scene.tweens.add({
            targets: this.explanationText,
            alpha: 1,
            duration: 300,
            yoyo: true,
            hold: duration
        });
    }
    
    showCorrectFeedback(points) {
        // handled in HUD for now, but keeping signature
    }
    
    showWrongFeedback() {
        // handled in HUD
    }
    
    destroy() {
        if (this.explanationText) this.explanationText.destroy();
    }
}
