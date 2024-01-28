import './styles.css';
import { useTranslation } from 'react-i18next';

export const RomanjiInput = ({ onChange, value }) => {
    const { t } = useTranslation();

    return <input
        className={'romanji-input'}
        placeholder={t('Type the romanji here')}
        type={'text'}
        onChange={onChange}
        value={value}
    />;
};
