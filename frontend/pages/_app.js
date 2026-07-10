import { AppProvider } from '../hooks/useAppContext';
import MainLayout from '../layouts/MainLayout';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
    return (
        <AppProvider>
            <MainLayout>
                <Component {...pageProps} />
            </MainLayout>
        </AppProvider>
    );
}