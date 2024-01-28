import './styles.css';

export const CurrentCharacter = ({ currentCharacter }) => {
    if (!currentCharacter) {
        return null;
    }

    return <div>
        <div className={'current-character'}>
            <div>{currentCharacter.hiragana}</div>
        </div>
        <div className={'possible-romanji'}>
            {currentCharacter.availableRomanji.join(' ')}
        </div>
    </div>;
};
