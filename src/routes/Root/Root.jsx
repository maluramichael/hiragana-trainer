import { Outlet } from 'react-router-dom';

import './styles.css';

export default function Root() {
    return (
        <>
            <Outlet />
            <footer>
                Made with ❤️ by
                <a
                    href={'https://malura.de'}
                    target={'_blank'}
                >
                    &nbsp;マイケル
                </a>
            </footer>
        </>
    );
}
