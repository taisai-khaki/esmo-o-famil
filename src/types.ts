export type Lang = 'en' | 'fa';

export type Phase = 'title' | 'reciting' | 'playing' | 'debate' | 'results' | 'podium';

export type Personality = 'hassan' | 'sara' | 'kian';

export interface PlayerDef {
  id: string;
  nameEn: string;
  nameFa: string;
  avatar: string;
  isHuman: boolean;
  personality?: Personality;
  /** ms per typed character range */
  charMs?: [number, number];
  /** ms "thinking" between words range */
  thinkMs?: [number, number];
}

export interface SlotData {
  /** display text (Persian) */
  word: string;
  ok: boolean;
}

/** playerId -> category index -> 3 slots */
export type Grid = Record<string, (SlotData | null)[][]>;

export interface DebateState {
  playerId: string;
  catIdx: number;
  slotIdx: number;
  word: string;
  /** pre-rolled votes of the AI family */
  votes: Record<string, boolean>;
}

export interface HighScore {
  name: string;
  score: number;
  date: string;
  lang: Lang;
}

export type AiStatus = 'idle' | 'thinking' | 'writing' | 'done';

export type CommitResult =
  | { status: 'valid'; word: string }
  | { status: 'invalid' | 'repeated' | 'wrongLetter'; word: string }
  | { status: 'debate'; word: string }
  | { status: 'noop' };

export interface CatDef {
  id: string;
  en: string;
  fa: string;
  color: string; // tailwind-agnostic hex
}
