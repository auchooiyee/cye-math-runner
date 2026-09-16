/**
 * CYE MATH RUNNER — Asset Generator
 * High-definition procedural vector/pixel sprite generator.
 * Produces crisp, retro-cyberpunk textures directly in memory via Canvas 2D.
 */
export default class AssetGenerator {
  static generateAll(scene) {
    this.createPlayer(scene);
    this.createPlayerSlide(scene);
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

  static createPlayer(scene) {
    const { canvas, ctx } = this.createCanvas(48, 64);

    // 1. Rear Ponytail & Cyber Bow (drawn behind body)
    // Dynamic bouncy anime ponytail flowing to right
    ctx.fillStyle = '#0097a7';
    ctx.beginPath();
    ctx.moveTo(28, 12);
    ctx.quadraticCurveTo(42, 14, 44, 28);
    ctx.quadraticCurveTo(38, 38, 34, 40);
    ctx.quadraticCurveTo(38, 28, 30, 18);
    ctx.closePath();
    ctx.fill();

    // Ponytail hair shine streak
    ctx.fillStyle = '#80deea';
    ctx.beginPath();
    ctx.moveTo(34, 18);
    ctx.quadraticCurveTo(41, 22, 40, 30);
    ctx.lineTo(38, 30);
    ctx.quadraticCurveTo(38, 22, 32, 18);
    ctx.closePath();
    ctx.fill();

    // Cute cyber hairpin / ribbon at hair base
    ctx.fillStyle = '#ff1493';
    ctx.beginPath();
    ctx.arc(28, 12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(28, 12, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 2. Legs & Runner Sneakers
    // Back leg (right)
    ctx.fillStyle = '#141829'; // thigh-high sock
    ctx.fillRect(26, 38, 8, 16);
    // Sock stripes
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(26, 39, 8, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(26, 42, 8, 1.5);

    // Back sneaker
    ctx.fillStyle = '#f5f5f7';
    ctx.beginPath();
    ctx.roundRect(25, 52, 12, 9, 3);
    ctx.fill();
    ctx.fillStyle = '#ff2a85'; // cute pink accent
    ctx.fillRect(27, 54, 8, 2.5);
    ctx.fillStyle = '#00e5ff'; // neon cyan sole
    ctx.fillRect(24, 59, 13, 3);

    // Front leg (left)
    ctx.fillStyle = '#141829'; // thigh-high sock
    ctx.fillRect(14, 38, 8, 16);
    // Sock stripes
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(14, 39, 8, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 42, 8, 1.5);

    // Front sneaker
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(11, 52, 13, 9, 3);
    ctx.fill();
    ctx.fillStyle = '#ff2a85';
    ctx.fillRect(13, 54, 8, 2.5);
    ctx.fillStyle = '#00e5ff'; // neon cyan sole
    ctx.fillRect(10, 59, 14, 3);

    // Jet runner energy glow under shoes
    const sparkGrad = ctx.createLinearGradient(0, 60, 0, 64);
    sparkGrad.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
    sparkGrad.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = sparkGrad;
    ctx.fillRect(10, 61, 14, 3);
    ctx.fillRect(24, 61, 13, 3);

    // 3. Outfit: Pleated Runner Skirt
    ctx.fillStyle = '#182247';
    ctx.beginPath();
    ctx.moveTo(16, 33);
    ctx.lineTo(32, 33);
    ctx.lineTo(35, 41);
    ctx.lineTo(13, 41);
    ctx.closePath();
    ctx.fill();

    // Skirt pleats & neon teal hem
    ctx.strokeStyle = '#29376e';
    ctx.lineWidth = 1;
    for (let px = 17; px <= 31; px += 3.5) {
      ctx.beginPath();
      ctx.moveTo(px, 33);
      ctx.lineTo(px + (px < 24 ? -1.5 : 1.5), 41);
      ctx.stroke();
    }
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(13, 40, 22, 2);

    // Belt
    ctx.fillStyle = '#101426';
    ctx.fillRect(16, 32, 16, 3);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(22, 32, 4, 3);

    // 4. Arms & Jacket Torso
    // Back arm swung back
    ctx.fillStyle = '#182247';
    ctx.fillRect(32, 22, 6, 12);
    ctx.fillStyle = '#ffe0c7'; // bare wrist
    ctx.fillRect(33, 32, 4, 3);
    ctx.fillStyle = '#11172e'; // runner glove
    ctx.fillRect(32, 34, 6, 4);

    // Torso: Cyber runner jacket & white inner shirt
    ctx.fillStyle = '#ffffff'; // white collared shirt
    ctx.fillRect(18, 20, 12, 12);
    // Navy jacket panels
    ctx.fillStyle = '#182247';
    ctx.fillRect(15, 20, 5, 12);
    ctx.fillRect(28, 20, 5, 12);
    // Gold zipper
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(23, 23, 2, 9);
    // Cute collar ribbon tie
    ctx.fillStyle = '#ff2a85';
    ctx.beginPath();
    ctx.moveTo(21, 21);
    ctx.lineTo(27, 21);
    ctx.lineTo(24, 25);
    ctx.closePath();
    ctx.fill();

    // Front arm bent forward
    ctx.fillStyle = '#182247';
    ctx.fillRect(10, 22, 6, 11);
    ctx.fillStyle = '#ffe0c7'; // wrist
    ctx.fillRect(11, 31, 4, 3);
    ctx.fillStyle = '#11172e'; // glove
    ctx.fillRect(10, 33, 6, 4);
    ctx.fillStyle = '#00ffff'; // teal wristband
    ctx.fillRect(10, 30, 6, 2);

    // 5. Head & Cute Anime Face
    // Peach skin head & cute chin
    ctx.fillStyle = '#ffe2cb';
    ctx.beginPath();
    ctx.arc(24, 15, 10.5, 0, Math.PI * 2);
    ctx.fill();
    // Chin taper
    ctx.beginPath();
    ctx.moveTo(15, 17);
    ctx.lineTo(24, 24);
    ctx.lineTo(33, 17);
    ctx.closePath();
    ctx.fill();

    // Rosy Pink Blush Stickers (cute anime blush!)
    ctx.fillStyle = 'rgba(255, 90, 140, 0.7)';
    ctx.beginPath();
    ctx.ellipse(17.5, 18, 2.8, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(30.5, 18, 2.8, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute smiling open mouth
    ctx.fillStyle = '#e83e68';
    ctx.beginPath();
    ctx.arc(24, 20.5, 2.2, 0, Math.PI);
    ctx.fill();

    // Big Expressive Anime Eyes
    const drawAnimeEye = (ex, ey) => {
      // White eye base
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ex, ey, 3.8, 4.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sparkling Iris (Deep royal blue to electric cyan gradient)
      const irisGrad = ctx.createLinearGradient(ex, ey - 4, ex, ey + 4);
      irisGrad.addColorStop(0, '#102a70');
      irisGrad.addColorStop(0.5, '#0091ea');
      irisGrad.addColorStop(1, '#00e5ff');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.ellipse(ex, ey + 0.3, 3.2, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Deep pupil
      ctx.fillStyle = '#091538';
      ctx.beginPath();
      ctx.arc(ex, ey + 0.5, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Curved upper anime eyelash line
      ctx.strokeStyle = '#120826';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(ex, ey - 1.5, 3.8, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();

      // Eyelash wing
      ctx.fillStyle = '#120826';
      const wingDir = ex < 24 ? -1 : 1;
      ctx.fillRect(ex + wingDir * 3, ey - 4, 1.8, 1.5);

      // ✨ Dual white anime sparkle highlights
      ctx.fillStyle = '#ffffff';
      // Primary big sparkle
      ctx.beginPath();
      ctx.arc(ex - 1.1, ey - 1.5, 1.4, 0, Math.PI * 2);
      ctx.fill();
      // Secondary mini sparkle
      ctx.beginPath();
      ctx.arc(ex + 1.2, ey + 1.8, 0.8, 0, Math.PI * 2);
      ctx.fill();
    };

    drawAnimeEye(18, 14.5);
    drawAnimeEye(30, 14.5);

    // 6. Hair Front & Bangs
    // Bangs & side locks framing the face
    ctx.fillStyle = '#00bcd4'; // energetic anime cyan hair
    // Top skull volume
    ctx.beginPath();
    ctx.arc(24, 11, 11.5, Math.PI, 0);
    ctx.fill();

    // Side locks
    ctx.beginPath();
    ctx.moveTo(13, 11);
    ctx.lineTo(11, 23);
    ctx.lineTo(15, 18);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(35, 11);
    ctx.lineTo(37, 23);
    ctx.lineTo(33, 18);
    ctx.closePath();
    ctx.fill();

    // Front forehead bangs (stylish anime fringe)
    ctx.beginPath();
    ctx.moveTo(14, 9);
    ctx.quadraticCurveTo(18, 14, 19, 14.5);
    ctx.quadraticCurveTo(20, 11, 22, 14.5);
    ctx.quadraticCurveTo(24, 11, 26, 14.5);
    ctx.quadraticCurveTo(28, 11, 30, 14.5);
    ctx.quadraticCurveTo(32, 11, 34, 9);
    ctx.closePath();
    ctx.fill();

    // Hair gloss halo (anime hair shine band)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(24, 8, 7, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cyber star hairclip on side
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(14, 7, 3, 3);

    scene.textures.addCanvas('player', canvas);
  }

  static createPlayerSlide(scene) {
    const { canvas, ctx } = this.createCanvas(64, 36);

    // Trailing speed glow & sparks behind the slide
    const skidGrad = ctx.createLinearGradient(0, 0, 30, 0);
    skidGrad.addColorStop(0, 'rgba(0, 255, 255, 0)');
    skidGrad.addColorStop(0.7, 'rgba(0, 255, 255, 0.4)');
    skidGrad.addColorStop(1, 'rgba(255, 215, 0, 0.8)');
    ctx.fillStyle = skidGrad;
    ctx.fillRect(0, 26, 32, 8);

    // Trailing anime ponytail blown back horizontally in the wind
    ctx.fillStyle = '#0097a7';
    ctx.beginPath();
    ctx.moveTo(34, 10);
    ctx.quadraticCurveTo(18, 6, 2, 12);
    ctx.quadraticCurveTo(16, 17, 32, 15);
    ctx.closePath();
    ctx.fill();

    // Ponytail hair shine streak
    ctx.fillStyle = '#80deea';
    ctx.beginPath();
    ctx.moveTo(30, 10);
    ctx.quadraticCurveTo(18, 9, 8, 13);
    ctx.lineTo(12, 15);
    ctx.quadraticCurveTo(22, 12, 30, 13);
    ctx.closePath();
    ctx.fill();

    // Fluttering ribbon
    ctx.fillStyle = '#ff1493';
    ctx.fillRect(32, 9, 4, 4);

    // Bent back leg tucked close
    ctx.fillStyle = '#141829';
    ctx.fillRect(18, 22, 14, 7);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(18, 22, 2, 7);

    // Skirt fluttered back
    ctx.fillStyle = '#182247';
    ctx.beginPath();
    ctx.moveTo(24, 18);
    ctx.lineTo(38, 18);
    ctx.lineTo(34, 26);
    ctx.lineTo(18, 26);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(18, 25, 16, 2);

    // Torso leaning low forward
    ctx.fillStyle = '#182247';
    ctx.beginPath();
    ctx.roundRect(28, 14, 18, 11, 3);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(34, 15, 6, 9);
    ctx.fillStyle = '#ff2a85';
    ctx.fillRect(36, 15, 3, 3);

    // Extended front sliding leg & sneaker
    ctx.fillStyle = '#141829'; // sock
    ctx.fillRect(34, 23, 14, 6);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(44, 23, 2, 6);

    // Sliding front sneaker (skidding along road)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(46, 23, 14, 9, 3);
    ctx.fill();
    ctx.fillStyle = '#ff2a85';
    ctx.fillRect(48, 25, 7, 2);
    ctx.fillStyle = '#00e5ff'; // glowing sole
    ctx.fillRect(45, 30, 16, 3);

    // Cute Anime Head tilted low forward
    ctx.fillStyle = '#ffe2cb';
    ctx.beginPath();
    ctx.arc(43, 13, 8.5, 0, Math.PI * 2);
    ctx.fill();

    // Cute cheek blush
    ctx.fillStyle = 'rgba(255, 90, 140, 0.75)';
    ctx.beginPath();
    ctx.ellipse(44, 16, 2.5, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Determined cute anime eye (facing forward)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(45, 12, 3.2, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0091ea';
    ctx.beginPath();
    ctx.ellipse(45.5, 12, 2.5, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#091538';
    ctx.beginPath();
    ctx.arc(45.5, 12, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#120826';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(45, 10.5, 3.2, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    // Highlight glint
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(44.2, 11, 1.5, 1.5);

    // Determined cute mouth
    ctx.strokeStyle = '#e83e68';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(43, 18);
    ctx.lineTo(46, 18);
    ctx.stroke();

    // Hair bangs on head
    ctx.fillStyle = '#00bcd4';
    ctx.beginPath();
    ctx.arc(42, 10, 9, Math.PI * 0.9, Math.PI * 0.1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(35, 12);
    ctx.lineTo(42, 17);
    ctx.lineTo(47, 13);
    ctx.closePath();
    ctx.fill();

    // Hair gloss halo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(38, 7, 8, 1.5);

    // Golden sparks on ground
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(38, 33, 4, 2);
    ctx.fillRect(48, 33, 5, 2);
    ctx.fillRect(58, 32, 3, 2);

    scene.textures.addCanvas('player-slide', canvas);
  }

  // ── Obstacle Sprites ──

  static createObstacleLow(scene) {
    const { canvas, ctx } = this.createCanvas(56, 44);

    // Left and Right High-Voltage Pylons
    ctx.fillStyle = '#1a2035';
    ctx.fillRect(2, 8, 12, 34);
    ctx.fillRect(42, 8, 12, 34);

    // Pylon metallic borders
    ctx.strokeStyle = '#3a4a6b';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 8, 12, 34);
    ctx.strokeRect(42, 8, 12, 34);

    // Hazard warning stripes at base
    const drawHazardStripes = (x, y, w, h) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#000000';
      for (let i = -10; i < w + 20; i += 8) {
        ctx.beginPath();
        ctx.moveTo(x + i, y + h);
        ctx.lineTo(x + i + 4, y);
        ctx.lineTo(x + i + 8, y);
        ctx.lineTo(x + i + 4, y + h);
        ctx.fill();
      }
      ctx.restore();
    };

    drawHazardStripes(2, 32, 12, 10);
    drawHazardStripes(42, 32, 12, 10);

    // Plasma Emitter Nodes (Glowing red orbs)
    ctx.fillStyle = '#ff0044';
    ctx.beginPath();
    ctx.arc(8, 10, 5, 0, Math.PI * 2);
    ctx.arc(48, 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Laser / Electric Arc Barrier (Pulsing Red/Gold beam)
    ctx.fillStyle = 'rgba(255, 0, 68, 0.4)';
    ctx.fillRect(10, 10, 36, 12);

    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, 14);
    ctx.lineTo(20, 18);
    ctx.lineTo(36, 12);
    ctx.lineTo(48, 15);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, 14);
    ctx.lineTo(28, 15);
    ctx.lineTo(48, 15);
    ctx.stroke();

    scene.textures.addCanvas('obstacle-low', canvas);
  }

  static createObstacleHigh(scene) {
    const { canvas, ctx } = this.createCanvas(64, 46);

    // Cyber Surveillance Drone Body
    ctx.fillStyle = '#1e1a38';
    ctx.beginPath();
    ctx.ellipse(32, 16, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Side Stabilizer Wings / Rotor Pods
    ctx.fillStyle = '#2d2552';
    ctx.fillRect(4, 12, 8, 8);
    ctx.fillRect(52, 12, 8, 8);

    ctx.fillStyle = '#00ffff';
    ctx.fillRect(5, 14, 6, 3);
    ctx.fillRect(53, 14, 6, 3);

    // Red Central Sensor Eye
    ctx.fillStyle = '#ff0033';
    ctx.beginPath();
    ctx.arc(32, 16, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(33, 15, 2, 0, Math.PI * 2);
    ctx.fill();

    // Downward Laser Scanning Grid Cone (Player slides under this!)
    const scanGrad = ctx.createLinearGradient(0, 22, 0, 46);
    scanGrad.addColorStop(0, 'rgba(255, 68, 0, 0.8)');
    scanGrad.addColorStop(1, 'rgba(255, 0, 68, 0.15)');

    ctx.fillStyle = scanGrad;
    ctx.beginPath();
    ctx.moveTo(22, 22);
    ctx.lineTo(42, 22);
    ctx.lineTo(54, 46);
    ctx.lineTo(10, 46);
    ctx.closePath();
    ctx.fill();

    // Laser barrier lines
    ctx.strokeStyle = '#ff3300';
    ctx.lineWidth = 1.5;
    ctx.stroke();

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
    ctx.fillText('Σ', 16, 16.5);

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

    // Outer cybernetic aura
    const aura = ctx.createRadialGradient(70, 70, 20, 70, 70, 68);
    aura.addColorStop(0, 'rgba(255, 0, 68, 0.4)');
    aura.addColorStop(1, 'rgba(255, 0, 68, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(70, 70, 68, 0, Math.PI * 2);
    ctx.fill();

    // Dragon Cyber Skull Base
    ctx.fillStyle = '#181226';
    ctx.beginPath();
    ctx.moveTo(70, 18);
    ctx.lineTo(105, 45);
    ctx.lineTo(115, 85);
    ctx.lineTo(70, 122);
    ctx.lineTo(25, 85);
    ctx.lineTo(35, 45);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ff0044';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Cyber horns / antenna pylons
    ctx.fillStyle = '#ff2255';
    ctx.beginPath();
    ctx.moveTo(40, 45);
    ctx.lineTo(15, 15);
    ctx.lineTo(35, 30);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(100, 45);
    ctx.lineTo(125, 15);
    ctx.lineTo(105, 30);
    ctx.closePath();
    ctx.fill();

    // Luminous Optical Sensors (Dual glowing angular red visors)
    ctx.fillStyle = '#ff0033';
    ctx.beginPath();
    ctx.moveTo(42, 60);
    ctx.lineTo(60, 68);
    ctx.lineTo(46, 75);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(98, 60);
    ctx.lineTo(80, 68);
    ctx.lineTo(94, 75);
    ctx.closePath();
    ctx.fill();

    // Glowing core eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(49, 65, 4, 4);
    ctx.fillRect(87, 65, 4, 4);

    // Jaw / Teeth grill
    ctx.fillStyle = '#3a2040';
    ctx.fillRect(52, 92, 36, 18);
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(52, 92, 36, 18);

    ctx.fillStyle = '#00ffff';
    for (let x = 56; x <= 82; x += 6) {
      ctx.fillRect(x, 96, 3, 10);
    }

    scene.textures.addCanvas('boss-sprite', canvas);
  }

  // ── Parallax Backgrounds ──

  static createBackgrounds(scene) {
    // Layer 1 (1280x720): Full deep sky, nebula, twinkling stars, & distant neon skyline
    {
      const { canvas, ctx } = this.createCanvas(1280, 720);

      // Deep space midnight sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 720);
      skyGrad.addColorStop(0, '#02030f');
      skyGrad.addColorStop(0.35, '#070b24');
      skyGrad.addColorStop(0.65, '#12092c');
      skyGrad.addColorStop(0.9, '#0a1230');
      skyGrad.addColorStop(1, '#050a1c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 1280, 720);

      // Cosmic nebula glows
      const nebula1 = ctx.createRadialGradient(320, 180, 20, 320, 180, 260);
      nebula1.addColorStop(0, 'rgba(0, 200, 255, 0.12)');
      nebula1.addColorStop(1, 'rgba(0, 200, 255, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, 640, 380);

      const nebula2 = ctx.createRadialGradient(960, 220, 30, 960, 220, 280);
      nebula2.addColorStop(0, 'rgba(255, 0, 128, 0.1)');
      nebula2.addColorStop(1, 'rgba(255, 0, 128, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(640, 0, 640, 420);

      // Starfield & digital bokeh particles
      for (let s = 0; s < 80; s++) {
        const sx = (s * 43 + 17) % 1280;
        const sy = (s * 31 + 11) % 360;
        const sz = (s % 5 === 0) ? 2.5 : ((s % 3 === 0) ? 1.8 : 1.2);
        ctx.fillStyle = (s % 2 === 0) ? '#ffffff' : ((s % 4 === 0) ? '#ffd700' : '#00f0ff');
        ctx.beginPath();
        ctx.arc(sx, sy, sz / 2, 0, Math.PI * 2);
        ctx.fill();

        // Cross flare on bright stars
        if (s % 7 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillRect(sx - 3, sy, 7, 0.8);
          ctx.fillRect(sx, sy - 3, 0.8, 7);
        }
      }

      // Neon rooftop billboards
      const billboards = [
        { x: 100, y: 250, text: 'SPM FINAL', color: '#ff007f' },
        { x: 360, y: 230, text: 'Σ MATH', color: '#00ffff' },
        { x: 640, y: 270, text: 'CYE 2026', color: '#ffd700' },
        { x: 920, y: 220, text: 'GRADE A+', color: '#00ff88' },
        { x: 1140, y: 260, text: 'RUN • SURVIVE', color: '#ff00a0' }
      ];

      billboards.forEach(b => {
        // Billboard frame
        ctx.fillStyle = '#060814';
        ctx.fillRect(b.x - 10, b.y - 14, 100, 24);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1.8;
        ctx.strokeRect(b.x - 10, b.y - 14, 100, 24);
        // Neon text
        ctx.fillStyle = b.color;
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(b.text, b.x + 40, b.y + 3);
      });

      // Distant Skyscraper silhouettes (reaching ground at Y=620)
      for (let x = 0; x < 1280; x += 44) {
        const h = 220 + ((x * 17) % 150); // height 220 to 370 px
        const topY = 620 - h;
        const w = 36 + ((x * 7) % 18);

        ctx.fillStyle = '#080c1e';
        ctx.fillRect(x, topY, w, h);

        // Tower outline glow
        ctx.strokeStyle = '#152044';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, topY, w, h);

        // Windows with vibrant cyberpunk matrix
        for (let wy = topY + 16; wy < 600; wy += 14) {
          if ((x + wy) % 4 === 0) {
            ctx.fillStyle = ((x + wy) % 8 === 0) ? '#ff007f' : (((x + wy) % 6 === 0) ? '#ffd700' : '#00e5ff');
            ctx.fillRect(x + 5, wy, 5, 5);
            ctx.fillRect(x + 18, wy, 5, 5);
          }
        }

        // Roof antennae with flashing beacons
        ctx.strokeStyle = '#22305c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + w / 2, topY);
        ctx.lineTo(x + w / 2, topY - 18);
        ctx.stroke();

        ctx.fillStyle = ((x / 44) % 2 === 0) ? '#ff0055' : '#00ffcc';
        ctx.fillRect(x + w / 2 - 1.5, topY - 20, 3, 3);
      }

      scene.textures.addCanvas('bg-layer-1', canvas);
    }

    // Layer 2 (1280x720): Midground city towers & elevated hyperloop transit
    {
      const { canvas, ctx } = this.createCanvas(1280, 720);

      // Midground towers (Y=380 to Y=620)
      for (let x = 0; x < 1280; x += 68) {
        const h = 180 + ((x * 19) % 90);
        const topY = 620 - h;
        const w = 54 + ((x * 11) % 20);

        ctx.fillStyle = '#0d1430';
        ctx.fillRect(x, topY, w, h);

        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, topY, w, h);

        // Architectural vertical neon stripes
        ctx.fillStyle = 'rgba(0, 255, 255, 0.25)';
        ctx.fillRect(x + 4, topY, 2, h);
        ctx.fillRect(x + w - 6, topY, 2, h);

        // Windows
        for (let wy = topY + 16; wy < 600; wy += 15) {
          if ((x * 3 + wy) % 3 === 0) {
            ctx.fillStyle = ((x + wy) % 5 === 0) ? '#ff00aa' : '#ffe600';
            ctx.fillRect(x + 10, wy, 7, 6);
            ctx.fillRect(x + 28, wy, 7, 6);
          }
        }
      }

      // Elevated hyperloop transport tube spanning across horizon at Y=525
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, 525);
      ctx.lineTo(1280, 525);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.fillRect(0, 522, 1280, 7);

      // Hyperloop high-speed bullet transit pods
      for (let tx = 100; tx < 1280; tx += 380) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(tx, 518, 55, 14, 5);
        ctx.fill();
        ctx.fillStyle = '#ff007f';
        ctx.fillRect(tx + 8, 523, 40, 4);
      }

      scene.textures.addCanvas('bg-layer-2', canvas);
    }

    // Layer 3 (1280x720): Near Highway crash barriers along bottom (Y=565 to Y=620)
    {
      const { canvas, ctx } = this.createCanvas(1280, 720);

      // Highway crash barrier wall along ground level
      ctx.fillStyle = '#141a33';
      ctx.fillRect(0, 570, 1280, 50);
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 570, 1280, 50);

      // Top illuminated neon laser rail
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(0, 570, 1280, 3.5);

      // Warning hazard stripes & distance beacon pylons
      for (let x = 0; x < 1280; x += 40) {
        ctx.fillStyle = ((x / 40) % 2 === 0) ? '#00ff88' : '#00ffff';
        ctx.fillRect(x, 578, 14, 28);

        // Vertical light beacon pylon
        if (x % 160 === 0) {
          ctx.fillStyle = '#ffd700';
          ctx.fillRect(x - 2, 555, 6, 15);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, 552, 2, 4);
        }
      }

      scene.textures.addCanvas('bg-layer-3', canvas);
    }
  }

  // ── Ground Surfaces ──

  static createGround(scene) {
    // Ground highway surface (1280x100 from Y=620 to Y=720)
    {
      const { canvas, ctx } = this.createCanvas(1280, 100);
      ctx.fillStyle = '#060918';
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
      ctx.fillStyle = '#040612';
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
    // Normal button (320x64)
    {
      const { canvas, ctx } = this.createCanvas(320, 64);
      const grad = ctx.createLinearGradient(0, 0, 0, 64);
      grad.addColorStop(0, '#091538');
      grad.addColorStop(1, '#050c20');
      ctx.fillStyle = grad;

      // Tech chamfered border path
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(304, 0);
      ctx.lineTo(320, 16);
      ctx.lineTo(320, 48);
      ctx.lineTo(304, 64);
      ctx.lineTo(16, 64);
      ctx.lineTo(0, 48);
      ctx.lineTo(0, 16);
      ctx.closePath();
      ctx.fill();

      // Outer glowing cyan border
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Corner tech energy brackets
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(4, 4, 14, 3);
      ctx.fillRect(4, 4, 3, 14);
      ctx.fillRect(302, 4, 14, 3);
      ctx.fillRect(313, 4, 3, 14);
      ctx.fillRect(4, 57, 14, 3);
      ctx.fillRect(4, 46, 3, 14);
      ctx.fillRect(302, 57, 14, 3);
      ctx.fillRect(313, 46, 3, 14);

      // Subtle horizontal holographic scan lines
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      for (let y = 8; y < 58; y += 6) {
        ctx.fillRect(10, y, 300, 1.5);
      }

      scene.textures.addCanvas('button', canvas);
    }

    // Hover button (320x64)
    {
      const { canvas, ctx } = this.createCanvas(320, 64);
      const grad = ctx.createLinearGradient(0, 0, 0, 64);
      grad.addColorStop(0, '#103078');
      grad.addColorStop(1, '#0a1d48');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(304, 0);
      ctx.lineTo(320, 16);
      ctx.lineTo(320, 48);
      ctx.lineTo(304, 64);
      ctx.lineTo(16, 64);
      ctx.lineTo(0, 48);
      ctx.lineTo(0, 16);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Radiant white-cyan energy brackets
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, 3, 16, 4);
      ctx.fillRect(3, 3, 4, 16);
      ctx.fillRect(301, 3, 16, 4);
      ctx.fillRect(313, 3, 4, 16);
      ctx.fillRect(3, 57, 16, 4);
      ctx.fillRect(3, 45, 4, 16);
      ctx.fillRect(301, 57, 16, 4);
      ctx.fillRect(313, 45, 4, 16);

      // Inner electric neon line
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(18, 30, 284, 2);

      scene.textures.addCanvas('button-hover', canvas);
    }
  }

  // ── Particle textures ──

  static createParticles(scene) {
    {
      const { canvas, ctx } = this.createCanvas(8, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 8, 8);
      scene.textures.addCanvas('particle', canvas);
    }
  }
}
