import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Hiragana Unicode block; anything else is treated as Katakana.
const isHiragana = (char) => /[぀-ゟ]/.test(char);

// Flashcard study screen (#4): flip through the picked kana at your own pace,
// then jump into the quiz with the same selection. scriptMode narrows which
// script's cards are shown; the quiz itself still receives the full kanaList so
// it behaves exactly like starting from the selection screen.
const StudyMode = ({ kanaList, scriptMode = 'both', onStartQuiz, onBack }) => {
  const { t } = useTranslation();

  const cards = kanaList.filter(({ kana }) => {
    if (scriptMode === 'hiragana') return isHiragana(kana);
    if (scriptMode === 'katakana') return !isHiragana(kana);
    return true;
  });

  const [index, setIndex] = useState(0);

  // A shrinking selection (e.g. fewer cards after a script switch) must never
  // leave the index dangling past the last card.
  useEffect(() => {
    setIndex((prev) => Math.min(prev, Math.max(cards.length - 1, 0)));
  }, [cards.length]);

  const cardRef = useRef(null);
  useEffect(() => {
    if (cardRef.current) cardRef.current.focus();
  }, [index]);

  const card = cards[index];
  const atStart = index === 0;
  const atEnd = index >= cards.length - 1;

  const goPrev = () => setIndex((prev) => Math.max(prev - 1, 0));
  const goNext = () => setIndex((prev) => Math.min(prev + 1, cards.length - 1));
  const startQuiz = () => onStartQuiz(kanaList, { scriptMode });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            {t('study.back')}
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            {t('study.title')}
          </h1>
        </div>

        {card && (
          <div className="bg-white rounded-xl shadow-lg p-10 mb-6 text-center">
            <div
              ref={cardRef}
              tabIndex={-1}
              aria-live="polite"
              aria-label={t('study.cardPosition', {
                current: index + 1,
                total: cards.length
              })}
              className="outline-none"
            >
              <div className="text-8xl mb-6 text-gray-800">{card.kana}</div>
              <div className="text-3xl text-indigo-600 font-medium">
                {card.romaji}
              </div>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              {t('study.cardPosition', {
                current: index + 1,
                total: cards.length
              })}
            </p>
          </div>
        )}

        <div className="flex justify-between gap-4 mb-8">
          <button
            onClick={goPrev}
            disabled={atStart}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              atStart
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            {t('study.previous')}
          </button>
          <button
            onClick={goNext}
            disabled={atEnd}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              atEnd
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            {t('study.next')}
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={startQuiz}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            🚀 {t('study.startQuiz')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyMode;
