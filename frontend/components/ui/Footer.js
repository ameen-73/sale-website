import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    return (
        <footer className="border-t border-aura-border mt-24">
            <div className="section-container section-padding py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="text-2xl font-light tracking-[0.3em] text-aura-text">
                            AURA
                        </Link>
                        <p className="mt-4 text-sm text-aura-muted leading-relaxed">
                            Curating timeless living through luxury lighting, bespoke interiors, and premium home objects.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="label-sm mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            {['Shop', 'Custom Design', 'Journal', 'About', 'Contact'].map((link) => (
                                <li key={link}>
                                    <Link
                                        href={`/${link.toLowerCase().replace(' ', '-')}`}
                                        className="text-sm text-aura-muted hover:text-aura-text transition-colors duration-300"
                                    >
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="label-sm mb-6">Contact</h4>
                        <ul className="space-y-3 text-sm text-aura-muted">
                            <li>hello@aura.com</li>
                            <li>+91 1800 123 4567</li>
                            <li>Mumbai, India</li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="label-sm mb-6">Newsletter</h4>
                        <p className="text-sm text-aura-muted mb-4">
                            Receive curated inspiration and exclusive offers.
                        </p>
                        <form onSubmit={handleSubscribe} className="flex border border-aura-border rounded-xl overflow-hidden">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent"
                                required
                            />
                            <button
                                type="submit"
                                className="px-4 py-2.5 bg-aura-text text-white text-sm font-medium hover:bg-opacity-90 transition-colors"
                            >
                                {subscribed ? '✓' : '→'}
                            </button>
                        </form>
                        {subscribed && (
                            <p className="text-xs text-green-600 mt-2 animate-fade-in">
                                Thank you for subscribing.
                            </p>
                        )}
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-16 pt-8 border-t border-aura-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-aura-muted">
                        &copy; {new Date().getFullYear()} AURA. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-6">
                        {[
                            { name: 'Instagram', url: 'https://instagram.com' },
                            { name: 'Pinterest', url: 'https://pinterest.com' },
                            { name: 'Facebook', url: 'https://facebook.com' },
                        ].map((social) => (
                            <a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-aura-muted hover:text-aura-text transition-colors duration-300"
                            >
                                {social.name}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}