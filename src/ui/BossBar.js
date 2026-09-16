export default class BossBar {
    constructor(scene, x, y, width, height) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxHp = 100;
        this.currentHp = 100;

        this.bgBar = scene.add.rectangle(x, y, width, height, 0x333333).setOrigin(0, 0.5);
        this.fillBar = scene.add.rectangle(x, y, width, height, 0x00ff00).setOrigin(0, 0.5);
        this.border = scene.add.rectangle(x, y, width, height).setStrokeStyle(2, 0xffffff).setOrigin(0, 0.5);
        
        this.hpText = scene.add.text(x + width/2, y, '', {
            fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
    }
    
    setHp(hp, maxHp) {
        this.currentHp = hp;
        this.maxHp = maxHp;
        const percent = Math.max(0, hp / maxHp);
        
        this.scene.tweens.add({
            targets: this.fillBar,
            width: this.width * percent,
            duration: 200,
            ease: 'Linear'
        });

        this.hpText.setText(`${hp} / ${maxHp}`);

        if (percent > 0.5) {
            this.fillBar.fillColor = 0x00ff00;
        } else if (percent > 0.25) {
            this.fillBar.fillColor = 0xffff00;
        } else {
            this.fillBar.fillColor = 0xff0000;
        }
    }
    
    destroy() {
        this.bgBar.destroy();
        this.fillBar.destroy();
        this.border.destroy();
        this.hpText.destroy();
    }
}
