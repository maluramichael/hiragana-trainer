import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getScriptCounterpart } from '../data/kana.js';
import { updateKanaStatistics, getBestStreak, updateBestStreak, scheduleReview } from '../utils/statisticsManager.js';
import { ArrowLeftIcon } from './icons.jsx';

// Accept common Kunrei/Hepburn spelling variants, not only the canonical romaji (#29).
// Keyed on the canonical romaji stored in kana.js (always the Hepburn form).
const romajiAliases = {
  shi: ['si'],
  chi: ['ti'],
  tsu: ['tu'],
  fu: ['hu'],
  ji: ['zi', 'di'],
  zu: ['du']
};

const isRomajiCorrect = (input, romaji) => {
  const normalized = input.toLowerCase().trim();
  return normalized === romaji || (romajiAliases[romaji] || []).includes(normalized);
};

// Hiragana Unicode block; anything else in a pair is the Katakana side.
const isHiragana = (char) => /[぀-ゟ]/.test(char);

const KanaQuiz = ({ kanaList, onFinish, scriptMode = 'both' }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => getBestStreak());
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [incorrectQueue, setIncorrectQueue] = useState([]);
  const inputRef = useRef(null);
  const advanceButtonRef = useRef(null);
  // Best streak persisted before this session started — used to flag a new record.
  const persistedBestRef = useRef(getBestStreak());

  useEffect(() => {
    // Build a flat list of single-character questions. In "both" mode each pair
    // contributes TWO separate questions (the hiragana and the katakana), so the
    // scripts are drilled one at a time, shuffled together and alternating, not
    // shown side by side. Single-script modes contribute one question per pair.
    // Dedupe on the character pair so ぢ/づ stay distinct from じ/ず despite
    // sharing romaji (#11).
    const seen = new Set();
    const questions = [];

    kanaList.forEach((kana) => {
      const counterpart = getScriptCounterpart(kana);
      if (!counterpart) return;

      const hiraganaChar = isHiragana(kana.kana) ? kana.kana : counterpart.kana;
      const katakanaChar = isHiragana(kana.kana) ? counterpart.kana : kana.kana;
      const pairKey = `${hiraganaChar}-${katakanaChar}`;
      if (seen.has(pairKey)) return;
      seen.add(pairKey);

      if (scriptMode !== 'katakana') {
        questions.push({ kana: hiraganaChar, romaji: kana.romaji, script: 'hiragana' });
      }
      if (scriptMode !== 'hiragana') {
        questions.push({ kana: katakanaChar, romaji: kana.romaji, script: 'katakana' });
      }
    });

    setShuffledQuestions([...questions].sort(() => Math.random() - 0.5));
  }, [kanaList, scriptMode]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Start timing for new question
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  // Move focus to the "next" button once feedback appears so Enter/Space advances.
  useEffect(() => {
    if (feedback && advanceButtonRef.current) {
      advanceButtonRef.current.focus();
    }
  }, [feedback]);

  // Get current question from the main queue or, once we walk past it, the retry queue.
  const getCurrentQuestion = () => {
    if (incorrectQueue.length > 0 && currentIndex >= shuffledQuestions.length) {
      return incorrectQueue[currentIndex - shuffledQuestions.length];
    }
    return shuffledQuestions[currentIndex];
  };

  const current = getCurrentQuestion();
  const totalQuestions = shuffledQuestions.length + incorrectQueue.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  // Retry phase begins once we've walked past the main queue (#95, derived inline).
  const isRetryAttempt = currentIndex >= shuffledQuestions.length;
  const isNewRecord = bestStreak > persistedBestRef.current;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || feedback) return;

    const isCorrect = isRomajiCorrect(userInput, current.romaji);
    const responseTime = questionStartTime ? Date.now() - questionStartTime : null;

    // Each question is a single kana; record exactly that one (#83).
    updateKanaStatistics([{ kana: current.kana, romaji: current.romaji, isCorrect, responseTime }]);
    // Keep the spaced-repetition schedule current for the answered kana (#12).
    scheduleReview(`${current.kana}-${current.romaji}`, isCorrect);

    setFeedback({
      isCorrect,
      correctAnswer: current.romaji,
      userAnswer: userInput.trim()
    });

    if (isCorrect) {
      // Only count toward quiz score if not a retry attempt
      if (!isRetryAttempt) {
        setCorrectCount(prev => prev + 1);
      }

      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);

      // Add to incorrect queue if not already there and not a retry
      if (!isRetryAttempt) {
        setIncorrectQueue(prev => {
          const key = `${current.kana}-${current.romaji}`;
          const alreadyQueued = prev.some(q => `${q.kana}-${q.romaji}` === key);
          return alreadyQueued ? prev : [...prev, current];
        });
      }
    }
  };

  // Advance runs on a click (a later render), so incorrectQueue/streak/counts are
  // already up to date — no stale-closure end/progress decision from a timeout (#79).
  const handleAdvance = () => {
    const total = shuffledQuestions.length + incorrectQueue.length;

    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setFeedback(null);
    } else {
      // Quiz complete — persist the best streak reached this session (#53).
      updateBestStreak(bestStreak);
      onFinish({
        total: shuffledQuestions.length,
        correct: correctCount,
        bestStreak
      });
    }
  };

  const handleBack = () => {
    // Guard against losing in-progress answers (#64).
    if (currentIndex > 0 && !window.confirm(t('quiz.confirmLeave'))) return;
    onFinish(null);
  };

  if (!current) return <div>Loading...</div>;

  const kanaStateClass = feedback?.isCorrect
    ? 'text-emerald-500 scale-110'
    : feedback?.isCorrect === false
      ? 'text-rose-500 scale-90'
      : 'text-slate-800';
  const scriptLabel = current.script === 'hiragana' ? t('scripts.hiragana') : t('scripts.katakana');
  const scriptLabelClass = current.script === 'hiragana' ? 'text-fuchsia-400' : 'text-violet-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-fuchsia-50 to-rose-100 p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-white/70 hover:text-slate-700"
            >
              <ArrowLeftIcon className="w-4 h-4" /> {t('navigation.backToSelection')}
            </button>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-600">
                {currentIndex + 1} / {totalQuestions}
                {isRetryAttempt && (
                  <span className="ml-2 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                    {t('quiz.retryMode')}
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500">
                {t('quiz.streak')}: {streak} | {t('quiz.best')}: {bestStreak}
                {isNewRecord && (
                  <span className="ml-2 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {t('quiz.newRecord')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            className="h-3 w-full rounded-full bg-white/70 ring-1 ring-white/60"
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={0}
            aria-valuemax={totalQuestions}
            aria-label={t('quiz.progressLabel')}
          >
            <div
              className="h-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Quiz Card */}
        <div className="mb-6 rounded-[1.75rem] bg-white/90 p-8 shadow-cute-lg ring-1 ring-white/70">
          {/* Single kana display; the script (hiragana or katakana) is labelled. */}
          <div className="mb-8 text-center">
            <div className={`mb-2 text-xs font-semibold uppercase tracking-wide ${scriptLabelClass}`}>
              {scriptLabel}
            </div>
            <div
              lang="ja"
              className={`font-kana text-8xl font-bold transition-all duration-300 ${kanaStateClass}`}
            >
              {current.kana}
            </div>
          </div>

          {/* Input Area */}
          {!feedback && (
            <form onSubmit={handleSubmit} className="text-center">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={t('quiz.typeRomaji')}
                className="w-full max-w-xs rounded-2xl border-2 border-fuchsia-200 px-4 py-3 text-center text-xl transition-colors focus:border-fuchsia-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
              />
              <div className="mt-5">
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className={`rounded-[1.4rem] px-8 py-3 text-lg font-bold transition-all ${
                    userInput.trim()
                      ? 'bg-fuchsia-500 text-white shadow-cute hover:-translate-y-0.5 hover:bg-fuchsia-600 active:translate-y-0.5'
                      : 'cursor-not-allowed bg-slate-200 text-slate-400'
                  }`}
                >
                  {t('quiz.submit')}
                </button>
              </div>
            </form>
          )}

          {/* Feedback */}
          {feedback && (
            <div className="animate-pop-in text-center" role="status" aria-live="assertive">
              <div className={`mb-2 text-3xl font-extrabold ${
                feedback.isCorrect ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {feedback.isCorrect ? t('quiz.correct') : t('quiz.incorrect')}
              </div>

              {!feedback.isCorrect && (
                <div className="mb-2 text-lg text-slate-500">
                  {t('quiz.youTyped')}: <span className="rounded-lg bg-rose-100 px-2 py-1 font-mono text-rose-700">{feedback.userAnswer}</span>
                </div>
              )}

              <div className="text-lg text-slate-600">
                {t('quiz.correctAnswer')} <span className="rounded-lg bg-emerald-100 px-2 py-1 font-mono font-bold text-emerald-700">{feedback.correctAnswer}</span>
              </div>

              <div className="mt-5">
                <button
                  ref={advanceButtonRef}
                  type="button"
                  onClick={handleAdvance}
                  className="rounded-[1.4rem] bg-fuchsia-500 px-8 py-3 text-lg font-bold text-white shadow-cute transition-all hover:-translate-y-0.5 hover:bg-fuchsia-600 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
                >
                  {currentIndex < totalQuestions - 1 ? t('quiz.next') : t('quiz.finish')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/85 p-4 text-center shadow-cute ring-1 ring-white/60">
            <div className="text-2xl font-extrabold text-fuchsia-600">{correctCount}</div>
            <div className="text-sm text-slate-500">{t('quiz.correct_stat')}</div>
          </div>
          <div className="rounded-2xl bg-white/85 p-4 text-center shadow-cute ring-1 ring-white/60">
            <div className="text-2xl font-extrabold text-violet-600">{streak}</div>
            <div className="text-sm text-slate-500">{t('quiz.currentStreak')}</div>
          </div>
          <div className="rounded-2xl bg-white/85 p-4 text-center shadow-cute ring-1 ring-white/60">
            <div className="text-2xl font-extrabold text-emerald-600">
              {Math.round((correctCount / Math.max(currentIndex, 1)) * 100)}%
            </div>
            <div className="text-sm text-slate-500">{t('quiz.accuracy')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanaQuiz;
