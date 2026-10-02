import assert from 'node:assert/strict';
import test from 'node:test';
import { buildObstaclePattern, hasApproachTime } from '../src/systems/ObstaclePatterns.js';

test('every obstacle wave leaves an open lane and gives time between waves', () => {
  for (const kind of ['single', 'double', 'weave', 'jumpSlide']) {
    for (let lane = 0; lane < 3; lane++) {
      const waves = buildObstaclePattern(kind, lane, 'high');
      for (let index = 0; index < waves.length; index++) {
        const blockedLanes = new Set(waves[index].obstacles.map(obstacle => obstacle.lane));
        assert.ok(blockedLanes.size <= 2, `${kind} blocked every lane`);
        assert.ok([...blockedLanes].every(value => value >= 0 && value <= 2));
        if (index) assert.ok(waves[index].delay >= 1200, `${kind} gave too little reaction time`);
      }
    }
  }
});

test('gate approach reserves more distance at higher runner speeds', () => {
  assert.equal(hasApproachTime(600, 300, 800), true);
  assert.equal(hasApproachTime(700, 300, 800), false);
  assert.equal(hasApproachTime(700, 600, 800), false);
  assert.equal(hasApproachTime(600, 600, 800), false);
});
