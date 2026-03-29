import { Application } from 'pixi.js';
import { GameManager } from './game/GameManager.js';

const app = new Application();

await app.init({
  width: 480,
  height: 800,
  backgroundColor: 0x0a0a0f,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});

document.body.appendChild(app.canvas);

const game = new GameManager(app);
game.start();
