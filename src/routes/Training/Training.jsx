import { Link }      from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useState }  from 'react';
import { useEffect } from 'react';

import { getRandomCharacter } from '../../data/HiraganaMapping.jsx';
import { RomanjiInput }       from '../../components/RomanjiInput/RomanjiInput.jsx';

import './styles.css';
import { CurrentCharacter }   from '../../components/CurrentCharacter/CurrentCharacter.jsx';

function Training() {
    const [points, setPoints]                     = useState(0);
    const [currentInput, setCurrentInput]         = useState('');
    const [lastAnswers, setLastAnswers]           = useState([]);
    const [currentCharacter, setCurrentCharacter] = useState(null);
    const { selectedSets }                        = useParams();

    const onChange = (event) => {
        const value = event.target.value;
        setCurrentInput(value);
    };

    useEffect(() => {
        setCurrentCharacter(getRandomCharacter(selectedSets));
    }, []);

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
                className={'button'}
            >
                Go back
            </Link>
            <CurrentCharacter currentCharacter={currentCharacter} />
            <RomanjiInput
                onChange={onChange}
                value={currentInput}
            />
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
