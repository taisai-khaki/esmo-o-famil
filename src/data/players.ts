import type { PlayerDef } from '../types';

export const PLAYERS: PlayerDef[] = [
  {
    id: 'you',
    nameEn: 'You',
    nameFa: 'شما',
    avatar: '🧒',
    isHuman: true,
  },
  {
    id: 'hassan',
    nameEn: 'Uncle Hassan',
    nameFa: 'عمو حسن',
    avatar: '👴',
    isHuman: false,
    personality: 'hassan',
    charMs: [130, 240],
    thinkMs: [800, 1500],
  },
  {
    id: 'sara',
    nameEn: 'Sara',
    nameFa: 'سارا',
    avatar: '👩‍🎓',
    isHuman: false,
    personality: 'sara',
    charMs: [40, 90],
    thinkMs: [250, 650],
  },
  {
    id: 'kian',
    nameEn: 'Kian',
    nameFa: 'کیان',
    avatar: '👦',
    isHuman: false,
    personality: 'kian',
    charMs: [100, 200],
    thinkMs: [450, 1000],
  },
];

export const PLAYER_BY_ID = Object.fromEntries(PLAYERS.map((p) => [p.id, p]));

export const AI_IDS = PLAYERS.filter((p) => !p.isHuman).map((p) => p.id);

export const ROUND_TIME = 75; // seconds
export const TOTAL_ROUNDS = 3;

/**
 * Chance an AI "gets stuck" on a word (mumbles, gives up, tries again) —
 * keeps the word bank from being vacuumed up so a human player has a fair shot.
 */
export const AI_STRUGGLE: Record<string, number> = {
  hassan: 0.12,
  sara: 0.04,
  kian: 0.08,
};
