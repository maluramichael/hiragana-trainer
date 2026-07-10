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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id={titleId} className="text-2xl font-bold text-gray-800">{t('statistics.importCodeTitle')}</h2>
          <button
            onClick={onClose}
            aria-label={t('statistics.closeModal')}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <p className="text-gray-600 mb-4">{t('statistics.importCodeDescription')}</p>

        <textarea
          ref={textareaRef}
          value={importCode}
          onChange={(e) => setImportCode(e.target.value)}
          placeholder={t('statistics.importCodePlaceholder')}
          aria-label={t('statistics.importCodeLabel')}
          className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />

        <div role="status" aria-live="polite">
          {importMessage.text && (
            <div className={`mt-4 p-3 rounded-lg ${
              importMessage.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {importMessage.text}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleImportFromCode}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            {t('statistics.importButton')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            {t('statistics.cancelButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
