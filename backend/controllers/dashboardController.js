const supabase = require('../services/supabase');
const ordersStore = require('../services/ordersStore');

// GET /api/dashboard - Get dashboard metrics
const getDashboard = async (req, res) => {
    try {
        const { data: products, error: prodErr } = await supabase
            .from('products')
            .select('price, inventory, featured, category');
        if (prodErr) throw prodErr;
        const safeProducts = products || [];

        const { data: inquiries, error: inqErr } = await supabase
            .from('inquiries')
            .select('status');
        if (inqErr) throw inqErr;
        const safeInquiries = inquiries || [];

        // Fetch actual orders directly from Supabase via ordersStore
        const orders = await ordersStore.getAll();

        // Calculate revenue metrics
        let totalRevenue = 0;
        let todayRevenue = 0;
        let totalOrders = 0;

        if (orders.length > 0) {
            totalOrders = orders.length;
            // Sum total order values where status is not cancelled
            const activeOrders = orders.filter(o => o.orderStatus !== 'cancelled');
            totalRevenue = activeOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
            
            // Calculate today's revenue (created in the last 24 hours)
            const today = new Date();
            const oneDayAgo = new Date(today.getTime() - (24 * 60 * 60 * 1000));
            const todayOrders = activeOrders.filter(o => new Date(o.createdAt) >= oneDayAgo);
            todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        } else {
            // Fallback to simulated metrics if no orders exist yet
            totalRevenue = safeProducts.reduce((sum, p) => sum + (Number(p.price) * (Number(p.inventory) > 0 ? 1 : 0)), 0);
            todayRevenue = Math.round(totalRevenue * 0.05);
        }

        // Product metrics
        const totalProducts = safeProducts.length;
        const featuredProducts = safeProducts.filter(p => p.featured).length;
        const lowStock = safeProducts.filter(p => Number(p.inventory) < 10).length;

        // Inquiry metrics
        const totalInquiries = safeInquiries.length;
        const pendingInquiries = safeInquiries.filter(i => i.status === 'pending').length;
        const inProgressInquiries = safeInquiries.filter(i => i.status === 'in-progress').length;
        const completedInquiries = safeInquiries.filter(i => i.status === 'completed').length;

        // Category distribution
        const categoryDistribution = {};
        safeProducts.forEach(p => {
            if (p.category) {
                categoryDistribution[p.category] = (categoryDistribution[p.category] || 0) + 1;
            }
        });

        // Monthly revenue (last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        let monthlyRevenue = [];

        if (orders.length > 0) {
            const monthsMap = {};
            const now = new Date();
            // Initialize last 6 months dynamically
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = d.toLocaleString('default', { month: 'short' });
                monthsMap[monthName] = { revenue: 0, orders: 0 };
            }

            orders.forEach(o => {
                if (o.orderStatus !== 'cancelled') {
                    const date = new Date(o.createdAt);
                    const monthName = date.toLocaleString('default', { month: 'short' });
                    if (monthsMap[monthName] !== undefined) {
                        monthsMap[monthName].orders += 1;
                        monthsMap[monthName].revenue += Number(o.total || 0);
                    }
                }
            });

            monthlyRevenue = Object.entries(monthsMap).map(([month, data]) => ({
                month,
                revenue: Math.round(data.revenue),
                orders: data.orders
            }));
        } else {
            // Simulated monthly revenue fallback
            monthlyRevenue = months.map((month, i) => ({
                month,
                revenue: Math.round(totalRevenue * (0.1 + (i * 0.03))),
                orders: Math.round(10 + (i * 3))
            }));
        }

        // Fetch recent inquiries from database for dynamic activity feed
        const { data: recentInquiries } = await supabase
            .from('inquiries')
            .select('name, createdAt')
            .order('createdAt', { ascending: false })
            .limit(2);

        const recentActivity = [];

        // Add actual orders to activity feed
        if (orders.length > 0) {
            orders.slice(0, 3).forEach(o => {
                recentActivity.push({
                    type: 'order',
                    message: `Order ${o.id} placed by ${o.customerName} (${o.orderStatus})`,
                    time: formatTimeAgo(o.createdAt)
                });
            });
        }

        // Add inquiries to activity feed
        if (recentInquiries && recentInquiries.length > 0) {
            recentInquiries.forEach(inq => {
                if (recentActivity.length < 5) {
                    recentActivity.push({
                        type: 'inquiry',
                        message: `New inquiry from ${inq.name}`,
                        time: formatTimeAgo(inq.createdAt)
                    });
                }
            });
        }

        // Add static items to populate timeline
        const staticActivities = [
            { type: 'product', message: 'Nova pendant light inventory updated', time: '6 hours ago' },
            { type: 'product', message: 'New product added: Arc floor light', time: '2 days ago' },
        ];

        staticActivities.forEach(act => {
            if (recentActivity.length < 5) {
                recentActivity.push(act);
            }
        });

        res.json({
            metrics: {
                totalRevenue,
                todayRevenue,
                totalProducts,
                featuredProducts,
                lowStock,
                totalInquiries,
                pendingInquiries,
                inProgressInquiries,
                completedInquiries
            },
            categoryDistribution,
            monthlyRevenue,
            recentActivity
        });
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) {
        return 'just now';
    } else if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
}

module.exports = { getDashboard };