export function mobileElement(tag, className = '', value = '') {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = value;
    return node;
}

export function mobileButton(label, onClick, className = '') {
    const button = mobileElement('button', `portrait-button ${className}`.trim(), label);
    button.type = 'button';
    button.addEventListener('click', onClick);
    return button;
}

export default class PortraitScreen {
    constructor(scene, title, subtitle = '') {
        this.root = mobileElement('section', 'portrait-screen');
        this.root.setAttribute('aria-label', title);
        this.heading = mobileElement('h1', '', title);
        this.subtitle = mobileElement('p', 'portrait-subtitle', subtitle);
        this.content = mobileElement('div', 'portrait-content');
        this.footer = mobileElement('div', 'portrait-footer');
        const panel = mobileElement('div', 'academy-screen-panel');
        const brand = mobileElement('div', 'academy-screen-brand', '♛  CYE ACADEMY');
        panel.append(brand, this.heading, this.subtitle, this.content, this.footer);
        this.root.append(panel);
        document.body.append(this.root);
        // One responsive DOM screen handles all viewport sizes.
        scene.input.enabled = false;
        scene.events.once('shutdown', () => {
            scene.input.enabled = true;
            this.root.remove();
        });
    }

    setHeader(title, subtitle = '') {
        this.root.setAttribute('aria-label', title);
        this.heading.textContent = title;
        this.subtitle.textContent = subtitle;
    }

    clear() {
        this.content.replaceChildren();
        this.footer.replaceChildren();
    }

    addChoice(label, detail, onClick, disabled = false) {
        const item = mobileElement('div', 'portrait-choice');
        const button = mobileButton(label, onClick);
        button.disabled = disabled;
        item.append(button);
        if (detail) item.append(mobileElement('p', 'portrait-detail', detail));
        this.content.append(item);
        return button;
    }

    addBack(label, onClick) {
        this.footer.append(mobileButton(label, onClick, 'portrait-back'));
    }
}
