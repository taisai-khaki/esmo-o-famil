import { useEffect, useRef } from 'react';
import { ChevronRight, Crown } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { PLAYERS, TOTAL_ROUNDS } from '../data/players';
import { makeT } from '../i18n/strings';
import { fx } from '../fx/particles';
import { synth } from '../audio/synth';
import { Avatar } from './Avatar';
import { CategoryIcon } from './icons';
import type { Grid, Lang } from '../types';

interface ResultsScreenProps {
  lang: Lang;
  roundNumber: number;
  letter: string;
  grid: Grid;
  roundScores: Record<string, number>;
  scores: Record<string, number>;
  playerName: string;
  onNext: () => void;
}

export function ResultsScreen({
  lang,
  roundNumber,
  letter,
  grid,
  roundScores,
  scores,
  playerName,
  onNext,
}: ResultsScreenProps) {
  const t = makeT(lang);
  const fa = lang === 'fa';
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fx.rain(90);
    synth.countBeep(true);
  }, []);

  const winner = PLAYERS.reduce((best, p) =>
    (roundScores[p.id] ?? 0) > (roundScores[best.id] ?? 0) ? p : best,
  );

  const isFinal = roundNumber >= TOTAL_ROUNDS;
  const winnerName = (p: (typeof PLAYERS)[number]) =>
    p.isHuman ? (playerName || t('you')) : fa ? p.nameFa : p.nameEn;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center gap-4 px-3 py-6">
      <div className="animate-pop flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gold-500 bg-gradient-to-b from-gold-400 to-gold-600 font-fa text-2xl font-black text-ink-900">
          {letter}
        </div>
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            {isFinal ? t('finalResults') : t('results')}
          </h1>
          <p className="text-sm text-paper-100/60">
            {t('round')} {roundNumber} {t('of')} {TOTAL_ROUNDS}
          </p>
        </div>
      </div>

      {/* winner banner */}
      <div className="animate-rise flex items-center gap-3 rounded-2xl border border-gold-500/40 bg-gold-500/10 px-5 py-2.5" style={{ animationDelay: '0.15s' }}>
        <Crown size={26} className="crown-float text-gold-400" />
        <p className="text-lg font-black text-gold-300">
          {winnerName(winner)} {t('roundWinner')}
          {winner.isHuman && ` (${t('you')})`}
        </p>
      </div>

      {/* player cards */}
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PLAYERS.map((p, i) => {
          const words = CATEGORIES.map((cat, ci) => ({
            cat,
            ws: (grid[p.id]?.[ci] ?? []).filter((s): s is NonNullable<typeof s> => !!s),
          })).filter((x) => x.ws.length > 0);
          const round = roundScores[p.id] ?? 0;
          return (
            <div
              key={p.id}
              className="paper-card animate-rise rounded-2xl p-3.5"
              style={{ animationDelay: `${0.25 + i * 0.1}s` }}
            >
              <div className="mb-2 flex items-center gap-2.5">
                <Avatar emoji={p.avatar} size={44} ring={p.id === winner.id ? 'ring-gold-500' : 'ring-paper-300'} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-sm font-black text-ink-900">
                    {p.id === winner.id && <Crown size={14} className="shrink-0 text-gold-600" />}
                    {winnerName(p)}
                  </p>
                  <p className="text-[11px] font-bold text-ink-800/50">
                    {round} {t('wordsFound')}
                  </p>
                </div>
                <div className="text-right leading-none">
                  <p className="text-2xl font-black text-ink-900 tabular-nums">{round}</p>
                  <p className="text-[10px] font-bold text-ink-800/40">{t('total')}: {scores[p.id] ?? 0}</p>
                </div>
              </div>
              <div className="space-y-1">
                {words.map(({ cat, ws }) => (
                  <div key={cat.id} className="flex items-start gap-1.5 text-xs">
                    <CategoryIcon id={cat.id} size={13} className="mt-0.5 shrink-0" style={{ color: cat.color }} />
                    <p className={`min-w-0 font-bold leading-snug text-ink-800/80 ${fa ? 'font-fa' : ''}`}>
                      {ws.map((w) => (w.ok ? w.word : `~~${w.word}~~`)).join(fa ? '، ' : ', ')}
                    </p>
                  </div>
                ))}
                {words.length === 0 && (
                  <p className="text-xs italic text-ink-800/40">{fa ? 'هیچ کلمه‌ای…' : 'No words…'}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="animate-rise mt-1 flex items-center gap-2 rounded-2xl bg-gradient-to-b from-gold-400 to-gold-600 px-10 py-4 text-xl font-black text-ink-900 shadow-lg shadow-gold-600/30 transition hover:brightness-105 active:scale-95"
        style={{ animationDelay: '0.7s' }}
      >
        {isFinal
          ? fa ? 'سکو را ببین! 🏆' : 'See the podium! 🏆'
          : fa ? 'دور بعدی' : t('nextRound')}
        <ChevronRight size={22} className={fa ? 'rotate-180' : ''} />
      </button>
    </div>
  );
}
