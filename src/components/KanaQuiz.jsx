import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getScriptCounterpart } from '../data/kana.js';
import { updateKanaStatistics, getBestStreak, updateBestStreak, scheduleReview } from '../utils/statisticsManager.js';

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
  // Which script(s) are drilled this round. 'both' keeps hiragana and katakana
  // side by side; the single-script modes show and track only that one (#72).
  const showHiragana = scriptMode !== 'katakana';
  const showKatakana = scriptMode !== 'hiragana';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => getBestStreak());
  const [shuffledPairs, setShuffledPairs] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [incorrectQueue, setIncorrectQueue] = useState([]);
  const inputRef = useRef(null);
  const advanceButtonRef = useRef(null);
  // Best streak persisted before this session started — used to flag a new record.
  const persistedBestRef = useRef(getBestStreak());

  useEffect(() => {
    // Pair each selected kana with its positional counterpart in the other script.
    // Dedupe on the actual character pair (not romaji) so ぢ/づ stay distinct from
    // じ/ず despite sharing romaji (#11).
    const seen = new Set();
    const kanaPairs = [];

    kanaList.forEach(kana => {
      const counterpart = getScriptCounterpart(kana);
      if (!counterpart) return;

      const hiraganaChar = isHiragana(kana.kana) ? kana.kana : counterpart.kana;
      const katakanaChar = isHiragana(kana.kana) ? counterpart.kana : kana.kana;
      const key = `${hiraganaChar}-${katakanaChar}`;
      if (seen.has(key)) return;
      seen.add(key);

      kanaPairs.push({ romaji: kana.romaji, hiragana: hiraganaChar, katakana: katakanaChar });
    });

    const shuffled = [...kanaPairs].sort(() => Math.random() - 0.5);
    setShuffledPairs(shuffled);
  }, [kanaList]);

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

  // Get current question from main queue or retry queue
  const getCurrentQuestion = () => {
    if (incorrectQueue.length > 0 && currentIndex >= shuffledPairs.length) {
      // We're in the retry phase
      const retryIndex = currentIndex - shuffledPairs.length;
      return incorrectQueue[retryIndex];
    } else {
      // Normal question from main queue
      return shuffledPairs[currentIndex];
    }
  };

  const currentPair = getCurrentQuestion();
  const totalQuestions = shuffledPairs.length + incorrectQueue.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  // Retry phase begins once we've walked past the main queue (#95, derived inline).
  const isRetryAttempt = currentIndex >= shuffledPairs.length;
  const isNewRecord = bestStreak > persistedBestRef.current;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || feedback) return;

    const isCorrect = isRomajiCorrect(userInput, currentPair.romaji);
    const responseTime = questionStartTime ? Date.now() - questionStartTime : null;

    // Only the active script(s) are tracked. In a single-script round the other
    // side is never shown, so it must not gain statistics either (#72).
    const answered = [];
    if (showHiragana) {
      answered.push({ kana: currentPair.hiragana, romaji: currentPair.romaji, isCorrect, responseTime });
    }
    if (showKatakana) {
      answered.push({ kana: currentPair.katakana, romaji: currentPair.romaji, isCorrect, responseTime });
    }

    // Update statistics for the active kana in a single get/save (#83).
    updateKanaStatistics(answered);

    // Keep the spaced-repetition schedule current for each answered kana (#12).
    answered.forEach(({ kana, romaji }) => scheduleReview(`${kana}-${romaji}`, isCorrect));

    setFeedback({
      isCorrect,
      correctAnswer: currentPair.romaji,
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
          const alreadyQueued = prev.some(pair =>
            pair.hiragana === currentPair.hiragana &&
            pair.katakana === currentPair.katakana
          );
          return alreadyQueued ? prev : [...prev, currentPair];
        });
      }
    }
  };

  // Advance runs on a click (a later render), so incorrectQueue/streak/counts are
  // already up to date — no stale-closure end/progress decision from a timeout (#79).
  const handleAdvance = () => {
    const total = shuffledPairs.length + incorrectQueue.length;

    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setFeedback(null);
    } else {
      // Quiz complete — persist the best streak reached this session (#53).
      updateBestStreak(bestStreak);
      onFinish({
        total: shuffledPairs.length,
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

  if (!currentPair) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              {t('navigation.backToSelection')}
            </button>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {currentIndex + 1} / {totalQuestions}
                {isRetryAttempt && (
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                    {t('quiz.retryMode')}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {t('quiz.streak')}: {streak} | {t('quiz.best')}: {bestStreak}
                {isNewRecord && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    {t('quiz.newRecord')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            className="w-full bg-gray-200 rounded-full h-2"
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={0}
            aria-valuemax={totalQuestions}
            aria-label={t('quiz.progressLabel')}
          >
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Quiz Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Kana Display */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-8 mb-4">
              {showHiragana && (
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">{t('scripts.hiragana')}</div>
                  <div
                    lang="ja"
                    className={`text-6xl font-bold transition-all duration-300 ${
                      feedback?.isCorrect ? 'text-green-500 scale-110' :
                      feedback?.isCorrect === false ? 'text-red-500 scale-90' :
                      'text-gray-800'
                    }`}
                  >
                    {currentPair.hiragana}
                  </div>
                </div>
              )}

              {showHiragana && showKatakana && (
                <div className="text-4xl text-gray-400 font-light">|</div>
              )}

              {showKatakana && (
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">{t('scripts.katakana')}</div>
                  <div
                    lang="ja"
                    className={`text-6xl font-bold transition-all duration-300 ${
                      feedback?.isCorrect ? 'text-green-500 scale-110' :
                      feedback?.isCorrect === false ? 'text-red-500 scale-90' :
                      'text-gray-800'
                    }`}
                  >
                    {currentPair.katakana}
                  </div>
                </div>
              )}
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
                className="w-full max-w-xs px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-xl focus:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
              />
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all ${
                    userInput.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('quiz.submit')}
                </button>
              </div>
            </form>
          )}

          {/* Feedback */}
          {feedback && (
            <div className="text-center" role="status" aria-live="assertive">
              <div className={`text-2xl font-bold mb-2 ${
                feedback.isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {feedback.isCorrect ? t('quiz.correct') : t('quiz.incorrect')}
              </div>

              {!feedback.isCorrect && (
                <div className="text-lg text-gray-600 mb-2">
                  {t('quiz.youTyped')}: <span className="font-mono bg-red-100 px-2 py-1 rounded">{feedback.userAnswer}</span>
                </div>
              )}

              <div className="text-lg text-gray-700">
                {t('quiz.correctAnswer')} <span className="font-mono bg-green-100 px-2 py-1 rounded font-semibold">{feedback.correctAnswer}</span>
              </div>

              <div className="mt-4">
                <button
                  ref={advanceButtonRef}
                  type="button"
                  onClick={handleAdvance}
                  className="px-8 py-3 rounded-xl text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {currentIndex < totalQuestions - 1 ? t('quiz.next') : t('quiz.finish')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-blue-600">{correctCount}</div>
            <div className="text-sm text-gray-600">{t('quiz.correct_stat')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-purple-600">{streak}</div>
            <div className="text-sm text-gray-600">{t('quiz.currentStreak')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((correctCount / Math.max(currentIndex, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-600">{t('quiz.accuracy')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanaQuiz;
