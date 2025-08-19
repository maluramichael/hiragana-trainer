import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'de' ? 'en' : 'de';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-4 right-4 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-md transition-colors border border-gray-200"
      title={t('language.switch')}
    >
      {i18n.language === 'de' ? t('language.english') : t('language.german')}
    </button>
  );
};

export default LanguageSwitcher;