interface AvatarProps {
  emoji: string;
  size?: number; // px
  ring?: string; // tailwind ring class
  className?: string;
}

export function Avatar({ emoji, size = 48, ring = '', className = '' }: AvatarProps) {
  return (
    <div
      className={`no-select flex items-center justify-center rounded-full bg-gradient-to-br from-ink-600 to-ink-800 shadow-inner ring-2 ${ring} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.52 }}
      aria-hidden
    >
      <span className="translate-y-[2px]">{emoji}</span>
    </div>
  );
}
