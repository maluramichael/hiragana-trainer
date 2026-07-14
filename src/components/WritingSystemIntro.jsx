import { useTranslation } from 'react-i18next';

// The "how Japanese writing works" explainer copy. Shared by the guided first-run
// intro (StudyMode) and the returner modal, so the explanation lives in one place.
export default function WritingSystemIntro() {
  const { t } = useTranslation();
  return (
    <div className="text-left">
      <h2 className="mb-4 text-2xl font-extrabold text-slate-800">{t('writingSystem.heading')}</h2>
      <p className="mb-3 leading-relaxed text-slate-600">{t('writingSystem.scripts')}</p>
      <p className="mb-3 leading-relaxed text-slate-600">{t('writingSystem.kanjiNote')}</p>
      <p className="leading-relaxed text-slate-600">{t('writingSystem.vowelsHint')}</p>
    </div>
  );
}
