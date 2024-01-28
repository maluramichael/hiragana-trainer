import { Link } from 'react-router-dom';

import { CharacterSets } from '../../components/CharacterSets.jsx';

import './styles.css';
import useLocalStorage   from '../../hooks/useLocalStorage.jsx';
import { Options }       from '../../components/Options.jsx';

/*
    * Replace english with german text
    * Mobile friendly
    * Add share images
    * Add sounds for correct answers
    * Add sounds for each character
    * Add a bar with options
        * Play sounds
 */

function Welcome() {
    const [selectedSets, selectSets] = useLocalStorage('selectedSets', []);

    return (
        <main>
            <h1>Hiragana trainer</h1>
            <div>
                <Options />
                <h2>
                    Select the sets you want to train and click on start
                </h2>
                <CharacterSets
                    setSelectedCharacterSets={selectSets}
                    selectedCharacterSets={selectedSets}
                />
                <Link
                    className={'button full-width'}
                    to={'/train/' + selectedSets.join(',')}
                    disabled={selectedSets.length <= 0}
                >
                    {selectedSets.length <= 0 ? 'Select at least one set' : 'Start'}
                </Link>
            </div>
        </main>
    );
}

export default Welcome;
