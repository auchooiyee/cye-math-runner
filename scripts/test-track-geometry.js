import test from 'node:test';
import assert from 'node:assert/strict';
import { TRACK, LANE_POSITIONS, projectTrack, projectRoadX, approachDistance, crossedRunner, occupiesLane } from '../src/systems/TrackGeometry.js';

test('each lane meets the runner at the same ground plane', () => {
  LANE_POSITIONS.forEach((x, lane) => assert.deepEqual(projectTrack(lane, 0), { x, y: 620, scale: 1 }));
});
test('coins and obstacles stay between their lane boundaries at every distance', () => {
  for (const z of [2600, 1200, 900, 240, 50, 0, -40]) {
    for (let lane = 0; lane < 3; lane++) {
      const point = projectTrack(lane, z, 46);
      const left = projectRoadX((lane - 1.5) * TRACK.laneWidth, z);
      const right = projectRoadX((lane - .5) * TRACK.laneWidth, z);
      assert.ok(point.x > left.x && point.x < right.x);
      assert.ok(point.y > TRACK.horizonY, 'a pickup must never fall from the sky');
    }
  }
});
test('approaching objects enlarge and follow the diverging perspective lanes', () => {
  for (let lane = 0; lane < 3; lane++) {
    const far = projectTrack(lane, 900), near = projectTrack(lane, 0);
    assert.ok(near.scale > far.scale && near.y > far.y);
    assert.ok(Math.abs(near.x - TRACK.centerX) >= Math.abs(far.x - TRACK.centerX));
  }
});
test('spawning leaves at least 2.6 seconds to react even at maximum speed', () => {
  for (const speed of [100, 300, 500, 800, 1200]) assert.ok(approachDistance(speed) / speed >= 2.6);
});
test('crossing collision survives a slow frame and cannot trigger twice', () => {
  assert.equal(crossedRunner(20, -60), true);
  assert.equal(crossedRunner(20, 0), true);
  assert.equal(crossedRunner(0, -20), false);
  assert.equal(crossedRunner(-20, -60), false);
});
test('lane collisions follow the visible runner during a lane change', () => {
  assert.equal(occupiesLane(640, 1), true);
  assert.equal(occupiesLane(640, 0), false);
  assert.equal(occupiesLane(510, 0), false);
  assert.equal(occupiesLane(510, 1), false);
  assert.equal(occupiesLane(400, 0), true);
});
