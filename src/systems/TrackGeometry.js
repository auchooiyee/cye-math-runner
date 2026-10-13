// One ground plane for the road, lane centres, pickups, obstacles and answer gates.
export const TRACK = Object.freeze({ centerX: 640, horizonY: 336, playerY: 620, cameraDepth: 180, laneWidth: 260, farZ: 2600 });
export const LANE_POSITIONS = [380, 640, 900];

export function projectTrack(lane, z, height = 0) {
  const scale = TRACK.cameraDepth / Math.max(70, TRACK.cameraDepth + z);
  return {
    x: TRACK.centerX + (lane - 1) * TRACK.laneWidth * scale,
    y: TRACK.horizonY + (TRACK.playerY - TRACK.horizonY - height) * scale,
    scale
  };
}
export function projectRoadX(worldX, z) {
  const point = projectTrack(1, z);
  return { ...point, x: point.x + worldX * point.scale };
}
export function approachDistance(speed) { return Math.max(900, speed * 2.6); }
export function crossedRunner(previousZ, nextZ) { return previousZ > 0 && nextZ <= 0; }
export function occupiesLane(playerX, lane) { return Math.abs(playerX - LANE_POSITIONS[lane]) < 85; }
