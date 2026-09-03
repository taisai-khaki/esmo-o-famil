import { Check } from 'lucide-react';
import { synth } from '../audio/synth';

const ROWS: string[][] = [
  ['ا', 'ب', 'پ', 'ت', 'چ', 'ج', 'ح', 'خ'],
  ['د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ث'],
  ['ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی'],
];

interface KeypadProps {
  onKey: (ch: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  canEnter: boolean;
}

/**
 * On-screen Persian keyboard — shown on touch devices and whenever a cell
 * is focused, so the game works with a mouse, touch, or physical keyboard.
 */
export function Keypad({ onKey, onDelete, onEnter, canEnter }: KeypadProps) {
  return (
    <div className="mx-auto w-full max-w-lg select-none px-2 pb-3">
      <div className="rounded-2xl border border-white/10 bg-ink-800/90 p-2 shadow-2xl backdrop-blur">
        {ROWS.map((row, ri) => (
          <div key={ri} className="mb-1.5 flex justify-center gap-1.5">
            {row.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => {
                  synth.typing();
                  onKey(ch);
                }}
                className="h-11 min-w-8 flex-1 max-w-12 rounded-lg bg-white/10 text-xl font-bold text-paper-50 transition active:scale-90 active:bg-gold-500/40"
              >
                {ch}
              </button>
            ))}
          </div>
        ))}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onDelete}
            className="h-11 flex-1 rounded-lg bg-white/10 text-lg font-bold text-paper-100 transition active:scale-90 active:bg-rose-500/40"
            aria-label="delete"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={() => canEnter && onEnter()}
            disabled={!canEnter}
            className={`flex h-11 flex-[2] items-center justify-center gap-2 rounded-lg text-lg font-extrabold transition active:scale-95 ${
              canEnter
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 active:bg-teal-500'
                : 'bg-white/5 text-white/30'
            }`}
          >
            <Check size={20} />
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
