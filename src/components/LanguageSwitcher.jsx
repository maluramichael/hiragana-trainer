import { useTranslation } from 'react-i18next';
import { GlobeIcon } from './icons.jsx';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const nextLang = i18n.language === 'de' ? 'en' : 'de';
  const toggleLanguage = () => i18n.changeLanguage(nextLang);

  // #85: sits bottom-left above the footer, out of the way of the screens'
  // top-right action clusters; compact so it never overlaps them.
  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-16 left-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-fuchsia-200 bg-white/90 py-1.5 pl-2.5 pr-3 text-sm font-semibold text-slate-600 shadow-cute backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:text-fuchsia-600"
      title={t('language.switch')}
      aria-label={t('language.switch')}
    >
      <GlobeIcon className="w-4 h-4" />
      {nextLang.toUpperCase()}
    </button>
  );
};

export default LanguageSwitcher;
