// Full International Morse Code Alphabet (A-Z and 0-9)
export const MORSE_MAP: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
};

export const CIPHER_WORD_POOL: string[] = [
  'EUTAP',
  'BLOCK',
  'NODES',
  'CHAIN',
  'TOKEN',
  'VAULT',
  'ALPHA',
  'CYBER',
  'MINER',
  'STAKE',
  'SMART',
  'PULSE',
  'RADAR',
  'FORGE',
  'SHARD',
  'ORBIT',
  'POWER',
  'GUARD',
  'TURBO',
  'ZEUS',
];

// Returns the date-seeded cipher word for automatic daily rotation
export function getDailyCipherWord(dateStr?: string): string {
  const date = dateStr || new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash << 5) - hash + date.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CIPHER_WORD_POOL.length;
  return CIPHER_WORD_POOL[index];
}

// Automatically generates a new cipher word distinct from the current one
export function generateNewCipherWord(currentWord?: string): string {
  const available = CIPHER_WORD_POOL.filter((w) => w !== currentWord);
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex] || 'EUTAP';
}

// Returns the Morse representation for an entire word separated by slashes
export function getWordMorse(word: string): string {
  return word
    .toUpperCase()
    .split('')
    .map((char) => MORSE_MAP[char] || '?')
    .join(' / ');
}
