import { Option }  from './Option.jsx';
import useSettings from '../hooks/useSettings.jsx';

export function Options() {
    const { showPossibleRomanji, setShowPossibleRomanji } = useSettings();
    const { multipleChoice, setMultipleChoice }           = useSettings();

    return <div>
        <h2>Options</h2>
        <Option
            name={'Show possible romanji'}
            value={showPossibleRomanji}
            onChange={() => setShowPossibleRomanji(!showPossibleRomanji)}
        />
        <Option
            name={'Select between kana instead of typing'}
            value={multipleChoice}
            onChange={() => setMultipleChoice(!multipleChoice)}
        />
    </div>;
}
