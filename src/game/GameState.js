export const FLOOR_TARGETS = [300, 600, 1000, 1600, 2500];

export const GameState = {
  coins: 100,
  startCoins: 100,
  betAmount: 10,
  spinsLeft: 25,
  floor: 1,
  maxFloor: 5,

  meta: {
    totalRuns: 0,
    bestFloor: 0,
    metaCoins: 0,
    unlockedRelics: [],
  },

  activeRelics: [],

  getMultiplier() {
    return this.activeRelics.reduce((m, r) => m * (r.multiplier || 1), 1);
  },

  getFloorTarget() {
    return FLOOR_TARGETS[this.floor - 1] ?? 2500;
  },

  addRelic(relic) {
    this.activeRelics.push(relic);
  },

  resetRun() {
    this.coins = 100;
    this.startCoins = 100;
    this.betAmount = 10;
    this.spinsLeft = 25;
    this.floor = 1;
    this.activeRelics = [];
    this.meta.totalRuns++;
  },

  resetFloor() {
    this.coins = 100;
    this.startCoins = 100;
    this.betAmount = Math.min(this.betAmount, 100);
    this.spinsLeft = 25;
  },

  saveMeta() {
    localStorage.setItem('gamblinglite_meta', JSON.stringify(this.meta));
  },

  loadMeta() {
    const saved = localStorage.getItem('gamblinglite_meta');
    if (saved) {
      this.meta = { ...this.meta, ...JSON.parse(saved) };
    }
  },
};
