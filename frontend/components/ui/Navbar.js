import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../../hooks/useAppContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { cartCount, wishlist, toggleCart, toggleSearch, toggleDarkMode, isDarkMode } = useApp();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Shop', href: '/shop' },
        { label: 'Custom Design', href: '/custom-design' },
        { label: 'Journal', href: '/journal' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
    ];

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                        ? 'bg-white border-b border-aura-border shadow-sm'
                        : 'bg-transparent'
                    }`}
            >
                <div className="section-container section-padding">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link href="/" className="text-xl md:text-2xl font-light tracking-[0.3em] text-aura-text">
                            AURA
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-aura-muted hover:text-aura-text transition-colors duration-300"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Right Icons */}
                        <div className="flex items-center space-x-5">
                            <button
                                onClick={toggleSearch}
                                className="p-2 text-aura-muted hover:text-aura-text transition-colors duration-300"
                                aria-label="Search"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>

                            <button
                                onClick={toggleDarkMode}
                                className="p-2 text-aura-muted hover:text-aura-text transition-colors duration-300"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            <Link
                                href="/wishlist"
                                className="relative p-2 text-aura-muted hover:text-aura-text transition-colors duration-300"
                                aria-label="Wishlist"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {wishlist.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-aura-text text-white text-[10px] flex items-center justify-center rounded-full">
                                        {wishlist.length}
                                    </span>
                                )}
                            </Link>

                            <button
                                onClick={toggleCart}
                                className="relative p-2 text-aura-muted hover:text-aura-text transition-colors duration-300"
                                aria-label="Cart"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-aura-text text-white text-[10px] flex items-center justify-center rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            <Link
                                href="/admin"
                                className="p-2 text-aura-muted hover:text-aura-text transition-colors duration-300"
                                aria-label="Account"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </Link>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-aura-muted hover:text-aura-text"
                                aria-label="Menu"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-aura-border animate-slide-down">
                        <div className="section-padding py-6 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-sm text-aura-muted hover:text-aura-text transition-colors py-2"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </header>
            {/* Spacer for fixed header */}
            <div className="h-16 md:h-20" />
        </>
    );
}