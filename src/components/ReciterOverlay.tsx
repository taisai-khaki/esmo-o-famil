import { useEffect, useRef, useState } from 'react';
import { Hand, Sparkles } from 'lucide-react';
import { FA_LETTERS } from '../data/alphabet';
import { pickLetter } from '../data/wordbank';
import { PLAYER_BY_ID, PLAYERS } from '../data/players';
import { makeT } from '../i18n/strings';
import { synth } from '../audio/synth';
import { Avatar } from './Avatar';
import type { Lang } from '../types';

const TILE = 64; // px per letter tile
const WINDOW_H = 176; // px
const STRIP_LEN = 160;

interface ReciterOverlayProps {
  lang: Lang;
  roundNumber: number;
  reciterId: string;
  onLetterChosen: (letter: string) => void;
}

type Mode = 'fast' | 'slow' | 'stopped';

/**
 * The "silent reciter": one family member reads the alphabet in their head
 * while the letter slot spins — you press STOP (button or spacebar) to
 * freeze the letter, just like at the kitchen table.
 */
export function ReciterOverlay({ lang, roundNumber, reciterId, onLetterChosen }: ReciterOverlayProps) {
  const t = makeT(lang);
  const fa = lang === 'fa';
  const reciter = PLAYER_BY_ID[reciterId] ?? PLAYERS[0];

  const stripRef = useRef<string[]>([]);
  if (stripRef.current.length === 0) {
    const s: string[] = [];
    for (let i = 0; i < STRIP_LEN; i++) s.push(FA_LETTERS[i % FA_LETTERS.length]);
    stripRef.current = s;
  }

  const [offset, setOffset] = useState(0);
  const [revealed, setRevealed] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const velRef = useRef(0.55);
  const modeRef = useRef<Mode>('fast');
  const targetRef = useRef(0);
  const lastTileRef = useRef(0);
  const doneRef = useRef(false);

  const stop = () => {
    if (modeRef.current !== 'fast') return;
    synth.click();
    const letter = pickLetter();
    const cur = Math.floor(offsetRef.current / TILE);
    // find the next strip index at least 14 tiles ahead that shows this letter
    let idx = -1;
    for (let i = cur + 14; i < STRIP_LEN - 4; i++) {
      if (FA_LETTERS[i % FA_LETTERS.length] === letter) {
        idx = i;
        break;
      }
    }
    if (idx === -1) idx = cur + 14;
    // center that tile in the window
    targetRef.current = idx * TILE + TILE / 2 - WINDOW_H / 2;
    modeRef.current = 'slow';
  };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      if (modeRef.current === 'fast') {
        velRef.current += (0.55 - velRef.current) * 0.02;
        offsetRef.current += velRef.current * dt;
        const tile = Math.floor(offsetRef.current / TILE);
        if (tile > lastTileRef.current) {
          for (let k = lastTileRef.current + 1; k <= tile; k++) {
            if (k % 4 === 0) synth.tick();
          }
          lastTileRef.current = tile;
        }
        setOffset(offsetRef.current);
        raf = requestAnimationFrame(loop);
      } else if (modeRef.current === 'slow') {
        const d = targetRef.current - offsetRef.current;
        velRef.current = Math.abs(d) * 0.014;
        offsetRef.current += velRef.current * dt;
        const tile = Math.floor(offsetRef.current / TILE);
        if (tile > lastTileRef.current) {
          synth.tick();
          lastTileRef.current = tile;
        }
        setOffset(offsetRef.current);
        if (Math.abs(d) < 1.2) {
          offsetRef.current = targetRef.current;
          setOffset(targetRef.current);
          modeRef.current = 'stopped';
          const letter = FA_LETTERS[
            Math.round((offsetRef.current + WINDOW_H / 2 - TILE / 2) / TILE) % FA_LETTERS.length
          ];
          setRevealed(letter);
          synth.stopFanfare();
          window.setTimeout(() => {
            if (!doneRef.current) {
              doneRef.current = true;
              onLetterChosen(letter);
            }
          }, 1600);
          return;
        }
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        stop();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startIdx = Math.max(0, Math.floor(offset / TILE) - 3);
  const endIdx = Math.min(STRIP_LEN - 1, Math.ceil(offset / TILE) + 4);
  const visible: string[] = [];
  for (let i = startIdx; i <= endIdx; i++) visible.push(stripRef.current[i]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-ink-950/95 px-4 backdrop-blur-sm">
      {/* reciter */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="animate-float">
            <Avatar emoji={reciter.avatar} size={72} ring="ring-gold-500/60" />
          </div>
          <div>
            <p className="text-xl font-black text-white">
              {fa ? reciter.nameFa : reciter.nameEn}
            </p>
            <p className="text-sm text-paper-100/70">{t('reciting')}</p>
          </div>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-gold-400">
          {t('round')} {roundNumber}
        </p>
      </div>

      {/* letter slot */}
      {revealed ? (
        <div className="flex flex-col items-center gap-4">
          <div className="letter-in flex h-40 w-36 items-center justify-center rounded-3xl border-4 border-gold-500 bg-gradient-to-b from-gold-400 to-gold-600 shadow-[0_0_60px_rgba(245,179,1,0.5)]">
            <span className="font-fa text-8xl font-black text-ink-900">{revealed}</span>
          </div>
          <p className="text-lg font-black text-gold-300">
            {t('letterIs')} <span className="font-fa">{revealed}</span>
          </p>
        </div>
      ) : (
        <>
          <div
            className="relative w-36 overflow-hidden rounded-2xl border-2 border-white/20 bg-ink-800/80 shadow-2xl"
            style={{ height: WINDOW_H }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-ink-950/90 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-ink-950/90 to-transparent" />
            <div className="pointer-events-none absolute inset-x-3 top-1/2 z-10 -translate-y-1/2 border-y-2 border-gold-500/40" />
            <div
              className="absolute inset-x-0 top-0 font-fa"
              style={{ transform: `translateY(${-offset}px)`, paddingTop: startIdx * TILE }}
            >
              {visible.map((ch, k) => {
                const i = startIdx + k;
                const dist = Math.abs(i * TILE + TILE / 2 - offset - WINDOW_H / 2);
                const scale = Math.max(0.6, 1 - dist / 400);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-center text-5xl font-black text-paper-100"
                    style={{ height: TILE, opacity: Math.max(0.25, 1 - dist / 260), transform: `scale(${scale})` }}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={stop}
            className="group flex items-center gap-3 rounded-2xl bg-gradient-to-b from-rose-500 to-rose-600 px-10 py-4 text-3xl font-black text-white shadow-lg shadow-rose-600/40 transition hover:brightness-110 active:scale-95"
          >
            <Hand size={30} />
            {t('stop')}
          </button>
          <p className="flex items-center gap-2 text-sm text-paper-100/60">
            <Sparkles size={14} className="text-gold-400" />
            {t('pressStop')} <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-bold">Space</kbd>
          </p>
        </>
      )}
    </div>
  );
}
