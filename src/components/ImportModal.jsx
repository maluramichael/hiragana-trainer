import { useState, useRef, useEffect, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { importStatisticsFromBase64 } from '../utils/statisticsManager.js';

// Own the import-code state locally so typing in the textarea only re-renders
// the modal, never the (potentially ~100-row) statistics table behind it.
const ImportModal = ({ onClose, onImported }) => {
  const { t } = useTranslation();
  const [importCode, setImportCode] = useState('');
  const [importMessage, setImportMessage] = useState({ text: '', type: '' });
  const titleId = useId();
  const modalRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Move focus into the dialog when it opens.
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      // Trap Tab focus inside the modal.
      const focusable = modalRef.current?.querySelectorAll(
        'button, textarea, [href], input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleImportFromCode = () => {
    if (!importCode.trim()) {
      setImportMessage({ text: t('statistics.importCodeEmpty'), type: 'error' });
      return;
    }

    const result = importStatisticsFromBase64(importCode.trim());

    if (result.success) {
      setImportMessage({ text: t('statistics.importCodeSuccess'), type: 'success' });
      onImported();
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setImportMessage({ text: t('statistics.importCodeError'), type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-2xl animate-pop-in rounded-[1.75rem] bg-white p-6 shadow-cute-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-2xl font-extrabold text-slate-800">{t('statistics.importCodeTitle')}</h2>
          <button
            onClick={onClose}
            aria-label={t('statistics.closeModal')}
            className="grid h-9 w-9 place-items-center rounded-full text-2xl text-slate-400 transition-colors hover:bg-fuchsia-50 hover:text-fuchsia-600"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <p className="mb-4 text-slate-600">{t('statistics.importCodeDescription')}</p>

        <textarea
          ref={textareaRef}
          value={importCode}
          onChange={(e) => setImportCode(e.target.value)}
          placeholder={t('statistics.importCodePlaceholder')}
          aria-label={t('statistics.importCodeLabel')}
          className="h-32 w-full rounded-2xl border-2 border-fuchsia-200 px-4 py-2 font-mono text-sm transition-colors focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300"
        />

        <div role="status" aria-live="polite">
          {importMessage.text && (
            <div className={`mt-4 rounded-2xl p-3 ${
              importMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {importMessage.text}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleImportFromCode}
            className="flex-1 rounded-[1.4rem] bg-gradient-to-r from-fuchsia-500 to-violet-500 px-6 py-3 font-bold text-white shadow-cute transition-all hover:-translate-y-0.5"
          >
            {t('statistics.importButton')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-[1.4rem] bg-slate-100 px-6 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-200"
          >
            {t('statistics.cancelButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
