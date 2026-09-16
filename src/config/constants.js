// Scene keys
export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MAIN_MENU: 'MainMenuScene',
  MODE_SELECT: 'ModeSelectScene',
  GAME: 'GameScene',
  BOSS: 'BossScene',
  RESULTS: 'ResultsScene',
  LEADERBOARD: 'LeaderboardScene'
};

// Custom events emitted via scene.events or scene.game.events
export const EVENTS = {
  SCORE_CHANGED: 'score-changed',
  COMBO_CHANGED: 'combo-changed',
  COMBO_RESET: 'combo-reset',
  MATH_FEVER: 'math-fever',
  SHIELD_CHANGED: 'shield-changed',
  DISTANCE_CHANGED: 'distance-changed',
  COIN_COLLECTED: 'coin-collected',
  CORRECT_ANSWER: 'correct-answer',
  WRONG_ANSWER: 'wrong-answer',
  BOSS_TRIGGERED: 'boss-triggered',
  BOSS_DEFEATED: 'boss-defeated',
  BOSS_HP_CHANGED: 'boss-hp-changed',
  GAME_OVER: 'game-over',
  POWERUP_ACTIVATED: 'powerup-activated',
  POWERUP_EXPIRED: 'powerup-expired',
  DIFFICULTY_CHANGED: 'difficulty-changed',
  SPEED_CHANGED: 'speed-changed',
  LANGUAGE_CHANGED: 'language-changed',
  GATE_APPROACHING: 'gate-approaching',
  ZONE_CHANGED: 'zone-changed'
};

// Texture keys (generated in PreloadScene)
export const TEXTURES = {
  PLAYER: 'player',
  PLAYER_SLIDE: 'player-slide',
  OBSTACLE_LOW: 'obstacle-low',
  OBSTACLE_HIGH: 'obstacle-high',
  COIN: 'coin',
  MATH_GATE_DOOR: 'gate-door',
  MATH_GATE_CORRECT: 'gate-correct',
  MATH_GATE_WRONG: 'gate-wrong',
  POWERUP_SHIELD: 'powerup-shield',
  POWERUP_HINT: 'powerup-hint',
  POWERUP_MAGNET: 'powerup-magnet',
  BOSS_SPRITE: 'boss-sprite',
  GROUND: 'ground',
  GROUND_LINE: 'ground-line',
  BG_LAYER_1: 'bg-layer-1',
  BG_LAYER_2: 'bg-layer-2',
  BG_LAYER_3: 'bg-layer-3',
  PARTICLE: 'particle',
  BUTTON: 'button',
  BUTTON_HOVER: 'button-hover'
};

// Animation keys
export const ANIMS = {
  PLAYER_RUN: 'player-run',
  PLAYER_JUMP: 'player-jump',
  PLAYER_SLIDE: 'player-slide',
  COIN_SPIN: 'coin-spin'
};

// Game modes
export const MODES = {
  ENDLESS: 'endless',
  SPRINT: 'sprint'
};

// UI text translations
export const UI_TEXT = {
  en: {
    title: 'CYE MATH RUNNER',
    subtitle: 'SPM FINAL RUN',
    tagline: 'RUN • SOLVE • SURVIVE',
    play: 'PLAY',
    leaderboard: 'LEADERBOARD',
    back: 'BACK',
    endlessRun: 'ENDLESS RUN',
    spmSprint: 'SPM SPRINT',
    comingSoon: 'COMING SOON',
    easy: 'EASY',
    normal: 'NORMAL',
    hard: 'HARD',
    start: 'START',
    pause: 'PAUSE',
    resume: 'RESUME',
    quit: 'QUIT',
    distance: 'DISTANCE',
    score: 'SCORE',
    combo: 'COMBO',
    shields: 'SHIELDS',
    coins: 'COINS',
    correct: 'CORRECT!',
    wrong: 'WRONG!',
    bossDefeated: 'BOSS DEFEATED!',
    gameOver: 'GAME OVER',
    mathRunComplete: 'MATH RUN COMPLETE',
    questions: 'QUESTIONS',
    accuracy: 'ACCURACY',
    bestCombo: 'BEST COMBO',
    bossesDefeated: 'BOSSES DEFEATED',
    finalScore: 'FINAL SCORE',
    playAgain: 'PLAY AGAIN',
    mainMenu: 'MAIN MENU',
    mathFever: 'MATH FEVER!',
    selectDifficulty: 'SELECT DIFFICULTY',
    selectMode: 'SELECT MODE',
    enterName: 'ENTER NAME',
    topScores: 'TOP SCORES',
    rank: 'RANK',
    name: 'NAME',
    language: 'LANGUAGE',
    mathPerformance: 'MATH PERFORMANCE',
    zone: 'ZONE'
  },
  bm: {
    title: 'CYE MATH RUNNER',
    subtitle: 'SPM FINAL RUN',
    tagline: 'LARI • SELESAI • BERTAHAN',
    play: 'MAIN',
    leaderboard: 'PAPAN PENDAHULU',
    back: 'KEMBALI',
    endlessRun: 'LARIAN TANPA HENTI',
    spmSprint: 'SPM SPRINT',
    comingSoon: 'AKAN DATANG',
    easy: 'MUDAH',
    normal: 'SEDERHANA',
    hard: 'SUKAR',
    start: 'MULA',
    pause: 'JEDA',
    resume: 'SAMBUNG',
    quit: 'KELUAR',
    distance: 'JARAK',
    score: 'SKOR',
    combo: 'KOMBO',
    shields: 'PERISAI',
    coins: 'SYILING',
    correct: 'BETUL!',
    wrong: 'SALAH!',
    bossDefeated: 'BOS DIKALAHKAN!',
    gameOver: 'TAMAT PERMAINAN',
    mathRunComplete: 'LARIAN MATEMATIK SELESAI',
    questions: 'SOALAN',
    accuracy: 'KETEPATAN',
    bestCombo: 'KOMBO TERBAIK',
    bossesDefeated: 'BOS DIKALAHKAN',
    finalScore: 'SKOR AKHIR',
    playAgain: 'MAIN LAGI',
    mainMenu: 'MENU UTAMA',
    mathFever: 'DEMAM MATEMATIK!',
    selectDifficulty: 'PILIH KESUKARAN',
    selectMode: 'PILIH MOD',
    enterName: 'MASUKKAN NAMA',
    topScores: 'SKOR TERTINGGI',
    rank: 'KEDUDUKAN',
    name: 'NAMA',
    language: 'BAHASA',
    mathPerformance: 'PRESTASI MATEMATIK',
    zone: 'ZON'
  }
};

// Storage keys
export const STORAGE_KEYS = {
  HIGH_SCORES: 'cye-math-runner-scores',
  SETTINGS: 'cye-math-runner-settings',
  PLAYER_NAME: 'cye-math-runner-name',
  LANGUAGE: 'cye-math-runner-lang'
};
