import { projectTrack, approachDistance } from './TrackGeometry.js';

export function placeOnTrack(object, lane, speed, extraDistance = 0) {
  object.lane = lane;
  object.worldZ = approachDistance(speed) + extraDistance;
  object.passedRunner = false;
  object.enableBody(true, 0, 0, true, true);
  object.body.setAllowGravity(false);
  object.setVelocity(0, 0);
  // Screen-space overlap cannot represent distance along a perspective road.
  object.body.enable = false;
  renderTrackObject(object);
}

export function renderTrackObject(object) {
  const height = object.obstacleType ? 0 : 46;
  const point = projectTrack(object.lane, object.worldZ, height);
  const size = object.obstacleType ? (object.obstacleType === 'high' ? 1.8 : 1.7) : 1.25;
  object.setOrigin(.5, object.obstacleType ? 1 : .5)
    .setPosition(point.x, point.y).setScale(point.scale * size)
    .setDepth(10 + point.scale * 10).setAlpha(Math.min(1, point.scale * 4));
  if (object.warning) {
    object.warning.setVisible(object.worldZ > 50 && object.worldZ < 650)
      .setPosition(point.x, point.y - 106 * point.scale)
      .setScale(Math.max(.5, point.scale * .65)).setDepth(31);
  }
}
