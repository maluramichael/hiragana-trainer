import { useState } from 'react';

/**
 * TextInput — rounded text field. Big and centered by default (the romaji
 * answer box), with a pink focus ring. correct/wrong states tint the border
 * to match quiz feedback.
 */

export function TextInput({
  value,
  onChange,
  placeholder,
  state = 'idle',
  align = 'center',
  size = 'lg',
  disabled = false,
  className = '',
  style = {},
  inputRef,
  ...rest
}) {
  const [focus, setFocus] = useState(false);

  const borderColor =
    state === 'correct' ? 'var(--color-success)' :
    state === 'wrong'   ? 'var(--color-error)' :
    focus               ? 'var(--color-primary)' :
    'var(--slate-200)';

  const pad = size === 'lg' ? '0.85rem 1.25rem' : '0.6rem 1rem';
  const font = size === 'lg' ? 'var(--text-xl)' : 'var(--text-base)';

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      style={{
        width: '100%',
        padding: pad,
        textAlign: align,
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--weight-semibold)',
        fontSize: font,
        color: 'var(--text-strong)',
        background: 'var(--surface-card)',
        border: `2px solid ${borderColor}`,
        borderRadius: 'var(--radius-xl)',
        outline: 'none',
        boxShadow: focus ? 'var(--ring-focus)' : 'none',
        transition: 'border-color var(--dur-fast) var(--ease-soft), box-shadow var(--dur-fast) var(--ease-soft)',
        ...style,
      }}
      {...rest}
    />
  );
}
