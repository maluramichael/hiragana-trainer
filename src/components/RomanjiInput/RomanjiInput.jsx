import './styles.css';

export const RomanjiInput = ({ onChange, value }) => {
    return <input
        className={'romanji-input'}
        placeholder={'Type here...'}
        type={'text'}
        onChange={onChange}
        value={value}
    />;
};
