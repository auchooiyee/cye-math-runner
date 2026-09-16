export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const LANES = {
  LEFT: 380,
  CENTER: 640,
  RIGHT: 900,
  WIDTH: 200  // visual width of each lane
};

export const LANE_POSITIONS = [LANES.LEFT, LANES.CENTER, LANES.RIGHT];

export const PHYSICS = {
  GRAVITY_Y: 900,
  JUMP_VELOCITY: -600,
  GROUND_Y: 620,  // y position of ground surface
  PLAYER_START_X: 200  // player's fixed x position (world scrolls past)
};

export const SPEEDS = {
  INITIAL: 300,
  INCREMENT: 5,
  INCREMENT_INTERVAL: 10000,  // ms between speed increases
  MAX: 800,
  TURBO_BOOST: 1.3  // multiplier during MATH FEVER
};

export const SPAWN = {
  OBSTACLE_MIN_INTERVAL: 1500,  // ms
  OBSTACLE_MAX_INTERVAL: 3000,
  COIN_MIN_INTERVAL: 800,
  COIN_MAX_INTERVAL: 2000,
  POWERUP_MIN_INTERVAL: 15000,
  POWERUP_MAX_INTERVAL: 30000,
  MATH_GATE_DISTANCE: 800,  // metres between gates
  BOSS_DISTANCE: 2500  // metres between boss encounters
};

export const SCORING = {
  COIN: 10,
  CORRECT_ANSWER: 100,
  FAST_ANSWER_BONUS: 50,
  WRONG_ANSWER_PENALTY: -50,
  BOSS_DEFEAT: 500,
  DISTANCE_MULTIPLIER: 1,  // 1 point per metre
  // Final score weights
  WEIGHT_MATH: 0.60,
  WEIGHT_DISTANCE: 0.25,
  WEIGHT_COINS: 0.10,
  WEIGHT_COMBO: 0.05
};

export const COMBO = {
  MULTIPLIERS: [1, 2, 3, 4, 5],  // index = consecutive correct count
  FEVER_THRESHOLD: 5,  // consecutive correct answers to trigger MATH FEVER
  FEVER_DURATION: 10000  // ms
};

export const PLAYER = {
  INITIAL_SHIELDS: 3,
  MAX_SHIELDS: 5,
  LANE_SWITCH_DURATION: 150,  // ms for tween
  INVINCIBILITY_DURATION: 1000,
  SLIDE_DURATION: 600
};

export const BOSS = {
  QUESTIONS_TO_DEFEAT: 5,
  HP_PER_QUESTION: 20  // percentage
};

export const POWERUP_TYPES = {
  SHIELD: 'shield',
  HINT: 'hint',
  COIN_MAGNET: 'coin_magnet'
};

export const POWERUP_DURATIONS = {
  [POWERUP_TYPES.COIN_MAGNET]: 10000,
  [POWERUP_TYPES.HINT]: 0,  // instant, applies to next gate
  [POWERUP_TYPES.SHIELD]: 0  // instant, +1 shield
};

export const DIFFICULTY = {
  EASY: { min: 1, max: 2, label: 'Easy' },
  NORMAL: { min: 2, max: 4, label: 'Normal' },
  HARD: { min: 4, max: 6, label: 'Hard' },
  ACCURACY_UP_THRESHOLD: 85,
  ACCURACY_DOWN_THRESHOLD: 50
};

export const ZONES = [
  { id: 1, key: 'variation', name: 'Ubahan', nameEn: 'Variation', theme: 'Energy Highway', color: 0x00ff88, bgColor: 0x0a1628 },
  { id: 2, key: 'matrices', name: 'Matriks', nameEn: 'Matrices', theme: 'Matrix City', color: 0x00ffff, bgColor: 0x0a0a2e },
  { id: 3, key: 'insurance', name: 'Insurans', nameEn: 'Insurance', theme: 'Protection District', color: 0xff6600, bgColor: 0x1a0a0a },
  { id: 4, key: 'taxation', name: 'Percukaian', nameEn: 'Taxation', theme: 'Finance City', color: 0xffcc00, bgColor: 0x1a1a0a },
  { id: 5, key: 'transformations', name: 'Transformasi', nameEn: 'Transformations', theme: 'Geometry World', color: 0xff00ff, bgColor: 0x1a0a1a },
  { id: 6, key: 'trigonometry', name: 'Trigonometri', nameEn: 'Trigonometry', theme: 'Wave Tunnel', color: 0x0088ff, bgColor: 0x0a0a28 },
  { id: 7, key: 'dispersion', name: 'Sukatan Serakan', nameEn: 'Dispersion', theme: 'Data City', color: 0x88ff00, bgColor: 0x0a1a0a },
  { id: 8, key: 'modelling', name: 'Pemodelan', nameEn: 'Modelling', theme: 'SPM Final Lab', color: 0xff0044, bgColor: 0x1a0a14 }
];

// Colour palette
export const COLORS = {
  NAVY: 0x0a0a2e,
  ELECTRIC_BLUE: 0x0066ff,
  CYAN: 0x00ffff,
  PURPLE: 0x8800ff,
  GOLD: 0xffcc00,
  RED: 0xff0044,
  GREEN: 0x00ff88,
  WHITE: 0xffffff,
  DARK_BG: 0x0a0a1a,
  PANEL_BG: 0x1a1a3e,
  CORRECT: 0x00ff88,
  WRONG: 0xff0044
};
