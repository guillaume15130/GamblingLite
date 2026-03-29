import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { SlotMachine } from '../game/SlotMachine.js';
import { GameState } from '../game/GameState.js';
import { Tween } from '../utils/Tween.js';

const CELL = 110;
const COLS = 3;
const ROWS = 3;
// Centered in the 430px-wide frame (starts at x=25)
const REEL_X = [55, 185, 315];
const REEL_Y_START = 215;

// Symbol labels guaranteed to render on all devices
const SYMBOL_LABELS = {
  cherry:  { label: '♥', textColor: 0xffffff },
  lemon:   { label: '♦', textColor: 0xffffff },
  orange:  { label: '●', textColor: 0xffffff },
  grape:   { label: '♣', textColor: 0xffffff },
  bell:    { label: '★', textColor: 0xffffff },
  star:    { label: '✦', textColor: 0xffffff },
  seven:   { label: '7', textColor: 0xffffff },
};

export class SlotScene extends Container {
  constructor(app, onFloorComplete, onGameOver) {
    super();
    this.app = app;
    this.onFloorComplete = onFloorComplete;
    this.onGameOver = onGameOver;
    this.machine = new SlotMachine(ROWS, COLS);
    this.spinning = false;
    this.tweens = [];
    this.symbolCells = []; // [col][row] = Container
    this.lastResult = null;

    this._buildBackground();
    this._buildReels();
    this._buildHUD();
    this._buildSpinButton();
    this._buildBetButtons();
    this.app.ticker.add(this._update, this);
  }

  _buildBackground() {
    const bg = new Graphics();
    bg.rect(0, 0, 480, 800).fill(0x0a0a0f);
    bg.rect(0, 0, 480, 80).fill(0x1a1a2e);
    const fx = 25, fy = 205, fw = 430, fh = 340;
    bg.roundRect(fx, fy, fw, fh, 18).fill(0x16213e);
    bg.roundRect(fx + 3, fy + 3, fw - 6, fh - 6, 15).stroke({ width: 3, color: 0x4a9eff });
    // Win line indicator (middle row)
    bg.rect(30, REEL_Y_START + CELL + 8, 420, 2).fill({ color: 0xffd700, alpha: 0.4 });
    this.addChild(bg);
  }

  _buildReels() {
    this.symbolCells = [];

    for (let c = 0; c < COLS; c++) {
      const reelBg = new Graphics();
      reelBg.roundRect(REEL_X[c] - 6, REEL_Y_START - 6, CELL + 12, ROWS * CELL + 12, 10).fill(0x0d0d1a);
      this.addChild(reelBg);

      const reel = new Container();
      reel.x = REEL_X[c];
      reel.y = REEL_Y_START;
      this.addChild(reel);

      const colCells = [];
      for (let r = 0; r < ROWS; r++) {
        const cell = this._makeCell();
        cell.x = CELL / 2;
        cell.y = r * CELL + CELL / 2;
        reel.addChild(cell);
        colCells.push(cell);
      }
      this.symbolCells.push(colCells);
    }
  }

  _makeCell(symbol = null) {
    const cell = new Container();

    const bg = new Graphics();
    cell.addChild(bg);

    const lbl = new Text({ text: '', style: new TextStyle({
      fontSize: 46,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      fill: 0xffffff,
    })});
    lbl.anchor.set(0.5);
    cell.addChild(lbl);

    if (symbol) this._applySymbol(cell, symbol);
    else this._applyPlaceholder(cell);

    return cell;
  }

  _applySymbol(cell, symbol) {
    const bg = cell.children[0];
    const lbl = cell.children[1];
    const r = 42;
    bg.clear();
    // Outer glow ring
    bg.circle(0, 0, r).fill(symbol.color);
    // Inner darker fill
    bg.circle(0, 0, r - 5).fill(0x0d0d1a);
    // Small colored dot in center
    bg.circle(0, 0, r - 18).fill({ color: symbol.color, alpha: 0.3 });

    const info = SYMBOL_LABELS[symbol.id] || { label: '?', textColor: 0xffffff };
    lbl.text = info.label;
    lbl.style.fill = symbol.color;
    lbl.style.fontSize = symbol.id === 'seven' ? 52 : 40;
  }

  _applyPlaceholder(cell) {
    const bg = cell.children[0];
    const lbl = cell.children[1];
    bg.clear();
    bg.circle(0, 0, 42).fill(0x1a1a3e);
    bg.circle(0, 0, 37).fill(0x0d0d1a);
    lbl.text = '?';
    lbl.style.fill = 0x333366;
  }

  _buildHUD() {
    const title = new Text({ text: '🎰 GAMBLINGLITE', style: new TextStyle({ fontSize: 28, fill: 0xffd700, fontWeight: 'bold', fontFamily: 'monospace' }) });
    title.anchor.set(0.5);
    title.x = 240;
    title.y = 40;
    this.addChild(title);

    this.coinsText = new Text({ text: '', style: new TextStyle({ fontSize: 22, fill: 0x2ecc71, fontFamily: 'monospace', fontWeight: 'bold' }) });
    this.coinsText.anchor.set(0, 0.5);
    this.coinsText.x = 30;
    this.coinsText.y = 565;
    this.addChild(this.coinsText);

    this.spinsText = new Text({ text: '', style: new TextStyle({ fontSize: 18, fill: 0x95a5a6, fontFamily: 'monospace' }) });
    this.spinsText.anchor.set(1, 0.5);
    this.spinsText.x = 450;
    this.spinsText.y = 565;
    this.addChild(this.spinsText);

    this.floorText = new Text({ text: '', style: new TextStyle({ fontSize: 16, fill: 0x4a9eff, fontFamily: 'monospace' }) });
    this.floorText.anchor.set(0.5, 0.5);
    this.floorText.x = 240;
    this.floorText.y = 188;
    this.addChild(this.floorText);

    this.winText = new Text({ text: '', style: new TextStyle({ fontSize: 32, fill: 0xffd700, fontWeight: 'bold', fontFamily: 'monospace', align: 'center' }) });
    this.winText.anchor.set(0.5);
    this.winText.x = 240;
    this.winText.y = 158;
    this.addChild(this.winText);

    const betLabel = new Text({ text: 'MISE :', style: new TextStyle({ fontSize: 16, fill: 0x7f8c8d, fontFamily: 'monospace' }) });
    betLabel.x = 30;
    betLabel.y = 638;
    this.addChild(betLabel);

    this.betText = new Text({ text: '', style: new TextStyle({ fontSize: 22, fill: 0xe67e22, fontFamily: 'monospace', fontWeight: 'bold' }) });
    this.betText.x = 105;
    this.betText.y = 634;
    this.addChild(this.betText);

    this.relicContainer = new Container();
    this.relicContainer.x = 30;
    this.relicContainer.y = 668;
    this.addChild(this.relicContainer);

    this._refreshHUD();
  }

  _refreshHUD() {
    this.coinsText.text = `💰 ${GameState.coins}`;
    this.spinsText.text = `Spins: ${GameState.spinsLeft}`;
    this.floorText.text = `Étage ${GameState.floor} / ${GameState.maxFloor}`;
    this.betText.text = `${GameState.betAmount}`;
    this._refreshRelics();
  }

  _refreshRelics() {
    this.relicContainer.removeChildren();
    GameState.activeRelics.forEach((relic, i) => {
      const t = new Text({ text: relic.emoji, style: new TextStyle({ fontSize: 22 }) });
      t.x = i * 40;
      this.relicContainer.addChild(t);
    });
  }

  _buildSpinButton() {
    this.spinBtn = new Container();
    this.spinBtn.x = 140;
    this.spinBtn.y = 725;

    const bg = new Graphics();
    bg.roundRect(0, 0, 200, 55, 28).fill(0x4a9eff);
    this.spinBtn.addChild(bg);

    const label = new Text({ text: 'SPIN !', style: new TextStyle({ fontSize: 26, fill: 0xffffff, fontWeight: 'bold', fontFamily: 'monospace' }) });
    label.anchor.set(0.5);
    label.x = 100;
    label.y = 27;
    this.spinBtn.addChild(label);

    this.spinBtn.eventMode = 'static';
    this.spinBtn.cursor = 'pointer';
    this.spinBtn.on('pointerdown', () => this._onSpin());
    this.spinBtn.on('pointerover', () => { bg.clear(); bg.roundRect(0, 0, 200, 55, 28).fill(0x5aaeff); });
    this.spinBtn.on('pointerout', () => { bg.clear(); bg.roundRect(0, 0, 200, 55, 28).fill(0x4a9eff); });
    this.addChild(this.spinBtn);
  }

  _buildBetButtons() {
    const bets = [5, 10, 25, 50];
    bets.forEach((val, i) => {
      const btn = new Container();
      btn.x = 30 + i * 108;
      btn.y = 595;

      const bg = new Graphics();
      bg.roundRect(0, 0, 90, 32, 8).fill(0x1a1a2e);
      bg.roundRect(0, 0, 90, 32, 8).stroke({ width: 1, color: 0xe67e22 });
      btn.addChild(bg);

      const label = new Text({ text: `${val}`, style: new TextStyle({ fontSize: 16, fill: 0xe67e22, fontFamily: 'monospace' }) });
      label.anchor.set(0.5);
      label.x = 45;
      label.y = 16;
      btn.addChild(label);

      btn.eventMode = 'static';
      btn.cursor = 'pointer';
      btn.on('pointerdown', () => {
        GameState.betAmount = Math.min(val, GameState.coins);
        this._refreshHUD();
      });
      this.addChild(btn);
    });
  }

  _onSpin() {
    if (this.spinning) return;
    if (GameState.spinsLeft <= 0) return;
    if (GameState.coins < GameState.betAmount) {
      GameState.betAmount = GameState.coins;
      if (GameState.betAmount <= 0) { this.onGameOver(); return; }
    }

    this.spinning = true;
    this.winText.text = '';
    GameState.coins -= GameState.betAmount;
    GameState.spinsLeft--;
    this._refreshHUD();

    this.lastResult = this.machine.spin();
    this._animateReels(this.lastResult);
  }

  _animateReels(result) {
    let done = 0;
    for (let c = 0; c < COLS; c++) {
      setTimeout(() => {
        this._spinColumn(c, result.grid[c], () => {
          done++;
          if (done === COLS) this._onSpinComplete(result);
        });
      }, c * 180);
    }
  }

  _spinColumn(col, finalSymbols, onDone) {
    const cells = this.symbolCells[col];
    const spinCount = 12 + col * 4;
    let current = 0;

    const tick = () => {
      if (current < spinCount) {
        cells.forEach(cell => {
          const sym = finalSymbols[Math.floor(Math.random() * finalSymbols.length)];
          this._applySymbol(cell, sym);
          cell.scale.set(1);
        });
        current++;
        setTimeout(tick, 60 + (current > spinCount - 4 ? (current - spinCount + 4) * 30 : 0));
      } else {
        finalSymbols.forEach((sym, r) => this._applySymbol(cells[r], sym));
        onDone();
      }
    };
    tick();
  }

  _onSpinComplete(result) {
    this.spinning = false;

    if (result.payout > 0) {
      GameState.coins += result.payout;
      this.winText.text = `+${result.payout} 💰`;
      result.winLines.forEach(line => {
        line.coords.forEach(([c, r]) => this._flashSymbol(this.symbolCells[c][r]));
      });
      GameState.activeRelics.forEach(r => { if (r.onWin) r.onWin(GameState); });
    } else {
      this.winText.text = 'Pas de chance...';
    }

    this._refreshHUD();

    if (GameState.coins >= GameState.startCoins * 3) {
      setTimeout(() => this.onFloorComplete(), 800);
      return;
    }

    if (GameState.coins <= 0) {
      const prevented = GameState.activeRelics.some(r => r.onRuin && r.onRuin(GameState));
      if (!prevented) { setTimeout(() => this.onGameOver(), 800); return; }
      this._refreshHUD();
    }

    if (GameState.spinsLeft <= 0 && GameState.coins < GameState.betAmount) {
      setTimeout(() => this.onGameOver(), 800);
    }
  }

  _flashSymbol(cell) {
    const tween = new Tween(cell.scale, { x: 1.4, y: 1.4 }, 180);
    tween.onComplete = () => {
      this.tweens.push(new Tween(cell.scale, { x: 1, y: 1 }, 180));
    };
    this.tweens.push(tween);
  }

  _update = () => {
    const dt = this.app.ticker.deltaMS;
    this.tweens = this.tweens.filter(t => { t.update(dt); return !t.done; });
  };

  destroy() {
    this.app.ticker.remove(this._update, this);
    super.destroy({ children: true });
  }
}
