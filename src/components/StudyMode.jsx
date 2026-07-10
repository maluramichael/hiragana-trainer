import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, RocketIcon } from './icons.jsx';

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
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-fuchsia-50 to-rose-100 p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-white/70 hover:text-slate-700"
          >
            <ArrowLeftIcon className="w-4 h-4" /> {t('study.back')}
          </button>
          <h1 className="text-xl font-bold text-slate-800">
            {t('study.title')}
          </h1>
        </div>

        {card && (
          <div className="mb-6 animate-pop-in rounded-[1.75rem] bg-white/90 p-12 text-center shadow-cute-lg ring-1 ring-white/70">
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
              <div lang="ja" className="font-kana mb-6 text-9xl font-bold text-slate-800">{card.kana}</div>
              <div className="inline-block rounded-full bg-fuchsia-100 px-5 py-1.5 text-3xl font-bold text-fuchsia-600">
                {card.romaji}
              </div>
            </div>
            <p className="mt-8 text-sm font-medium text-slate-400">
              {t('study.cardPosition', {
                current: index + 1,
                total: cards.length
              })}
            </p>
          </div>
        )}

        <div className="mb-8 flex justify-between gap-4">
          <button
            onClick={goPrev}
            disabled={atStart}
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-bold transition-all ${
              atStart
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-white text-slate-600 shadow-cute ring-1 ring-white/60 hover:-translate-y-0.5'
            }`}
          >
            <ArrowLeftIcon className="w-4 h-4" /> {t('study.previous')}
          </button>
          <button
            onClick={goNext}
            disabled={atEnd}
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-bold transition-all ${
              atEnd
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-white text-slate-600 shadow-cute ring-1 ring-white/60 hover:-translate-y-0.5'
            }`}
          >
            {t('study.next')} <ArrowLeftIcon className="w-4 h-4 rotate-180" />
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={startQuiz}
            className="group inline-flex items-center gap-2.5 rounded-[1.4rem] bg-gradient-to-r from-pink-500 to-fuchsia-600 px-8 py-4 text-xl font-bold text-white shadow-cute-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5"
          >
            <RocketIcon className="w-6 h-6 transition-transform duration-200 group-hover:-rotate-12" />
            {t('study.startQuiz')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyMode;
