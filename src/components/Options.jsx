import { useTranslation } from 'react-i18next';
import classnames         from 'classnames';

import { Option }  from './Option.jsx';
import useSettings from '../hooks/useSettings.jsx';

export function Options() {
    const { showPossibleRomaji, setShowPossibleRomaji } = useSettings();
    const { multipleChoice, setMultipleChoice }           = useSettings();
    const { t, i18n }                                     = useTranslation();

    return <div>
        <h2>{t('Options')}</h2>
        <Option
            name={t('Show possible romaji')}
            value={showPossibleRomaji}
            onChange={() => setShowPossibleRomaji(!showPossibleRomaji)}
        />
        <Option
            name={t('Select between kana instead of typing')}
            value={multipleChoice}
            onChange={() => setMultipleChoice(!multipleChoice)}
        />
        <div
            className={classnames('button', { 'active': i18n.language === 'de' })}
            onClick={() => {
                i18n.changeLanguage('de');
            }}
        >
            {t('German')}
        </div>
        <div
            className={classnames('button', { 'active': i18n.language === 'en' })}
            onClick={() => {
                i18n.changeLanguage('en');
            }}
        >
            {t('English')}
        </div>
    </div>;
}
