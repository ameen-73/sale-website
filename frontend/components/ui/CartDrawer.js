import { useApp } from '../../hooks/useAppContext';
import { formatPrice } from '../../lib/api';
import Link from 'next/link';

export default function CartDrawer() {
    const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useApp();

    return (
        <>
            {/* Overlay */}
            {isCartOpen && (
                <div className="cart-overlay" onClick={toggleCart} />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-500 ease-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-aura-border">
                        <h2 className="text-lg font-medium">Cart ({cart.length})</h2>
                        <button
                            onClick={toggleCart}
                            className="p-2 text-aura-muted hover:text-aura-text transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <svg className="w-16 h-16 text-aura-border mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <p className="text-aura-muted text-sm">Your cart is empty</p>
                                <button
                                    onClick={toggleCart}
                                    className="mt-4 btn-outline text-xs"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4 animate-fade-in">
                                        <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.images?.[0] || 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=200'}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium truncate">{item.title}</h3>
                                            <p className="text-sm text-aura-muted mt-1">{formatPrice(item.price)}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center border border-aura-border rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="px-2.5 py-1 text-aura-muted hover:text-aura-text transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="px-3 py-1 text-sm">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="px-2.5 py-1 text-aura-muted hover:text-aura-text transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-xs text-aura-muted hover:text-red-500 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cart.length > 0 && (
                        <div className="border-t border-aura-border px-6 py-6 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-aura-muted">Subtotal</span>
                                <span className="font-medium">{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-aura-muted">Shipping</span>
                                <span className="text-aura-muted">Calculated at checkout</span>
                            </div>
                            <Link
                                href="/checkout"
                                onClick={toggleCart}
                                className="btn-primary w-full text-center block"
                            >
                                Checkout — {formatPrice(cartTotal)}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}