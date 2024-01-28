import './styles.css';
import useSettings from '../../hooks/useSettings.jsx';

export const CurrentCharacter = ({ currentCharacter }) => {
    const { showPossibleRomanji } = useSettings();

    if (!currentCharacter) {
        return null;
    }

    return <div>
        <div className={'current-character'}>
            <div>{currentCharacter.hiragana}</div>
        </div>
        {showPossibleRomanji &&
            <div className={'possible-romanji'}>
                {currentCharacter.availableRomanji.join(' ')}
            </div>
        }
    </div>;
};
