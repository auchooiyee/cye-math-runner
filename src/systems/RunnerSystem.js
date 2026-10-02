import { EVENTS } from '../config/constants.js';

const GROUND_Y = 620;
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

export default class RunnerSystem {
  constructor(scene) {
    this.scene = scene;
    this.speed = 300;
    this.MAX_SPEED = 800;
    this.INCREMENT_INTERVAL = 10000;
    this.INCREMENT = 5;

    this.distance = 0;
    this.distanceMetres = 0;
    this.speedTimer = 0;
    this.isPaused = false;
    this.speedMultiplier = 1;

    this.bgLayers = [];
    this.ground = null;
    this.groundPhysics = null;
    this.neonLine = null;
    this.zoneVisuals = null;
    this.zoneElements = [];
  }

  create() {
    // Background layers — scrolling tileSprites for parallax
    // Layer 1 (farthest): Full 1280x720 sky, nebula, twinkling stars & distant neo-city skyline
    const bg1 = this.scene.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bg-layer-1');
    bg1.setDepth(-10);
    bg1.scrollSpeed = 0.12;
    this.bgLayers.push(bg1);

    // Layer 2 (mid): Full 1280x720 midground cyber towers & elevated hyperloop transit
    const bg2 = this.scene.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bg-layer-2');
    bg2.setDepth(-9);
    bg2.scrollSpeed = 0.35;
    this.bgLayers.push(bg2);

    // Layer 3 (near): Full 1280x720 highway crash barrier along ground
    const bg3 = this.scene.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bg-layer-3');
    bg3.setDepth(-8);
    bg3.scrollSpeed = 0.7;
    this.bgLayers.push(bg3);

    // Visual ground tileSprite (100px from Y=620 to Y=720)
    this.ground = this.scene.add.tileSprite(GAME_WIDTH / 2, GROUND_Y + 50, GAME_WIDTH, 100, 'ground');
    this.ground.setDepth(-1);

    // Neon laser line on ground surface
    this.neonLine = this.scene.add.tileSprite(GAME_WIDTH / 2, GROUND_Y, GAME_WIDTH, 4, 'ground-line');
    this.neonLine.setDepth(0);

    // Physics ground — static body for player to stand on
    this.groundPhysics = this.scene.physics.add.staticImage(GAME_WIDTH / 2, GROUND_Y + 20, 'ground');
    this.groundPhysics.setDisplaySize(GAME_WIDTH, 40);
    this.groundPhysics.refreshBody();
    this.groundPhysics.body.checkCollision.down = false;
    this.groundPhysics.body.checkCollision.left = false;
    this.groundPhysics.body.checkCollision.right = false;
    this.groundPhysics.setDepth(-2);
    this.groundPhysics.setAlpha(0); // invisible, just for physics

    // Below-ground fill to prevent seeing under the ground
    const fill = this.scene.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 60, GAME_WIDTH, 100, 0x040612);
    fill.setDepth(-3);
  }

  update(time, delta) {
    if (this.isPaused) return;

    const deltaSeconds = delta / 1000;
    const effectiveSpeed = this.speed * this.speedMultiplier;

    // Update distance
    this.distance += effectiveSpeed * deltaSeconds;
    const oldMetres = this.distanceMetres;
    this.distanceMetres = Math.floor(this.distance / 10);

    if (this.distanceMetres !== oldMetres) {
      this.scene.events.emit(EVENTS.DISTANCE_CHANGED, this.distanceMetres);
    }

    // Scroll backgrounds (tilePositionY for vertical scrolling feel — but we use X for side-scroll parallax)
    // Actually scroll X to simulate forward motion
    this.ground.tilePositionX += effectiveSpeed * deltaSeconds;
    this.neonLine.tilePositionX += effectiveSpeed * deltaSeconds;

    this.bgLayers.forEach(layer => {
      layer.tilePositionX += effectiveSpeed * deltaSeconds * layer.scrollSpeed;
    });

    this.zoneElements.forEach((element, index) => {
      element.x -= effectiveSpeed * deltaSeconds * element.moveFactor;
      element.y = element.baseY + Math.sin(time * 0.0015 + index) * element.bobAmount;
      element.rotation += element.rotationSpeed * deltaSeconds;
      if (element.x < -180) element.x = GAME_WIDTH + 180;
    });

    // Speed increment
    this.speedTimer += delta;
    if (this.speedTimer >= this.INCREMENT_INTERVAL) {
      this.speedTimer -= this.INCREMENT_INTERVAL;
      if (this.speed < this.MAX_SPEED) {
        this.speed += this.INCREMENT;
        this.scene.events.emit(EVENTS.SPEED_CHANGED, this.speed);
      }
    }
  }

  getSpeed() {
    return this.speed * this.speedMultiplier;
  }

  getDistanceMetres() {
    return this.distanceMetres;
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  setSpeedMultiplier(mult) {
    this.speedMultiplier = mult;
  }

  resetSpeedMultiplier() {
    this.speedMultiplier = 1;
  }

  setZoneTheme(zone, animate = true) {
    this.bgLayers.forEach((layer, index) => {
      layer.setTint(zone.tintHex || 0xffffff);
      layer.setAlpha(index === 0 ? 0.9 : 0.78 + index * 0.08);
    });
    this.ground.setTint(zone.tintHex || 0xffffff);
    this.neonLine.setTint(zone.accentHex);

    const previous = this.zoneVisuals;
    const container = this.scene.add.container(0, 0).setDepth(-7).setAlpha(animate ? 0 : 1);
    const wash = this.scene.add.rectangle(GAME_WIDTH / 2, 350, GAME_WIDTH, 540, zone.accentHex, 0.045);
    container.add(wash);

    const elements = [];
    for (let i = 0; i < 12; i++) {
      const motif = zone.motifs[i % zone.motifs.length];
      const text = this.scene.add.text(80 + i * 125, 175 + (i % 4) * 105, motif, {
        fontSize: `${22 + (i % 3) * 5}px`,
        fontFamily: "'Fira Code', Consolas, monospace",
        color: zone.labelColor,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setAlpha(0.12 + (i % 3) * 0.035);
      text.baseY = text.y;
      text.bobAmount = 6 + (i % 3) * 4;
      text.moveFactor = 0.035 + (i % 4) * 0.012;
      text.rotationSpeed = zone.key === 'transformations' ? (i % 2 ? 0.08 : -0.08) : 0;
      elements.push(text);
      container.add(text);
    }

    const horizon = this.scene.add.graphics();
    horizon.lineStyle(2, zone.accentHex, 0.16);
    for (let y = 260; y <= 560; y += 75) {
      horizon.lineBetween(0, y, GAME_WIDTH, y);
    }
    container.addAt(horizon, 1);

    this.zoneVisuals = container;
    this.zoneElements = elements;
    if (animate) {
      this.scene.tweens.add({ targets: container, alpha: 1, duration: 900, ease: 'Sine.easeOut' });
      if (previous) {
        this.scene.tweens.add({
          targets: previous, alpha: 0, duration: 600,
          onComplete: () => previous.destroy(true)
        });
      }
    } else if (previous) {
      previous.destroy(true);
    }
  }

  destroy() {
    this.bgLayers = [];
    this.zoneElements = [];
    this.zoneVisuals?.destroy(true);
  }
}
