import { appendMatrixMath } from '../utils/MathFormatter.js';

function element(tag, className, text = '') {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
}

export default class PortraitBossOverlay {
    constructor({ scene, name, description, totalHp, onAnswer }) {
        this.scene = scene;
        this.totalHp = totalHp;
        this.onAnswer = onAnswer;
        this.media = window.matchMedia('(orientation: portrait) and (max-width: 900px)');
        this.root = element('section', 'boss-mobile-overlay');
        this.root.setAttribute('aria-label', `${name} boss fight`);

        this.title = element('h1', '', name.toUpperCase());
        this.subtitle = element('p', 'boss-mobile-subtitle', description);
        this.hpLabel = element('p', 'boss-mobile-hp-label');
        const hpBar = element('div', 'boss-mobile-hp');
        this.hpFill = element('div', 'boss-mobile-hp-fill');
        hpBar.append(this.hpFill);

        this.questionCard = element('div', 'boss-mobile-card');
        this.question = element('h2', '');
        this.answerDisplay = element('p', 'boss-mobile-answer');
        this.controls = element('div', '');
        this.status = element('p', 'boss-mobile-hp-label');
        this.questionCard.append(this.question, this.answerDisplay, this.controls, this.status);

        this.modal = element('div', 'boss-mobile-card boss-mobile-feedback');
        this.modal.hidden = true;
        this.root.append(this.title, this.subtitle, this.hpLabel, hpBar, this.questionCard, this.modal, element('div', 'boss-mobile-spacer'));
        document.body.append(this.root);
        this.syncCanvasInput = () => { this.scene.input.enabled = !(this.media.matches || this.root.dataset.modal === 'true'); };
        this.syncCanvasInput();
        this.media.addEventListener('change', this.syncCanvasInput);
        this.setHp(totalHp);
    }

    isActive() {
        return this.media.matches;
    }

    setHp(remaining) {
        this.hpLabel.textContent = `BOSS HP: ${remaining} / ${this.totalHp}`;
        this.hpFill.style.width = `${Math.max(0, remaining / this.totalHp) * 100}%`;
    }

    setQuestion(question) {
        this.root.dataset.modal = 'false';
        this.syncCanvasInput();
        this.modal.hidden = true;
        this.questionCard.hidden = false;
        this.question.replaceChildren();
        appendMatrixMath(this.question, question.question);
        this.status.textContent = '';
        this.controls.replaceChildren();
        this.answerDisplay.textContent = '';

        if (question.type === 'matrixRepair') {
            this.answerDisplay.textContent = 'MISSING ENTRY: _';
            const keys = element('div', 'boss-mobile-keys');
            let input = '';
            for (const key of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '−', '⌫']) {
                const button = element('button', '', key);
                button.type = 'button';
                button.setAttribute('aria-label', key === '−' ? 'minus' : key === '⌫' ? 'backspace' : key);
                button.addEventListener('click', () => {
                    if (key === '⌫') input = input.slice(0, -1);
                    else if (key === '−') {
                        if (!input) input = '-';
                    } else if (input.replace('-', '').length < 3) input += key;
                    this.answerDisplay.textContent = `MISSING ENTRY: ${input || '_'}`;
                });
                keys.append(button);
            }
            const submit = element('button', 'boss-mobile-submit', 'REPAIR MATRIX ▶');
            submit.type = 'button';
            submit.addEventListener('click', () => {
                if (/^-?\d+$/.test(input)) this.onAnswer(input);
            });
            this.controls.append(keys, submit);
        } else {
            this.answerDisplay.hidden = true;
            const options = element('div', 'boss-mobile-options');
            question.options.forEach((option, index) => {
                const button = element('button', '', option);
                button.type = 'button';
                button.addEventListener('click', () => this.onAnswer(index));
                options.append(button);
            });
            this.controls.append(options);
        }
        this.answerDisplay.hidden = question.type !== 'matrixRepair';
    }

    lock(correct) {
        this.controls.querySelectorAll('button').forEach(button => { button.disabled = true; });
        this.status.textContent = correct ? 'CORRECT! BOSS HP DECREASED' : '';
    }

    showBriefing(onStart) {
        this.showModal('BOSS BRIEFING', [
            'Each correct answer removes one boss HP segment.',
            'A wrong answer triggers an attack and costs a shield.',
            'The boss speeds up as its HP gets low.'
        ], 'START FIGHT ▶', onStart);
    }

    showWrongFeedback({ selectedAnswer, correctAnswer, hint, explanation }, onContinue, forceVisible = false) {
        this.root.dataset.modal = forceVisible ? 'true' : 'false';
        this.syncCanvasInput();
        this.showModal('LET’S LEARN FROM THIS ONE', [
            `YOUR ANSWER: ${selectedAnswer ?? 'No answer'}`,
            `CORRECT ANSWER: ${correctAnswer ?? ''}`,
            `HINT: ${hint || 'Identify the rule before calculating.'}`,
            `WHY: ${explanation || 'Review the method and try the next question.'}`
        ], 'CONTINUE ▶', () => {
            this.root.dataset.modal = 'false';
            this.syncCanvasInput();
            onContinue();
        }, true);
    }

    showVictory() {
        this.controls.replaceChildren();
        this.question.textContent = 'BOSS DEFEATED!';
        this.answerDisplay.hidden = true;
        this.status.textContent = 'Excellent work — returning to results.';
    }

    hideBriefing() {
        this.root.dataset.modal = 'false';
        this.syncCanvasInput();
        this.modal.hidden = true;
        this.questionCard.hidden = false;
    }

    showModal(title, lines, action, callback, colorAnswers = false) {
        this.questionCard.hidden = true;
        this.modal.replaceChildren();
        this.modal.hidden = false;
        this.modal.append(element('h2', '', title));
        lines.forEach((line, index) => {
            const className = colorAnswers ? (index === 0 ? 'boss-mobile-chosen' : index === 1 ? 'boss-mobile-correct' : '') : '';
            const paragraph = element('p', className);
            appendMatrixMath(paragraph, line);
            this.modal.append(paragraph);
        });
        const button = element('button', 'boss-mobile-submit', action);
        button.type = 'button';
        button.addEventListener('click', callback, { once: true });
        this.modal.append(button);
    }

    destroy() {
        this.media.removeEventListener('change', this.syncCanvasInput);
        this.scene.input.enabled = true;
        this.root.remove();
    }
}
