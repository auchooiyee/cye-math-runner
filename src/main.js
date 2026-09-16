import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS, COLORS } from './config/gameConfig.js';
import { SCENES } from './config/constants.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import ModeSelectScene from './scenes/ModeSelectScene.js';
import GameScene from './scenes/GameScene.js';
import BossScene from './scenes/BossScene.js';
import ResultsScene from './scenes/ResultsScene.js';
import LeaderboardScene from './scenes/LeaderboardScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#' + COLORS.DARK_BG.toString(16).padStart(6, '0'),
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: PHYSICS.GRAVITY_Y },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    ModeSelectScene,
    GameScene,
    BossScene,
    ResultsScene,
    LeaderboardScene
  ]
};

const game = new Phaser.Game(config);

// Vite HMR cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.destroy(true);
  });
}
