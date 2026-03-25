import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GameState } from '../game/GameState.js';

export class GameOverScene extends Container {
  constructor(app, won, onRestart) {
    super();
    this.app = app;
    this.won = won;
    this.onRestart = onRestart;
    this._build();
  }

  _build() {
    const bg = new Graphics();
    bg.rect(0, 0, 480, 800).fill(0x0a0a0f);
    this.addChild(bg);

    const icon = new Text({ text: this.won ? '🏆' : '💸', style: new TextStyle({ fontSize: 100 }) });
    icon.anchor.set(0.5);
    icon.x = 240;
    icon.y = 200;
    this.addChild(icon);

    const titleText = this.won ? 'VICTOIRE !' : 'RUINÉ !';
    const titleColor = this.won ? 0xffd700 : 0xe74c3c;
    const title = new Text({ text: titleText, style: new TextStyle({ fontSize: 52, fill: titleColor, fontWeight: 'bold', fontFamily: 'monospace' }) });
    title.anchor.set(0.5);
    title.x = 240;
    title.y = 330;
    this.addChild(title);

    const stats = [
      `Étage atteint : ${GameState.floor} / ${GameState.maxFloor}`,
      `Coins restants : ${GameState.coins}`,
      `Reliques : ${GameState.activeRelics.map(r => r.emoji).join(' ') || 'Aucune'}`,
    ];

    stats.forEach((line, i) => {
      const t = new Text({ text: line, style: new TextStyle({ fontSize: 18, fill: 0xcccccc, fontFamily: 'monospace' }) });
      t.anchor.set(0.5);
      t.x = 240;
      t.y = 420 + i * 40;
      this.addChild(t);
    });

    const btn = new Container();
    btn.x = 115;
    btn.y = 660;
    const btnBg = new Graphics();
    btnBg.roundRect(0, 0, 250, 60, 30).fill(0x4a9eff);
    btn.addChild(btnBg);
    const label = new Text({ text: 'REJOUER', style: new TextStyle({ fontSize: 28, fill: 0xffffff, fontWeight: 'bold', fontFamily: 'monospace' }) });
    label.anchor.set(0.5);
    label.x = 125;
    label.y = 30;
    btn.addChild(label);
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', () => this.onRestart());
    btn.on('pointerover', () => { btnBg.clear(); btnBg.roundRect(0, 0, 250, 60, 30).fill(0x5aaeff); });
    btn.on('pointerout', () => { btnBg.clear(); btnBg.roundRect(0, 0, 250, 60, 30).fill(0x4a9eff); });
    this.addChild(btn);
  }
}
