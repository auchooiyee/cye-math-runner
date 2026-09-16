import { EVENTS } from '../config/constants.js';

export default class DifficultySystem {
  constructor(scene) {
    this.scene = scene;
    this.currentDifficulty = 2;
    this.minDifficulty = 1;
    this.maxDifficulty = 6;
    this.questionsAnswered = 0;
    this.questionsCorrect = 0;
    
    this.ACCURACY_UP_THRESHOLD = 80;
    this.ACCURACY_DOWN_THRESHOLD = 40;
  }
  
  setRange(min, max) {
    this.minDifficulty = min;
    this.maxDifficulty = max;
    this.currentDifficulty = min;
  }
  
  recordAnswer(correct) {
    this.questionsAnswered++;
    if (correct) this.questionsCorrect++;
    this.adjust();
  }
  
  adjust() {
    const accuracy = this.getAccuracy();
    let changed = false;
    
    if (accuracy > this.ACCURACY_UP_THRESHOLD && this.currentDifficulty < this.maxDifficulty) {
      this.currentDifficulty++;
      changed = true;
    } else if (accuracy < this.ACCURACY_DOWN_THRESHOLD && this.currentDifficulty > this.minDifficulty) {
      this.currentDifficulty--;
      changed = true;
    }
    
    if (changed) {
      // reset counts to require sustained performance for next shift
      this.questionsAnswered = 0;
      this.questionsCorrect = 0;
      this.scene.events.emit(EVENTS.DIFFICULTY_CHANGED, this.currentDifficulty);
    }
  }
  
  getAccuracy() {
    if (this.questionsAnswered === 0) return 75;
    return (this.questionsCorrect / this.questionsAnswered) * 100;
  }
  
  getDifficultyRange() {
    return {
      min: Math.max(this.minDifficulty, this.currentDifficulty - 1),
      max: Math.min(this.maxDifficulty, this.currentDifficulty + 1)
    };
  }
  
  reset() {
    this.currentDifficulty = this.minDifficulty;
    this.questionsAnswered = 0;
    this.questionsCorrect = 0;
  }
}
