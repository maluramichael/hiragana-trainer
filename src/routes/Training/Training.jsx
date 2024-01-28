import { Link }      from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useState }  from 'react';
import { useEffect } from 'react';

import { getRandomCharacter } from '../../data/HiraganaMapping.jsx';
import { RomanjiInput }       from '../../components/RomanjiInput/RomanjiInput.jsx';
import { CurrentCharacter }   from '../../components/CurrentCharacter/CurrentCharacter.jsx';
import useSettings            from '../../hooks/useSettings.jsx';

import './styles.css';

function RomanjiMultipleChoice({ currentCharacter, onSelect }) {
    return <div className={'buttons'}>
        {currentCharacter.availableRomanji.map((item, index) => (
            <div
                className={'button'}
                style={{ width: '40px', textAlign: 'center', display: 'inline-block' }}
                key={index}
                onClick={() => onSelect({ target: { value: item } })}
            >
                {item}
            </div>
        ))}
    </div>;
}

function Training() {
    const [points, setPoints]                     = useState(0);
    const [currentInput, setCurrentInput]         = useState('');
    const [lastAnswers, setLastAnswers]           = useState([]);
    const { selectedSets }                        = useParams();
    const [currentCharacter, setCurrentCharacter] = useState(getRandomCharacter(selectedSets));
    const { multipleChoice }                      = useSettings();

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
                    newCharacter = getRandomCharacter(selectedSets);
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
        <div id={'page'}>
            <Link
                to={'/'}
                className={'button full-width'}
            >
                Go back
            </Link>
            <CurrentCharacter currentCharacter={currentCharacter} />
            {!multipleChoice &&
                <RomanjiInput
                    onChange={onChange}
                    value={currentInput}
                />
            }
            {multipleChoice &&
                <RomanjiMultipleChoice
                    currentCharacter={currentCharacter}
                    onSelect={onChange}
                />
            }
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
        </div>
    );
}

export default Training;
