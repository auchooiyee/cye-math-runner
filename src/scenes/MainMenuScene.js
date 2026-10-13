import Phaser from 'phaser';
import { getLanguage, saveLanguage, getPlayerName, hasPlayerName, savePlayerName, getSetting } from '../utils/Storage.js';
import audioManager from '../utils/AudioManager.js';
import { showPlayerNameDialog } from '../ui/PlayerNameDialog.js';
import { mobileElement, mobileButton } from '../ui/PortraitScreen.js';
import { ACADEMY_LOCATIONS, ACADEMY_STORY } from '../config/academy.js';
import '../ui/academy.css';

export default class MainMenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MainMenuScene' }); }

    create() {
        const bm = getLanguage() === 'bm';
        const story = ACADEMY_STORY[bm ? 'bm' : 'en'];
        const root = mobileElement('main', 'academy-menu');
        root.setAttribute('aria-label', 'CYE Math Runner');
        const hero = mobileElement('section', 'academy-hero');
        const image = document.createElement('img');
        image.src = 'assets/academy/cover.webp';
        image.alt = 'CYE Math Runner: a brown-haired student in a blue and white hoodie running through the academy.';
        image.className = 'academy-cover';
        const caption = mobileElement('div', 'academy-caption');
        caption.append(mobileElement('span', 'academy-kicker', bm ? 'SELAMAT DATANG KE AKADEMI CYE' : 'WELCOME TO CYE ACADEMY'), mobileElement('h1', '', story.motto));
        hero.append(image, caption);
        const panel = mobileElement('section', 'academy-panel');
        panel.append(mobileElement('p', 'academy-kicker', story.eyebrow), mobileElement('h2', '', story.title), mobileElement('p', 'academy-intro', story.intro));
        let nameButton;
        const nameLabel = () => `${bm ? 'PELARI' : 'RUNNER'}: ${hasPlayerName() ? getPlayerName() : (bm ? 'Pilih nama samaran' : 'Choose a nickname')}`;
        const chooseName = (next, editing = false) => showPlayerNameDialog(this, name => {
            savePlayerName(name); nameButton.textContent = nameLabel(); next?.();
        }, editing && hasPlayerName() ? getPlayerName() : '');
        const withName = next => hasPlayerName() ? next() : chooseName(next);
        const nav = mobileElement('nav', 'academy-actions');
        const action = (label, detail, onClick, primary = false) => {
            const button = mobileButton('', () => { audioManager.playClick(); onClick(); }, `academy-action ${primary ? 'academy-primary' : ''}`);
            button.append(mobileElement('strong', '', label), mobileElement('span', '', detail));
            nav.append(button);
        };
        action(bm ? 'MULA BERLARI' : 'LET’S RUN', bm ? 'Larian • Sprint SPM • Latihan' : 'Endless run • SPM sprint • Chapter practice', () => withName(() => {
            if (getSetting('tutorialComplete', false)) this.scene.start('ModeSelectScene');
            else this.scene.start('TutorialScene', { nextScene: 'ModeSelectScene' });
        }), true);
        action(bm ? 'PENGUASAAN BAB' : 'MY LEARNING', bm ? 'Penguasaan bab dan topik' : 'Chapter mastery & skills to practise', () => withName(() => this.scene.start('MasteryScene')));
        action(bm ? 'PAPAN PENDAHULU' : 'LEADERBOARD', bm ? 'Raikan usaha setiap pelari' : 'Celebrate the effort. Go a little further.', () => this.scene.start('LeaderboardScene'));
        action(bm ? 'LAPORAN KEMAJUAN' : 'PROGRESS REPORT', bm ? 'Lihat perkembangan anda' : 'See how your confidence is growing', () => this.scene.start('ProgressReportScene'));
        panel.append(nav);
        const links = mobileElement('div', 'academy-links');
        links.append(mobileButton(bm ? 'Kenali Akademi' : 'Meet the Academy', () => this.showAcademy(bm), 'academy-link'), mobileButton(bm ? 'Cara bermain' : 'How to play', () => this.scene.start('TutorialScene', { nextScene: 'MainMenuScene', replay: true }), 'academy-link'));
        panel.append(links);
        const footer = mobileElement('footer', 'academy-settings');
        nameButton = mobileButton(nameLabel(), () => chooseName(null, true), 'academy-name');
        const soundLabel = () => audioManager.isMuted ? (bm ? 'Bunyi: Mati' : 'Sound: Off') : (bm ? 'Bunyi: Hidup' : 'Sound: On');
        const sound = mobileButton(soundLabel(), () => { audioManager.toggleMute(); sound.textContent = soundLabel(); }, 'academy-small');
        footer.append(nameButton, sound, mobileButton('EN / BM', () => { saveLanguage(bm ? 'en' : 'bm'); this.scene.restart(); }, 'academy-small'));
        panel.append(footer, mobileElement('p', 'academy-footnote', 'KSSM FORM 5 · SPM FINAL RUN'));
        root.append(hero, panel);
        document.body.append(root);
        this.input.enabled = false;
        this.events.once('shutdown', () => { this.input.enabled = true; root.remove(); this.academyDialog?.remove(); });
    }

    showAcademy(bm) {
        const story = ACADEMY_STORY[bm ? 'bm' : 'en'];
        const dialog = document.createElement('dialog');
        dialog.className = 'academy-dialog';
        dialog.setAttribute('aria-labelledby', 'academy-story-title');
        const close = mobileButton(bm ? 'Kembali ke menu ×' : 'Back to menu ×', () => dialog.close(), 'academy-close');
        const title = mobileElement('h2', '', story.runner); title.id = 'academy-story-title';
        const intro = mobileElement('div', 'academy-profile');
        const portrait = document.createElement('img'); portrait.src = 'assets/academy/runner.webp'; portrait.alt = 'Kai, CYE Academy Runner';
        const bio = mobileElement('div'); bio.append(title, mobileElement('p', '', story.bio), mobileElement('h3', '', story.guide), mobileElement('p', '', story.guardians));
        intro.append(portrait, bio);
        const route = mobileElement('div', 'academy-route');
        const zones = this.cache.json.get('zones');
        ACADEMY_LOCATIONS.forEach((place, i) => {
            const card = mobileElement('article', 'academy-route-card');
            const photo = document.createElement('img'); photo.src = `assets/academy/${place.artKey}.webp`; photo.alt = ''; photo.loading = 'lazy';
            const copy = mobileElement('div');
            copy.append(mobileElement('span', 'academy-kicker', `${String(i + 1).padStart(2, '0')} / ${bm ? zones[i].chapterBm : zones[i].chapter}`), mobileElement('h3', '', bm ? place.locationBm : place.locationEn), mobileElement('p', '', place.guardian));
            card.append(photo, copy); route.append(card);
        });
        dialog.append(close, intro, mobileElement('h2', '', story.journey), route, mobileElement('p', 'academy-story-note', story.note));
        dialog.addEventListener('close', () => dialog.remove(), { once: true });
        document.body.append(dialog); this.academyDialog = dialog; dialog.showModal();
    }
}
