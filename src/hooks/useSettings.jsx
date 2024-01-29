import useLocalStorage from './useLocalStorage.jsx';

const useSettings = () => {
    const [showPossibleRomaji, setShowPossibleRomaji] = useLocalStorage('options.showPossibleRomaji', true);
    const [multipleChoice, setMultipleChoice]           = useLocalStorage('options.multipleChoice', false);
    const [language, setLanguage]                       = useLocalStorage('i18nextLng', 'de', false);

    return {
        showPossibleRomaji,
        setShowPossibleRomaji,
        multipleChoice,
        setMultipleChoice,
        language,
        setLanguage,
    };
};

export default useSettings;
