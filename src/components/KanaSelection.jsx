import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { kanaGroups, hiragana, katakana } from '../data/kana.js';
import { getAllGroupProgress } from '../utils/progressCalculator.js';
import {
  getOverallStatistics,
  getStatistics,
  getWeakKana,
  getDueKana
} from '../utils/statisticsManager.js';
import { Card, Button, Checkbox, ProgressMeter, Badge, Icon, TopBar, AppFooter, BackdropKana } from '../ui/index.js';

// Hiragana Unicode block; anything else is treated as Katakana.
const isHiragana = (char) => /[぀-ゟ]/.test(char);

const kanaByKey = new Map(
  [...hiragana, ...katakana].map((k) => [`${k.kana}-${k.romaji}`, k])
);

const resolveKana = (items) =>
  items
    .map((item) => (typeof item === 'string' ? item : `${item.kana}-${item.romaji}`))
    .map((key) => kanaByKey.get(key))
    .filter(Boolean);

const deriveScriptMode = (list) => {
  const hasHira = list.some((k) => isHiragana(k.kana));
  const hasKata = list.some((k) => !isHiragana(k.kana));
  if (hasHira && hasKata) return 'both';
  return hasHira ? 'hiragana' : 'katakana';
};

const SELECTION_KEY = 'kana-quiz-selection';
const SCRIPT_MODE_KEY = 'kana-quiz-script-mode';

const SCRIPT_MODES = ['hiragana', 'katakana', 'both'];
const DEFAULT_SCRIPT_MODE = 'hiragana';

// Two script toggles <-> the persisted 3-value script mode.
const scriptsToMode = ({ hiragana: h, katakana: k }) => (h && k ? 'both' : h ? 'hiragana' : 'katakana');
const modeToScripts = (mode) => ({ hiragana: mode !== 'katakana', katakana: mode !== 'hiragana' });

const loadScripts = () => {
  try {
    const raw = localStorage.getItem(SCRIPT_MODE_KEY);
    return modeToScripts(SCRIPT_MODES.includes(raw) ? raw : DEFAULT_SCRIPT_MODE);
  } catch {
    return modeToScripts(DEFAULT_SCRIPT_MODE);
  }
};

const defaultSelection = {
  basic: false,
  basicSubs: { vowels: false, k: false, s: false, t: false, n: false, h: false, m: false, y: false, r: false, w: false },
  dakuten: false,
  dakutenSubs: { g: false, z: false, d: false, b: false },
  handakuten: false,
  handakutenSubs: { p: false }
};

const pickBools = (defaults, source) =>
  Object.fromEntries(Object.keys(defaults).map(key => [key, Boolean(source && source[key])]));

const loadSelection = () => {
  try {
    const raw = localStorage.getItem(SELECTION_KEY);
    if (!raw) return defaultSelection;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaultSelection;
    return {
      basic: Boolean(parsed.basic),
      basicSubs: pickBools(defaultSelection.basicSubs, parsed.basicSubs),
      dakuten: Boolean(parsed.dakuten),
      dakutenSubs: pickBools(defaultSelection.dakutenSubs, parsed.dakutenSubs),
      handakuten: Boolean(parsed.handakuten),
      handakutenSubs: pickBools(defaultSelection.handakutenSubs, parsed.handakutenSubs)
    };
  } catch {
    return defaultSelection;
  }
};

const getKanaForSelection = (selection) => {
  const selected = [];
  Object.entries(selection.basicSubs).forEach(([key, isSelected]) => {
    if (isSelected) {
      selected.push(...kanaGroups.basic[key].hiragana);
      selected.push(...kanaGroups.basic[key].katakana);
    }
  });
  Object.entries(selection.dakutenSubs).forEach(([key, isSelected]) => {
    if (isSelected) {
      selected.push(...kanaGroups.dakuten[key].hiragana);
      selected.push(...kanaGroups.dakuten[key].katakana);
    }
  });
  Object.entries(selection.handakutenSubs).forEach(([key, isSelected]) => {
    if (isSelected) {
      selected.push(...kanaGroups.handakuten[key].hiragana);
      selected.push(...kanaGroups.handakuten[key].katakana);
    }
  });
  return selected;
};

// A clickable script filter. Active = vibrant tile; inactive = muted outline.
function ScriptTile({ tone, watermark, kana, label, ariaLabel, active, onToggle }) {
  const gradients = { fuchsia: 'var(--tile-fuchsia)', violet: 'var(--tile-violet)' };
  return (
    <button onClick={onToggle} aria-pressed={active} aria-label={ariaLabel} style={{
      position: 'relative', overflow: 'hidden', textAlign: 'left', cursor: 'pointer',
      border: 'none', padding: 'var(--space-6)', borderRadius: 'var(--radius-3xl)',
      background: active ? gradients[tone] : 'var(--surface-card-soft)',
      color: active ? 'var(--text-on-color)' : 'var(--text-muted)',
      boxShadow: active ? 'var(--shadow-md)' : 'var(--ring-white), var(--shadow-sm)',
      transition: 'background var(--dur-base) var(--ease-soft), box-shadow var(--dur-base) var(--ease-soft)',
    }}>
      {active && (
        <Icon name={watermark} size={150} strokeWidth={1.5} style={{ position: 'absolute', right: -28, bottom: -34, color: 'var(--white)', opacity: 0.18, pointerEvents: 'none' }} />
      )}
      <span style={{
        position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)',
        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(255,255,255,0.28)' : 'transparent',
        border: active ? 'none' : '2px solid var(--slate-300)', color: '#fff',
      }}>
        {active && <Icon name="check" size={16} strokeWidth={3} />}
      </span>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div lang="ja" style={{ fontFamily: 'var(--font-kana)', fontWeight: 700, fontSize: 'var(--text-4xl)', lineHeight: 1, color: active ? '#fff' : 'var(--slate-400)' }}>{kana}</div>
        <div style={{ fontWeight: 600, marginTop: 6 }}>{label}</div>
      </div>
    </button>
  );
}

const KanaSelection = ({ onStartQuiz, onStudy, onViewStatistics }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState(loadSelection);
  const [scripts, setScripts] = useState(loadScripts);
  const [weakKana, setWeakKana] = useState([]);
  const [dueKana, setDueKana] = useState([]);

  const scriptMode = scriptsToMode(scripts);

  useEffect(() => {
    setProgress(getAllGroupProgress());
    setHasData(getOverallStatistics().practicedKana > 0);
    setWeakKana(resolveKana(getWeakKana()));
    const stats = getStatistics();
    const practicedKeys = Object.keys(stats).filter((key) => stats[key].timesShown > 0);
    setDueKana(resolveKana(getDueKana(practicedKeys)));
  }, []);

  useEffect(() => {
    try { localStorage.setItem(SELECTION_KEY, JSON.stringify(selectedGroups)); } catch { /* ignore */ }
  }, [selectedGroups]);

  useEffect(() => {
    try { localStorage.setItem(SCRIPT_MODE_KEY, scriptMode); } catch { /* ignore */ }
  }, [scriptMode]);

  // At least one script must stay selected.
  const toggleScript = (key) => setScripts((s) => {
    const other = key === 'hiragana' ? 'katakana' : 'hiragana';
    if (s[key] && !s[other]) return s;
    return { ...s, [key]: !s[key] };
  });

  const handleMainGroupToggle = (group) => {
    const newValue = !selectedGroups[group];
    setSelectedGroups(prev => ({
      ...prev,
      [group]: newValue,
      [`${group}Subs`]: Object.fromEntries(Object.keys(prev[`${group}Subs`]).map(key => [key, newValue]))
    }));
  };

  const handleSubGroupToggle = (mainGroup, subGroup) => {
    setSelectedGroups(prev => {
      const newSubs = { ...prev[`${mainGroup}Subs`], [subGroup]: !prev[`${mainGroup}Subs`][subGroup] };
      const allSubsSelected = Object.values(newSubs).every(Boolean);
      const anySubSelected = Object.values(newSubs).some(Boolean);
      return { ...prev, [`${mainGroup}Subs`]: newSubs, [mainGroup]: allSubsSelected || (anySubSelected && prev[mainGroup]) };
    });
  };

  const handleStartQuiz = () => {
    const kanaToStudy = getKanaForSelection(selectedGroups);
    if (kanaToStudy.length > 0) onStartQuiz(kanaToStudy, { scriptMode });
  };

  const handleQuickstart = () => {
    const quickSelection = { ...defaultSelection, basicSubs: { ...defaultSelection.basicSubs, vowels: true } };
    setSelectedGroups(quickSelection);
    const kanaToStudy = getKanaForSelection(quickSelection);
    if (kanaToStudy.length > 0) onStartQuiz(kanaToStudy, { scriptMode });
  };

  const handleStudy = () => {
    const kanaToStudy = getKanaForSelection(selectedGroups);
    if (kanaToStudy.length > 0) onStudy(kanaToStudy, { scriptMode });
  };

  const handlePracticeWeak = () => {
    if (weakKana.length > 0) onStartQuiz(weakKana, { scriptMode: deriveScriptMode(weakKana) });
  };

  const handleReviewDue = () => {
    if (dueKana.length > 0) onStartQuiz(dueKana, { scriptMode: deriveScriptMode(dueKana) });
  };

  const selectedCount = getKanaForSelection(selectedGroups).length;

  // One group block: bold header checkbox (with indeterminate) + overall meter,
  // then its sub-series rows each with a small mastery meter.
  const renderGroup = (group, recommended, subs) => {
    const subsState = selectedGroups[`${group}Subs`];
    const allSubs = Object.values(subsState).every(Boolean);
    const anySub = Object.values(subsState).some(Boolean);
    return (
      <div key={group} style={{ borderRadius: 'var(--radius-2xl)', background: 'var(--surface-sunken)', padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Checkbox
            checked={allSubs}
            indeterminate={anySub && !allSubs}
            weight="bold"
            onChange={() => handleMainGroupToggle(group)}
            label={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{t(`groups.${group}`)}{recommended && <Badge tone="success" icon="star">{t('selection.recommended')}</Badge>}</span>}
          />
          <div style={{ flex: 1, minWidth: 80 }} />
          {progress && (
            <div style={{ width: 200, maxWidth: '40%' }}>
              <ProgressMeter variant="segments" level={progress[group].overall.level} height={12} />
            </div>
          )}
        </div>

        <div style={{ marginTop: 'var(--space-3)', marginLeft: 34, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {subs.map(({ key, translationKey, recommended: subRec }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-md)', background: subsState[key] ? 'var(--fuchsia-50)' : 'transparent' }}>
              <Checkbox
                checked={subsState[key]}
                onChange={() => handleSubGroupToggle(group, key)}
                label={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}>{t(translationKey)}{subRec && <Badge tone="success" icon="star">{t('selection.recommended')}</Badge>}</span>}
              />
              <div style={{ flex: 1, minWidth: 40 }} />
              {progress && progress[group].subgroups[key] && (
                <div style={{ width: 150, maxWidth: '35%' }}>
                  <ProgressMeter variant="segments" level={progress[group].subgroups[key].level} height={9} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <BackdropKana />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 'var(--width-content)', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
        <TopBar onStats={onViewStatistics} />

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, var(--text-4xl))', marginBottom: 'var(--space-2)' }}>{t('selection.headline')}</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', color: 'var(--text-body)', margin: 0 }}>{t('selection.subhead')}</p>
        </div>

        {/* Quickstart, only until the learner has practiced once. */}
        {!hasData && (
          <Card padding="lg" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <Button data-testid="quickstart-button" variant="success" size="lg" iconLeft="rocket" onClick={handleQuickstart}>{t('selection.quickstart')}</Button>
            <p style={{ marginTop: 'var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{t('selection.quickstartHint')}</p>
          </Card>
        )}

        {/* Review shortcuts, once there is history to act on. */}
        {(weakKana.length > 0 || dueKana.length > 0) && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
            {weakKana.length > 0 && (
              <Button variant="danger" size="md" iconLeft="rotate-ccw" onClick={handlePracticeWeak}>{t('selection.practiceWeak')}</Button>
            )}
            {dueKana.length > 0 && (
              <Button size="md" iconLeft="clock" onClick={handleReviewDue} style={{ background: 'var(--amber-500)', boxShadow: '0 8px 20px -6px color-mix(in srgb, var(--amber-500) 50%, transparent)' }}>{t('selection.reviewDue')}</Button>
            )}
          </div>
        )}

        {/* Two clickable script tiles: at least one always on, both allowed. */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <ScriptTile tone="fuchsia" watermark="book-open" kana="ひらがな" label={`${t('scripts.hiragana')} · 46`} ariaLabel={t('scripts.hiragana')} active={scripts.hiragana} onToggle={() => toggleScript('hiragana')} />
          <ScriptTile tone="violet" watermark="sparkles" kana="カタカナ" label={`${t('scripts.katakana')} · 46`} ariaLabel={t('scripts.katakana')} active={scripts.katakana} onToggle={() => toggleScript('katakana')} />
        </div>

        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {renderGroup('basic', true, [
              { key: 'vowels', translationKey: 'subgroups.vowels', recommended: true },
              { key: 'k', translationKey: 'subgroups.kSeries' },
              { key: 's', translationKey: 'subgroups.sSeries' },
              { key: 't', translationKey: 'subgroups.tSeries' },
              { key: 'n', translationKey: 'subgroups.nSeries' },
              { key: 'h', translationKey: 'subgroups.hSeries' },
              { key: 'm', translationKey: 'subgroups.mSeries' },
              { key: 'y', translationKey: 'subgroups.ySeries' },
              { key: 'r', translationKey: 'subgroups.rSeries' },
              { key: 'w', translationKey: 'subgroups.wSeries' }
            ])}
            {renderGroup('dakuten', false, [
              { key: 'g', translationKey: 'subgroups.gSeries' },
              { key: 'z', translationKey: 'subgroups.zSeries' },
              { key: 'd', translationKey: 'subgroups.dSeries' },
              { key: 'b', translationKey: 'subgroups.bSeries' }
            ])}
            {renderGroup('handakuten', false, [
              { key: 'p', translationKey: 'subgroups.pSeries' }
            ])}
          </div>

          <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px dashed var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Button variant="secondary" size="lg" iconLeft="book-open" disabled={selectedCount === 0} onClick={handleStudy}>{t('selection.studyFirst')}</Button>
            <Button variant="primary" size="lg" iconLeft="rocket" disabled={selectedCount === 0} onClick={handleStartQuiz}>{t('selection.startQuiz')}</Button>
          </div>
          {selectedCount > 0 && (
            <p style={{ marginTop: 'var(--space-3)', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              {selectedCount} {t('selection.charactersSelected')}
            </p>
          )}
        </Card>

        <AppFooter />
      </div>
    </main>
  );
};

export default KanaSelection;
