import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { productsAPI, formatPrice } from '../../lib/api';
import ProductCard from '../../components/shop/ProductCard';
import Link from 'next/link';

const CATEGORIES = ['All', 'Fancy Lighting', 'Premium Home Appliances', 'Premium Decorative Objects', 'Modern Architectural Lighting'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
];

export default function ShopPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Sync state with URL query parameter on load/navigation
    useEffect(() => {
        if (router.isReady) {
            const queryCat = router.query.category;
            if (queryCat) {
                setCategory(queryCat);
            } else {
                setCategory('All');
            }
            setPage(1);
        }
    }, [router.isReady, router.query.category]);

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            try {
                const params = {
                    sort,
                    page,
                    limit: 12,
                };
                if (category !== 'All') params.category = category;
                const data = await productsAPI.getAll(params);
                setProducts(data.products);
                setPagination(data.pagination);
            } catch (err) {
                console.error('Failed to load products:', err);
            }
            setLoading(false);
        }
        if (router.isReady) {
            loadProducts();
        }
    }, [category, sort, page, router.isReady]);

    const handleCategoryChange = (cat) => {
        setCategory(cat);
        setPage(1);

        // Sync URL query parameter
        const query = { ...router.query };
        if (cat === 'All') {
            delete query.category;
        } else {
            query.category = cat;
        }
        router.push({ pathname: '/shop', query }, undefined, { shallow: true });
    };

    return (
        <div className="section-container section-padding py-12 md:py-16">
            {/* Header */}
            <div className="mb-12">
                <p className="label-sm mb-4">Shop</p>
                <h1 className="heading-lg">Our Collection</h1>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-aura-border">
                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${category === cat
                                    ? 'bg-aura-text text-white'
                                    : 'bg-transparent text-aura-muted border border-aura-border hover:border-aura-text'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-3">
                    <label className="text-xs text-aura-muted">Sort by</label>
                    <select
                        value={sort}
                        onChange={(e) => { setSort(e.target.value); setPage(1); }}
                        className="text-sm border border-aura-border rounded-xl px-4 py-2 outline-none bg-white focus:border-aura-text"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-100 rounded-xl aspect-[4/5]" />
                            <div className="mt-4 space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-1/3" />
                                <div className="h-4 bg-gray-100 rounded w-2/3" />
                                <div className="h-3 bg-gray-100 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20">
                    <svg className="w-16 h-16 text-aura-border mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-aura-muted text-sm">No products found</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-aura-border rounded-xl text-sm disabled:opacity-30 hover:border-aura-text transition-colors"
                    >
                        Previous
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${page === p ? 'bg-aura-text text-white' : 'border border-aura-border hover:border-aura-text'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="px-4 py-2 border border-aura-border rounded-xl text-sm disabled:opacity-30 hover:border-aura-text transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}