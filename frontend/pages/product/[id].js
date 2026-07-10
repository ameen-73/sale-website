import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { productsAPI, formatPrice } from '../../lib/api';
import { useApp } from '../../hooks/useAppContext';
import ProductCard from '../../components/shop/ProductCard';
import Link from 'next/link';

export default function ProductDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const { addToCart, addRecentlyViewed, toggleWishlist, wishlist } = useApp();
    const isWishlisted = product ? wishlist.some(item => item.id === product.id) : false;

    useEffect(() => {
        if (!id) return;
        async function loadProduct() {
            setLoading(true);
            try {
                const data = await productsAPI.getById(id);
                setProduct(data);
                addRecentlyViewed(data);

                // Load related products
                const related = await productsAPI.getAll({ category: data.category, limit: 4 });
                setRelatedProducts(related.products.filter(p => p.id !== data.id));
            } catch (err) {
                console.error('Failed to load product:', err);
            }
            setLoading(false);
        }
        loadProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="section-container section-padding py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
                    <div className="bg-gray-100 rounded-xl aspect-[4/5]" />
                    <div className="space-y-6">
                        <div className="h-4 bg-gray-100 rounded w-1/4" />
                        <div className="h-8 bg-gray-100 rounded w-3/4" />
                        <div className="h-6 bg-gray-100 rounded w-1/4" />
                        <div className="h-24 bg-gray-100 rounded" />
                        <div className="h-12 bg-gray-100 rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="section-container section-padding py-20 text-center">
                <p className="text-aura-muted">Product not found</p>
                <Link href="/shop" className="btn-primary mt-6 inline-block">Back to Shop</Link>
            </div>
        );
    }

    return (
        <div className="section-container section-padding py-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-aura-muted mb-8">
                <Link href="/" className="hover:text-aura-text">Home</Link>
                <span>/</span>
                <Link href="/shop" className="hover:text-aura-text">Shop</Link>
                <span>/</span>
                <span className="text-aura-text">{product.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Gallery */}
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl aspect-[4/5] overflow-hidden">
                        <img
                            src={product.images?.[selectedImage] || product.images?.[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {product.images?.length > 1 && (
                        <div className="flex gap-3">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-aura-text' : 'border-transparent'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="lg:sticky lg:top-24 lg:self-start">
                    <p className="label-sm mb-3">{product.category}</p>
                    <h1 className="text-3xl md:text-4xl font-light mb-4">{product.title}</h1>
                    <p className="text-2xl font-light text-aura-text mb-6">{formatPrice(product.price)}</p>

                    <div className="flex items-center gap-2 mb-6">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`} viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-xs text-aura-muted">{product.rating} / 5</span>
                    </div>

                    <p className="text-aura-muted leading-relaxed mb-8">{product.description}</p>

                    <div className="space-y-3 mb-8">
                        <div className="flex items-center justify-between text-sm py-3 border-b border-aura-border">
                            <span className="text-aura-muted">Availability</span>
                            <span className={product.inventory > 0 ? 'text-green-600' : 'text-red-500'}>
                                {product.inventory > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                        {product.inventory > 0 && (
                            <div className="flex items-center justify-between text-sm py-3 border-b border-aura-border">
                                <span className="text-aura-muted">Quantity</span>
                                <div className="flex items-center border border-aura-border rounded-xl">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="px-3 py-1.5 text-aura-muted hover:text-aura-text transition-colors"
                                    >
                                        −
                                    </button>
                                    <span className="px-4 py-1.5 text-sm font-medium min-w-[2rem] text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(product.inventory, q + 1))}
                                        className="px-3 py-1.5 text-aura-muted hover:text-aura-text transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                for (let i = 0; i < quantity; i++) {
                                    addToCart(product);
                                }
                            }}
                            disabled={product.inventory === 0}
                            className="btn-primary flex-1 disabled:opacity-50"
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={() => {
                                for (let i = 0; i < quantity; i++) {
                                    addToCart(product);
                                }
                                router.push('/checkout');
                            }}
                            disabled={product.inventory === 0}
                            className="btn-secondary flex-1 disabled:opacity-50"
                        >
                            Buy Now
                        </button>
                        <button
                            onClick={() => toggleWishlist(product)}
                            className={`px-4 py-3 border rounded-xl transition-all duration-300 hover:scale-105 ${
                                isWishlisted ? 'border-red-300 bg-red-50' : 'border-aura-border hover:border-aura-text'
                            }`}
                            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            <svg className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-aura-muted'}`} fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Specifications */}
                    <div className="mt-12 pt-8 border-t border-aura-border">
                        <h3 className="text-sm font-medium mb-4">Specifications</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm py-2">
                                <span className="text-aura-muted">Category</span>
                                <span>{product.category}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2">
                                <span className="text-aura-muted">Product ID</span>
                                <span>{product.id}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2">
                                <span className="text-aura-muted">Rating</span>
                                <span>{product.rating} / 5</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-24 pt-16 border-t border-aura-border">
                    <h2 className="heading-md mb-10">Related Products</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}