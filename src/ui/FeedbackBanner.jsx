import { Icon } from './Icon.jsx';

/**
 * FeedbackBanner — the bouncy quiz verdict. Pops in with a springy scale.
 * Correct = emerald + check; wrong = rose + x, and shows the correct answer.
 * Colour is always paired with an icon. All copy comes in via props (i18n).
 */

export function FeedbackBanner({
  correct,
  title,
  correctAnswer,
  answerLabel,
  yourAnswer,
  yourAnswerLabel,
  hint,
  className = '',
  style = {},
  ...rest
}) {
  const tone = correct
    ? { fg: 'var(--color-success)', icon: 'check-circle' }
    : { fg: 'var(--color-error)',   icon: 'x-circle' };

  return (
    <div
      className={className}
      // #69: one consistent live semantic — assertive alert for a wrong answer,
      // polite status for a correct one (each role implies its own live level).
      role={correct ? 'status' : 'alert'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        textAlign: 'center',
        animation: 'ht-pop-in var(--dur-base) var(--ease-spring)',
        ...style,
      }}
      {...rest}
    >
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: tone.fg,
        fontFamily: 'var(--font-display)',
        fontWeight: 'var(--weight-extrabold)',
        fontSize: 'var(--text-2xl)',
      }}>
        <Icon name={tone.icon} size={30} strokeWidth={2.25} />
        {title}
      </div>

      {!correct && yourAnswer != null && (
        <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-body)' }}>
          {yourAnswerLabel}{' '}
          <span style={{
            fontFamily: 'var(--font-mono)',
            background: 'var(--color-error-bg)',
            color: 'var(--rose-600)',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
          }}>{yourAnswer}</span>
        </div>
      )}

      {correctAnswer != null && (
        <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-body)' }}>
          {answerLabel}{' '}
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 'var(--weight-bold)',
            background: 'var(--color-success-bg)',
            color: 'var(--emerald-600)',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
          }}>{correctAnswer}</span>
        </div>
      )}

      {hint && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{hint}</div>}
    </div>
  );
}
