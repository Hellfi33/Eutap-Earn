import { MINE_CARDS } from './mineCards';

/**
 * Returns 3 distinct secret card IDs for the given date (24-hour cycle).
 * Seeded by the date string (YYYY-MM-DD) so it rotates cleanly every 24 hours.
 */
export function getDailyComboCards(dateStr?: string): string[] {
  const date = dateStr || new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash << 5) - hash + date.charCodeAt(i);
    hash |= 0;
  }

  const allCardIds = MINE_CARDS.map((c) => c.id);
  const selected: string[] = [];

  let step = Math.abs(hash);
  while (selected.length < 3) {
    const idx = step % allCardIds.length;
    const cardId = allCardIds[idx];
    if (!selected.includes(cardId)) {
      selected.push(cardId);
    }
    step = Math.floor(step / 3) + 7;
  }

  return selected;
}

/**
 * Returns the live 24hrs ticking countdown until the next daily combo rotation (00:00 UTC).
 */
export function getDailyComboCountdown(): string {
  const now = new Date();
  const nextReset = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  const diffMs = Math.max(0, nextReset.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
