/**
 * KanaCard — the big soft kana glyph in the rounded maru-gothic face.
 * Optional caption (Hiragana/Katakana) and a feedback state that pops
 * (correct → emerald + scale up) or shrinks (wrong → rose).
 */

const SIZES = {
  md: 'var(--text-5xl)',
  lg: 'var(--text-6xl)',
  xl: 'var(--text-kana)',
};

export function KanaCard({
  kana,
  caption,
  size = 'xl',
  state = 'idle',
  className = '',
  style = {},
  ...rest
}) {
  const color =
    state === 'correct' ? 'var(--color-success)' :
    state === 'wrong'   ? 'var(--color-error)' :
    'var(--text-strong)';
  const transform =
    state === 'correct' ? 'scale(1.12)' :
    state === 'wrong'   ? 'scale(0.9)' :
    'scale(1)';

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', ...style }}
      {...rest}
    >
      {caption && (
        <div style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--text-sm)',
          letterSpacing: 'var(--tracking-caps)',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          {caption}
        </div>
      )}
      <div
        lang="ja"
        style={{
          fontFamily: 'var(--font-kana)',
          fontWeight: 500,
          fontSize: SIZES[size] || SIZES.xl,
          lineHeight: 1,
          color,
          transform,
          transition: 'transform var(--dur-base) var(--ease-spring), color var(--dur-base) var(--ease-soft)',
        }}
      >
        {kana}
      </div>
    </div>
  );
}
