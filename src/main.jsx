import React                                   from 'react';
import ReactDOM                                from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import ErrorPage from './routes/ErrorPage.jsx';
import Welcome  from './routes/Welcome/Welcome.jsx';
import Training from './routes/Training/Training.jsx';
import Root     from './routes/Root/Root.jsx';

import './index.css';

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
