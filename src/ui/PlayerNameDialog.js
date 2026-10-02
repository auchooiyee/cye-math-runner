const IDEAS = ['MathFox', 'NumberNinja', 'AlgebraStar', 'PuzzlePilot', 'MathComet'];

export function cleanNickname(value) {
    const name = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
    if (Array.from(name).length < 1 || Array.from(name).length > 20) return null;
    return /^[\p{L}\p{N}_ -]+$/u.test(name) ? name : null;
}

function suggestNickname() {
    const idea = IDEAS[Math.floor(Math.random() * IDEAS.length)];
    return `${idea}${Math.floor(100 + Math.random() * 900)}`;
}

function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
}

export function showPlayerNameDialog(scene, onSave, currentName = '') {
    const dialog = node('dialog', 'player-name-dialog');
    dialog.setAttribute('aria-labelledby', 'player-name-title');
    const title = node('h2', '', currentName ? 'CHANGE YOUR NICKNAME' : 'CHOOSE YOUR NICKNAME');
    title.id = 'player-name-title';
    const intro = node('p', '', 'No typing needed! Use this nickname, or type your own.');
    const privacy = node('p', 'player-name-note', 'Use a nickname, not your real name. Your nickname can appear on the public leaderboard after a run.');
    const progressNote = node('p', 'player-name-note', 'Progress is saved on this device. Changing nickname does not create a separate profile.');
    const suggestion = node('strong', 'player-name-suggestion');
    let proposed = suggestNickname();
    suggestion.textContent = proposed;
    const useSuggested = node('button', 'player-name-primary', 'USE THIS NICKNAME');
    useSuggested.type = 'button';
    const another = node('button', '', 'SHOW ANOTHER');
    another.type = 'button';
    const label = node('label', '', 'Or type your own nickname');
    label.htmlFor = 'player-name-input';
    const input = node('input', 'player-name-input');
    input.id = 'player-name-input';
    input.type = 'text';
    input.maxLength = 20;
    input.autocomplete = 'off';
    input.placeholder = 'e.g. NumberNinja';
    input.value = currentName;
    const saveTyped = node('button', '', 'SAVE TYPED NICKNAME');
    saveTyped.type = 'button';
    const error = node('p', 'player-name-error');
    error.setAttribute('role', 'alert');
    const cancel = node('button', 'player-name-cancel', 'BACK TO MENU');
    cancel.type = 'button';

    const previousInputEnabled = scene.input.enabled;
    let closed = false;
    const cleanup = () => {
        if (closed) return;
        closed = true;
        scene.events.off('shutdown', cleanup);
        scene.input.enabled = previousInputEnabled;
        if (dialog.open) dialog.close();
        dialog.remove();
    };
    const commit = (name) => {
        const cleaned = cleanNickname(name);
        if (!cleaned) {
            error.textContent = 'Use 1–20 letters, numbers, spaces, _ or -.';
            input.focus();
            return;
        }
        cleanup();
        onSave(cleaned);
    };

    useSuggested.addEventListener('click', () => commit(proposed));
    another.addEventListener('click', () => {
        const previous = proposed;
        for (let attempts = 0; attempts < 5 && proposed === previous; attempts++) proposed = suggestNickname();
        if (proposed === previous) proposed = `${IDEAS[(IDEAS.findIndex(idea => previous.startsWith(idea)) + 1) % IDEAS.length]}${previous.slice(-3)}`;
        suggestion.textContent = proposed;
    });
    saveTyped.addEventListener('click', () => commit(input.value));
    input.addEventListener('input', () => { error.textContent = ''; });
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            commit(input.value);
        }
    });
    cancel.addEventListener('click', cleanup);
    dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        cleanup();
    });
    dialog.append(title, intro, privacy, progressNote, suggestion, useSuggested, another, label, input, saveTyped, error, cancel);
    document.body.append(dialog);
    scene.events.once('shutdown', cleanup);
    scene.input.enabled = false;
    dialog.showModal();
    useSuggested.focus();
}
