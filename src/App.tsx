import { useCallback, useEffect, useRef, useState } from 'react';
import { CATEGORIES } from './data/categories';
import { AI_IDS, AI_STRUGGLE, PLAYERS, PLAYER_BY_ID, ROUND_TIME, TOTAL_ROUNDS } from './data/players';
import { bankWordsFor, isBankWord } from './data/wordbank';
import { RISKY_WORDS, VOTE_TENDENCY } from './data/risky';
import { isPersianText, normalizeFa, startsWithLetter } from './lib/validate';
import { toPersian } from './lib/translit';
import { synth } from './audio/synth';
import { fx, ParticleLayer } from './fx/particles';
import { shakeScreen } from './fx/shake';
import { TitleScreen } from './components/TitleScreen';
import { ReciterOverlay } from './components/ReciterOverlay';
import { GameScreen } from './components/GameScreen';
import { DebateOverlay } from './components/DebateOverlay';
import { ResultsScreen } from './components/ResultsScreen';
import { PodiumScreen } from './components/PodiumScreen';
import type { AiStatus, CommitResult, DebateState, Grid, HighScore, Lang, Phase } from './types';

function emptyGrid(): Grid {
  const g: Grid = {};
  for (const p of PLAYERS) g[p.id] = CATEGORIES.map(() => [null, null, null]);
  return g;
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomReciter = (): string => pick(PLAYERS).id;

// Storage can be unavailable in private browsing, embedded previews, or when
// the browser blocks third-party storage. Never let that prevent the game from
// mounting — settings are a convenience, not a requirement.
function readStorage(key: string, fallback = ''): string {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Continue with an in-memory session when storage is unavailable.
  }
}

interface AiTimer {
  timeout?: number;
  interval?: number;
  done: boolean;
}

interface CommitTarget {
  catIdx: number;
  slotIdx: number;
  word: string;
  risky?: boolean;
}

export default function App() {
  // ---------- persistent settings ----------
  const [lang, setLang] = useState<Lang>(() => {
    const v = readStorage('ef-lang');
    return v === 'fa' || v === 'en' ? v : 'en';
  });
  const [muted, setMuted] = useState(() => readStorage('ef-muted') === '1');
  const [playerName, setPlayerName] = useState(() => readStorage('ef-name'));
  const [highScores, setHighScores] = useState<HighScore[]>(() => {
    try {
      const saved = JSON.parse(readStorage('ef-scores', '[]')) as unknown;
      return Array.isArray(saved) ? (saved as HighScore[]) : [];
    } catch {
      return [];
    }
  });

  // ---------- game state ----------
  const [phase, setPhase] = useState<Phase>('title');
  const [roundNumber, setRoundNumber] = useState(1);
  const [letter, setLetter] = useState('');
  const [reciterId, setReciterId] = useState('hassan');
  const [grid, setGridState] = useState<Grid>(() => emptyGrid());
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [debate, setDebate] = useState<DebateState | null>(null);
  const [typing, setTyping] = useState<Record<string, { catIdx: number; text: string } | null>>({});
  const [aiStatus, setAiStatus] = useState<Record<string, AiStatus>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [roundScores, setRoundScores] = useState<Record<string, number>>({});
  const [isRecord, setIsRecord] = useState(false);

  // ---------- refs (authoritative, mutable) ----------
  const gridRef = useRef(grid);
  const usedRef = useRef<Set<string>>(new Set());
  const debateCountRef = useRef<Record<string, number>>({});
  const phaseRef = useRef(phase);
  const letterRef = useRef(letter);
  const recordSavedRef = useRef(false);
  const aiTimersRef = useRef<Record<string, AiTimer>>(
    Object.fromEntries(PLAYERS.map((p) => [p.id, { done: false }])) as Record<string, AiTimer>,
  );

  phaseRef.current = phase;
  letterRef.current = letter;

  const setGrid = useCallback((g: Grid) => {
    gridRef.current = g;
    setGridState(g);
  }, []);

  // ---------- effects: settings ----------
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.classList.toggle('lang-fa', lang === 'fa');
    writeStorage('ef-lang', lang);
  }, [lang]);

  useEffect(() => {
    writeStorage('ef-muted', muted ? '1' : '0');
    synth.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    writeStorage('ef-name', playerName);
  }, [playerName]);

  // ---------- flow ----------
  const startGame = useCallback(() => {
    setScores(Object.fromEntries(PLAYERS.map((p) => [p.id, 0])));
    setRoundScores({});
    setRoundNumber(1);
    setReciterId(randomReciter());
    setGrid(emptyGrid());
    usedRef.current = new Set();
    debateCountRef.current = Object.fromEntries(PLAYERS.map((p) => [p.id, 0]));
    recordSavedRef.current = false;
    setIsRecord(false);
    setPhase('reciting');
  }, [setGrid]);

  const onLetterChosen = useCallback(
    (l: string) => {
      setLetter(l);
      setGrid(emptyGrid());
      usedRef.current = new Set();
      debateCountRef.current = Object.fromEntries(PLAYERS.map((p) => [p.id, 0]));
      setTimeLeft(ROUND_TIME);
      setTyping({});
      setAiStatus(Object.fromEntries(PLAYERS.map((p) => [p.id, 'idle' as AiStatus])));
      setPhase('playing');
    },
    [setGrid],
  );

  const commitSlot = useCallback(
    (pid: string, catIdx: number, slotIdx: number, word: string, ok: boolean) => {
      const g = gridRef.current;
      const next: Grid = {
        ...g,
        [pid]: g[pid].map((row, i) => (i === catIdx ? row.map((s, j) => (j === slotIdx ? { word, ok } : s)) : row)),
      };
      setGrid(next);
    },
    [setGrid],
  );

  const openDebate = useCallback((pid: string, catIdx: number, slotIdx: number, word: string) => {
    const votes: Record<string, boolean> = {};
    for (const p of PLAYERS) {
      if (p.isHuman) continue;
      const tend = p.personality ? VOTE_TENDENCY[p.personality] : 0.5;
      votes[p.id] = Math.random() < tend;
    }
    setDebate({ playerId: pid, catIdx, slotIdx, word, votes });
    setPhase('debate');
    synth.gong();
  }, []);

  const onHumanCommit = useCallback(
    (catIdx: number, slotIdx: number, raw: string): CommitResult => {
      const l = letterRef.current;
      const word = toPersian(raw);
      const norm = normalizeFa(word);
      if (!word || norm.length < 2) return { status: 'noop' };
      if (!startsWithLetter(word, l)) {
        commitSlot('you', catIdx, slotIdx, word, false);
        return { status: 'wrongLetter', word };
      }
      if (usedRef.current.has(norm)) {
        commitSlot('you', catIdx, slotIdx, word, false);
        return { status: 'repeated', word };
      }
      if (isBankWord(CATEGORIES[catIdx].id, norm)) {
        usedRef.current.add(norm);
        commitSlot('you', catIdx, slotIdx, word, true);
        return { status: 'valid', word };
      }
      if (isPersianText(word) && (debateCountRef.current.you ?? 0) < 2) {
        debateCountRef.current.you = (debateCountRef.current.you ?? 0) + 1;
        openDebate('you', catIdx, slotIdx, word);
        return { status: 'debate', word };
      }
      commitSlot('you', catIdx, slotIdx, word, false);
      return { status: 'invalid', word };
    },
    [commitSlot, openDebate],
  );

  const verdict = useCallback(
    (ok: boolean) => {
      const d = debate;
      if (!d) return;
      if (ok) {
        usedRef.current.add(normalizeFa(d.word));
        commitSlot(d.playerId, d.catIdx, d.slotIdx, d.word, true);
        synth.pop();
        fx.burst(window.innerWidth / 2, window.innerHeight * 0.35, { count: 40, spread: 1.2 });
      } else {
        if (d.playerId === 'you') {
          commitSlot('you', d.catIdx, d.slotIdx, d.word, false);
        }
        synth.buzz();
        shakeScreen();
      }
      setDebate(null);
      setPhase('playing');
    },
    [debate, commitSlot],
  );

  const endRound = useCallback(() => {
    const rs: Record<string, number> = {};
    for (const p of PLAYERS) {
      rs[p.id] = gridRef.current[p.id].reduce((n, row) => n + row.filter((s) => s && s.ok).length, 0);
    }
    setRoundScores(rs);
    setScores((s) => {
      const ns = { ...s };
      for (const p of PLAYERS) ns[p.id] = (ns[p.id] ?? 0) + rs[p.id];
      return ns;
    });
    setPhase('results');
  }, []);

  const nextRound = useCallback(() => {
    synth.click();
    if (roundNumber >= TOTAL_ROUNDS) {
      setPhase('podium');
    } else {
      setRoundNumber((n) => n + 1);
      setReciterId(randomReciter());
      setPhase('reciting');
    }
  }, [roundNumber]);

  const goHome = useCallback(() => {
    synth.click();
    setPhase('title');
  }, []);

  // ---------- AI family ----------
  const firstEmptySlot = (pid: string, catIdx: number): number => gridRef.current[pid][catIdx].findIndex((s) => s === null);

  const pickAiTarget = (pid: string): CommitTarget | null => {
    const l = letterRef.current;
    const order = shuffle(CATEGORIES.map((_, i) => i));

    // Kian takes 50/50 chances at a risky (debate-triggering) word
    if (pid === 'kian' && (debateCountRef.current.kian ?? 0) < 2 && Math.random() < 0.5) {
      for (const ci of order) {
        const slotIdx = firstEmptySlot(pid, ci);
        if (slotIdx === -1) continue;
        const cands = (RISKY_WORDS[CATEGORIES[ci].id] ?? []).filter(
          (w) => startsWithLetter(w, l) && !usedRef.current.has(normalizeFa(w)),
        );
        if (cands.length) return { catIdx: ci, slotIdx, word: pick(cands), risky: true };
      }
    }

    for (const ci of order) {
      const slotIdx = firstEmptySlot(pid, ci);
      if (slotIdx === -1) continue;
      const cands = bankWordsFor(CATEGORIES[ci].id, l, usedRef.current);
      if (cands.length) return { catIdx: ci, slotIdx, word: pick(cands), risky: false };
    }
    return null;
  };

  const typeWord = (pid: string, target: CommitTarget) => {
    const st = aiTimersRef.current[pid];
    const p = PLAYER_BY_ID[pid];
    const [cMin, cMax] = p.charMs ?? [80, 150];
    const stepMs = cMin + Math.random() * (cMax - cMin);
    let i = 0;
    setTyping((tp) => ({ ...tp, [pid]: { catIdx: target.catIdx, text: '' } }));
    st.interval = window.setInterval(() => {
      if (phaseRef.current !== 'playing') return; // debate pauses the table
      i++;
      setTyping((tp) => ({ ...tp, [pid]: { catIdx: target.catIdx, text: target.word.slice(0, i) } }));
      if (i % 2 === 0) synth.typing();
      if (i >= target.word.length) {
        window.clearInterval(st.interval);
        st.interval = undefined;
        setTyping((tp) => ({ ...tp, [pid]: null }));
        if (target.risky) {
          debateCountRef.current[pid] = (debateCountRef.current[pid] ?? 0) + 1;
          openDebate(pid, target.catIdx, target.slotIdx, target.word);
        } else {
          usedRef.current.add(normalizeFa(target.word));
          commitSlot(pid, target.catIdx, target.slotIdx, target.word, true);
        }
        scheduleAiTurn(pid);
      }
    }, stepMs);
  };

  const scheduleAiTurn = (pid: string) => {
    const st = aiTimersRef.current[pid];
    if (st.done || st.timeout) return;
    const p = PLAYER_BY_ID[pid];
    const [tMin, tMax] = p.thinkMs ?? [400, 900];
    const delay = tMin + Math.random() * (tMax - tMin);
    st.timeout = window.setTimeout(() => {
      st.timeout = undefined;
      if (phaseRef.current !== 'playing') {
        scheduleAiTurn(pid); // wait out the debate
        return;
      }
      if (Math.random() < (AI_STRUGGLE[pid] ?? 0.08)) {
        // "I… I don't know!" — stuck on a word, thinks again
        scheduleAiTurn(pid);
        return;
      }
      const target = pickAiTarget(pid);
      if (!target) {
        st.done = true;
        setAiStatus((s) => ({ ...s, [pid]: 'done' }));
        return;
      }
      setAiStatus((s) => ({ ...s, [pid]: 'writing' }));
      typeWord(pid, target);
    }, delay);
  };

  // ---------- effects: round timer + AI loop ----------
  const roundActive = phase === 'playing' || phase === 'debate';

  useEffect(() => {
    if (!roundActive) return;
    for (const pid of AI_IDS) {
      const st = aiTimersRef.current[pid];
      st.done = false;
      setAiStatus((s) => ({ ...s, [pid]: 'thinking' }));
      scheduleAiTurn(pid);
    }
    return () => {
      for (const pid of AI_IDS) {
        const st = aiTimersRef.current[pid];
        if (st.timeout) window.clearTimeout(st.timeout);
        if (st.interval) window.clearInterval(st.interval);
        st.timeout = undefined;
        st.interval = undefined;
      }
      setTyping({});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundActive, roundNumber]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const iv = window.setInterval(() => {
      setTimeLeft((tl) => Math.max(0, tl - 1));
    }, 1000);
    return () => window.clearInterval(iv);
  }, [phase, roundNumber]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) endRound();
  }, [timeLeft, phase, endRound]);

  // ---------- effects: save record on podium ----------
  useEffect(() => {
    if (phase !== 'podium' || recordSavedRef.current) return;
    recordSavedRef.current = true;
    const total = scores.you ?? 0;
    const entry: HighScore = {
      name: playerName.trim() || (lang === 'fa' ? 'شما' : 'You'),
      score: total,
      date: new Date().toISOString(),
      lang,
    };
    const list = [...highScores, entry].sort((a, b) => b.score - a.score).slice(0, 10);
    setIsRecord(total > 0 && list[0] === entry);
    setHighScores(list);
    writeStorage('ef-scores', JSON.stringify(list));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---------- render ----------
  return (
    <div id="shake-root" className="min-h-full">
      <ParticleLayer />

      {phase === 'title' && (
        <TitleScreen
          lang={lang}
          onLang={setLang}
          muted={muted}
          onMuted={setMuted}
          playerName={playerName}
          onPlayerName={setPlayerName}
          highScores={highScores}
          onPlay={startGame}
        />
      )}

      {phase === 'reciting' && (
        <ReciterOverlay
          lang={lang}
          roundNumber={roundNumber}
          reciterId={reciterId}
          onLetterChosen={onLetterChosen}
        />
      )}

      {(phase === 'playing' || phase === 'debate') && (
        <GameScreen
          lang={lang}
          onLang={setLang}
          muted={muted}
          onMuted={setMuted}
          onHome={goHome}
          letter={letter}
          roundNumber={roundNumber}
          timeLeft={timeLeft}
          scores={scores}
          grid={grid}
          typing={typing}
          aiStatus={aiStatus}
          onHumanCommit={onHumanCommit}
        />
      )}

      {phase === 'debate' && debate && (
        <DebateOverlay debate={debate} lang={lang} onVerdict={verdict} />
      )}

      {phase === 'results' && (
        <ResultsScreen
          lang={lang}
          roundNumber={roundNumber}
          letter={letter}
          grid={grid}
          roundScores={roundScores}
          scores={scores}
          playerName={playerName}
          onNext={nextRound}
        />
      )}

      {phase === 'podium' && (
        <PodiumScreen
          lang={lang}
          scores={scores}
          playerName={playerName}
          highScores={highScores}
          isRecord={isRecord}
          onPlayAgain={startGame}
          onHome={goHome}
        />
      )}
    </div>
  );
}
