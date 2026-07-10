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
import ProgressBar from './ProgressBar.jsx';
import KanaBackground from './KanaBackground.jsx';
import { RocketIcon, ChartIcon, BookIcon, RepeatIcon, ClockIcon } from './icons.jsx';

// Hiragana Unicode block; anything else is treated as Katakana.
const isHiragana = (char) => /[぀-ゟ]/.test(char);

// Map every kana's stats key ("<kana>-<romaji>") to its full data object, so a
// weak/due entry (a stat object or a bare key) can be turned back into the
// kana object the quiz expects (#9/#12).
const kanaByKey = new Map(
  [...hiragana, ...katakana].map((k) => [`${k.kana}-${k.romaji}`, k])
);

// Resolve weak/due items to real kana objects. Weak items are stat objects,
// due items are bare keys; both collapse to the same "<kana>-<romaji>" lookup.
const resolveKana = (items) =>
  items
    .map((item) => (typeof item === 'string' ? item : `${item.kana}-${item.romaji}`))
    .map((key) => kanaByKey.get(key))
    .filter(Boolean);

// Pick the narrowest script mode that still covers the given kana, so a review
// round drills only the script(s) the learner actually needs.
const deriveScriptMode = (list) => {
  const hasHira = list.some((k) => isHiragana(k.kana));
  const hasKata = list.some((k) => !isHiragana(k.kana));
  if (hasHira && hasKata) return 'both';
  return hasHira ? 'hiragana' : 'katakana';
};

const SELECTION_KEY = 'kana-quiz-selection';
const SCRIPT_MODE_KEY = 'kana-quiz-script-mode';
const GITHUB_URL = 'https://github.com/maluramichael/hiragana-trainer';

// Which script(s) the quiz drills. Default on first visit is Hiragana only —
// the natural order in which learners pick up Japanese.
const SCRIPT_MODES = ['hiragana', 'katakana', 'both'];
const DEFAULT_SCRIPT_MODE = 'hiragana';

// Restore the persisted script mode, robust against a missing/corrupt value.
const loadScriptMode = () => {
  try {
    const raw = localStorage.getItem(SCRIPT_MODE_KEY);
    return SCRIPT_MODES.includes(raw) ? raw : DEFAULT_SCRIPT_MODE;
  } catch {
    return DEFAULT_SCRIPT_MODE;
  }
};

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

const KanaSelection = ({ onStartQuiz, onStudy, onViewStatistics }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState(loadSelection);
  const [scriptMode, setScriptMode] = useState(loadScriptMode);
  // Kana surfaced by the two shortcut buttons (#9 weak, #12 due). Empty until
  // there is real practice history, which keeps the buttons hidden on a fresh visit.
  const [weakKana, setWeakKana] = useState([]);
  const [dueKana, setDueKana] = useState([]);

  useEffect(() => {
    // Load progress data when component mounts
    setProgress(getAllGroupProgress());
    setHasData(getOverallStatistics().practicedKana > 0);

    // #9: kana the learner keeps missing.
    setWeakKana(resolveKana(getWeakKana()));

    // #12: previously practiced kana whose spaced-repetition interval elapsed.
    // Restrict candidates to practiced kana so untouched ones (which count as
    // "due" by default) don't make this a "review everything" button.
    const stats = getStatistics();
    const practicedKeys = Object.keys(stats).filter((key) => stats[key].timesShown > 0);
    setDueKana(resolveKana(getDueKana(practicedKeys)));
  }, []);

  // Persist the current selection so returning learners only press Start.
  useEffect(() => {
    try {
      localStorage.setItem(SELECTION_KEY, JSON.stringify(selectedGroups));
    } catch {
      // Persistence is a convenience; ignore quota/availability errors.
    }
  }, [selectedGroups]);

  // Persist the chosen script mode alongside the group selection.
  useEffect(() => {
    try {
      localStorage.setItem(SCRIPT_MODE_KEY, scriptMode);
    } catch {
      // Persistence is a convenience; ignore quota/availability errors.
    }
  }, [scriptMode]);

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
      onStartQuiz(kanaToStudy, { scriptMode });
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
      onStartQuiz(kanaToStudy, { scriptMode });
    }
  };

  // #4: study the current selection as flashcards before quizzing.
  const handleStudy = () => {
    const kanaToStudy = getKanaForSelection(selectedGroups);
    if (kanaToStudy.length > 0) {
      onStudy(kanaToStudy, { scriptMode });
    }
  };

  // #9/#12: start a focused quiz on only the weak / due kana, drilling the
  // narrowest script mode that still covers them.
  const handlePracticeWeak = () => {
    if (weakKana.length > 0) {
      onStartQuiz(weakKana, { scriptMode: deriveScriptMode(weakKana) });
    }
  };

  const handleReviewDue = () => {
    if (dueKana.length > 0) {
      onStartQuiz(dueKana, { scriptMode: deriveScriptMode(dueKana) });
    }
  };

  const selectedCount = getKanaForSelection(selectedGroups).length;

  const RecommendedBadge = () => (
    <span className="ml-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      {t('selection.recommended')}
    </span>
  );

  // One reusable, cutely-styled group block (main checkbox + hint + progress +
  // its sub-series checkboxes), so the three sections stay identical in look.
  // A plain function (not a nested component) so toggling never remounts the
  // inputs and loses focus.
  const renderGroup = (group, hint, subs) => (
    <div className="rounded-2xl bg-fuchsia-50/60 p-4 ring-1 ring-fuchsia-100">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={selectedGroups[group]}
          onChange={() => handleMainGroupToggle(group)}
          className="h-5 w-5 rounded-md accent-fuchsia-500"
        />
        <span className="ml-3 flex-1 font-bold text-slate-700">
          {t(`groups.${group}`)}
          {group === 'basic' && <RecommendedBadge />}
        </span>
      </label>
      <p className="ml-8 mt-1 text-xs text-slate-500">{hint}</p>

      {progress && (
        <div className="mt-2 ml-8">
          <ProgressBar {...progress[group].overall} showDetails={true} t={t} />
        </div>
      )}

      <div className="ml-8 mt-3 space-y-1.5">
        {subs.map(({ key, translationKey, recommended }) => (
          <div key={key} className="rounded-xl p-2 transition-colors hover:bg-white/70">
            <label className="mb-1 flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGroups[`${group}Subs`][key]}
                onChange={() => handleSubGroupToggle(group, key)}
                className="h-4 w-4 rounded accent-fuchsia-500"
              />
              <span className="ml-3 flex-1 text-sm text-slate-600">
                {t(translationKey)}
                {recommended && <RecommendedBadge />}
              </span>
            </label>

            {progress && progress[group].subgroups[key] && (
              <div className="ml-7">
                <ProgressBar {...progress[group].subgroups[key]} showDetails={false} t={t} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-fuchsia-50 to-indigo-100 p-6">
      <KanaBackground />
      <div className="relative max-w-4xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-slate-900">
              {t('selection.headline')}
            </h1>
            <p className="mb-2 text-slate-600">
              {t('selection.payoff')}
            </p>
            <p className="text-sm text-slate-500">
              {t('selection.trust')}{' '}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-fuchsia-600 underline hover:text-fuchsia-800"
              >
                {t('selection.github')}
              </a>
            </p>
          </div>

          {hasData ? (
            <button
              onClick={onViewStatistics}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 font-semibold text-white shadow-cute transition-all hover:-translate-y-0.5"
            >
              <ChartIcon className="w-5 h-5" /> {t('statistics.title')}
            </button>
          ) : (
            <button
              onClick={onViewStatistics}
              className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-slate-500 underline hover:text-fuchsia-600"
            >
              <ChartIcon className="w-4 h-4" /> {t('selection.viewStats')}
            </button>
          )}
        </div>

        {/* First-run onboarding: one calm sentence on how the quiz works. */}
        <p className="mb-6 rounded-2xl bg-white/70 px-4 py-3 text-slate-600 ring-1 ring-white/60">
          {t('selection.intro')}
        </p>

        {/* One-click quickstart above the group picker. */}
        <div className="mb-6 rounded-[1.75rem] bg-white/80 p-6 text-center shadow-cute ring-1 ring-white/70">
          <button
            data-testid="quickstart-button"
            onClick={handleQuickstart}
            className="group inline-flex items-center gap-2.5 rounded-[1.4rem] bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-xl font-bold text-white shadow-cute-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5"
          >
            <RocketIcon className="w-6 h-6 transition-transform duration-200 group-hover:-rotate-12" />
            {t('selection.quickstart')}
          </button>
          <p className="mt-3 text-sm text-slate-500">
            {t('selection.quickstartHint')}
          </p>
        </div>

        {/* Review shortcuts: only shown once there is practice history to act on
            (#9 weak kana, #12 due kana). */}
        {(weakKana.length > 0 || dueKana.length > 0) && (
          <div className="mb-6 flex flex-col justify-center gap-3 sm:flex-row">
            {weakKana.length > 0 && (
              <button
                onClick={handlePracticeWeak}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-cute transition-all hover:-translate-y-0.5"
              >
                <RepeatIcon className="w-5 h-5" /> {t('selection.practiceWeak')}
              </button>
            )}
            {dueKana.length > 0 && (
              <button
                onClick={handleReviewDue}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-cute transition-all hover:-translate-y-0.5"
              >
                <ClockIcon className="w-5 h-5" /> {t('selection.reviewDue')}
              </button>
            )}
          </div>
        )}

        <div className="mb-8 rounded-[1.75rem] bg-white/85 p-6 shadow-cute ring-1 ring-white/70">
          <h2 className="font-kana mb-4 text-center text-2xl font-bold text-slate-800">
            ひらがな & カタカナ (Hiragana & Katakana)
          </h2>

          {/* Script mode: drill only Hiragana, only Katakana, or both (#72). */}
          <fieldset className="mb-6">
            <legend className="mb-2 w-full text-center text-sm font-semibold text-slate-600">
              {t('selection.scriptMode')}
            </legend>
            <div className="flex justify-center gap-2">
              {[
                { value: 'hiragana', label: 'selection.scriptHiragana' },
                { value: 'katakana', label: 'selection.scriptKatakana' },
                { value: 'both', label: 'selection.scriptBoth' }
              ].map(({ value, label }) => (
                <label
                  key={value}
                  className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                    scriptMode === value
                      ? 'bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-cute'
                      : 'bg-fuchsia-50 text-slate-600 ring-1 ring-fuchsia-100 hover:bg-fuchsia-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="scriptMode"
                    value={value}
                    checked={scriptMode === value}
                    onChange={() => setScriptMode(value)}
                    className="sr-only"
                  />
                  {t(label)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-4">
            {renderGroup('basic', t('selection.basicHint'), [
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
            {renderGroup('dakuten', t('selection.dakutenHint'), [
              { key: 'g', translationKey: 'subgroups.gSeries' },
              { key: 'z', translationKey: 'subgroups.zSeries' },
              { key: 'd', translationKey: 'subgroups.dSeries' },
              { key: 'b', translationKey: 'subgroups.bSeries' }
            ])}
            {renderGroup('handakuten', t('selection.handakutenHint'), [
              { key: 'p', translationKey: 'subgroups.pSeries' }
            ])}
          </div>

          {/* Start Quiz Button */}
          <div className="mt-8 border-t border-fuchsia-100 pt-6">
            <div className="text-center">
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  onClick={handleStudy}
                  disabled={selectedCount === 0}
                  className={`inline-flex items-center gap-2 rounded-[1.4rem] px-6 py-4 text-lg font-bold transition-all ${
                    selectedCount > 0
                      ? 'bg-white text-indigo-600 ring-2 ring-indigo-300 shadow-cute hover:-translate-y-0.5'
                      : 'cursor-not-allowed bg-slate-100 text-slate-400 ring-2 ring-slate-200'
                  }`}
                >
                  <BookIcon className="w-5 h-5" /> {t('selection.studyFirst')}
                </button>

                <button
                  onClick={handleStartQuiz}
                  disabled={selectedCount === 0}
                  className={`inline-flex items-center gap-2.5 rounded-[1.4rem] px-8 py-4 text-xl font-bold transition-all ${
                    selectedCount > 0
                      ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-cute-lg hover:-translate-y-0.5 active:translate-y-0.5'
                      : 'cursor-not-allowed bg-slate-200 text-slate-400'
                  }`}
                >
                  {selectedCount > 0 && <RocketIcon className="w-6 h-6" />}
                  {t('selection.startQuiz')}
                </button>
              </div>

              {selectedCount > 0 && (
                <p className="mt-3 text-sm text-slate-500">
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
