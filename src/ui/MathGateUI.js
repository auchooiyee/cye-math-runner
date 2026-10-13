import { appendMatrixMath } from '../utils/MathFormatter.js';
import './checkpoint.css';
import { editNumber } from './NumericKeypad.js';

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export default class MathGateUI {
  constructor(scene) {
    this.scene = scene;
    this.dialog = el('dialog', 'checkpoint');
    this.dialog.setAttribute('aria-label', 'CYE Academy question checkpoint');
    this.dialog.addEventListener('cancel', event => event.preventDefault());
    document.body.append(this.dialog);
    this.scene.events.once('shutdown', () => this.destroy());
  }

  open() {
    if (!this.dialog.open) {
      this.previousFocus = document.activeElement;
      this.keyboardEnabled = this.scene.input.keyboard?.enabled;
      if (this.scene.input.keyboard) this.scene.input.keyboard.enabled = false;
      this.dialog.showModal();
    }
  }

  shell(title, subtitle) {
    this.dialog.replaceChildren();
    const header = el('header', 'checkpoint-header');
    const identity = el('div', 'checkpoint-identity');
    identity.append(el('span', 'checkpoint-crest', '♛'));
    const headings = el('div', '');
    headings.append(el('span', 'checkpoint-eyebrow', 'CYE ACADEMY'), el('h1', '', title));
    identity.append(headings);
    this.clock = el('div', 'checkpoint-clock');
    this.clock.append(el('span', '', 'TIME LEFT'));
    this.seconds = el('strong', '', '60s');
    this.clock.append(this.seconds);
    header.append(identity, this.clock);
    this.meter = el('progress', 'checkpoint-meter');
    this.meter.max = 60000;
    this.meter.value = 60000;
    this.meter.setAttribute('aria-label', 'Answer time remaining');
    const intro = el('div', 'checkpoint-intro');
    intro.append(el('span', 'checkpoint-paused', 'Ⅱ RUN PAUSED'), el('span', '', subtitle));
    this.content = el('div', 'checkpoint-content');
    this.dialog.append(header, this.meter, intro, this.content);
    this.dialog.removeAttribute('data-urgent');
  }

  showQuestion(question, onSubmit, { title = 'Learning checkpoint', subtitle = 'Start with 60 seconds. Add more time whenever you need.', onExtend, onReview, getTotalTime } = {}) {
    this.shell(title, subtitle);
    this.question = question;
    this.selected = null;
    this.finished = false;
    this.expired = false;
    this.getTotalTime = getTotalTime;
    const topic = el('p', 'checkpoint-topic', question.topic || 'MATHEMATICS');
    const prompt = el('h2', 'checkpoint-question');
    appendMatrixMath(prompt, question.question);
    const form = el('form', 'checkpoint-form');
    const choices = el('fieldset', 'checkpoint-choices');
    choices.append(el('legend', 'checkpoint-legend', question.type === 'matrixRepair' ? 'Enter the missing value' : 'Choose one answer'));
    if (question.type === 'matrixRepair') {
      this.answerInput = el('input', 'checkpoint-input');
      this.answerInput.type = 'text';
      this.answerInput.inputMode = 'none';
      this.answerInput.readOnly = true;
      this.answerInput.setAttribute('aria-label', 'Missing matrix value');
      this.answerInput.placeholder = 'Tap the numbers below';
      const keypad = el('div', 'checkpoint-keypad');
      keypad.setAttribute('role', 'group');
      keypad.setAttribute('aria-label', 'Number keypad');
      const applyKey = key => {
        if (this.finished) return;
        this.answerInput.value = editNumber(this.answerInput.value, key);
        this.selected = this.answerInput.value;
        this.submitButton.disabled = this.expired || !/^-?\d+$/.test(this.selected);
      };
      for (const key of ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'minus', '0', 'backspace']) {
        const button = el('button', 'checkpoint-key', key === 'minus' ? '− / +' : key === 'backspace' ? '⌫' : key);
        button.type = 'button';
        button.setAttribute('aria-label', key === 'minus' ? 'Toggle minus sign' : key === 'backspace' ? 'Delete last digit' : key);
        button.addEventListener('click', () => applyKey(key));
        keypad.append(button);
      }
      this.answerInput.addEventListener('keydown', event => {
        const key = /^\d$/.test(event.key) ? event.key : event.key === '-' ? 'minus' : event.key === 'Backspace' ? 'backspace' : null;
        if (key) { event.preventDefault(); applyKey(key); }
      });
      choices.append(this.answerInput, keypad);
    } else {
      question.options.forEach((answer, index) => {
        const label = el('label', 'checkpoint-option');
        const input = el('input', '');
        input.type = 'radio'; input.name = 'checkpoint-answer'; input.value = String(index);
        const letter = el('span', 'checkpoint-letter', String.fromCharCode(65 + index));
        const text = el('span', 'checkpoint-answer');
        appendMatrixMath(text, answer);
        input.addEventListener('change', () => {
          this.selected = index;
          this.submitButton.disabled = this.expired;
        });
        label.append(input, letter, text);
        choices.append(label);
      });
    }
    const footer = el('footer', 'checkpoint-footer');
    footer.append(el('span', 'checkpoint-note', 'Your run stays paused until you continue.'));
    this.submitButton = el('button', 'checkpoint-primary', 'CONFIRM ANSWER →');
    this.submitButton.type = 'submit'; this.submitButton.disabled = true;
    footer.append(this.submitButton);
    form.append(choices, footer);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!this.finished && this.selected !== null) onSubmit(this.selected);
    });
    const timeHelp = el('div', 'checkpoint-time-help');
    this.timeNotice = el('span', '', 'Need a little longer? Add 30 seconds as often as you like.');
    this.timeNotice.setAttribute('role', 'status');
    const more = el('button', 'checkpoint-extra', '+30s · ADD TIME');
    more.type = 'button';
    more.addEventListener('click', () => {
      const remaining = onExtend?.();
      if (remaining !== false && remaining !== undefined) this.updateTimer(remaining);
    });
    this.reviewButton = el('button', 'checkpoint-review', 'REVIEW ANSWER');
    this.reviewButton.type = 'button';
    this.reviewButton.hidden = true;
    this.reviewButton.addEventListener('click', () => onReview?.());
    timeHelp.append(this.timeNotice, more, this.reviewButton);
    this.content.append(timeHelp, topic, prompt, form);
    this.open();
  }

  updateTimer(remaining) {
    if (this.finished) return;
    this.seconds.textContent = `${Math.ceil(remaining / 1000)}s`;
    this.meter.max = this.getTotalTime?.() || 60000;
    this.meter.value = remaining;
    const expired = remaining === 0;
    if (expired !== this.expired) {
      this.expired = expired;
      this.timeNotice.textContent = expired ? 'Time is up. Add 30 seconds to keep thinking, or review the answer.' : 'Need a little longer? Add 30 seconds as often as you like.';
      this.reviewButton.hidden = !expired;
      const valid = this.question.type === 'matrixRepair' ? /^-?\d+$/.test(String(this.selected)) : Number.isInteger(this.selected);
      this.submitButton.disabled = expired || !valid;
    }
    this.dialog.dataset.urgent = String(remaining <= 10000);
  }

  showResult(result, onContinue, { timedOut = false, continueLabel = 'CONTINUE RUN →' } = {}) {
    this.finished = true;
    this.shell(timedOut ? 'Time to review' : result.correct ? 'Nicely solved!' : 'Let’s work it out',
      timedOut ? 'Review the method, then continue when you are ready.' : 'A little practice, a little more confidence.');
    this.clock.hidden = true;
    this.meter.hidden = true;
    const status = el('p', `checkpoint-result ${result.correct ? 'is-correct' : ''}`, timedOut ? 'TIME’S UP' : result.correct ? '✓ CORRECT ANSWER' : 'KEEP LEARNING');
    status.setAttribute('role', 'status');
    this.content.append(status);
    if (this.question) {
      const prompt = el('p', 'checkpoint-review-question');
      appendMatrixMath(prompt, this.question.question);
      this.content.append(prompt);
    }
    const answer = el('div', 'checkpoint-solution');
    answer.append(el('span', 'checkpoint-eyebrow', 'CORRECT ANSWER'));
    const value = el('strong', ''); appendMatrixMath(value, result.correctAnswer || ''); answer.append(value);
    this.content.append(answer);
    if (!result.correct) {
      const chosen = el('p', 'checkpoint-chosen');
      appendMatrixMath(chosen, `Your answer: ${timedOut ? 'No answer before the deadline' : result.selectedAnswer ?? 'No answer'}`);
      this.content.append(chosen);
    }
    const explanation = el('div', 'checkpoint-explanation');
    explanation.append(el('h2', '', 'The method'));
    const text = el('p', ''); appendMatrixMath(text, result.explanation || result.hint || 'Review the rule and try the next question.');
    explanation.append(text); this.content.append(explanation);
    const button = el('button', 'checkpoint-primary checkpoint-continue', continueLabel);
    button.type = 'button';
    button.addEventListener('click', () => {
      if (button.disabled) return;
      button.disabled = true;
      this.hideFeedback();
      onContinue?.();
    });
    this.content.append(button);
    this.open();
    button.focus();
  }

  showWrongAnswer(result, onContinue) { this.showResult(result, onContinue); }

  hideFeedback() {
    if (!this.dialog?.open) return;
    this.dialog.close();
    if (this.scene.input.keyboard) this.scene.input.keyboard.enabled = this.keyboardEnabled;
    this.previousFocus?.focus?.();
  }

  destroy() {
    this.hideFeedback();
    this.dialog?.remove();
  }
}
