import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Home, Languages, PenLine, Volume2, VolumeX } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { PLAYERS, ROUND_TIME, TOTAL_ROUNDS } from '../data/players';
import { containsLatin, translit } from '../lib/translit';
import { makeT } from '../i18n/strings';
import { synth } from '../audio/synth';
import { fx } from '../fx/particles';
import { shakeScreen } from '../fx/shake';
import { Avatar } from './Avatar';
import { CategoryIcon } from './icons';
import { Keypad } from './Keypad';
import type { AiStatus, CommitResult, Grid, Lang } from '../types';

interface GameScreenProps {
  lang: Lang;
  onLang: (l: Lang) => void;
  muted: boolean;
  onMuted: (m: boolean) => void;
  onHome: () => void;
  letter: string;
  roundNumber: number;
  timeLeft: number;
  scores: Record<string, number>;
  grid: Grid;
  typing: Record<string, { catIdx: number; text: string } | null>;
  aiStatus: Record<string, AiStatus>;
  onHumanCommit: (catIdx: number, slotIdx: number, raw: string) => CommitResult;
}

interface Badge {
  id: number;
  x: number;
  y: number;
  text: string;
}

let badgeId = 0;

export function GameScreen({
  lang,
  onLang,
  muted,
  onMuted,
  onHome,
  letter,
  roundNumber,
  timeLeft,
  scores,
  grid,
  typing,
  aiStatus,
  onHumanCommit,
}: GameScreenProps) {
  const t = makeT(lang);
  const fa = lang === 'fa';

  const [focused, setFocused] = useState<{ cat: number; slot: number } | null>(null);
  const [raws, setRaws] = useState<Record<string, string>>({});
  const [badges, setBadges] = useState<Badge[]>([]);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isTouch = useMemo(
    () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
    [],
  );

  const keyOf = (cat: number, slot: number) => `${cat}-${slot}`;

  const focusCell = useCallback((cat: number, slot: number) => {
    setFocused({ cat, slot });
    window.setTimeout(() => inputRefs.current[keyOf(cat, slot)]?.focus(), 10);
  }, []);

  const focusNextEmpty = useCallback(
    (fromCat: number, fromSlot: number) => {
      for (let s = fromSlot + 1; s < 3; s++) {
        if (!grid.you[fromCat][s]) {
          focusCell(fromCat, s);
          return;
        }
      }
      for (let c = fromCat + 1; c < CATEGORIES.length; c++) {
        if (!grid.you[c][0]) {
          focusCell(c, 0);
          return;
        }
      }
      for (let c = 0; c < CATEGORIES.length; c++) {
        for (let s = 0; s < 3; s++) {
          if (!grid.you[c][s]) {
            focusCell(c, s);
            return;
          }
        }
      }
    },
    [grid, focusCell],
  );

  const commit = useCallback(
    (cat: number, slot: number) => {
      const key = keyOf(cat, slot);
      const raw = (raws[key] ?? '').trim();
      if (!raw) return;
      const res = onHumanCommit(cat, slot, raw);
      if (res.status === 'noop') return;

      const el = inputRefs.current[key] ?? cellRefs.current[key];
      if (res.status === 'valid') {
        synth.pop();
        fx.burstAt(el, { count: 18, spread: 0.8 });
        if (el) {
          const r = el.getBoundingClientRect();
          const b: Badge = { id: ++badgeId, x: r.left + r.width / 2, y: r.top, text: '+1' };
          setBadges((bs) => [...bs, b]);
          window.setTimeout(() => setBadges((bs) => bs.filter((x) => x.id !== b.id)), 1200);
        }
      } else if (res.status !== 'debate') {
        synth.buzz();
        shakeScreen();
      }
      setRaws((r) => ({ ...r, [key]: '' }));
      if (res.status !== 'debate') focusNextEmpty(cat, slot);
      else setFocused(null);
    },
    [raws, onHumanCommit, focusNextEmpty],
  );

  // keyboard: Escape blurs
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocused(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const timePct = Math.max(0, Math.min(1, timeLeft / ROUND_TIME));
  const timeColor = timePct > 0.4 ? 'bg-teal-500' : timePct > 0.2 ? 'bg-gold-500' : 'bg-rose-500';

  const showKeypad = isTouch || focused !== null;

  const aiPlayers = PLAYERS.filter((p) => !p.isHuman);
  const counts = (pid: string) =>
    grid[pid]?.reduce((n, row) => n + row.filter((s) => s && s.ok).length, 0) ?? 0;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-3 px-3 py-3">
      {/* HUD */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-ink-800/70 px-3 py-2 backdrop-blur">
        <button
          type="button"
          onClick={onHome}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-paper-100 transition hover:bg-white/20"
          aria-label={t('home')}
        >
          <Home size={17} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-gold-500 bg-gradient-to-b from-gold-400 to-gold-600 font-fa text-2xl font-black text-ink-900 shadow-lg shadow-gold-600/30">
            {letter}
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold text-paper-100/60">
              {t('round')} {roundNumber} {t('of')} {TOTAL_ROUNDS}
            </p>
            <p className="text-sm font-black text-white">
              {fa ? 'نویس کلمه‌ها!' : 'Write the words!'}
            </p>
          </div>
        </div>

        <div className="mx-1 flex min-w-32 flex-1 flex-col gap-1 sm:max-w-64">
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${timeColor} transition-all duration-1000 ease-linear`}
              style={{ width: `${timePct * 100}%` }}
            />
          </div>
          <p className={`text-center text-sm font-black tabular-nums ${timePct <= 0.2 ? 'animate-pulse-soft text-rose-400' : 'text-paper-100'}`}>
            ⏱ {timeLeft}s
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="text-[10px] font-bold uppercase tracking-wider text-paper-100/50">{t('score')}</p>
            <p className="text-lg font-black tabular-nums text-gold-400">{scores.you ?? 0}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onMuted(!muted);
              synth.click();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-paper-100 transition hover:bg-white/20"
            aria-label={t('sound')}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <button
            type="button"
            onClick={() => {
              synth.click();
              onLang(fa ? 'en' : 'fa');
            }}
            className="flex h-9 items-center gap-1 rounded-lg bg-white/10 px-2.5 text-xs font-black text-paper-100 transition hover:bg-white/20"
            aria-label={t('language')}
          >
            <Languages size={15} />
            {fa ? 'EN' : 'فا'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 lg:flex-row">
        {/* board */}
        <div className="paper-card flex-1 rounded-3xl p-3 sm:p-4" onClick={() => setFocused(null)}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold text-ink-800/60">
              <PenLine size={13} className="mb-0.5 me-1 inline" />
              {t('writeHint')}
            </p>
            <p className="hidden text-xs font-bold text-ink-800/40 sm:block">{t('attempts')}</p>
          </div>

          {CATEGORIES.map((cat, ci) => (
            <div key={cat.id} className="mb-2 flex items-stretch gap-2 last:mb-0">
              <div
                className="flex w-24 shrink-0 items-center gap-1.5 rounded-xl px-2 sm:w-32"
                style={{ backgroundColor: `${cat.color}1a`, border: `1px solid ${cat.color}33` }}
              >
                <CategoryIcon id={cat.id} size={16} style={{ color: cat.color }} className="shrink-0" />
                <span className={`truncate text-xs font-extrabold sm:text-sm ${fa ? 'font-fa' : ''}`} style={{ color: cat.color }}>
                  {fa ? cat.fa : cat.en}
                </span>
              </div>

              <div className="grid flex-1 grid-cols-3 gap-1.5 sm:gap-2">
                {[0, 1, 2].map((si) => {
                  const slot = grid.you[ci][si];
                  const key = keyOf(ci, si);
                  const isFoc = focused?.cat === ci && focused?.slot === si;
                  const raw = raws[key] ?? '';

                  if (slot) {
                    return (
                      <div
                        key={si}
                        ref={(el) => {
                          cellRefs.current[key] = el;
                        }}
                        className={`flex h-11 items-center justify-center rounded-lg border px-1.5 text-base font-extrabold sm:h-12 sm:text-lg ${
                          slot.ok
                            ? 'border-emerald-400/60 bg-emerald-50 text-emerald-700'
                            : 'border-rose-400/60 bg-rose-50 text-rose-500 line-through'
                        }`}
                      >
                        <span className="truncate font-fa">{slot.word}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={si}
                      ref={(el) => {
                        cellRefs.current[key] = el;
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        focusCell(ci, si);
                      }}
                      className={`relative flex h-11 cursor-pointer items-center justify-center rounded-lg border-2 px-1.5 transition sm:h-12 ${
                        isFoc
                          ? 'border-gold-500 bg-paper-50 shadow-md'
                          : 'border-dashed border-paper-400/70 bg-paper-50/60 hover:border-gold-500/70'
                      }`}
                    >
                      {isFoc ? (
                        <>
                          <input
                            ref={(el) => {
                              inputRefs.current[key] = el;
                            }}
                            value={raw}
                            dir="rtl"
                            maxLength={14}
                            onChange={(e) => setRaws((r) => ({ ...r, [key]: e.target.value.slice(0, 14) }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commit(ci, si);
                              if (e.key === 'Escape') setFocused(null);
                            }}
                            className="w-full bg-transparent text-center font-fa text-base font-bold text-ink-900 sm:text-lg"
                            placeholder={t('emptyCell')}
                          />
                          {containsLatin(raw) && raw.trim().length > 0 && (
                            <span className="pointer-events-none absolute -bottom-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-ink-900 px-1.5 py-0.5 font-fa text-[11px] font-bold text-gold-300 shadow">
                              {translit(raw)}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-paper-400">{t('emptyCell')}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* AI family panel */}
        <div className="flex flex-row gap-2 lg:w-60 lg:flex-col">
          {aiPlayers.map((p) => {
            const typingNow = typing[p.id];
            const st = aiStatus[p.id] ?? 'idle';
            const n = counts(p.id);
            return (
              <div
                key={p.id}
                className={`flex flex-1 items-center gap-2.5 rounded-2xl border p-2.5 transition lg:flex-none ${
                  st === 'writing'
                    ? 'border-gold-500/50 bg-gold-500/10'
                    : st === 'done'
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-white/10 bg-white/5'
                }`}
              >
                <div className={`shrink-0 ${st === 'writing' ? 'animate-wiggle' : ''}`}>
                  <Avatar emoji={p.avatar} size={40} ring={st === 'writing' ? 'ring-gold-500/70' : 'ring-white/10'} />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-sm font-black text-white">{fa ? p.nameFa : p.nameEn}</p>
                    <span className="text-xs font-black tabular-nums text-gold-400">{n}</span>
                  </div>
                  <div className="mt-0.5 flex h-5 items-center gap-1 text-[11px] font-bold text-paper-100/70">
                    {st === 'writing' && typingNow ? (
                      <>
                        <PenLine size={11} className="shrink-0 text-gold-400" />
                        <span className="truncate font-fa text-gold-300">
                          {typingNow.text}
                          <span className="animate-pulse-soft">▍</span>
                        </span>
                      </>
                    ) : st === 'done' ? (
                      <span className="text-emerald-400">✓ {t('done')}</span>
                    ) : (
                      <span className="flex items-center gap-0.5">
                        {t('thinking')}
                        <span className="flex gap-0.5">
                          <span className="typing-dot inline-block h-1 w-1 rounded-full bg-paper-100/70" />
                          <span className="typing-dot inline-block h-1 w-1 rounded-full bg-paper-100/70" />
                          <span className="typing-dot inline-block h-1 w-1 rounded-full bg-paper-100/70" />
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* keypad */}
      {showKeypad && (
        <Keypad
          onKey={(ch) => {
            if (!focused) return;
            const key = keyOf(focused.cat, focused.slot);
            setRaws((r) => {
              const cur = r[key] ?? '';
              if (cur.length >= 14) return r;
              return { ...r, [key]: cur + ch };
            });
            window.setTimeout(() => inputRefs.current[keyOf(focused.cat, focused.slot)]?.focus(), 10);
          }}
          onDelete={() => {
            if (!focused) return;
            const key = keyOf(focused.cat, focused.slot);
            setRaws((r) => ({ ...r, [key]: (r[key] ?? '').slice(0, -1) }));
          }}
          onEnter={() => focused && commit(focused.cat, focused.slot)}
          canEnter={!!focused && !!(raws[keyOf(focused.cat, focused.slot)] ?? '').trim()}
        />
      )}

      {/* floating +1 badges */}
      {badges.map((b) => (
        <span
          key={b.id}
          className="float-badge pointer-events-none fixed z-[70] text-2xl font-black text-gold-400 drop-shadow-lg"
          style={{ left: b.x, top: b.y }}
        >
          {b.text}
        </span>
      ))}
    </div>
  );
}
