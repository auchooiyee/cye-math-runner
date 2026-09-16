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

  destroy() {
    this.bgLayers = [];
  }
}
