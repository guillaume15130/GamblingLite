import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { getRandomRelics } from '../relics/RelicData.js';
import { GameState } from '../game/GameState.js';

export class RelicChoiceScene extends Container {
  constructor(app, onChoice) {
    super();
    this.app = app;
    this.onChoice = onChoice;
    this.relics = getRandomRelics(3, GameState.activeRelics.map(r => r.id));
    this._build();
  }

  _build() {
    const bg = new Graphics();
    bg.rect(0, 0, 480, 800).fill({ color: 0x0a0a0f, alpha: 0.95 });
    this.addChild(bg);

    const title = new Text({ text: '✨ CHOISIR UNE RELIQUE ✨', style: new TextStyle({ fontSize: 26, fill: 0xffd700, fontWeight: 'bold', fontFamily: 'monospace' }) });
    title.anchor.set(0.5);
    title.x = 240;
    title.y = 120;
    this.addChild(title);

    const sub = new Text({ text: `Étage ${GameState.floor} terminé !`, style: new TextStyle({ fontSize: 16, fill: 0x95a5a6, fontFamily: 'monospace' }) });
    sub.anchor.set(0.5);
    sub.x = 240;
    sub.y = 160;
    this.addChild(sub);

    this.relics.forEach((relic, i) => this._buildRelicCard(relic, 80, 220 + i * 180));

    const skip = new Container();
    skip.x = 155;
    skip.y = 740;
    const skipBg = new Graphics();
    skipBg.roundRect(0, 0, 170, 44, 10).fill(0x2c2c3e);
    skip.addChild(skipBg);
    const skipLabel = new Text({ text: 'Passer (skip)', style: new TextStyle({ fontSize: 17, fill: 0x7f8c8d, fontFamily: 'monospace' }) });
    skipLabel.anchor.set(0.5);
    skipLabel.x = 85;
    skipLabel.y = 22;
    skip.addChild(skipLabel);
    skip.eventMode = 'static';
    skip.cursor = 'pointer';
    skip.on('pointerdown', () => this.onChoice(null));
    this.addChild(skip);
  }

  _buildRelicCard(relic, x, y) {
    const card = new Container();
    card.x = x;
    card.y = y;

    const rarityColors = { common: 0x2ecc71, uncommon: 0x3498db, rare: 0x9b59b6 };
    const rarityColor = rarityColors[relic.rarity] || 0x7f8c8d;

    const bg = new Graphics();
    bg.roundRect(0, 0, 320, 150, 14).fill(0x16213e);
    bg.roundRect(0, 0, 320, 150, 14).stroke({ width: 2, color: rarityColor });
    card.addChild(bg);

    const emoji = new Text({ text: relic.emoji, style: new TextStyle({ fontSize: 44 }) });
    emoji.x = 20;
    emoji.y = 50;
    card.addChild(emoji);

    const name = new Text({ text: relic.name, style: new TextStyle({ fontSize: 20, fill: 0xffffff, fontWeight: 'bold', fontFamily: 'monospace' }) });
    name.x = 80;
    name.y = 30;
    card.addChild(name);

    const desc = new Text({ text: relic.desc, style: new TextStyle({ fontSize: 14, fill: 0xaaaaaa, fontFamily: 'monospace', wordWrap: true, wordWrapWidth: 220 }) });
    desc.x = 80;
    desc.y = 65;
    card.addChild(desc);

    const rarityLabel = new Text({ text: relic.rarity.toUpperCase(), style: new TextStyle({ fontSize: 12, fill: rarityColor, fontFamily: 'monospace' }) });
    rarityLabel.x = 80;
    rarityLabel.y = 110;
    card.addChild(rarityLabel);

    card.eventMode = 'static';
    card.cursor = 'pointer';
    card.on('pointerover', () => card.scale.set(1.03));
    card.on('pointerout', () => card.scale.set(1));
    card.on('pointerdown', () => {
      GameState.addRelic(relic);
      if (relic.onEquip) relic.onEquip(GameState);
      this.onChoice(relic);
    });

    this.addChild(card);
  }
}
