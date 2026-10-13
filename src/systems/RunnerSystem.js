import { EVENTS } from '../config/constants.js';
import { TRACK, projectRoadX } from './TrackGeometry.js';

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
    this.roadOffset = 0;
    this.accent = 0xefd17a;
  }

  create() {
    this.scenery = this.scene.add.image(640, 360, 'academy-track-v2').setDisplaySize(1280, 720).setDepth(-10);
    this.road = this.scene.add.graphics().setDepth(-5);
    this.locationLabel = this.scene.add.text(24, 136, 'CYE ACADEMY', {
      fontFamily: '"Rajdhani", sans-serif', fontSize: '17px', fontStyle: 'bold',
      color: '#ffe29a', backgroundColor: '#102c57', padding: { x: 10, y: 7 }
    }).setDepth(32);
    this.groundPhysics = this.scene.physics.add.staticImage(640, TRACK.playerY + 20, 'ground');
    this.groundPhysics.setDisplaySize(1280, 40).setVisible(false).refreshBody();
    this.groundPhysics.body.checkCollision.down = false;
    this.groundPhysics.body.checkCollision.left = false;
    this.groundPhysics.body.checkCollision.right = false;
    this.drawRoad();
  }

  roadQuad(left, right, nearZ, farZ, color, alpha = 1) {
    const points = [projectRoadX(left, farZ), projectRoadX(right, farZ), projectRoadX(right, nearZ), projectRoadX(left, nearZ)];
    this.road.fillStyle(color, alpha);
    this.road.fillPoints(points, true);
  }

  drawRoad() {
    this.road.clear();
    // Matching blue-grey road, cream kerbs and exactly two dividing lines.
    // Every edge and dash is projected with the SAME function as gameplay objects.
    this.roadQuad(-422, 422, -46, 100000, 0xe8dac0);
    this.roadQuad(-390, 390, -46, 100000, 0x566a81);
    for (let z = 2400; z > -120; z -= 90) {
      const near = z - (this.roadOffset % 90);
      if (near < -46) continue;
      this.roadQuad(-390, 390, near, near + 44, 0x496077, .34);
      for (const x of [-130, 130]) this.roadQuad(x - 3, x + 3, near, near + 39, 0xf9f7e9, .94);
      for (const x of [-407, 407]) this.roadQuad(x - 10, x + 10, near, near + 42, this.accent, .95);
    }
    this.roadQuad(-389, -385, -46, 100000, 0xffffff, .8);
    this.roadQuad(385, 389, -46, 100000, 0xffffff, .8);
    // Roadside markers reinforce forward motion without drifting across lanes.
    for (let z = 1800; z > -50; z -= 220) {
      const depth = z - (this.roadOffset % 220);
      if (depth < -40) continue;
      for (const x of [-448, 448]) {
        const p = projectRoadX(x, depth);
        this.road.fillStyle(0x1c5598, .9);
        this.road.fillRect(p.x - 3 * p.scale, p.y - 40 * p.scale, 6 * p.scale, 40 * p.scale);
        this.road.fillStyle(0xffdc70, 1);
        this.road.fillCircle(p.x, p.y - 40 * p.scale, 5 * p.scale);
      }
    }
  }

  update(time, delta) {
    if (this.isPaused) return;
    const travel = this.getSpeed() * delta / 1000;
    this.distance += travel;
    this.roadOffset += travel;
    const oldMetres = this.distanceMetres;
    this.distanceMetres = Math.floor(this.distance / 10);
    if (oldMetres !== this.distanceMetres) this.scene.events.emit(EVENTS.DISTANCE_CHANGED, this.distanceMetres);
    if (travel > 0) this.drawRoad();
    this.speedTimer += delta;
    if (this.speedTimer >= this.INCREMENT_INTERVAL) {
      this.speedTimer -= this.INCREMENT_INTERVAL;
      if (this.speed < this.MAX_SPEED) {
        this.speed = Math.min(this.MAX_SPEED, this.speed + this.INCREMENT);
        this.scene.events.emit(EVENTS.SPEED_CHANGED, this.speed);
      }
    }
  }
  getSpeed() { return this.speed * this.speedMultiplier; }
  getDistanceMetres() { return this.distanceMetres; }
  pause() { this.isPaused = true; }
  resume() { this.isPaused = false; }
  setSpeedMultiplier(value) { this.speedMultiplier = value; }
  resetSpeedMultiplier() { this.speedMultiplier = 1; }
  setZoneTheme(zone) {
    this.accent = zone.accentHex;
    this.locationLabel.setText(zone.locationEn || zone.nameEn);
    this.drawRoad();
  }
  destroy() { this.road?.destroy(); }
}
