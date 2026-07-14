import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TOFUGU_HIRAGANA_URL } from '../data/links.js';
import WritingSystemIntro from './WritingSystemIntro.jsx';

// Returner explainer: opens the writing-system intro on demand (a learner who
// wants to re-read how the scripts fit together, without being sent into study).
export default function WritingSystemModal({ onClose }) {
  const { t } = useTranslation();
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg animate-pop-in rounded-[1.75rem] bg-white p-6 shadow-cute-lg outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex justify-end">
          <button
            onClick={onClose}
            aria-label={t('writingSystem.close')}
            className="grid h-9 w-9 place-items-center rounded-full text-2xl text-slate-400 transition-colors hover:bg-fuchsia-50 hover:text-fuchsia-600"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <WritingSystemIntro />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <a href={TOFUGU_HIRAGANA_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-fuchsia-600 hover:text-fuchsia-700">
            {t('writingSystem.deepDive')}
          </a>
          <button
            onClick={onClose}
            className="rounded-[1.4rem] bg-fuchsia-500 px-6 py-3 font-bold text-white shadow-cute transition-all hover:-translate-y-0.5 hover:bg-fuchsia-600"
          >
            {t('writingSystem.gotIt')}
          </button>
        </div>
      </div>
    </div>
  );
}
