import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { kanaGroups } from '../data/kana.js';
import { getAllGroupProgress } from '../utils/progressCalculator.js';
import { getOverallStatistics } from '../utils/statisticsManager.js';
import ProgressBar from './ProgressBar.jsx';

const SELECTION_KEY = 'kana-quiz-selection';
const GITHUB_URL = 'https://github.com/maluramichael/hiragana-trainer';

const defaultSelection = {
  basic: false,
  basicSubs: {
    vowels: false,
    k: false,
    s: false,
    t: false,
    n: false,
    h: false,
    m: false,
    y: false,
    r: false,
    w: false
  },
  dakuten: false,
  dakutenSubs: {
    g: false,
    z: false,
    d: false,
    b: false
  },
  handakuten: false,
  handakutenSubs: {
    p: false
  }
};

// Keep only the keys we know about and coerce every value to a boolean, so a
// stale or hand-edited localStorage blob can never inject an unknown subgroup
// key that would later crash getKanaForSelection.
const pickBools = (defaults, source) =>
  Object.fromEntries(Object.keys(defaults).map(key => [key, Boolean(source && source[key])]));

// Restore the persisted selection, robust against a missing/corrupt value.
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

const KanaSelection = ({ onStartQuiz, onViewStatistics }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState(loadSelection);

  useEffect(() => {
    // Load progress data when component mounts
    setProgress(getAllGroupProgress());
    setHasData(getOverallStatistics().practicedKana > 0);
  }, []);

  // Persist the current selection so returning learners only press Start.
  useEffect(() => {
    try {
      localStorage.setItem(SELECTION_KEY, JSON.stringify(selectedGroups));
    } catch {
      // Persistence is a convenience; ignore quota/availability errors.
    }
  }, [selectedGroups]);

  const handleMainGroupToggle = (group) => {
    const newValue = !selectedGroups[group];
    setSelectedGroups(prev => ({
      ...prev,
      [group]: newValue,
      [`${group}Subs`]: Object.fromEntries(
        Object.keys(prev[`${group}Subs`]).map(key => [key, newValue])
      )
    }));
  };

  const handleSubGroupToggle = (mainGroup, subGroup) => {
    setSelectedGroups(prev => {
      const newSubs = {
        ...prev[`${mainGroup}Subs`],
        [subGroup]: !prev[`${mainGroup}Subs`][subGroup]
      };

      const allSubsSelected = Object.values(newSubs).every(Boolean);
      const anySubSelected = Object.values(newSubs).some(Boolean);

      return {
        ...prev,
        [`${mainGroup}Subs`]: newSubs,
        [mainGroup]: allSubsSelected || (anySubSelected && prev[mainGroup])
      };
    });
  };

  const handleStartQuiz = () => {
    const kanaToStudy = getKanaForSelection(selectedGroups);
    if (kanaToStudy.length > 0) {
      onStartQuiz(kanaToStudy);
    }
  };

  // One-click quickstart: pick the five vowels and jump straight into the quiz,
  // so the very first click is productive even before any group is chosen.
  const handleQuickstart = () => {
    const quickSelection = {
      ...defaultSelection,
      basicSubs: { ...defaultSelection.basicSubs, vowels: true }
    };
    setSelectedGroups(quickSelection);
    const kanaToStudy = getKanaForSelection(quickSelection);
    if (kanaToStudy.length > 0) {
      onStartQuiz(kanaToStudy);
    }
  };

  const selectedCount = getKanaForSelection(selectedGroups).length;

  const RecommendedBadge = () => (
    <span className="ml-2 inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
      {t('selection.recommended')}
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6 gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {t('selection.headline')}
            </h1>
            <p className="text-gray-600 mb-2">
              {t('selection.payoff')}
            </p>
            <p className="text-sm text-gray-500">
              {t('selection.trust')}{' '}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                {t('selection.github')}
              </a>
            </p>
          </div>

          {hasData ? (
            <button
              onClick={onViewStatistics}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md whitespace-nowrap"
            >
              📊 {t('statistics.title')}
            </button>
          ) : (
            <button
              onClick={onViewStatistics}
              className="text-sm text-gray-500 hover:text-gray-700 underline whitespace-nowrap"
            >
              {t('selection.viewStats')}
            </button>
          )}
        </div>

        {/* First-run onboarding: one calm sentence on how the quiz works. */}
        <p className="text-gray-600 bg-white/60 rounded-lg px-4 py-3 mb-6">
          {t('selection.intro')}
        </p>

        {/* One-click quickstart above the group picker. */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 text-center">
          <button
            data-testid="quickstart-button"
            onClick={handleQuickstart}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl text-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            🚀 {t('selection.quickstart')}
          </button>
          <p className="text-sm text-gray-500 mt-3">
            {t('selection.quickstartHint')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            ひらがな & カタカナ (Hiragana & Katakana)
          </h2>

          <div className="space-y-4">
            {/* Basic Section */}
            <div>
              <div className="p-3 rounded-lg bg-gray-50 mb-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGroups.basic}
                    onChange={() => handleMainGroupToggle('basic')}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-gray-700 font-semibold flex-1">
                    {t('groups.basic')}
                    <RecommendedBadge />
                  </span>
                </label>
                <p className="ml-8 mt-1 text-xs text-gray-500">
                  {t('selection.basicHint')}
                </p>

                {progress && (
                  <div className="mt-2 ml-8">
                    <ProgressBar
                      {...progress.basic.overall}
                      showDetails={true}
                      t={t}
                    />
                  </div>
                )}
              </div>

              <div className="ml-8 space-y-2 mt-2">
                {[
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
                ].map(({ key, translationKey, recommended }) => (
                  <div key={key} className="p-2 rounded hover:bg-gray-50">
                    <label className="flex items-center cursor-pointer mb-1">
                      <input
                        type="checkbox"
                        checked={selectedGroups.basicSubs[key]}
                        onChange={() => handleSubGroupToggle('basic', key)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-600 flex-1">
                        {t(translationKey)}
                        {recommended && <RecommendedBadge />}
                      </span>
                    </label>

                    {progress && progress.basic.subgroups[key] && (
                      <div className="ml-7">
                        <ProgressBar
                          {...progress.basic.subgroups[key]}
                          showDetails={false}
                          t={t}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dakuten Section */}
            <div>
              <div className="p-3 rounded-lg bg-gray-50 mb-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGroups.dakuten}
                    onChange={() => handleMainGroupToggle('dakuten')}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-gray-700 font-semibold flex-1">
                    {t('groups.dakuten')}
                  </span>
                </label>
                <p className="ml-8 mt-1 text-xs text-gray-500">
                  {t('selection.dakutenHint')}
                </p>

                {progress && (
                  <div className="mt-2 ml-8">
                    <ProgressBar
                      {...progress.dakuten.overall}
                      showDetails={true}
                      t={t}
                    />
                  </div>
                )}
              </div>

              <div className="ml-8 space-y-2 mt-2">
                {[
                  { key: 'g', translationKey: 'subgroups.gSeries' },
                  { key: 'z', translationKey: 'subgroups.zSeries' },
                  { key: 'd', translationKey: 'subgroups.dSeries' },
                  { key: 'b', translationKey: 'subgroups.bSeries' }
                ].map(({ key, translationKey }) => (
                  <div key={key} className="p-2 rounded hover:bg-gray-50">
                    <label className="flex items-center cursor-pointer mb-1">
                      <input
                        type="checkbox"
                        checked={selectedGroups.dakutenSubs[key]}
                        onChange={() => handleSubGroupToggle('dakuten', key)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-600 flex-1">
                        {t(translationKey)}
                      </span>
                    </label>

                    {progress && progress.dakuten.subgroups[key] && (
                      <div className="ml-7">
                        <ProgressBar
                          {...progress.dakuten.subgroups[key]}
                          showDetails={false}
                          t={t}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Handakuten Section */}
            <div>
              <div className="p-3 rounded-lg bg-gray-50 mb-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGroups.handakuten}
                    onChange={() => handleMainGroupToggle('handakuten')}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-gray-700 font-semibold flex-1">
                    {t('groups.handakuten')}
                  </span>
                </label>
                <p className="ml-8 mt-1 text-xs text-gray-500">
                  {t('selection.handakutenHint')}
                </p>

                {progress && (
                  <div className="mt-2 ml-8">
                    <ProgressBar
                      {...progress.handakuten.overall}
                      showDetails={true}
                      t={t}
                    />
                  </div>
                )}
              </div>

              <div className="ml-8 space-y-2 mt-2">
                {[
                  { key: 'p', translationKey: 'subgroups.pSeries' }
                ].map(({ key, translationKey }) => (
                  <div key={key} className="p-2 rounded hover:bg-gray-50">
                    <label className="flex items-center cursor-pointer mb-1">
                      <input
                        type="checkbox"
                        checked={selectedGroups.handakutenSubs[key]}
                        onChange={() => handleSubGroupToggle('handakuten', key)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-600 flex-1">
                        {t(translationKey)}
                      </span>
                    </label>

                    {progress && progress.handakuten.subgroups[key] && (
                      <div className="ml-7">
                        <ProgressBar
                          {...progress.handakuten.subgroups[key]}
                          showDetails={false}
                          t={t}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Start Quiz Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <button
                onClick={handleStartQuiz}
                disabled={selectedCount === 0}
                className={`px-8 py-4 rounded-xl text-xl font-semibold transition-all transform ${
                  selectedCount > 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedCount > 0 ? (
                  <>
                    🚀 {t('selection.startQuiz')}
                  </>
                ) : (
                  t('selection.startQuiz')
                )}
              </button>

              {selectedCount > 0 && (
                <p className="mt-3 text-sm text-gray-600">
                  {selectedCount} {t('selection.charactersSelected')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanaSelection;
