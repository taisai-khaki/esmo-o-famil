import { useMemo } from 'react';
import { Languages, Play, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import type { HighScore, Lang } from '../types';
import { makeT } from '../i18n/strings';
import { synth } from '../audio/synth';
import { CategoryIcon } from './icons';

interface TitleScreenProps {
  lang: Lang;
  onLang: (l: Lang) => void;
  muted: boolean;
  onMuted: (m: boolean) => void;
  playerName: string;
  onPlayerName: (n: string) => void;
  highScores: HighScore[];
  onPlay: () => void;
}

const FLOAT_LETTERS = ['ا', 'ب', 'پ', 'ت', 'چ', 'ج', 'ح', 'خ', 'د', 'ر', 'ز', 'س', 'ش', 'ص', 'ط', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'ه', 'و', 'ی'];

export function TitleScreen({
  lang,
  onLang,
  muted,
  onMuted,
  playerName,
  onPlayerName,
  highScores,
  onPlay,
}: TitleScreenProps) {
  const t = makeT(lang);
  const fa = lang === 'fa';

  const floating = useMemo(
    () =>
      FLOAT_LETTERS.map((l, i) => ({
        letter: l,
        left: (i * 37) % 100,
        top: (i * 53) % 100,
        delay: (i % 7) * 0.4,
        size: 20 + ((i * 13) % 26),
        rot: ((i * 47) % 40) - 20,
      })),
    [],
  );

  return (
    <div className="relative min-h-full overflow-hidden">
      {/* floating alphabet backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {floating.map((f, i) => (
          <span
            key={i}
            className="absolute animate-float font-fa text-white/[0.07]"
            style={{
              left: `${f.left}%`,
              top: `${f.top}%`,
              fontSize: f.size,
              animationDelay: `${f.delay}s`,
              transform: `rotate(${f.rot}deg)`,
            }}
          >
            {f.letter}
          </span>
        ))}
      </div>

      <div className="relative mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center gap-6 px-4 py-10">
        {/* logo */}
        <div className="text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1 text-sm font-bold text-gold-300">
            <Sparkles size={15} />
            {t('tagline')}
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-lg sm:text-6xl">
            {fa ? (
              <span className="font-fa">اسم و فامیل</span>
            ) : (
              <span>Esm-o-Famil</span>
            )}
          </h1>
          <p className="mt-2 text-lg text-paper-100/80">
            {fa ? <span className="font-fa">Esm-o-Famil</span> : <span className="font-fa">اسم و فامیل</span>}
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-paper-100/60">{t('subtitle')}</p>
        </div>

        {/* category strip */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-paper-100/90"
              title={c.en}
            >
              <CategoryIcon id={c.id} size={14} style={{ color: c.color }} />
              {fa ? c.fa : c.en}
            </div>
          ))}
        </div>

        {/* main card */}
        <div className="paper-card w-full max-w-md rounded-3xl p-5 shadow-2xl">
          <label className="mb-1 block text-sm font-bold text-ink-800/70" htmlFor="player-name">
            {t('yourName')}
          </label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            maxLength={18}
            onChange={(e) => onPlayerName(e.target.value)}
            placeholder={fa ? 'نام شما' : 'Your name'}
            className="mb-4 w-full rounded-xl border border-paper-300 bg-paper-50 px-4 py-3 text-lg font-bold text-ink-900 placeholder:text-ink-800/30 focus:border-gold-500"
          />

          <div className="mb-4 flex items-center gap-2">
            <div className="flex flex-1 items-center overflow-hidden rounded-xl border border-paper-300 bg-paper-50 p-1">
              <Languages size={16} className="ms-2 shrink-0 text-ink-800/50" />
              {(['en', 'fa'] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    synth.click();
                    onLang(l);
                  }}
                  className={`flex-1 rounded-lg py-1.5 text-sm font-extrabold transition ${
                    lang === l ? 'bg-ink-800 text-paper-50 shadow' : 'text-ink-800/50 hover:text-ink-800'
                  }`}
                >
                  {l === 'en' ? 'EN' : 'فا'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                onMuted(!muted);
                synth.click();
              }}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-extrabold transition ${
                muted
                  ? 'border-rose-300 bg-rose-50 text-rose-600'
                  : 'border-paper-300 bg-paper-50 text-ink-800'
              }`}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {muted ? '×' : t('sound')}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              synth.unlock();
              synth.click();
              onPlay();
            }}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-gold-400 to-gold-600 py-4 text-2xl font-black text-ink-900 shadow-lg shadow-gold-600/30 transition hover:brightness-105 active:scale-[0.98]"
          >
            <Play size={26} className="fill-ink-900 transition group-hover:scale-110" />
            {t('play')}
          </button>
        </div>

        {/* how to play */}
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-gold-400">{t('howTo')}</h2>
          <ul className="space-y-1.5 text-sm leading-relaxed text-paper-100/85">
            <li>1️⃣ {t('howTo1')}</li>
            <li>2️⃣ {t('howTo2')}</li>
            <li>3️⃣ {t('howTo3')}</li>
          </ul>
        </div>

        {/* records */}
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-gold-400">{t('records')}</h2>
          {highScores.length === 0 ? (
            <p className="text-sm text-paper-100/50">{t('noRecords')}</p>
          ) : (
            <ol className="space-y-1">
              {highScores.slice(0, 3).map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-center font-black text-gold-400">{i + 1}</span>
                  <span className="flex-1 truncate font-bold text-paper-100">
                    {h.name}
                    {h.lang === 'fa' && <span className="ms-2 inline-block rounded bg-white/10 px-1 text-[10px] font-fa">فا</span>}
                  </span>
                  <span className="font-black text-paper-50">{h.score} {t('score')}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <p className="text-xs text-paper-100/40">
          {fa ? 'برای دورهمی‌های خانوادگی ساخته شد 🫖' : 'Built for family gatherings 🫖'}
        </p>
      </div>
    </div>
  );
}
