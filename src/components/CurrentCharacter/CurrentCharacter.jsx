import './styles.css';
import useSettings from '../../hooks/useSettings.jsx';

export const CurrentCharacter = ({ currentCharacter }) => {
    const { showPossibleRomaji } = useSettings();

    if (!currentCharacter) {
        return null;
    }

    return <div>
        <div className={'current-character'}>
            <div>{currentCharacter.hiragana}</div>
        </div>
        {showPossibleRomaji &&
            <div className={'possible-romaji'}>
                {currentCharacter.availableRomaji.join(' ')}
            </div>
        }
    </div>;
};
