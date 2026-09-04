import { useEffect, useRef } from 'react';
import { Crown, Home, Medal, Play, Sparkles } from 'lucide-react';
import { PLAYERS } from '../data/players';
import { makeT } from '../i18n/strings';
import { fx } from '../fx/particles';
import { synth } from '../audio/synth';
import { Avatar } from './Avatar';
import type { HighScore, Lang } from '../types';

interface PodiumScreenProps {
  lang: Lang;
  scores: Record<string, number>;
  playerName: string;
  highScores: HighScore[];
  isRecord: boolean;
  onPlayAgain: () => void;
  onHome: () => void;
}

const RANK_STYLE = [
  { h: 150, front: 'linear-gradient(180deg,#ffd54a,#d99a00)', top: '#ffe08a', label: '1' },
  { h: 108, front: 'linear-gradient(180deg,#cbd5e1,#94a3b8)', top: '#e2e8f0', label: '2' },
  { h: 84, front: 'linear-gradient(180deg,#d99a6c,#a9683a)', top: '#e8b58a', label: '3' },
];

export function PodiumScreen({
  lang,
  scores,
  playerName,
  highScores,
  isRecord,
  onPlayAgain,
  onHome,
}: PodiumScreenProps) {
  const t = makeT(lang);
  const fa = lang === 'fa';
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fx.rain(170);
    window.setTimeout(() => synth.win(), 350);
  }, []);

  const ranked = [...PLAYERS].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  const nameOf = (pid: string) => {
    const p = PLAYERS.find((x) => x.id === pid);
    if (!p) return pid;
    return p.isHuman ? playerName || t('you') : fa ? p.nameFa : p.nameEn;
  };

  // visual order: 2nd, 1st, 3rd
  const visualOrder = [top3[1], top3[0], top3[2]];
  const visualRank = [1, 0, 2];

  return (
    <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-center justify-center gap-5 px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          <Sparkles size={26} className="mb-1 inline text-gold-400" />
          {t('podium')}
        </h1>
        {isRecord && (
          <div className="animate-pop mt-3 inline-flex items-center gap-2 rounded-full border border-gold-500/50 bg-gold-500/15 px-5 py-1.5 text-sm font-black text-gold-300">
            🎉 {t('newRecord')}
          </div>
        )}
      </div>

      {/* 3D podium */}
      <div className="podium-scene flex w-full max-w-xl items-end justify-center gap-2 sm:gap-4">
        {visualOrder.map((p, vi) => {
          const rank = visualRank[vi];
          const st = RANK_STYLE[rank];
          const score = scores[p.id] ?? 0;
          return (
            <div key={p.id} className="flex flex-col items-center" style={{ width: '31%' }}>
              {/* avatar + name floating above */}
              <div className="animate-rise mb-2 flex flex-col items-center gap-1" style={{ animationDelay: `${0.4 + rank * 0.12}s` }}>
                {rank === 0 && <Crown size={30} className="crown-float text-gold-400" />}
                <Avatar emoji={p.avatar} size={rank === 0 ? 68 : 56} ring={rank === 0 ? 'ring-gold-400' : 'ring-white/20'} />
                <p className="max-w-full truncate text-sm font-black text-white">{nameOf(p.id)}</p>
                <p className="text-lg font-black tabular-nums text-gold-300">{score}</p>
              </div>
              {/* 3D block */}
              <div className="podium-block" style={{ height: st.h, width: '100%', animationDelay: `${rank * 0.15}s` }}>
                <div className="podium-top" style={{ background: st.top }} />
                <div className="podium-front flex items-center justify-center" style={{ background: st.front }}>
                  <span className="font-black text-white/80" style={{ fontSize: st.h * 0.4 }}>
                    {st.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <p className="animate-rise text-sm text-paper-100/60" style={{ animationDelay: '0.8s' }}>
          + {rest.map((p) => nameOf(p.id)).join(fa ? '، ' : ', ')} — {scores[rest[0].id] ?? 0} {t('score')}
        </p>
      )}

      {/* high scores */}
      <div className="w-full max-w-md animate-rise rounded-2xl border border-white/10 bg-white/5 p-4" style={{ animationDelay: '0.9s' }}>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-gold-400">
          <Medal size={16} />
          {t('topRecords')}
        </h2>
        {highScores.length === 0 ? (
          <p className="text-sm text-paper-100/50">{t('noRecords')}</p>
        ) : (
          <ol className="space-y-1.5">
            {highScores.slice(0, 5).map((h, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <span className="w-6 text-center text-base">{['🥇', '🥈', '🥉', '4', '5'][i]}</span>
                <span className="flex-1 truncate font-bold text-paper-100">
                  {h.name}
                  {h.lang === 'fa' && <span className="ms-2 rounded bg-white/10 px-1 text-[10px] font-fa">فا</span>}
                </span>
                <span className="font-black tabular-nums text-paper-50">{h.score}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-b from-gold-400 to-gold-600 px-8 py-3.5 text-lg font-black text-ink-900 shadow-lg shadow-gold-600/30 transition hover:brightness-105 active:scale-95"
        >
          <Play size={20} className="fill-ink-900" />
          {t('playAgain')}
        </button>
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-3.5 text-lg font-black text-paper-100 transition hover:bg-white/10 active:scale-95"
        >
          <Home size={20} />
          {t('home')}
        </button>
      </div>
    </div>
  );
}
