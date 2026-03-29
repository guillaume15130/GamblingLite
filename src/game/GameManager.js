import { GameState } from './GameState.js';
import { SlotScene } from '../scenes/SlotScene.js';
import { RelicChoiceScene } from '../scenes/RelicChoiceScene.js';
import { GameOverScene } from '../scenes/GameOverScene.js';

export class GameManager {
  constructor(app) {
    this.app = app;
    this.currentScene = null;
  }

  start() {
    GameState.loadMeta();
    this._startRun();
  }

  _startRun() {
    GameState.resetRun();
    this._showSlotScene();
  }

  _showSlotScene() {
    this._setScene(new SlotScene(
      this.app,
      () => this._onFloorComplete(),
      () => this._onGameOver(false),
    ));
  }

  _onFloorComplete() {
    if (GameState.floor >= GameState.maxFloor) {
      this._onGameOver(true);
      return;
    }

    this._setScene(new RelicChoiceScene(this.app, () => {
      GameState.floor++;
      GameState.resetFloor(); // fresh 100 coins + 25 spins each floor
      GameState.activeRelics.forEach(r => {
        if (r.onFloorStart) r.onFloorStart(GameState);
      });
      this._showSlotScene();
    }));
  }

  _onGameOver(won) {
    if (GameState.floor > GameState.meta.bestFloor) {
      GameState.meta.bestFloor = GameState.floor;
    }
    GameState.saveMeta();

    this._setScene(new GameOverScene(this.app, won, () => {
      this._startRun();
    }));
  }

  _setScene(scene) {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene);
      if (this.currentScene.destroy) this.currentScene.destroy();
    }
    this.currentScene = scene;
    this.app.stage.addChild(scene);
  }
}
