import { useTranslation } from 'react-i18next';
import { Card, Button, Icon, Wordmark, LanguagePill, BackdropKana, AppFooter } from '../ui/index.js';

// Hero motif: the words hiragana / katakana spelled in kana as bobbing chips.
const HIRAGANA_WORD = ['ひ', 'ら', 'が', 'な'];
const KATAKANA_WORD = ['か', 'た', 'か', 'な'];

// The three feature tiles. Copy lives in i18n under landing.features.<key>.
const FEATURES = [
  { key: 'accuracy', tone: 'fuchsia', watermark: 'bar-chart' },
  { key: 'repeat',   tone: 'violet',  watermark: 'rotate-ccw' },
  { key: 'offline',  tone: 'sky',     watermark: 'heart' },
];

function KanaChip({ char, gradient, delay = 0 }) {
  return (
    <span lang="ja" style={{
      width: 76, height: 76, borderRadius: 'var(--radius-3xl)', background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-kana)', fontWeight: 700, fontSize: 42, color: '#fff',
      boxShadow: 'var(--shadow-md)',
      animation: `ht-bob 3.2s var(--ease-soft) ${delay}s infinite`,
    }}>{char}</span>
  );
}

const LandingPage = ({ onStart, onChooseCharacters }) => {
  const { t } = useTranslation();

  return (
    <main style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <BackdropKana />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1040, margin: '0 auto', padding: '0 var(--space-6) var(--space-16)' }}>
        {/* Nav */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 'var(--space-5) 0', flexWrap: 'wrap' }}>
          <Wordmark />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LanguagePill />
            <Button variant="primary" size="sm" iconRight="arrow-right" onClick={onStart}>{t('landing.nav.start')}</Button>
          </div>
        </nav>

        {/* Hero */}
        <header style={{ textAlign: 'center', padding: 'var(--space-8) 0 var(--space-12)' }}>
          <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {HIRAGANA_WORD.map((c, i) => <KanaChip key={`h${i}`} char={c} gradient="var(--tile-fuchsia)" delay={i * 0.15} />)}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {KATAKANA_WORD.map((c, i) => <KanaChip key={`k${i}`} char={c} gradient="var(--tile-violet)" delay={0.6 + i * 0.15} />)}
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(2.25rem, 7vw, var(--text-6xl))', lineHeight: 1.05, letterSpacing: 'var(--tracking-tight)', maxWidth: 820, margin: '0 auto var(--space-5)' }}>
            {t('landing.hero.title')}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1.05rem, 2.6vw, var(--text-xl))', color: 'var(--text-body)', lineHeight: 1.55, maxWidth: 620, margin: '0 auto var(--space-8)' }}>
            {t('landing.hero.subtitle')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Button variant="primary" size="lg" iconLeft="rocket" onClick={onStart}>{t('landing.hero.cta')}</Button>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{t('landing.hero.or')}</span>
            <Button variant="secondary" size="lg" iconLeft="book-open" onClick={onChooseCharacters}>{t('landing.hero.secondary')}</Button>
          </div>

          <p style={{ marginTop: 'var(--space-8)', display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 'var(--radius-pill)', background: 'var(--surface-card-soft)', padding: '0.5rem 1rem', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-muted)', boxShadow: 'var(--ring-white), var(--shadow-sm)' }}>
            {t('landing.hero.trust')}
          </p>
        </header>

        {/* Feature tiles */}
        <section aria-label={t('landing.features.heading')} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          {FEATURES.map((f) => (
            <Card key={f.key} variant="tile" tone={f.tone} watermark={f.watermark} padding="lg">
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', lineHeight: 1.15, marginBottom: 10 }}>
                {t(`landing.features.${f.key}.title`)}
              </div>
              <div style={{ fontWeight: 500, lineHeight: 1.55, opacity: 0.95 }}>
                {t(`landing.features.${f.key}.body`)}
              </div>
            </Card>
          ))}
        </section>

        {/* About Michael — whole card links to malura.de */}
        <a href="https://malura.de" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
          <Card padding="lg">
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 'var(--space-6)', alignItems: 'center' }} className="ht-about-grid">
              <img src="/michael.jpg" alt="Michael Malura" width="150" height="150" loading="lazy"
                style={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--ring-white), var(--shadow-md)', background: 'var(--fuchsia-100)' }} />
              <div>
                <h3 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>{t('landing.about.title')}</h3>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--fuchsia-600)', marginBottom: 'var(--space-4)' }}>
                  {t('landing.about.role')}
                </div>
                <p style={{ margin: '0 0 var(--space-5)', color: 'var(--text-body)', fontSize: 'var(--text-lg)', lineHeight: 1.6 }}>
                  {t('landing.about.body')}
                </p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--fuchsia-600)' }}>
                  <Icon name="globe" size={18} /> {t('landing.about.link')}
                  <Icon name="arrow-right" size={16} />
                </span>
              </div>
            </div>
          </Card>
        </a>

        <AppFooter />
      </div>
    </main>
  );
};

export default LandingPage;
