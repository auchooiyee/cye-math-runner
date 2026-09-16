import { EVENTS } from '../config/constants.js';

export default class ScoreSystem {
  constructor(scene) {
    this.scene = scene;
    this.mathScore = 0;
    this.distanceScore = 0;
    this.coinScore = 0;
    this.comboScore = 0;
    this.bossScore = 0;
    this.totalCoins = 0;
    this.bossesDefeated = 0;
    
    this.SCORING = {
      COIN: 10,
      DISTANCE_MULTIPLIER: 1,
      WEIGHT_MATH: 0.6,
      WEIGHT_DISTANCE: 0.25,
      WEIGHT_COINS: 0.1,
      WEIGHT_COMBO: 0.05
    };
  }
  
  addCorrectAnswer(points, comboMultiplier) {
    const earned = points * comboMultiplier;
    this.mathScore += earned;
    this.emitChange();
    return earned;
  }
  
  addWrongAnswer(penalty) {
    this.mathScore += penalty; // penalty should be negative
    if (this.mathScore < 0) this.mathScore = 0;
    this.emitChange();
  }
  
  addCoin() {
    this.totalCoins++;
    this.coinScore += this.SCORING.COIN;
    this.emitChange();
  }
  
  addBossDefeat(reward) {
    this.bossScore += reward;
    this.bossesDefeated++;
    this.emitChange();
  }
  
  updateDistance(distanceMetres) {
    this.distanceScore = distanceMetres * this.SCORING.DISTANCE_MULTIPLIER;
    this.emitChange();
  }
  
  addComboBonus(bonus) {
    this.comboScore += bonus;
    this.emitChange();
  }
  
  getFinalScore() {
    return Math.floor(
      this.mathScore * this.SCORING.WEIGHT_MATH +
      this.distanceScore * this.SCORING.WEIGHT_DISTANCE +
      this.coinScore * this.SCORING.WEIGHT_COINS +
      this.comboScore * this.SCORING.WEIGHT_COMBO +
      this.bossScore
    );
  }

  getSprintGrade(accuracy) {
    if (accuracy >= 90) return { grade: 'A+', label: 'Cemerlang Tertinggi', color: '#ffd700' };
    if (accuracy >= 80) return { grade: 'A', label: 'Cemerlang Tinggi', color: '#00ff88' };
    if (accuracy >= 70) return { grade: 'A-', label: 'Cemerlang', color: '#00ffff' };
    if (accuracy >= 65) return { grade: 'B+', label: 'Kepujian Tertinggi', color: '#33ccff' };
    if (accuracy >= 60) return { grade: 'B', label: 'Kepujian Tinggi', color: '#66aaff' };
    if (accuracy >= 55) return { grade: 'C+', label: 'Kepujian Atas', color: '#ffcc00' };
    if (accuracy >= 50) return { grade: 'C', label: 'Kepujian', color: '#ffaa00' };
    if (accuracy >= 45) return { grade: 'D', label: 'Lulus Atas', color: '#ff8800' };
    if (accuracy >= 40) return { grade: 'E', label: 'Lulus', color: '#ff6600' };
    return { grade: 'G', label: 'Gagal', color: '#ff2244' };
  }

  getSprintFinalScore(timeRemainingSeconds = 0, accuracy = 0) {
    const timeBonus = Math.max(0, Math.floor(timeRemainingSeconds * 10));
    const accuracyFactor = accuracy / 100;
    const weightedMath = Math.floor(this.mathScore * accuracyFactor * 1.5);
    const sprintTotal = weightedMath + Math.floor(this.distanceScore * 0.2) + this.coinScore + timeBonus + this.bossScore;
    return {
      finalScore: Math.max(0, sprintTotal),
      timeBonus
    };
  }
  
  getDisplayScore() {
    return this.mathScore + this.distanceScore + this.coinScore + this.comboScore + this.bossScore;
  }
  
  emitChange() {
    this.scene.events.emit(EVENTS.SCORE_CHANGED, this.getDisplayScore());
  }
  
  getStats() {
    return {
      mathScore: this.mathScore,
      distanceScore: this.distanceScore,
      coinScore: this.coinScore,
      comboScore: this.comboScore,
      bossScore: this.bossScore,
      totalCoins: this.totalCoins,
      bossesDefeated: this.bossesDefeated,
      finalScore: this.getFinalScore()
    };
  }
  
  reset() {
    this.mathScore = 0;
    this.distanceScore = 0;
    this.coinScore = 0;
    this.comboScore = 0;
    this.bossScore = 0;
    this.totalCoins = 0;
    this.bossesDefeated = 0;
    this.emitChange();
  }
}
