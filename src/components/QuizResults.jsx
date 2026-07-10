import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { exportStatisticsAsBase64 } from '../utils/statisticsManager';
import { calculateGroupProgress, getProgressDescription } from '../utils/progressCalculator';
import { trackEvent } from '../utils/analytics';
import KanaBackground from './KanaBackground.jsx';
import { SparkleIcon, ShareIcon, RepeatIcon, RocketIcon, StarIcon } from './icons.jsx';

const APP_URL = 'https://hiragana-trainer.de';
const GITHUB_URL = 'https://github.com/maluramichael/hiragana-trainer';
const SPONSORS_URL = 'https://github.com/sponsors/maluramichael';
const AUTHOR_URL = 'https://malura.de';
const TOFUGU_HIRAGANA_URL = 'https://www.tofugu.com/japanese/learn-hiragana/';
const TOFUGU_KATAKANA_URL = 'https://www.tofugu.com/japanese/learn-katakana/';

// #52: ab diesem Progress-Level (Experte) gilt eine Serie als gemeistert.
const MASTERY_LEVEL = 9;

const QuizResults = ({ results, onRestart, onNewSelection, kanaList = [] }) => {
  const { t } = useTranslation();
  const [shareStatus, setShareStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);

  const accuracy = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
  const incorrect = results.total - results.correct;
  // Nudge the learner in the right direction: a strong round makes "choose
  // different characters" the primary CTA (move on), a shaky round makes
  // "practice the same kana again" primary (repeat). The other stays secondary.
  const recommendNew = accuracy >= 80;

  // #90: Runde abgeschlossen — einmalig beim Anzeigen der Ergebnisse melden.
  useEffect(() => {
    trackEvent('quiz_finished', `${accuracy}%`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // #52: Serien der geübten Auswahl auf echtes Mastery prüfen (Daten aus localStorage,
  // bereits während des Quiz aktualisiert). Nur wirklich erreichte Meilensteine feiern.
  const masteredSeries = useMemo(() => {
    const uniqueSeries = new Map();
    kanaList.forEach((k) => {
      if (k.type && k.series) uniqueSeries.set(`${k.type}:${k.series}`, { type: k.type, series: k.series });
    });
    return [...uniqueSeries.values()]
      .map(({ type, series }) => ({ series, level: calculateGroupProgress(type, series).level }))
      .filter((s) => s.level >= MASTERY_LEVEL);
  }, [kanaList]);

  const getPerformanceMessage = () => {
    if (accuracy >= 95) return { message: t('results.perfect'), color: "text-emerald-500" };
    if (accuracy >= 80) return { message: t('results.excellent'), color: "text-violet-500" };
    if (accuracy >= 65) return { message: t('results.good'), color: "text-amber-500" };
    return { message: t('results.keepPracticing'), color: "text-rose-500" };
  };

  const performance = getPerformanceMessage();

  const handleShare = async () => {
    trackEvent('share_clicked', `${accuracy}%`);
    const text = t('results.shareText', { accuracy, url: APP_URL });
    const shareData = { title: t('results.shareTitle'), text, url: APP_URL };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareStatus('copied');
    } catch {
      // User cancelled the native share sheet, or copy failed — no action needed.
    }
  };

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportStatisticsAsBase64());
      setExportStatus('copied');
    } catch {
      setExportStatus('error');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-fuchsia-50 to-indigo-100 p-6 pb-24">
      <KanaBackground />
      <div className="relative max-w-2xl mx-auto">
        <div className="animate-pop-in rounded-[1.75rem] bg-white/90 p-8 text-center shadow-cute-lg ring-1 ring-white/70">
          <div aria-hidden="true" className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-pink-400 text-white shadow-cute">
            <SparkleIcon className="w-8 h-8" />
          </div>
          <h1 className="mb-2 text-4xl font-extrabold text-slate-900">{t('results.title')}</h1>

          <div className={`mb-8 text-2xl font-bold ${performance.color}`}>
            {performance.message}
          </div>

          {/* Mastery-Feier (#52): nur echte, aus den Daten ableitbare Meilensteine */}
          {masteredSeries.length > 0 && (
            <div className="mb-8 rounded-2xl bg-amber-50 p-4 text-left ring-1 ring-amber-200">
              <div className="mb-1 flex items-center gap-2 font-bold text-amber-800">
                <StarIcon className="w-5 h-5 fill-amber-400 text-amber-400" /> {t('mastery.title')}
              </div>
              <ul className="space-y-1 text-sm text-amber-700">
                {masteredSeries.map((s) => (
                  <li key={s.series}>
                    {t('mastery.reached', {
                      series: t(`mastery.series.${s.series}`),
                      level: getProgressDescription(s.level, t),
                    })}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Results Grid */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-fuchsia-50 p-6 ring-1 ring-fuchsia-100">
              <div className="mb-2 text-3xl font-extrabold text-fuchsia-600">{results.correct}</div>
              <div className="text-slate-600">{t('results.correctAnswers')}</div>
              <div className="text-sm text-slate-400">{t('results.outOf')} {results.total}</div>
            </div>

            <div className="rounded-2xl bg-violet-50 p-6 ring-1 ring-violet-100">
              <div className="mb-2 text-3xl font-extrabold text-violet-600">{accuracy}%</div>
              <div className="text-slate-600">{t('quiz.accuracy')}</div>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-6 ring-1 ring-emerald-100">
              <div className="mb-2 text-3xl font-extrabold text-emerald-600">{results.bestStreak}</div>
              <div className="text-slate-600">{t('results.bestStreak')}</div>
            </div>

            <div className="rounded-2xl bg-rose-50 p-6 ring-1 ring-rose-100">
              <div className="mb-2 text-3xl font-extrabold text-rose-500">{incorrect}</div>
              <div className="text-slate-600">{t('results.incorrect')}</div>
            </div>
          </div>

          {/* Next step (#37): concrete recommendation out of this screen */}
          <div className="mb-8 rounded-2xl bg-indigo-50 p-5 text-left ring-1 ring-indigo-100">
            <div className="mb-1 font-bold text-slate-800">{t('results.nextStepTitle')}</div>
            <p className="text-sm text-slate-600">
              {incorrect > 0 ? t('results.nextStepReview') : t('results.nextStepKeepGoing')}
            </p>
          </div>

          {/* Action Buttons — the recommended next step is the prominent one. */}
          <div className="space-y-3">
            {(() => {
              const primaryClass = 'inline-flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-fuchsia-500 px-6 py-4 font-bold text-white shadow-cute transition-all hover:-translate-y-0.5 hover:bg-fuchsia-600 active:translate-y-0.5';
              const secondaryClass = 'inline-flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-white px-6 py-3.5 font-bold text-slate-600 ring-2 ring-fuchsia-100 transition-all hover:bg-fuchsia-50';
              const repeatButton = (className) => (
                <button onClick={onRestart} className={className}>
                  <RepeatIcon className="w-5 h-5" /> {t('results.practiceSame')}
                </button>
              );
              const newButton = (className) => (
                <button onClick={onNewSelection} className={className}>
                  <RocketIcon className="w-5 h-5" /> {t('results.chooseDifferent')}
                </button>
              );
              return recommendNew
                ? <>{newButton(primaryClass)}{repeatButton(secondaryClass)}</>
                : <>{repeatButton(primaryClass)}{newButton(secondaryClass)}</>;
            })()}

            <button
              onClick={handleShare}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-white px-6 py-3 font-bold text-slate-700 ring-2 ring-fuchsia-100 transition-all hover:bg-fuchsia-50"
            >
              <ShareIcon className="w-5 h-5" /> {t('results.share')}
            </button>
            {shareStatus === 'copied' && (
              <p className="text-sm font-medium text-emerald-600">{t('results.shareCopied')}</p>
            )}
          </div>

          {/* Cross-device (#87): dezenter Zugang zum Export-Code */}
          <div className="mt-6 text-sm text-slate-400">
            <button
              onClick={handleCopyExport}
              className="underline transition-colors hover:text-fuchsia-600"
            >
              {t('results.crossDevice')}
            </button>
            {exportStatus === 'copied' && (
              <span className="ml-2 text-emerald-600">{t('results.crossDeviceCopied')}</span>
            )}
            {exportStatus === 'error' && (
              <span className="ml-2 text-rose-500">{t('results.crossDeviceError')}</span>
            )}
          </div>
        </div>

        {/* Recommended resources (#93) */}
        <div className="mt-6 rounded-2xl bg-white/85 p-6 text-left shadow-cute ring-1 ring-white/60">
          <div className="mb-3 font-bold text-slate-800">{t('results.recommendedTitle')}</div>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={TOFUGU_HIRAGANA_URL} target="_blank" rel="noopener noreferrer"
                className="font-semibold text-fuchsia-600 hover:underline">
                {t('results.recommendedHiragana')}
              </a>
            </li>
            <li>
              <a href={TOFUGU_KATAKANA_URL} target="_blank" rel="noopener noreferrer"
                className="font-semibold text-fuchsia-600 hover:underline">
                {t('results.recommendedKatakana')}
              </a>
            </li>
          </ul>
        </div>

        {/* Support (#26) + About (#78) */}
        <div className="mt-6 rounded-2xl bg-white/85 p-6 text-left shadow-cute ring-1 ring-white/60">
          <div className="mb-3 flex items-center gap-2 font-bold text-slate-800">
            <StarIcon className="w-5 h-5 fill-amber-400 text-amber-400" /> {t('results.supportTitle')}
          </div>
          <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
              className="font-semibold text-fuchsia-600 hover:underline">
              {t('results.starGithub')}
            </a>
            <a href={SPONSORS_URL} target="_blank" rel="noopener noreferrer"
              className="font-semibold text-fuchsia-600 hover:underline">
              {t('results.sponsor')}
            </a>
          </div>
          <p className="text-sm text-slate-500">
            {t('results.aboutBy')}{' '}
            <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer"
              className="font-semibold text-fuchsia-600 hover:underline">
              Michael Malura
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
