import { useState } from 'react';

const useLocalStorage = (key, initialValue, parse = true) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);

            return item ? parse ? JSON.parse(item) : item : initialValue;
        } catch (error) {
            console.log(error);

            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
};

export default useLocalStorage;
