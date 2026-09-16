export const LANE_POSITIONS = [380, 640, 900];

export default class LaneSystem {
  constructor(scene) {
    this.scene = scene;
    this.LANE_SWITCH_DURATION = 150;
  }
  
  moveTo(sprite, laneIndex, callback) {
    this.scene.tweens.add({
      targets: sprite,
      x: LANE_POSITIONS[laneIndex],
      duration: this.LANE_SWITCH_DURATION,
      ease: 'Power1',
      onComplete: () => {
        if (callback) callback();
      }
    });
  }
  
  getLaneFromX(x) {
    let nearest = 0;
    let minDist = Infinity;
    LANE_POSITIONS.forEach((laneX, i) => {
      let dist = Math.abs(x - laneX);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });
    return nearest;
  }
  
  getRandomLane() {
    return Math.floor(Math.random() * 3);
  }
  
  getRandomLaneExcluding(excludeIndex) {
    let lanes = [0, 1, 2];
    lanes.splice(excludeIndex, 1);
    return lanes[Math.floor(Math.random() * 2)];
  }
}
