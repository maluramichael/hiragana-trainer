import classnames         from 'classnames';
import { useTranslation } from 'react-i18next';

import { HiraganaMapping } from '../data/HiraganaMapping.jsx';

export const CharacterSets = ({ selectedCharacterSets, setSelectedCharacterSets }) => {
    const { t } = useTranslation();

    return <>
        <div
            className="button"
            onClick={() => {
                setSelectedCharacterSets(HiraganaMapping.map((item) => item.name));
            }}
        >
            {t('Select all')}
        </div>
        <div
            className="button"
            onClick={() => {
                setSelectedCharacterSets([]);
            }}
        >
            {t('Deselect all')}
        </div>
        <br />
        <br />
        <div className={'character-sets'}>
            {HiraganaMapping.map((characterSet) => (
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
        </div>
    </>;
};
