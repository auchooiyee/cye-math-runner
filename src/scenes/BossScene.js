import Phaser from 'phaser';
import audioManager from '../utils/AudioManager.js';
import MathGate from '../entities/MathGate.js';
import MathGateUI from '../ui/MathGateUI.js';

// Guardian questions share the stationary checkpoint and repeatable extensions.
// Matrix repair keeps its numeric answer, including negative values.
export default class BossScene extends Phaser.Scene {
  constructor() { super({ key: 'BossScene' }); }

  init(data) {
    Object.assign(this, data);
    this.questionsRemaining = this.bossData.questionsToDefeat || 3;
    this.closed = false;
  }

  create() {
    this.add.image(640, 360, 'academy-track-v2').setDisplaySize(1280, 720);
    this.add.image(1140, 550, 'boss-sprite').setScale(2);
    this.answerUI = new MathGateUI(this);
    this.checkpoint = new MathGate(this);
    const onQuestion = question => {
      this.answerUI.showQuestion(question, answer => this.checkpoint.submit(answer), {
        title: this.bossData.name,
        subtitle: `${this.questionsRemaining} challenge segment${this.questionsRemaining === 1 ? '' : 's'} left • start with 60 seconds`,
        onExtend: () => this.checkpoint.extendTime(),
        onReview: () => this.checkpoint.submit(null),
        getTotalTime: () => this.checkpoint.totalTime
      });
    };
    const onSubmission = result => this.resolveAnswer(result);
    this.events.on('mathgate-activated', onQuestion);
    this.events.on('mathgate-submitted', onSubmission);
    this.events.once('shutdown', () => {
      this.checkpoint.deactivate();
      this.events.off('mathgate-activated', onQuestion);
      this.events.off('mathgate-submitted', onSubmission);
    });
    this.presentQuestion();
  }

  update() {
    this.checkpoint.update();
    if (!this.checkpoint.checked) this.answerUI.updateTimer(this.checkpoint.getRemaining());
  }

  presentQuestion() {
    const question = this.questionSystem.getBossQuestion(this.bossData.zone) || {
      id: 'fallback-boss-question', chapter: this.bossData.zone,
      question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], answer: 1,
      explanation: '2 + 2 = 4.'
    };
    this.checkpoint.activate(question);
  }

  resolveAnswer({ answer, timedOut }) {
    const question = this.checkpoint.currentQuestion;
    const result = question.id === 'fallback-boss-question'
      ? { correct: answer === question.answer, selectedAnswer: question.options[answer] || 'No answer',
          correctAnswer: question.options[question.answer], explanation: question.explanation }
      : this.questionSystem.validateAnswer(question.id, answer);
    this.difficultySystem.recordAnswer(result.correct);
    if (result.correct) {
      this.questionsRemaining--;
      audioManager.playBossHit();
    } else audioManager.playWrong();
    const finished = this.questionsRemaining === 0;
    this.answerUI.showResult(result, () => {
      const game = this.scene.get('GameScene');
      if (!result.correct) game.player.takeDamage();
      if (game.player.isDead) this.closeBoss(false);
      else if (finished) this.closeBoss(true);
      else this.presentQuestion();
    }, { timedOut, continueLabel: finished ? 'COMPLETE CHALLENGE →' : 'NEXT QUESTION →' });
  }

  closeBoss(defeated) {
    if (this.closed) return;
    this.closed = true;
    if (defeated) audioManager.playBossDefeat();
    this.scene.get('GameScene').events.emit(defeated ? 'boss-defeated' : 'boss-failed', this.bossData.reward);
    this.scene.stop('BossScene');
  }
}
