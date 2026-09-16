import Obstacle from '../entities/Obstacle.js';
import Coin from '../entities/Coin.js';
import PowerUp from '../entities/PowerUp.js';
import MathGate from '../entities/MathGate.js';

const LANE_POSITIONS = [380, 640, 900];
const GROUND_Y = 620;

const SPAWN = {
  OBSTACLE_MIN_INTERVAL: 1500,
  OBSTACLE_MAX_INTERVAL: 3000,
  COIN_MIN_INTERVAL: 800,
  COIN_MAX_INTERVAL: 2000,
  POWERUP_MIN_INTERVAL: 15000,
  POWERUP_MAX_INTERVAL: 30000,
  MATH_GATE_DISTANCE: 800,
  BOSS_DISTANCE: 2500
};

export default class SpawnSystem {
  constructor(scene) {
    this.scene = scene;
    this.obstaclePool = [];
    this.coinPool = [];
    this.powerUpPool = [];
    this.mathGate = null;

    this.obstacleTimer = 0;
    this.coinTimer = 0;
    this.powerUpTimer = 0;
    this.lastGateDistance = 0;
    this.lastBossDistance = 0;

    this.gateDistance = SPAWN.MATH_GATE_DISTANCE;
    this.bossDistance = SPAWN.BOSS_DISTANCE;

    this.nextObstacleInterval = this.randomInterval(SPAWN.OBSTACLE_MIN_INTERVAL, SPAWN.OBSTACLE_MAX_INTERVAL);
    this.nextCoinInterval = this.randomInterval(SPAWN.COIN_MIN_INTERVAL, SPAWN.COIN_MAX_INTERVAL);
    this.nextPowerUpInterval = this.randomInterval(SPAWN.POWERUP_MIN_INTERVAL, SPAWN.POWERUP_MAX_INTERVAL);
  }

  setGateDistance(dist) {
    this.gateDistance = dist;
  }

  create() {
    this.obstacleGroup = this.scene.physics.add.group({ allowGravity: false });
    this.coinGroup = this.scene.physics.add.group({ allowGravity: false });
    this.powerUpGroup = this.scene.physics.add.group({ allowGravity: false });

    // Pre-create obstacle pool
    for (let i = 0; i < 10; i++) {
      const obs = new Obstacle(this.scene, -200, -200, 'low');
      obs.deactivate();
      this.obstacleGroup.add(obs);
      this.obstaclePool.push(obs);
    }

    // Pre-create coin pool
    for (let i = 0; i < 20; i++) {
      const coin = new Coin(this.scene, -200, -200);
      coin.deactivate();
      this.coinGroup.add(coin);
      this.coinPool.push(coin);
    }

    // Pre-create power-up pool
    for (let i = 0; i < 3; i++) {
      const pu = new PowerUp(this.scene, -200, -200, 'shield');
      pu.deactivate();
      this.powerUpGroup.add(pu);
      this.powerUpPool.push(pu);
    }

    // Create single MathGate
    this.mathGate = new MathGate(this.scene);

    return {
      obstacleGroup: this.obstacleGroup,
      coinGroup: this.coinGroup,
      powerUpGroup: this.powerUpGroup,
      mathGate: this.mathGate
    };
  }

  update(time, delta, speed, distanceMetres) {
    this.obstacleTimer += delta;
    this.coinTimer += delta;
    this.powerUpTimer += delta;

    // Spawn obstacles only when NO math gate is active (allows student to focus on calculating)
    const isGateActive = this.mathGate && this.mathGate.active;
    if (!isGateActive && this.obstacleTimer >= this.nextObstacleInterval) {
      this.obstacleTimer = 0;
      this.nextObstacleInterval = this.randomInterval(SPAWN.OBSTACLE_MIN_INTERVAL, SPAWN.OBSTACLE_MAX_INTERVAL);
      this.spawnObstacle(speed);
    }

    // Spawn coins
    if (this.coinTimer >= this.nextCoinInterval) {
      this.coinTimer = 0;
      this.nextCoinInterval = this.randomInterval(SPAWN.COIN_MIN_INTERVAL, SPAWN.COIN_MAX_INTERVAL);
      this.spawnCoinPattern(speed);
    }

    // Spawn power-ups
    if (this.powerUpTimer >= this.nextPowerUpInterval) {
      this.powerUpTimer = 0;
      this.nextPowerUpInterval = this.randomInterval(SPAWN.POWERUP_MIN_INTERVAL, SPAWN.POWERUP_MAX_INTERVAL);
      this.spawnPowerUp(speed);
    }

    // Update math gate
    if (this.mathGate) {
      this.mathGate.update();
    }

    // Recycle off-screen objects (scrolled past bottom)
    this.recycleOffScreen();
  }

  spawnObstacle(speed) {
    const inactive = this.obstaclePool.find(o => !o.active);
    if (!inactive) return;

    const lane = Math.floor(Math.random() * 3);
    const type = Math.random() > 0.5 ? 'high' : 'low';
    inactive.activate(lane, type, speed);
  }

  spawnCoinPattern(speed) {
    const lane = Math.floor(Math.random() * 3);
    const count = 3 + Math.floor(Math.random() * 3); // 3-5 coins
    const laneX = LANE_POSITIONS[lane];

    for (let i = 0; i < count; i++) {
      const inactive = this.coinPool.find(c => !c.active);
      if (!inactive) break;
      // Stagger coins vertically so they appear as a line
      inactive.activate(laneX, -50 - (i * 40), speed);
    }
  }

  spawnPowerUp(speed) {
    const inactive = this.powerUpPool.find(p => !p.active);
    if (!inactive) return;

    const lane = Math.floor(Math.random() * 3);
    const types = ['shield', 'hint', 'coin_magnet'];
    const type = types[Math.floor(Math.random() * types.length)];
    inactive.activate(lane, type, speed);
  }

  shouldSpawnGate(distanceMetres) {
    return distanceMetres - this.lastGateDistance >= this.gateDistance;
  }

  shouldTriggerBoss(distanceMetres) {
    return distanceMetres - this.lastBossDistance >= this.bossDistance;
  }

  spawnMathGate(question, speed) {
    if (this.mathGate.active) return; // don't spawn if already active
    this.mathGate.activate(question, speed);
    this.lastGateDistance += this.gateDistance;
  }

  markBossTriggered() {
    this.lastBossDistance += this.bossDistance;
  }

  recycleOffScreen() {
    // Objects that scrolled past the bottom of the screen (y > 800)
    this.obstaclePool.forEach(o => {
      if (o.active && o.y > 800) o.deactivate();
    });
    this.coinPool.forEach(c => {
      if (c.active && c.y > 800) c.deactivate();
    });
    this.powerUpPool.forEach(p => {
      if (p.active && p.y > 800) p.deactivate();
    });
  }

  randomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  destroy() {
    this.obstaclePool = [];
    this.coinPool = [];
    this.powerUpPool = [];
  }
}
