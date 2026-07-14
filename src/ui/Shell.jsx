import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { hiragana, katakana } from '../data/kana.js';
import { Icon } from './Icon.jsx';
import { Button } from './Button.jsx';

/* Wordmark: fuchsia kana chip (ひ) + Baloo 2 wordmark. */
export function Wordmark({ size = 'md' }) {
  const chip = size === 'lg' ? 56 : 44;
  const type = size === 'lg' ? 26 : 21;
  // Links to the homepage from any screen it appears on (nav + TopBar).
  return (
    <a href="/" aria-label="Hiragana Trainer" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
      <span lang="ja" style={{
        fontFamily: 'var(--font-kana)', fontWeight: 700, color: '#fff',
        background: 'var(--tile-fuchsia)', width: chip, height: chip,
        borderRadius: 'var(--radius-2xl)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: chip * 0.55, boxShadow: 'var(--shadow-primary)',
      }}>ひ</span>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: type, color: 'var(--text-strong)', lineHeight: 1 }}>
        Hiragana Trainer
      </span>
    </a>
  );
}

/* Language pill: toggles de/en via i18next. */
export function LanguagePill() {
  const { i18n, t } = useTranslation();
  const toggle = () => i18n.changeLanguage(i18n.language === 'de' ? 'en' : 'de');
  return (
    <button onClick={toggle} title={t('language.switch')} aria-label={t('language.switch')} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: 'var(--surface-card)', border: 'none',
      boxShadow: 'var(--ring-white), var(--shadow-sm)',
      color: 'var(--text-body)', fontFamily: 'var(--font-body)', fontWeight: 700,
      fontSize: 'var(--text-sm)', padding: '0.5rem 0.9rem',
      borderRadius: 'var(--radius-pill)', cursor: 'pointer',
    }}>
      <Icon name="languages" size={16} style={{ color: 'var(--fuchsia-500)' }} />
      {i18n.language === 'de' ? 'Deutsch' : 'English'}
    </button>
  );
}

/* Top bar: wordmark left, optional stats button + language pill right. */
export function TopBar({ onStats, showStats = true }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
      <Wordmark />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {showStats && (
          <Button variant="secondary" size="sm" iconLeft="bar-chart" onClick={onStats}>{t('statistics.title')}</Button>
        )}
        <LanguagePill />
      </div>
    </div>
  );
}

export function AppFooter() {
  const { t } = useTranslation();
  return (
    <footer style={{
      textAlign: 'center', padding: 'var(--space-6) 0 var(--space-4)',
      fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap',
    }}>
      {t('footer.madeWithLove')} <Icon name="heart" size={14} style={{ color: 'var(--pink-500)' }} label="♥" />
      · <a href="https://malura.de" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>Michael</a>
    </footer>
  );
}

/* Purely decorative floating kana behind a screen. aria-hidden, no interaction.
   Random real kana so the backdrop varies from visit to visit. */
const POOL = [...hiragana, ...katakana].map((k) => k.kana);
const SPOTS = [
  { top: '13%', left: '3%', size: 128, delay: '0s',   dur: '7s' },
  { top: '18%', right: '4%', size: 138, delay: '1.4s', dur: '8s' },
  { bottom: '15%', left: '5%', size: 128, delay: '2.2s', dur: '7.5s' },
  { bottom: '9%', right: '5%', size: 128, delay: '0.7s', dur: '8.5s' },
  { top: '7%', left: '46%', size: 96,  delay: '1.9s', dur: '9s' },
  { bottom: '7%', right: '40%', size: 96, delay: '2.7s', dur: '7.8s' },
];

export function BackdropKana() {
  const chars = useMemo(() => {
    const copy = [...POOL];
    return SPOTS.map(() => copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }, []);
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}>
      {SPOTS.map((s, i) => (
        <span key={i} lang="ja" style={{
          position: 'absolute', top: s.top, bottom: s.bottom, left: s.left, right: s.right,
          fontFamily: 'var(--font-kana)', fontWeight: 700, fontSize: s.size,
          color: 'var(--fuchsia-300)', opacity: 0.18,
          animation: `ht-float ${s.dur} var(--ease-soft) ${s.delay} infinite`,
        }}>{chars[i]}</span>
      ))}
    </div>
  );
}

/* Page wrapper: soft page gradient (via body) + floating backdrop + centered
   content column. */
export function PageShell({ maxWidth = 'var(--width-content)', backdrop = true, children, style = {} }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', ...style }}>
      {backdrop && <BackdropKana />}
      <div style={{ position: 'relative', zIndex: 1, maxWidth, margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
        {children}
      </div>
    </div>
  );
}
