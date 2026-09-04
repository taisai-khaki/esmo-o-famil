import { useEffect, useRef } from 'react';

/**
 * Tiny 60fps canvas particle engine: gold confetti + star bursts.
 * Driven by a singleton API so any part of the game can fire a burst.
 */

type Shape = 'rect' | 'star' | 'circle';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  life: number;
  ttl: number;
  shape: Shape;
  gravity: number;
}

const GOLD = ['#ffd54a', '#f5b301', '#fff3c4', '#e8940a', '#ffe08a'];
const WHITE = ['#ffffff', '#f8fafc'];

let particles: Particle[] = [];
let burstListeners: ((x: number, y: number, opts?: { count?: number; spread?: number }) => void)[] = [];

function spawnBurst(x: number, y: number, opts: { count?: number; spread?: number; colors?: string[] } = {}) {
  const count = opts.count ?? 26;
  const spread = opts.spread ?? 1;
  const colors = opts.colors ?? GOLD;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (2 + Math.random() * 5) * spread;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      ttl: 40 + Math.random() * 40,
      shape: Math.random() < 0.5 ? 'rect' : Math.random() < 0.5 ? 'star' : 'circle',
      gravity: 0.12,
    });
  }
}

/** Full-screen celebration rain from the top. */
function rain(count = 120) {
  const w = window.innerWidth;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 2,
      vy: 1 + Math.random() * 3,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      size: 5 + Math.random() * 7,
      color: (Math.random() < 0.7 ? GOLD : WHITE)[Math.floor(Math.random() * 5)] ?? GOLD[0],
      life: 0,
      ttl: 160 + Math.random() * 80,
      shape: Math.random() < 0.55 ? 'rect' : 'star',
      gravity: 0.03,
    });
  }
}

function drawStar(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

export function ParticleLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    const onBurst = (x: number, y: number, opts?: { count?: number; spread?: number }) => {
      spawnBurst(x, y, opts);
    };
    burstListeners.push(onBurst);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      const next: Particle[] = [];
      for (const p of particles) {
        p.life++;
        if (p.life > p.ttl || p.y > window.innerHeight + 40) continue;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        const alpha = 1 - Math.max(0, (p.life / p.ttl - 0.6) / 0.4);
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'star') {
          drawStar(ctx, p.size * 0.7);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        next.push(p);
      }
      particles = next;
      ctx.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      burstListeners = burstListeners.filter((l) => l !== onBurst);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[80]"
      aria-hidden
    />
  );
}

export const fx = {
  /** Fire a burst at viewport coordinates. */
  burst(x: number, y: number, opts?: { count?: number; spread?: number }) {
    burstListeners.forEach((l) => l(x, y, opts));
  },
  /** Burst centered on a DOM element. */
  burstAt(el: Element | null, opts?: { count?: number; spread?: number }) {
    if (!el) return fx.burst(window.innerWidth / 2, window.innerHeight / 3, opts);
    const r = el.getBoundingClientRect();
    fx.burst(r.left + r.width / 2, r.top + r.height / 2, opts);
  },
  rain,
};
