import { useApp } from '../../hooks/useAppContext';
import { formatPrice } from '../../lib/api';
import Link from 'next/link';
import ProductCard from '../../components/shop/ProductCard';

export default function Wishlist() {
    const { wishlist } = useApp();

    return (
        <div className="section-container section-padding py-12 md:py-16">
            <div className="mb-12">
                <p className="label-sm mb-4">Wishlist</p>
                <h1 className="heading-lg">Saved Items</h1>
            </div>

            {wishlist.length === 0 ? (
                <div className="text-center py-20">
                    <svg className="w-20 h-20 text-aura-border mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h2 className="text-xl font-light mb-3">Your wishlist is empty</h2>
                    <p className="text-aura-muted text-sm mb-8">Save your favorite items for later.</p>
                    <Link href="/shop" className="btn-primary">Explore Products</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlist.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}