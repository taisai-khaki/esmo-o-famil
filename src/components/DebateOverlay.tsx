import { useEffect, useMemo, useState } from 'react';
import { Gavel, ThumbsDown, ThumbsUp } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { PLAYER_BY_ID, PLAYERS } from '../data/players';
import type { Personality, PlayerDef } from '../types';
import { DEBATE_LINES } from '../data/risky';
import type { DebateLine } from '../data/risky';
import { makeT } from '../i18n/strings';
import { synth } from '../audio/synth';
import { Avatar } from './Avatar';
import { CategoryIcon } from './icons';
import type { DebateState, Lang } from '../types';

interface DebateOverlayProps {
  debate: DebateState;
  lang: Lang;
  onVerdict: (ok: boolean) => void;
}

const SPEAKERS = PLAYERS.filter(
  (p): p is PlayerDef & { personality: Personality } => !!p.personality,
).sort(
  (a, b) => ['hassan', 'sara', 'kian'].indexOf(a.personality) - ['hassan', 'sara', 'kian'].indexOf(b.personality),
);

/**
 * The animated comic debate panel: when a word is too rare (or too funny),
 * the family argues and the human player holds the final vote.
 */
export function DebateOverlay({ debate, lang, onVerdict }: DebateOverlayProps) {
  const t = makeT(lang);
  const fa = lang === 'fa';
  const [step, setStep] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [votesShown, setVotesShown] = useState(false);

  const writer = PLAYER_BY_ID[debate.playerId];
  const cat = CATEGORIES[debate.catIdx];

  const lines = useMemo<Record<string, DebateLine>>(() => {
    const out: Record<string, DebateLine> = {};
    for (const p of SPEAKERS) {
      const personality = p.personality!;
      const pool = DEBATE_LINES[personality][debate.votes[p.id] ? 'support' : 'skeptic'];
      out[p.id] = pool[Math.floor(Math.random() * pool.length)];
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debate]);

  // reveal lines one by one
  useEffect(() => {
    if (skipped) return;
    if (step >= SPEAKERS.length) {
      setVotesShown(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setStep((s) => s + 1);
      if (SPEAKERS[step].personality === 'kian') synth.debateLaugh();
      else synth.pop();
    }, step === 0 ? 700 : 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, skipped]);

  const decideNow = skipped || step >= SPEAKERS.length || votesShown;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/92 p-3 backdrop-blur-sm">
      <div className="animate-pop max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-gold-500/50 bg-ink-800 shadow-[0_0_80px_rgba(245,179,1,0.25)]">
        {/* header */}
        <div className="flex flex-col items-center gap-1 px-6 pt-6 text-center">
          <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-500">
            <span className="animate-pulse-soft">⚡</span> {t('debateTitle')} <span className="animate-pulse-soft">⚡</span>
          </div>
          <p className="text-sm text-paper-100/70">
            <span className="font-bold text-white">{fa ? writer?.nameFa : writer?.nameEn}</span>{' '}
            {fa ? 'نوشته:' : 'wrote:'}
          </p>
          <div className="my-2 flex items-center gap-3 rounded-2xl border border-gold-500/40 bg-gold-500/10 px-6 py-3">
            <span className="font-fa text-4xl font-black text-gold-400 sm:text-5xl">{debate.word}</span>
            <CategoryIcon id={cat.id} size={28} style={{ color: cat.color }} />
          </div>
          <p className="text-sm text-paper-100/80">
            {t('debatePrompt')} <b className="text-white">{fa ? cat.fa : cat.en}</b> {t('debateCountAs')}?
          </p>
        </div>

        {/* comic row */}
        <div className="grid grid-cols-3 gap-2 px-4 pb-2 pt-4">
          {SPEAKERS.map((p, i) => {
            const said = !skipped && step > i;
            const line = lines[p.id];
            const vote = debate.votes[p.id];
            return (
              <div key={p.id} className="flex flex-col items-center gap-1.5">
                {said && (
                  <div className="animate-bubble w-full rounded-2xl border border-white/15 bg-paper-100 p-2 text-center shadow-lg">
                    <p className={`text-[11px] leading-snug text-ink-800 ${fa ? 'font-fa' : ''}`}>
                      {fa ? line.fa : line.en}
                    </p>
                  </div>
                )}
                <div className={`transition ${said ? '' : 'opacity-60'}`}>
                  <Avatar emoji={p.avatar} size={52} ring={said ? 'ring-gold-500/70' : 'ring-white/10'} />
                </div>
                <p className="text-xs font-bold text-paper-100/90">{fa ? p.nameFa : p.nameEn}</p>
                <div className="h-7">
                  {said && votesShown && (
                    <span className={`animate-pop inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black ${vote ? 'bg-teal-600/30 text-teal-300' : 'bg-rose-600/30 text-rose-300'}`}>
                      {vote ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
                      {vote ? '✓' : '✗'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* judge bar */}
        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4">
          {decideNow ? (
            <div className="animate-pop">
              <p className="mb-3 flex items-center justify-center gap-2 text-center text-sm font-black text-gold-300">
                <Gavel size={18} />
                {t('judge')}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onVerdict(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-teal-500 to-teal-600 py-3.5 text-lg font-black text-white shadow-lg shadow-teal-600/30 transition hover:brightness-110 active:scale-95"
                >
                  <ThumbsUp size={20} />
                  {t('accept')}
                </button>
                <button
                  type="button"
                  onClick={() => onVerdict(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 py-3.5 text-lg font-black text-white shadow-lg shadow-rose-600/30 transition hover:brightness-110 active:scale-95"
                >
                  <ThumbsDown size={20} />
                  {t('reject')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSkipped(true);
                setStep(SPEAKERS.length);
                setVotesShown(true);
                synth.click();
              }}
              className="mx-auto rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-paper-100/70 transition hover:bg-white/10"
            >
              {t('skipDebate')} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
