export const Option = ({ name, value, onChange }) => {
    return <div>
        <label>{name}</label>
        <input
            type="checkbox"
            id={name}
            name={name}
            checked={value}
            onChange={onChange}
        />
    </div>;
};
