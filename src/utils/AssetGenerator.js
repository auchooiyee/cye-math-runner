/**
 * CYE MATH RUNNER — Asset Generator
 * High-definition procedural vector/pixel sprite generator.
 * Combines supplied academy artwork with readable Canvas 2D game objects.
 */
export default class AssetGenerator {
  static generateAll(scene) {
    this.createPlayer(scene);
    this.createPlayerSlide(scene);
    this.createRunnerAnimation(scene);
    this.createObstacleLow(scene);
    this.createObstacleHigh(scene);
    this.createCoin(scene);
    this.createMathGates(scene);
    this.createPowerUps(scene);
    this.createBoss(scene);
    this.createBackgrounds(scene);
    this.createGround(scene);
    this.createButtons(scene);
    this.createParticles(scene);
  }

  static createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
  }

  // ── Player Sprites ──

  static createRunnerAnimation(scene) {
    const source = scene.textures.get('academy-runner-cycle-v2').getSourceImage();
    const { canvas, ctx } = this.createCanvas(1024, 512);
    // Normalize the 4×2 source grid to integer frames without changing the poses.
    for (let i = 0; i < 8; i++) {
      const col = i % 4, row = Math.floor(i / 4);
      ctx.drawImage(source, col * source.width / 4, row * source.height / 2,
        source.width / 4, source.height / 2, col * 256, row * 256, 256, 256);
    }
    scene.textures.addSpriteSheet('runner-cycle', canvas, { frameWidth: 256, frameHeight: 256 });
  }

  static createPlayer(scene) {
    this.createRunnerPose(scene, 'academy-runner', 'player', 48, 64);
  }

  static createPlayerSlide(scene) {
    this.createRunnerPose(scene, 'academy-runner-slide', 'player-slide', 64, 32);
  }

  static createRunnerPose(scene, source, key, width, height) {
    const { canvas, ctx } = this.createCanvas(width, height);
    if (scene.textures.exists(source)) {
      const art = scene.textures.get(source).getSourceImage();
      const scale = Math.min(width / art.width, height / art.height);
      const w = art.width * scale;
      const h = art.height * scale;
      ctx.drawImage(art, (width - w) / 2, height - h, w, h);
    } else {
      // Visible academy-colour fallback if an art request fails.
      ctx.fillStyle = '#f6fbff';
      ctx.fillRect(10, height * .35, width - 20, height * .6);
      ctx.fillStyle = '#246acb';
      ctx.fillRect(10, height * .5, width - 20, height * .25);
      ctx.fillStyle = '#724428';
      ctx.fillRect(13, 3, width - 26, height * .3);
    }
    scene.textures.addCanvas(key, canvas);
  }

  static createObstacleLow(scene) {
    const { canvas, ctx } = this.createCanvas(56, 44);
    ctx.fillStyle = '#26374f';
    ctx.fillRect(4, 33, 12, 9);
    ctx.fillRect(40, 33, 12, 9);
    ctx.fillStyle = '#ffcb35';
    ctx.beginPath(); ctx.roundRect(2, 5, 52, 31, 4); ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#26374f';
    for (let x = -20; x < 70; x += 22) {
      ctx.beginPath(); ctx.moveTo(x, 36); ctx.lineTo(x + 20, 5);
      ctx.lineTo(x + 31, 5); ctx.lineTo(x + 11, 36); ctx.fill();
    }
    ctx.restore();
    scene.textures.addCanvas('obstacle-low', canvas);
  }

  static createObstacleHigh(scene) {
    const { canvas, ctx } = this.createCanvas(80, 76);
    ctx.fillStyle = '#e6edf7';
    ctx.fillRect(4, 7, 8, 69); ctx.fillRect(68, 7, 8, 69);
    ctx.fillStyle = '#1d5fb0';
    ctx.beginPath(); ctx.roundRect(0, 0, 80, 34, 5); ctx.fill();
    ctx.strokeStyle = '#ffdb66'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4;
    for (const y of [7, 18]) {
      ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(40, y + 7); ctx.lineTo(50, y); ctx.stroke();
    }
    scene.textures.addCanvas('obstacle-high', canvas);
  }

  // ── Collectible Coin ──

  static createCoin(scene) {
    const { canvas, ctx } = this.createCanvas(32, 32);

    // Outer metallic ring shadow & glow
    ctx.fillStyle = 'rgba(255, 204, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, Math.PI * 2);
    ctx.fill();

    // Gold Hexagonal Coin Base
    ctx.fillStyle = '#b8860b';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180;
      const x = 16 + 13 * Math.cos(angle);
      const y = 16 + 13 * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Inner bright gold face
    const goldGrad = ctx.createRadialGradient(13, 13, 2, 16, 16, 12);
    goldGrad.addColorStop(0, '#fff48d');
    goldGrad.addColorStop(0.7, '#ffd700');
    goldGrad.addColorStop(1, '#d49b00');

    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.arc(16, 16, 10.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffea6c';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Embossed Greek Sigma 'Σ' Mathematical Glyph
    ctx.fillStyle = '#6a4900';
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', 16, 16.5);

    scene.textures.addCanvas('coin', canvas);
  }

  // ── Math Gate Portals ──

  static createMathGates(scene) {
    const variants = [
      { key: 'gate-door', pylonColor: '#0088ff', borderGlow: '#00ffff', panelBg: 'rgba(0, 30, 80, 0.85)', beamColor: '#00d4ff' },
      { key: 'gate-correct', pylonColor: '#00aa55', borderGlow: '#00ff88', panelBg: 'rgba(0, 60, 30, 0.9)', beamColor: '#00ff88' },
      { key: 'gate-wrong', pylonColor: '#cc1133', borderGlow: '#ff0044', panelBg: 'rgba(80, 0, 20, 0.9)', beamColor: '#ff2255' }
    ];

    variants.forEach(v => {
      const { canvas, ctx } = this.createCanvas(180, 200);

      // Translucent holographic door panel
      ctx.fillStyle = v.panelBg;
      ctx.roundRect(14, 16, 152, 176, 10);
      ctx.fill();

      // Outer glowing arch stroke
      ctx.strokeStyle = v.borderGlow;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Energy pylons on left & right edges
      const drawPylon = (x) => {
        ctx.fillStyle = '#0a1020';
        ctx.fillRect(x, 10, 16, 184);
        ctx.strokeStyle = v.pylonColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 10, 16, 184);

        // Neon power core rings
        ctx.fillStyle = v.beamColor;
        for (let y = 30; y < 180; y += 35) {
          ctx.fillRect(x + 2, y, 12, 6);
        }
      };

      drawPylon(4);
      drawPylon(160);

      // Top energy header arch
      ctx.fillStyle = '#0c1628';
      ctx.fillRect(16, 6, 148, 18);
      ctx.strokeStyle = v.borderGlow;
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 6, 148, 18);

      // Neon emitter line across header
      ctx.fillStyle = v.beamColor;
      ctx.fillRect(24, 13, 132, 4);

      // Subtle horizontal holographic scan lines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let y = 35; y < 185; y += 8) {
        ctx.fillRect(24, y, 132, 2);
      }

      scene.textures.addCanvas(v.key, canvas);
    });
  }

  // ── Power-Up Badges ──

  static createPowerUps(scene) {
    // 1. Shield Power-up (Hexagonal forcefield)
    {
      const { canvas, ctx } = this.createCanvas(36, 36);
      ctx.fillStyle = '#0a1a3e';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60 * Math.PI) / 180;
        const x = 18 + 15 * Math.cos(angle);
        const y = 18 + 15 * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Shield heraldry emblem
      ctx.fillStyle = '#00aaff';
      ctx.beginPath();
      ctx.moveTo(18, 9);
      ctx.lineTo(26, 13);
      ctx.lineTo(24, 23);
      ctx.lineTo(18, 27);
      ctx.lineTo(12, 23);
      ctx.lineTo(10, 13);
      ctx.closePath();
      ctx.fill();

      scene.textures.addCanvas('powerup-shield', canvas);
    }

    // 2. Hint Power-up (Golden AI holographic crystal)
    {
      const { canvas, ctx } = this.createCanvas(36, 36);
      ctx.fillStyle = '#262000';
      ctx.beginPath();
      ctx.arc(18, 18, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Lightbulb / Neural Crystal
      ctx.fillStyle = '#fff48d';
      ctx.beginPath();
      ctx.moveTo(18, 8);
      ctx.lineTo(25, 18);
      ctx.lineTo(18, 28);
      ctx.lineTo(11, 18);
      ctx.closePath();
      ctx.fill();

      scene.textures.addCanvas('powerup-hint', canvas);
    }

    // 3. Magnet Power-up (Electromagnetic horseshoe with purple arcs)
    {
      const { canvas, ctx } = this.createCanvas(36, 36);
      ctx.fillStyle = '#250838';
      ctx.beginPath();
      ctx.arc(18, 18, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cc00ff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Horseshoe shape
      ctx.strokeStyle = '#ff33cc';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(18, 16, 7, Math.PI, 0, false);
      ctx.lineTo(25, 25);
      ctx.moveTo(11, 16);
      ctx.lineTo(11, 25);
      ctx.stroke();

      // Magnetic poles (Silver tips)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8.5, 23, 5, 4);
      ctx.fillRect(22.5, 23, 5, 4);

      scene.textures.addCanvas('powerup-magnet', canvas);
    }
  }

  // ── Boss: Cybernetic Dragon / Serpentine Beast ──

  static createBoss(scene) {
    const { canvas, ctx } = this.createCanvas(140, 140);
    ctx.fillStyle = '#174594';
    ctx.beginPath(); ctx.roundRect(20, 34, 100, 90, 22); ctx.fill();
    ctx.strokeStyle = '#f4c84d'; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#e7f7ff';
    ctx.beginPath(); ctx.roundRect(30, 46, 80, 56, 14); ctx.fill();
    ctx.fillStyle = '#174594';
    ctx.beginPath(); ctx.arc(52, 67, 6, 0, Math.PI * 2); ctx.arc(88, 67, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#174594'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(70, 76, 13, .15, Math.PI - .15); ctx.stroke();
    ctx.fillStyle = '#ffce46';
    ctx.beginPath(); ctx.moveTo(45, 28); ctx.lineTo(40, 7); ctx.lineTo(58, 18);
    ctx.lineTo(70, 3); ctx.lineTo(82, 18); ctx.lineTo(100, 7); ctx.lineTo(95, 28); ctx.closePath(); ctx.fill();
    ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('CYE', 70, 117);
    scene.textures.addCanvas('boss-sprite', canvas);
  }

  static createBackgrounds(scene) {
    const { canvas, ctx } = this.createCanvas(1280, 720);
    ctx.fillStyle = '#153660'; ctx.fillRect(0, 0, 1280, 720);
    if (scene.textures.exists('academy-campus')) {
      ctx.drawImage(scene.textures.get('academy-campus').getSourceImage(), 0, 0, 1280, 720);
    }
    scene.textures.addCanvas('bg-layer-1', canvas);
    for (const key of ['bg-layer-2', 'bg-layer-3']) {
      scene.textures.addCanvas(key, this.createCanvas(1280, 720).canvas);
    }
  }

  static createGround(scene) {
    // Ground highway surface (1280x100 from Y=620 to Y=720)
    {
      const { canvas, ctx } = this.createCanvas(1280, 100);
      ctx.fillStyle = '#243b56';
      ctx.fillRect(0, 0, 1280, 100);

      // Highway lane divider tracks
      ctx.fillStyle = '#00f0ff';
      for (let x = 0; x < 1280; x += 80) {
        ctx.fillRect(x, 6, 44, 4);
      }

      // Neon perspective track glow
      ctx.fillStyle = '#102044';
      ctx.fillRect(0, 24, 1280, 20);
      ctx.fillStyle = '#00ffcc';
      for (let x = 20; x < 1280; x += 160) {
        ctx.fillRect(x, 30, 30, 3);
      }

      // Lower road texture
      ctx.fillStyle = '#183152';
      ctx.fillRect(0, 48, 1280, 52);

      scene.textures.addCanvas('ground', canvas);
    }

    // Neon ground separator line
    {
      const { canvas, ctx } = this.createCanvas(1280, 4);
      const lineGrad = ctx.createLinearGradient(0, 0, 1280, 0);
      lineGrad.addColorStop(0, '#00ff88');
      lineGrad.addColorStop(0.5, '#00ffff');
      lineGrad.addColorStop(1, '#00ff88');
      ctx.fillStyle = lineGrad;
      ctx.fillRect(0, 0, 1280, 4);
      scene.textures.addCanvas('ground-line', canvas);
    }
  }

  // ── High-Tech Cyber Buttons ──

  static createButtons(scene) {
    for (const [key, fill, border] of [
      ['button', '#1b4374', '#e6bd57'],
      ['button-hover', '#2b6198', '#ffe29a']
    ]) {
      const { canvas, ctx } = this.createCanvas(320, 64);
      ctx.fillStyle = fill; ctx.strokeStyle = border; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(2, 2, 316, 60, 13); ctx.fill(); ctx.stroke();
      scene.textures.addCanvas(key, canvas);
    }
  }

  static createParticles(scene) {
    {
      const { canvas, ctx } = this.createCanvas(8, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 8, 8);
      scene.textures.addCanvas('particle', canvas);
    }
  }
}
