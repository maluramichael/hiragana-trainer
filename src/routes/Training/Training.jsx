import { Link }           from 'react-router-dom';
import { useParams }      from 'react-router-dom';
import { useState }       from 'react';
import { useEffect }      from 'react';
import _                  from 'lodash';
import { useTranslation } from 'react-i18next';

import { getRandomCharacter } from '../../data/HiraganaMapping.jsx';
import { RomajiInput }        from '../../components/RomajiInput/RomajiInput.jsx';
import { CurrentCharacter }   from '../../components/CurrentCharacter/CurrentCharacter.jsx';
import useSettings            from '../../hooks/useSettings.jsx';

import './styles.css';

function RomajiMultipleChoice({ currentCharacter, onSelect }) {
    return <div className={'buttons'}>
        {currentCharacter.availableRomaji.map((item, index) => {

            return (
                <div
                    className={'button'}
                    style={{ width: '40px', textAlign: 'center', display: 'inline-block' }}
                    key={index}
                    onClick={() => onSelect({ target: { value: _.isArray(item) ? item[0] : item } })}
                >
                    {item}
                </div>
            );
        })}
    </div>;
}

function LastAnswer(props) {
    return <div
        className={'last-answer'}
    >
        {props.children}
    </div>;
}

function Training() {
    const { t }                                   = useTranslation();
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
        if (currentCharacter && currentInput) {
            if (
                _.isArray(currentCharacter.romaji) && currentCharacter.romaji.includes(currentInput) ||
                currentInput === currentCharacter.romaji
            ) {
                setCurrentInput('');
                let newCharacter = currentCharacter;

                while (newCharacter.romaji === currentCharacter.romaji) {
                    newCharacter = getRandomCharacter(selectedSets);
                }

                let newLastAnswers = [currentCharacter, ...lastAnswers];

                if (newLastAnswers.length > 5) {
                    newLastAnswers = newLastAnswers.slice(0, 5);
                }

                setLastAnswers(newLastAnswers);
                setCurrentCharacter(newCharacter);
            }
        }
    }, [currentInput, currentCharacter]);

    return (
        <div id={'page'}>
            <Link
                to={'/'}
                className={'button full-width'}
            >
                {t('Go back')}
            </Link>
            <CurrentCharacter currentCharacter={currentCharacter} />
            {!multipleChoice &&
                <RomajiInput
                    onChange={onChange}
                    value={currentInput}
                />
            }
            {multipleChoice &&
                <RomajiMultipleChoice
                    currentCharacter={currentCharacter}
                    onSelect={onChange}
                />
            }
            <div>
                {lastAnswers.map((item, index) => (
                    <LastAnswer
                        key={index}
                    >
                        {item.hiragana} - {item.romaji}
                    </LastAnswer>
                ))}
            </div>
        </div>
    );
}

export default Training;
