import { randomSymbol } from './Symbols.js';
import { GameState } from './GameState.js';

export class SlotMachine {
  constructor(rows = 3, cols = 3) {
    this.rows = rows;
    this.cols = cols;
    this.grid = [];
  }

  spin() {
    this.grid = [];
    for (let c = 0; c < this.cols; c++) {
      const col = [];
      for (let r = 0; r < this.rows; r++) {
        col.push(randomSymbol());
      }
      this.grid.push(col);
    }
    return this.evaluate();
  }

  evaluate() {
    const result = { grid: this.grid, winLines: [], totalMultiplier: 0, payout: 0 };

    for (const line of this._getLines()) {
      const symbols = line.map(([c, r]) => this.grid[c][r]);
      const win = this._checkLine(symbols);
      if (win) {
        result.winLines.push({ coords: line, symbol: win.symbol, multiplier: win.multiplier });
        result.totalMultiplier += win.multiplier;
      }
    }

    if (result.totalMultiplier > 0) {
      result.totalMultiplier *= GameState.getMultiplier();
    }

    result.payout = Math.floor(GameState.betAmount * result.totalMultiplier);
    return result;
  }

  _getLines() {
    const lines = [];
    // 3 lignes horizontales
    for (let r = 0; r < this.rows; r++) {
      lines.push([[0, r], [1, r], [2, r]]);
    }
    // 3 lignes verticales
    for (let c = 0; c < this.cols; c++) {
      lines.push([[c, 0], [c, 1], [c, 2]]);
    }
    // 2 diagonales
    lines.push([[0, 0], [1, 1], [2, 2]]);
    lines.push([[0, 2], [1, 1], [2, 0]]);
    return lines;
  }

  _checkLine(symbols) {
    if (symbols[0].id === symbols[1].id && symbols[1].id === symbols[2].id) {
      return { symbol: symbols[0], multiplier: symbols[0].value };
    }
    const cherries = symbols.filter(s => s.id === 'cherry').length;
    if (cherries === 2) {
      return { symbol: symbols.find(s => s.id === 'cherry'), multiplier: 1 };
    }
    return null;
  }
}
