import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productsAPI, formatPrice } from '../../lib/api';
import { useApp } from '../../hooks/useAppContext';
import AdminGuard from '../../components/admin/AdminGuard';

function AdminProductsContent() {
    const { addToast } = useApp();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        title: '', category: 'Fancy Lighting', price: '', description: '',
        images: '', inventory: '', featured: false
    });

    const loadProducts = async () => {
        try {
            const data = await productsAPI.getAll({ limit: 100 });
            setProducts(data.products);
        } catch (err) {
            console.error('Failed to load:', err);
        }
        setLoading(false);
    };

    useEffect(() => { loadProducts(); }, []);

    const handleEdit = (product) => {
        setEditing(product.id);
        setForm({
            title: product.title,
            category: product.category,
            price: product.price.toString(),
            description: product.description,
            images: product.images?.join(', ') || '',
            inventory: product.inventory.toString(),
            featured: product.featured,
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditing(null);
        setForm({ title: '', category: 'Fancy Lighting', price: '', description: '', images: '', inventory: '', featured: false });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this product?')) {
            try {
                await productsAPI.delete(id);
                addToast('Product deleted successfully', 'success');
                loadProducts();
            } catch (err) {
                console.error('Failed to delete:', err);
                addToast('Failed to delete product', 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            price: Number(form.price),
            inventory: Number(form.inventory),
            images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        };

        try {
            if (editing) {
                await productsAPI.update(editing, payload);
                addToast('Product updated successfully', 'success');
            } else {
                await productsAPI.create(payload);
                addToast('Product created successfully', 'success');
            }
            setShowModal(false);
            loadProducts();
        } catch (err) {
            console.error('Failed to save:', err);
            addToast('Failed to save product', 'error');
        }
    };

    return (
        <div className="section-padding py-12 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="label-sm mb-2">Admin</p>
                    <h1 className="heading-lg">Products</h1>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin" className="btn-outline text-xs">Dashboard</Link>
                    <button onClick={handleCreate} className="btn-primary text-xs">Add Product</button>
                </div>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-aura-border">
                                <th className="text-left py-3 px-4 font-medium text-aura-muted">Product</th>
                                <th className="text-left py-3 px-4 font-medium text-aura-muted">Category</th>
                                <th className="text-left py-3 px-4 font-medium text-aura-muted">Price</th>
                                <th className="text-left py-3 px-4 font-medium text-aura-muted">Inventory</th>
                                <th className="text-left py-3 px-4 font-medium text-aura-muted">Status</th>
                                <th className="text-right py-3 px-4 font-medium text-aura-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id} className="border-b border-aura-border hover:bg-aura-soft transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={p.images?.[0]} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-medium">{p.title}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-aura-muted">{p.category}</td>
                                    <td className="py-3 px-4">{formatPrice(p.price)}</td>
                                    <td className="py-3 px-4">{p.inventory}</td>
                                    <td className="py-3 px-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${p.inventory > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                                            }`}>
                                            {p.inventory > 0 ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button onClick={() => handleEdit(p)} className="text-xs text-aura-muted hover:text-aura-text mr-4">Edit</button>
                                        <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-600">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black bg-opacity-30" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto animate-zoom-in">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-aura-muted hover:text-aura-text">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 className="text-lg font-medium mb-6">{editing ? 'Edit Product' : 'Add Product'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-aura-muted mb-1">Title *</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                                    className="w-full px-4 py-2.5 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-aura-muted mb-1">Category *</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text bg-white">
                                        <option>Fancy Lighting</option>
                                        <option>Premium Home Appliances</option>
                                        <option>Premium Decorative Objects</option>
                                        <option>Modern Architectural Lighting</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-aura-muted mb-1">Price *</label>
                                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required
                                        className="w-full px-4 py-2.5 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-aura-muted mb-1">Description *</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3}
                                    className="w-full px-4 py-2.5 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-aura-muted mb-1">Images (comma-separated URLs)</label>
                                <input type="text" value={form.images} onChange={e => setForm({ ...form, images: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-aura-muted mb-1">Inventory *</label>
                                    <input type="number" value={form.inventory} onChange={e => setForm({ ...form, inventory: e.target.value })} required
                                        className="w-full px-4 py-2.5 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text" />
                                </div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })}
                                            className="w-4 h-4 accent-aura-text" />
                                        <span className="text-xs text-aura-muted">Featured product</span>
                                    </label>
                                </div>
                            </div>
                            <button type="submit" className="btn-primary w-full">
                                {editing ? 'Update Product' : 'Create Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminProducts() {
    return (
        <AdminGuard>
            <AdminProductsContent />
        </AdminGuard>
    );
}