import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const nextLang = i18n.language === 'de' ? 'en' : 'de';
  const toggleLanguage = () => i18n.changeLanguage(nextLang);

  // #85: sits bottom-left above the footer, out of the way of the screens'
  // top-right action clusters; compact so it never overlaps them.
  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-16 left-4 z-40 bg-white/90 hover:bg-white text-gray-700 text-sm font-medium py-1.5 px-3 rounded-lg shadow-md transition-colors border border-gray-200 backdrop-blur-sm"
      title={t('language.switch')}
      aria-label={t('language.switch')}
    >
      🌐 {nextLang.toUpperCase()}
    </button>
  );
};

export default LanguageSwitcher;
