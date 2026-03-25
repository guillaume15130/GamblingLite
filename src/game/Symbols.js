export const SYMBOLS = [
  { id: 'cherry',  emoji: '🍒', color: 0xe74c3c, value: 2,  weight: 30 },
  { id: 'lemon',   emoji: '🍋', color: 0xf1c40f, value: 2,  weight: 28 },
  { id: 'orange',  emoji: '🍊', color: 0xe67e22, value: 3,  weight: 20 },
  { id: 'grape',   emoji: '🍇', color: 0x9b59b6, value: 4,  weight: 14 },
  { id: 'bell',    emoji: '🔔', color: 0xf39c12, value: 6,  weight: 5  },
  { id: 'star',    emoji: '⭐', color: 0xffd700, value: 10, weight: 2  },
  { id: 'seven',   emoji: '7️⃣', color: 0xe74c3c, value: 20, weight: 1  },
];

const POOL = [];
for (const sym of SYMBOLS) {
  for (let i = 0; i < sym.weight; i++) POOL.push(sym);
}

export function randomSymbol() {
  return POOL[Math.floor(Math.random() * POOL.length)];
}

export function getSymbolById(id) {
  return SYMBOLS.find(s => s.id === id);
}
