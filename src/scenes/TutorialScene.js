import Phaser from 'phaser';
import { saveSetting } from '../utils/Storage.js';
import { isTouchDevice } from '../utils/DeviceUtils.js';
import audioManager from '../utils/AudioManager.js';
import PortraitScreen, { mobileElement, mobileButton } from '../ui/PortraitScreen.js';

const PAGES = [
    {
        kicker: 'MOVEMENT',
        title: 'RUN YOUR LANE',
        body: 'Move between three lanes, jump over low barriers, and slide under high obstacles.',
        tips: ['← / →  Change lane', '↑ or SPACE  Jump', '↓  Slide'],
        touchTips: ['Tap ◀ / ▶ or swipe sideways', 'Tap ▲ or swipe up to jump', 'Tap ▼ or swipe down to slide'],
        color: 0x00ffff
    },
    {
        kicker: 'OBSTACLES',
        title: 'READ THE WARNING',
        body: 'Obstacles arrive in short patterns. Read the lane warnings, find an open lane, and use the quiet beat before each maths gate.',
        tips: ['JUMP warning → jump', 'SLIDE warning → slide', 'Two blocked lanes → move to the open lane'],
        color: 0xffcc00
    },
    {
        kicker: 'MATHEMATICS',
        title: 'SOLVE, THEN CHOOSE',
        body: 'The run pauses while you calculate. Move into the lane containing the correct answer before the gates arrive.',
        tips: ['Read during calculation time', 'Choose the answer lane', 'Correct answers build combos'],
        color: 0x00ff88
    },
    {
        kicker: 'LEARNING',
        title: 'MISTAKES HELP YOU IMPROVE',
        body: 'Wrong answers open an explanation panel. Your chapter mastery remembers progress and adapts future questions.',
        tips: ['Review the worked explanation', 'Retry weak questions later', 'Use Chapter Practice for focused learning'],
        color: 0xff6688
    },
    {
        kicker: 'BOSSES',
        title: 'MASTER EACH CHAPTER',
        body: 'Chapter bosses use their own question pools, attacks, and phases. Correct answers damage the boss.',
        tips: ['Build accuracy before a boss', 'Learn from every missed attack', 'Defeat all eight chapter guardians'],
        color: 0xff00ff
    }
];

export default class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialScene' });
    }

    init(data) {
        this.nextScene = data.nextScene || 'ModeSelectScene';
        this.replay = Boolean(data.replay);
        this.pageIndex = 0;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.add.image(width / 2, height / 2, 'bg-layer-1').setDisplaySize(width, height).setAlpha(0.45);
        this.add.rectangle(width / 2, height / 2, width, height, 0x030614, 0.78);

        this.add.text(width / 2, 48, 'PILOT TRAINING', {
            fontSize: '34px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.pageCounter = this.add.text(width / 2, 88, '', {
            fontSize: '15px', fontFamily: "'Rajdhani', sans-serif", color: '#88ccff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.content = this.add.container(0, 0);
        this.previousButton = this.createButton(280, 650, '◀ PREVIOUS', () => this.changePage(-1));
        this.nextButton = this.createButton(1000, 650, 'NEXT ▶', () => this.changePage(1));
        this.createButton(640, 650, this.replay ? 'BACK TO MENU' : 'SKIP TRAINING', () => this.finish());

        this.input.keyboard.on('keydown-LEFT', () => this.changePage(-1));
        this.input.keyboard.on('keydown-RIGHT', () => this.changePage(1));
        this.input.keyboard.on('keydown-ENTER', () => this.pageIndex === PAGES.length - 1 ? this.finish() : this.changePage(1));
        this.portrait = new PortraitScreen(this, 'PILOT TRAINING', 'Learn the controls before you run');
        this.renderPage();
    }

    renderPage() {
        this.content.removeAll(true);
        const page = PAGES[this.pageIndex];
        this.pageCounter.setText(`${this.pageIndex + 1} / ${PAGES.length}`);

        const card = this.add.rectangle(640, 350, 980, 480, 0x08122c, 0.96)
            .setStrokeStyle(3, page.color, 0.9);
        const kicker = this.add.text(640, 145, page.kicker, {
            fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: Phaser.Display.Color.IntegerToColor(page.color).rgba,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        const title = this.add.text(640, 195, page.title, {
            fontSize: '36px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        const body = this.add.text(640, 265, page.body, {
            fontSize: '22px', fontFamily: "'Rajdhani', sans-serif", color: '#dcecff', align: 'center',
            lineSpacing: 5, wordWrap: { width: 800 }
        }).setOrigin(0.5);
        const tips = isTouchDevice() && page.touchTips ? page.touchTips : page.tips;
        const tipObjects = tips.map((tip, index) => {
            const y = 365 + index * 60;
            const marker = this.add.circle(300, y, 14, page.color, 0.85);
            const number = this.add.text(300, y, String(index + 1), {
                fontSize: '14px', fontFamily: "'Orbitron', sans-serif", color: '#04101d', fontStyle: 'bold'
            }).setOrigin(0.5);
            const text = this.add.text(335, y, tip, {
                fontSize: '20px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            return [marker, number, text];
        }).flat();
        this.content.add([card, kicker, title, body, ...tipObjects]);

        this.previousButton.setAlpha(this.pageIndex === 0 ? 0.3 : 1);
        this.nextButton.list[1].setText(this.pageIndex === PAGES.length - 1 ? 'START PLAYING ▶' : 'NEXT ▶');

        this.portrait.setHeader('PILOT TRAINING', `${this.pageIndex + 1} / ${PAGES.length} • ${page.kicker}`);
        this.portrait.clear();
        const portraitCard = mobileElement('div', 'portrait-card');
        portraitCard.append(mobileElement('h2', '', page.title), mobileElement('p', '', page.body));
        const portraitTips = isTouchDevice() && page.touchTips ? page.touchTips : page.tips;
        portraitTips.forEach(tip => portraitCard.append(mobileElement('p', '', `• ${tip}`)));
        this.portrait.content.append(portraitCard);
        const previous = mobileButton('◀ PREVIOUS', () => this.changePage(-1), 'portrait-back');
        previous.disabled = this.pageIndex === 0;
        this.portrait.footer.append(previous,
            mobileButton(this.pageIndex === PAGES.length - 1 ? 'START PLAYING ▶' : 'NEXT ▶',
                () => this.changePage(1)));
        this.portrait.content.append(mobileButton(this.replay ? 'BACK TO MENU' : 'SKIP TRAINING', () => this.finish(), 'portrait-back'));
    }

    changePage(direction) {
        const next = this.pageIndex + direction;
        if (next < 0) return;
        if (next >= PAGES.length) {
            this.finish();
            return;
        }
        audioManager.playClick();
        this.pageIndex = next;
        this.renderPage();
    }

    finish() {
        audioManager.playClick();
        saveSetting('tutorialComplete', true);
        this.scene.start(this.nextScene);
    }

    createButton(x, y, label, onClick) {
        const container = this.add.container(x, y);
        const background = this.add.image(0, 0, 'button').setInteractive({ useHandCursor: true });
        const text = this.add.text(0, 0, label, {
            fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        background.on('pointerdown', () => {
            onClick();
        });
        container.add([background, text]);
        return container;
    }
}
