import useLocalStorage from './useLocalStorage.jsx';

const useSettings = () => {
    const [showPossibleRomanji, setShowPossibleRomanji] = useLocalStorage('options.showPossibleRomanji', true);
    const [multipleChoice, setMultipleChoice]           = useLocalStorage('options.multipleChoice', false);

    return {
        showPossibleRomanji,
        setShowPossibleRomanji,
        multipleChoice,
        setMultipleChoice,
    };
};

export default useSettings;
