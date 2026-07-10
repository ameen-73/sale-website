import { useState } from 'react';

export default function NewsletterPopup({ onClose }) {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            localStorage.setItem('aura_newsletter_dismissed', 'true');
            setTimeout(() => onClose(), 2000);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem('aura_newsletter_dismissed', 'true');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black bg-opacity-30" onClick={handleDismiss} />
            <div className="relative bg-white rounded-2xl max-w-md w-full p-8 animate-zoom-in">
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-aura-muted hover:text-aura-text"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {!subscribed ? (
                    <>
                        <h3 className="text-2xl font-light mb-2">Join the Aura</h3>
                        <p className="text-sm text-aura-muted mb-6">
                            Subscribe to receive curated inspiration, exclusive previews, and personalized design insights.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email address"
                                className="w-full px-4 py-3 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text transition-colors"
                                required
                            />
                            <button type="submit" className="btn-primary w-full">
                                Subscribe
                            </button>
                            <p className="text-xs text-aura-muted text-center">
                                No spam. Unsubscribe anytime.
                            </p>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8 animate-fade-in">
                        <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <h3 className="text-xl font-light">Thank You</h3>
                        <p className="text-sm text-aura-muted mt-2">You're now on the Aura list.</p>
                    </div>
                )}
            </div>
        </div>
    );
}