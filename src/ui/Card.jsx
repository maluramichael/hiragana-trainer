import { Icon } from './Icon.jsx';

/**
 * Card — the signature surface. Two kinds:
 *  (1) content → white/translucent, soft violet-pink glow, thin white ring.
 *  (2) tile    → vibrant accent gradient, white text, a big watermark glyph
 *                bled into a corner.
 */

const TILE_GRADIENTS = {
  fuchsia: 'var(--tile-fuchsia)',
  violet:  'var(--tile-violet)',
  pink:    'var(--tile-pink)',
  emerald: 'var(--tile-emerald)',
  amber:   'var(--tile-amber)',
  sky:     'var(--tile-sky)',
};

const PADS = { sm: 'var(--space-4)', md: 'var(--space-6)', lg: 'var(--space-8)' };

export function Card({
  children,
  variant = 'content',
  tone = 'fuchsia',
  watermark,
  padding = 'md',
  className = '',
  style = {},
  ...rest
}) {
  const pad = PADS[padding] || PADS.md;

  if (variant === 'tile') {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--radius-3xl)',
          padding: pad,
          background: TILE_GRADIENTS[tone] || TILE_GRADIENTS.fuchsia,
          color: 'var(--text-on-color)',
          boxShadow: 'var(--shadow-md)',
          ...style,
        }}
        {...rest}
      >
        {watermark && (
          <Icon
            name={watermark}
            size={150}
            strokeWidth={1.5}
            style={{ position: 'absolute', right: '-28px', bottom: '-34px', color: 'var(--white)', opacity: 0.18, pointerEvents: 'none' }}
          />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        borderRadius: 'var(--radius-3xl)',
        padding: pad,
        background: 'var(--surface-card-soft)',
        backdropFilter: 'blur(var(--blur-card))',
        WebkitBackdropFilter: 'blur(var(--blur-card))',
        boxShadow: 'var(--ring-white), var(--shadow-md)',
        color: 'var(--text-body)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
