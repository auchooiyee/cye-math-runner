import { renderTrackObject } from './TrackObject.js';
import { crossedRunner, occupiesLane } from './TrackGeometry.js';
import Obstacle from '../entities/Obstacle.js';
import Coin from '../entities/Coin.js';
import PowerUp from '../entities/PowerUp.js';
import MathGate from '../entities/MathGate.js';
import { buildObstaclePattern, hasApproachTime } from './ObstaclePatterns.js';

const SPAWN = {
  OBSTACLE_MIN_INTERVAL: 2300,
  OBSTACLE_MAX_INTERVAL: 3400,
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
    this.obstaclesEnabled = true;

    this.obstacleTimer = 0;
    this.pendingObstacleWaves = [];
    this.patternCount = 0;
    this.coinTimer = 0;
    this.powerUpTimer = 0;
    this.lastGateDistance = 0;
    this.lastBossDistance = 0;

    this.gateDistance = SPAWN.MATH_GATE_DISTANCE;
    this.bossDistance = SPAWN.BOSS_DISTANCE;

    this.nextObstacleInterval = 2500; // A quiet opening before the first pattern.
    this.nextCoinInterval = this.randomInterval(SPAWN.COIN_MIN_INTERVAL, SPAWN.COIN_MAX_INTERVAL);
    this.nextPowerUpInterval = this.randomInterval(SPAWN.POWERUP_MIN_INTERVAL, SPAWN.POWERUP_MAX_INTERVAL);
  }

  setGateDistance(dist) {
    this.gateDistance = dist;
  }

  setObstacleSpawning(enabled) {
    this.obstaclesEnabled = enabled;
    if (!enabled) this.pendingObstacleWaves = [];
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
    this.coinTimer += delta;
    this.powerUpTimer += delta;

    // Keep the gate approach clear so players can read before choosing an answer lane.
    const isGateActive = this.mathGate && this.mathGate.active;
    const gateApproaching = !hasApproachTime(distanceMetres, speed, this.lastGateDistance + this.gateDistance);
    const bossApproaching = !hasApproachTime(distanceMetres, speed, this.lastBossDistance + this.bossDistance);
    if (!this.obstaclesEnabled || isGateActive || gateApproaching || bossApproaching) {
      this.pendingObstacleWaves = [];
      this.obstacleTimer = 0;
    } else if (this.pendingObstacleWaves.length) {
      this.pendingObstacleWaves.forEach(wave => { wave.remaining -= delta; });
      while (this.pendingObstacleWaves.length && this.pendingObstacleWaves[0].remaining <= 0) {
        this.spawnObstacleWave(this.pendingObstacleWaves.shift().obstacles, speed);
      }
    } else {
      this.obstacleTimer += delta;
      if (this.obstacleTimer >= this.nextObstacleInterval) {
        this.obstacleTimer = 0;
        this.spawnObstaclePattern(speed);
        this.nextObstacleInterval = this.randomInterval(SPAWN.OBSTACLE_MIN_INTERVAL, SPAWN.OBSTACLE_MAX_INTERVAL);
      }
    }

    // Spawn coins
    if (!isGateActive && this.coinTimer >= this.nextCoinInterval) {
      this.coinTimer = 0;
      this.nextCoinInterval = this.randomInterval(SPAWN.COIN_MIN_INTERVAL, SPAWN.COIN_MAX_INTERVAL);
      this.spawnCoinPattern(speed);
    }

    // Spawn power-ups
    if (!isGateActive && this.powerUpTimer >= this.nextPowerUpInterval) {
      this.powerUpTimer = 0;
      this.nextPowerUpInterval = this.randomInterval(SPAWN.POWERUP_MIN_INTERVAL, SPAWN.POWERUP_MAX_INTERVAL);
      this.spawnPowerUp(speed);
    }

    // Update math gate
    if (this.mathGate) {
      this.mathGate.update(delta);
    }

    this.advanceTrackObjects(delta, speed);
  }

  spawnObstaclePattern(speed) {
    const lane = Math.floor(Math.random() * 3);
    const type = Math.random() > 0.5 ? 'high' : 'low';
    // Open gently; alternate pattern families to avoid long random streaks.
    const kinds = this.patternCount < 2 ? ['single'] : ['single', 'double', 'weave', 'jumpSlide'];
    const kind = kinds[this.patternCount % kinds.length];
    this.patternCount++;
    const [first, ...later] = buildObstaclePattern(kind, lane, type);
    this.spawnObstacleWave(first.obstacles, speed);
    this.pendingObstacleWaves = later.map(wave => ({ ...wave, remaining: wave.delay }));
  }

  spawnObstacleWave(obstacles, speed) {
    for (const { lane, type } of obstacles) {
      const inactive = this.obstaclePool.find(o => !o.active);
      if (inactive) inactive.activate(lane, type, speed);
    }
  }

  resumeAfterGate() {
    this.pendingObstacleWaves = [];
    this.obstacleTimer = 0;
    this.nextObstacleInterval = 2500;
  }

  spawnCoinPattern(speed) {
    const lane = Math.floor(Math.random() * 3);
    const count = 3 + Math.floor(Math.random() * 3); // 3-5 coins

    for (let i = 0; i < count; i++) {
      const inactive = this.coinPool.find(c => !c.active);
      if (!inactive) break;
      // Space coins along the road, never along the screen Y axis.
      inactive.activate(lane, i * 90, speed);
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
    this.pendingObstacleWaves = [];
    this.obstacleTimer = 0;
    // Clear any active obstacles so player has completely open lanes for calculation
    this.obstaclePool.forEach(o => {
      if (o.active) o.deactivate();
    });
    [...this.coinPool, ...this.powerUpPool].forEach(object => object.deactivate());
    this.mathGate.activate(question, speed);
    this.lastGateDistance += this.gateDistance;
  }

  markBossTriggered() {
    this.lastBossDistance += this.bossDistance;
  }

  advanceTrackObjects(delta, speed) {
    const player = this.scene.player;
    const magnet = this.scene.powerUpSystem.isActive('coin_magnet');
    for (const pool of [this.obstaclePool, this.coinPool, this.powerUpPool]) {
      for (const object of pool) {
        if (!object.active) continue;
        const previousZ = object.worldZ;
        object.worldZ -= speed * delta / 1000;
        renderTrackObject(object);
        const isCoin = pool === this.coinPool;
        const atRunner = crossedRunner(previousZ, object.worldZ);
        const magnetPickup = isCoin && magnet && object.worldZ <= 120 && object.worldZ > 0;
        if (!object.passedRunner && (atRunner || magnetPickup)) {
          object.passedRunner = true;
          if (!player.isDead && (occupiesLane(player.x, object.lane) || magnetPickup)) {
            if (pool === this.obstaclePool) this.scene.hitObstacle(player, object);
            else if (isCoin) this.scene.collectCoin(player, object);
            else this.scene.collectPowerUp(player, object);
          }
        }
        if (object.worldZ < -70) object.deactivate();
      }
    }
  }

  randomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  destroy() {
    this.pendingObstacleWaves = [];
    this.obstaclePool = [];
    this.coinPool = [];
    this.powerUpPool = [];
  }
}
