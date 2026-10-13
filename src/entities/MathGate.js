// A stationary checkpoint. The deadline is wall-clock based so switching tabs
// or a throttled rendering loop cannot grant extra time without an explicit extension.
export const ANSWER_LIMIT_MS = 60_000;
export const EXTENSION_MS = 30_000;

export default class MathGate {
  constructor(scene, now = () => Date.now()) {
    this.scene = scene;
    this.now = now;
    this.active = false;
    this.checked = false;
    this.currentQuestion = null;
    this.deadline = 0;
  }

  activate(question) {
    this.currentQuestion = question;
    this.active = true;
    this.checked = false;
    this.totalTime = ANSWER_LIMIT_MS;
    this.deadline = this.now() + ANSWER_LIMIT_MS;
    this.scene.events.emit('mathgate-activated', question);
  }

  getRemaining() {
    return this.active && !this.checked ? Math.max(0, this.deadline - this.now()) : 0;
  }

  submit(answer) {
    if (!this.active || this.checked) return false;
    const timedOut = this.getRemaining() === 0;
    if (!timedOut) {
      const valid = this.currentQuestion.type === 'matrixRepair'
        ? /^-?\d+$/.test(String(answer).trim())
        : Number.isInteger(answer) && answer >= 0 && answer < this.currentQuestion.options.length;
      if (!valid) return false;
    }
    this.checked = true; // Lock before emitting: double clicks cannot record twice.
    this.scene.events.emit('mathgate-submitted', { answer: timedOut ? null : answer, timedOut });
    return true;
  }

  extendTime() {
    if (!this.active || this.checked) return false;
    this.deadline = Math.max(this.deadline, this.now()) + EXTENSION_MS;
    this.totalTime += EXTENSION_MS;
    return this.getRemaining();
  }

  update() {
    // At zero, keep the question open for Add Time or Review Answer.
    // No result is recorded until the player explicitly submits/reviews.
    return this.getRemaining();
  }

  deactivate() {
    this.active = false;
    this.checked = false;
    this.deadline = 0;
    this.scene.events.emit('mathgate-deactivated');
  }
}
