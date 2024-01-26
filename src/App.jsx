import { useState }  from 'react';
import { useEffect } from 'react';
import classnames    from 'classnames';
import './App.css';

const hiraganaLectures = [
    {
        'name':     'a',
        'romanji':  ['a', 'i', 'u', 'e', 'o'],
        'hiragana': ['あ', 'い', 'う', 'え', 'お'],
    },
    {
        'name':     'ka',
        'romanji':  ['ka', 'ki', 'ku', 'ke', 'ko'],
        'hiragana': ['か', 'き', 'く', 'け', 'こ'],
    },
    {
        'name':     'sa',
        'romanji':  ['sa', 'shi', 'su', 'se', 'so'],
        'hiragana': ['さ', 'し', 'す', 'せ', 'そ'],
    },
    {
        'name':     'ta',
        'romanji':  ['ta', 'chi', 'tsu', 'te', 'to'],
        'hiragana': ['た', 'ち', 'つ', 'て', 'と'],
    },
    {
        'name':     'na',
        'romanji':  ['na', 'ni', 'nu', 'ne', 'no'],
        'hiragana': ['な', 'に', 'ぬ', 'ね', 'の'],
    },
    {
        'name':     'ha',
        'romanji':  ['ha', 'hi', 'hu/fu', 'he', 'ho'],
        'hiragana': ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    },
    {
        'name':     'ma',
        'romanji':  ['ma', 'mi', 'mu', 'me', 'mo'],
        'hiragana': ['ま', 'み', 'む', 'め', 'も'],
    },
    {
        'name':     'ya',
        'romanji':  ['ya', 'yu', 'yo'],
        'hiragana': ['や', 'ゆ', 'よ'],
    },
    {
        'name':     'ra',
        'romanji':  ['ra', 'ri', 'ru', 're', 'ro'],
        'hiragana': ['ら', 'り', 'る', 'れ', 'ろ'],
    },
    {
        'name':     'wa',
        'romanji':  ['wa', 'wo', 'n'],
        'hiragana': ['わ', 'を', 'ん'],
    }
];

const getRandomCharacter = (lectures) => {
    const lectureName = lectures[Math.floor(Math.random() * lectures.length)];
    const lecture     = hiraganaLectures.find((item) => item.name === lectureName);
    const index       = Math.floor(Math.random() * lecture.romanji.length);

    return {
        'romanji':          lecture.romanji[index],
        'hiragana':         lecture.hiragana[index],
        'availableRomanji': lecture.romanji,
    };
};

const Lectures = ({ selectedLectures, setSelectedLectures }) => {
    return <div className={'lectures'}>
        {hiraganaLectures.map((lecture) => (
            <div
                className={classnames('lecture', { active: selectedLectures.includes(lecture.name) })}
                key={lecture.name}
                onClick={() => {
                    if (selectedLectures.includes(lecture.name)) {
                        setSelectedLectures(selectedLectures.filter((item) => item !== lecture.name));
                    } else {
                        setSelectedLectures([...selectedLectures, lecture.name]);
                    }
                }}
            >
                <h2>{lecture.name}</h2>
                <div style={{ display: 'flex' }}>
                    <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
                        {lecture.romanji.map((romanji, index) => (
                            <div key={romanji}>
                                <div>
                                    {lecture.hiragana[index]}
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
    * Save selected lectures in local storage
    * Split App Component into smaller routes
    * Replace english with german text
    * Always show start button but disable it if no lectures are selected
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
    const [currentCharacter, setCurrentCharacter] = useState(null);
    const [currentInput, setCurrentInput]         = useState('');
    const [started, setStarted]                   = useState(false);
    const [selectedLectures, setSelectedLectures] = useState([]);
    const [points, setPoints]                     = useState(0);
    const [lastAnswers, setLastAnswers]           = useState([]);

    const startClicked = () => {
        if (selectedLectures.length > 0) {
            setCurrentCharacter(getRandomCharacter(selectedLectures));
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
                (currentCharacter.hiragana === 'ん' && currentInput === 'nn') ||
                (currentCharacter.hiragana !== 'ん' && currentInput === currentCharacter.romanji)
            ) {
                setCurrentInput('');
                let newCharacter = currentCharacter;

                while (newCharacter.romanji === currentCharacter.romanji) {
                    newCharacter = getRandomCharacter(selectedLectures);
                }

                let newLastAnswers = [currentCharacter, ...lastAnswers];

                if (newLastAnswers.length > 10) {
                    newLastAnswers = newLastAnswers.slice(0, 10);
                }

                setLastAnswers(newLastAnswers);
                setCurrentCharacter(newCharacter);
                setPoints(points + 1);
            }
        }
    }, [currentInput, currentCharacter]);

    return (
        <main>
            <h1>Hiragana trainer</h1>
            <div>
                {!started && <div>
                    <p>
                        Select the lectures you want to train and click on start.
                    </p>
                    <Lectures
                        setSelectedLectures={setSelectedLectures}
                        selectedLectures={selectedLectures}
                    />
                    <br />
                    {selectedLectures.length > 0 && <button onClick={startClicked}>Start</button>}
                </div>}
                {started && <div>
                    <button onClick={stopClicked}>Stop</button>
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
            </div>
        </main>
    );
}

export default App;
