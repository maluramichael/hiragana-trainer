import { useState }              from 'react';
import { useEffect }             from 'react';
import './App.css';
import { CharacterSets }         from './CharacterSets.jsx';
import { hiraganaCharacterSets } from './HiraganaCharacterSets.jsx';

const getRandomCharacter = (characterSets) => {
    const characterSetName = characterSets[Math.floor(Math.random() * characterSets.length)];
    const characterSet     = hiraganaCharacterSets.find((item) => item.name === characterSetName);
    const index            = Math.floor(Math.random() * characterSet.romanji.length);

    return {
        'romanji':          characterSet.romanji[index],
        'hiragana':         characterSet.hiragana[index],
        'availableRomanji': characterSet.romanji,
    };
};

const CurrentCharacter = ({ currentCharacter }) => {
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

const Input = ({ onChange, value }) => {
    return <div>
        <br />
        <input
            type={'text'}
            onChange={onChange}
            value={value}
        />
    </div>;
};

// TODOs:

/*
    * Save selected characterSets in local storage
    * Split App Component into smaller routes
    * Replace english with german text
    * Mobile friendly
    * Add option to switch between typing and multiple choice buttons
    * Always show start button but disable it if no characterSets are selected
    * Add buttons to select all and deselect all
    * Add share images
    * Add favicon (maybe something short that is related to sensei)
    * Add sounds for correct answers
    * Add sounds for each character
    * Add a bar with options
        * Show/hide 'possible romanji'
        * Play sounds
    * Add lovely little footer at the bottom. Something like "Made with love by マイケル - https://malura.de"
    * Add a couple of transitions to make it everything look a bit more smooth
 */

function App() {
    const [currentCharacter, setCurrentCharacter]           = useState(null);
    const [currentInput, setCurrentInput]                   = useState('');
    const [started, setStarted]                             = useState(false);
    const [selectedCharacterSets, setSelectedCharacterSets] = useState([]);
    const [points, setPoints]                               = useState(0);
    const [lastAnswers, setLastAnswers]                     = useState([]);

    const startClicked = () => {
        if (selectedCharacterSets.length > 0) {
            setCurrentCharacter(getRandomCharacter(selectedCharacterSets));
            setStarted(true);
        }
    };

    const stopClicked = () => {
        setStarted(false);
    };

    const onChange = (event) => {
        const value = event.target.value;
        setCurrentInput(value);
    };

    useEffect(() => {
        if (currentCharacter) {
            // TODO: Move check to a function
            if (
                (
                    currentCharacter.hiragana === 'ん' && currentInput === 'nn'
                ) ||
                (
                    currentCharacter.hiragana !== 'ん' && currentInput === currentCharacter.romanji
                )
            ) {
                setCurrentInput('');
                let newCharacter = currentCharacter;

                while (newCharacter.romanji === currentCharacter.romanji) {
                    newCharacter = getRandomCharacter(selectedCharacterSets);
                }

                let newLastAnswers = [currentCharacter, ...lastAnswers];

                if (newLastAnswers.length > 5) {
                    newLastAnswers = newLastAnswers.slice(0, 5);
                }

                setLastAnswers(newLastAnswers);
                setCurrentCharacter(newCharacter);
                setPoints(points + 1);
            }
        }
    }, [currentInput, currentCharacter]);

    return (
        <main>
            {!started && <h1>Hiragana trainer</h1>}
            {!started && <div>
                <p>
                    Select the sets you want to train and click on start.
                </p>
                <CharacterSets
                    setSelectedCharacterSets={setSelectedCharacterSets}
                    selectedCharacterSets={selectedCharacterSets}
                />
                <br />
                {selectedCharacterSets.length > 0 && <button onClick={startClicked}>Start</button>}
            </div>}
            {started && <div>
                <button onClick={stopClicked}>Go back</button>
                <CurrentCharacter currentCharacter={currentCharacter} />
                <Input
                    onChange={onChange}
                    value={currentInput}
                />
                <br />
                <div>
                    {points} Points
                </div>
                <div>
                    {lastAnswers.map((item, index) => (
                        <div
                            key={index}
                            className={'last-answer'}
                        >
                            {item.hiragana} - {item.romanji}
                        </div>
                    ))}
                </div>
            </div>}
        </main>
    );
}

export default App;
