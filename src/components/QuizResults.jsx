import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { exportStatisticsAsBase64 } from '../utils/statisticsManager';
import { calculateGroupProgress, getProgressDescription } from '../utils/progressCalculator';
import { trackEvent } from '../utils/analytics';
import { Card, StatTile, Button, Icon, BackdropKana, AppFooter } from '../ui/index.js';

const APP_URL = 'https://hiragana-trainer.de';
const GITHUB_URL = 'https://github.com/maluramichael/hiragana-trainer';
const SPONSORS_URL = 'https://github.com/sponsors/maluramichael';
const AUTHOR_URL = 'https://malura.de';
const TOFUGU_HIRAGANA_URL = 'https://www.tofugu.com/japanese/learn-hiragana/';
const TOFUGU_KATAKANA_URL = 'https://www.tofugu.com/japanese/learn-katakana/';

const MASTERY_LEVEL = 9;

const QuizResults = ({ results, onRestart, onNewSelection, kanaList = [] }) => {
  const { t } = useTranslation();
  const [shareStatus, setShareStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);

  const accuracy = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
  const incorrect = results.total - results.correct;
  const recommendNew = accuracy >= 80;

  useEffect(() => {
    trackEvent('quiz_finished', `${accuracy}%`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const masteredSeries = useMemo(() => {
    const uniqueSeries = new Map();
    kanaList.forEach((k) => {
      if (k.type && k.series) uniqueSeries.set(`${k.type}:${k.series}`, { type: k.type, series: k.series });
    });
    return [...uniqueSeries.values()]
      .map(({ type, series }) => ({ series, level: calculateGroupProgress(type, series).level }))
      .filter((s) => s.level >= MASTERY_LEVEL);
  }, [kanaList]);

  const perf = accuracy >= 95 ? { msg: t('results.perfect'), icon: 'trophy', color: 'var(--emerald-600)' }
    : accuracy >= 80 ? { msg: t('results.excellent'), icon: 'sparkles', color: 'var(--fuchsia-600)' }
    : accuracy >= 65 ? { msg: t('results.good'), icon: 'zap', color: 'var(--amber-500)' }
    : { msg: t('results.keepPracticing'), icon: 'flame', color: 'var(--violet-600)' };

  const handleShare = async () => {
    trackEvent('share_clicked', `${accuracy}%`);
    const text = t('results.shareText', { accuracy, url: APP_URL });
    const shareData = { title: t('results.shareTitle'), text, url: APP_URL };
    try {
      if (navigator.share) { await navigator.share(shareData); return; }
      await navigator.clipboard.writeText(text);
      setShareStatus('copied');
    } catch { /* cancelled */ }
  };

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportStatisticsAsBase64());
      setExportStatus('copied');
    } catch {
      setExportStatus('error');
    }
  };

  const linkStyle = { fontWeight: 700, color: 'var(--fuchsia-600)' };

  return (
    <main style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <BackdropKana />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 'var(--width-prose)', margin: '0 auto', padding: 'var(--space-12) var(--space-6) var(--space-16)' }}>
        <Card padding="lg" style={{ textAlign: 'center' }}>
          <div style={{
            width: 84, height: 84, margin: '0 auto var(--space-4)', borderRadius: 'var(--radius-3xl)',
            background: 'var(--tile-fuchsia)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: 'var(--shadow-primary)', animation: 'ht-pop-in var(--dur-slow) var(--ease-spring)',
          }}>
            <Icon name={perf.icon} size={44} />
          </div>
          <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-1)' }}>{t('results.title')}</h1>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: perf.color, marginBottom: 'var(--space-8)' }}>
            {perf.msg}
          </div>

          {/* Mastery celebration — only real, data-derived milestones */}
          {masteredSeries.length > 0 && (
            <div style={{ marginBottom: 'var(--space-8)', borderRadius: 'var(--radius-2xl)', background: 'var(--color-warning-bg)', padding: 'var(--space-4)', textAlign: 'left', boxShadow: 'var(--ring-white)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: 'var(--amber-500)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
                <Icon name="star" size={20} /> {t('mastery.title')}
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>
                {masteredSeries.map((s) => (
                  <li key={s.series}>{t('mastery.reached', { series: t(`mastery.series.${s.series}`), level: getProgressDescription(s.level, t) })}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <StatTile value={results.correct} label={t('results.correctAnswers')} sub={`${t('results.outOf')} ${results.total}`} tone="emerald" icon="check-circle" />
            <StatTile value={`${accuracy}%`} label={t('quiz.accuracy')} tone="fuchsia" icon="target" />
            <StatTile value={results.bestStreak} label={t('results.bestStreak')} tone="amber" icon="flame" />
            <StatTile value={incorrect} label={t('results.incorrect')} tone="rose" icon="x-circle" />
          </div>

          {/* Next step recommendation */}
          <div style={{ marginBottom: 'var(--space-8)', borderRadius: 'var(--radius-2xl)', background: 'var(--bg-violet-50)', padding: 'var(--space-5)', textAlign: 'left', boxShadow: 'var(--ring-white)' }}>
            <div style={{ fontWeight: 800, color: 'var(--text-strong)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>{t('results.nextStepTitle')}</div>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>
              {incorrect > 0 ? t('results.nextStepReview') : t('results.nextStepKeepGoing')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {recommendNew ? (
              <>
                <Button variant="primary" size="lg" fullWidth iconLeft="rocket" onClick={onNewSelection}>{t('results.chooseDifferent')}</Button>
                <Button variant="secondary" size="lg" fullWidth iconLeft="rotate-ccw" onClick={onRestart}>{t('results.practiceSame')}</Button>
              </>
            ) : (
              <>
                <Button variant="primary" size="lg" fullWidth iconLeft="rotate-ccw" onClick={onRestart}>{t('results.practiceSame')}</Button>
                <Button variant="secondary" size="lg" fullWidth iconLeft="rocket" onClick={onNewSelection}>{t('results.chooseDifferent')}</Button>
              </>
            )}
            <Button variant="secondary" size="lg" fullWidth iconLeft="share" onClick={handleShare}>{t('results.share')}</Button>
            {shareStatus === 'copied' && <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--emerald-600)' }}>{t('results.shareCopied')}</p>}
          </div>

          {/* Cross-device export */}
          <div style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            <button onClick={handleCopyExport} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', textDecoration: 'underline', font: 'inherit' }}>
              {t('results.crossDevice')}
            </button>
            {exportStatus === 'copied' && <span style={{ marginLeft: 8, color: 'var(--emerald-600)' }}>{t('results.crossDeviceCopied')}</span>}
            {exportStatus === 'error' && <span style={{ marginLeft: 8, color: 'var(--rose-500)' }}>{t('results.crossDeviceError')}</span>}
          </div>
        </Card>

        {/* Recommended resources */}
        <Card style={{ marginTop: 'var(--space-6)', textAlign: 'left' }}>
          <div style={{ fontWeight: 800, color: 'var(--text-strong)', marginBottom: 'var(--space-3)', fontFamily: 'var(--font-display)' }}>{t('results.recommendedTitle')}</div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 'var(--text-sm)' }}>
            <li><a href={TOFUGU_HIRAGANA_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>{t('results.recommendedHiragana')}</a></li>
            <li><a href={TOFUGU_KATAKANA_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>{t('results.recommendedKatakana')}</a></li>
          </ul>
        </Card>

        {/* Support + about */}
        <Card style={{ marginTop: 'var(--space-6)', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: 'var(--text-strong)', marginBottom: 'var(--space-3)', fontFamily: 'var(--font-display)' }}>
            <Icon name="star" size={20} style={{ color: 'var(--amber-500)' }} /> {t('results.supportTitle')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>{t('results.starGithub')}</a>
            <a href={SPONSORS_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>{t('results.sponsor')}</a>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {t('results.aboutBy')}{' '}
            <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>Michael Malura</a>
          </p>
        </Card>

        <AppFooter />
      </div>
    </main>
  );
};

export default QuizResults;
