import React                                   from 'react';
import ReactDOM                                from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import i18n                                    from 'i18next';
import { initReactI18next }                    from 'react-i18next';
import LanguageDetector                        from 'i18next-browser-languagedetector';

import ErrorPage from './routes/ErrorPage.jsx';
import Welcome   from './routes/Welcome/Welcome.jsx';
import Training  from './routes/Training/Training.jsx';
import Root      from './routes/Root/Root.jsx';

import './index.css';

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources:   {
            en: {
                translation: {
                    'Options': 'Options',
                    'German': 'German',
                    'English': 'English',
                    'Made with love by': 'Made with ❤️ by',
                },
            },
            de: {
                translation: {
                    'Options': 'Optionen',
                    'German': 'Deutsch',
                    'English': 'Englisch',
                    'Show possible romanji': 'Mögliche Romanji anzeigen',
                    'Select between kana instead of typing': 'Zwischen Kana auswählen statt tippen',
                    'Select the sets you want to train and click on start': 'Wähle die Sets aus, die du trainieren möchtest und klicke auf Start',
                    'Select at least one set': 'Wähle mindestens ein Set aus',
                    'Start': 'Start',
                    'Go back': 'Zurück',
                    'Select all': 'Alle auswählen',
                    'Deselect all': 'Alle abwählen',
                    'Type the romanji here': 'Tippe hier Romanji ein',
                    'Points': 'Punkte',
                    'Made with love by': 'Mit ❤️ gemacht von',
                },
            },
        },
        fallbackLng: 'en',

        interpolation: {
            escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
        },
    });

const router = createBrowserRouter([
    {
        path:         '/',
        element:      <Root />,
        errorElement: <ErrorPage />,
        children:     [
            {
                path:    '/',
                element: <Welcome />,
            },
            {
                path:    '/train/:selectedSets',
                element: <Training />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
