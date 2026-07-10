import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dashboardAPI, formatPrice } from '../../lib/api';
import { Bar, Line } from 'react-chartjs-2';
import AdminGuard from '../../components/admin/AdminGuard';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function AdminDashboardContent() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const d = await dashboardAPI.get();
                setData(d);
            } catch (err) {
                console.error('Failed to load dashboard:', err);
            }
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="section-padding py-12 max-w-7xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-100 rounded w-1/4" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
                        ))}
                    </div>
                    <div className="h-80 bg-gray-100 rounded-xl" />
                </div>
            </div>
        );
    }

    const revenueChart = {
        labels: data?.monthlyRevenue?.map(m => m.month) || [],
        datasets: [{
            label: 'Revenue',
            data: data?.monthlyRevenue?.map(m => m.revenue) || [],
            backgroundColor: 'rgba(17, 24, 39, 0.1)',
            borderColor: '#111827',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#111827',
        }]
    };

    const ordersChart = {
        labels: data?.monthlyRevenue?.map(m => m.month) || [],
        datasets: [{
            label: 'Orders',
            data: data?.monthlyRevenue?.map(m => m.orders) || [],
            backgroundColor: 'rgba(17, 24, 39, 0.1)',
            borderColor: '#111827',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#111827',
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: { grid: { color: '#F3F4F6' }, ticks: { font: { size: 11 } } },
        },
    };

    return (
        <div className="section-padding py-12 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="label-sm mb-2">Admin</p>
                    <h1 className="heading-lg">Dashboard</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/products" className="btn-outline text-xs">Products</Link>
                    <Link href="/admin/inquiries" className="btn-outline text-xs">Inquiries</Link>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Revenue', value: formatPrice(data?.metrics?.totalRevenue || 0), trend: '+12%' },
                    { label: "Today's Revenue", value: formatPrice(data?.metrics?.todayRevenue || 0), trend: '+5%' },
                    { label: 'Total Orders', value: data?.monthlyRevenue?.reduce((s, m) => s + m.orders, 0) || 0, trend: '+8%' },
                    { label: 'Pending Inquiries', value: data?.metrics?.pendingInquiries || 0, trend: 'new' },
                    { label: 'Products', value: data?.metrics?.totalProducts || 0, trend: 'active' },
                    { label: 'Customers', value: '128', trend: '+15%' },
                    { label: 'In Progress', value: data?.metrics?.inProgressInquiries || 0, trend: 'active' },
                    { label: 'Low Stock', value: data?.metrics?.lowStock || 0, trend: 'alert' },
                ].map((metric) => (
                    <div key={metric.label} className="p-5 border border-aura-border rounded-xl">
                        <p className="text-xs text-aura-muted mb-1">{metric.label}</p>
                        <p className="text-xl font-light">{metric.value}</p>
                        <span className="text-xs text-green-600">{metric.trend}</span>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="p-6 border border-aura-border rounded-xl">
                    <h3 className="text-sm font-medium mb-6">Monthly Revenue</h3>
                    <Line data={revenueChart} options={chartOptions} />
                </div>
                <div className="p-6 border border-aura-border rounded-xl">
                    <h3 className="text-sm font-medium mb-6">Monthly Orders</h3>
                    <Bar data={ordersChart} options={chartOptions} />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="p-6 border border-aura-border rounded-xl">
                <h3 className="text-sm font-medium mb-6">Recent Activity</h3>
                <div className="space-y-4">
                    {data?.recentActivity?.map((activity, i) => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-aura-border last:border-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'inquiry' ? 'bg-blue-50' :
                                    activity.type === 'order' ? 'bg-green-50' : 'bg-gray-50'
                                }`}>
                                <svg className="w-4 h-4 text-aura-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {activity.type === 'inquiry' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    ) : activity.type === 'order' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    )}
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm">{activity.message}</p>
                                <p className="text-xs text-aura-muted">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <AdminGuard>
            <AdminDashboardContent />
        </AdminGuard>
    );
}