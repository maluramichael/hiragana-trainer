import useLocalStorage from './useLocalStorage.jsx';

const useSettings = () => {
    const [showPossibleRomanji, setShowPossibleRomanji] = useLocalStorage('options.showPossibleRomanji', true);
    const [multipleChoice, setMultipleChoice]           = useLocalStorage('options.multipleChoice', false);
    const [language, setLanguage]                       = useLocalStorage('i18nextLng', 'de', false);

    return {
        showPossibleRomanji,
        setShowPossibleRomanji,
        multipleChoice,
        setMultipleChoice,
        language,
        setLanguage,
    };
};

export default useSettings;
