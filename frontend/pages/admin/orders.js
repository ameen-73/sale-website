import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ordersAPI, productsAPI, formatPrice } from '../../lib/api';
import { useApp } from '../../hooks/useAppContext';
import AdminGuard from '../../components/admin/AdminGuard';

function AdminOrdersContent() {
    const { addToast } = useApp();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters and Search
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    
    // Modals state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Manual Order Form state
    const [form, setForm] = useState({
        customerName: '', customerEmail: '', customerPhone: '',
        address: '', city: '', state: '', zip: '', country: 'India',
        paymentMethod: 'cod', paymentStatus: 'pending', orderStatus: 'pending',
        discount: 0, tax: 0, shipping: 0
    });
    const [selectedItems, setSelectedItems] = useState([]); // Array of { product, quantity, customPrice }
    const [itemSelector, setItemSelector] = useState({ productId: '', quantity: 1, customPrice: '' });
    
    // Active printing state
    const [printOrder, setPrintOrder] = useState(null);

    const loadOrders = async () => {
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (paymentFilter !== 'all') params.paymentStatus = paymentFilter;
            if (search) params.search = search;
            
            const data = await ordersAPI.getAll(params);
            setOrders(data.orders);
        } catch (err) {
            console.error('Failed to load orders:', err);
            addToast('Failed to load orders', 'error');
        }
    };

    const loadProducts = async () => {
        try {
            const data = await productsAPI.getAll({ limit: 100 });
            setProducts(data.products || []);
        } catch (err) {
            console.error('Failed to load products:', err);
        }
    };

    useEffect(() => {
        loadOrders();
        loadProducts();
    }, [statusFilter, paymentFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadOrders();
    };

    const handleStatusUpdate = async (orderId, updates) => {
        try {
            const updated = await ordersAPI.update(orderId, updates);
            addToast('Order updated successfully', 'success');
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated.order } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, ...updated.order });
            }
        } catch (err) {
            console.error('Failed to update order status:', err);
            addToast('Failed to update order', 'error');
        }
    };

    // Manual Order Creator functions
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'discount' || name === 'tax' || name === 'shipping' ? Number(value) : value
        }));
    };

    const handleAddProductToOrder = () => {
        if (!itemSelector.productId) {
            addToast('Please select a product', 'error');
            return;
        }

        const product = products.find(p => p.id === itemSelector.productId);
        if (!product) return;

        const qty = Number(itemSelector.quantity);
        if (qty <= 0) {
            addToast('Quantity must be greater than 0', 'error');
            return;
        }

        const price = itemSelector.customPrice !== '' ? Number(itemSelector.customPrice) : product.price;

        // Check if item already exists
        const existingIdx = selectedItems.findIndex(item => item.product.id === product.id);
        if (existingIdx !== -1) {
            setSelectedItems(prev => {
                const copy = [...prev];
                copy[existingIdx].quantity += qty;
                copy[existingIdx].price = price; // update price if custom entered
                return copy;
            });
        } else {
            setSelectedItems(prev => [...prev, { product, quantity: qty, price }]);
        }

        // Reset selector
        setItemSelector({ productId: '', quantity: 1, customPrice: '' });
    };

    const handleRemoveProductFromOrder = (idx) => {
        setSelectedItems(prev => prev.filter((_, i) => i !== idx));
    };

    // Calculations for manually created order
    const manualSubtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const manualTotal = Math.max(0, manualSubtotal - form.discount + form.tax + form.shipping);

    const handleCreateOrderSubmit = async (e) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            addToast('Please add at least one product to the bill', 'error');
            return;
        }

        const orderPayload = {
            customerName: form.customerName,
            customerEmail: form.customerEmail,
            customerPhone: form.customerPhone,
            address: form.address,
            city: form.city,
            state: form.state,
            zip: form.zip,
            country: form.country,
            items: selectedItems.map(item => ({
                id: item.product.id,
                title: item.product.title,
                price: item.price,
                quantity: item.quantity,
                image: item.product.images?.[0] || ''
            })),
            subtotal: manualSubtotal,
            tax: form.tax,
            shipping: form.shipping,
            discount: form.discount,
            total: manualTotal,
            paymentStatus: form.paymentStatus,
            orderStatus: form.orderStatus,
            paymentMethod: form.paymentMethod
        };

        try {
            const result = await ordersAPI.create(orderPayload);
            addToast('Bill and order created successfully', 'success');
            setShowCreateModal(false);
            
            // Reset state
            setForm({
                customerName: '', customerEmail: '', customerPhone: '',
                address: '', city: '', state: '', zip: '', country: 'India',
                paymentMethod: 'cod', paymentStatus: 'pending', orderStatus: 'pending',
                discount: 0, tax: 0, shipping: 0
            });
            setSelectedItems([]);
            
            // Reload and view the new order
            await loadOrders();
            if (result && result.order) {
                setSelectedOrder(result.order);
            }
        } catch (err) {
            console.error('Failed to create order:', err);
            addToast('Failed to create order', 'error');
        }
    };

    const triggerPrint = (order) => {
        setPrintOrder(order);
        setTimeout(() => {
            window.print();
        }, 150);
    };

    useEffect(() => {
        // Clear printing state after print window closes
        const handleAfterPrint = () => setPrintOrder(null);
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);

    // Set loading false once first fetch completes
    useEffect(() => {
        if (orders.length >= 0) {
            setLoading(false);
        }
    }, [orders]);

    return (
        <div className="section-padding py-12 max-w-7xl mx-auto no-print">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <p className="label-sm mb-2">Admin</p>
                    <h1 className="heading-lg">Orders & Billing</h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link href="/admin" className="btn-outline text-xs py-2.5">Dashboard</Link>
                    <Link href="/admin/products" className="btn-outline text-xs py-2.5">Products</Link>
                    <Link href="/admin/inquiries" className="btn-outline text-xs py-2.5">Inquiries</Link>
                    <button 
                        onClick={() => setShowCreateModal(true)} 
                        className="btn-primary text-xs py-2.5 font-medium flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Bill
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white border border-aura-border rounded-xl p-5 mb-8 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearchSubmit} className="flex-1 flex">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Order ID, customer name or email..."
                            className="flex-1 px-4 py-2.5 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                        />
                        <button type="submit" className="ml-2 px-6 py-2.5 bg-aura-text text-white rounded-xl text-sm font-medium">
                            Search
                        </button>
                    </form>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-xs border-t border-aura-border pt-4">
                    {/* Order Status Filters */}
                    <div className="flex items-center gap-2">
                        <span className="text-aura-muted font-medium">Order Status:</span>
                        <div className="flex gap-1.5">
                            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${statusFilter === s ? 'bg-aura-text text-white' : 'border border-aura-border text-aura-muted hover:border-aura-text'}`}
                                >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Payment Status Filters */}
                    <div className="flex items-center gap-2">
                        <span className="text-aura-muted font-medium">Payment:</span>
                        <div className="flex gap-1.5">
                            {['all', 'pending', 'paid', 'refunded'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPaymentFilter(p)}
                                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${paymentFilter === p ? 'bg-aura-text text-white' : 'border border-aura-border text-aura-muted hover:border-aura-text'}`}
                                >
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-gray-50 border border-aura-border rounded-xl" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-aura-border rounded-xl bg-aura-soft">
                    <svg className="w-12 h-12 text-aura-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-aura-muted font-light mb-4">No orders or bills found</p>
                    <button onClick={() => setShowCreateModal(true)} className="btn-outline text-xs">Create First Bill</button>
                </div>
            ) : (
                <div className="bg-white border border-aura-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-aura-border bg-aura-soft text-xs text-aura-muted uppercase tracking-wider">
                                    <th className="p-4 font-medium">Order ID</th>
                                    <th className="p-4 font-medium">Customer</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Items</th>
                                    <th className="p-4 font-medium">Total</th>
                                    <th className="p-4 font-medium">Payment Status</th>
                                    <th className="p-4 font-medium">Order Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-aura-border text-sm">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-aura-soft/30 transition-colors">
                                        <td className="p-4 font-mono font-medium text-aura-text">{order.id}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-aura-text">{order.customerName}</div>
                                            <div className="text-xs text-aura-muted">{order.customerEmail}</div>
                                        </td>
                                        <td className="p-4 text-aura-muted text-xs">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-4 font-light text-xs text-aura-muted">
                                            {order.items?.length || 0} items
                                        </td>
                                        <td className="p-4 font-medium text-aura-text">{formatPrice(order.total)}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-2xs font-medium uppercase tracking-wider ${
                                                order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                order.paymentStatus === 'refunded' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                            }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-2xs font-medium uppercase tracking-wider ${
                                                order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                order.orderStatus === 'shipped' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                                order.orderStatus === 'processing' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                            }`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="px-3 py-1.5 border border-aura-border rounded-lg text-xs font-medium hover:border-aura-text hover:text-aura-text transition-colors"
                                                >
                                                    Details
                                                </button>
                                                <button
                                                    onClick={() => triggerPrint(order)}
                                                    className="px-3 py-1.5 bg-aura-soft border border-aura-border text-aura-muted rounded-lg text-xs font-medium hover:border-aura-text hover:text-aura-text transition-colors flex items-center gap-1.5"
                                                    title="Print Invoice / Bill"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm0-10V4a2 2 0 012-2h4a2 2 0 012 2v3M7 10h10" />
                                                    </svg>
                                                    Print
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ORDER DETAILS & BILL EDIT MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="bg-white border border-aura-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl animate-zoom-in">
                        {/* Header */}
                        <div className="p-6 border-b border-aura-border flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-medium text-aura-text">Order Details</h2>
                                    <span className="font-mono text-sm text-aura-muted">#{selectedOrder.id}</span>
                                </div>
                                <p className="text-xs text-aura-muted mt-1">
                                    Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-aura-muted hover:text-aura-text transition-colors p-1"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Top Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-aura-soft rounded-xl p-5 border border-aura-border">
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-aura-muted mb-2.5">Customer details</h3>
                                    <p className="font-medium text-sm">{selectedOrder.customerName}</p>
                                    <p className="text-xs text-aura-muted mt-1">{selectedOrder.customerEmail}</p>
                                    {selectedOrder.customerPhone && (
                                        <p className="text-xs text-aura-muted mt-0.5">{selectedOrder.customerPhone}</p>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-aura-muted mb-2.5">Shipping address</h3>
                                    <p className="text-xs leading-relaxed text-aura-text">
                                        {selectedOrder.address}<br />
                                        {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.zip}<br />
                                        {selectedOrder.country}
                                    </p>
                                </div>
                            </div>

                            {/* Order Status Control Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-aura-muted mb-1.5">Payment Method</label>
                                    <div className="px-3 py-2 bg-white border border-aura-border rounded-lg text-sm uppercase">
                                        {selectedOrder.paymentMethod || 'COD'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-aura-muted mb-1.5">Payment Status</label>
                                    <select
                                        value={selectedOrder.paymentStatus}
                                        onChange={(e) => handleStatusUpdate(selectedOrder.id, { paymentStatus: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-aura-border rounded-lg text-sm outline-none focus:border-aura-text transition-colors"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-aura-muted mb-1.5">Order Status</label>
                                    <select
                                        value={selectedOrder.orderStatus}
                                        onChange={(e) => handleStatusUpdate(selectedOrder.id, { orderStatus: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-aura-border rounded-lg text-sm outline-none focus:border-aura-text transition-colors"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Itemized list */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-aura-muted mb-3">Items list</h3>
                                <div className="border border-aura-border rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-aura-soft border-b border-aura-border text-aura-muted uppercase">
                                            <tr>
                                                <th className="p-3">Product</th>
                                                <th className="p-3 text-right">Price</th>
                                                <th className="p-3 text-center">Qty</th>
                                                <th className="p-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-aura-border text-sm">
                                            {selectedOrder.items?.map((item, index) => (
                                                <tr key={index} className="hover:bg-aura-soft/20">
                                                    <td className="p-3 flex items-center gap-3">
                                                        {item.image && (
                                                            <div className="w-10 h-10 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-xs text-aura-text leading-tight">{item.title}</p>
                                                            <span className="text-[10px] text-aura-muted font-mono">{item.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-right font-light text-xs">{formatPrice(item.price)}</td>
                                                    <td className="p-3 text-center font-light text-xs">{item.quantity}</td>
                                                    <td className="p-3 text-right font-medium text-xs">{formatPrice(item.price * item.quantity)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary Totals */}
                            <div className="flex justify-end">
                                <div className="w-full sm:w-64 space-y-2 text-xs border-t border-aura-border pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-aura-muted">Subtotal</span>
                                        <span className="font-light">{formatPrice(selectedOrder.subtotal)}</span>
                                    </div>
                                    {selectedOrder.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>-{formatPrice(selectedOrder.discount)}</span>
                                        </div>
                                    )}
                                    {selectedOrder.tax > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-aura-muted">Taxes</span>
                                            <span className="font-light">+{formatPrice(selectedOrder.tax)}</span>
                                        </div>
                                    )}
                                    {selectedOrder.shipping > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-aura-muted">Shipping</span>
                                            <span className="font-light">+{formatPrice(selectedOrder.shipping)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-semibold text-sm pt-2 border-t border-aura-border text-aura-text">
                                        <span>Total Amount</span>
                                        <span>{formatPrice(selectedOrder.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-aura-border bg-aura-soft flex justify-between gap-3">
                            <button
                                onClick={() => triggerPrint(selectedOrder)}
                                className="px-4 py-2 bg-aura-text text-white hover:bg-opacity-95 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm0-10V4a2 2 0 012-2h4a2 2 0 012 2v3M7 10h10" />
                                </svg>
                                Print Invoice
                            </button>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 border border-aura-border text-xs font-medium hover:border-aura-text rounded-xl transition-colors bg-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MANUAL BILL / ORDER CREATOR MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="bg-white border border-aura-border rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-xl animate-zoom-in">
                        {/* Header */}
                        <div className="p-6 border-b border-aura-border flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-medium text-aura-text">Create Manual Bill & Order</h2>
                                <p className="text-xs text-aura-muted mt-1">Generate a sales invoice and record the transaction</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setSelectedItems([]);
                                }}
                                className="text-aura-muted hover:text-aura-text transition-colors p-1"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content Form */}
                        <form onSubmit={handleCreateOrderSubmit}>
                            <div className="p-6 space-y-6">
                                {/* Grid: Customer details */}
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-aura-muted mb-3">Customer Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs text-aura-muted mb-1">Customer Name *</label>
                                            <input
                                                type="text" required name="customerName"
                                                value={form.customerName} onChange={handleFormChange}
                                                placeholder="e.g. John Doe"
                                                className="w-full px-3 py-2 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-aura-muted mb-1">Customer Email *</label>
                                            <input
                                                type="email" required name="customerEmail"
                                                value={form.customerEmail} onChange={handleFormChange}
                                                placeholder="e.g. john@example.com"
                                                className="w-full px-3 py-2 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-aura-muted mb-1">Customer Phone</label>
                                            <input
                                                type="tel" name="customerPhone"
                                                value={form.customerPhone} onChange={handleFormChange}
                                                placeholder="e.g. +91 98765 43210"
                                                className="w-full px-3 py-2 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Details */}
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-aura-muted mb-3">Billing & Shipping Address</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-aura-muted mb-1">Street Address</label>
                                            <input
                                                type="text" name="address"
                                                value={form.address} onChange={handleFormChange}
                                                placeholder="e.g. 123 Luxury Avenue, Sector 5"
                                                className="w-full px-3 py-2 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs text-aura-muted mb-1">City</label>
                                                <input
                                                    type="text" name="city"
                                                    value={form.city} onChange={handleFormChange}
                                                    placeholder="e.g. Mumbai"
                                                    className="w-full px-3 py-2 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-aura-muted mb-1">State</label>
                                                <input
                                                    type="text" name="state"
                                                    value={form.state} onChange={handleFormChange}
                                                    placeholder="e.g. Maharashtra"
                                                    className="w-full px-3 py-2 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-aura-muted mb-1">ZIP Code</label>
                                                <input
                                                    type="text" name="zip"
                                                    value={form.zip} onChange={handleFormChange}
                                                    placeholder="e.g. 400001"
                                                    className="w-full px-3 py-2 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-aura-muted mb-1">Country</label>
                                                <input
                                                    type="text" name="country"
                                                    value={form.country} onChange={handleFormChange}
                                                    placeholder="India"
                                                    className="w-full px-3 py-2 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product selection section */}
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-aura-muted mb-3">Add Products to Bill</h3>
                                    <div className="bg-aura-soft border border-aura-border rounded-xl p-4 flex flex-col md:flex-row md:items-end gap-3.5 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <label className="block text-xs text-aura-muted mb-1">Select Product</label>
                                            <select
                                                value={itemSelector.productId}
                                                onChange={(e) => {
                                                    const prod = products.find(p => p.id === e.target.value);
                                                    setItemSelector(prev => ({
                                                        ...prev,
                                                        productId: e.target.value,
                                                        customPrice: prod ? prod.price.toString() : ''
                                                    }));
                                                }}
                                                className="w-full px-3 py-2 bg-white border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                            >
                                                <option value="">-- Choose a Product --</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.title} ({formatPrice(p.price)})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs text-aura-muted mb-1">Quantity</label>
                                            <input
                                                type="number" min="1"
                                                value={itemSelector.quantity}
                                                onChange={(e) => setItemSelector(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                                                className="w-full px-3 py-2 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <label className="block text-xs text-aura-muted mb-1">Unit Price Override</label>
                                            <input
                                                type="number" min="0" placeholder="Optional"
                                                value={itemSelector.customPrice}
                                                onChange={(e) => setItemSelector(prev => ({ ...prev, customPrice: e.target.value }))}
                                                className="w-full px-3 py-2 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddProductToOrder}
                                            className="px-5 py-2.5 bg-aura-text text-white hover:bg-opacity-95 text-xs font-semibold rounded-xl transition-all h-9 flex items-center justify-center"
                                        >
                                            Add to Bill
                                        </button>
                                    </div>

                                    {/* Selected items table */}
                                    {selectedItems.length > 0 ? (
                                        <div className="border border-aura-border rounded-xl overflow-hidden">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-aura-soft border-b border-aura-border text-aura-muted uppercase">
                                                    <tr>
                                                        <th className="p-3">Product Name</th>
                                                        <th className="p-3 text-right">Unit Price</th>
                                                        <th className="p-3 text-center">Qty</th>
                                                        <th className="p-3 text-right">Subtotal</th>
                                                        <th className="p-3 text-center w-12"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-aura-border text-sm">
                                                    {selectedItems.map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-aura-soft/10">
                                                            <td className="p-3">
                                                                <span className="font-medium text-xs text-aura-text leading-tight">{item.product.title}</span>
                                                                <div className="text-[10px] text-aura-muted font-mono mt-0.5">{item.product.id}</div>
                                                            </td>
                                                            <td className="p-3 text-right font-light text-xs">{formatPrice(item.price)}</td>
                                                            <td className="p-3 text-center font-light text-xs">{item.quantity}</td>
                                                            <td className="p-3 text-right font-medium text-xs">{formatPrice(item.price * item.quantity)}</td>
                                                            <td className="p-3 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveProductFromOrder(idx)}
                                                                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v1a3 3 0 003 3h2m-3-3H9a3 3 0 00-3 3v1m12 0a9 9 0 11-18 0l2-2" />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 border border-dashed border-aura-border rounded-xl text-aura-muted text-xs bg-aura-soft/30">
                                            No products added to the invoice yet. Use the selector above to add products.
                                        </div>
                                    )}
                                </div>

                                {/* Grid: Payments & Totals */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left: Payment Settings */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-aura-muted">Payment & Shipping Configurations</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-aura-muted mb-1">Payment Method</label>
                                                <select
                                                    name="paymentMethod" value={form.paymentMethod} onChange={handleFormChange}
                                                    className="w-full px-3 py-2 bg-white border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                                >
                                                    <option value="cod">Cash on Delivery (COD)</option>
                                                    <option value="card">Credit / Debit Card</option>
                                                    <option value="bank_transfer">Bank Transfer</option>
                                                    <option value="upi">UPI / Net Banking</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-aura-muted mb-1">Payment Status</label>
                                                <select
                                                    name="paymentStatus" value={form.paymentStatus} onChange={handleFormChange}
                                                    className="w-full px-3 py-2 bg-white border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="refunded">Refunded</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-aura-muted mb-1">Order Status</label>
                                                <select
                                                    name="orderStatus" value={form.orderStatus} onChange={handleFormChange}
                                                    className="w-full px-3 py-2 bg-white border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Price Adjustments & Calculations */}
                                    <div className="bg-aura-soft border border-aura-border rounded-xl p-5 space-y-3.5">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-aura-muted mb-2">Invoice summary & adjustments</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs text-aura-muted mb-1">Discount (INR)</label>
                                                <input
                                                    type="number" min="0" name="discount"
                                                    value={form.discount} onChange={handleFormChange}
                                                    className="w-full px-3 py-1.5 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-aura-muted mb-1">Taxes (INR)</label>
                                                <input
                                                    type="number" min="0" name="tax"
                                                    value={form.tax} onChange={handleFormChange}
                                                    className="w-full px-3 py-1.5 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-aura-muted mb-1">Shipping (INR)</label>
                                                <input
                                                    type="number" min="0" name="shipping"
                                                    value={form.shipping} onChange={handleFormChange}
                                                    className="w-full px-3 py-1.5 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-aura-border pt-3.5 space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-aura-muted">Items Subtotal</span>
                                                <span className="font-light">{formatPrice(manualSubtotal)}</span>
                                            </div>
                                            {form.discount > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Adjusted Discount</span>
                                                    <span>-{formatPrice(form.discount)}</span>
                                                </div>
                                            )}
                                            {form.tax > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-aura-muted">Adjusted Taxes</span>
                                                    <span>+{formatPrice(form.tax)}</span>
                                                </div>
                                            )}
                                            {form.shipping > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-aura-muted">Adjusted Shipping</span>
                                                    <span>+{formatPrice(form.shipping)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-semibold text-sm pt-2.5 border-t border-aura-border text-aura-text">
                                                <span>Final Total Amount</span>
                                                <span>{formatPrice(manualTotal)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-aura-border bg-aura-soft flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setSelectedItems([]);
                                    }}
                                    className="px-4 py-2.5 border border-aura-border text-xs font-medium hover:border-aura-text rounded-xl transition-colors bg-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-aura-text text-white hover:bg-opacity-95 text-xs font-semibold rounded-xl transition-all"
                                >
                                    Generate Bill & Create Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PRINT TEMPLATE VIEW - HIDDEN ON SCREEN, VISIBLE ONLY IN PRINT MODE */}
            {printOrder && (
                <div className="hidden print-container text-black bg-white p-8 font-sans w-full max-w-4xl mx-auto flex flex-col text-sm border-t border-aura-border">
                    {/* Invoice Meta */}
                    <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-6">
                        <div>
                            <h1 className="text-3xl font-light tracking-[0.2em] uppercase text-gray-800">A U R A</h1>
                            <p className="text-xs text-gray-500 mt-1">Luxury Interior E-Commerce Platform</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Contact: contact@auradecors.com | Support: +91 99999 88888</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-lg font-semibold tracking-wider text-gray-700">TAX INVOICE / BILL</h2>
                            <p className="font-mono text-sm mt-1">Invoice No: {printOrder.id}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Date: {new Date(printOrder.createdAt).toLocaleDateString('en-IN')}</p>
                            <p className="text-xs text-gray-500">Time: {new Date(printOrder.createdAt).toLocaleTimeString('en-IN')}</p>
                        </div>
                    </div>

                    {/* Customer & Shipping details */}
                    <div className="grid grid-cols-2 gap-8 border-b-2 border-gray-100 pb-6 mb-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To (Customer):</h3>
                            <p className="font-semibold text-gray-800">{printOrder.customerName}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{printOrder.customerEmail}</p>
                            {printOrder.customerPhone && (
                                <p className="text-xs text-gray-600 mt-0.5">Phone: {printOrder.customerPhone}</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipped / Delivered To:</h3>
                            <p className="text-xs text-gray-700 leading-relaxed">
                                {printOrder.address || 'Local Delivery'}<br />
                                {printOrder.city || ''}, {printOrder.state || ''} - {printOrder.zip || ''}<br />
                                {printOrder.country || 'India'}
                            </p>
                        </div>
                    </div>

                    {/* Table of items */}
                    <div className="mb-6 flex-1">
                        <table className="w-full text-left border-collapse border-b border-gray-200">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-300 text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="p-3">Product Name & Description</th>
                                    <th className="p-3 text-right">Unit Price (INR)</th>
                                    <th className="p-3 text-center">Qty</th>
                                    <th className="p-3 text-right">Total Amount (INR)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {printOrder.items?.map((item, index) => (
                                    <tr key={index}>
                                        <td className="p-3 font-medium text-gray-800">
                                            {item.title}
                                            <span className="block text-[10px] text-gray-400 font-mono mt-0.5">ID: {item.id}</span>
                                        </td>
                                        <td className="p-3 text-right font-light text-gray-600">{formatPrice(item.price)}</td>
                                        <td className="p-3 text-center font-light text-gray-600">{item.quantity}</td>
                                        <td className="p-3 text-right font-semibold text-gray-800">{formatPrice(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals & Payments */}
                    <div className="flex justify-between items-start pt-4">
                        <div>
                            <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-4 border border-gray-100 rounded-lg">
                                <p><span className="font-semibold">Payment Mode:</span> <span className="uppercase">{printOrder.paymentMethod || 'COD'}</span></p>
                                <p><span className="font-semibold">Payment Status:</span> <span className="uppercase">{printOrder.paymentStatus}</span></p>
                                <p><span className="font-semibold">Delivery Status:</span> <span className="uppercase">{printOrder.orderStatus}</span></p>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-6 max-w-sm">
                                * This is a computer-generated tax invoice and does not require a physical signature.
                                Thank you for shopping with AURA Luxury Interior. For returns or support, please query within 7 days.
                            </div>
                        </div>
                        <div className="w-64 space-y-2 text-xs text-gray-600 border-t border-gray-200 pt-4">
                            <div className="flex justify-between">
                                <span>Items Subtotal:</span>
                                <span>{formatPrice(printOrder.subtotal)}</span>
                            </div>
                            {printOrder.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Applied Discount:</span>
                                    <span>-{formatPrice(printOrder.discount)}</span>
                                </div>
                            )}
                            {printOrder.tax > 0 && (
                                <div className="flex justify-between">
                                    <span>Taxes (GST):</span>
                                    <span>+{formatPrice(printOrder.tax)}</span>
                                </div>
                            )}
                            {printOrder.shipping > 0 && (
                                <div className="flex justify-between">
                                    <span>Shipping / Handling:</span>
                                    <span>+{formatPrice(printOrder.shipping)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-300 text-black">
                                <span>Grand Total:</span>
                                <span>{formatPrice(printOrder.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Print Style Injection */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    /* Hide everything outside of print-container */
                    body > *:not(.print-container) {
                        display: none !important;
                    }
                    /* Ensure print-container is visible */
                    .print-container {
                        display: block !important;
                        width: 100% !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        color: black !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            ` }} />
        </div>
    );
}

export default function AdminOrders() {
    return (
        <AdminGuard>
            <AdminOrdersContent />
        </AdminGuard>
    );
}
