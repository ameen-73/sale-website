import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../hooks/useAppContext';
import { productsAPI, formatPrice } from '../../lib/api';
import Link from 'next/link';

export default function SearchModal() {
    const { isSearchOpen, toggleSearch } = useApp();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            inputRef.current.focus();
        }
        if (!isSearchOpen) {
            setQuery('');
            setResults([]);
        }
    }, [isSearchOpen]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const data = await productsAPI.getAll({ search: query, limit: 8 });
                    setResults(data.products);
                } catch (err) {
                    setResults([]);
                }
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') toggleSearch();
    };

    if (!isSearchOpen) return null;

    return (
        <div className="fixed inset-0 z-50" onKeyDown={handleKeyDown}>
            <div className="absolute inset-0 bg-black bg-opacity-30" onClick={toggleSearch} />
            <div className="relative max-w-2xl mx-auto mt-24 px-6">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-slide-down">
                    <div className="flex items-center border-b border-aura-border px-6 py-4">
                        <svg className="w-5 h-5 text-aura-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search products..."
                            className="flex-1 ml-3 outline-none text-sm bg-transparent"
                        />
                        <button onClick={toggleSearch} className="text-aura-muted hover:text-aura-text">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto p-6">
                        {loading && (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-4 animate-pulse">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-100 rounded w-3/4" />
                                            <div className="h-3 bg-gray-100 rounded w-1/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && results.length === 0 && query.length >= 2 && (
                            <p className="text-center text-aura-muted text-sm py-8">No products found</p>
                        )}

                        {!loading && results.length > 0 && (
                            <div className="space-y-4">
                                {results.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/product/${product.id}`}
                                        onClick={toggleSearch}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-aura-soft transition-colors"
                                    >
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={product.images?.[0]} alt={product.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium truncate">{product.title}</h4>
                                            <p className="text-xs text-aura-muted mt-0.5">{product.category}</p>
                                        </div>
                                        <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {query.length < 2 && (
                            <p className="text-center text-aura-muted text-sm py-8">
                                Type at least 2 characters to search
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}