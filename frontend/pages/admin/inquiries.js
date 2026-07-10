import { useState, useEffect } from 'react';
import Link from 'next/link';
import { inquiriesAPI } from '../../lib/api';
import { useApp } from '../../hooks/useAppContext';
import AdminGuard from '../../components/admin/AdminGuard';

function AdminInquiriesContent() {
    const { addToast } = useApp();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

    const loadInquiries = async () => {
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (search) params.search = search;
            const data = await inquiriesAPI.getAll(params);
            setInquiries(data.inquiries);
        } catch (err) {
            console.error('Failed to load:', err);
        }
        setLoading(false);
    };

    useEffect(() => { loadInquiries(); }, [statusFilter]);

    useEffect(() => {
        const inq = inquiries.find(i => i.id === selected);
        setNotes(inq?.notes || '');
    }, [selected, inquiries]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadInquiries();
    };

    const handleStatusChange = async (id, status) => {
        try {
            await inquiriesAPI.update(id, { status });
            addToast('Inquiry status updated successfully', 'success');
            loadInquiries();
        } catch (err) {
            console.error('Failed to update status:', err);
            addToast('Failed to update status', 'error');
        }
    };

    const handleSaveNotes = async (id) => {
        setSavingNotes(true);
        try {
            await inquiriesAPI.update(id, { notes });
            addToast('Notes saved successfully', 'success');
            setInquiries(prev => prev.map(i => i.id === id ? { ...i, notes } : i));
        } catch (err) {
            console.error('Failed to update notes:', err);
            addToast('Failed to save notes', 'error');
        }
        setSavingNotes(false);
    };

    return (
        <div className="section-padding py-12 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="label-sm mb-2">Admin</p>
                    <h1 className="heading-lg">Custom Inquiries</h1>
                </div>
                <Link href="/admin" className="btn-outline text-xs">Dashboard</Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <form onSubmit={handleSearch} className="flex-1 flex">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or city..."
                        className="flex-1 px-4 py-2.5 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text"
                    />
                    <button type="submit" className="ml-2 px-4 py-2.5 bg-aura-text text-white rounded-xl text-sm">Search</button>
                </form>
                <div className="flex gap-2">
                    {['all', 'pending', 'in-progress', 'completed'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${statusFilter === s ? 'bg-aura-text text-white' : 'border border-aura-border text-aura-muted hover:border-aura-text'
                                }`}
                        >
                            {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
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
                                <th className="text-left py-3 px-4 font-medium text-aura-muted">Name</th>
                                <th className="text-left py-3 px-4 font-medium text-aura-muted">Contact</th>
                                <th className="text-left py-3 px-4 font-medium text-aura-muted">Room</th>
                                <th className="text-left py-3 px-4 font-medium text-aura-muted">Budget</th>
                                <th className="text-left py-3 px-4 font-medium text-aura-muted">Date</th>
                                <th className="text-left py-3 px-4 font-medium text-aura-muted">Status</th>
                                <th className="text-right py-3 px-4 font-medium text-aura-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.map((inq) => (
                                <tr key={inq.id} className="border-b border-aura-border hover:bg-aura-soft transition-colors">
                                    <td className="py-3 px-4">
                                        <span className="font-medium">{inq.name}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-xs text-aura-muted">
                                            <p>{inq.email}</p>
                                            <p>{inq.phone}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-aura-muted">{inq.roomType}</td>
                                    <td className="py-3 px-4 text-aura-muted text-xs">{inq.budget}</td>
                                    <td className="py-3 px-4 text-aura-muted text-xs">{new Date(inq.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        <select
                                            value={inq.status}
                                            onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                                            className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${inq.status === 'pending' ? 'text-yellow-600 bg-yellow-50' :
                                                    inq.status === 'in-progress' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'
                                                }`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={() => setSelected(selected === inq.id ? null : inq.id)}
                                            className="text-xs text-aura-muted hover:text-aura-text"
                                        >
                                            {selected === inq.id ? 'Hide' : 'Details'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail Panel */}
            {selected && (
                <div className="mt-8 p-8 border border-aura-border rounded-xl animate-fade-in">
                    {(() => {
                        const inq = inquiries.find(i => i.id === selected);
                        if (!inq) return null;
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Client Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-aura-muted">Name:</span> {inq.name}</p>
                                        <p><span className="text-aura-muted">Email:</span> {inq.email}</p>
                                        <p><span className="text-aura-muted">Phone:</span> {inq.phone}</p>
                                        <p><span className="text-aura-muted">City:</span> {inq.city}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Project Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-aura-muted">Room Type:</span> {inq.roomType}</p>
                                        <p><span className="text-aura-muted">House Size:</span> {inq.houseSize}</p>
                                        <p><span className="text-aura-muted">Budget:</span> {inq.budget}</p>
                                        <p><span className="text-aura-muted">Style:</span> {inq.style}</p>
                                        {inq.preferredDate && (
                                            <p><span className="text-aura-muted">Preferred Date:</span> {new Date(inq.preferredDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-medium mb-2">Inquiry Details</h3>
                                    <p className="text-sm text-aura-muted leading-relaxed">{inq.details}</p>
                                </div>
                                <div className="md:col-span-2 pt-6 border-t border-aura-border space-y-4">
                                    <h3 className="text-sm font-medium">Internal Notes</h3>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        placeholder="Add private staff notes, call history, or follow-up details..."
                                        className="w-full px-4 py-3 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text transition-colors resize-none"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleSaveNotes(inq.id)}
                                            disabled={savingNotes}
                                            className="px-6 py-2.5 bg-aura-text text-white rounded-xl text-xs font-medium hover:bg-opacity-95 disabled:opacity-50 transition-colors"
                                        >
                                            {savingNotes ? 'Saving...' : 'Save Notes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}

export default function AdminInquiries() {
    return (
        <AdminGuard>
            <AdminInquiriesContent />
        </AdminGuard>
    );
}