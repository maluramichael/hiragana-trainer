import { Icon } from './Icon.jsx';

/**
 * Badge — a small rounded pill for status, counts and streaks. Colour is
 * paired with an icon so meaning never rests on colour alone.
 */

const TONES = {
  neutral: { bg: 'var(--slate-100)',        fg: 'var(--slate-600)' },
  fuchsia: { bg: 'var(--fuchsia-100)',      fg: 'var(--fuchsia-700)' },
  success: { bg: 'var(--color-success-bg)', fg: 'var(--emerald-600)' },
  error:   { bg: 'var(--color-error-bg)',   fg: 'var(--rose-600)' },
  warning: { bg: 'var(--color-warning-bg)', fg: 'var(--amber-700)' },
  info:    { bg: 'var(--bg-sky-50)',        fg: 'var(--sky-600)' },
};

export function Badge({
  children,
  tone = 'neutral',
  icon,
  className = '',
  style = {},
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.25rem 0.7rem',
        borderRadius: 'var(--radius-pill)',
        background: t.bg,
        color: t.fg,
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--weight-bold)',
        fontSize: 'var(--text-xs)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={13} strokeWidth={2.5} />}
      {children}
    </span>
  );
}
