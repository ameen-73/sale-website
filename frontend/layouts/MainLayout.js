import { useState, useEffect } from 'react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import CartDrawer from '../components/ui/CartDrawer';
import SearchModal from '../components/ui/SearchModal';
import Toast from '../components/ui/Toast';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import NewsletterPopup from '../components/ui/NewsletterPopup';

export default function MainLayout({ children }) {
    const [showNewsletter, setShowNewsletter] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const dismissed = localStorage.getItem('aura_newsletter_dismissed');
            if (!dismissed) {
                setShowNewsletter(true);
            }
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
            <SearchModal />
            <Toast />
            <WhatsAppButton />
            {showNewsletter && (
                <NewsletterPopup onClose={() => setShowNewsletter(false)} />
            )}
        </div>
    );
}