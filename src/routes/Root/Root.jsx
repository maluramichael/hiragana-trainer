import { Outlet }         from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './styles.css';

export default function Root() {
    const { t } = useTranslation();
    return (
        <>
            <Outlet />
            <footer>
                {t('Made with love by')}
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
