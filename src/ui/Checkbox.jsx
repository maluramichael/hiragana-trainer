import { Icon } from './Icon.jsx';

/**
 * Checkbox — rounded custom checkbox with a springy fuchsia check. Supports
 * an indeterminate ("some selected") state for parent group rows. Renders as
 * a label so the whole row is clickable.
 */

export function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  label,
  weight = 'medium',
  disabled = false,
  className = '',
  style = {},
  ...rest
}) {
  const on = checked || indeterminate;
  return (
    <label
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      {...rest}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
      />
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          flexShrink: 0,
          borderRadius: 'var(--radius-sm)',
          background: on ? 'var(--color-primary)' : 'var(--surface-card)',
          border: on ? '2px solid var(--color-primary)' : '2px solid var(--slate-300)',
          color: 'var(--white)',
          transition: 'background var(--dur-fast) var(--ease-soft), border-color var(--dur-fast) var(--ease-soft), transform var(--dur-fast) var(--ease-spring)',
        }}
      >
        {indeterminate
          ? <span style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--white)' }} />
          : checked
            ? <Icon name="check" size={16} strokeWidth={3} />
            : null}
      </span>
      {label != null && (
        <span style={{
          fontFamily: 'var(--font-body)',
          fontWeight: weight === 'bold' ? 'var(--weight-bold)' : 'var(--weight-medium)',
          fontSize: 'var(--text-base)',
          color: weight === 'bold' ? 'var(--text-strong)' : 'var(--text-body)',
        }}>
          {label}
        </span>
      )}
    </label>
  );
}
