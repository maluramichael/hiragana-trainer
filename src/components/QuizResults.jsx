import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { exportStatisticsAsBase64 } from '../utils/statisticsManager';
import { calculateGroupProgress, getProgressDescription } from '../utils/progressCalculator';
import { trackEvent } from '../utils/analytics';

const APP_URL = 'https://hiragana-trainer.malura.de';
const GITHUB_URL = 'https://github.com/maluramichael/hiragana-trainer';
const SPONSORS_URL = 'https://github.com/sponsors/maluramichael';
const AUTHOR_URL = 'https://malura.de';
const TOFUGU_HIRAGANA_URL = 'https://www.tofugu.com/japanese/learn-hiragana/';
const TOFUGU_KATAKANA_URL = 'https://www.tofugu.com/japanese/learn-katakana/';

// #52: ab diesem Progress-Level (Experte) gilt eine Serie als gemeistert.
const MASTERY_LEVEL = 9;

// #22: geübte Auswahl als base64-Parameter kodieren (UTF-8-sicher, Kana sind
// mehrbytig). Kodiert nur die Kana-Zeichen; App.jsx löst sie wieder zu Objekten auf.
const buildChallengeUrl = (kanaList) => {
  const chars = kanaList.map((k) => k.kana);
  const base64 = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(chars))));
  return `${APP_URL}/?challenge=${encodeURIComponent(base64)}`;
};

const QuizResults = ({ results, onRestart, onNewSelection, kanaList = [] }) => {
  const { t } = useTranslation();
  const [shareStatus, setShareStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [challengeStatus, setChallengeStatus] = useState(null);

  const accuracy = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
  const incorrect = results.total - results.correct;

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
    if (accuracy >= 95) return { message: t('results.perfect'), color: "text-green-600" };
    if (accuracy >= 80) return { message: t('results.excellent'), color: "text-blue-600" };
    if (accuracy >= 65) return { message: t('results.good'), color: "text-yellow-600" };
    return { message: t('results.keepPracticing'), color: "text-red-600" };
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

  // #22: Challenge-Link erzeugen und in die Zwischenablage kopieren.
  const handleChallenge = async () => {
    try {
      await navigator.clipboard.writeText(buildChallengeUrl(kanaList));
      trackEvent('challenge_created', String(kanaList.length));
      setChallengeStatus('copied');
    } catch {
      setChallengeStatus('error');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('results.title')}</h1>

          <div className={`text-2xl font-semibold mb-8 ${performance.color}`}>
            {performance.message}
          </div>

          {/* Mastery-Feier (#52): nur echte, aus den Daten ableitbare Meilensteine */}
          {masteredSeries.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
              <div className="font-semibold text-amber-800 mb-1">{t('mastery.title')}</div>
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
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{results.correct}</div>
              <div className="text-gray-600">{t('results.correctAnswers')}</div>
              <div className="text-sm text-gray-500">{t('results.outOf')} {results.total}</div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">{accuracy}%</div>
              <div className="text-gray-600">{t('quiz.accuracy')}</div>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{results.bestStreak}</div>
              <div className="text-gray-600">{t('results.bestStreak')}</div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{incorrect}</div>
              <div className="text-gray-600">{t('results.incorrect')}</div>
            </div>
          </div>

          {/* Next step (#37): concrete recommendation out of this screen */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8 text-left">
            <div className="font-semibold text-gray-800 mb-1">{t('results.nextStepTitle')}</div>
            <p className="text-gray-600 text-sm">
              {incorrect > 0 ? t('results.nextStepReview') : t('results.nextStepKeepGoing')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={onRestart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              {t('results.practiceSame')}
            </button>

            <button
              onClick={onNewSelection}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              {t('results.chooseDifferent')}
            </button>

            <button
              onClick={handleShare}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all"
            >
              {t('results.share')}
            </button>
            {shareStatus === 'copied' && (
              <p className="text-sm text-green-600">{t('results.shareCopied')}</p>
            )}

            {/* Challenge a friend (#22): only when we know what was practiced */}
            {kanaList.length > 0 && (
              <button
                onClick={handleChallenge}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all"
              >
                {t('results.challenge')}
              </button>
            )}
            {challengeStatus === 'copied' && (
              <p className="text-sm text-green-600">{t('results.challengeCopied')}</p>
            )}
            {challengeStatus === 'error' && (
              <p className="text-sm text-red-600">{t('results.challengeError')}</p>
            )}
          </div>

          {/* Cross-device (#87): dezenter Zugang zum Export-Code */}
          <div className="mt-6 text-sm text-gray-500">
            <button
              onClick={handleCopyExport}
              className="underline hover:text-gray-700 transition-colors"
            >
              {t('results.crossDevice')}
            </button>
            {exportStatus === 'copied' && (
              <span className="ml-2 text-green-600">{t('results.crossDeviceCopied')}</span>
            )}
            {exportStatus === 'error' && (
              <span className="ml-2 text-red-600">{t('results.crossDeviceError')}</span>
            )}
          </div>
        </div>

        {/* Recommended resources (#93) */}
        <div className="bg-white rounded-2xl shadow p-6 mt-6 text-left">
          <div className="font-semibold text-gray-800 mb-3">{t('results.recommendedTitle')}</div>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={TOFUGU_HIRAGANA_URL} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline">
                {t('results.recommendedHiragana')}
              </a>
            </li>
            <li>
              <a href={TOFUGU_KATAKANA_URL} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline">
                {t('results.recommendedKatakana')}
              </a>
            </li>
          </ul>
        </div>

        {/* Support (#26) + About (#78) */}
        <div className="bg-white rounded-2xl shadow p-6 mt-6 text-left">
          <div className="font-semibold text-gray-800 mb-3">{t('results.supportTitle')}</div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-4">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:underline">
              {t('results.starGithub')}
            </a>
            <a href={SPONSORS_URL} target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:underline">
              {t('results.sponsor')}
            </a>
          </div>
          <p className="text-sm text-gray-500">
            {t('results.aboutBy')}{' '}
            <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:underline">
              Michael Malura
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
