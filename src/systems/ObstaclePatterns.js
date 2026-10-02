// Each wave has an open lane. Later waves are separated long enough to react.
export function buildObstaclePattern(kind, lane, type = 'low') {
  const nextLane = (lane + 1) % 3;
  switch (kind) {
    case 'double':
      return [{ delay: 0, obstacles: [{ lane, type }, { lane: nextLane, type }] }];
    case 'weave':
      return [
        { delay: 0, obstacles: [{ lane, type }] },
        { delay: 1400, obstacles: [{ lane: nextLane, type }] }
      ];
    case 'jumpSlide':
      return [
        { delay: 0, obstacles: [{ lane, type: 'low' }] },
        { delay: 1500, obstacles: [{ lane, type: 'high' }] }
      ];
    default:
      return [{ delay: 0, obstacles: [{ lane, type }] }];
  }
}

export function hasApproachTime(distanceMetres, speedPixelsPerSecond, eventDistanceMetres, seconds = 4.5) {
  // RunnerSystem converts ten pixels travelled into one displayed metre.
  return eventDistanceMetres - distanceMetres > Math.max(0, speedPixelsPerSecond) * seconds / 10;
}
