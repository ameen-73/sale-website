import { useApp } from '../../hooks/useAppContext';
import { formatPrice } from '../../lib/api';
import Link from 'next/link';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useApp();

    return (
        <div className="section-container section-padding py-12 md:py-16">
            <div className="mb-12">
                <p className="label-sm mb-4">Cart</p>
                <h1 className="heading-lg">Shopping Cart</h1>
            </div>

            {cart.length === 0 ? (
                <div className="text-center py-20">
                    <svg className="w-20 h-20 text-aura-border mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h2 className="text-xl font-light mb-3">Your cart is empty</h2>
                    <p className="text-aura-muted text-sm mb-8">Looks like you haven't added anything yet.</p>
                    <Link href="/shop" className="btn-primary">Continue Shopping</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        {cart.map((item) => (
                            <div key={item.id} className="flex gap-6 p-6 border border-aura-border rounded-xl animate-fade-in">
                                <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="label-sm mb-1">{item.category}</p>
                                            <h3 className="text-base font-medium">{item.title}</h3>
                                            <p className="text-sm text-aura-muted mt-1">{formatPrice(item.price)}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-aura-muted hover:text-red-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center border border-aura-border rounded-lg">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1.5 text-aura-muted hover:text-aura-text">−</button>
                                            <span className="px-4 py-1.5 text-sm">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1.5 text-aura-muted hover:text-aura-text">+</button>
                                        </div>
                                        <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="p-6 border border-aura-border rounded-xl sticky top-24">
                            <h3 className="text-sm font-medium mb-6">Order Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-aura-muted">Subtotal</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-aura-muted">Shipping</span>
                                    <span className="text-aura-muted">Calculated at checkout</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-aura-muted">Tax</span>
                                    <span className="text-aura-muted">Calculated at checkout</span>
                                </div>
                                <div className="border-t border-aura-border pt-3 flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                            </div>
                            <Link href="/checkout" className="btn-primary w-full text-center mt-6 block">
                                Proceed to Checkout
                            </Link>
                            <Link href="/shop" className="btn-outline w-full text-center mt-3 block text-xs">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}