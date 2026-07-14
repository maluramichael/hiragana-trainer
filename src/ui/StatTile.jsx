import { Icon } from './Icon.jsx';

/**
 * StatTile — a compact metric: a big number/value over a small label,
 * optionally led by an icon. soft = tinted pastel panel; plain sits inside
 * another card.
 */

const TONES = {
  fuchsia: { bg: 'var(--fuchsia-50)',       fg: 'var(--fuchsia-600)' },
  violet:  { bg: 'var(--bg-violet-50)',     fg: 'var(--violet-600)' },
  emerald: { bg: 'var(--bg-emerald-50)',    fg: 'var(--emerald-600)' },
  amber:   { bg: 'var(--color-warning-bg)', fg: 'var(--amber-700)' },
  rose:    { bg: 'var(--color-error-bg)',   fg: 'var(--rose-600)' },
  sky:     { bg: 'var(--bg-sky-50)',        fg: 'var(--sky-600)' },
};

export function StatTile({
  value,
  label,
  sub,
  tone = 'fuchsia',
  icon,
  soft = true,
  className = '',
  style = {},
  ...rest
}) {
  const t = TONES[tone] || TONES.fuchsia;
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        textAlign: 'center',
        padding: soft ? 'var(--space-5)' : 0,
        borderRadius: 'var(--radius-2xl)',
        background: soft ? t.bg : 'transparent',
        boxShadow: soft ? 'var(--ring-white), var(--shadow-sm)' : 'none',
        ...style,
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={22} style={{ color: t.fg, marginBottom: '0.15rem' }} />}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 'var(--weight-extrabold)',
        fontSize: 'var(--text-3xl)',
        lineHeight: 1,
        color: t.fg,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--weight-medium)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-body)',
      }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
}
