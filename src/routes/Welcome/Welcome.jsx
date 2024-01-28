import { Link } from 'react-router-dom';

import { CharacterSets } from '../../components/CharacterSets.jsx';

import './styles.css';
import useLocalStorage   from '../../hooks/useLocalStorage.jsx';
import { Options }       from '../../components/Options.jsx';
import { useTranslation } from 'react-i18next';

/*
    * Mobile friendly
    * Add share images
    * Add sounds for correct answers
    * Add sounds for each character
    * Add a bar with options
        * Play sounds
 */

function Welcome() {
    const { t }                      = useTranslation();
    const [selectedSets, selectSets] = useLocalStorage('selectedSets', []);

    return (
        <main>
            <h1>Hiragana trainer</h1>
            <div>
                <Options />
                <h2>
                    {t('Select the sets you want to train and click on start')}
                </h2>
                <CharacterSets
                    setSelectedCharacterSets={selectSets}
                    selectedCharacterSets={selectedSets}
                />
                {selectedSets.length > 0 && <Link
                    className={'button full-width'}
                    to={'/train/' + selectedSets.join(',')}
                    disabled={selectedSets.length <= 0}
                >
                    {t('Start')}
                </Link>}
            </div>
        </main>
    );
}

export default Welcome;
