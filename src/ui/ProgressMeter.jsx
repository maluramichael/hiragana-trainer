/**
 * ProgressMeter — two looks:
 *  (1) 'bar'      → a single rounded track with a fuchsia fill (quiz header).
 *  (2) 'segments' → up to 10 little pills that light up by mastery level,
 *                   as used per kana-group on the selection screen.
 */

function levelColor(level) {
  if (level >= 9) return 'var(--color-success)';
  if (level >= 7) return 'var(--amber-500)';
  if (level >= 4) return 'var(--amber-400)';
  if (level >= 1) return 'var(--amber-300)';
  return 'var(--slate-200)';
}

export function ProgressMeter({
  variant = 'bar',
  value = 0,
  level = 0,
  segments = 10,
  height = 8,
  label,
  className = '',
  style = {},
  ...rest
}) {
  if (variant === 'segments') {
    const color = levelColor(level);
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', ...style }} {...rest}>
        <div style={{ display: 'flex', gap: '3px' }}>
          {Array.from({ length: segments }).map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height,
              borderRadius: 'var(--radius-sm)',
              background: i < level ? color : 'var(--slate-200)',
              opacity: i < level ? 1 : 0.6,
              transition: 'background var(--dur-base) var(--ease-soft)',
            }} />
          ))}
        </div>
        {label && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>
            <span>{label}</span><span>{level}/{segments}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', ...style }} {...rest}>
      {label && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>{label}</div>}
      <div style={{
        width: '100%',
        height,
        borderRadius: 'var(--radius-pill)',
        background: 'var(--slate-200)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: '100%',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-primary)',
          transition: 'width var(--dur-slow) var(--ease-soft)',
        }} />
      </div>
    </div>
  );
}
