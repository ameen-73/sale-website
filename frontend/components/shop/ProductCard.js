import Link from 'next/link';
import { useApp } from '../../hooks/useAppContext';
import { formatPrice } from '../../lib/api';

export default function ProductCard({ product }) {
    const { addToCart, toggleWishlist, wishlist } = useApp();
    const isWishlisted = wishlist.some(item => item.id === product.id);

    return (
        <div className="group animate-fade-in">
            {/* Image */}
            <Link href={`/product/${product.id}`} className="block image-zoom bg-gray-50 rounded-xl aspect-[4/5] relative overflow-hidden">
                <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                {/* Quick actions overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart({ ...product, quantity: 1 });
                        }}
                        className="w-full bg-white text-aura-text text-sm font-medium py-3 rounded-xl hover:bg-aura-text hover:text-white transition-all duration-300"
                    >
                        Add to Cart
                    </button>
                </div>
                {/* Wishlist button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product);
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-80 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 ${isWishlisted ? 'opacity-100' : ''
                        }`}
                >
                    <svg className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-aura-text'}`} fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </Link>

            {/* Info */}
            <div className="mt-4 space-y-1.5">
                <p className="label-sm">{product.category}</p>
                <Link href={`/product/${product.id}`}>
                    <h3 className="text-sm font-medium hover:text-aura-muted transition-colors">{product.title}</h3>
                </Link>
                <p className="text-sm text-aura-muted">{formatPrice(product.price)}</p>
            </div>
        </div>
    );
}