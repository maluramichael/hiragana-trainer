import classnames                from 'classnames';
import { hiraganaCharacterSets } from './HiraganaCharacterSets.jsx';

export const CharacterSets = ({ selectedCharacterSets, setSelectedCharacterSets }) => {
    return <div className={'character-sets'}>
        {hiraganaCharacterSets.map((characterSet) => (
            <div
                className={classnames('character-set', { active: selectedCharacterSets.includes(characterSet.name) })}
                key={characterSet.name}
                onClick={() => {
                    if (selectedCharacterSets.includes(characterSet.name)) {
                        setSelectedCharacterSets(selectedCharacterSets.filter((item) => item !== characterSet.name));
                    } else {
                        setSelectedCharacterSets([...selectedCharacterSets, characterSet.name]);
                    }
                }}
            >
                <div style={{ fontWeight: 'bold' }}>{characterSet.name}</div>
                <div style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {characterSet.romanji.map((romanji, index) => (
                            <div key={romanji}>
                                <div>
                                    {characterSet.hiragana[index]}
                                </div>
                                <div>
                                    {romanji}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ))}
    </div>;
};
