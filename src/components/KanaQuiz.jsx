import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { hiragana, katakana } from '../data/kana.js';
import { updateKanaStatistic } from '../utils/statisticsManager.js';

const KanaQuiz = ({ kanaList, onFinish }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [shuffledPairs, setShuffledPairs] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [incorrectQueue, setIncorrectQueue] = useState([]);
  const [isRetryAttempt, setIsRetryAttempt] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Group hiragana and katakana by romaji
    const kanaPairs = [];
    const processedRomaji = new Set();
    
    kanaList.forEach(kana => {
      if (!processedRomaji.has(kana.romaji)) {
        const hiraganaChar = hiragana.find(h => h.romaji === kana.romaji);
        const katakanaChar = katakana.find(k => k.romaji === kana.romaji);
        
        if (hiraganaChar && katakanaChar) {
          kanaPairs.push({
            romaji: kana.romaji,
            hiragana: hiraganaChar.kana,
            katakana: katakanaChar.kana
          });
          processedRomaji.add(kana.romaji);
        }
      }
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
  
  // Check if we're in retry mode
  useEffect(() => {
    const inRetryMode = currentIndex >= shuffledPairs.length;
    setIsRetryAttempt(inRetryMode);
  }, [currentIndex, shuffledPairs.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const isCorrect = userInput.toLowerCase().trim() === currentPair.romaji.toLowerCase();
    const responseTime = questionStartTime ? Date.now() - questionStartTime : null;
    
    // Update statistics for both hiragana and katakana (always track for statistics)
    updateKanaStatistic(currentPair.hiragana, currentPair.romaji, isCorrect, responseTime);
    updateKanaStatistic(currentPair.katakana, currentPair.romaji, isCorrect, responseTime);
    
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
          // Check if this pair is already in the queue
          const alreadyQueued = prev.some(pair => 
            pair.hiragana === currentPair.hiragana && 
            pair.katakana === currentPair.katakana
          );
          
          if (!alreadyQueued) {
            return [...prev, currentPair];
          }
          return prev;
        });
      }
    }

    if (isCorrect) {
      // Immediate transition for correct answers
      setTimeout(() => {
        const totalQuestions = shuffledPairs.length + incorrectQueue.length;
        
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex(prev => prev + 1);
          setUserInput('');
          setFeedback(null);
        } else {
          // Quiz complete
          onFinish({
            total: shuffledPairs.length,
            correct: correctCount + (!isRetryAttempt ? 1 : 0),
            bestStreak: Math.max(bestStreak, streak + 1)
          });
        }
      }, 600);
    } else {
      // Longer delay for incorrect answers to show the correct answer
      setTimeout(() => {
        const totalQuestions = shuffledPairs.length + incorrectQueue.length;
        
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex(prev => prev + 1);
          setUserInput('');
          setFeedback(null);
        } else {
          // Quiz complete
          onFinish({
            total: shuffledPairs.length,
            correct: correctCount,
            bestStreak: bestStreak
          });
        }
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  if (!currentPair) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => onFinish(null)}
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
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
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
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">{t('scripts.hiragana')}</div>
                <div 
                  className={`text-6xl font-bold transition-all duration-300 ${
                    feedback?.isCorrect ? 'text-green-500 scale-110' : 
                    feedback?.isCorrect === false ? 'text-red-500 scale-90' : 
                    'text-gray-800'
                  }`}
                >
                  {currentPair.hiragana}
                </div>
              </div>
              
              <div className="text-4xl text-gray-400 font-light">|</div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">{t('scripts.katakana')}</div>
                <div 
                  className={`text-6xl font-bold transition-all duration-300 ${
                    feedback?.isCorrect ? 'text-green-500 scale-110' : 
                    feedback?.isCorrect === false ? 'text-red-500 scale-90' : 
                    'text-gray-800'
                  }`}
                >
                  {currentPair.katakana}
                </div>
              </div>
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
                onKeyPress={handleKeyPress}
                placeholder={t('quiz.typeRomaji')}
                className="w-full max-w-xs px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
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
            <div className="text-center">
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
                {t('quiz.correctAnswer')}: <span className="font-mono bg-green-100 px-2 py-1 rounded font-semibold">{feedback.correctAnswer}</span>
              </div>
              
              <div className="mt-4 text-gray-500">
                {currentIndex < shuffledPairs.length - 1 ? 
                  (feedback.isCorrect ? t('quiz.nextKanaQuick') : t('quiz.nextKanaSlow')) : 
                  t('quiz.quizComplete')}
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