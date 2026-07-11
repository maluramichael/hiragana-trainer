import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getScriptCounterpart } from '../data/kana.js';
import { updateKanaStatistics, getBestStreak, updateBestStreak, scheduleReview } from '../utils/statisticsManager.js';
import { Card, KanaCard, TextInput, Button, FeedbackBanner, StatTile, ProgressMeter, Badge } from '../ui/index.js';

// Accept common Kunrei/Hepburn spelling variants (#29).
const romajiAliases = {
  shi: ['si'], chi: ['ti'], tsu: ['tu'], fu: ['hu'], ji: ['zi', 'di'], zu: ['du']
};

const isRomajiCorrect = (input, romaji) => {
  const normalized = input.toLowerCase().trim();
  return normalized === romaji || (romajiAliases[romaji] || []).includes(normalized);
};

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
  const persistedBestRef = useRef(getBestStreak());

  useEffect(() => {
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
      if (scriptMode !== 'katakana') questions.push({ kana: hiraganaChar, romaji: kana.romaji, script: 'hiragana' });
      if (scriptMode !== 'hiragana') questions.push({ kana: katakanaChar, romaji: kana.romaji, script: 'katakana' });
    });
    setShuffledQuestions([...questions].sort(() => Math.random() - 0.5));
  }, [kanaList, scriptMode]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  useEffect(() => {
    if (feedback && advanceButtonRef.current) advanceButtonRef.current.focus();
  }, [feedback]);

  const getCurrentQuestion = () => {
    if (incorrectQueue.length > 0 && currentIndex >= shuffledQuestions.length) {
      return incorrectQueue[currentIndex - shuffledQuestions.length];
    }
    return shuffledQuestions[currentIndex];
  };

  const current = getCurrentQuestion();
  const totalQuestions = shuffledQuestions.length + incorrectQueue.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isRetryAttempt = currentIndex >= shuffledQuestions.length;
  const isNewRecord = bestStreak > persistedBestRef.current;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || feedback) return;
    const isCorrect = isRomajiCorrect(userInput, current.romaji);
    const responseTime = questionStartTime ? Date.now() - questionStartTime : null;
    updateKanaStatistics([{ kana: current.kana, romaji: current.romaji, isCorrect, responseTime }]);
    scheduleReview(`${current.kana}-${current.romaji}`, isCorrect);
    setFeedback({ isCorrect, correctAnswer: current.romaji, userAnswer: userInput.trim() });
    if (isCorrect) {
      if (!isRetryAttempt) setCorrectCount(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(cur => Math.max(cur, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
      if (!isRetryAttempt) {
        setIncorrectQueue(prev => {
          const key = `${current.kana}-${current.romaji}`;
          const alreadyQueued = prev.some(q => `${q.kana}-${q.romaji}` === key);
          return alreadyQueued ? prev : [...prev, current];
        });
      }
    }
  };

  const handleAdvance = () => {
    const total = shuffledQuestions.length + incorrectQueue.length;
    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setFeedback(null);
    } else {
      updateBestStreak(bestStreak);
      onFinish({ total: shuffledQuestions.length, correct: correctCount, bestStreak });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0 && !window.confirm(t('quiz.confirmLeave'))) return;
    onFinish(null);
  };

  if (!current) return null;

  const state = feedback ? (feedback.isCorrect ? 'correct' : 'wrong') : 'idle';
  const scriptLabel = current.script === 'hiragana' ? t('scripts.hiragana') : t('scripts.katakana');
  const acc = Math.round((correctCount / Math.max(currentIndex, 1)) * 100);

  return (
    <main style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ maxWidth: 'var(--width-prose)', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          <Button variant="ghost" size="sm" iconLeft="arrow-left" onClick={handleBack}>{t('navigation.backToSelection')}</Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--text-muted)', fontSize: 'var(--text-sm)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span>{Math.min(currentIndex + 1, totalQuestions)} / {totalQuestions}</span>
            {isRetryAttempt && <Badge tone="warning" icon="rotate-ccw">{t('quiz.retryMode')}</Badge>}
            <Badge tone="warning" icon="flame">{t('quiz.streak')} {streak}</Badge>
            {isNewRecord && <Badge tone="success" icon="trophy">{t('quiz.newRecord')}</Badge>}
          </div>
        </div>
        <ProgressMeter variant="bar" value={progress} style={{ marginBottom: 'var(--space-6)' }} />

        {/* Main card */}
        <Card padding="lg" style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
            <KanaCard kana={current.kana} caption={scriptLabel} state={state} />
          </div>

          {!feedback ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ width: 260, maxWidth: '100%' }}>
                <TextInput inputRef={inputRef} value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder={t('quiz.typeRomaji')} />
              </div>
              <Button type="submit" variant="primary" size="md" iconRight="arrow-right" disabled={!userInput.trim()}>{t('quiz.submit')}</Button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)' }}>
              <FeedbackBanner
                correct={feedback.isCorrect}
                title={feedback.isCorrect ? t('quiz.correct') : t('quiz.incorrect')}
                yourAnswer={feedback.isCorrect ? undefined : feedback.userAnswer}
                yourAnswerLabel={t('quiz.youTyped')}
                correctAnswer={feedback.correctAnswer}
                answerLabel={t('quiz.correctAnswer')}
                hint={feedback.isCorrect ? t('quiz.correctHint') : t('quiz.wrongHint')}
              />
              <Button ref={advanceButtonRef} variant="primary" size="md" iconRight="arrow-right" onClick={handleAdvance}>
                {currentIndex < totalQuestions - 1 ? t('quiz.next') : t('quiz.finish')}
              </Button>
            </div>
          )}
        </Card>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
          <StatTile value={correctCount} label={t('quiz.correct_stat')} tone="emerald" icon="check-circle" />
          <StatTile value={streak} label={t('quiz.currentStreak')} tone="amber" icon="flame" />
          <StatTile value={`${acc}%`} label={t('quiz.accuracy')} tone="fuchsia" icon="target" />
        </div>
      </div>
    </main>
  );
};

export default KanaQuiz;
