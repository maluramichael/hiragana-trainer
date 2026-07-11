import { useState } from 'react';
import { Icon } from './Icon.jsx';

/**
 * Button — the brand's action primitive. SOLID colours only, never
 * gradients. Pill-shaped, springy hover lift, soft tinted shadow.
 */

const SIZES = {
  sm: { padding: '0.5rem 1rem',    font: 'var(--text-sm)',  gap: '0.4rem', icon: 16, minH: '38px' },
  md: { padding: '0.75rem 1.5rem', font: 'var(--text-lg)',  gap: '0.5rem', icon: 20, minH: 'var(--tap-min)' },
  lg: { padding: '1rem 2rem',      font: 'var(--text-xl)',  gap: '0.6rem', icon: 24, minH: '56px' },
};

function variantStyle(variant) {
  switch (variant) {
    case 'secondary':
      return {
        background: 'var(--surface-card)',
        color: 'var(--color-primary)',
        boxShadow: 'inset 0 0 0 2px var(--color-primary), var(--shadow-sm)',
      };
    case 'ghost':
      return { background: 'transparent', color: 'var(--text-body)', boxShadow: 'none' };
    case 'success':
      return { background: 'var(--color-success)', color: 'var(--white)', boxShadow: 'var(--shadow-success)' };
    case 'danger':
      return { background: 'var(--color-error)', color: 'var(--white)', boxShadow: 'var(--shadow-error)' };
    case 'primary':
    default:
      return { background: 'var(--color-primary)', color: 'var(--on-primary)', boxShadow: 'var(--shadow-primary)' };
  }
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  style = {},
  ref,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const base = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    padding: s.padding,
    minHeight: s.minH,
    border: 'none',
    borderRadius: 'var(--radius-pill)',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--weight-bold)',
    fontSize: s.font,
    lineHeight: 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-soft), box-shadow var(--dur-fast) var(--ease-soft)',
    transform: disabled ? 'none' : active ? 'scale(0.96)' : hover ? 'translateY(var(--lift-sm))' : 'none',
  };

  let vs = variantStyle(variant);

  if (!disabled && hover) {
    if (variant === 'primary') vs = { ...vs, background: 'var(--color-primary-hover)' };
    if (variant === 'success') vs = { ...vs, background: 'var(--emerald-600)' };
    if (variant === 'danger')  vs = { ...vs, background: 'var(--rose-600)' };
    if (variant === 'ghost')   vs = { ...vs, background: 'var(--color-primary-soft)', color: 'var(--color-primary)' };
    if (variant === 'secondary') vs = { ...vs, background: 'var(--fuchsia-50)' };
  }

  if (disabled) {
    vs = { background: 'var(--slate-200)', color: 'var(--slate-400)', boxShadow: 'none' };
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={className}
      style={{ ...base, ...vs, ...style }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      {...rest}
    >
      {iconLeft && <Icon name={iconLeft} size={s.icon} />}
      {children}
      {iconRight && <Icon name={iconRight} size={s.icon} />}
    </button>
  );
}
