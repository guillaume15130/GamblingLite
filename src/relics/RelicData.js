export const ALL_RELICS = [
  {
    id: 'lucky_wheel',
    name: 'Roue Chanceuse',
    desc: '+20% sur tous les gains',
    emoji: '🎡',
    color: 0x2ecc71,
    multiplier: 1.2,
    rarity: 'common',
  },
  {
    id: 'golden_coin',
    name: 'Pièce Dorée',
    desc: '+1 spin bonus par étage',
    emoji: '🪙',
    color: 0xf1c40f,
    rarity: 'common',
    onFloorStart(state) { state.spinsLeft += 1; },
  },
  {
    id: 'cursed_symbol',
    name: 'Symbole Maudit',
    desc: 'x3 gains mais -1 spin à chaque victoire',
    emoji: '💀',
    color: 0x9b59b6,
    multiplier: 3,
    rarity: 'rare',
    onWin(state) { state.spinsLeft = Math.max(1, state.spinsLeft - 1); },
  },
  {
    id: 'safety_net',
    name: 'Filet de Sécurité',
    desc: 'Ignore la première ruine du run',
    emoji: '🕸️',
    color: 0x3498db,
    rarity: 'rare',
    _used: false,
    onRuin(state) {
      if (!this._used) {
        this._used = true;
        state.coins = state.betAmount;
        return true;
      }
      return false;
    },
  },
  {
    id: 'double_down',
    name: 'Double Mise',
    desc: 'Mise x2 mais jackpot x2',
    emoji: '⚡',
    color: 0xe74c3c,
    multiplier: 2,
    rarity: 'uncommon',
    onEquip(state) { state.betAmount = Math.min(state.betAmount * 2, state.coins); },
  },
  {
    id: 'extra_spin',
    name: 'Tour Bonus',
    desc: '+5 spins au départ du run',
    emoji: '🔄',
    color: 0x1abc9c,
    rarity: 'uncommon',
    onEquip(state) { state.spinsLeft += 5; },
  },
];

export function getRandomRelics(count = 3, exclude = []) {
  const pool = ALL_RELICS.filter(r => !exclude.includes(r.id));
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
