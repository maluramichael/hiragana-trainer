import './styles.css';
import { useTranslation } from 'react-i18next';

export const RomajiInput = ({ onChange, value }) => {
    const { t } = useTranslation();

    return <input
        className={'romaji-input'}
        placeholder={t('Type the romaji here')}
        type={'text'}
        onChange={onChange}
        value={value}
    />;
};
