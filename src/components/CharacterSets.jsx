import classnames         from 'classnames';
import { useTranslation } from 'react-i18next';
import _                  from 'lodash';

import { Sets }               from '../data/HiraganaMapping.jsx';
import { HiraganaRomajiMap } from '../data/HiraganaMapping.jsx';

export const CharacterSets = ({ selectedCharacterSets, setSelectedCharacterSets }) => {
    const { t } = useTranslation();

    const renderSet = (setName) => {
        const hiraganaInSet = Sets[setName];

        return (
            <div
                className={classnames('character-set', { active: selectedCharacterSets.includes(setName) })}
                key={setName}
                onClick={() => {
                    if (selectedCharacterSets.includes(setName)) {
                        setSelectedCharacterSets(selectedCharacterSets.filter((item) => item !== setName));
                    } else {
                        setSelectedCharacterSets([...selectedCharacterSets, setName]);
                    }
                }}
            >
                <div style={{ fontWeight: 'bold' }}>{setName}</div>
                <div style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {hiraganaInSet.map((hiragana, index) => {
                            const romaji = HiraganaRomajiMap[hiragana];

                            return (
                                <div key={hiragana}>
                                    <div>
                                        {hiragana}
                                    </div>
                                    <div>
                                        {_.isArray(romaji) ? romaji.join('/') : romaji}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return <>
        <div
            className="button"
            onClick={() => {
                setSelectedCharacterSets(Object.keys(Sets));
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
            {Object.keys(Sets).map(renderSet)}
        </div>
    </>;
};
