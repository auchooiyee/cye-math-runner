import { mobileButton, mobileElement } from './PortraitScreen.js';
import { appendMatrixMath } from '../utils/MathFormatter.js';

export default class PortraitRunnerUI {
    constructor({ onLeft, onRight, onJump, onSlide, onPause, onLane, onQuit }) {
        this.onLane = onLane;
        this.onPause = onPause;
        this.onQuit = onQuit;
        this.root = mobileElement('section', 'portrait-runner');
        this.root.setAttribute('aria-label', 'Portrait runner controls');
        this.hud = mobileElement('div', 'portrait-runner-hud');
        this.distance = this.stat('DISTANCE', '0m');
        this.shields = this.stat('SHIELDS', '3');
        this.score = this.stat('SCORE', '0');
        this.progress = mobileElement('div', 'portrait-runner-progress', 'ZONE 01');
        this.hud.append(this.distance.parentElement, this.shields.parentElement, this.score.parentElement, this.progress);

        this.pauseButton = mobileButton('Ⅱ PAUSE', onPause, 'portrait-pause');
        this.controls = mobileElement('div', 'portrait-runner-controls');
        [['◀ LEFT', onLeft], ['RIGHT ▶', onRight], ['▲ JUMP', onJump], ['▼ SLIDE', onSlide]].forEach(([label, action]) => {
            this.controls.append(mobileButton(label, action));
        });

        this.gate = mobileElement('div', 'portrait-runner-gate');
        this.gate.hidden = true;
        this.gateQuestion = mobileElement('h2');
        this.gatePrompt = mobileElement('p', '', 'Read the question, then choose an answer lane.');
        this.gateChoices = mobileElement('div', 'portrait-runner-choices');
        this.gate.append(this.gateQuestion, this.gatePrompt, this.gateChoices);

        this.modal = mobileElement('div', 'portrait-runner-modal');
        this.modal.hidden = true;
        this.root.append(this.hud, this.pauseButton, this.controls, this.gate, this.modal);
        document.body.append(this.root);
        this.media = window.matchMedia('(orientation: portrait) and (max-width: 900px)');
    }

    stat(label, value) {
        const cell = mobileElement('div');
        const number = mobileElement('strong', '', value);
        cell.append(mobileElement('span', '', label), number);
        return number;
    }

    isActive() {
        return this.media.matches;
    }

    updateHud({ distance, shields, score, progress }) {
        this.distance.textContent = `${Math.floor(distance)}m`;
        this.shields.textContent = String(shields);
        this.score.textContent = String(score);
        this.progress.textContent = progress;
    }

    showGate(question, options, selectedLane) {
        this.gate.hidden = false;
        this.gateQuestion.replaceChildren();
        appendMatrixMath(this.gateQuestion, question);
        this.gatePrompt.textContent = 'CALCULATION TIME • tap the answer lane before the gates arrive';
        this.gateChoices.replaceChildren();
        options.forEach((option, lane) => {
            const button = mobileButton('', () => this.onLane(lane));
            appendMatrixMath(button, `${['LEFT', 'CENTER', 'RIGHT'][lane]}  •  ${option}`);
            button.setAttribute('aria-pressed', String(lane === selectedLane));
            this.gateChoices.append(button);
        });
    }

    updateGate(calculating, selectedLane) {
        if (this.gate.hidden) return;
        this.gatePrompt.textContent = calculating
            ? 'CALCULATION TIME • choose an answer lane'
            : 'GATES DESCENDING • confirm your answer lane';
        [...this.gateChoices.children].forEach((button, lane) => {
            button.setAttribute('aria-pressed', String(lane === selectedLane));
        });
    }

    hideGate() {
        this.gate.hidden = true;
    }

    showWrongFeedback({ selectedAnswer, correctAnswer, hint, explanation }, onContinue, forceVisible = false) {
        this.root.dataset.modal = forceVisible ? 'true' : 'false';
        this.showModal('LET’S LEARN FROM THIS ONE', [
            `YOUR ANSWER: ${selectedAnswer ?? 'No answer'}`,
            `CORRECT ANSWER: ${correctAnswer ?? ''}`,
            `HINT: ${hint || 'Identify the rule before calculating.'}`,
            `WHY: ${explanation || 'Review the method and try the next gate.'}`
        ], [['CONTINUE ▶', onContinue]]);
    }

    showPause(forceVisible = false) {
        this.root.dataset.modal = forceVisible ? 'true' : 'false';
        this.showModal('SYSTEM PAUSED', ['Take a breath, then resume your run.'], [
            ['RESUME RUN ▶', this.onPause],
            ['ABORT RUN', this.onQuit]
        ]);
    }

    showModal(title, lines, actions) {
        this.modal.replaceChildren();
        this.modal.hidden = false;
        this.pauseButton.hidden = true;
        this.controls.hidden = true;
        this.gate.style.visibility = 'hidden';
        this.modal.append(mobileElement('h2', '', title));
        lines.forEach(line => {
            const paragraph = mobileElement('p');
            appendMatrixMath(paragraph, line);
            this.modal.append(paragraph);
        });
        actions.forEach(([label, action]) => this.modal.append(mobileButton(label, action)));
    }

    hideModal() {
        this.root.dataset.modal = 'false';
        this.modal.hidden = true;
        this.pauseButton.hidden = false;
        this.controls.hidden = false;
        this.gate.style.visibility = '';
    }

    destroy() {
        this.root.remove();
    }
}
