import { Link } from 'react-router-dom';

import { CharacterSets } from '../../components/CharacterSets.jsx';

import './styles.css';
import useLocalStorage   from '../../hooks/useLocalStorage.jsx';
import { Options }       from '../../components/Options.jsx';

/*
    * Replace english with german text
    * Mobile friendly
    * Add buttons to select all and deselect all
    * Add share images
    * Add favicon (maybe something short that is related to sensei)
    * Add sounds for correct answers
    * Add sounds for each character
    * Add a bar with options
        * Show/hide 'possible romanji'
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
                <br />
                <Link
                    className={'button'}
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
