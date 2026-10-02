import Phaser from 'phaser';
import { saveScore, submitGlobalScore, getPlayerName, completeDailyChallenge, recordLearningRun } from '../utils/Storage.js';
import audioManager from '../utils/AudioManager.js';
import { appendMatrixMath, formatMatrixEquation, formatMatrixNotation } from '../utils/MathFormatter.js';
import PortraitScreen, { mobileElement, mobileButton } from '../ui/PortraitScreen.js';

export default class ResultsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultsScene' });
    }

    init(data) {
        this.stats = data || {};
        this.globalUploadStatus = null;
        this.globalUploadText = null;
        this.portraitUploadStatus = null;
        this.globalUploadRequest = null;
    }

    create() {
        this.cameras.main.setBackgroundColor('#05051a');
        const { width, height } = this.cameras.main;

        const isSprint = this.stats.isSprint;
        const mainTitle = this.stats.isBossTraining
            ? `BOSS TRAINING ${this.stats.finishReason === 'BOSS TRAINING COMPLETE' ? 'COMPLETE' : 'RESULT'}`
            : isSprint
            ? 'SPM SPRINT COMPLETED'
            : (this.stats.isPractice
                ? `${this.stats.practiceTopic ? `${this.stats.practiceTopic.toUpperCase()} FOCUS` : (this.stats.practiceChapterName || 'CHAPTER').toUpperCase()} PRACTICE COMPLETE`
                : 'MATH RUN COMPLETE');
        const titleColor = isSprint ? '#00ffff' : '#ffcc00';

        this.add.text(width / 2, 45, mainTitle, {
            fontSize: '36px', fontFamily: "'Orbitron', sans-serif", color: titleColor, fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        if (this.stats.finishReason) {
            this.add.text(width / 2, 85, this.stats.finishReason, {
                fontSize: '20px', fontFamily: "'Rajdhani', sans-serif", color: '#ffaa00', fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        // Layout
        if (isSprint && this.stats.spmGrade) {
            // Sprint Mode Layout: Grade on Left, Stats on Right
            const gradeInfo = this.stats.spmGrade;

            // Grade Box Container
            const gradeContainer = this.add.container(width / 2 - 250, 235);
            const boxBg = this.add.rectangle(0, 0, 220, 200, 0x0a142e, 0.95);
            boxBg.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(gradeInfo.color).color);

            const gradeTitle = this.add.text(0, -65, 'SPM GRADE', {
                fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);

            const gradeLetter = this.add.text(0, -10, gradeInfo.grade, {
                fontSize: '84px', fontFamily: "'Orbitron', sans-serif", color: gradeInfo.color, fontStyle: 'bold'
            }).setOrigin(0.5);

            const gradeDesc = this.add.text(0, 55, gradeInfo.label.toUpperCase(), {
                fontSize: '15px', fontFamily: "'Rajdhani', sans-serif", color: gradeInfo.color, fontStyle: 'bold'
            }).setOrigin(0.5);

            gradeContainer.add([boxBg, gradeTitle, gradeLetter, gradeDesc]);

            // Stats list on Right
            const rightX = width / 2 - 80;
            const startY = 130;
            const gap = 32;

            const timeStr = `${Math.floor(this.stats.timeElapsed / 60)}m ${this.stats.timeElapsed % 60}s`;
            this.add.text(rightX, startY, `Exam Time: ${timeStr}`, { fontSize: '22px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });
            this.add.text(rightX, startY + gap, `Questions: ${this.stats.questionsCorrect} / ${this.stats.questionsAttempted} (${this.stats.targetQuestions} target)`, { fontSize: '22px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });
            this.add.text(rightX, startY + gap * 2, `Accuracy: ${(this.stats.accuracy || 0).toFixed(1)}%`, { fontSize: '22px', fontFamily: "'Rajdhani', sans-serif", color: gradeInfo.color, fontStyle: 'bold' });
            this.add.text(rightX, startY + gap * 3, `Time Bonus: +${this.stats.timeBonus || 0} pts`, { fontSize: '22px', fontFamily: "'Rajdhani', sans-serif", color: '#ffd700', fontStyle: '600' });
            this.add.text(rightX, startY + gap * 4, `Best Combo: x${this.stats.bestCombo}`, { fontSize: '22px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });
            this.add.text(rightX, startY + gap * 5, `Distance Run: ${Math.floor(this.stats.distance)} m`, { fontSize: '22px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });

            this.add.text(width / 2, startY + gap * 7.4, `FINAL SPM SCORE: ${this.stats.finalScore}`, {
                fontSize: '36px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold',
                stroke: '#000000', strokeThickness: 4
            }).setOrigin(0.5);

        } else {
            // Endless Run Standard Layout
            const leftX = width / 2 - 200;
            const startY = 140;
            const gap = 36;

            this.add.text(leftX, startY, `Distance: ${Math.floor(this.stats.distance || 0)} m`, { fontSize: '24px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });
            this.add.text(leftX, startY + gap, `Questions: ${this.stats.questionsCorrect || 0} correct / ${this.stats.questionsAttempted || 0} total`, { fontSize: '24px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });
            this.add.text(leftX, startY + gap * 2, `Accuracy: ${(this.stats.accuracy || 0).toFixed(1)}%`, { fontSize: '24px', fontFamily: "'Rajdhani', sans-serif", color: '#00ff88', fontStyle: 'bold' });
            this.add.text(leftX, startY + gap * 3, `Best Combo: x${this.stats.bestCombo || 0}`, { fontSize: '24px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });
            this.add.text(leftX, startY + gap * 4, `Coins: ${this.stats.totalCoins || 0}`, { fontSize: '24px', fontFamily: "'Rajdhani', sans-serif", color: '#ffd700', fontStyle: '600' });
            this.add.text(leftX, startY + gap * 5, `Bosses Defeated: ${this.stats.bossesDefeated || 0}`, { fontSize: '24px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: '600' });

            this.add.text(width / 2, startY + gap * 7.2, `FINAL SCORE: ${this.stats.finalScore || 0}`, {
                fontSize: '38px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold',
                stroke: '#000000', strokeThickness: 4
            }).setOrigin(0.5);
        }

        // Auto-save score locally and sync to global leaderboard
        const playerName = Array.from((getPlayerName() || 'Player').trim().replace(/[^\p{L}\p{N}_ -]/gu, ''))
            .slice(0, 20).join('') || 'Player';
        const scorePayload = {
            name: playerName,
            score: this.stats.finalScore || 0,
            distance: Math.floor(this.stats.distance || 0),
            accuracy: this.stats.accuracy || 0,
            mode: this.stats.mode || 'endless',
            grade: this.stats.spmGrade ? this.stats.spmGrade.grade : null,
            date: new Date().toLocaleDateString()
        };
        saveScore(scorePayload);
        recordLearningRun(this.stats);
        if (!this.stats.isPractice && !this.stats.isBossTraining && scorePayload.score > 0) {
            const uploadRequest = Symbol('global-score-upload');
            this.globalUploadRequest = uploadRequest;
            this.globalUploadStatus = 'Uploading score to global leaderboard…';
            this.globalUploadText = this.add.text(width / 2, 111, this.globalUploadStatus, {
                fontSize: '16px', fontFamily: "'Rajdhani', sans-serif", color: '#88ccff', fontStyle: 'bold'
            }).setOrigin(0.5);
            submitGlobalScore(scorePayload).then(result => {
                if (!this.sys.isActive() || this.globalUploadRequest !== uploadRequest) return;
                this.globalUploadStatus = result?.success
                    ? (result.improved ? 'Global personal best saved' : 'Global personal best unchanged')
                    : 'Global upload failed — score saved on this device only';
                this.globalUploadText.setText(this.globalUploadStatus);
                this.globalUploadText.setColor(result?.success ? '#00ff88' : '#ff6688');
                if (this.portraitUploadStatus?.isConnected) {
                    this.portraitUploadStatus.textContent = this.globalUploadStatus;
                }
            });
        }
        let dailyStreak = 0;
        if (this.stats.dailyChallenge && this.stats.dailyChallengeKey && this.stats.questionsAttempted >= this.stats.targetQuestions) {
            dailyStreak = completeDailyChallenge(this.stats.dailyChallengeKey);
        }

        this.showNewRewards();
        if (this.stats.practiceTopic && this.stats.topicStats) {
            const before = this.stats.topicAccuracyBefore || 0;
            const after = this.stats.topicStats.accuracy || 0;
            const delta = after - before;
            this.add.text(width / 2, 455, `TOPIC ACCURACY: ${before}% → ${after}%  (${delta >= 0 ? '+' : ''}${delta} PTS)`, {
                fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: delta >= 0 ? '#00ff88' : '#ff6688', fontStyle: 'bold'
            }).setOrigin(0.5);
        }
        if (dailyStreak) {
            this.add.text(width / 2, 478, `🔥 DAILY CHALLENGE COMPLETE • ${dailyStreak}-DAY STREAK`, {
                fontSize: '17px', fontFamily: "'Orbitron', sans-serif", color: '#ff6688', fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        // Mistake review
        const mistakes = Array.isArray(this.stats.mistakes) ? this.stats.mistakes : [];
        if (mistakes.length > 0) {
            this.createButton(width / 2 - 175, height - 145, `REVIEW ${mistakes.length} MISTAKE${mistakes.length === 1 ? '' : 'S'}`, () => {
                this.showMistakeReview(mistakes);
            });
        }
        this.createButton(width / 2 + (mistakes.length > 0 ? 175 : 0), height - 145, 'CHAPTER MASTERY', () => {
            this.showMasteryProgress(this.stats.mastery || {});
        });

        // Buttons
        if (this.stats.isPractice && this.stats.practiceTopic) {
            this.createButton(width / 2 - 370, height - 75, 'PRACTISE TOPIC', () => {
                this.scene.start('GameScene', {
                    mode: 'practice',
                    practiceChapter: this.stats.practiceChapter,
                    practiceChapterName: this.stats.practiceChapterName,
                    practiceTopic: this.stats.practiceTopic,
                    targetQuestions: this.stats.targetQuestions || 10,
                    difficulty: { label: 'Adaptive', min: 1, max: 5 }
                });
            });
        }

        this.createButton(width / 2 + (this.stats.isPractice && this.stats.practiceTopic ? 0 : -170), height - 75, 'PLAY AGAIN', () => {
            this.scene.start('ModeSelectScene');
        });

        this.createButton(width / 2 + (this.stats.isPractice && this.stats.practiceTopic ? 370 : 170), height - 75, 'MAIN MENU', () => {
            this.scene.start('MainMenuScene');
        });

        this.portraitTitle = mainTitle;
        this.portraitDailyStreak = dailyStreak;
        this.portrait = new PortraitScreen(this, mainTitle, this.stats.finishReason || 'Run summary');
        this.showPortraitResults();
    }

    showPortraitResults() {
        const ui = this.portrait;
        const stats = this.stats;
        ui.setHeader(this.portraitTitle, stats.finishReason || 'Run summary');
        ui.clear();
        if (this.globalUploadStatus) {
            this.portraitUploadStatus = mobileElement('p', 'portrait-detail', this.globalUploadStatus);
            ui.content.append(this.portraitUploadStatus);
        }
        const grid = mobileElement('div', 'portrait-grid');
        const entries = [
            ['SCORE', stats.finalScore || 0],
            ['ACCURACY', `${(stats.accuracy || 0).toFixed(1)}%`],
            ['QUESTIONS', `${stats.questionsCorrect || 0}/${stats.questionsAttempted || 0}`],
            ['DISTANCE', `${Math.floor(stats.distance || 0)}m`],
            ['BEST COMBO', `x${stats.bestCombo || 0}`],
            ['BOSSES', stats.bossesDefeated || 0]
        ];
        entries.forEach(([label, value]) => {
            const cell = mobileElement('div', 'portrait-stat');
            cell.append(mobileElement('span', '', label), mobileElement('strong', '', String(value)));
            grid.append(cell);
        });
        ui.content.append(grid);
        if (stats.spmGrade) ui.content.append(mobileElement('p', 'portrait-detail', `SPM GRADE: ${stats.spmGrade.grade} • ${stats.spmGrade.label}`));
        if (stats.practiceTopic && stats.topicStats) {
            const before = stats.topicAccuracyBefore || 0;
            const after = stats.topicStats.accuracy || 0;
            ui.content.append(mobileElement('p', 'portrait-detail', `TOPIC ACCURACY: ${before}% → ${after}% (${after - before >= 0 ? '+' : ''}${after - before} pts)`));
            ui.addChoice('PRACTISE FOCUS TOPIC', stats.practiceTopic, () => this.scene.start('GameScene', {
                mode: 'practice', practiceChapter: stats.practiceChapter,
                practiceChapterName: stats.practiceChapterName, practiceTopic: stats.practiceTopic,
                targetQuestions: stats.targetQuestions || 10,
                difficulty: { label: 'Adaptive', min: 1, max: 5 }
            }));
        }
        if (this.portraitDailyStreak) ui.content.append(mobileElement('p', 'portrait-detail', `🔥 DAILY CHALLENGE COMPLETE • ${this.portraitDailyStreak}-DAY STREAK`));
        const mistakes = Array.isArray(stats.mistakes) ? stats.mistakes : [];
        if (mistakes.length) ui.addChoice(`REVIEW ${mistakes.length} MISTAKE${mistakes.length === 1 ? '' : 'S'}`, 'See the answers and explanations', () => this.showPortraitMistakes(0));
        ui.addChoice('CHAPTER MASTERY', 'Accuracy and levels by chapter', () => this.showPortraitMastery());
        ui.addChoice('PLAY AGAIN', 'Choose another game mode', () => this.scene.start('ModeSelectScene'));
        ui.addBack('MAIN MENU', () => this.scene.start('MainMenuScene'));
    }

    showPortraitMistakes(index) {
        const mistakes = this.stats.mistakes || [];
        const mistake = mistakes[index];
        if (!mistake) return this.showPortraitResults();
        const ui = this.portrait;
        ui.setHeader('MISTAKE REVIEW', `${index + 1} OF ${mistakes.length}`);
        ui.clear();
        const card = mobileElement('div', 'portrait-card');
        const mathParagraph = value => {
            const paragraph = mobileElement('p');
            appendMatrixMath(paragraph, value);
            return paragraph;
        };
        card.append(
            mobileElement('h2', '', `CHAPTER ${mistake.chapter} • ${mistake.topic || 'MATHEMATICS'}`),
            mathParagraph(mistake.question || ''),
            mathParagraph(`YOUR ANSWER: ${mistake.selectedAnswer ?? 'No answer'}`),
            mathParagraph(`CORRECT ANSWER: ${mistake.correctAnswer ?? ''}`),
            mathParagraph(`WHY: ${mistake.explanation || 'Review this topic and try again.'}`)
        );
        ui.content.append(card);
        if (index > 0) ui.addChoice('◀ PREVIOUS', '', () => this.showPortraitMistakes(index - 1));
        if (index < mistakes.length - 1) ui.addChoice('NEXT ▶', '', () => this.showPortraitMistakes(index + 1));
        ui.addBack('BACK TO RESULTS', () => {
            this.showPortraitResults();
        });
    }

    showPortraitMastery() {
        const ui = this.portrait;
        ui.setHeader('CHAPTER MASTERY', 'Persistent learning progress');
        ui.clear();
        const names = ['Variation', 'Matrices', 'Insurance', 'Taxation', 'Transformations', 'Trigonometry', 'Dispersion', 'Modelling'];
        names.forEach((name, index) => {
            const data = this.stats.mastery?.[index + 1] || { level: 1, accuracy: 0, attempted: 0 };
            const card = mobileElement('div', 'portrait-card');
            card.append(mobileElement('h2', '', `${index + 1}. ${name}`),
                mobileElement('p', '', `Level ${data.level || 1}/5 • ${data.accuracy || 0}% accuracy • ${data.attempted || 0} answered`));
            ui.content.append(card);
        });
        ui.addBack('BACK TO RESULTS', () => {
            this.showPortraitResults();
        });
    }

    showNewRewards() {
        const mastery = this.stats.mastery || {};
        const before = this.stats.masteryBefore || {};
        const names = ['Variation', 'Matrices', 'Insurance', 'Taxation', 'Transformations', 'Trigonometry', 'Dispersion', 'Modelling'];
        const rewards = [];

        Object.keys(mastery).forEach((chapter) => {
            const current = mastery[chapter] || {};
            const previous = before[chapter] || { level: 1 };
            const currentLevel = current.level || 1;
            const previousLevel = previous.level || 1;
            if (currentLevel <= previousLevel) return;

            const earned = [];
            if (currentLevel > previousLevel) earned.push('★ STAR');
            if (previousLevel < 3 && currentLevel >= 3) earned.push('CHAPTER BADGE');
            if (previousLevel < 5 && currentLevel >= 5) earned.push('BOSS SKIN');
            rewards.push(`${names[Number(chapter) - 1] || `CHAPTER ${chapter}`}: ${earned.join('  •  ')}`);
        });

        if (!rewards.length) return;
        const { width } = this.cameras.main;
        const panel = this.add.rectangle(width / 2, 505, 860, 70, 0x102958, 0.96)
            .setStrokeStyle(2, 0xffcc00, 0.9);
        this.add.text(width / 2, 484, 'NEW REWARDS EARNED', {
            fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(width / 2, 516, rewards.slice(0, 2).join('   |   '), {
            fontSize: '15px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.tweens.add({ targets: [panel], alpha: 0.78, duration: 900, yoyo: true, repeat: 2 });
    }

    showMasteryProgress(mastery) {
        const { width, height } = this.cameras.main;
        const names = ['Variation', 'Matrices', 'Insurance', 'Taxation', 'Transformations', 'Trigonometry', 'Dispersion', 'Modelling'];
        const overlay = this.add.container(0, 0).setDepth(300);
        const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x02040d, 0.95).setInteractive();
        const panel = this.add.rectangle(width / 2, height / 2, 1040, 630, 0x08122c, 1)
            .setStrokeStyle(3, 0x00f3ff, 0.9);
        const title = this.add.text(width / 2, 56, 'CHAPTER MASTERY', {
            fontSize: '30px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);
        const subtitle = this.add.text(width / 2, 92, 'Persistent progress • adaptive questions use these levels', {
            fontSize: '17px', fontFamily: "'Rajdhani', sans-serif", color: '#88ccff'
        }).setOrigin(0.5);
        overlay.add([dim, panel, title, subtitle]);

        names.forEach((name, index) => {
            const chapter = index + 1;
            const data = mastery[chapter] || { attempted: 0, accuracy: 0, level: 1, bestStreak: 0 };
            const column = index < 4 ? 0 : 1;
            const row = index % 4;
            const x = column === 0 ? 165 : 655;
            const y = 145 + row * 105;
            const color = data.accuracy >= 80 ? 0x00ff88 : data.accuracy >= 55 ? 0xffcc00 : 0xff6688;
            const label = this.add.text(x, y, `${chapter}. ${name}`, {
                fontSize: '18px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
            });
            const detail = this.add.text(x, y + 30, `Level ${data.level}/5  •  ${data.accuracy}%  •  ${data.attempted} answered  •  Best streak ${data.bestStreak}`, {
                fontSize: '15px', fontFamily: "'Rajdhani', sans-serif", color: '#bcd8ff', fontStyle: 'bold'
            });
            const track = this.add.rectangle(x, y + 66, 390, 12, 0x142340, 1).setOrigin(0, 0.5);
            const fillWidth = data.attempted ? Math.max(8, 390 * data.accuracy / 100) : 0;
            const fill = this.add.rectangle(x, y + 66, fillWidth, 12, color, 1).setOrigin(0, 0.5);
            overlay.add([label, detail, track, fill]);
        });

        const closeBg = this.add.rectangle(width / 2, 658, 220, 48, 0x102958, 1)
            .setStrokeStyle(2, 0x00f3ff, 0.9)
            .setInteractive({ useHandCursor: true });
        const closeText = this.add.text(width / 2, 658, 'CLOSE', {
            fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        closeBg.on('pointerdown', () => {
            audioManager.playClick();
            overlay.destroy(true);
        });
        overlay.add([closeBg, closeText]);
    }

    showMistakeReview(mistakes) {
        if (this.reviewOverlay) {
            this.reviewOverlay.destroy(true);
        }

        let page = 0;
        const { width, height } = this.cameras.main;
        const overlay = this.add.container(0, 0).setDepth(300);
        this.reviewOverlay = overlay;

        const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x02040d, 0.94)
            .setInteractive();
        const panel = this.add.rectangle(width / 2, height / 2, 1080, 610, 0x08122c, 1)
            .setStrokeStyle(3, 0x00f3ff, 0.9);
        const title = this.add.text(width / 2, 62, 'MISTAKE REVIEW', {
            fontSize: '30px', fontFamily: "'Orbitron', sans-serif", color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);
        const counter = this.add.text(width / 2, 102, '', {
            fontSize: '17px', fontFamily: "'Rajdhani', sans-serif", color: '#00ffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        const topic = this.add.text(145, 140, '', {
            fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: '#00ff88', fontStyle: 'bold'
        });
        const question = this.add.text(145, 176, '', {
            fontSize: '21px', fontFamily: "'Fira Code', Consolas, monospace", color: '#ffea6c',
            fontStyle: 'bold', lineSpacing: 5, wordWrap: { width: 990 }
        });
        const chosen = this.add.text(145, 290, '', {
            fontSize: '20px', fontFamily: "'Rajdhani', sans-serif", color: '#ff6688',
            fontStyle: 'bold', wordWrap: { width: 990 }
        });
        const correct = this.add.text(145, 340, '', {
            fontSize: '20px', fontFamily: "'Rajdhani', sans-serif", color: '#00ff88',
            fontStyle: 'bold', wordWrap: { width: 990 }
        });
        const explanationLabel = this.add.text(145, 402, 'WHY:', {
            fontSize: '15px', fontFamily: "'Orbitron', sans-serif", color: '#00ffff', fontStyle: 'bold'
        });
        const explanation = this.add.text(145, 432, '', {
            fontSize: '19px', fontFamily: "'Rajdhani', sans-serif", color: '#ffffff',
            lineSpacing: 4, wordWrap: { width: 990 }
        });

        overlay.add([dim, panel, title, counter, topic, question, chosen, correct, explanationLabel, explanation]);

        const makeReviewButton = (x, label, onClick) => {
            const button = this.add.container(x, 642);
            const bg = this.add.rectangle(0, 0, 190, 48, 0x102958, 1)
                .setStrokeStyle(2, 0x00f3ff, 0.9)
                .setInteractive({ useHandCursor: true });
            const text = this.add.text(0, 0, label, {
                fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
            bg.on('pointerdown', () => {
                audioManager.playClick();
                onClick();
            });
            button.add([bg, text]);
            overlay.add(button);
            return { button, bg };
        };

        const previous = makeReviewButton(width / 2 - 250, '◀ PREVIOUS', () => {
            if (page > 0) {
                page--;
                renderPage();
            }
        });
        makeReviewButton(width / 2, 'CLOSE', () => {
            overlay.destroy(true);
            this.reviewOverlay = null;
        });
        const next = makeReviewButton(width / 2 + 250, 'NEXT ▶', () => {
            if (page < mistakes.length - 1) {
                page++;
                renderPage();
            }
        });

        const renderPage = () => {
            const mistake = mistakes[page];
            counter.setText(`${page + 1} OF ${mistakes.length}`);
            topic.setText(`CHAPTER ${mistake.chapter} • ${(mistake.topic || 'MATHEMATICS').toUpperCase()}`);
            const matrixRepair = mistake.type === 'matrixRepair' || mistake.id?.startsWith('MAT-REPAIR-');
            question.setFontSize(matrixRepair ? 17 : 21);
            question.setText(matrixRepair ? formatMatrixEquation(mistake.question || '') : formatMatrixNotation(mistake.question || ''));
            chosen.setText(`YOUR ANSWER: ${formatMatrixNotation(mistake.selectedAnswer || 'No answer')}`);
            correct.setText(`CORRECT ANSWER: ${formatMatrixNotation(mistake.correctAnswer || '')}`);
            explanation.setText(formatMatrixNotation(mistake.explanation || 'Review this topic and try again.'));
            previous.button.setAlpha(page === 0 ? 0.35 : 1);
            previous.bg.disableInteractive();
            if (page > 0) previous.bg.setInteractive({ useHandCursor: true });
            next.button.setAlpha(page === mistakes.length - 1 ? 0.35 : 1);
            next.bg.disableInteractive();
            if (page < mistakes.length - 1) next.bg.setInteractive({ useHandCursor: true });
        };

        renderPage();
    }

    createButton(x, y, textStr, onClick) {
        const btn = this.add.container(x, y);
        const bg = this.add.image(0, 0, 'button').setInteractive({ useHandCursor: true });
        const txt = this.add.text(0, 0, textStr, {
            fontSize: '18px', fontFamily: "'Orbitron', sans-serif", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([bg, txt]);

        bg.on('pointerover', () => {
            bg.setTexture('button-hover');
            this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });

        bg.on('pointerout', () => {
            bg.setTexture('button');
            this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 });
        });

        bg.on('pointerdown', () => {
            audioManager.playClick();
            this.tweens.add({ targets: btn, scaleX: 0.95, scaleY: 0.95, duration: 50, yoyo: true });
            onClick();
        });

        return btn;
    }
}
